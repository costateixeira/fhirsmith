const {VersionUtilities} = require("../../library/version-utilities");

/**
 * Converts input NamingSystem to R5 format (modifies input object for performance)
 * @param {Object} jsonObj - The input NamingSystem object
 * @param {string} version - Source FHIR version
 * @returns {Object} The same object, potentially modified to R5 format
 * @private
 */

function namingSystemToR5(jsonObj, sourceVersion) {
  if (VersionUtilities.isR5Ver(sourceVersion)) {
    return jsonObj; // No conversion needed
  }
  if (VersionUtilities.isR3Ver(sourceVersion)) {
    // R3 to R5: Remove replacedBy field (we ignore it completely)
    if (jsonObj.replacedBy !== undefined) {
      delete jsonObj.replacedBy;
    }
    return jsonObj;
  }

  if (VersionUtilities.isR4Ver(sourceVersion)) {
    // R4 to R5: No structural conversion needed
    // R5 is backward compatible for the structural elements we care about
    return jsonObj;
  }
  return jsonObj;
}

/**
 * Converts R5 NamingSystem to target version format (clones object first)
 * @param {Object} r5Obj - The R5 format NamingSystem object
 * @param {string} targetVersion - Target FHIR version
 * @returns {Object} New object in target version format
 * @private
 */
function namingSystemFromR5(r5Obj, targetVersion) {
  if (VersionUtilities.isR5Ver(targetVersion)) {
    return r5Obj; // No conversion needed
  }

  // Clone the object to avoid modifying the original
  const cloned = JSON.parse(JSON.stringify(r5Obj));

  if (VersionUtilities.isR4Ver(targetVersion)) {
    return namingSystemR5ToR4(cloned);
  } else if (VersionUtilities.isR3Ver(targetVersion)) {
    return namingSystemR5ToR3(cloned);
  }

  throw new Error(`Unsupported target FHIR version: ${targetVersion}`);
}

/**
 * Converts R5 NamingSystem to R4 format
 * @param {Object} r5Obj - Cloned R5 NamingSystem object
 * @returns {Object} R4 format NamingSystem
 * @private
 */
function namingSystemR5ToR4(r5Obj) {
  if (r5Obj.versionAlgorithmString) {
    delete r5Obj.versionAlgorithmString;
  }
  if (r5Obj.versionAlgorithmCoding) {
    delete r5Obj.versionAlgorithmCoding;
  }

  return r5Obj;
}

/**
 * Converts R5 NamingSystem to R3 format
 * @param {Object} r5Obj - Cloned R5 NamingSystem object
 * @returns {Object} R3 format NamingSystem
 * @private
 */
function namingSystemR5ToR3(r5Obj) {
  // First apply R4 conversions
  const r4Obj = namingSystemR5ToR4(r5Obj);

  // R3 doesn't have some R4/R5 fields, but we'll just let them through
  // since most additions are backward compatible in JSON
  return r4Obj;
}

module.exports = { namingSystemToR5, namingSystemFromR5 };

