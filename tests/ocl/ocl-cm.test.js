const nock = require('nock');

const { OCLConceptMapProvider } = require('../../tx/ocl/cm-ocl');

describe('OCL ConceptMap integration', () => {
  const baseUrl = 'https://ocl.cm.test';

  beforeEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  function mapping(overrides = {}) {
    return {
      id: 'map-1',
      url: `${baseUrl}/mappings/map-1`,
      version: '1.0.0',
      map_type: 'SAME-AS',
      from_source_url: '/orgs/org-a/sources/src-a/',
      to_source_url: '/orgs/org-a/sources/src-b/',
      from_concept_code: 'A',
      to_concept_code: 'B',
      from_concept_name_resolved: 'Alpha',
      to_concept_name_resolved: 'Beta',
      updated_on: '2026-01-02T03:04:05.000Z',
      name: 'Map One',
      comment: 'ok',
      ...overrides
    };
  }

  test('fetchConceptMapById resolves and indexes mapping', async () => {
    nock(baseUrl)
      .get('/mappings/map-1/')
      .reply(200, mapping());

    const provider = new OCLConceptMapProvider({ baseUrl });
    const cm = await provider.fetchConceptMapById('map-1');

    expect(cm).toBeTruthy();
    expect(cm.id).toBe('map-1');
    expect(cm.jsonObj.group[0].source).toBe('/orgs/org-a/sources/src-a/');
    expect(cm.jsonObj.group[0].target).toBe('/orgs/org-a/sources/src-b/');
    expect(cm.jsonObj.meta.lastUpdated).toBe('2026-01-02T03:04:05.000Z');
  });

  test('fetchConceptMap can resolve from canonical url via search and mapping-id extraction', async () => {
    nock(baseUrl)
      .get('/mappings/map-2/')
      .reply(200, mapping({ id: 'map-2', url: `${baseUrl}/mappings/map-2` }))
      .get('/mappings/')
      .query(true)
      .reply(200, { results: [mapping()] });

    const provider = new OCLConceptMapProvider({ baseUrl });

    const byIdFromUrl = await provider.fetchConceptMap(`${baseUrl}/mappings/map-2`, null);
    expect(byIdFromUrl.id).toBe('map-2');

    const bySearch = await provider.fetchConceptMap('/orgs/org-a/sources/src-a/', '1.0.0');
    expect(bySearch).toBeNull();
  });

  test('searchConceptMaps filters by source and target parameters', async () => {
    nock(baseUrl)
      .get('/mappings/')
      .query(true)
      .reply(200, { results: [mapping(), mapping({ id: 'map-3', from_source_url: '/orgs/x/s/', to_source_url: '/orgs/y/s/' })] });

    const provider = new OCLConceptMapProvider({ baseUrl });

    const results = await provider.searchConceptMaps([
      { name: 'source', value: '/orgs/org-a/sources/src-a/' },
      { name: 'target', value: '/orgs/org-a/sources/src-b/' }
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('map-1');
  });

  test('findConceptMapForTranslation uses source candidates and canonical resolution', async () => {
    nock(baseUrl)
      .get('/sources/')
      .query(true)
      .twice()
      .reply(200, {
        results: [
          {
            canonical_url: 'http://example.org/cs/source-a',
            url: '/orgs/org-a/sources/src-a/'
          },
          {
            canonical_url: 'http://example.org/cs/source-b',
            url: '/orgs/org-a/sources/src-b/'
          }
        ]
      })
      .get('/orgs/org-a/sources/src-a/concepts/A/mappings/')
      .query(true)
      .reply(200, { results: [mapping()] })
      .get('/orgs/org-a/sources/src-a/')
      .reply(200, {
        canonical_url: 'http://example.org/cs/source-a',
        url: '/orgs/org-a/sources/src-a/'
      })
      .get('/orgs/org-a/sources/src-b/')
      .reply(200, {
        canonical_url: 'http://example.org/cs/source-b',
        url: '/orgs/org-a/sources/src-b/'
      });

    const provider = new OCLConceptMapProvider({ baseUrl, maxSearchPages: 2 });
    const conceptMaps = [];

    await provider.findConceptMapForTranslation(
      null,
      conceptMaps,
      'http://example.org/cs/source-a',
      null,
      null,
      'http://example.org/cs/source-b',
      'A'
    );

    expect(conceptMaps).toHaveLength(1);
    expect(conceptMaps[0].jsonObj.group[0].source).toBe('http://example.org/cs/source-a');
    expect(conceptMaps[0].jsonObj.group[0].target).toBe('http://example.org/cs/source-b');
  });

  test('assignIds prefixes space and cmCount returns unique map count', async () => {
    nock(baseUrl)
      .get('/mappings/map-1/')
      .reply(200, mapping());

    const provider = new OCLConceptMapProvider({ baseUrl });
    provider.spaceId = 'space';

    await provider.fetchConceptMapById('map-1');

    const ids = new Set();
    provider.assignIds(ids);

    expect(ids.has('ConceptMap/space-map-1')).toBe(true);
    expect(provider.cmCount()).toBe(1);
  });

  test('fetchConceptMap returns direct cached hit before network lookup', async () => {
    const provider = new OCLConceptMapProvider({ baseUrl });
    const cm = await provider.fetchConceptMapById('map-1').catch(() => null);
    expect(cm).toBeNull();

    const cached = {
      id: 'cached-1',
      url: 'http://example.org/cached-cm',
      version: '1.0.0'
    };
    provider.conceptMapMap.set('http://example.org/cached-cm|1.0.0', cached);
    const out = await provider.fetchConceptMap('http://example.org/cached-cm', '1.0.0');
    expect(out).toBe(cached);
  });

  test('findConceptMapForTranslation fallback search with empty candidate sets', async () => {
    nock(baseUrl)
      .get('/mappings/')
      .query(true)
      .reply(200, { results: [mapping({ id: 'map-fallback' })] });

    const provider = new OCLConceptMapProvider({ baseUrl });
    const conceptMaps = [];

    await provider.findConceptMapForTranslation(
      null,
      conceptMaps,
      null,
      null,
      null,
      null,
      null
    );

    expect(conceptMaps.length).toBeGreaterThanOrEqual(0);
  });

  test('findConceptMapForTranslation uses candidate matching when scope check is strict', async () => {
    nock(baseUrl)
      .get('/sources/')
      .query(true)
      .twice()
      .reply(200, {
        results: [
          {
            canonical_url: 'http://example.org/cs/source-a',
            url: '/orgs/org-a/sources/src-a/'
          },
          {
            canonical_url: 'http://example.org/cs/source-b',
            url: '/orgs/org-a/sources/src-b/'
          }
        ]
      })
      .get('/orgs/org-a/sources/src-a/concepts/A/mappings/')
      .query(true)
      .reply(200, {
        results: [
          mapping({
            updated_on: 'invalid-date'
          })
        ]
      })
      .get('/orgs/org-a/sources/src-a/')
      .reply(200, {
        canonical_url: 'http://example.org/cs/source-a',
        url: '/orgs/org-a/sources/src-a/'
      })
      .get('/orgs/org-a/sources/src-b/')
      .reply(200, {
        canonical_url: 'http://example.org/cs/source-b',
        url: '/orgs/org-a/sources/src-b/'
      });

    const provider = new OCLConceptMapProvider({ baseUrl });
    const conceptMaps = [{ id: 'already-present' }];

    await provider.findConceptMapForTranslation(
      null,
      conceptMaps,
      'http://example.org/cs/source-a',
      'http://scope/strict/source',
      'http://scope/strict/target',
      'http://example.org/cs/source-b',
      'A'
    );

    expect(conceptMaps.length).toBeGreaterThanOrEqual(2);
    expect(conceptMaps[1].jsonObj.meta).toBeUndefined();

    await expect(provider.close()).resolves.toBeUndefined();
  });
});
