/**
 * Converts input OperationOutcome to R5 format (modifies input object for performance)
 * @param {Object} jsonObj - The input OperationOutcome object
 * @param {string} version - Source FHIR version
 * @returns {Object} The same object, potentially modified to R5 format
 * @private
 */

// eslint-disable-next-line no-unused-vars
function operationOutcomeToR5(jsonObj, sourceVersion) {
  return jsonObj; // No conversion needed
}

/**
 * Converts R5 OperationOutcome to target version format (clones object first)
 * @param {Object} r5Obj - The R5 format OperationOutcome object
 * @param {string} targetVersion - Target FHIR version
 * @returns {Object} New object in target version format
 * @private
 */
// eslint-disable-next-line no-unused-vars
function operationOutcomeFromR5(r5Obj, targetVersion) {
  return r5Obj; // No conversion needed
}


module.exports = { operationOutcomeToR5, operationOutcomeFromR5 };