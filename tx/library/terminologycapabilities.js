const {CanonicalResource} = require("./canonical-resource");
const {terminologyCapabilitiesToR5, terminologyCapabilitiesFromR5} = require("../xversion/xv-terminologyCapabilities");

/**
 * Represents a FHIR TerminologyCapabilities resource with version conversion support.
 * Note: TerminologyCapabilities was introduced in R4. For R3, it is represented as a
 * Parameters resource with a specific structure.
 * @class
 */
class TerminologyCapabilities extends CanonicalResource {

  /**
   * Creates a new TerminologyCapabilities instance
   * @param {Object} jsonObj - The JSON object containing TerminologyCapabilities data
   * @param {string} [fhirVersion='R5'] - FHIR version ('R3', 'R4', or 'R5')
   */
  constructor(jsonObj, fhirVersion = 'R5') {
    super(jsonObj, fhirVersion);
    // Convert to R5 format internally (modifies input for performance)
    this.jsonObj = terminologyCapabilitiesToR5(jsonObj, fhirVersion);
    this.validate();
    this.id = this.jsonObj.id;
  }

  /**
   * Static factory method for convenience
   * @param {string} jsonString - JSON string representation of TerminologyCapabilities
   * @param {string} [version='R5'] - FHIR version ('R3', 'R4', or 'R5')
   * @returns {TerminologyCapabilities} New TerminologyCapabilities instance
   */
  static fromJSON(jsonString, version = 'R5') {
    return new TerminologyCapabilities(JSON.parse(jsonString), version);
  }

  /**
   * Returns JSON string representation
   * @param {string} [version='R5'] - Target FHIR version ('R3', 'R4', or 'R5')
   * @returns {string} JSON string
   */
  toJSONString(version = 'R5') {
    const outputObj = terminologyCapabilitiesFromR5(this.jsonObj, version);
    return JSON.stringify(outputObj);
  }

  /**
   * Returns JSON object in target version format
   * @param {string} [version='R5'] - Target FHIR version ('R3', 'R4', or 'R5')
   * @returns {Object} JSON object
   */
  toJSON(version = 'R5') {
    return this._convertFromR5(this.jsonObj, version);
  }


  /**
   * Validates that this is a proper TerminologyCapabilities resource
   * @throws {Error} If validation fails
   */
  validate() {
    if (!this.jsonObj || typeof this.jsonObj !== 'object') {
      throw new Error('Invalid TerminologyCapabilities: expected object');
    }

    if (this.jsonObj.resourceType !== 'TerminologyCapabilities') {
      throw new Error(`Invalid TerminologyCapabilities: resourceType must be "TerminologyCapabilities", got "${this.jsonObj.resourceType}"`);
    }

    if (!this.jsonObj.status || typeof this.jsonObj.status !== 'string') {
      throw new Error('Invalid TerminologyCapabilities: status is required and must be a string');
    }

    const validStatuses = ['draft', 'active', 'retired', 'unknown'];
    if (!validStatuses.includes(this.jsonObj.status)) {
      throw new Error(`Invalid TerminologyCapabilities: status must be one of ${validStatuses.join(', ')}, got "${this.jsonObj.status}"`);
    }

    if (!this.jsonObj.kind || typeof this.jsonObj.kind !== 'string') {
      throw new Error('Invalid TerminologyCapabilities: kind is required and must be a string');
    }

    const validKinds = ['instance', 'capability', 'requirements'];
    if (!validKinds.includes(this.jsonObj.kind)) {
      throw new Error(`Invalid TerminologyCapabilities: kind must be one of ${validKinds.join(', ')}, got "${this.jsonObj.kind}"`);
    }
  }

  /**
   * Gets the code systems supported by this terminology server
   * @returns {Object[]} Array of code system capability objects
   */
  getCodeSystems() {
    return this.jsonObj.codeSystem || [];
  }

  /**
   * Gets the expansion capabilities
   * @returns {Object|undefined} Expansion capability object
   */
  getExpansion() {
    return this.jsonObj.expansion;
  }

  /**
   * Gets the validate-code capabilities
   * @returns {Object|undefined} ValidateCode capability object
   */
  getValidateCode() {
    return this.jsonObj.validateCode;
  }

  /**
   * Gets the translation capabilities
   * @returns {Object|undefined} Translation capability object
   */
  getTranslation() {
    return this.jsonObj.translation;
  }

  /**
   * Gets the closure capabilities
   * @returns {Object|undefined} Closure capability object
   */
  getClosure() {
    return this.jsonObj.closure;
  }

  /**
   * Gets the list of supported expansion parameters
   * @returns {string[]} Array of parameter names
   */
  getExpansionParameters() {
    const expansion = this.getExpansion();
    if (!expansion || !expansion.parameter) {
      return [];
    }
    return expansion.parameter.map(p => p.name);
  }

  /**
   * Checks if a specific code system is supported
   * @param {string} uri - The code system URI to check
   * @returns {boolean} True if the code system is supported
   */
  supportsCodeSystem(uri) {
    return this.getCodeSystems().some(cs => cs.uri === uri);
  }

  /**
   * Gets version information for a specific code system
   * @param {string} uri - The code system URI
   * @returns {Object[]|undefined} Array of version objects or undefined if not found
   */
  getCodeSystemVersions(uri) {
    const codeSystem = this.getCodeSystems().find(cs => cs.uri === uri);
    return codeSystem?.version;
  }

  /**
   * Gets basic info about this terminology capabilities statement
   * @returns {Object} Basic information object
   */
  getInfo() {
    return {
      resourceType: this.jsonObj.resourceType,
      url: this.jsonObj.url,
      version: this.jsonObj.version,
      name: this.jsonObj.name,
      title: this.jsonObj.title,
      status: this.jsonObj.status,
      kind: this.jsonObj.kind,
      date: this.jsonObj.date,
      codeSystemCount: this.getCodeSystems().length,
      expansionParameters: this.getExpansionParameters()
    };
  }
}

module.exports = { TerminologyCapabilities };