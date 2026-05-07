const {VersionUtilities} = require("../../library/version-utilities");

/**
 * Converts input ConceptMap to R5 format (modifies input object for performance)
 * @param {Object} jsonObj - The input ConceptMap object
 * @param {string} version - Source FHIR version
 * @returns {Object} The same object, potentially modified to R5 format
 * @private
 */

function conceptMapToR5(jsonObj, sourceVersion) {
  if (VersionUtilities.isR5Ver(sourceVersion)) {
    return jsonObj; // No conversion needed
  }

  if (VersionUtilities.isR3Ver(sourceVersion) || VersionUtilities.isR4Ver(sourceVersion)) {
    // Convert identifier from single object to array
    if (jsonObj.identifier && !Array.isArray(jsonObj.identifier)) {
      jsonObj.identifier = [jsonObj.identifier];
    }

    // Convert source/target to sourceScope/targetScope
    if (jsonObj.source !== undefined) {
      // Combine source + sourceVersion if both exist
      if (jsonObj.sourceVersion) {
        jsonObj.sourceScope = `${jsonObj.source}|${jsonObj.sourceVersion}`;
        delete jsonObj.sourceVersion;
      } else {
        jsonObj.sourceScope = jsonObj.source;
      }
      delete jsonObj.source;
    }

    if (jsonObj.target !== undefined) {
      // Combine target + targetVersion if both exist
      if (jsonObj.targetVersion) {
        jsonObj.targetScope = `${jsonObj.target}|${jsonObj.targetVersion}`;
        delete jsonObj.targetVersion;
      } else {
        jsonObj.targetScope = jsonObj.target;
      }
      delete jsonObj.target;
    }

    // Convert equivalence to relationship in group.element.target
    if (jsonObj.group && Array.isArray(jsonObj.group)) {
      jsonObj.group.forEach(group => {
        if (group.element && Array.isArray(group.element)) {
          group.element.forEach(element => {
            if (element.target && Array.isArray(element.target)) {
              element.target.forEach(target => {
                if (target.equivalence && !target.relationship) {
                  // Convert equivalence to relationship and keep both
                  target.relationship = convertEquivalenceToRelationship(target.equivalence);
                  // Keep equivalence for backward compatibility
                }
              });
            }
          });
        }
      });
    }

    return jsonObj;
  }
  throw new Error(`Unsupported FHIR version: ${sourceVersion}`);
}

/**
 * Converts R5 ConceptMap to target version format (clones object first)
 * @param {Object} r5Obj - The R5 format ConceptMap object
 * @param {string} targetVersion - Target FHIR version
 * @returns {Object} New object in target version format
 * @private
 */
function conceptMapFromR5(r5Obj, targetVersion) {
  if (VersionUtilities.isR5Ver(targetVersion)) {
    return r5Obj; // No conversion needed
  }

  // Clone the object to avoid modifying the original
  const cloned = JSON.parse(JSON.stringify(r5Obj));

  if (VersionUtilities.isR4Ver(targetVersion)) {
    return conceptMapR5ToR4(cloned);
  } else if (VersionUtilities.isR3Ver(targetVersion)) {
    return conceptMapR5ToR3(cloned);
  }

  throw new Error(`Unsupported target FHIR version: ${targetVersion}`);
}

/**
 * Converts R5 ConceptMap to R4 format
 * @param {Object} r5Obj - Cloned R5 ConceptMap object
 * @returns {Object} R4 format ConceptMap
 * @private
 */
function conceptMapR5ToR4(r5Obj) {
  // Remove R5-specific elements
  if (r5Obj.versionAlgorithmString) {
    delete r5Obj.versionAlgorithmString;
  }
  if (r5Obj.versionAlgorithmCoding) {
    delete r5Obj.versionAlgorithmCoding;
  }
  if (r5Obj.property) {
    delete r5Obj.property;
  }
  if (r5Obj.additionalAttribute) {
    delete r5Obj.additionalAttribute;
  }

  // Convert identifier array back to single object
  if (r5Obj.identifier && Array.isArray(r5Obj.identifier)) {
    if (r5Obj.identifier.length > 0) {
      r5Obj.identifier = r5Obj.identifier[0]; // Take first identifier
    } else {
      delete r5Obj.identifier;
    }
  }

  // Convert sourceScope/targetScope back to source/target + version
  if (r5Obj.sourceScope) {
    const parts = r5Obj.sourceScope.split('|');
    r5Obj.source = parts[0];
    if (parts.length > 1) {
      r5Obj.sourceVersion = parts[1];
    }
    delete r5Obj.sourceScope;
  }

  if (r5Obj.targetScope) {
    const parts = r5Obj.targetScope.split('|');
    r5Obj.target = parts[0];
    if (parts.length > 1) {
      r5Obj.targetVersion = parts[1];
    }
    delete r5Obj.targetScope;
  }

  // Convert relationship back to equivalence in group.element.target
  if (r5Obj.group && Array.isArray(r5Obj.group)) {
    r5Obj.group.forEach(group => {
      if (group.element && Array.isArray(group.element)) {
        group.element.forEach(element => {
          if (element.target && Array.isArray(element.target)) {
            element.target.forEach(target => {
              // If we have both equivalence and relationship, prefer equivalence for R4
              if (target.relationship && !target.equivalence) {
                target.equivalence = convertRelationshipToEquivalence(target.relationship);
              }
              // Remove R5-only relationship field
              delete target.relationship;
            });
          }
        });
      }
    });
  }

  return r5Obj;
}

/**
 * Converts R5 ConceptMap to R3 format
 * @param {Object} r5Obj - Cloned R5 ConceptMap object
 * @returns {Object} R3 format ConceptMap
 * @private
 */
function conceptMapR5ToR3(r5Obj) {
  // First apply R4 conversions
  const r4Obj = conceptMapR5ToR4(r5Obj);

  return r4Obj;
}


/**
 * Converts R3/R4 equivalence to R5 relationship
 * @param {string} equivalence - R3/R4 equivalence value
 * @returns {string} R5 relationship value
 * @private
 */
function convertEquivalenceToRelationship(equivalence) {
  const equivalenceToRelationship = {
    'relatedto': 'related-to',
    'equivalent': 'equivalent',
    'equal': 'equivalent',
    'wider': 'source-is-broader-than-target',
    'subsumes': 'source-is-broader-than-target',
    'narrower': 'source-is-narrower-than-target',
    'specializes': 'source-is-narrower-than-target',
    'inexact': 'not-related-to',
    'unmatched': 'not-related-to',
    'disjoint': 'not-related-to'
  };
  return equivalenceToRelationship[equivalence] || 'related-to';
}

/**
 * Converts R5 relationship back to R3/R4 equivalence
 * @param {string} relationship - R5 relationship value
 * @returns {string} R3/R4 equivalence value
 * @private
 */
function convertRelationshipToEquivalence(relationship) {
  const relationshipToEquivalence = {
    'related-to': 'relatedto',
    'equivalent': 'equivalent',
    'source-is-broader-than-target': 'wider',
    'source-is-narrower-than-target': 'narrower',
    'not-related-to': 'unmatched'
  };
  return relationshipToEquivalence[relationship] || 'relatedto';
}



module.exports = { conceptMapToR5, conceptMapFromR5 };




