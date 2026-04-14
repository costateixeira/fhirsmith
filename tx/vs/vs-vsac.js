const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { AbstractValueSetProvider } = require('./vs-api');
const { ValueSetDatabase } = require('./vs-database');
const { VersionUtilities } = require('../../library/version-utilities');
const folders = require('../../library/folder-setup');
const {debugLog} = require("../operation-context");

/**
 * VSAC (Value Set Authority Center) ValueSet provider
 * Fetches and caches ValueSets from the NLM VSAC FHIR server
 */
class VSACValueSetProvider extends AbstractValueSetProvider {
  SYNC_AT_START_UP = false;

  /**
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - API key for VSAC authentication
   * @param {string} config.cacheFolder - Local folder for cached database
   * @param {number} [config.refreshIntervalHours=24] - Hours between refresh scans
   * @param {string} [config.baseUrl='http://cts.nlm.nih.gov/fhir'] - Base URL for VSAC FHIR server
   * @param {number} [config.timeoutMs=120000] - HTTP request timeout in milliseconds
   */
  constructor(config, stats) {
    super();
    this.stats = stats;

    if (!config.apiKey) {
      throw new Error('VSAC API key is required');
    }

    this.apiKey = config.apiKey;
    this.cacheFolder = folders.ensureFilePath("terminology-cache/vsac");
    this.baseUrl = config.baseUrl || 'http://cts.nlm.nih.gov/fhir';
    this.refreshIntervalHours = config.refreshIntervalHours || 24;

    this.dbPath = path.join(this.cacheFolder, 'vsac-valuesets.db');
    this.database = new ValueSetDatabase(this.dbPath);
    this.valueSetMap = new Map();
    this.initialized = false;
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.lastRefresh = null;

    // HTTP client with authentication - manually create Basic auth header
    const authString = Buffer.from(`apikey:${this.apiKey}`).toString('base64');
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeoutMs || 120000,
      headers: {
        'Accept': 'application/fhir+json',
        'User-Agent': 'FHIR-ValueSet-Provider/1.0',
        'Authorization': `Basic ${authString}`
      }
    });
  }

  sourcePackage() {
    return "vsac";
  }

  /**
   * Initialize the provider - setup database and start refresh cycle
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    this.stats.addTask('VSAC Sync', `${this.refreshIntervalHours} hours`);

    // Create database if it doesn't exist
    if (!(await this.database.exists())) {
      await this.database.create();
    } else {
      // Schema migrations are applied lazily by the database layer on first
      // connection. Just load existing data.
      await this._reloadMap();
    }
    if (this.SYNC_AT_START_UP || this.valueSetMap.size == 0) {
      await this.refreshValueSets();
    }
    // Start periodic refresh
    this._startRefreshTimer();
    this.initialized = true;
  }

  /**
   * Start the periodic refresh timer
   * @private
   */
  _startRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    const intervalMs = this.refreshIntervalHours * 60 * 60 * 1000;
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshValueSets();
      } catch (error) {
        debugLog(error);
        this.log.error(error, 'Error during scheduled refresh:');
      }
    }, intervalMs);
  }

  /**
   * Stop the refresh timer (for cleanup)
   */
  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Perform a full refresh of ValueSets from the server
   * @returns {Promise<void>}
   */
  async refreshValueSets() {
    this.stats.task('VSAC Sync', 'running');
    if (this.isRefreshing) {
      console.log('Refresh already in progress, skipping');
      return;
    }
    this.queue = [];

    this.isRefreshing = true;
    const runId = await this.database.startRun();

    try {
      // phase 1: list all value sets
      console.log('Starting VSAC ValueSet refresh...');

      // This lists all the currently valid value sets by URL, but not the older versions
      let url = '/ValueSet?_offset=0&_count=100&_elements=id,url,version,status';

      let total = undefined;
      let count = 0;
      let ncount = 0;

      while (url) {
        console.log(`Sync: ${count} of ${total} - ${ncount} new`);
        this.stats.task('VSAC Sync', `Sync: ${count} of ${total} - ${ncount} new`);

        const bundle = await this._fetchBundle(url);

        if (!total) {
          total = bundle.total;
        }
        for (let be of bundle.entry || []) {
          let vs = be.resource;
          if (vs) {
            count++;
            // if we've seen this value set before, then we've got nothing new here.
            if (!this.valueSetMap.has(vs.url+"|"+vs.version)) {
              this.queue.push(vs.url);
              ncount++;
            }
          }
        }
        // Find next link
        url = this._getNextUrl(bundle);

        // Safety check against infinite loops
        if (count > total) {
          console.log(`Reached total count (${total}), stopping`);
          break;
        }
      }

      this.lastRefresh = new Date();
      console.log(`VSAC refresh phase 1 done. Total: ${count} with ${ncount} new items`);
      this.stats.task('VSAC Sync', `VSAC refresh phase 1 done. Total: ${count} with ${ncount} new items`);

      // phase 1b: query for recently updated value sets via _lastUpdated
      let lastUpdatedCount = await this._scanLastUpdated();
      console.log(`VSAC refresh phase 1b done. ${lastUpdatedCount} additional items from _lastUpdated`);
      this.stats.task('VSAC Sync', `Phase 1b: ${lastUpdatedCount} from _lastUpdated`);

      // deduplicate the queue
      this.queue = [...new Set(this.queue)];

      let tracking = { totalFetched: 0, totalNew: 0, totalUpdated: 0, count: 0, newCount : 0 };
      // phase 2: query for history & content
      this.requeue = [];
      for (let q of this.queue) {
        this.stats.task('VSAC History for '+q, `running (${tracking.totalFetched} fetched, ${tracking.totalNew} new, ${tracking.totalUpdated} updated)`);
        try {
          await this.processContentAndHistory(q, tracking, this.queue.length);
        } catch (error) {
          this.requeue.push(q)
          debugLog(error);
          this.stats.task('VSAC Sync', error.message);
        }
        tracking.count++;
      }
      console.log("Requeue");
      for (let q of this.requeue) {
        this.stats.task('VSAC History for '+q, `running (${tracking.totalFetched} fetched, ${tracking.totalNew} new, ${tracking.totalUpdated} updated)`);
        try {
          await this.processContentAndHistory(q, tracking, this.requeue.length);
        } catch (error) {
          debugLog(error);
          this.stats.task('VSAC Sync', error.message);
        }
        tracking.count++;
      }

      // Reload map with fresh data
      await this._reloadMap();
      let msg = `VSAC refresh completed. Total: ${tracking.totalFetched} ValueSets, New: ${tracking.totalNew}, Updated: ${tracking.totalUpdated}`;
      this.stats.taskDone('VSAC Sync', msg);
      console.log(msg);

      await this.database.finishRun(runId, tracking.totalFetched, tracking.totalNew, tracking.totalUpdated);
    } catch (error) {
      debugLog(error, 'Error during VSAC refresh:');
      this.stats.taskError('VSAC Sync', `Error (${error.message})`);
      await this.database.failRun(runId, error.message);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Compute a SHA-256 hash of the ValueSet content for change detection.
   * @param {Object} vs - The ValueSet resource (plain JSON object)
   * @returns {string} hex-encoded SHA-256
   * @private
   */
  _hashValueSet(vs) {
    return crypto.createHash('sha256').update(JSON.stringify(vs)).digest('hex');
  }

  /**
   * Insert multiple ValueSets in a batch operation.
   * For each value set: if url|version is already known, compare content hashes.
   *   - hash unchanged  -> touch last_seen only (seeValueSet)
   *   - hash changed    -> upsert and record an 'updated' event
   *   - not seen before -> upsert and record a 'new' event
   * @param {Array<Object>} valueSets - Array of ValueSet resources
   * @returns {Promise<{newCount: number, updatedCount: number}>}
   */
  async batchUpsertValueSets(valueSets) {
    if (valueSets.length === 0) {
      return { newCount: 0, updatedCount: 0 };
    }

    let newCount = 0;
    let updatedCount = 0;

    // Process sequentially to avoid database locking
    for (const valueSet of valueSets) {
      const key = valueSet.url+"|"+valueSet.version;
      const existing = this.valueSetMap.get(key);
      const newHash = this._hashValueSet(valueSet);

      if (existing) {
        // We've seen this url|version before. Decide whether the content
        // has actually changed by comparing hashes.
        //
        // Note: _reloadMap() mutates the in-memory jsonObj (strips inc.version
        // from compose.include/exclude), so we cannot reliably recompute a
        // hash from existing.jsonObj — it would not match the hash of the
        // original unmutated JSON we stored. For rows predating this feature
        // (content_hash NULL), we defer update detection until the next cycle:
        // the upsert below runs only when hashes differ, so on the *next*
        // sync after migration we'll have a proper baseline.
        if (existing.contentHash && existing.contentHash === newHash) {
          // No change - just touch last_seen
          await this.database.seeValueSet(valueSet);
        } else if (!existing.contentHash) {
          // Legacy row without a stored hash - backfill the hash silently
          // without emitting a spurious 'updated' event. We do a lightweight
          // touch + hash update rather than a full upsert+event.
          await this.database.seeValueSet(valueSet);
          await this.database.setContentHash(valueSet.id, newHash);
        } else {
          // Content has changed - treat as update
          await this.database.upsertValueSet(valueSet, newHash);
          await this.database.recordEvent('updated', valueSet.url, valueSet.version);
          updatedCount++;
        }
      } else {
        await this.database.upsertValueSet(valueSet, newHash);
        await this.database.recordEvent('new', valueSet.url, valueSet.version);
        newCount++;
      }
    }
    return { newCount, updatedCount };
  }

  /**
   * Fetch a FHIR Bundle from the server
   * @param {string} url - Relative URL to fetch
   * @returns {Promise<Object>} FHIR Bundle
   * @private
   */
  async _fetchBundle(url) {
    try {
      const response = await this.httpClient.get(url);

      if (response.data && response.data.resourceType === 'Bundle') {
        return response.data;
      } else {
        throw new Error('VSAC Response is not a FHIR Bundle');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response received');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Fetch a FHIR Bundle from the server
   * @param {string} url - Relative URL to fetch
   * @returns {Promise<Object>} FHIR Bundle
   * @private
   */
  async _fetchValueSet(id) {
    try {
      const response = await this.httpClient.get("/ValueSet/"+id);

      if (response.data && response.data.resourceType === 'ValueSet') {
        return response.data;
      } else {
        throw new Error('VSAC Response is not a FHIR ValueSet');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response received');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Extract the next URL from a FHIR Bundle's link array
   * @param {Object} bundle - FHIR Bundle
   * @returns {string|null} Next URL or null if no more pages
   * @private
   */
  _getNextUrl(bundle) {
    if (!bundle.link || !Array.isArray(bundle.link)) {
      return null;
    }

    const nextLink = bundle.link.find(link => link.relation === 'next');
    if (!nextLink || !nextLink.url) {
      return null;
    }

    // Extract relative path from full URL
    let s = nextLink.url;
    s = s.replace(this.baseUrl, '');
    return s;
  }

  /**
   * Reload the in-memory map from database (thread-safe)
   * @returns {Promise<void>}
   * @private
   */
  async _reloadMap() {
    const newMap = await this.database.loadAllValueSets(this.sourcePackage());
    for (const vs of newMap.values()) {
      if (vs.jsonObj.compose) {
        for (const inc of vs.jsonObj.compose.include || []) {
          if (inc.version) {
            delete inc.version;
          }
        }for (const inc of vs.jsonObj.compose.exclude || []) {
          if (inc.version) {
            delete inc.version;
          }
        }
      }
    }
    // Atomic replacement of the map
    this.valueSetMap = newMap;
  }

  /**
   * Fetches a value set by URL and version
   * @param {string} url - The canonical URL of the value set
   * @param {string} version - The version of the value set
   * @returns {Promise<Object>} The requested value set
   */
  async fetchValueSet(url, version) {
    await this.initialize();
    this._validateFetchParams(url, version);

    // Try exact match first: url|version
    let key = `${url}|${version}`;
    if (this.valueSetMap.has(key)) {
      return await this.checkFullVS(this.valueSetMap.get(key));
    }

    // If version is semver, try url|major.minor
    try {
      if (VersionUtilities.isSemVer(version)) {
        const majorMinor = VersionUtilities.getMajMin(version);
        if (majorMinor) {
          key = `${url}|${majorMinor}`;
          if (this.valueSetMap.has(key)) {
            return await this.checkFullVS(this.valueSetMap.get(key));
          }
        }
      }
    } catch (error) {
      // Ignore version parsing errors
    }

    // Finally try just the URL
    if (this.valueSetMap.has(url)) {
      return await this.checkFullVS(this.valueSetMap.get(url));
    }

    return null;
  }

  async fetchValueSetById(id) {
    return await this.checkFullVS(this.valueSetMap.get(id));
  }
  /**
   * Searches for value sets based on criteria
   * @param {Array<{name: string, value: string}>} searchParams - Search criteria
   * @returns {Promise<Array<Object>>} List of matching value sets
   */
  async searchValueSets(searchParams, elements) {
    await this.initialize();
    this._validateSearchParams(searchParams);

    if (searchParams.length === 0) {
      return [];
    }

    return await this.database.search(this.spaceId, this.valueSetMap, searchParams, elements);
  }

  /**
   * Get statistics about the cached ValueSets
   * @returns {Promise<Object>} Statistics object including refresh info
   */
  async getStatistics() {
    await this.initialize();

    const dbStats = await this.database.getStatistics();

    return {
      ...dbStats,
      refreshInfo: {
        lastRefresh: this.lastRefresh,
        isRefreshing: this.isRefreshing,
        refreshIntervalHours: this.refreshIntervalHours,
        nextRefresh: this.refreshTimer && this.lastRefresh
            ? new Date(this.lastRefresh.getTime() + (this.refreshIntervalHours * 60 * 60 * 1000))
            : null
      }
    };
  }

  /**
   * Get the number of value sets loaded into memory
   * @returns {number} Number of unique value sets in map
   */
  getMapSize() {
    const uniqueUrls = new Set();
    for (const [key, valueSet] of this.valueSetMap.entries()) {
      if (!key.includes('|')) { // Only count base URL keys
        uniqueUrls.add(valueSet.url);
      }
    }
    return uniqueUrls.size;
  }

  /**
   * Force a refresh (useful for testing or manual updates)
   * @returns {Promise<void>}
   */
  async forceRefresh() {
    await this.refreshValueSets();
  }

  /**
   * Check if the provider is currently refreshing
   * @returns {boolean} True if refresh is in progress
   */
  isCurrentlyRefreshing() {
    return this.isRefreshing;
  }

  /**
   * Get the last refresh timestamp
   * @returns {Date|null} Last refresh date or null if never refreshed
   */
  getLastRefreshTime() {
    return this.lastRefresh;
  }

  count() {
    return this.database.vsCount;
  }

  async listAllValueSets() {
    return await this.database.listAllValueSets();
  }

  async close() {
    await this.database.close();
  }

  // eslint-disable-next-line no-unused-vars
  assignIds(ids) {
    // nothing?
  }

  // when we get a valueset from vsac via search, the compose is not
  // populated. We don't load all the composes. Instead, when value sets
  // are fetched, we check to see if we've got the compose, and if we
  // haven't, then we fetch it and store it
  async checkFullVS(vs) {
    // if (!vs) {
    //   return null;
    // }
    // if (vs.jsonObj?.compose) {
    //   return vs;
    // }
    // console.log('get a full copy for the ValueSet '+vs.url+'|'+vs.version);
    // let vsNew = await this._fetchValueSet(vs.id);
    // await this.database.upsertValueSet(vsNew);
    // this.database.addToMap(this.valueSetMap, vsNew.id, vsNew.url, vsNew.version, vsNew);
    // return new ValueSet(vsNew);
    return vs;
  }

  async processContentAndHistory(q, tracking, length) {
    let url = `/ValueSet?url=${q}`;
    const bundle = await this._fetchBundle(url);

    let vcount = 0;
    let perRun = { newCount: 0, updatedCount: 0 };
    if (bundle.entry && bundle.entry.length > 0) {
      // Extract ValueSets from bundle entries
      const valueSets = bundle.entry
          .filter(entry => entry.resource && entry.resource.resourceType === 'ValueSet')
          .map(entry => entry.resource);
      if (valueSets.length > 0) {
        perRun = await this.batchUpsertValueSets(valueSets);
        tracking.totalNew += perRun.newCount;
        tracking.totalUpdated += perRun.updatedCount;
        tracking.totalFetched += valueSets.length;
        vcount = valueSets.length;
      }
    }
    let logMsg = `VSAC (${tracking.count} of ${length}) ${q}: ${vcount} versions (${perRun.newCount} new, ${perRun.updatedCount} updated)`;
    console.log(logMsg);
    this.stats.task('VSAC Sync', logMsg);
  }

  /**
   * Scan VSAC for recently updated value sets using the _lastUpdated parameter.
   * Uses a stored date from the previous run; if none exists, defaults to 4 days ago.
   * Adds any found URLs to this.queue and stores the server's response date for next time.
   * @returns {Promise<number>} Number of value set URLs added to the queue
   * @private
   */
  async _scanLastUpdated() {
    const SETTING_KEY = 'vsac_last_updated_date';

    let sinceDate = await this.database.getSetting(SETTING_KEY);
    if (!sinceDate) {
      // No stored date — default to 10 days ago
      const d = new Date();
      d.setDate(d.getDate() - 10);
      sinceDate = d.toISOString();
    }

    let url = `/res/ValueSet/?_lastUpdated=ge${sinceDate}&_offset=0&_count=100&_elements=id,url,version,status`;
    let count = 0;
    let serverDate = null;

    while (url) {
      console.log(`_lastUpdated scan: ${count} found so far`);
      this.stats.task('VSAC Sync', `_lastUpdated scan: ${count} found`);

      const bundle = await this._fetchBundle(url);

      // Capture the server's lastUpdated from the first page
      if (!serverDate && bundle.meta && bundle.meta.lastUpdated) {
        serverDate = bundle.meta.lastUpdated;
      }

      for (let be of bundle.entry || []) {
        let vs = be.resource;
        if (vs && vs.url) {
          this.queue.push(vs.url);
          count++;
        }
      }

      url = this._getNextUrl(bundle);
    }

    // Store the server date for next run
    if (serverDate) {
      await this.database.setSetting(SETTING_KEY, serverDate);
    }

    return count;
  }

  name() {
    return "VSAC";
  }

  infoName() {
    return "history";
  }

  async info() {
    const escape = require('escape-html');
    const db = await this.database._getReadConnection();

    const rows = await new Promise((resolve, reject) => {
      db.all(
          `SELECT 'event' AS kind,
                  url,
                  version,
             timestamp AS ts,
             event_type,
             NULL AS status,
             NULL AS error_message,
             NULL AS finished_at,
             NULL AS total_fetched,
             NULL AS total_new,
             NULL AS total_updated
           FROM vsac_events
           UNION ALL
          SELECT 'run' AS kind,
                 NULL,
                 NULL,
                 started_at AS ts,
                 NULL AS event_type,
                 status,
                 error_message,
                 finished_at,
                 total_fetched,
                 total_new,
                 total_updated
          FROM vsac_runs
          ORDER BY ts DESC
            LIMIT 200`,
          [],
          (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    const fmt = ts => ts
        ? new Date(ts * 1000).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
        : '—';

    let html = '<h3>VSAC Sync History</h3>';
    html += '<table class="grid">';
    html += '<thead><tr><th>Time</th><th>Event</th><th>Detail</th></tr></thead>';
    html += '<tbody>';

    for (const row of rows) {
      if (row.kind === 'run') {
        const duration = row.finished_at ? `${row.finished_at - row.ts}s` : 'in progress';
        let detail, colour;
        if (row.status === 'ok') {
          const updated = row.total_updated != null ? `, ${row.total_updated} updated` : '';
          detail = `${row.total_fetched} fetched, ${row.total_new} new${updated}, ${duration}`;
          colour = 'green';
        } else if (row.status === 'error') {
          detail = `Failed: ${escape(row.error_message || '')} (${duration})`;
          colour = 'red';
        } else {
          detail = `Running... (started ${fmt(row.ts)})`;
          colour = 'orange';
        }
        html += `<tr style="background:#f0f0f0">`;
        html += `<td>${escape(fmt(row.ts))}</td>`;
        html += `<td><strong style="color:${colour}">Sync run</strong></td>`;
        html += `<td>${detail}</td>`;
        html += `</tr>`;
      } else {
        // Event row: 'new', 'updated', or 'deleted'
        let label, colour;
        switch (row.event_type) {
          case 'new':
            label = 'New value set';
            colour = 'green';
            break;
          case 'updated':
            label = 'Updated value set';
            colour = 'blue';
            break;
          case 'deleted':
            label = 'Deleted value set';
            colour = 'red';
            break;
          default:
            label = escape(row.event_type || 'Event');
            colour = 'black';
        }
        html += `<tr>`;
        html += `<td>${escape(fmt(row.ts))}</td>`;
        html += `<td><span style="color:${colour}">${label}</span></td>`;
        html += `<td>${escape(row.url || '')}#${escape(row.version || '')}</td>`;
        html += `</tr>`;
      }
    }

    html += '</tbody></table>';
    return html;
  }

  id() {
    return "vsac";
  }
}

// Usage examples:
module.exports = {
  VSACValueSetProvider
};