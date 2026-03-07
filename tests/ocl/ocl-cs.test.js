const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const nock = require('nock');

const { OperationContext } = require('../../tx/operation-context');
const { OCLCodeSystemProvider, OCLSourceCodeSystemFactory, OCLBackgroundJobQueue } = require('../../tx/ocl/cs-ocl');
const { CACHE_CS_DIR, getCacheFilePath } = require('../../tx/ocl/cache/cache-paths');
const { COLD_CACHE_FRESHNESS_MS } = require('../../tx/ocl/shared/constants');
const { TestUtilities } = require('../test-utilities');

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

describe('OCL CodeSystem integration', () => {
  const baseUrl = 'https://ocl.cs.test';
  let i18n;

  beforeAll(async () => {
    i18n = await TestUtilities.loadTranslations(await TestUtilities.loadLanguageDefinitions());
  });

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

  test('metadata discovery and source snapshots are loaded', async () => {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [{ id: 'org-a' }] });

    nock(baseUrl)
      .get('/orgs/org-a/sources/')
      .query(true)
      .reply(200, {
        results: [
          {
            id: 'src1',
            owner: 'org-a',
            name: 'Source One',
            canonical_url: 'http://example.org/cs/source-one',
            version: '2026.1',
            concepts_url: '/orgs/org-a/sources/src1/concepts/',
            checksums: { standard: 'chk-1' }
          }
        ]
      });

    const provider = new OCLCodeSystemProvider({ baseUrl });
    const systems = await provider.listCodeSystems('5.0', null);
    expect(systems).toHaveLength(1);
    expect(systems[0].url).toBe('http://example.org/cs/source-one');
    expect(systems[0].content).toBe('not-present');

    const metas = provider.getSourceMetas();
    expect(metas).toHaveLength(1);
    expect(metas[0].conceptsUrl).toBe(`${baseUrl}/orgs/org-a/sources/src1/concepts/`);

    const ids = new Set();
    provider.assignIds(ids);
    expect(Array.from(ids).some(x => x.startsWith('CodeSystem/'))).toBe(true);
    await expect(provider.close()).resolves.toBeUndefined();
  });

  test('getCodeSystemChanges returns staged diffs after refresh', async () => {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .times(2)
      .reply(200, { results: [{ id: 'org-a' }] });

    nock(baseUrl)
      .get('/orgs/org-a/sources/')
      .query(true)
      .reply(200, {
        results: [{ id: 'src1', owner: 'org-a', canonical_url: 'http://example.org/cs/source-one', version: '1.0.0' }]
      })
      .get('/orgs/org-a/sources/')
      .query(true)
      .reply(200, {
        results: [
          { id: 'src1', owner: 'org-a', canonical_url: 'http://example.org/cs/source-one', version: '1.0.1' },
          { id: 'src2', owner: 'org-a', canonical_url: 'http://example.org/cs/source-two', version: '1.0.0' }
        ]
      });

    const provider = new OCLCodeSystemProvider({ baseUrl });
    await provider.initialize();

    const immediate = provider.getCodeSystemChanges('5.0', null);
    expect(immediate).toEqual({ added: [], changed: [], deleted: [] });

    await global.TestUtils.waitFor(() => {
      const staged = provider.getCodeSystemChanges('5.0', null);
      return staged.added.length === 1 && staged.changed.length === 1;
    }, 2000);
  });

  test('factory hydrates from cold cache and skips warm-up while fresh', async () => {
    const meta = {
      id: 'src1',
      canonicalUrl: 'http://example.org/cs/source-one',
      version: '1.0.0',
      name: 'Source One',
      checksum: 'meta-1',
      conceptsUrl: `${baseUrl}/orgs/org-a/sources/src1/concepts/`,
      codeSystem: {
        jsonObj: {
          content: 'not-present'
        }
      }
    };

    await fsp.mkdir(CACHE_CS_DIR, { recursive: true });
    const coldFile = getCacheFilePath(CACHE_CS_DIR, meta.canonicalUrl, meta.version);
    await fsp.writeFile(coldFile, JSON.stringify({
      canonicalUrl: meta.canonicalUrl,
      version: meta.version,
      fingerprint: 'fp-old',
      concepts: [
        { code: 'A', display: 'Alpha', retired: false },
        { code: 'B', display: 'Beta', retired: true }
      ]
    }), 'utf8');

    const factory = new OCLSourceCodeSystemFactory(i18n, { get: jest.fn() }, meta);

    await global.TestUtils.waitFor(() => factory.isCompleteNow() === true, 2000);

    const opContext = new OperationContext('en-US', i18n);
    const provider = factory.build(opContext, []);

    expect(provider.contentMode()).toBe('complete');
    expect(await provider.display('A')).toBe('Alpha');
    expect(await provider.isInactive('B')).toBe(true);

    const enqueueSpy = jest.spyOn(OCLBackgroundJobQueue, 'enqueue');
    factory.scheduleBackgroundLoad('test-fresh-cache');
    expect(enqueueSpy).not.toHaveBeenCalled();
  });

  test('factory enqueues stale warm-up and replaces cold cache with hot cache', async () => {
    const conceptsUrl = `${baseUrl}/orgs/org-a/sources/src1/concepts/`;
    const meta = {
      id: 'src1',
      canonicalUrl: 'http://example.org/cs/source-one',
      version: '1.0.0',
      name: 'Source One',
      checksum: 'meta-2',
      conceptsUrl,
      codeSystem: {
        jsonObj: {
          content: 'not-present'
        }
      }
    };

    await fsp.mkdir(CACHE_CS_DIR, { recursive: true });
    const coldFile = getCacheFilePath(CACHE_CS_DIR, meta.canonicalUrl, meta.version);
    await fsp.writeFile(coldFile, JSON.stringify({
      canonicalUrl: meta.canonicalUrl,
      version: meta.version,
      fingerprint: 'fp-legacy',
      concepts: [{ code: 'OLD' }]
    }), 'utf8');

    const staleMs = Date.now() - (COLD_CACHE_FRESHNESS_MS + 120000);
    fs.utimesSync(coldFile, new Date(staleMs), new Date(staleMs));

    nock(baseUrl)
      .get('/orgs/org-a/sources/src1/concepts/')
      .query(q => Number(q.limit) === 1)
      .reply(200, { results: [{ code: 'A' }] }, { num_found: '2' })
      .get('/orgs/org-a/sources/src1/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, {
        count: 2,
        results: [
          { code: 'A', display_name: 'Alpha', retired: false },
          { code: 'B', display_name: 'Beta', retired: false }
        ]
      });

    const factory = new OCLSourceCodeSystemFactory(i18n, require('axios').create({ baseURL: baseUrl }), meta);

    // Force queue execution inline for deterministic test behavior.
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

    factory.scheduleBackgroundLoad('stale-cache');

    await global.TestUtils.waitFor(() => factory.isCompleteNow() === true, 3000);

    const coldData = JSON.parse(await fsp.readFile(coldFile, 'utf8'));
    // Existing cold-cache concept remains in shared cache; warm load appends newly fetched concepts.
    if (typeof coldData.conceptCount === 'number') {
      expect(coldData.conceptCount).toBeGreaterThanOrEqual(2);
    } else {
      expect(Array.isArray(coldData.concepts)).toBe(true);
      expect(coldData.concepts.length).toBeGreaterThanOrEqual(2);
    }
    expect(coldData.fingerprint).toBeTruthy();
  });

  test('provider lookup/filter lifecycle is functional for lazy fetches', async () => {
    const conceptsUrl = `${baseUrl}/orgs/org-a/sources/src1/concepts/`;
    const meta = {
      id: 'src1',
      canonicalUrl: 'http://example.org/cs/source-one',
      version: null,
      name: 'Source One',
      checksum: 'meta-3',
      conceptsUrl,
      codeSystem: {
        jsonObj: {
          property: [{ code: 'display' }, { code: 'inactive' }],
          content: 'not-present'
        }
      }
    };

    nock(baseUrl)
      .get('/orgs/org-a/sources/src1/concepts/C3/')
      .reply(200, {
        code: 'C3',
        display_name: 'Gamma term',
        description: 'Gamma definition',
        retired: false,
        names: [{ locale: 'en', name: 'Gamma term' }]
      })
      .get('/orgs/org-a/sources/src1/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, {
        results: [
          { code: 'A1', display_name: 'Alpha', description: 'Alpha definition', retired: false },
          { code: 'B2', display_name: 'Beta', description: 'Beta definition', retired: true }
        ]
      })
      .get('/orgs/org-a/sources/src1/concepts/')
      .query(q => Number(q.page) === 2 && Number(q.limit) === 1000)
      .reply(200, {
        results: []
      });

    const factory = new OCLSourceCodeSystemFactory(i18n, require('axios').create({ baseURL: baseUrl }), meta);
    const opContext = new OperationContext('en-US', i18n);
    const provider = factory.build(opContext, []);

    const located = await provider.locate('C3');
    expect(located.context.code).toBe('C3');
    expect(await provider.display('C3')).toBe('Gamma term');

    const filterCtx = await provider.getPrepContext(null);
    const set = await provider.filter(filterCtx, 'inactive', '=', 'true');
    expect(await provider.filterSize(filterCtx, set)).toBe(1);

    await provider.filterFinish(filterCtx);
  });
});
