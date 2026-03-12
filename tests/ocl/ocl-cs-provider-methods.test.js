const nock = require('nock');

const { OperationContext } = require('../../tx/operation-context');
const { Designations } = require('../../tx/library/designations');
const { OCLSourceCodeSystemFactory, OCLBackgroundJobQueue } = require('../../tx/ocl/cs-ocl');
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

describe('OCL CodeSystem provider runtime methods', () => {
  const baseUrl = 'https://ocl.cs.methods.test';
  const conceptsUrl = `${baseUrl}/orgs/org-a/sources/src1/concepts/`;
  let i18n;
  let langDefs;

  beforeAll(async () => {
    langDefs = await TestUtilities.loadLanguageDefinitions();
    i18n = await TestUtilities.loadTranslations(langDefs);
  });

  beforeEach(() => {
    nock.cleanAll();
    OCLSourceCodeSystemFactory.factoriesByKey.clear();
    resetQueueState();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  function createFactoryMeta() {
    return {
      id: 'src1',
      canonicalUrl: 'http://example.org/cs/source-one',
      version: '2026.1',
      name: 'Source One',
      description: 'Desc',
      checksum: 'chk-1',
      conceptsUrl,
      codeSystem: {
        jsonObj: {
          property: [{ code: 'display' }, { code: 'definition' }, { code: 'inactive' }],
          content: 'not-present'
        }
      }
    };
  }

  test('runtime provider methods cover lookup/filter/iteration paths', async () => {
    nock(baseUrl)
      .get('/orgs/org-a/sources/src1/concepts/C1/')
      .reply(200, {
        code: 'C1',
        display_name: 'Alpha Display',
        description: 'Alpha Definition',
        retired: false,
        names: [{ locale: 'en', name: 'Alpha Display' }]
      })
      .get('/orgs/org-a/sources/src1/concepts/C404/')
      .reply(404)
      .get('/orgs/org-a/sources/src1/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, {
        results: [
          { code: 'C1', display_name: 'Alpha Display', description: 'Alpha Definition', retired: false },
          { code: 'C2', display_name: 'Beta Display', description: 'Beta Definition', retired: true }
        ]
      })
      .get('/orgs/org-a/sources/src1/concepts/')
      .query(q => Number(q.page) === 2 && Number(q.limit) === 1000)
      .reply(200, { results: [] });

    const factory = new OCLSourceCodeSystemFactory(i18n, require('axios').create({ baseURL: baseUrl }), createFactoryMeta());
    const opContext = new OperationContext('en-US', i18n);
    const provider = factory.build(opContext, []);

    expect(provider.system()).toBe('http://example.org/cs/source-one');
    expect(provider.version()).toBe('2026.1');
    expect(provider.description()).toBe('Desc');
    expect(provider.name()).toBe('Source One');
    expect(provider.contentMode()).toBe('not-present');
    expect(provider.totalCount()).toBeGreaterThanOrEqual(-1);

    expect((await provider.locate('')).message).toContain('Empty code');
    const notFound = await provider.locate('C404');
    expect(notFound.context).toBeNull();

    expect(await provider.code('C1')).toBe('C1');
    expect(await provider.display('C1')).toBe('Alpha Display');
    expect(await provider.definition('C1')).toBe('Alpha Definition');
    expect(await provider.isAbstract('C1')).toBe(false);
    expect(await provider.isDeprecated('C1')).toBe(false);
    expect(await provider.getStatus('C1')).toBe('active');
    expect(await provider.isInactive('C2')).toBe(true);

    const displays = new Designations(langDefs);
    await provider.designations('C1', displays);
    expect(displays.designations.length).toBeGreaterThan(0);

    const iter = await provider.iteratorAll();
    const seen = [];
    let next = await provider.nextContext(iter);
    while (next) {
      seen.push(next.code);
      next = await provider.nextContext(iter);
    }
    expect(seen).toEqual(expect.arrayContaining(['C1', 'C2']));

    expect(await provider.doesFilter('display', '=', 'x')).toBe(true);
    expect(await provider.doesFilter('inactive', 'in', 'true,false')).toBe(true);
    expect(await provider.doesFilter('unknown', '=', 'x')).toBe(false);
    expect(await provider.doesFilter('display', 'contains', 'x')).toBe(false);

    const prep = await provider.getPrepContext(iter);
    await provider.searchFilter(prep, 'Alpha', true);
    const fromSearch = await provider.executeFilters(prep);
    expect(await provider.filterSize(prep, fromSearch[0])).toBeGreaterThanOrEqual(1);

    const inactiveSet = await provider.filter(prep, 'inactive', '=', 'true');
    expect(await provider.filterMore(prep, inactiveSet)).toBe(true);
    const concept = await provider.filterConcept(prep, inactiveSet);
    expect(concept.code).toBe('C2');
    expect(await provider.filterLocate(prep, inactiveSet, 'C2')).toBeTruthy();
    expect(await provider.filterCheck(prep, inactiveSet, concept)).toBe(true);

    const regexSet = await provider.filter(prep, 'display', 'regex', '^Alpha');
    expect(await provider.filterSize(prep, regexSet)).toBeGreaterThanOrEqual(1);

    const inSet = await provider.filter(prep, 'code', 'in', 'C1,C3');
    expect(await provider.filterSize(prep, inSet)).toBe(1);

    const defSet = await provider.filter(prep, 'definition', '=', 'Alpha Definition');
    expect(await provider.filterSize(prep, defSet)).toBe(1);

    await expect(provider.filter(prep, 'display', 'contains', 'x')).rejects.toThrow('not supported');

    const exec = await provider.executeFilters(prep);
    expect(Array.isArray(exec)).toBe(true);

    await provider.filterFinish(prep);
    expect(prep.filters).toHaveLength(0);

    // Exercise #ensureContext promise/wrapper path.
    const wrapped = Promise.resolve({ context: { code: 'Z1', display: 'Wrapped', retired: false } });
    expect(await provider.display(wrapped)).toBe('Wrapped');
  });

  test('factory statics and no-concepts warm load paths are exercised', async () => {
    const meta = {
      id: 'src-null',
      canonicalUrl: 'http://example.org/cs/null',
      version: null,
      name: 'Null Source',
      checksum: null,
      conceptsUrl: null,
      codeSystem: { jsonObj: { content: 'not-present' } }
    };

    const factory = new OCLSourceCodeSystemFactory(i18n, { get: jest.fn() }, meta);

    expect(factory.defaultVersion()).toBeNull();
    expect(factory.system()).toBe('http://example.org/cs/null');
    expect(factory.name()).toBe('Null Source');
    expect(factory.id()).toBe('src-null');
    expect(factory.iteratable()).toBe(true);
    expect(factory.isCompleteNow()).toBe(false);

    const missing = OCLSourceCodeSystemFactory.scheduleBackgroundLoadByKey('http://missing', null, 'x');
    expect(missing).toBe(false);
    expect(OCLSourceCodeSystemFactory.checksumForResource('http://missing', null)).toBeNull();

    OCLSourceCodeSystemFactory.syncCodeSystemResource(null, null, null);

    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockImplementation((jobKey, jobType, runJob) => {
      Promise.resolve(runJob()).finally(() => {
        OCLBackgroundJobQueue.queuedOrRunningKeys.delete(jobKey);
      });
      return true;
    });

    factory.scheduleBackgroundLoad('no-concepts');
    await global.TestUtils.waitFor(() => factory.isCompleteNow() === true, 2000);

    const progress = OCLSourceCodeSystemFactory.loadProgress();
    expect(progress.total).toBeGreaterThan(0);
    expect(progress.loaded).toBeGreaterThan(0);
  });

  test('scheduleBackgroundLoad exposes queue progress callbacks', async () => {
    const meta = {
      id: 'src-cb',
      canonicalUrl: 'http://example.org/cs/callbacks',
      version: '1.0.0',
      name: 'Callback Source',
      checksum: null,
      conceptsUrl: `${baseUrl}/orgs/org-a/sources/src-cb/concepts/`,
      codeSystem: { jsonObj: { content: 'not-present' } }
    };

    const client = {
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: { results: [] } })
        .mockResolvedValueOnce({ data: { results: [] }, headers: { 'num-found': 'abc' } })
    };

    const factory = new OCLSourceCodeSystemFactory(i18n, client, meta);

    const enqueueSpy = jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockImplementation((jobKey, jobType, runJob, options = {}) => {
      if (typeof options.getProgress === 'function') {
        options.getProgress();
      }
      if (typeof options.resolveJobSize === 'function') {
        options.resolveJobSize();
      }
      return true;
    });

    factory.scheduleBackgroundLoad('callbacks');
    factory.scheduleBackgroundLoad('callbacks-2');
    expect(enqueueSpy).toHaveBeenCalled();
    expect(factory.currentChecksum()).toBeNull();
  });
});
