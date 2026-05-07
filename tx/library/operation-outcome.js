const {validateParameter} = require("../../library/utilities");

class Issue extends Error {
  level;
  cause;
  path;
  msgId;
  issueCode;
  statusCode;
  isSetForhandleAsOO;
  diagnostics;
  issues = [];

  constructor (level, cause, path, msgId, message, issueCode = null, statusCode = 500) {
    super(message);
    this.level = level;
    this.cause = cause;
    this.path = path;
    this.message = message;
    this.msgId = msgId;
    this.issueCode = issueCode;
    this.statusCode = statusCode;
  }

  asIssue() {
    let res = {
      severity: this.level,
      code: this.cause,
      details: {
        text: this.message
      }
    }
    if (this.path) {
      res.expression = [this.path]
    }
    if (this.issueCode) {
      res.details.coding = [{ system: "http://hl7.org/fhir/tools/CodeSystem/tx-issue-type", code : this.issueCode }];
    }
    if (this.msgId) {
      res.extension = [{ url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-message-id", valueString: this.msgId }];
    }
    if (this.diagnostics) {
      res.diagnostics = this.diagnostics;
    }
    return res;
  }

  handleAsOO(statusCode) {
    this.isSetForhandleAsOO = true;
    this.statusCode = statusCode;
    return this;
  }

  isHandleAsOO() {
    return this.isSetForhandleAsOO;
  }

  setFinished() {
    this.finished = true;
    return this;
  }
  setUnknownSystem(s) {
    this.unknownSystem = s;
    return this;
  }
  addIssue(issue) {
    if (issue) {
      this.issues.push(issue);
    }
    return this;
  }

  withDiagnostics(diagnostics) {
    this.diagnostics = diagnostics;
    return this;
  }
}

class OperationOutcome {
  jsonObj;

  constructor (jsonObj = null) {
    this.jsonObj = jsonObj ? jsonObj : { "resourceType": "OperationOutcome" };
  }

  addIssueIfNew(newIssue) {
    return this.addIssue(newIssue, true);
  }

  addIssue(newIssue, ifNotDuplicate = false) {
    validateParameter(newIssue, "newIssue", Object);
    if (ifNotDuplicate) {
      for (let iss of this.jsonObj.issue || []) {
        if (iss.details.text === newIssue.message) {
          return false;
        }
      }
    }
    if (!this.jsonObj.issue) {
      this.jsonObj.issue = [];
    }
    this.jsonObj.issue.push(newIssue.asIssue());
    for (let extra of newIssue.issues) {
      this.addIssue(extra, false);
    }
    return true;
  }

  hasIssues() {
    return this.jsonObj && this.jsonObj.issue;
  }

  hasErrors() {
    for (let iss of this.jsonObj.issue || []) {
      if (iss.severity === 'error') {
        return true;
      }
    }
    return false;
  }

  listMissedErrors(list) {
    for (let iss of this.jsonObj.issue || []) {
      if (iss.severity === 'error' && iss.details && iss.details.text && !list.find(msg => msg === iss.details.text )) {
        return list.push(iss.details.text);
      }
    }

  }
}

module.exports = { OperationOutcome, Issue };