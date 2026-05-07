const {CanonicalResource} = require("./canonical-resource");
const {capabilityStatementFromR5, capabilityStatementToR5} = require("../xversion/xv-capabiliityStatement");

/**
 * Represents a FHIR CapabilityStatement resource with version conversion support
 * @class
 */
class CapabilityStatement extends CanonicalResource {

  /**
   * Creates a new CapabilityStatement instance
   * @param {Object} jsonObj - The JSON object containing CapabilityStatement data
   * @param {string} [fhirVersion='R5'] - FHIR version ('R3', 'R4', or 'R5')
   */
  constructor(jsonObj, fhirVersion = 'R5') {
    super(jsonObj, fhirVersion);
    // Convert to R5 format internally (modifies input for performance)
    this.jsonObj = capabilityStatementToR5(jsonObj, fhirVersion);
    this.validate();
    this.id = this.jsonObj.id;
  }

  /**
   * Static factory method for convenience
   * @param {string} jsonString - JSON string representation of CapabilityStatement
   * @param {string} [version='R5'] - FHIR version ('R3', 'R4', or 'R5')
   * @returns {CapabilityStatement} New CapabilityStatement instance
   */
  static fromJSON(jsonString, version = 'R5') {
    return new CapabilityStatement(JSON.parse(jsonString), version);
  }

  /**
   * Returns JSON string representation
   * @param {string} [version='R5'] - Target FHIR version ('R3', 'R4', or 'R5')
   * @returns {string} JSON string
   */
  toJSONString(version = 'R5') {
    const outputObj = this._convertFromR5(this.jsonObj, version);
    return JSON.stringify(outputObj);
  }

  /**
   * Returns JSON object in target version format
   * @param {string} [version='R5'] - Target FHIR version ('R3', 'R4', or 'R5')
   * @returns {Object} JSON object
   */
  toJSON(version = 'R5') {
    return capabilityStatementFromR5(this.jsonObj, version);
  }

  /**
   * Validates that this is a proper CapabilityStatement resource
   * @throws {Error} If validation fails
   */
  validate() {
    if (!this.jsonObj || typeof this.jsonObj !== 'object') {
      throw new Error('Invalid CapabilityStatement: expected object');
    }

    if (this.jsonObj.resourceType !== 'CapabilityStatement') {
      throw new Error(`Invalid CapabilityStatement: resourceType must be "CapabilityStatement", got "${this.jsonObj.resourceType}"`);
    }

    if (!this.jsonObj.status || typeof this.jsonObj.status !== 'string') {
      throw new Error('Invalid CapabilityStatement: status is required and must be a string');
    }

    const validStatuses = ['draft', 'active', 'retired', 'unknown'];
    if (!validStatuses.includes(this.jsonObj.status)) {
      throw new Error(`Invalid CapabilityStatement: status must be one of ${validStatuses.join(', ')}, got "${this.jsonObj.status}"`);
    }

    if (!this.jsonObj.kind || typeof this.jsonObj.kind !== 'string') {
      throw new Error('Invalid CapabilityStatement: kind is required and must be a string');
    }

    const validKinds = ['instance', 'capability', 'requirements'];
    if (!validKinds.includes(this.jsonObj.kind)) {
      throw new Error(`Invalid CapabilityStatement: kind must be one of ${validKinds.join(', ')}, got "${this.jsonObj.kind}"`);
    }

    if (!this.jsonObj.fhirVersion || typeof this.jsonObj.fhirVersion !== 'string') {
      throw new Error('Invalid CapabilityStatement: fhirVersion is required and must be a string');
    }

    if (!this.jsonObj.format || !Array.isArray(this.jsonObj.format)) {
      throw new Error('Invalid CapabilityStatement: format is required and must be an array');
    }
  }

  /**
   * Gets the software information
   * @returns {Object|undefined} Software information object
   */
  getSoftware() {
    return this.jsonObj.software;
  }

  /**
   * Gets the implementation information
   * @returns {Object|undefined} Implementation information object
   */
  getImplementation() {
    return this.jsonObj.implementation;
  }

  /**
   * Gets the rest capabilities
   * @returns {Object[]} Array of rest capability objects
   */
  getRest() {
    return this.jsonObj.rest || [];
  }

  /**
   * Gets supported formats
   * @returns {string[]} Array of supported mime types
   */
  getFormats() {
    return this.jsonObj.format || [];
  }

  /**
   * Gets the FHIR version this capability statement describes
   * @returns {string} FHIR version string
   */
  getDescribedFhirVersion() {
    return this.jsonObj.fhirVersion;
  }

  /**
   * Gets basic info about this capability statement
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
      fhirVersion: this.jsonObj.fhirVersion,
      formats: this.getFormats(),
      software: this.getSoftware()?.name,
      restModes: this.getRest().map(r => r.mode)
    };
  }
}

module.exports = { CapabilityStatement };