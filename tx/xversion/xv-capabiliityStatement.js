const {VersionUtilities} = require("../../library/version-utilities");

/**
 * Converts input CapabilityStatement to R5 format (modifies input object for performance)
 * @param {Object} jsonObj - The input CapabilityStatement object
 * @param {string} version - Source FHIR version
 * @returns {Object} The same object, potentially modified to R5 format
 * @private
 */

function capabilityStatementToR5(jsonObj, sourceVersion) {
  if (VersionUtilities.isR5Ver(sourceVersion)) {
    return jsonObj; // No conversion needed
  }

  if (VersionUtilities.isR3Ver(sourceVersion)) {
    // R3: resourceType was "CapabilityStatement" (same as R4/R5)
    // Convert identifier from single object to array if present
    if (jsonObj.identifier && !Array.isArray(jsonObj.identifier)) {
      jsonObj.identifier = [jsonObj.identifier];
    }
    return jsonObj;
  }

  if (VersionUtilities.isR4Ver(sourceVersion)) {
    // R4 to R5: No major structural changes needed
    return jsonObj;
  }
  throw new Error(`Unsupported FHIR version: ${sourceVersion}`);
}

/**
 * Converts R5 CapabilityStatement to target version format (clones object first)
 * @param {Object} r5Obj - The R5 format CapabilityStatement object
 * @param {string} targetVersion - Target FHIR version
 * @returns {Object} New object in target version format
 * @private
 */
function capabilityStatementFromR5(r5Obj, targetVersion) {
  if (VersionUtilities.isR5Ver(targetVersion)) {
    return r5Obj; // No conversion needed
  }

  // Clone the object to avoid modifying the original
  const cloned = JSON.parse(JSON.stringify(r5Obj));

  if (VersionUtilities.isR4Ver(targetVersion)) {
    return capabilityStatementR5ToR4(cloned);
  } else if (VersionUtilities.isR3Ver(targetVersion)) {
    return capabilityStatementR5ToR3(cloned);
  }

  throw new Error(`Unsupported target FHIR version: ${targetVersion}`);
}

/**
 * Converts R5 CapabilityStatement to R4 format
 * @param {Object} r5Obj - Cloned R5 CapabilityStatement object
 * @returns {Object} R4 format CapabilityStatement
 * @private
 */
function capabilityStatementR5ToR4(r5Obj) {

  // Remove R5-specific elements
  if (r5Obj.versionAlgorithmString) {
    delete r5Obj.versionAlgorithmString;
  }
  if (r5Obj.versionAlgorithmCoding) {
    delete r5Obj.versionAlgorithmCoding;
  }

  return r5Obj;
}

/**
 * Converts R5 CapabilityStatement to R3 format
 * @param {Object} r5Obj - Cloned R5 CapabilityStatement object
 * @returns {Object} R3 format CapabilityStatement
 * @private
 */
function capabilityStatementR5ToR3(r5Obj) {
  // First apply R4 conversions
  const r4Obj = capabilityStatementR5ToR4(r5Obj);

  // Convert identifier array back to single object
  if (r4Obj.identifier && Array.isArray(r4Obj.identifier)) {
    if (r4Obj.identifier.length > 0) {
      r4Obj.identifier = r4Obj.identifier[0];
    } else {
      delete r4Obj.identifier;
    }
  }

  // Convert valueCanonical to valueUri throughout the object
  convertCanonicalToUri(r5Obj);


  // Convert rest.operation.definition from canonical string to Reference object
  for (const rest of r4Obj.rest || []) {
    for (const operation of rest.operation || []) {
      if (typeof operation.definition === 'string') {
        operation.definition = {reference: operation.definition};
      }
      for (const resource of rest.resource || []) {
        delete resource.operation;
      }
    }
  }

  return r4Obj;
}

function convertCanonicalToUri(obj) {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach(item => this._convertCanonicalToUri(item));
    return;
  }

  // Convert valueCanonical to valueUri
  if (obj.valueCanonical !== undefined) {
    obj.valueUri = obj.valueCanonical;
    delete obj.valueCanonical;
  }

  // Recurse into all properties
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      convertCanonicalToUri(obj[key]);
    }
  }
}

module.exports = { capabilityStatementToR5, capabilityStatementFromR5 };
