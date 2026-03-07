const { OCL_CODESYSTEM_MARKER_EXTENSION } = require('./constants');

const OCL_SEARCH_PATCH_FLAG = Symbol.for('fhirsmith.ocl.search.codesystem.code.patch');
const TXPARAMS_HASH_PATCH_FLAG = Symbol.for('fhirsmith.ocl.txparameters.hash.filter.patch');

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
    SearchWorker = require('../../workers/search');
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

function normalizeFilterForCacheKey(filter) {
  if (typeof filter !== 'string') {
    return '';
  }

  return filter.trim().toLowerCase();
}

function ensureTxParametersHashIncludesFilter(TxParameters) {
  const proto = TxParameters && TxParameters.prototype;
  if (!proto || proto[TXPARAMS_HASH_PATCH_FLAG] === true || typeof proto.hashSource !== 'function') {
    return;
  }

  const originalHashSource = proto.hashSource;
  proto.hashSource = function hashSourceWithFilter() {
    const base = originalHashSource.call(this);
    const normalizedFilter = normalizeFilterForCacheKey(this.filter);
    return `${base}|filter=${normalizedFilter}`;
  };

  Object.defineProperty(proto, TXPARAMS_HASH_PATCH_FLAG, {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
  });
}

module.exports = {
  patchSearchWorkerForOCLCodeFiltering,
  ensureTxParametersHashIncludesFilter,
  normalizeFilterForCacheKey
};
