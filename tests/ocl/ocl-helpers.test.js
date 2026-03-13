const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const { createOclHttpClient } = require('../../tx/ocl/http/client');
const { extractItemsAndNext, fetchAllPages } = require('../../tx/ocl/http/pagination');
const { sanitizeFilename, getCacheFilePath, CACHE_BASE_DIR } = require('../../tx/ocl/cache/cache-paths');
const { ensureCacheDirectories, getColdCacheAgeMs, formatCacheAgeMinutes } = require('../../tx/ocl/cache/cache-utils');
const { computeCodeSystemFingerprint, computeValueSetExpansionFingerprint } = require('../../tx/ocl/fingerprint/fingerprint');
const { toConceptContext, extractDesignations } = require('../../tx/ocl/mappers/concept-mapper');
const { OCLConceptFilterContext } = require('../../tx/ocl/model/concept-filter-context');
const { OCLBackgroundJobQueue } = require('../../tx/ocl/jobs/background-queue');
const { OCL_CODESYSTEM_MARKER_EXTENSION } = require('../../tx/ocl/shared/constants');

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

describe('OCL helper modules', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetQueueState();
  });

  test('createOclHttpClient applies baseUrl and token header', () => {
    const out = createOclHttpClient({ baseUrl: 'https://example.org///', token: 'abc' });
    expect(out.baseUrl).toBe('https://example.org');
    expect(out.client.defaults.headers.Authorization).toBe('Token abc');

    const bearer = createOclHttpClient({ baseUrl: 'https://example.org', token: 'Bearer z' });
    expect(bearer.client.defaults.headers.Authorization).toBe('Bearer z');
  });

  test('extractItemsAndNext handles arrays, object payloads and baseUrl-relative next links', () => {
    expect(extractItemsAndNext([{ id: 1 }])).toEqual({ items: [{ id: 1 }], next: null });

    const withResults = extractItemsAndNext(
      { results: [{ id: 2 }], next: 'https://api.test/sources/?page=2' },
      'https://api.test'
    );
    expect(withResults.items).toHaveLength(1);
    expect(withResults.next).toBe('/sources/?page=2');

    const withItems = extractItemsAndNext({ items: [{ id: 3 }] });
    expect(withItems).toEqual({ items: [{ id: 3 }], next: null });
  });

  test('fetchAllPages supports page mode and next-link mode', async () => {
    const pageCalls = [];
    const pageClient = {
      get: jest.fn(async (_path, opts) => {
        pageCalls.push(opts.params.page);
        if (opts.params.page === 1) {
          return { data: { results: [{ id: 'a' }, { id: 'b' }] } };
        }
        return { data: { results: [{ id: 'c' }] } };
      })
    };

    const paged = await fetchAllPages(pageClient, '/x', { pageSize: 2 });
    expect(paged.map(x => x.id)).toEqual(['a', 'b', 'c']);
    expect(pageCalls).toEqual([1, 2]);

    const nextCalls = [];
    const nextClient = {
      get: jest.fn(async (pathArg) => {
        nextCalls.push(pathArg);
        if (pathArg === '/x') {
          return {
            data: {
              results: [{ id: '1' }],
              next: 'https://api.test/x?page=2'
            }
          };
        }
        return {
          data: {
            results: [{ id: '2' }],
            next: null
          }
        };
      })
    };

    const byNext = await fetchAllPages(nextClient, '/x', {
      baseUrl: 'https://api.test',
      useNextLinks: true
    });
    expect(byNext.map(x => x.id)).toEqual(['1', '2']);
    expect(nextCalls).toEqual(['/x', '/x?page=2']);
  });

  test('fetchAllPages logs and rethrows fetch errors', async () => {
    const logger = { error: jest.fn() };
    const client = {
      get: jest.fn(async () => {
        throw new Error('boom');
      })
    };

    await expect(fetchAllPages(client, '/x', { logger, loggerPrefix: '[T]' })).rejects.toThrow('boom');
    expect(logger.error).toHaveBeenCalled();
  });

  test('cache path and cache utility helpers behave as expected', async () => {
    const s = sanitizeFilename('http://a/b?x=y#z');
    expect(s).toContain('http_a_b_x_y_z');

    const out = getCacheFilePath(path.join(CACHE_BASE_DIR, 'tmp'), 'http://example.org/vs', '1.0.0', 'f1');
    expect(out.endsWith('.json')).toBe(true);

    const dir = path.join(process.cwd(), 'data', 'terminology-cache', 'ocl', 'helper-test');
    await ensureCacheDirectories(dir);
    expect(fs.existsSync(dir)).toBe(true);

    const file = path.join(dir, 'age.json');
    await fsp.writeFile(file, '{}', 'utf8');
    const age = getColdCacheAgeMs(file);
    expect(age).not.toBeNull();
    expect(formatCacheAgeMinutes(60000)).toBe('1 minute');
    expect(formatCacheAgeMinutes(120000)).toBe('2 minutes');

    expect(getColdCacheAgeMs(path.join(dir, 'missing.json'))).toBeNull();

    const mkdirSpy = jest.spyOn(fsp, 'mkdir').mockRejectedValueOnce(new Error('mkdir-fail'));
    await expect(ensureCacheDirectories(path.join(dir, 'x'))).resolves.toBeUndefined();
    expect(mkdirSpy).toHaveBeenCalled();
  });

  test('fingerprints and concept mapper/filter context produce stable outputs', () => {
    const csFp1 = computeCodeSystemFingerprint([
      { code: 'b', display: 'B', definition: 'd', retired: false },
      { code: 'a', display: 'A', definition: 'd', retired: true }
    ]);
    const csFp2 = computeCodeSystemFingerprint([
      { code: 'a', display: 'A', definition: 'd', retired: true },
      { code: 'b', display: 'B', definition: 'd', retired: false }
    ]);
    expect(csFp1).toBe(csFp2);
    expect(computeCodeSystemFingerprint([])).toBeNull();
    expect(computeCodeSystemFingerprint([{ x: 1 }])).toBeNull();

    const vsFp = computeValueSetExpansionFingerprint({
      contains: [
        { system: 's', code: '1', display: 'one', inactive: false },
        { system: 's', code: '2', display: 'two', inactive: true }
      ]
    });
    expect(vsFp).toBeTruthy();
    expect(computeValueSetExpansionFingerprint({ contains: [] })).toBeNull();
    expect(computeValueSetExpansionFingerprint(null)).toBeNull();

    const concept = toConceptContext({
      code: '123',
      display_name: 'Main',
      description: 'Def',
      retired: true,
      names: [{ locale: 'en', name: 'Main' }, { locale: 'pt', name: 'Principal' }]
    });
    expect(concept.code).toBe('123');
    expect(concept.retired).toBe(true);
    expect(toConceptContext(null)).toBeNull();
    expect(toConceptContext({})).toBeNull();
    expect(extractDesignations({ names: [{ locale: 'en', name: 'A' }, { locale: 'en', name: 'A' }] })).toHaveLength(1);
    expect(extractDesignations({ locale_display_names: { 'pt-BR': 'Nome' } })).toEqual([
      { language: 'pt-BR', value: 'Nome' }
    ]);

    const set = new OCLConceptFilterContext();
    set.add({ code: 'b' }, 1);
    set.add({ code: 'a' }, 2);
    set.sort();
    expect(set.next().code).toBe('a');
    expect(set.findConceptByCode('b').code).toBe('b');
    set.reset();
    const item = set.next();
    expect(set.containsConcept(item)).toBe(true);
    set.next();
    expect(set.next()).toBeNull();
  });

  test('background queue enforces singleton keys, size ordering and progress formatting', async () => {
    OCLBackgroundJobQueue.MAX_CONCURRENT = 0;

    const first = OCLBackgroundJobQueue.enqueue('j1', 'job', async () => {}, { jobSize: 10 });
    const duplicate = OCLBackgroundJobQueue.enqueue('j1', 'job', async () => {}, { jobSize: 1 });
    OCLBackgroundJobQueue.enqueue('j2', 'job', async () => {}, { jobSize: 2 });
    OCLBackgroundJobQueue.enqueue('j3', 'job', async () => {}, { jobSize: 5 });

    await global.TestUtils.delay(10);

    expect(first).toBe(true);
    expect(duplicate).toBe(false);
    expect(OCLBackgroundJobQueue.pendingJobs.map(j => j.jobSize)).toEqual([2, 5, 10]);

    expect(OCLBackgroundJobQueue.formatProgress(() => 51.2)).toBe('51%');
    expect(OCLBackgroundJobQueue.formatProgress(() => ({ processed: 25, total: 100 }))).toBe('25%');
    expect(OCLBackgroundJobQueue.formatProgress(() => ({ percentage: 120 }))).toBe('100%');
    expect(OCLBackgroundJobQueue.formatProgress(() => { throw new Error('x'); })).toBe('unknown');

    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    OCLBackgroundJobQueue.logHeartbeat();
    expect(spy).toHaveBeenCalled();
  });

  test('background queue processes jobs and handles failures', async () => {
    OCLBackgroundJobQueue.MAX_CONCURRENT = 1;
    const completed = [];

    OCLBackgroundJobQueue.enqueue('qa', 'job', async () => {
      completed.push('a');
    }, { jobSize: 1 });

    OCLBackgroundJobQueue.enqueue('qb', 'job', async () => {
      completed.push('b');
      throw new Error('expected');
    }, { jobSize: 2 });

    await global.TestUtils.waitFor(() => completed.length === 2, 2000);
    await global.TestUtils.waitFor(() => OCLBackgroundJobQueue.activeCount === 0, 2000);
    expect(OCLBackgroundJobQueue.pendingJobs.length).toBe(0);
  });

  test('patches integrate code filtering and TxParameters hash filter extension', () => {
    jest.resetModules();

    const { patchSearchWorkerForOCLCodeFiltering, ensureTxParametersHashIncludesFilter, normalizeFilterForCacheKey } = require('../../tx/ocl/shared/patches');
    const SearchWorker = require('../../tx/workers/search');

    const originalSearchCodeSystems = SearchWorker.prototype.searchCodeSystems;
    SearchWorker.prototype.searchCodeSystems = function () {
      return [
        {
          url: 'http://test/cs',
          extension: [{ url: OCL_CODESYSTEM_MARKER_EXTENSION, valueBoolean: true }],
          concept: [
            { code: 'A', display: 'Alpha', concept: [{ code: 'A1' }] },
            { code: 'B', display: 'Beta' }
          ]
        },
        {
          url: 'http://test/non-ocl',
          concept: [{ code: 'X' }]
        }
      ];
    };

    try {
      patchSearchWorkerForOCLCodeFiltering();
      // idempotence path
      patchSearchWorkerForOCLCodeFiltering();

      const worker = Object.create(SearchWorker.prototype);
      const filtered = worker.searchCodeSystems({ code: 'A1' });
      expect(filtered).toHaveLength(2);
      expect(filtered[0].concept[0].code).toBe('A');
      expect(filtered[0].concept[0].concept[0].code).toBe('A1');

      const filteredNone = worker.searchCodeSystems({ code: 'missing' });
      expect(filteredNone).toHaveLength(1);
      expect(filteredNone[0].url).toBe('http://test/non-ocl');
    } finally {
      SearchWorker.prototype.searchCodeSystems = originalSearchCodeSystems;
    }

    class TxParameters {
      constructor() {
        this.filter = '  TeSt  ';
      }

      hashSource() {
        return 'base';
      }
    }

    ensureTxParametersHashIncludesFilter(TxParameters);
    const p = new TxParameters();
    expect(p.hashSource()).toBe('base|filter=test');
    expect(normalizeFilterForCacheKey('  ABC ')).toBe('abc');
  });

  test('patchSearchWorkerForOCLCodeFiltering is safe when worker cannot be loaded', () => {
    jest.resetModules();
    jest.isolateModules(() => {
      jest.doMock('../../tx/workers/search', () => {
        throw new Error('no-worker');
      }, { virtual: true });

      const { patchSearchWorkerForOCLCodeFiltering } = require('../../tx/ocl/shared/patches');
      expect(() => patchSearchWorkerForOCLCodeFiltering()).not.toThrow();
    });
  });
});
