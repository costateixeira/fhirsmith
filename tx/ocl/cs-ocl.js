const axios = require('axios');
const fs = require('fs/promises');
const fsSync = require('fs');
const crypto = require('crypto');
const path = require('path');
const { AbstractCodeSystemProvider } = require('../cs/cs-provider-api');
const { CodeSystemProvider, CodeSystemFactoryProvider, CodeSystemContentMode, FilterExecutionContext } = require('../cs/cs-api');
const { CodeSystem } = require('../library/codesystem');
const { SearchFilterText } = require('../library/designations');

const DEFAULT_BASE_URL = 'https://oclapi2.ips.hsl.org.br';
const PAGE_SIZE = 100;
const CONCEPT_PAGE_SIZE = 1000;
const COLD_CACHE_FRESHNESS_MS = 60 * 60 * 1000;
const OCL_CODESYSTEM_MARKER_EXTENSION = 'http://fhir.org/FHIRsmith/StructureDefinition/ocl-codesystem';
const OCL_SEARCH_PATCH_FLAG = Symbol.for('fhirsmith.ocl.search.codesystem.code.patch');

function hasOCLCodeSystemMarker(resource) {
  const extensions = Array.isArray(resource?.extension) ? resource.extension : [];
  return extensions.some(ext => ext && ext.url === OCL_CODESYSTEM_MARKER_EXTENSION);
}

function filterConceptTreeByCode(concepts, wantedCode) {
  if (!Array.isArray(concepts) || concepts.length === 0) {
    return [];
  }

  const matches = [];
  for (const concept of concepts) {
    if (!concept || typeof concept !== 'object') {
      continue;
    }

    const childMatches = filterConceptTreeByCode(concept.concept, wantedCode);
    const isSelfMatch = concept.code != null && String(concept.code) === wantedCode;
    if (!isSelfMatch && childMatches.length === 0) {
      continue;
    }

    const clone = { ...concept };
    if (childMatches.length > 0) {
      clone.concept = childMatches;
    } else {
      delete clone.concept;
    }
    matches.push(clone);
  }

  return matches;
}

function filterOCLCodeSystemResourceByCode(resource, code) {
  if (!resource || typeof resource !== 'object') {
    return resource;
  }

  const filteredConcepts = filterConceptTreeByCode(resource.concept, code);
  return {
    ...resource,
    concept: filteredConcepts
  };
}

function patchSearchWorkerForOCLCodeFiltering() {
  let SearchWorker;
  try {
    SearchWorker = require('../workers/search');
  } catch (_error) {
    return;
  }

  if (!SearchWorker || !SearchWorker.prototype) {
    return;
  }

  const proto = SearchWorker.prototype;
  if (proto[OCL_SEARCH_PATCH_FLAG] === true || typeof proto.searchCodeSystems !== 'function') {
    return;
  }

  const originalSearchCodeSystems = proto.searchCodeSystems;
  proto.searchCodeSystems = function patchedSearchCodeSystems(params) {
    const matches = originalSearchCodeSystems.call(this, params);
    const requestedCode = params?.code == null ? '' : String(params.code);

    if (!requestedCode) {
      return matches;
    }

    const filtered = [];
    for (const resource of matches) {
      if (!hasOCLCodeSystemMarker(resource)) {
        filtered.push(resource);
        continue;
      }

      const projected = filterOCLCodeSystemResourceByCode(resource, requestedCode);
      if (Array.isArray(projected?.concept) && projected.concept.length > 0) {
        filtered.push(projected);
      }
    }

    return filtered;
  };

  Object.defineProperty(proto, OCL_SEARCH_PATCH_FLAG, {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
  });
}

patchSearchWorkerForOCLCodeFiltering();

// Cold cache configuration
const CACHE_BASE_DIR = path.join(process.cwd(), 'data', 'terminology-cache', 'ocl');
const CACHE_CS_DIR = path.join(CACHE_BASE_DIR, 'codesystems');
const CACHE_VS_DIR = path.join(CACHE_BASE_DIR, 'valuesets');

// Cache file utilities
async function ensureCacheDirectories() {
  try {
    await fs.mkdir(CACHE_CS_DIR, { recursive: true });
    await fs.mkdir(CACHE_VS_DIR, { recursive: true });
  } catch (error) {
    console.error('[OCL] Failed to create cache directories:', error.message);
  }
}

// CodeSystem fingerprint computation
function computeCodeSystemFingerprint(concepts) {
  if (!Array.isArray(concepts) || concepts.length === 0) {
    return null;
  }

  // Normalize concepts to deterministic strings
  const normalized = concepts
    .map(concept => {
      if (!concept || !concept.code) {
        return null;
      }
      const code = String(concept.code || '');
      const display = String(concept.display || '');
      const definition = String(concept.definition || '');
      const retired = concept.retired === true ? '1' : '0';
      return `${code}|${display}|${definition}|${retired}`;
    })
    .filter(Boolean)
    .sort();

  // Compute SHA256 hash
  const hash = crypto.createHash('sha256');
  for (const item of normalized) {
    hash.update(item);
    hash.update('\n');
  }
  return hash.digest('hex');
}

function sanitizeFilename(text) {
  if (!text || typeof text !== 'string') {
    return 'unknown';
  }
  return text
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200);
}

function getCacheFilePath(baseDir, canonicalUrl, version = null) {
  const filename = sanitizeFilename(canonicalUrl) + (version ? `_${sanitizeFilename(version)}` : '') + '.json';
  return path.join(baseDir, filename);
}

function getColdCacheAgeMs(cacheFilePath) {
  try {
    const stats = fsSync.statSync(cacheFilePath);
    if (!stats || !Number.isFinite(stats.mtimeMs)) {
      return null;
    }
    return Math.max(0, Date.now() - stats.mtimeMs);
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.error(`[OCL] Failed to inspect cold cache file ${cacheFilePath}: ${error.message}`);
    }
    return null;
  }
}

function formatCacheAgeMinutes(ageMs) {
  const minutes = Math.max(1, Math.round(ageMs / 60000));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

class OCLConceptFilterContext {
  constructor() {
    this.concepts = [];
    this.currentIndex = -1;
  }

  add(concept, rating = 0) {
    this.concepts.push({ concept, rating });
  }

  sort() {
    this.concepts.sort((a, b) => b.rating - a.rating);
  }

  size() {
    return this.concepts.length;
  }

  hasMore() {
    return this.currentIndex + 1 < this.concepts.length;
  }

  next() {
    if (!this.hasMore()) {
      return null;
    }
    this.currentIndex += 1;
    return this.concepts[this.currentIndex].concept;
  }

  reset() {
    this.currentIndex = -1;
  }

  findConceptByCode(code) {
    for (const item of this.concepts) {
      if (item.concept && item.concept.code === code) {
        return item.concept;
      }
    }
    return null;
  }

  containsConcept(concept) {
    return this.concepts.some(item => item.concept === concept);
  }
}

class OCLBackgroundJobQueue {
  static MAX_CONCURRENT = 2;
  static HEARTBEAT_INTERVAL_MS = 30000;
  static UNKNOWN_JOB_SIZE = Number.MAX_SAFE_INTEGER;
  static pendingJobs = [];
  static activeCount = 0;
  static queuedOrRunningKeys = new Set();
  static activeJobs = new Map();
  static heartbeatTimer = null;
  static enqueueSequence = 0;

  static enqueue(jobKey, jobType, runJob, options = {}) {
    if (!jobKey || typeof runJob !== 'function') {
      return false;
    }

    if (this.queuedOrRunningKeys.has(jobKey)) {
      return false;
    }

    this.queuedOrRunningKeys.add(jobKey);
    const resolveAndEnqueue = async () => {
      const resolvedSize = await this.#resolveJobSize(options);
      const normalizedSize = this.#normalizeJobSize(resolvedSize);
      this.#insertPendingJobOrdered({
        jobKey,
        jobType: jobType || 'background-job',
        jobId: options?.jobId || jobKey,
        jobSize: normalizedSize,
        getProgress: typeof options?.getProgress === 'function' ? options.getProgress : null,
        runJob,
        enqueueOrder: this.enqueueSequence++
      });
      this.ensureHeartbeatRunning();
      console.log(`[OCL] ${jobType || 'Background job'} enqueued: ${jobKey} (size=${normalizedSize}, queue=${this.pendingJobs.length}, active=${this.activeCount})`);
      this.processNext();
    };

    Promise.resolve()
      .then(resolveAndEnqueue)
      .catch((error) => {
        this.queuedOrRunningKeys.delete(jobKey);
        const message = error && error.message ? error.message : String(error);
        console.error(`[OCL] Failed to enqueue background job: ${jobType || 'background-job'} ${jobKey}: ${message}`);
      });

    return true;
  }

  static async #resolveJobSize(options = {}) {
    if (typeof options?.resolveJobSize === 'function') {
      try {
        return await options.resolveJobSize();
      } catch (_error) {
        return this.UNKNOWN_JOB_SIZE;
      }
    }

    if (options && Object.prototype.hasOwnProperty.call(options, 'jobSize')) {
      return options.jobSize;
    }

    return this.UNKNOWN_JOB_SIZE;
  }

  static #normalizeJobSize(jobSize) {
    const parsed = Number.parseInt(jobSize, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return this.UNKNOWN_JOB_SIZE;
    }
    return parsed;
  }

  static #insertPendingJobOrdered(job) {
    let index = this.pendingJobs.findIndex(existing => {
      if (existing.jobSize === job.jobSize) {
        return existing.enqueueOrder > job.enqueueOrder;
      }
      return existing.jobSize > job.jobSize;
    });

    if (index < 0) {
      index = this.pendingJobs.length;
    }

    this.pendingJobs.splice(index, 0, job);
  }

  static isQueuedOrRunning(jobKey) {
    return this.queuedOrRunningKeys.has(jobKey);
  }

  static ensureHeartbeatRunning() {
    if (this.heartbeatTimer) {
      return;
    }

    this.heartbeatTimer = setInterval(() => {
      this.logHeartbeat();
    }, this.HEARTBEAT_INTERVAL_MS);

    // Do not keep the process alive only for telemetry logs.
    if (typeof this.heartbeatTimer.unref === 'function') {
      this.heartbeatTimer.unref();
    }
  }

  static logHeartbeat() {
    const activeJobs = Array.from(this.activeJobs.values());
    const lines = [
      '[OCL] OCL background status:',
      ` active jobs: ${activeJobs.length}`,
      ` queued jobs: ${this.pendingJobs.length}`
    ];

    activeJobs.forEach((job, index) => {
      lines.push('');
      lines.push(` job ${index + 1}:`);
      lines.push(`   type: ${job.jobType || 'background-job'}`);
      lines.push(`   id: ${job.jobId || job.jobKey}`);
      lines.push(`   size: ${job.jobSize}`);
      lines.push(`   progress: ${this.formatProgress(job.getProgress)}`);
    });

    console.log(lines.join('\n'));
  }

  static formatProgress(getProgress) {
    if (typeof getProgress !== 'function') {
      return 'unknown';
    }

    try {
      const progress = getProgress();
      if (typeof progress === 'number' && Number.isFinite(progress)) {
        const bounded = Math.max(0, Math.min(100, progress));
        return `${Math.round(bounded)}%`;
      }

      if (progress && typeof progress === 'object') {
        if (typeof progress.percentage === 'number' && Number.isFinite(progress.percentage)) {
          const bounded = Math.max(0, Math.min(100, progress.percentage));
          return `${Math.round(bounded)}%`;
        }

        if (
          typeof progress.processed === 'number' &&
          Number.isFinite(progress.processed) &&
          typeof progress.total === 'number' &&
          Number.isFinite(progress.total) &&
          progress.total > 0
        ) {
          const ratio = progress.processed / progress.total;
          const bounded = Math.max(0, Math.min(100, ratio * 100));
          return `${Math.round(bounded)}%`;
        }
      }
    } catch (error) {
      return 'unknown';
    }

    return 'unknown';
  }

  static processNext() {
    while (this.activeCount < this.MAX_CONCURRENT && this.pendingJobs.length > 0) {
      const job = this.pendingJobs.shift();
      this.activeCount += 1;
      this.activeJobs.set(job.jobKey, {
        jobKey: job.jobKey,
        jobType: job.jobType,
        jobId: job.jobId || job.jobKey,
        jobSize: job.jobSize,
        getProgress: job.getProgress || null,
        startedAt: Date.now()
      });
      console.log(`[OCL] Background job started: ${job.jobType} ${job.jobKey} (size=${job.jobSize}, queue=${this.pendingJobs.length}, active=${this.activeCount})`);

      Promise.resolve()
        .then(() => job.runJob())
        .then(() => {
          console.log(`[OCL] Background job completed: ${job.jobType} ${job.jobKey}`);
        })
        .catch((error) => {
          const message = error && error.message ? error.message : String(error);
          console.error(`[OCL] Background job failed: ${job.jobType} ${job.jobKey}: ${message}`);
        })
        .finally(() => {
          this.activeCount -= 1;
          this.queuedOrRunningKeys.delete(job.jobKey);
          this.activeJobs.delete(job.jobKey);
          console.log(`[OCL] Background queue status: queue=${this.pendingJobs.length}, active=${this.activeCount}`);
          this.processNext();
        });
    }
  }
}

class OCLCodeSystemProvider extends AbstractCodeSystemProvider {
  constructor(config = {}) {
    super();
    const options = typeof config === 'string' ? { baseUrl: config } : (config || {});

    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.org = options.org || null;

    const headers = {
      Accept: 'application/json',
      'User-Agent': 'FHIRSmith-OCL-Provider/1.0'
    };

    if (options.token) {
      headers.Authorization = options.token.startsWith('Token ') || options.token.startsWith('Bearer ')
        ? options.token
        : `Token ${options.token}`;
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: options.timeout || 30000,
      headers
    });

    this._codeSystemsByCanonical = new Map();
    this._idToCodeSystem = new Map();
    this.sourceMetaByUrl = new Map();
    this._sourceStateByCanonical = new Map();
    this._usedIds = new Set();
    this._refreshPromise = null;
    this._pendingChanges = null;
    this._initialized = false;
    this._initializePromise = null;
  }

  async initialize() {
    if (this._initialized) {
      return;
    }

    if (this._initializePromise) {
      await this._initializePromise;
      return;
    }

    this._initializePromise = (async () => {
      try {
        const sources = await this.#fetchSourcesForDiscovery();
        console.log(`[OCL] Fetched ${sources.length} sources`);

        const snapshot = this.#buildSourceSnapshot(sources);
        this.#applySnapshot(snapshot);

        console.log(`[OCL] Loaded ${this._codeSystemsByCanonical.size} code systems`);
        this._initialized = true;
      } catch (error) {
        console.error(`[OCL] Initialization failed:`, error.message);
        if (error.response) {
          console.error(`[OCL] HTTP ${error.response.status}: ${error.response.statusText}`);
        }
        throw error;
      }
    })();

    try {
      await this._initializePromise;
    } finally {
      this._initializePromise = null;
    }
  }

  assignIds(ids) {
    this._usedIds.clear();
    for (const cs of this._idToCodeSystem.values()) {
      if (!cs.id || ids.has(`CodeSystem/${cs.id}`)) {
        cs.id = String(ids.size);
        cs.jsonObj.id = cs.id;
      }
      ids.add(`CodeSystem/${cs.id}`);
      this._usedIds.add(cs.id);
      this._idToCodeSystem.set(cs.id, cs);
    }
  }

  // eslint-disable-next-line no-unused-vars
  async listCodeSystems(_fhirVersion, _context) {
    await this.initialize();
    return Array.from(this._codeSystemsByCanonical.values());
  }

  // eslint-disable-next-line no-unused-vars
  async loadCodeSystems(fhirVersion, context) {
    return await this.listCodeSystems(fhirVersion, context);
  }

  // Called once per minute by provider.updateCodeSystemList().
  // That caller is currently sync, so we stage async fetches and return the latest ready diff.
  // eslint-disable-next-line no-unused-vars
  getCodeSystemChanges(_fhirVersion, _context) {
    if (!this._initialized) {
      return this.#emptyChanges();
    }

    this.#scheduleRefresh();
    if (!this._pendingChanges) {
      return this.#emptyChanges();
    }

    const out = this._pendingChanges;
    this._pendingChanges = null;
    return out;
  }

  async close() {
  }

  getSourceMetas() {
    return Array.from(this.sourceMetaByUrl.values());
  }

  #scheduleRefresh() {
    if (this._refreshPromise) {
      return;
    }

    this._refreshPromise = (async () => {
      try {
        const sources = await this.#fetchSourcesForDiscovery();
        const nextSnapshot = this.#buildSourceSnapshot(sources);
        const changes = this.#diffSnapshots(this._sourceStateByCanonical, nextSnapshot);
        this.#applySnapshot(nextSnapshot);
        this._pendingChanges = changes;
      } catch (error) {
        console.error('[OCL] Incremental source refresh failed:', error.message);
        this._pendingChanges = this.#emptyChanges();
      } finally {
        this._refreshPromise = null;
      }
    })();
  }

  #emptyChanges() {
    return { added: [], changed: [], deleted: [] };
  }

  #buildSourceSnapshot(sources) {
    const snapshot = new Map();
    for (const source of sources || []) {
      const cs = this.#toCodeSystem(source);
      if (!cs) {
        continue;
      }

      const canonicalUrl = cs.url;
      const meta = this.#buildSourceMeta(source, cs);
      const checksum = this.#sourceChecksum(source);
      snapshot.set(canonicalUrl, { cs, meta, checksum });
    }
    return snapshot;
  }

  async #fetchSourcesForDiscovery() {
    const organizations = await this.#fetchOrganizationIds();
    if (organizations.length === 0) {
      // Fallback for OCL instances that expose global listing but not org listing.
      return await this.#fetchAllPages('/sources/');
    }

    const allSources = [];
    const seen = new Set();

    for (const orgId of organizations) {
      const endpoint = `/orgs/${encodeURIComponent(orgId)}/sources/`;
      const sources = await this.#fetchAllPages(endpoint);
      for (const source of sources) {
        if (!source || typeof source !== 'object') {
          continue;
        }
        const key = this.#sourceIdentity(source);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        allSources.push(source);
      }
    }

    return allSources;
  }

  async #fetchOrganizationIds() {
    const endpoint = '/orgs/';
    const orgs = await this.#fetchAllPages(endpoint);

    const ids = [];
    const seen = new Set();
    for (const org of orgs || []) {
      if (!org || typeof org !== 'object') {
        continue;
      }

      const id = org.id || org.mnemonic || org.short_code || org.shortCode || org.name || null;
      if (!id) {
        continue;
      }

      const normalized = String(id).trim();
      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      ids.push(normalized);
    }

    if (ids.length === 0 && this.org) {
      ids.push(this.org);
    }

    return ids;
  }

  #sourceIdentity(source) {
    if (!source || typeof source !== 'object') {
      return '__invalid__';
    }

    const owner = source.owner || '';
    const canonical = source.canonical_url || source.canonicalUrl || '';
    const shortCode = source.short_code || source.shortCode || source.id || source.mnemonic || source.name || '';
    return `${owner}|${canonical}|${shortCode}`;
  }

  #applySnapshot(snapshot) {
    const previousSnapshot = this._sourceStateByCanonical;
    this._codeSystemsByCanonical.clear();
    this._idToCodeSystem.clear();
    this.sourceMetaByUrl.clear();
    this._usedIds.clear();

    for (const [canonicalUrl, entry] of snapshot.entries()) {
      const cs = entry.cs;
      const meta = entry.meta;
      const previousEntry = previousSnapshot.get(canonicalUrl);

      // Preserve complete-content marker if checksum did not change.
      if (previousEntry && previousEntry.checksum === entry.checksum && previousEntry.cs?.jsonObj?.content === CodeSystemContentMode.Complete) {
        cs.jsonObj.content = CodeSystemContentMode.Complete;

        // Preserve materialized concepts across metadata refreshes.
        if (Array.isArray(previousEntry.cs?.jsonObj?.concept)) {
          cs.jsonObj.concept = previousEntry.cs.jsonObj.concept.map(concept => ({ ...concept }));
        }
      }

      // If a factory already has warm/cold concepts for this system, project them to the new snapshot resource.
      OCLSourceCodeSystemFactory.syncCodeSystemResource(canonicalUrl, cs.version || null, cs);

      this.#trackCodeSystemId(cs);
      this._codeSystemsByCanonical.set(canonicalUrl, cs);
      this._idToCodeSystem.set(cs.id, cs);
      this.sourceMetaByUrl.set(canonicalUrl, meta);
    }

    this._sourceStateByCanonical = snapshot;
  }

  #diffSnapshots(previousSnapshot, nextSnapshot) {
    const added = [];
    const changed = [];
    const deleted = [];

    for (const [canonicalUrl, nextEntry] of nextSnapshot.entries()) {
      const previousEntry = previousSnapshot.get(canonicalUrl);
      if (!previousEntry) {
        added.push(nextEntry.cs);
        continue;
      }

      // Keep stable ids across revisions so clients don't observe resource id churn.
      nextEntry.cs.id = previousEntry.cs.id;
      nextEntry.cs.jsonObj.id = previousEntry.cs.id;

      const previousChecksum = previousEntry.checksum || null;
      const nextChecksum = nextEntry.checksum || null;
      const checksumChanged = previousChecksum !== nextChecksum;
      const versionChanged = (previousEntry.cs.version || null) !== (nextEntry.cs.version || null);
      if (checksumChanged || versionChanged) {
        if (checksumChanged) {
          console.log(`[OCL] CodeSystem checksum changed: ${canonicalUrl} (${previousChecksum} -> ${nextChecksum})`);
        }
        changed.push(nextEntry.cs);
      }
    }

    for (const [canonicalUrl, previousEntry] of previousSnapshot.entries()) {
      if (!nextSnapshot.has(canonicalUrl)) {
        deleted.push(previousEntry.cs);
      }
    }

    return { added, changed, deleted };
  }

  #trackCodeSystemId(cs) {
    if (!cs) {
      return;
    }

    if (!cs.id || this._usedIds.has(cs.id)) {
      const raw = cs.id || cs.name || cs.url || 'ocl-cs';
      const base = this.spaceId ? `${this.spaceId}-${raw}` : String(raw);
      let candidate = base;
      let index = 1;
      while (this._usedIds.has(candidate)) {
        candidate = `${base}-${index}`;
        index += 1;
      }
      cs.id = candidate;
      cs.jsonObj.id = candidate;
    }

    this._usedIds.add(cs.id);
  }

  #toCodeSystem(source) {
    if (!source || typeof source !== 'object') {
      return null;
    }

    const canonicalUrl = source.canonical_url || source.canonicalUrl || source.url;
    if (!canonicalUrl) {
      return null;
    }

    const id = source.id || source.mnemonic;
    if (!id) {
      return null;
    }

    const lastUpdated = this.#toIsoDate(source.updated_at || source.updatedAt || source.updated_on || source.updatedOn);

    const json = {
      resourceType: 'CodeSystem',
      id,
      url: canonicalUrl,
      version: source.version || null,
      name: source.name || source.mnemonic || id,
      title: source.full_name || source.fullName || source.name || source.mnemonic || id,
      status: 'active',
      experimental: source.experimental === true,
      description: source.description || null,
      publisher: source.owner || null,
      caseSensitive: source.case_sensitive != null ? source.case_sensitive : (source.caseSensitive != null ? source.caseSensitive : true),
      language: source.default_locale || source.defaultLocale || null,
      filter: [
        {
          code: 'code',
          description: 'Match concept code',
          operator: ['=', 'in', 'regex'],
          value: 'code'
        },
        {
          code: 'display',
          description: 'Match concept display text',
          operator: ['=', 'in', 'regex'],
          value: 'string'
        },
        {
          code: 'definition',
          description: 'Match concept definition text',
          operator: ['=', 'in', 'regex'],
          value: 'string'
        },
        {
          code: 'inactive',
          description: 'Match inactive (retired) status',
          operator: ['=', 'in'],
          value: 'boolean'
        }
      ],
      property: [
        {
          code: 'code',
          uri: 'http://hl7.org/fhir/concept-properties#code',
          description: 'Concept code',
          type: 'code'
        },
        {
          code: 'display',
          description: 'Concept display text',
          type: 'string'
        },
        {
          code: 'definition',
          description: 'Concept definition text',
          type: 'string'
        },
        {
          code: 'inactive',
          uri: 'http://hl7.org/fhir/concept-properties#status',
          description: 'Whether concept is inactive (retired)',
          type: 'boolean'
        }
      ],
      extension: [
        {
          url: OCL_CODESYSTEM_MARKER_EXTENSION,
          valueBoolean: true
        }
      ],
      content: 'not-present'
    };

    if (lastUpdated) {
      json.meta = { lastUpdated };
    }

    return new CodeSystem(json, 'R5', true);
  }

  #buildSourceMeta(source, cs) {
    if (!source || !cs) {
      return null;
    }

    const owner = source.owner || null;
    const shortCode = source.short_code || source.shortCode || source.mnemonic || source.id || null;
    const canonicalUrl = cs.url;
    if (!canonicalUrl) {
      return;
    }

    const conceptsUrl = this.#normalizePath(source.concepts_url || source.conceptsUrl || this.#buildConceptsPath(source));
    const meta = {
      id: source.id || shortCode,
      shortCode,
      owner,
      name: source.name || shortCode || cs.id,
      description: source.description || null,
      canonicalUrl,
      version: source.version || null,
      conceptsUrl,
      checksum: this.#sourceChecksum(source),
      codeSystem: cs
    };

    return meta;
  }

  #sourceChecksum(source) {
    // NOTE: OCL checksums are NOT reliable for cache invalidation decisions.
    // They do not update when concepts are added or modified.
    // This checksum is logged for debugging purposes only.
    // Cache decisions are based on custom fingerprints computed from concept content.
    
    if (!source || typeof source !== 'object') {
      return null;
    }

    const checksums = source.checksums || {};
    const standard = checksums.standard || null;
    const smart = checksums.smart || null;
    if (standard) {
      return String(standard);
    }
    if (smart) {
      return String(smart);
    }

    if (source.checksum) {
      return String(source.checksum);
    }

    const updated = source.updated_at || source.updatedAt || source.updated_on || source.updatedOn || null;
    const version = source.version || null;
    if (updated || version) {
      return `${updated || ''}|${version || ''}`;
    }

    return null;
  }

  #buildConceptsPath(source) {
    if (!source || typeof source !== 'object') {
      return null;
    }
    const owner = source.owner || null;
    const sourceId = source.short_code || source.shortCode || source.id || source.mnemonic || null;
    if (!owner || !sourceId) {
      const sourceUrl = source.url;
      if (!sourceUrl || typeof sourceUrl !== 'string') {
        return null;
      }
      const trimmed = sourceUrl.endsWith('/') ? sourceUrl : `${sourceUrl}/`;
      return `${trimmed}concepts/`;
    }
    return `/orgs/${encodeURIComponent(owner)}/sources/${encodeURIComponent(sourceId)}/concepts/`;
  }

  #normalizePath(pathValue) {
    if (!pathValue) {
      return null;
    }
    if (typeof pathValue !== 'string') {
      return null;
    }
    if (pathValue.startsWith('http://') || pathValue.startsWith('https://')) {
      return pathValue;
    }
    return `${this.baseUrl}${pathValue.startsWith('/') ? '' : '/'}${pathValue}`;
  }

  async #fetchAllPages(path) {
    const results = [];
    let page = 1;
    let nextPath = path;
    let usePageMode = true;

    while (nextPath) {
      try {
        const response = usePageMode
          ? await this.httpClient.get(path, { params: { page, limit: PAGE_SIZE } })
          : await this.httpClient.get(nextPath);

        if (Array.isArray(response.data)) {
          results.push(...response.data);
          if (response.data.length < PAGE_SIZE) {
            break;
          }
          page += 1;
          nextPath = path;
          continue;
        }

        const { items, next } = this.#extractItemsAndNext(response.data);
        results.push(...items);

        if (next) {
          usePageMode = false;
          nextPath = next;
          continue;
        }

        if (usePageMode && items.length >= PAGE_SIZE) {
          page += 1;
          nextPath = path;
        } else {
          break;
        }
      } catch (error) {
        console.error(`[OCL] Fetch error on page ${page}:`, error.message);
        if (error.response) {
          console.error(`[OCL] HTTP ${error.response.status}: ${error.response.statusText}`);
          console.error(`[OCL] Response:`, error.response.data);
        }
        throw error;
      }
    }

    return results;
  }

  #extractItemsAndNext(payload) {
    if (Array.isArray(payload)) {
      return { items: payload, next: null };
    }

    if (!payload || typeof payload !== 'object') {
      return { items: [], next: null };
    }

    const items = Array.isArray(payload.results)
      ? payload.results
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.data)
          ? payload.data
          : [];

    const next = payload.next || null;
    if (!next) {
      return { items, next: null };
    }

    if (next.startsWith(this.baseUrl)) {
      return { items, next: next.replace(this.baseUrl, '') };
    }

    return { items, next };
  }

  #toIsoDate(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }
}

class OCLSourceCodeSystemProvider extends CodeSystemProvider {
  constructor(opContext, supplements, client, meta, sharedCaches = null) {
    super(opContext, supplements);
    this.httpClient = client;
    this.meta = meta;
    this.conceptCache = sharedCaches?.conceptCache || new Map();
    this.pageCache = sharedCaches?.pageCache || new Map();
    this.pendingConceptRequests = sharedCaches?.pendingConceptRequests || new Map();
    this.pendingPageRequests = sharedCaches?.pendingPageRequests || new Map();
    this.scheduleBackgroundLoad = typeof sharedCaches?.scheduleBackgroundLoad === 'function'
      ? sharedCaches.scheduleBackgroundLoad
      : null;
    this.isSystemComplete = typeof sharedCaches?.isSystemComplete === 'function'
      ? sharedCaches.isSystemComplete
      : (() => false);
    this.getTotalConceptCount = typeof sharedCaches?.getTotalConceptCount === 'function'
      ? sharedCaches.getTotalConceptCount
      : (() => -1);
  }

  system() {
    return this.meta.canonicalUrl;
  }

  version() {
    return this.meta.version || null;
  }

  description() {
    return this.meta.description || null;
  }

  name() {
    return this.meta.name || this.meta.shortCode || this.meta.id || this.system();
  }

  contentMode() {
    return this.isSystemComplete() ? CodeSystemContentMode.Complete : CodeSystemContentMode.NotPresent;
  }

  totalCount() {
    return this.getTotalConceptCount();
  }

  propertyDefinitions() {
    return this.meta?.codeSystem?.jsonObj?.property || null;
  }

  async code(code) {
    const ctxt = await this.#ensureContext(code);
    return ctxt ? ctxt.code : null;
  }

  async display(code) {
    const ctxt = await this.#ensureContext(code);
    if (!ctxt) {
      return null;
    }
    if (ctxt.display && this.opContext.langs.isEnglishOrNothing()) {
      return ctxt.display;
    }
    const supp = this._displayFromSupplements(ctxt.code);
    return supp || ctxt.display || null;
  }

  async definition(code) {
    const ctxt = await this.#ensureContext(code);
    return ctxt ? ctxt.definition : null;
  }

  async isAbstract(code) {
    await this.#ensureContext(code);
    return false;
  }

  async isInactive(code) {
    const ctxt = await this.#ensureContext(code);
    return ctxt ? ctxt.retired === true : false;
  }

  async isDeprecated(code) {
    await this.#ensureContext(code);
    return false;
  }

  async getStatus(code) {
    const ctxt = await this.#ensureContext(code);
    if (!ctxt) {
      return null;
    }
    return ctxt.retired === true ? 'inactive' : 'active';
  }

  async designations(code, displays) {
    const ctxt = await this.#ensureContext(code);
    if (ctxt && ctxt.display) {
      const hasConceptDesignations = Array.isArray(ctxt.designations) && ctxt.designations.length > 0;
      if (hasConceptDesignations) {
        for (const d of ctxt.designations) {
          if (!d || !d.value) {
            continue;
          }
          displays.addDesignation(true, 'active', d.language || '', CodeSystem.makeUseForDisplay(), d.value);
        }
      } else {
        displays.addDesignation(true, 'active', 'en', CodeSystem.makeUseForDisplay(), ctxt.display);
      }
      this._listSupplementDesignations(ctxt.code, displays);
    }
  }

  async locate(code) {
    if (!code || typeof code !== 'string') {
      return { context: null, message: 'Empty code' };
    }

    if (this.conceptCache.has(code)) {
      return { context: this.conceptCache.get(code), message: null };
    }

    if (this.scheduleBackgroundLoad) {
      this.scheduleBackgroundLoad('lookup-miss');
    }

    const concept = await this.#fetchConcept(code);
    if (!concept) {
      return { context: null, message: undefined };
    }

    this.conceptCache.set(code, concept);
    return { context: concept, message: null };
  }

  async iterator(code) {
    await this.#ensureContext(code);
    if (code) {
      return null;
    }
    return {
      page: 1,
      index: 0,
      items: [],
      total: -1,
      done: false
    };
  }

  async iteratorAll() {
    return this.iterator(null);
  }

  async getPrepContext(iterate) {
    return new FilterExecutionContext(iterate);
  }

  async doesFilter(prop, op, value) {
    if (!prop || !op || value == null) {
      return false;
    }

    const normalizedProp = String(prop).trim().toLowerCase();
    const normalizedOp = String(op).trim().toLowerCase();
    const supportedOps = ['=', 'in', 'regex'];
    if (!supportedOps.includes(normalizedOp)) {
      return false;
    }

    if (['concept', 'code', 'display', 'definition', 'inactive'].includes(normalizedProp)) {
      return true;
    }

    const defs = this.propertyDefinitions() || [];
    return defs.some(def => def && def.code === normalizedProp);
  }

  async searchFilter(filterContext, filter, sort) {
    const matcher = this.#toSearchFilterText(filter);
    const results = new OCLConceptFilterContext();
    const concepts = await this.#allConceptContexts();

    for (const concept of concepts) {
      const text = this.#conceptSearchText(concept);
      const match = matcher.passes(text, true);
      if (!match || match.passes !== true) {
        continue;
      }

      results.add(concept, this.#searchRating(concept, matcher, match.rating));
    }

    if (sort === true) {
      results.sort();
    }

    if (!Array.isArray(filterContext.filters)) {
      filterContext.filters = [];
    }
    filterContext.filters.push(results);
    return filterContext;
  }

  async filter(filterContext, prop, op, value) {
    const normalizedProp = String(prop || '').trim().toLowerCase();
    const normalizedOp = String(op || '').trim().toLowerCase();

    if (!await this.doesFilter(normalizedProp, normalizedOp, value)) {
      throw new Error(`Filter ${prop} ${op} is not supported by OCL provider`);
    }

    const set = new OCLConceptFilterContext();
    const concepts = await this.#allConceptContexts();
    const matcher = this.#buildPropertyMatcher(normalizedProp, normalizedOp, value);

    for (const concept of concepts) {
      if (matcher(concept)) {
        set.add(concept, 0);
      }
    }

    if (!Array.isArray(filterContext.filters)) {
      filterContext.filters = [];
    }
    filterContext.filters.push(set);
    return set;
  }

  async executeFilters(filterContext) {
    return Array.isArray(filterContext?.filters) ? filterContext.filters : [];
  }

  // eslint-disable-next-line no-unused-vars
  async filterSize(filterContext, set) {
    return set ? set.size() : 0;
  }

  // eslint-disable-next-line no-unused-vars
  async filterMore(filterContext, set) {
    return !!set && set.hasMore();
  }

  // eslint-disable-next-line no-unused-vars
  async filterConcept(filterContext, set) {
    if (!set) {
      return null;
    }
    return set.next();
  }

  // eslint-disable-next-line no-unused-vars
  async filterLocate(filterContext, set, code) {
    if (!set) {
      return `Code '${code}' not found: no filter results`;
    }
    const concept = set.findConceptByCode(code);
    if (concept) {
      return concept;
    }
    return null;
  }

  // eslint-disable-next-line no-unused-vars
  async filterCheck(filterContext, set, concept) {
    if (!set || !concept) {
      return false;
    }
    return set.containsConcept(concept);
  }

  async filterFinish(filterContext) {
    if (!Array.isArray(filterContext?.filters)) {
      return;
    }
    for (const set of filterContext.filters) {
      if (set && typeof set.reset === 'function') {
        set.reset();
      }
    }
    filterContext.filters.length = 0;
  }

  async nextContext(iteratorContext) {
    if (!iteratorContext || iteratorContext.done) {
      return null;
    }

    if (iteratorContext.index >= iteratorContext.items.length) {
      const pageItems = await this.#fetchConceptPage(iteratorContext.page);
      iteratorContext.page += 1;
      iteratorContext.index = 0;
      iteratorContext.items = pageItems;

      if (!pageItems || pageItems.length === 0) {
        iteratorContext.done = true;
        return null;
      }
    }

    const concept = iteratorContext.items[iteratorContext.index];
    iteratorContext.index += 1;
    return concept;
  }

  async #ensureContext(code) {
    if (!code) {
      return null;
    }

    // Some call paths pass a pending locate() Promise (or its wrapper result)
    // instead of a raw code/context; normalize both shapes here.
    if (code && typeof code === 'object' && typeof code.then === 'function') {
      code = await code;
    }

    if (code && typeof code === 'object' && Object.prototype.hasOwnProperty.call(code, 'context')) {
      if (!code.context) {
        throw new Error(code.message || 'Unknown code');
      }
      code = code.context;
    }

    if (typeof code === 'string') {
      const result = await this.locate(code);
      if (!result.context) {
        throw new Error(result.message || `Unknown code ${code}`);
      }
      return result.context;
    }
    if (code && typeof code === 'object' && code.code) {
      return code;
    }
    throw new Error(`Unknown Type at #ensureContext: ${typeof code}`);
  }

  async #fetchConceptPage(page) {
    if (!this.meta.conceptsUrl) {
      return [];
    }
    const cacheKey = `${this.meta.conceptsUrl}|p=${page}|l=${CONCEPT_PAGE_SIZE}`;
    if (this.pageCache.has(cacheKey)) {
      const cached = this.pageCache.get(cacheKey);
      return Array.isArray(cached)
        ? cached
        : Array.isArray(cached?.concepts)
          ? cached.concepts
          : [];
    }
    if (this.pendingPageRequests.has(cacheKey)) {
      const pendingResult = await this.pendingPageRequests.get(cacheKey);
      return Array.isArray(pendingResult)
        ? pendingResult
        : Array.isArray(pendingResult?.concepts)
          ? pendingResult.concepts
          : [];
    }

    if (this.scheduleBackgroundLoad) {
      this.scheduleBackgroundLoad('page-miss');
    }

    const pending = (async () => {
      let response;
      try {
        response = await this.httpClient.get(this.meta.conceptsUrl, { params: { page, limit: CONCEPT_PAGE_SIZE } });
      } catch (error) {
        // Some OCL instances return 404 for sources without concept listing endpoints.
        // Treat this as an empty page so terminology operations degrade gracefully.
        if (error && error.response && error.response.status === 404) {
          this.pageCache.set(cacheKey, []);
          return [];
        }
        throw error;
      }
      const payload = response.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

      const mapped = items.map(item => this.#toConceptContext(item)).filter(Boolean);
      this.pageCache.set(cacheKey, mapped);
      for (const concept of mapped) {
        if (concept && concept.code) {
          this.conceptCache.set(concept.code, concept);
        }
      }
      return mapped;
    })();

    this.pendingPageRequests.set(cacheKey, pending);
    try {
      return await pending;
    } finally {
      this.pendingPageRequests.delete(cacheKey);
    }
  }

  async #fetchConcept(code) {
    if (!this.meta.conceptsUrl) {
      return null;
    }
    if (this.conceptCache.has(code)) {
      return this.conceptCache.get(code);
    }
    const pendingKey = `${this.meta.conceptsUrl}|c=${code}`;
    if (this.pendingConceptRequests.has(pendingKey)) {
      return this.pendingConceptRequests.get(pendingKey);
    }

    if (this.scheduleBackgroundLoad) {
      this.scheduleBackgroundLoad('concept-miss');
    }

    const url = this.#buildConceptUrl(code);
    const pending = (async () => {
      let response;
      try {
        response = await this.httpClient.get(url);
      } catch (error) {
        // Missing concept should be treated as not-found, not as an internal server failure.
        if (error && error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      }
      const concept = this.#toConceptContext(response.data);
      if (concept && concept.code) {
        this.conceptCache.set(concept.code, concept);
      }
      return concept;
    })();

    this.pendingConceptRequests.set(pendingKey, pending);
    try {
      return await pending;
    } finally {
      this.pendingConceptRequests.delete(pendingKey);
    }
  }

  async #allConceptContexts() {
    const concepts = new Map();

    for (const concept of this.conceptCache.values()) {
      if (concept && concept.code) {
        concepts.set(concept.code, concept);
      }
    }

    // Ensure search can operate even when content is not fully warm-loaded.
    const iter = await this.iterator(null);
    let concept = await this.nextContext(iter);
    while (concept) {
      if (concept.code && !concepts.has(concept.code)) {
        concepts.set(concept.code, concept);
      }
      concept = await this.nextContext(iter);
    }

    return Array.from(concepts.values());
  }

  #toSearchFilterText(filter) {
    if (filter instanceof SearchFilterText) {
      return filter;
    }
    if (typeof filter === 'string') {
      return new SearchFilterText(filter);
    }
    if (filter && typeof filter.filter === 'string') {
      return new SearchFilterText(filter.filter);
    }
    return new SearchFilterText('');
  }

  #conceptSearchText(concept) {
    if (!concept || typeof concept !== 'object') {
      return '';
    }

    const values = [concept.code, concept.display, concept.definition];
    if (Array.isArray(concept.designations)) {
      for (const designation of concept.designations) {
        if (designation && designation.value) {
          values.push(designation.value);
        }
      }
    }

    return values.filter(Boolean).join(' ');
  }

  #searchRating(concept, matcher, baseRating) {
    let rating = Number.isFinite(baseRating) ? baseRating : 0;
    const term = matcher?.filter || '';
    if (!term) {
      return rating;
    }

    const code = String(concept?.code || '').toLowerCase();
    const display = String(concept?.display || '').toLowerCase();
    const definition = String(concept?.definition || '').toLowerCase();

    if (code === term || display === term) {
      rating += 100;
    } else if (code.startsWith(term) || display.startsWith(term)) {
      rating += 50;
    } else if (definition.includes(term)) {
      rating += 10;
    }

    return rating;
  }

  #buildPropertyMatcher(prop, op, value) {
    if (op === 'regex') {
      const regex = new RegExp(String(value), 'i');
      return concept => {
        const candidate = this.#valueForFilter(concept, prop);
        if (candidate == null) {
          return false;
        }
        return regex.test(String(candidate));
      };
    }

    if (op === 'in') {
      const tokens = String(value)
        .split(',')
        .map(token => token.trim().toLowerCase())
        .filter(Boolean);
      return concept => {
        const candidate = this.#valueForFilter(concept, prop);
        if (candidate == null) {
          return false;
        }
        return tokens.includes(String(candidate).toLowerCase());
      };
    }

    if (prop === 'inactive') {
      const expected = this.#toBoolean(value);
      return concept => {
        const candidate = this.#toBoolean(this.#valueForFilter(concept, prop));
        return candidate === expected;
      };
    }

    const expected = String(value).toLowerCase();
    return concept => {
      const candidate = this.#valueForFilter(concept, prop);
      if (candidate == null) {
        return false;
      }
      return String(candidate).toLowerCase() === expected;
    };
  }

  #valueForFilter(concept, prop) {
    if (!concept || typeof concept !== 'object') {
      return null;
    }

    switch (prop) {
      case 'concept':
      case 'code':
        return concept.code || null;
      case 'display':
        return concept.display || null;
      case 'definition':
        return concept.definition || null;
      case 'inactive':
        return concept.retired === true;
      default:
        return concept[prop] ?? null;
    }
  }

  #toBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }

    const text = String(value || '').trim().toLowerCase();
    return text === 'true' || text === '1' || text === 'yes';
  }

  #buildConceptUrl(code) {
    const base = this.meta.conceptsUrl.endsWith('/') ? this.meta.conceptsUrl : `${this.meta.conceptsUrl}/`;
    return `${base}${encodeURIComponent(code)}/`;
  }

  #toConceptContext(concept) {
    if (!concept || typeof concept !== 'object') {
      return null;
    }

    const code = concept.code || concept.id || null;
    if (!code) {
      return null;
    }

    return {
      code,
      display: concept.display_name || concept.display || concept.name || null,
      definition: concept.description || concept.definition || null,
      retired: concept.retired === true,
      designations: this.#extractDesignations(concept)
    };
  }

  #extractDesignations(concept) {
    const result = [];
    const seen = new Set();

    const add = (language, value) => {
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text) {
        return;
      }
      const lang = typeof language === 'string' ? language.trim() : '';
      const key = `${lang}|${text}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      result.push({ language: lang, value: text });
    };

    if (Array.isArray(concept.names)) {
      for (const entry of concept.names) {
        if (!entry || typeof entry !== 'object') {
          continue;
        }
        add(entry.locale || entry.language || entry.lang || '', entry.name || entry.display_name || entry.display || entry.value || entry.term);
      }
    }

    if (concept.display_name || concept.display || concept.name) {
      add(concept.locale || concept.default_locale || concept.language || '', concept.display_name || concept.display || concept.name);
    }

    if (concept.locale_display_names && typeof concept.locale_display_names === 'object') {
      for (const [lang, value] of Object.entries(concept.locale_display_names)) {
        add(lang, value);
      }
    }

    return result;
  }
}

class OCLSourceCodeSystemFactory extends CodeSystemFactoryProvider {
  static factoriesByKey = new Map();

  static syncCodeSystemResource(system, version = null, codeSystem = null) {
    if (!system) {
      return;
    }

    const key = `${system}|${version || ''}`;
    const factory = OCLSourceCodeSystemFactory.factoriesByKey.get(key);
    if (!factory) {
      return;
    }

    factory.#applyConceptsToCodeSystemResource(codeSystem || factory.meta?.codeSystem || null);
  }

  constructor(i18n, client, meta) {
    super(i18n);
    this.httpClient = client;
    this.meta = meta;
    this.sharedConceptCache = new Map();
    this.sharedPageCache = new Map();
    this.sharedPendingConceptRequests = new Map();
    this.sharedPendingPageRequests = new Map();
    this.isComplete = meta?.codeSystem?.jsonObj?.content === CodeSystemContentMode.Complete;
    this.loadedConceptCount = -1;
    this.loadedChecksum = meta?.checksum || null;
    this.customFingerprint = null;
    this.backgroundLoadProgress = { processed: 0, total: null };
    this.materializedConceptList = null;
    this.materializedConceptCount = -1;
    OCLSourceCodeSystemFactory.factoriesByKey.set(this.#resourceKey(), this);
    
    // Load cold cache at construction
    this.#loadColdCache();
  }

  async #loadColdCache() {
    const canonicalUrl = this.system();
    const version = this.version();
    const cacheFilePath = getCacheFilePath(CACHE_CS_DIR, canonicalUrl, version);

    try {
      const data = await fs.readFile(cacheFilePath, 'utf-8');
      const cached = JSON.parse(data);

      if (!cached || !cached.concepts || !Array.isArray(cached.concepts)) {
        return;
      }

      // Restore concepts to cache
      for (const concept of cached.concepts) {
        if (concept && concept.code) {
          this.sharedConceptCache.set(concept.code, concept);
        }
      }

      this.loadedConceptCount = cached.concepts.length;
      this.customFingerprint = cached.fingerprint || null;
      this.isComplete = true;

      if (this.meta?.codeSystem?.jsonObj) {
        this.meta.codeSystem.jsonObj.content = CodeSystemContentMode.Complete;
      }

      this.#applyConceptsToCodeSystemResource(this.meta?.codeSystem || null);

      console.log(`[OCL] Loaded CodeSystem from cold cache: ${canonicalUrl} (${cached.concepts.length} concepts, fingerprint=${this.customFingerprint?.substring(0, 8)})`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`[OCL] Failed to load cold cache for CodeSystem ${canonicalUrl}:`, error.message);
      }
    }
  }

  async #saveColdCache(concepts) {
    const canonicalUrl = this.system();
    const version = this.version();
    const cacheFilePath = getCacheFilePath(CACHE_CS_DIR, canonicalUrl, version);

    try {
      await ensureCacheDirectories();

      const fingerprint = computeCodeSystemFingerprint(concepts);
      const cacheData = {
        canonicalUrl,
        version,
        fingerprint,
        timestamp: new Date().toISOString(),
        conceptCount: concepts.length,
        concepts
      };

      await fs.writeFile(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
      console.log(`[OCL] Saved CodeSystem to cold cache: ${canonicalUrl} (${concepts.length} concepts, fingerprint=${fingerprint?.substring(0, 8)})`);
      
      return fingerprint;
    } catch (error) {
      console.error(`[OCL] Failed to save cold cache for CodeSystem ${canonicalUrl}:`, error.message);
      return null;
    }
  }

  static scheduleBackgroundLoadByKey(system, version = null, reason = 'valueset-expansion') {
    const key = `${system}|${version || ''}`;
    const factory = OCLSourceCodeSystemFactory.factoriesByKey.get(key);
    if (!factory) {
      console.log(`[OCL] CodeSystem load not scheduled (factory unavailable): ${key}`);
      return false;
    }
    factory.scheduleBackgroundLoad(reason);
    return true;
  }

  static checksumForResource(system, version = null) {
    const key = `${system}|${version || ''}`;
    const factory = OCLSourceCodeSystemFactory.factoriesByKey.get(key);
    if (!factory) {
      return null;
    }
    return factory.currentChecksum();
  }

  static loadProgress() {
    let total = 0;
    let loaded = 0;

    for (const factory of OCLSourceCodeSystemFactory.factoriesByKey.values()) {
      total += 1;
      if (factory && factory.isCompleteNow()) {
        loaded += 1;
      }
    }

    const percentage = total > 0 ? (loaded / total) * 100 : 0;
    return { loaded, total, percentage };
  }

  defaultVersion() {
    return this.meta.version || null;
  }

  build(opContext, supplements) {
    this.#syncWarmStateWithChecksum();
    this.#applyConceptsToCodeSystemResource(this.meta?.codeSystem || null);
    this.recordUse();
    return new OCLSourceCodeSystemProvider(opContext, supplements, this.httpClient, this.meta, {
      conceptCache: this.sharedConceptCache,
      pageCache: this.sharedPageCache,
      pendingConceptRequests: this.sharedPendingConceptRequests,
      pendingPageRequests: this.sharedPendingPageRequests,
      scheduleBackgroundLoad: reason => this.scheduleBackgroundLoad(reason),
      isSystemComplete: () => this.isComplete,
      getTotalConceptCount: () => this.loadedConceptCount
    });
  }

  scheduleBackgroundLoad(reason = 'request') {
    this.#syncWarmStateWithChecksum();
    if (this.isComplete) {
      return;
    }

    const cacheFilePath = getCacheFilePath(CACHE_CS_DIR, this.system(), this.version());
    const cacheAgeMs = getColdCacheAgeMs(cacheFilePath);
    if (cacheAgeMs != null && cacheAgeMs < COLD_CACHE_FRESHNESS_MS) {
      console.log(`[OCL] Skipping warm-up for CodeSystem ${this.system()} (cold cache age: ${formatCacheAgeMinutes(cacheAgeMs)})`);
      return;
    }

    const key = this.#resourceKey();
    const jobKey = `cs:${key}`;

    if (OCLBackgroundJobQueue.isQueuedOrRunning(jobKey)) {
      console.log(`[OCL] CodeSystem load already queued or running: ${key}`);
      return;
    }

    let queuedJobSize = null;
    console.log(`[OCL] CodeSystem load enqueued: ${key} (${reason})`);
    OCLBackgroundJobQueue.enqueue(
      jobKey,
      'CodeSystem load',
      async () => {
        await this.#runBackgroundLoad(key, queuedJobSize);
      },
      {
        jobId: this.system(),
        getProgress: () => this.#backgroundLoadProgressSnapshot(),
        resolveJobSize: async () => {
          queuedJobSize = await this.#fetchConceptCountFromHeaders();
          return queuedJobSize;
        }
      }
    );
  }

  async #runBackgroundLoad(key, knownConceptCount = null) {
    console.log(`[OCL] CodeSystem load started: ${key}`);
    try {
      this.backgroundLoadProgress = { processed: 0, total: null };
      const resolvedTotal = Number.isFinite(knownConceptCount) && knownConceptCount >= 0
        ? knownConceptCount
        : await this.#fetchConceptCountFromHeaders();
      this.backgroundLoadProgress.total = resolvedTotal;
      const count = await this.#loadAllConceptPages();
      this.loadedConceptCount = count;
      this.isComplete = true;
      this.loadedChecksum = this.meta?.checksum || null;
      this.backgroundLoadProgress = {
        processed: count,
        total: count > 0 ? count : this.backgroundLoadProgress.total
      };

      if (this.meta?.codeSystem?.jsonObj) {
        this.meta.codeSystem.jsonObj.content = CodeSystemContentMode.Complete;
      }

      this.#applyConceptsToCodeSystemResource(this.meta?.codeSystem || null);

      // Compute custom fingerprint and compare with cold cache
      const allConcepts = Array.from(this.sharedConceptCache.values());
      const newFingerprint = computeCodeSystemFingerprint(allConcepts);
      
      if (this.customFingerprint && newFingerprint === this.customFingerprint) {
        console.log(`[OCL] CodeSystem fingerprint unchanged: ${key} (fingerprint=${newFingerprint?.substring(0, 8)})`);
      } else {
        if (this.customFingerprint) {
          console.log(`[OCL] CodeSystem fingerprint changed: ${key} (${this.customFingerprint?.substring(0, 8)} -> ${newFingerprint?.substring(0, 8)})`);
          console.log(`[OCL] Replacing cold cache with new hot cache: ${key}`);
        } else {
          console.log(`[OCL] Computed fingerprint for CodeSystem: ${key} (fingerprint=${newFingerprint?.substring(0, 8)})`);
        }
        
        // Save to cold cache
        const savedFingerprint = await this.#saveColdCache(allConcepts);
        if (savedFingerprint) {
          this.customFingerprint = savedFingerprint;
        }
      }

      console.log(`[OCL] CodeSystem load completed, marked content=complete: ${key}`);
      const progress = OCLSourceCodeSystemFactory.loadProgress();
      console.log(`[OCL] CodeSystem load completed: ${this.system()}. Loaded ${progress.loaded}/${progress.total} CodeSystems (${progress.percentage.toFixed(2)}%)`);
      console.log(`[OCL] CodeSystem now available in cache: ${key} (${count} concepts)`);
    } catch (error) {
      console.error(`[OCL] CodeSystem background load failed: ${key}: ${error.message}`);
    }
  }

  async #loadAllConceptPages() {
    if (!this.meta?.conceptsUrl) {
      this.loadedConceptCount = 0;
      this.backgroundLoadProgress = { processed: 0, total: 0 };
      return 0;
    }

    let page = 1;
    let total = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const pageData = await this.#fetchAndCacheConceptPage(page);
      const concepts = Array.isArray(pageData?.concepts) ? pageData.concepts : [];
      if (concepts.length === 0) {
        break;
      }
      total += concepts.length;
      this.backgroundLoadProgress.processed = total;
      if (concepts.length < CONCEPT_PAGE_SIZE) {
        break;
      }
      page += 1;
    }

    return total;
  }

  async #fetchAndCacheConceptPage(page) {
    const cacheKey = `${this.meta.conceptsUrl}|p=${page}|l=${CONCEPT_PAGE_SIZE}`;
    if (this.sharedPageCache.has(cacheKey)) {
      const cached = this.sharedPageCache.get(cacheKey);
      const concepts = Array.isArray(cached)
        ? cached
        : Array.isArray(cached?.concepts)
          ? cached.concepts
          : [];
      const reportedTotal = this.#extractTotalFromPayload(cached?.payload || null);
      return { concepts, reportedTotal };
    }

    if (this.sharedPendingPageRequests.has(cacheKey)) {
      return await this.sharedPendingPageRequests.get(cacheKey);
    }

    const pending = (async () => {
      let response;
      try {
        response = await this.httpClient.get(this.meta.conceptsUrl, { params: { page, limit: CONCEPT_PAGE_SIZE } });
      } catch (error) {
        if (error && error.response && error.response.status === 404) {
          this.sharedPageCache.set(cacheKey, []);
          return [];
        }
        throw error;
      }

      const payload = response.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

      const mapped = items
        .map(item => this.#toConceptContext(item))
        .filter(Boolean);

      this.sharedPageCache.set(cacheKey, { concepts: mapped, payload });
      for (const concept of mapped) {
        if (concept && concept.code) {
          this.sharedConceptCache.set(concept.code, concept);
        }
      }
      return {
        concepts: mapped,
        reportedTotal: this.#extractTotalFromPayload(payload)
      };
    })();

    this.sharedPendingPageRequests.set(cacheKey, pending);
    try {
      return await pending;
    } finally {
      this.sharedPendingPageRequests.delete(cacheKey);
    }
  }

  #syncWarmStateWithChecksum() {
    const checksum = this.meta?.checksum || null;
    if (this.loadedChecksum == null) {
      this.loadedChecksum = checksum;
      return;
    }

    if (checksum !== this.loadedChecksum) {
      this.isComplete = false;
      this.loadedConceptCount = -1;
      this.backgroundLoadProgress = { processed: 0, total: null };
      this.sharedConceptCache.clear();
      this.sharedPageCache.clear();
      this.loadedChecksum = checksum;
      this.materializedConceptList = null;
      this.materializedConceptCount = -1;
      if (this.meta?.codeSystem?.jsonObj) {
        this.meta.codeSystem.jsonObj.content = CodeSystemContentMode.NotPresent;
        delete this.meta.codeSystem.jsonObj.concept;
      }
      console.log(`[OCL] CodeSystem checksum changed, invalidated warm cache: ${this.#resourceKey()}`);
    }
  }

  #applyConceptsToCodeSystemResource(codeSystem) {
    if (!codeSystem || typeof codeSystem !== 'object' || !codeSystem.jsonObj) {
      return;
    }

    if (this.isComplete !== true) {
      delete codeSystem.jsonObj.concept;
      return;
    }

    const concepts = Array.from(this.sharedConceptCache.values())
      .filter(concept => concept && concept.code);

    if (!Array.isArray(this.materializedConceptList) || this.materializedConceptCount !== concepts.length) {
      this.materializedConceptList = concepts
        .sort((a, b) => String(a.code).localeCompare(String(b.code)))
        .map(concept => {
          const fhirConcept = { code: concept.code };

          if (concept.display) {
            fhirConcept.display = concept.display;
          }

          if (concept.definition) {
            fhirConcept.definition = concept.definition;
          }

          if (Array.isArray(concept.designations) && concept.designations.length > 0) {
            const designations = concept.designations
              .filter(d => d && d.value)
              .map(d => ({
                language: d.language || undefined,
                value: d.value
              }));

            if (designations.length > 0) {
              fhirConcept.designation = designations;
            }
          }

          return fhirConcept;
        });
      this.materializedConceptCount = concepts.length;
    }

    codeSystem.jsonObj.concept = this.materializedConceptList;
    codeSystem.jsonObj.content = CodeSystemContentMode.Complete;
  }

  #backgroundLoadProgressSnapshot() {
    const processed = this.backgroundLoadProgress?.processed;
    const total = this.backgroundLoadProgress?.total;
    if (
      typeof processed === 'number' &&
      Number.isFinite(processed) &&
      typeof total === 'number' &&
      Number.isFinite(total) &&
      total > 0
    ) {
      return { processed, total };
    }
    return null;
  }

  #extractTotalFromPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }

    const candidates = [
      payload.total,
      payload.total_count,
      payload.totalCount,
      payload.num_found,
      payload.numFound,
      payload.count
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0) {
        return candidate;
      }
    }

    return null;
  }

  async #fetchConceptCountFromHeaders() {
    if (!this.meta?.conceptsUrl) {
      return null;
    }

    try {
      const response = await this.httpClient.get(this.meta.conceptsUrl, {
        params: {
          limit: 1
        }
      });
      return this.#extractNumFoundFromHeaders(response?.headers);
    } catch (error) {
      return null;
    }
  }

  #extractNumFoundFromHeaders(headers) {
    if (!headers || typeof headers !== 'object') {
      return null;
    }

    const raw = headers.num_found ?? headers['num-found'] ?? headers.Num_Found ?? null;
    const parsed = typeof raw === 'number' ? raw : Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return parsed;
  }

  #resourceKey() {
    return `${this.system()}|${this.version() || ''}`;
  }

  currentChecksum() {
    this.#syncWarmStateWithChecksum();
    return this.meta?.checksum || this.loadedChecksum || null;
  }

  isCompleteNow() {
    this.#syncWarmStateWithChecksum();
    return this.isComplete === true;
  }

  #toConceptContext(concept) {
    if (!concept || typeof concept !== 'object') {
      return null;
    }

    const code = concept.code || concept.id || null;
    if (!code) {
      return null;
    }

    return {
      code,
      display: concept.display_name || concept.display || concept.name || null,
      definition: concept.description || concept.definition || null,
      retired: concept.retired === true,
      designations: this.#extractDesignations(concept)
    };
  }

  #extractDesignations(concept) {
    const result = [];
    const seen = new Set();

    const add = (language, value) => {
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text) {
        return;
      }
      const lang = typeof language === 'string' ? language.trim() : '';
      const key = `${lang}|${text}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      result.push({ language: lang, value: text });
    };

    if (Array.isArray(concept.names)) {
      for (const entry of concept.names) {
        if (!entry || typeof entry !== 'object') {
          continue;
        }
        add(entry.locale || entry.language || entry.lang || '', entry.name || entry.display_name || entry.display || entry.value || entry.term);
      }
    }

    if (concept.display_name || concept.display || concept.name) {
      add(concept.locale || concept.default_locale || concept.language || '', concept.display_name || concept.display || concept.name);
    }

    if (concept.locale_display_names && typeof concept.locale_display_names === 'object') {
      for (const [lang, value] of Object.entries(concept.locale_display_names)) {
        add(lang, value);
      }
    }

    return result;
  }

  system() {
    return this.meta.canonicalUrl;
  }

  name() {
    return this.meta.name || this.meta.shortCode || this.meta.id || this.system();
  }

  version() {
    return this.meta.version || null;
  }

  id() {
    return this.meta.id || this.meta.shortCode || this.system();
  }

  iteratable() {
    return true;
  }
}

module.exports = {
  OCLCodeSystemProvider,
  OCLSourceCodeSystemFactory,
  OCLBackgroundJobQueue
};