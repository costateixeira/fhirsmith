const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const nock = require('nock');

const { OCLValueSetProvider } = require('../../tx/ocl/vs-ocl');
const { OCLSourceCodeSystemFactory, OCLBackgroundJobQueue } = require('../../tx/ocl/cs-ocl');
const { CACHE_VS_DIR, getCacheFilePath } = require('../../tx/ocl/cache/cache-paths');
const { COLD_CACHE_FRESHNESS_MS } = require('../../tx/ocl/shared/constants');
const { ValueSetExpander } = require('../../tx/workers/expand');
const { patchValueSetExpandWholeSystemForOcl } = require('../../tx/ocl/shared/patches');

function resetQueueState() {
  OCLBackgroundJobQueue.pendingJobs = [];
  OCLBackgroundJobQueue.activeCount = 0;
  OCLBackgroundJobQueue.queuedOrRunningKeys = new Set();
  OCLBackgroundJobQueue.activeJobs = new Map();
  OCLBackgroundJobQueue.enqueueSequence = 0;
  if (OCLBackgroundJobQueue.heartbeatTimer) {
    clearInterval(OCLBackgroundJobQueue.heartbeatTimer);
    OCLBackgroundJobQueue.heartbeatTimer = null;
  }
}

async function clearOclCache() {
  await fsp.rm(path.join(process.cwd(), 'data', 'terminology-cache', 'ocl'), { recursive: true, force: true });
}

describe('OCL ValueSet integration', () => {
  const baseUrl = 'https://ocl.vs.test';
  const conceptsPath = '/orgs/org-a/collections/col1/concepts/';
  const expansionPath = '/orgs/org-a/collections/col1/HEAD/expansions/autoexpand-HEAD/';

  beforeEach(async () => {
    nock.cleanAll();
    OCLSourceCodeSystemFactory.factoriesByKey.clear();
    resetQueueState();
    await clearOclCache();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  function mockDiscovery() {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [{ id: 'org-a' }] })
      .get('/orgs/org-a/collections/')
      .query(true)
      .reply(200, {
        results: [
          {
            id: 'col1',
            owner: 'org-a',
            owner_type: 'Organization',
            canonical_url: 'http://example.org/vs/one',
            version: '1.0.0',
            preferred_source: 'http://example.org/cs/source-one',
            concepts_url: conceptsPath,
            expansion_url: expansionPath
          }
        ]
      })
      .get(expansionPath)
      .times(20)
      .reply(200, {
        resolved_source_versions: [
          {
            canonical_url: 'http://example.org/cs/source-one',
            version: '1.0.0'
          }
        ]
      });
  }

  test('metadata discovery and cold-cache hydration for expansions', async () => {
    await fsp.mkdir(CACHE_VS_DIR, { recursive: true });
    const coldPath = getCacheFilePath(CACHE_VS_DIR, 'http://example.org/vs/one', '1.0.0', 'default');
    await fsp.writeFile(coldPath, JSON.stringify({
      canonicalUrl: 'http://example.org/vs/one',
      version: '1.0.0',
      paramsKey: 'default',
      fingerprint: 'fp-vs',
      timestamp: new Date().toISOString(),
      expansion: {
        contains: [{ system: 'http://example.org/cs/source-one', code: 'A', display: 'Alpha' }]
      }
    }), 'utf8');

    mockDiscovery();

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    await provider.initialize();
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    const fetched = await provider.fetchValueSet('http://example.org/vs/one', '1.0.0');
    expect(fetched).toBeTruthy();
    expect(fetched.url).toBe('http://example.org/vs/one');
    expect(fetched.oclMeta.conceptsUrl).toBe(`${baseUrl}${conceptsPath}`);
  });

  test('warm-up is skipped when cold cache is <= 1 hour old', async () => {
    mockDiscovery();

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    await provider.initialize();

    await fsp.mkdir(CACHE_VS_DIR, { recursive: true });
    const coldPath = getCacheFilePath(CACHE_VS_DIR, 'http://example.org/vs/one', '1.0.0', 'default');
    await fsp.writeFile(coldPath, JSON.stringify({
      canonicalUrl: 'http://example.org/vs/one',
      version: '1.0.0',
      paramsKey: 'default',
      fingerprint: 'fp-vs',
      timestamp: new Date().toISOString(),
      expansion: {
        contains: [{ system: 'http://example.org/cs/source-one', code: 'A', display: 'Alpha' }]
      },
      metadataSignature: '{"k":"v"}',
      dependencyChecksums: {}
    }), 'utf8');

    const enqueueSpy = jest.spyOn(OCLBackgroundJobQueue, 'enqueue');
    const fetched = await provider.fetchValueSet('http://example.org/vs/one', '1.0.0');

    expect(fetched).toBeTruthy();
    expect(enqueueSpy).not.toHaveBeenCalled();
  });

  test('stale cache triggers warm-up enqueue, expansion build, fingerprint and disk replacement', async () => {
    mockDiscovery();

    nock(baseUrl)
      .get(expansionPath)
      .reply(200, {
        resolved_source_versions: [
          {
            canonical_url: 'http://example.org/cs/source-one',
            version: '2026.1'
          }
        ]
      })
      .get(conceptsPath)
      .query(q => Number(q.limit) === 1)
      .times(2)
      .reply(200, { results: [{ code: 'A' }] }, { num_found: '3' })
      .get(conceptsPath)
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, {
        results: [
          {
            code: 'A',
            display_name: 'Alpha',
            definition: 'Alpha definition',
            retired: false,
            owner: 'org-a',
            source: 'src-1',
            source_canonical_url: 'http://example.org/cs/source-one',
            names: [{ locale: 'en', name: 'Alpha', locale_preferred: true }],
            descriptions: [{ locale: 'en', description: 'Alpha definition', locale_preferred: true }]
          },
          {
            code: 'B',
            display_name: 'Beta',
            retired: true,
            owner: 'org-a',
            source: 'src-1',
            source_canonical_url: 'http://example.org/cs/source-one',
            names: [{ locale: 'pt-BR', name: 'Beta' }]
          }
        ]
      })
      .get(conceptsPath)
      .query(q => Number(q.page) === 2 && Number(q.limit) === 1000)
      .reply(200, { results: [] });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    await provider.initialize();

    await fsp.mkdir(CACHE_VS_DIR, { recursive: true });
    const coldPath = getCacheFilePath(CACHE_VS_DIR, 'http://example.org/vs/one', '1.0.0', 'default');
    await fsp.writeFile(coldPath, JSON.stringify({
      canonicalUrl: 'http://example.org/vs/one',
      version: '1.0.0',
      paramsKey: 'default',
      fingerprint: 'old-fingerprint',
      timestamp: new Date(Date.now() - (COLD_CACHE_FRESHNESS_MS + 120000)).toISOString(),
      expansion: {
        contains: [{ system: 'http://example.org/cs/source-one', code: 'OLD' }]
      },
      metadataSignature: null,
      dependencyChecksums: {}
    }), 'utf8');
    const staleMs = Date.now() - (COLD_CACHE_FRESHNESS_MS + 120000);
    fs.utimesSync(coldPath, new Date(staleMs), new Date(staleMs));

    jest.spyOn(OCLSourceCodeSystemFactory, 'scheduleBackgroundLoadByKey').mockImplementation(() => true);
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockImplementation((jobKey, jobType, runJob, options = {}) => {
      OCLBackgroundJobQueue.queuedOrRunningKeys.add(jobKey);
      Promise.resolve()
        .then(async () => {
          const size = options.resolveJobSize ? await options.resolveJobSize() : options.jobSize;
          await runJob(size);
        })
        .finally(() => {
          OCLBackgroundJobQueue.queuedOrRunningKeys.delete(jobKey);
        });
      return true;
    });

    const vs = await provider.fetchValueSet('http://example.org/vs/one', '1.0.0');
    expect(vs).toBeTruthy();

    await global.TestUtils.waitFor(async () => {
      try {
        const data = JSON.parse(await fsp.readFile(coldPath, 'utf8'));
        return data.conceptCount === 2;
      } catch (_e) {
        return false;
      }
    }, 3000);

    const updated = JSON.parse(await fsp.readFile(coldPath, 'utf8'));
    expect(updated.conceptCount).toBe(2);
    expect(updated.fingerprint).toBeTruthy();
  });

  test('filter handling in oclFetchConcepts and cache key behavior for filtered calls', async () => {
    mockDiscovery();

    nock(baseUrl)
      .get(conceptsPath)
      .query(q => Number(q.page) === 1 && Number(q.limit) === 200 && String(q.verbose) === 'true' && q.q === 'alpha')
      .reply(200, {
        num_found: 2,
        results: [
          {
            code: 'A',
            display_name: 'Alpha term',
            definition: 'Definition alpha',
            retired: false,
            owner: 'org-a',
            source: 'src-1',
            source_canonical_url: 'http://example.org/cs/source-one',
            names: [{ locale: 'en', name: 'Alpha term', locale_preferred: true }],
            descriptions: [{ locale: 'en', description: 'Definition alpha' }]
          },
          {
            code: 'B',
            display_name: 'Beta',
            definition: 'No match',
            retired: false,
            owner: 'org-a',
            source: 'src-1',
            source_canonical_url: 'http://example.org/cs/source-one'
          }
        ]
      });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    await provider.initialize();
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    const vs = await provider.fetchValueSet('http://example.org/vs/one', '1.0.0');
    const out = await vs.oclFetchConcepts({
      count: 20,
      offset: 0,
      activeOnly: false,
      filter: ' alpha ',
      languageCodes: ['pt-BR', 'en']
    });

    expect(out.contains).toHaveLength(1);
    expect(out.contains[0].code).toBe('A');
    expect(out.contains[0].display).toBe('Alpha term');
  });

  test('fetchValueSetById and search/list methods are deterministic', async () => {
    mockDiscovery();

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    provider.spaceId = 'S';
    await provider.initialize();
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    const ids = new Set();
    provider.assignIds(ids);

    const byId = await provider.fetchValueSetById('S-col1');
    expect(byId).toBeTruthy();

    const search = await provider.searchValueSets([{ name: 'url', value: 'http://example.org/vs/one' }]);
    expect(search).toHaveLength(1);

    const all = await provider.listAllValueSets();
    expect(all).toContain('http://example.org/vs/one');
  });

  test('regression: unfiltered whole-system include retries with bounded paging for OCL', async () => {
    patchValueSetExpandWholeSystemForOcl();

    const cs = {
      specialEnumeration: () => null,
      isNotClosed: () => false,
      iterator: async () => ({ total: 5001 }),
      nextContext: (() => {
        let emitted = false;
        return async () => {
          if (emitted) {
            return null;
          }
          emitted = true;
          return { code: 'A' };
        };
      })(),
      system: async () => 'http://example.org/cs/source-one',
      version: async () => '1.0.0'
    };

    const expander = new ValueSetExpander({
      internalLimit: 10000,
      externalLimit: 1000,
      opContext: { log: () => {}, diagnostics: () => '' },
      deadCheck: () => {},
      findCodeSystem: async () => cs,
      checkSupplements: () => {},
      i18n: { languageDefinitions: {}, translate: (_k, _langs, args) => `too costly ${args?.join(' ') || ''}` },
      provider: { getFhirVersion: () => '5.0.0' },
      languages: { parse: () => null }
    }, {
      hasDesignations: false,
      designations: [],
      httpLanguages: null
    });

    expander.valueSet = { oclFetchConcepts: async () => ({ contains: [] }) };
    expander.limitCount = 1000;
    expander.count = -1;
    expander.offset = -1;
    expander.hasExclusions = false;
    expander.requiredSupplements = new Set();
    expander.usedSupplements = new Set();
    expander.map = new Map();
    expander.fullList = [];
    expander.rootList = [];
    expander.addToTotal = jest.fn();
    expander.passesFilters = jest.fn(async () => true);
    expander.includeCodeAndDescendants = jest.fn(async () => 1);
    expander.checkProviderCanonicalStatus = jest.fn();
    expander.addParamUri = jest.fn();
    expander.addParamInt = jest.fn();

    await expect(expander.includeCodes(
      { system: 'http://example.org/cs/source-one' },
      'ValueSet.compose.include[0]',
      { vurl: 'http://example.org/vs/one|1.0.0', url: 'http://example.org/vs/one' },
      { include: [{ system: 'http://example.org/cs/source-one' }] },
      { isNull: true },
      {},
      false,
      { value: false }
    )).resolves.toBeUndefined();

    expect(expander.addParamInt).toHaveBeenCalledWith(expect.any(Object), 'offset', 0);
    expect(expander.addParamInt).toHaveBeenCalledWith(expect.any(Object), 'count', 1000);
    expect(expander.includeCodeAndDescendants).toHaveBeenCalled();
  });

  test('filtered whole-system include keeps default too-costly behavior', async () => {
    patchValueSetExpandWholeSystemForOcl();

    const cs = {
      specialEnumeration: () => null,
      isNotClosed: () => false,
      iterator: async () => ({ total: 5001 }),
      nextContext: async () => null,
      system: async () => 'http://example.org/cs/source-one',
      version: async () => '1.0.0'
    };

    const expander = new ValueSetExpander({
      internalLimit: 10000,
      externalLimit: 1000,
      opContext: { log: () => {}, diagnostics: () => '' },
      deadCheck: () => {},
      findCodeSystem: async () => cs,
      checkSupplements: () => {},
      i18n: { languageDefinitions: {}, translate: (_k, _langs, args) => `too costly ${args?.join(' ') || ''}` },
      provider: { getFhirVersion: () => '5.0.0' },
      languages: { parse: () => null }
    }, {
      hasDesignations: false,
      designations: [],
      httpLanguages: null
    });

    expander.valueSet = {};
    expander.limitCount = 1000;
    expander.count = -1;
    expander.offset = -1;
    expander.hasExclusions = false;
    expander.requiredSupplements = new Set();
    expander.usedSupplements = new Set();
    expander.map = new Map();
    expander.fullList = [];
    expander.rootList = [];
    expander.passesFilters = jest.fn(async () => true);
    expander.includeCodeAndDescendants = jest.fn(async () => 1);
    expander.checkProviderCanonicalStatus = jest.fn();
    expander.addParamUri = jest.fn();
    expander.addParamInt = jest.fn();

    let thrown = null;
    try {
      await expander.includeCodes(
        { system: 'http://example.org/cs/source-one' },
        'ValueSet.compose.include[0]',
        { vurl: 'http://example.org/vs/one|1.0.0', url: 'http://example.org/vs/one' },
        { include: [{ system: 'http://example.org/cs/source-one' }] },
        { isNull: true },
        {},
        false,
        { value: false }
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeTruthy();
    expect(thrown.cause).toBe('too-costly');
  });
});
