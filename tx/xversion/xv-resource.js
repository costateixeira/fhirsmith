const {codeSystemFromR5} = require("./xv-codesystem");
const {capabilityStatementFromR5} = require("./xv-capabiliityStatement");
const {terminologyCapabilitiesFromR5} = require("./xv-terminologyCapabilities");
const {valueSetFromR5} = require("./xv-valueset");
const {conceptMapFromR5} = require("./xv-conceptmap");
const {parametersFromR5} = require("./xv-parameters");
const {operationOutcomeFromR5} = require("./xv-operationoutcome");
const {bundleFromR5} = require("./xv-bundle");


function convertResourceToR5(data, sourceVersion) {
  if (sourceVersion == "5.0" || !data.resourceType) {
    return data;
  }
  switch (data.resourceType) {
    case "CodeSystem": return codeSystemFromR5(data, sourceVersion);
    case "CapabilityStatement": return capabilityStatementFromR5(data, sourceVersion);
    case "TerminologyCapabilities": return terminologyCapabilitiesFromR5(data, sourceVersion);
    case "ValueSet": return valueSetFromR5(data, sourceVersion);
    case "ConceptMap": return conceptMapFromR5(data, sourceVersion);
    case "Parameters": return parametersFromR5(data, sourceVersion);
    case "OperationOutcome": return operationOutcomeFromR5(data, sourceVersion);
    case "Bundle": return bundleFromR5(data, sourceVersion);
    default: return data;
  }
}

function convertResourceFromR5(data, targetVersion) {
  if (targetVersion == "5.0" || !data.resourceType) {
    return data;
  }
  switch (data.resourceType) {
    case "CodeSystem": return codeSystemFromR5(data, targetVersion);
    case "CapabilityStatement": return capabilityStatementFromR5(data, targetVersion);
    case "TerminologyCapabilities": return terminologyCapabilitiesFromR5(data, targetVersion);
    case "ValueSet": return valueSetFromR5(data, targetVersion);
    case "ConceptMap": return conceptMapFromR5(data, targetVersion);
    case "Parameters": return parametersFromR5(data, targetVersion);
    case "OperationOutcome": return operationOutcomeFromR5(data, targetVersion);
    case "Bundle": return bundleFromR5(data, targetVersion);
    default: return data;
  }
}

module.exports = { convertResourceToR5, convertResourceFromR5 };