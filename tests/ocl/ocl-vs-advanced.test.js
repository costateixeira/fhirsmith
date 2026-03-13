const nock = require('nock');

const ValueSet = require('../../tx/library/valueset');
const { OCLValueSetProvider } = require('../../tx/ocl/vs-ocl');
const { OCLBackgroundJobQueue } = require('../../tx/ocl/cs-ocl');

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

describe('OCL ValueSet advanced provider behavior', () => {
  const baseUrl = 'https://ocl.vs.advanced.test';
  const PAGE_SIZE = 100;

  beforeEach(() => {
    nock.cleanAll();
    resetQueueState();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  test('sourcePackage, assignIds with and without spaceId, and search/list methods', async () => {
    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    provider._initialized = true;
    expect(provider.sourcePackage()).toBe(`ocl:${baseUrl}|org=org-a`);

    const vs = new ValueSet({
      resourceType: 'ValueSet',
      id: 'vs1',
      url: 'http://example.org/vs/1',
      version: '1.2.3',
      name: 'VS1',
      status: 'active'
    }, 'R5');

    provider.valueSetMap.set(vs.url, vs);
    provider.valueSetMap.set(`${vs.url}|${vs.version}`, vs);
    provider.valueSetMap.set(vs.id, vs);

    const idsNoSpace = new Set();
    provider.assignIds(idsNoSpace);
    expect(idsNoSpace.size).toBe(0);

    provider.spaceId = 'S';
    const ids = new Set();
    provider.assignIds(ids);
    expect(ids.has('ValueSet/S-vs1')).toBe(true);

    const all = await provider.searchValueSets([]);
    expect(all).toHaveLength(1);
    expect(provider.vsCount()).toBe(1);
    expect(await provider.listAllValueSets()).toEqual(['http://example.org/vs/1']);
  });

  test('fetchValueSet resolves semver major.minor and fetchValueSetById handles prefixed ids', async () => {
    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    const vs = new ValueSet({
      resourceType: 'ValueSet',
      id: 'vs1',
      url: 'http://example.org/vs/1',
      version: '1.2',
      name: 'VS1',
      status: 'active',
      compose: { include: [{ system: 'http://example.org/cs/1' }] }
    }, 'R5');

    provider.valueSetMap.set(vs.url, vs);
    provider.valueSetMap.set(`${vs.url}|${vs.version}`, vs);
    provider.valueSetMap.set(vs.id, vs);
    provider._idMap.set(vs.id, vs);

    const bySemver = await provider.fetchValueSet(vs.url, '1.2.9');
    expect(bySemver).toBeTruthy();
    expect(bySemver.version).toBe('1.2');

    provider.spaceId = 'X';
    provider._idMap.set('X-vs1', vs);
    const byPrefixedId = await provider.fetchValueSetById('X-vs1');
    expect(byPrefixedId).toBeTruthy();
  });

  test('canonical resolution path uses collection search and semver fallback', async () => {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [{ id: 'org-a' }] })
      .get('/orgs/org-a/collections/')
      .query(q => q.q === 'my-vs')
      .reply(200, {
        results: [
          {
            id: 'col-vs',
            owner: 'org-a',
            owner_type: 'Organization',
            canonical_url: 'http://example.org/vs/my-vs',
            version: '2.1',
            name: 'My VS',
            concepts_url: '/orgs/org-a/collections/col-vs/concepts/'
          }
        ]
      })
      .get('/orgs/org-a/collections/col-vs/concepts/')
      .query(true)
      .reply(200, { results: [] });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    const resolved = await provider.fetchValueSet('http://example.org/vs/my-vs', '2.1.5');
    expect(resolved).toBeTruthy();
    expect(resolved.url).toBe('http://example.org/vs/my-vs');
    expect(resolved.version).toBe('2.1');
  });

  test('compose include fallback via concepts listing and source canonical lookup', async () => {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [{ id: 'org-a' }] })
      .get('/orgs/org-a/collections/')
      .query(true)
      .reply(200, {
        results: [
          {
            id: 'col2',
            owner: 'org-a',
            owner_type: 'Organization',
            canonical_url: 'http://example.org/vs/compose',
            version: '1.0.0',
            name: 'Compose VS',
            concepts_url: '/orgs/org-a/collections/col2/concepts/',
            expansion_url: '/orgs/org-a/collections/col2/HEAD/expansions/autoexpand-HEAD/'
          }
        ]
      })
      .get('/orgs/org-a/collections/col2/HEAD/expansions/autoexpand-HEAD/')
      .reply(500)
      .get('/orgs/org-a/collections/col2/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, {
        results: [
          { owner: 'org-a', source: 'src-a', code: 'A' },
          { owner: 'org-a', source: 'src-b', code: 'B' }
        ]
      })
      .get('/orgs/org-a/collections/col2/concepts/')
      .query(q => Number(q.page) === 2 && Number(q.limit) === 1000)
      .reply(200, { results: [] })
      .get('/orgs/org-a/sources/src-a/')
      .reply(200, { canonical_url: 'http://example.org/cs/src-a' })
      .get('/orgs/org-a/sources/src-b/')
      .reply(200, { canonical_url: 'http://example.org/cs/src-b' });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    await provider.initialize();
    const vs = await provider.fetchValueSet('http://example.org/vs/compose', '1.0.0');
    expect(vs.jsonObj.compose.include.length).toBe(2);
  });

  test('cached expansion invalidates when metadata signature/dependencies mismatch', async () => {
    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    const vs = new ValueSet({
      resourceType: 'ValueSet',
      id: 'vs-invalid',
      url: 'http://example.org/vs/invalid',
      version: '1.0.0',
      name: 'Invalid Cache VS',
      status: 'active',
      compose: { include: [{ system: 'http://example.org/cs/src-a' }] }
    }, 'R5');

    provider.valueSetMap.set(vs.url, vs);
    provider.valueSetMap.set(`${vs.url}|${vs.version}`, vs);
    provider.valueSetMap.set(vs.id, vs);

    const crypto = require('crypto');
    const base = `${vs.url}|${vs.version}|default`;
    const cacheKey = crypto.createHash('sha256').update(base).digest('hex');
    provider.backgroundExpansionCache.set(cacheKey, {
      expansion: { contains: [{ system: 'x', code: '1' }] },
      metadataSignature: 'stale-signature',
      dependencyChecksums: {},
      createdAt: Date.now() - 7200000
    });

    const out = await provider.fetchValueSet(vs.url, vs.version);
    expect(out).toBeTruthy();
    expect(provider.backgroundExpansionCache.has(cacheKey)).toBe(false);
  });

  test('validation and fallback discovery branches', async () => {
    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    provider._initialized = true;

    await expect(provider.fetchValueSet('', null)).rejects.toThrow('URL must be a non-empty string');
    await expect(provider.searchValueSets('bad')).rejects.toThrow('Search parameters must be an array');

    const providerFallback = new OCLValueSetProvider({ baseUrl });
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [] })
      .get('/collections/')
      .query(true)
      .reply(200, {
        results: [
          {
            id: 'col-fallback',
            owner: 'org-a',
            owner_type: 'Organization',
            canonical_url: 'http://example.org/vs/fallback',
            version: '1.0.0',
            name: 'Fallback VS'
          }
        ]
      });

    await providerFallback.initialize();
    expect(providerFallback.vsCount()).toBeGreaterThan(0);
  });

  test('searchValueSets matches system and identifier fields', async () => {
    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    provider._initialized = true;

    const vs = new ValueSet({
      resourceType: 'ValueSet',
      id: 'vs-system-id',
      url: 'http://example.org/vs/system-id',
      version: '1.0.0',
      identifier: [{ system: 'urn:sys', value: 'ABC-123' }],
      compose: { include: [{ system: 'http://example.org/cs/target' }] }
    }, 'R5');

    provider.valueSetMap.set(vs.url, vs);
    provider.valueSetMap.set(`${vs.url}|${vs.version}`, vs);

    const found = await provider.searchValueSets([
      { name: 'system', value: 'cs/target' },
      { name: 'identifier', value: 'abc-123' }
    ]);

    expect(found).toHaveLength(1);
    expect(found[0].id).toBe('vs-system-id');
  });

  test('localized sorting and invalid updated_on handling are exercised', async () => {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [{ id: 'org-a' }] })
      .get('/orgs/org-a/collections/')
      .query(true)
      .reply(200, {
        results: [
          {
            id: 'col-loc',
            owner: 'org-a',
            owner_type: 'Organization',
            canonical_url: 'http://example.org/vs/localized',
            version: '1.0.0',
            updated_on: 'invalid-date-value',
            concepts_url: '/orgs/org-a/collections/col-loc/concepts/'
          }
        ]
      })
      .get('/orgs/org-a/collections/col-loc/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, {
        results: [
          {
            owner: 'org-a',
            source: 'src-a',
            code: 'C1'
          }
        ]
      })
      .get('/orgs/org-a/collections/col-loc/concepts/')
      .query(q => Number(q.page) === 2 && Number(q.limit) === 1000)
      .reply(200, { results: [] })
      .get('/orgs/org-a/collections/col-loc/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 200 && String(q.verbose) === 'true')
      .reply(200, {
        results: [
          {
            owner: 'org-a',
            source: 'src-a',
            code: 'C1',
            names: [
              { locale: 'pt-BR', name: 'Termo', name_type: 'Synonym' },
              { locale: 'en', name: 'Term', name_type: 'Fully Specified Name', locale_preferred: true },
              { locale: 'en', name: 'Term Variant', name_type: 'Synonym' }
            ],
            descriptions: [
              { locale: 'pt-BR', description: 'Descricao', description_type: 'Text' },
              { locale: 'en', description: 'Definition EN', description_type: 'Definition', locale_preferred: true },
              { locale: 'en', description: 'Other EN', description_type: 'Note' }
            ]
          }
        ]
      })
      .get('/orgs/org-a/sources/src-a/')
      .reply(200, { canonical_url: 'http://example.org/cs/src-a' });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockReturnValue(true);

    await provider.initialize();
    const vs = await provider.fetchValueSet('http://example.org/vs/localized', '1.0.0');
    expect(vs.jsonObj.meta).toBeUndefined();

    const out = await vs.oclFetchConcepts({
      count: 5,
      offset: 0,
      activeOnly: false,
      filter: 'term',
      languageCodes: ['en', 'pt-BR']
    });

    expect(out.contains).toHaveLength(1);
    expect(out.contains[0].display).toBe('Term');
    expect(out.contains[0].definition).toBe('Definition EN');
    expect(out.contains[0].designation.length).toBeGreaterThan(1);
    expect(out.contains[0].definitions.length).toBeGreaterThan(1);

    await expect(provider.close()).resolves.toBeUndefined();
  });

  test('warm-up enqueue exposes progress callbacks and remote query chooses longest token', async () => {
    nock(baseUrl)
      .get('/orgs/')
      .query(true)
      .reply(200, { results: [{ id: 'org-a' }] })
      .get('/orgs/org-a/collections/')
      .query(true)
      .reply(200, {
        results: [
          {
            id: 'col-q',
            owner: 'org-a',
            owner_type: 'Organization',
            canonical_url: 'http://example.org/vs/q',
            version: '1.0.0',
            concepts_url: '/orgs/org-a/collections/col-q/concepts/'
          }
        ]
      })
      .get('/orgs/org-a/collections/col-q/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 1000)
      .reply(200, { results: [] })
      .get('/orgs/org-a/collections/col-q/concepts/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === 200 && String(q.verbose) === 'true' && q.q === 'alphabet')
      .reply(200, {
        results: [
          { code: 'X1', owner: 'org-a', source: 'src-a', display_name: 'Alphabet term', retired: false }
        ]
      });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    const enqueueSpy = jest.spyOn(OCLBackgroundJobQueue, 'enqueue').mockImplementation((jobKey, jobType, runJob, options = {}) => {
      if (typeof options.getProgress === 'function') {
        options.getProgress();
      }
      if (typeof options.resolveJobSize === 'function') {
        options.resolveJobSize();
      }
      return true;
    });

    await provider.initialize();
    const vs = await provider.fetchValueSet('http://example.org/vs/q', '1.0.0');
    const out = await vs.oclFetchConcepts({
      count: 10,
      offset: 0,
      filter: 'abc or alphabet',
      activeOnly: false
    });

    expect(enqueueSpy).toHaveBeenCalled();
    expect(out.contains).toHaveLength(1);
  });

  test('collection discovery paginates across PAGE_SIZE boundary', async () => {
    const page1 = Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: `col-p1-${i}`,
      owner: 'org-a',
      owner_type: 'Organization',
      canonical_url: `http://example.org/vs/p1/${i}`,
      version: '1.0.0',
      updated_on: '2026-02-03T04:05:06.000Z',
      concepts_url: `/orgs/org-a/collections/col-p1-${i}/concepts/`
    }));

    nock(baseUrl)
      .get('/orgs/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === PAGE_SIZE)
      .reply(200, { results: [{ id: 'org-a' }] })
      .get('/orgs/org-a/collections/')
      .query(q => Number(q.page) === 1 && Number(q.limit) === PAGE_SIZE)
      .reply(200, { results: page1 })
      .get('/orgs/org-a/collections/')
      .query(q => Number(q.page) === 2 && Number(q.limit) === PAGE_SIZE)
      .reply(200, { results: [] });

    const provider = new OCLValueSetProvider({ baseUrl, org: 'org-a' });
    await provider.initialize();

    expect(provider.vsCount()).toBeGreaterThanOrEqual(PAGE_SIZE);
    const found = await provider.searchValueSets([{ name: 'url', value: 'http://example.org/vs/p1/0' }]);
    expect(found).toHaveLength(1);
    expect(found[0].jsonObj.meta.lastUpdated).toBe('2026-02-03T04:05:06.000Z');
  });
});
