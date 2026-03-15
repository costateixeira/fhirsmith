//
// Search Worker - Handles resource search operations
//
// GET /{type}?{params}
// POST /{type}/_search
//

const { TerminologyWorker } = require('./worker');
const {Utilities} = require("../../library/utilities");
const {debugLog} = require("../operation-context");

class SearchWorker extends TerminologyWorker {
  /**
   * @param {OperationContext} opContext - Operation context
   * @param {Logger} log - Logger instance
   * @param {Provider} provider - Provider for code systems and resources
   * @param {LanguageDefinitions} languages - Language definitions
   * @param {I18nSupport} i18n - Internationalization support
   */
  constructor(opContext, log, provider, languages, i18n) {
    super(opContext, log, provider, languages, i18n);
  }

  /**
   * Get operation name
   * @returns {string}
   */
  opName() {
    return 'search';
  }


  // Allowed search parameters
  static ALLOWED_PARAMS = [
    '_offset', '_count', '_elements', '_sort', '_summary', '_total', '_format',
    'url', 'version', 'content-mode', 'date', 'description',
    'supplements', 'identifier', 'jurisdiction', 'name',
    'publisher', 'status', 'system', 'title', 'text'
  ];

  // Summary elements for _summary=true (marked elements per resource type)
  static SUMMARY_ELEMENTS = {
    CodeSystem: ['meta', 'url', 'version', 'name', 'title', 'status', 'experimental', 'date', 'publisher', 'description', 'jurisdiction', 'content'],
    ValueSet: ['meta', 'url', 'version', 'name', 'title', 'status', 'experimental', 'date', 'publisher', 'description', 'jurisdiction'],
    ConceptMap: ['meta', 'url', 'version', 'name', 'title', 'status', 'experimental', 'date', 'publisher', 'description', 'jurisdiction']
  };

  // Sortable fields
  static SORT_FIELDS = ['id', 'url', 'version', 'date', 'name', 'vurl'];

  /**
   * Handle a search request
   * @param {express.Request} req - Express request (with txProvider attached)
   * @param {express.Response} res - Express response
   * @param {string} resourceType - The resource type (CodeSystem, ValueSet, ConceptMap)
   * @param {Object} log - Logger instance
   */
  async handle(req, res, resourceType) {
    const params = req.method === 'POST' ? req.body : req.query;

    this.log.debug(`Search ${resourceType} with params:`, params);

    try {
      // Parse pagination parameters
      const offset = Math.max(0, parseInt(params._offset) || 0);
      const summary = params._summary || 'false';
      const totalMode = params._total || 'accurate';

      // Determine elements based on _summary parameter
      let elements;
      switch (summary) {
        case 'true':
          elements = SearchWorker.SUMMARY_ELEMENTS[resourceType] || [];
          break;
        case 'text':
          elements = ['resourceType', 'id', 'meta', 'text'];
          break;
        case 'data':
          elements = null; // no filter for terminology
          break;
        default:
          elements = params._elements ? decodeURIComponent(params._elements).split(',').map(e => e.trim()) : null;
          break;
      }

      const count = summary === 'count' ? 0 : Math.min(elements ? 2000 : 200, params._count && Utilities.isInteger(params._count) ? parseInt(params._count) : 20);
      const sort = params._sort || "id";

      // Get matching resources
      let matches = [];
      switch (resourceType) {
        case 'CodeSystem':
          matches = this.searchCodeSystems(params);
          break;

        case 'ValueSet':
          matches = await this.searchValueSets(params, elements);
          break;

        case 'ConceptMap':
          // Not implemented yet - return empty set
          matches = await this.searchConceptMaps(params, elements);
          break;

        default:
          matches = [];
      }

      // Sort results
      matches = this.sortResults(matches, sort);

      // Build and return the bundle
      const bundle = this.buildSearchBundle(
        req, resourceType, matches, offset, count, elements, summary, totalMode
      );
      req.logInfo = `${bundle.entry ? bundle.entry.length : 0} matches`;
      return res.json(bundle);

    } catch (error) {
      this.log.error(error);
      debugLog(error);
      req.logInfo = "error "+(error.msgId || error.className);
      return res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error.message
        }]
      });
    }
  }

  /**
   * Search CodeSystems
   */
  searchCodeSystems(params) {
    const matches = [];

    // Extract search parameters (excluding special params)
    const searchParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (!key.startsWith('_') && value && SearchWorker.ALLOWED_PARAMS.includes(key)) {
        searchParams[key] = key == 'url' ? value : value.toLowerCase();
      }
    }

    // If no search params, return all
    const hasSearchParams = Object.keys(searchParams).length > 0;

    for (const [key, cs] of this.provider.codeSystems) {
      this.deadCheck('searchCodeSystems');

      if (key == cs.vurl) {
        const json = cs.jsonObj;

        if (!hasSearchParams) {
          matches.push(json);
          continue;
        }

        // Check each search parameter for partial match
        let isMatch = true;
        for (const [param, searchValue] of Object.entries(searchParams)) {

          // Map content-mode to content property
          const jsonProp = param === 'content-mode' ? 'content' : param;

          if (param === 'jurisdiction') {
            // Special handling for jurisdiction - array of CodeableConcept
            if (!this.matchJurisdiction(json.jurisdiction, searchValue)) {
              isMatch = false;
              break;
            }
          } else if (param === 'text') {
            const propValue = json.title + json.description;
            if (!this.matchValue(propValue, searchValue)) {
              isMatch = false;
              break;
            }
          } else if (param === 'url' || param === 'system') { // exact match
            const propValue = json.url;
            if (propValue !== searchValue) {
              isMatch = false;
              break;
            }
          } else {
            // Standard partial text match
            const propValue = json[jsonProp];
            if (!this.matchValue(propValue, searchValue)) {
              isMatch = false;
              break;
            }
          }
        }

        if (isMatch) {
          matches.push(json);
        }
      }
    }

    return matches;
  }

  /**
   * Search ValueSets by delegating to providers
   */
  async searchValueSets(params, elements) {
    const allMatches = [];

    // Convert params object to array format expected by ValueSet providers
    // Exclude control params (_offset, _count, _elements, _sort)
    const searchParams = [];
    let source = null;
    for (const [key, value] of Object.entries(params)) {
      if (!key.startsWith('_') && value && SearchWorker.ALLOWED_PARAMS.includes(key)) {
        searchParams.push({ name: key, value: value });
      }
      if (key == 'source') {
        source = value;
      }
    }

    for (const vsp of this.provider.valueSetProviders) {
      if (!source || source == vsp.sourcePackage()) {
        this.deadCheck('searchValueSets-providers');
        const results = await vsp.searchValueSets(searchParams, elements);
        if (results && Array.isArray(results)) {
          for (const vs of results) {
            this.deadCheck('searchValueSets-results');
            allMatches.push(vs.jsonObj || vs);
          }
        }
      }
    }

    return allMatches;
  }

  /**
   * Search ConceptMaps by delegating to providers
   */
  async searchConceptMaps(params, elements) {
    const allMatches = [];

    // Convert params object to array format expected by ValueSet providers
    // Exclude control params (_offset, _count, _elements, _sort)
    const searchParams = [];
    let source = null;
    for (const [key, value] of Object.entries(params)) {
      if (!key.startsWith('_') && value && SearchWorker.ALLOWED_PARAMS.includes(key)) {
        searchParams.push({ name: key, value: value });
      }
      if (key == 'source') {
        source = value;
      }
    }

    for (const cmsp of this.provider.conceptMapProviders) {
      if (!source || source == cmsp.sourcePackage()) {
        this.deadCheck('searchConceptMaps-providers');
        const results = await cmsp.searchConceptMaps(searchParams, elements);
        if (results && Array.isArray(results)) {
          for (const vs of results) {
            this.deadCheck('searchConceptMaps-results');
            allMatches.push(vs.jsonObj || vs);
          }
        }
      }
    }

    return allMatches;
  }

  /**
   * Check if a value matches the search term (partial, case-insensitive)
   */
  matchValue(propValue, searchValue) {
    if (propValue === undefined || propValue === null) {
      return false;
    }

    const strValue = String(propValue).toLowerCase();
    return strValue.includes(searchValue);
  }

  /**
   * Check if jurisdiction matches - jurisdiction is an array of CodeableConcept
   */
  matchJurisdiction(jurisdictions, searchValue) {
    if (!jurisdictions || !Array.isArray(jurisdictions)) {
      return false;
    }

    for (const cc of jurisdictions) {
      // Check coding array
      if (cc.coding && Array.isArray(cc.coding)) {
        for (const coding of cc.coding) {
          if (coding.code && coding.code.toLowerCase().includes(searchValue)) {
            return true;
          }
          if (coding.display && coding.display.toLowerCase().includes(searchValue)) {
            return true;
          }
        }
      }
      // Check text
      if (cc.text && cc.text.toLowerCase().includes(searchValue)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sort results by the specified field
   */
  sortResults(results, sortField) {
    if (!SearchWorker.SORT_FIELDS.includes(sortField)) {
      return results;
    }

    return results.sort((a, b) => {
      if (sortField === 'vurl') {
        // Sort by url then version
        const urlCompare = (a.url || '').localeCompare(b.url || '');
        if (urlCompare !== 0) return urlCompare;
        return (a.version || '').localeCompare(b.version || '');
      }

      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return String(aVal).localeCompare(String(bVal));
    });
  }

  /**
   * Build a FHIR search Bundle with pagination
   */
  buildSearchBundle(req, resourceType, allMatches, offset, count, elements, summary, totalParam) {
    const totalCount = allMatches.length;

    // Handle _summary=count - only return total, no entries
    if (summary === 'count') {
      return {
        resourceType: 'Bundle',
        type: 'searchset',
        total: totalCount
      };
    }

    // Get the slice for this page
    const pageResults = allMatches.slice(offset, offset + count);

    // Build base URL for pagination links
    const protocol = req.protocol;
    const host = req.get('host');
    const basePath = req.baseUrl + req.path;
    const baseUrl = `${protocol}://${host}${basePath}`;

    // Preserve search params for pagination links (excluding _offset)
    const searchParams = new URLSearchParams();
    const params = req.method === 'POST' ? req.body : req.query;
    for (const [key, value] of Object.entries(params)) {
      if (key !== '_offset' && value) {
        searchParams.set(key, value);
      }
    }

    // Build pagination links
    const links = [];

    // Self link
    const selfParams = new URLSearchParams(searchParams);
    selfParams.set('_offset', offset);
    links.push({
      relation: 'self',
      url: `${baseUrl}?${selfParams.toString()}`
    });

    // First link
    const firstParams = new URLSearchParams(searchParams);
    firstParams.set('_offset', 0);
    links.push({
      relation: 'first',
      url: `${baseUrl}?${firstParams.toString()}`
    });

    // Previous link (if not on first page)
    if (offset > 0) {
      const prevParams = new URLSearchParams(searchParams);
      prevParams.set('_offset', Math.max(0, offset - count));
      links.push({
        relation: 'previous',
        url: `${baseUrl}?${prevParams.toString()}`
      });
    }

    // Next link (if more results)
    if (offset + count < totalCount) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('_offset', offset + count);
      links.push({
        relation: 'next',
        url: `${baseUrl}?${nextParams.toString()}`
      });
    }

    // Last link
    const lastOffset = Math.max(0, Math.floor((totalCount - 1) / count) * count);
    const lastParams = new URLSearchParams(searchParams);
    lastParams.set('_offset', lastOffset);
    links.push({
      relation: 'last',
      url: `${baseUrl}?${lastParams.toString()}`
    });

    // Build entries
    const entries = pageResults.map(resource => {
      // Apply _elements or _summary filter if specified
      let filteredResource = resource;
      if (elements) {
        filteredResource = this.filterElements(resource, elements);
      }

      return {
        fullUrl: `${protocol}://${host}${req.baseUrl}/${resourceType}/${resource.id}`,
        resource: filteredResource,
        search: {
          mode: 'match'
        }
      };
    });

    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      link: links,
      entry: entries
    };
    // Add total unless _total=none
    if (totalParam !== 'none') {
      bundle.total = totalCount;
    }
    return bundle;
  }

  /**
   * Filter resource to only include specified elements
   */
  filterElements(resource, elements) {
    // Always include resourceType and id
    const filtered = {
      resourceType: resource.resourceType,
      id: resource.id
    };

    for (const element of elements) {
      if (resource[element] !== undefined) {
        filtered[element] = resource[element];
      }
    }

    // Mark as SUBSETTED per FHIR spec
    filtered.meta = filtered.meta ? { ...filtered.meta } : {};
    filtered.meta.tag = [
      ...(filtered.meta.tag || []),
      { system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue', code: 'SUBSETTED' }
    ];

    return filtered;
  }
}

module.exports = SearchWorker;