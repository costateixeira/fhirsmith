/**
 * Search Worker Integration Tests
 * 
 * Tests GET /tx/r5/CodeSystem and GET /tx/r5/ValueSet search operations
 */

const request = require('supertest');
const { getTestApp, shutdownTestApp } = require('./setup');

describe('Search Worker', () => {
  let app;

  beforeAll(async () => {
    app = await getTestApp();
  }, 60000);

  afterAll(async () => {
    await shutdownTestApp();
  });

  describe('GET /tx/r5/CodeSystem', () => {
    test('should return Bundle with all CodeSystems when no params', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.entry).toBeDefined();
      expect(response.body.link).toBeDefined();
    });

    test('should search by url', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ url: 'http://hl7.org/fhir/administrative-gender' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.total).toBeGreaterThanOrEqual(1);
      
      const entry = response.body.entry.find(e => 
        e.resource.url === 'http://hl7.org/fhir/administrative-gender'
      );
      expect(entry).toBeDefined();
    });

    test('should search by name (partial match)', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ name: 'gender' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThanOrEqual(1);
    });

    test('should support pagination with _count and _offset', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _count: 5, _offset: 0 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.entry.length).toBeLessThanOrEqual(5);
      
      // Check pagination links
      const selfLink = response.body.link.find(l => l.relation === 'self');
      expect(selfLink).toBeDefined();
      expect(selfLink.url).toContain('_offset=0');
      
      const firstLink = response.body.link.find(l => l.relation === 'first');
      expect(firstLink).toBeDefined();
    });

    test('should include next link when more results exist', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _count: 2, _offset: 0 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      
      if (response.body.total > 2) {
        const nextLink = response.body.link.find(l => l.relation === 'next');
        expect(nextLink).toBeDefined();
        expect(nextLink.url).toContain('_offset=2');
      }
    });

    test('should support _elements parameter', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _elements: 'url,version,name', _count: 5 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      
      if (response.body.entry && response.body.entry.length > 0) {
        const resource = response.body.entry[0].resource;
        expect(resource.resourceType).toBe('CodeSystem');
        expect(resource.id).toBeDefined(); // Always included
        // Should have requested elements
        expect(resource.url).toBeDefined();
        // Should NOT have full content (compose, concept, etc.)
        expect(resource.concept).toBeUndefined();
      }
    });

    test('should support _sort parameter', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _sort: 'name', _count: 10 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      
      if (response.body.entry && response.body.entry.length > 1) {
        const names = response.body.entry
          .map(e => e.resource.name || '')
          .filter(n => n);
        
        // Check sorted
        const sorted = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).toEqual(sorted);
      }
    });
  });

  describe('GET /tx/r5/ValueSet', () => {
    test('should return Bundle with ValueSets', async () => {
      const response = await request(app)
        .get('/tx/r5/ValueSet')
        .query({ _count: 10 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');
      expect(response.body.total).toBeGreaterThan(0);
    });

    test('should search ValueSet by url', async () => {
      const response = await request(app)
        .get('/tx/r5/ValueSet')
        .query({ url: 'http://hl7.org/fhir/ValueSet/administrative-gender' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThanOrEqual(1);
    });

    test('should search ValueSet by status', async () => {
      const response = await request(app)
        .get('/tx/r5/ValueSet')
        .query({ status: 'active', _count: 10 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      
      // All returned should have active status
      for (const entry of response.body.entry || []) {
        expect(entry.resource.status).toBe('active');
      }
    });
  });

  describe('POST /tx/r5/CodeSystem/_search', () => {
    test('should support POST search', async () => {
      const response = await request(app)
        .post('/tx/r5/CodeSystem/_search')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('name=gender&_count=5');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
    });
  });

  describe('Bundle structure', () => {
    test('should have correct entry structure', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ url: 'http://hl7.org/fhir/administrative-gender' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      
      if (response.body.entry && response.body.entry.length > 0) {
        const entry = response.body.entry[0];
        expect(entry.fullUrl).toBeDefined();
        expect(entry.fullUrl).toContain('/tx/r5/CodeSystem/');
        expect(entry.resource).toBeDefined();
        expect(entry.search).toBeDefined();
        expect(entry.search.mode).toBe('match');
      }
    });
  });
  describe('_summary parameter', () => {
    test('should return only summary elements with _summary=true', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _summary: 'true', _count: 5 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');

      if (response.body.entry && response.body.entry.length > 0) {
        const resource = response.body.entry[0].resource;
        // Summary elements should be present
        expect(resource.resourceType).toBe('CodeSystem');
        expect(resource.id).toBeDefined();
        // Non-summary elements should be absent
        expect(resource.concept).toBeUndefined();
        expect(resource.property).toBeUndefined();
      }
    });

    test('should return only count with _summary=count', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _summary: 'count' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');
      expect(response.body.total).toBeGreaterThan(0);
      // No entries when _summary=count
      expect(response.body.entry).toBeUndefined();
      expect(response.body.link).toBeUndefined();
    });

    test('should return only count with _summary=count for ValueSet', async () => {
      const response = await request(app)
        .get('/tx/r5/ValueSet')
        .query({ _summary: 'count' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.type).toBe('searchset');
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.entry).toBeUndefined();
    });

    test('bundleFromR5 handles bundle without entries', () => {
      const { bundleFromR5 } = require('../../tx/xversion/xv-bundle');
      const r5Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 42
      };
      const r4Bundle = bundleFromR5(r5Bundle, '4.0.1');
      expect(r4Bundle.resourceType).toBe('Bundle');
      expect(r4Bundle.total).toBe(42);
      expect(r4Bundle.entry).toBeUndefined();
    });

    test('should include SUBSETTED tag with _summary=true', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _summary: 'true', _count: 5 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);

      if (response.body.entry && response.body.entry.length > 0) {
        const resource = response.body.entry[0].resource;
        expect(resource.meta).toBeDefined();
        expect(resource.meta.tag).toBeDefined();
        const subsetted = resource.meta.tag.find(t => t.code === 'SUBSETTED');
        expect(subsetted).toBeDefined();
        expect(subsetted.system).toBe('http://terminology.hl7.org/CodeSystem/v3-ObservationValue');
      }
    });

    test('should include content element in CodeSystem summary', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _summary: 'true', url: 'http://hl7.org/fhir/administrative-gender' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);

      if (response.body.entry && response.body.entry.length > 0) {
        const resource = response.body.entry[0].resource;
        expect(resource.content).toBeDefined();
      }
    });

    test('should include SUBSETTED tag with _elements', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _elements: 'url,name', _count: 5 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);

      if (response.body.entry && response.body.entry.length > 0) {
        const resource = response.body.entry[0].resource;
        expect(resource.meta).toBeDefined();
        const subsetted = resource.meta.tag.find(t => t.code === 'SUBSETTED');
        expect(subsetted).toBeDefined();
      }
    });

    test('should return full resources with _summary=false', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _summary: 'false', url: 'http://hl7.org/fhir/administrative-gender' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);

      if (response.body.entry && response.body.entry.length > 0) {
        const resource = response.body.entry[0].resource;
        expect(resource.resourceType).toBe('CodeSystem');
        // Full resource should include concept
        expect(resource.concept).toBeDefined();
      }
    });
  });

  describe('_total parameter', () => {
    test('should include total with _total=accurate (default)', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _count: 5 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.total).toBeDefined();
      expect(typeof response.body.total).toBe('number');
    });

    test('should not include total with _total=none', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _total: 'none', _count: 5 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.total).toBeUndefined();
    });
  });

  describe('_format parameter', () => {
    test('should return JSON with _format=json', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _format: 'json', _count: 2 });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/fhir+json');
      expect(response.body.resourceType).toBe('Bundle');
    });

    test('should return XML with _format=xml', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _format: 'xml', _count: 2 });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/fhir+xml');
      expect(response.text).toContain('<Bundle');
      expect(response.text).toContain('xmlns="http://hl7.org/fhir"');
    });

    test('should return JSON with _format=application/fhir+json', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _format: 'application/fhir+json', _count: 2 });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/fhir+json');
    });

    test('_format should override Accept header', async () => {
      const response = await request(app)
        .get('/tx/r5/CodeSystem')
        .query({ _format: 'xml', _count: 2 })
        .set('Accept', 'application/fhir+json');

      expect(response.status).toBe(200);
      // _format=xml should override Accept: application/fhir+json
      expect(response.headers['content-type']).toContain('application/fhir+xml');
    });
  });
});
