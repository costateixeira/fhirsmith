//
// Related Worker - Handles ValueSet $related operation
//
// GET /ValueSet/{id}/$related
// GET /ValueSet/$related?url=...&version=...
// POST /ValueSet/$related (form body or Parameters with url)
// POST /ValueSet/$related (body is ValueSet resource)
// POST /ValueSet/$related (body is Parameters with valueSet parameter)
//

const { TerminologyWorker } = require('./worker');
const {TxParameters} = require("../params");
const {Extensions} = require("../library/extensions");
const {Issue, OperationOutcome} = require("../library/operation-outcome");
const ValueSet = require("../library/valueset");


class RelatedWorker extends TerminologyWorker {
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
    return 'related';
  }

  /**
   * Handle a type-level $related request
   * GET/POST /ValueSet/$related
   * @param {express.Request} req - Express request
   * @param {express.Response} res - Express response
   */
  async handle(req, res) {
    try {
      await this.handleTypeLevelRelated(req, res);
    } catch (error) {
      console.error(error);
      req.logInfo = this.usedSources.join("|")+" - error"+(error.msgId  ? " "+error.msgId : "");
      this.log.error(error);
      const statusCode = error.statusCode || 500;
      if (error instanceof Issue) {
        let oo = new OperationOutcome();
        oo.addIssue(error);
        return res.status(error.statusCode || 500).json(oo.jsonObj);
      } else {
        const issueCode = error.issueCode || 'exception';
        return res.status(statusCode).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: issueCode,
            details: {
              text: error.message
            },
            diagnostics: error.message
          }]
        });
      }
    }
  }

  /**
   * Handle an instance-level $related request
   * GET/POST /ValueSet/{id}/$related
   * @param {express.Request} req - Express request
   * @param {express.Response} res - Express response
   */
  async handleInstance(req, res) {
    try {
      await this.handleInstanceLevelRelated(req, res);
    } catch (error) {
      req.logInfo = this.usedSources.join("|")+" - error"+(error.msgId  ? " "+error.msgId : "");
      this.log.error(error);
      const statusCode = error.statusCode || 500;
      const issueCode = error.issueCode || 'exception';
      return res.status(statusCode).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: issueCode,
          details: {
            text : error.message
          },
          diagnostics: error.message
        }]
      });
    }
  }

  /**
   * Handle type-level $related: /ValueSet/$related
   * ValueSet identified by url, or provided directly in body
   */
  async handleTypeLevelRelated(req, res) {
    this.deadCheck('related-type-level');

    let params = req.body;
    this.addHttpParams(req, params);
    this.setupAdditionalResources(params);
    let txp = new TxParameters(this.opContext.i18n.languageDefinitions, this.opContext.i18n, false);
    txp.readParams(params);

    let thisVS = await this.readValueSet(res, "this", params, txp);
    let otherVS = await this.readValueSet(res, "other", params, txp);

    const result = await this.doRelated(txp, thisVS, otherVS);
    return res.json(result);
  }
  
  /**
   * Handle instance-level related: /ValueSet/{id}/$related
   * ValueSet identified by resource ID
   */
  async handleInstanceLevelRelated(req, res) {
    this.deadCheck('related-instance-level');

    let params = req.body;
    this.addHttpParams(req, params);
    this.setupAdditionalResources(params);
    let txp = new TxParameters(this.opContext.i18n.languageDefinitions, this.opContext.i18n, false);
    txp.readParams(params);

    const { id } = req.params;
    // Find the ValueSet by ID
    const thisVS = await this.provider.getValueSetById(this.opContext, id);
    if (!thisVS) {
      return res.status(404).json(this.operationOutcome('error', 'not-found',
        `ValueSet/${id} not found`));
    }
    let otherVS = await this.readValueSet(res, "other", params, txp);

    const result = await this.doRelated(txp, thisVS, otherVS);
    return res.json(result);
  }
  
  /**
   * Build an OperationOutcome
   * @param {string} severity - error, warning, information
   * @param {string} code - Issue code
   * @param {string} message - Diagnostic message
   * @returns {Object} OperationOutcome resource
   */
  operationOutcome(severity, code, message) {
    return {
      resourceType: 'OperationOutcome',
      issue: [{
        severity,
        code,
        diagnostics: message
      }]
    };
  }

  async readValueSet(res, prefix, params) {
    const valueSetParam = this.findParameter(params, prefix+'ValueSet');
    if (valueSetParam && valueSetParam.resource) {
      let valueSet = new ValueSet(valueSetParam.resource);
      this.seeSourceVS(valueSet);
      return valueSet;
    }
    // If no valueSet yet, try to find by url
    const urlParam = this.findParameter(params, prefix+'Url');
    const versionParam = this.findParameter(params, 'valueSetVersion');

    if (!urlParam) {
      return res.status(400).json(this.operationOutcome('error', 'invalid',
        `Must provide either a ${prefix}ValueSet resource or a ${prefix}Url parameter`));
    }

    const url = this.getParameterValue(urlParam);
    const version = versionParam ? this.getParameterValue(versionParam) : null;

    let valueSet = await this.findValueSet(url, version);
    this.seeSourceVS(valueSet, url);
    if (!valueSet) {
      return res.status(404).json(this.operationOutcome('error', 'not-found',
        version ? `ValueSet not found: ${url} version ${version}` : `ValueSet not found: ${url}`));
    } else {
      return valueSet;
    }
  }

  async doRelated(txp, thisVS, otherVS) {
    // ok, we have to compare the composes. we don't care about anything else
    const thisC = thisVS.jsonObj.compose;
    const otherC = otherVS.jsonObj.compose;
    if (!thisC) {
      return this.makeOutcome("indeterminate", `The ValueSet ${thisVS.vurl} has no compose`);
    }
    Extensions.checkNoModifiers(thisC, 'RelatedWorker.doRelated', 'compose')
    this.checkNoLockedDate(thisVS.vurl, thisC);
    if (!otherC) {
      return this.makeOutcome("indeterminate", `The ValueSet ${otherVS.vurl} has no compose`);
    }
    Extensions.checkNoModifiers(otherC, 'RelatedWorker.doRelated', 'compose')
    this.checkNoLockedDate(otherVS.vurl, otherC);

    // ok, first, if we can determine that the value sets match from the definitions, we will
    // if that fails, then we have to do the expansions, and then decide

    // first, we sort the includes by system, and then compare them as a group
    // Build a map of system -> { this: [...includes], other: [...includes] }
    const systemMap = new Map();
    await this.addIncludes(systemMap, thisC.include || [], 'this', txp);
    await this.addIncludes(systemMap, otherC.include || [], 'other', txp);
    await this.addIncludes(systemMap, thisC.exclude || [], 'thisEx', txp);
    await this.addIncludes(systemMap, otherC.exclude || [], 'otherEx', txp);

    let status = { left: false, right: false, fail: false, common : false};

    for (const [key, value] of systemMap.entries()) {
      if (key) {
        this.compareSystems(status, value);
      } else {
        this.compareNonSystems(status, value);
      }
    }

    // can't tell? OK, we need to do expansions. Note that
    // expansions might not work (infinite value sets) so
    // we can't tell.
    if (status.fail) {
      status.fail = false;
      this.compareExpansions(status, thisC, otherC);
    }
    if (status.fail) {
      return this.makeOutcome("indeterminate", `Unable to compare ${thisVS.vurl} and ${otherVS.vurl}: `+status.reason);
    } else if (!status.common) {
      return this.makeOutcome("disjoint", `No shared codes between the value sets ${thisVS.vurl} and ${otherVS.vurl}`);
    } else if (!status.left && !status.right) {
      return this.makeOutcome("same", `The value sets ${thisVS.vurl} and ${otherVS.vurl} contain the same codes`);
    } else if (status.left && status.right) {
      return this.makeOutcome("overlapping", `Both value sets ${thisVS.vurl} and ${otherVS.vurl} contain the codes the other doesn't, but there is some overlap`);
    } else if (status.left) {
      return this.makeOutcome("superset", `The valueSet ${thisVS.vurl} is a super-set of the valueSet ${otherVS.vurl}`);
    } else {
      return this.makeOutcome("subset", `The valueSet ${thisVS.vurl} is a seb-set of the valueSet ${otherVS.vurl}`);
    }
  }

  async addIncludes(systemMap, includes, side, txp) {
    for (const inc of includes) {
      let key = inc.system || '';
      let v = {};
      if (await this.versionMatters(key, inc.version, v, txp)) {
        key = key + "|" + v.version;
      }
      if (!systemMap.has(key)) {
        systemMap.set(key, {this: [], other: []});
      }
      systemMap.get(key)[side].push(inc);
    }
  }

  async versionMatters(key, version, v, txp) {
    let cs = await this.findCodeSystem(key, version, txp, ['complete', 'fragment'], null, true);
    let res = cs == null || cs.versionNeeded();
    if (res) {
      v.version = version || cs.version();
    }
    return res;
  }

  compareNonSystems(status) {
    // not done yet
    status.fail = true;
  }

  compareSystems(status, value) {
    if (value.thisEx || value.otherEx) {
      // we don't try in this case
      status.fail = true;
      status.common = true;
    } else if (!value.this) {
      // left has nothing for this one.
      status.right = true;
      status.common = true;
    } else if (!value.other) {
      status.left = true;
      status.common = true;
    } else {
      // for now, we don't do value set imports
      if (this.hasValueSets(value.this) || this.hasValueSets(value.other)) {
        status.fail = true;
        return;
      }
      if (this.hasConceptsAndFilters(value.this) || this.hasConceptsAndFilters(value.other)) {
        status.fail = true;
        return;
      }
      // we have includes on both sides. We might have full system, a list, or a filter. we don't care about order. so clean up and sort
      this.tidyIncludes(value.this);
      this.tidyIncludes(value.other);
      // if both sides have full include, they match, period.
      if (this.isFullSystem(value.this[0]) && this.isFullSystem(value.other[0])) {
        status.common = true;
        return;
      } else if (this.isFullSystem(value.this[0])) {
        status.common = true;
        status.left = true;
        return;
      } else if (this.isFullSystem(value.other[0])) {
        status.common = true;
        status.right = true;
        return;
      } else if (this.isConcepts(value.this[0]) && this.isConcepts(value.other[0])) {
        this.compareCodeLists(status, value.this[0], value.other[0]);
        return;
      } else if (this.isFilter(value.this[0]) && this.isFilter(value.other[0])) {
        if (value.this.length != value.other.length) {
          status.fail = true;
          return;
        } else {
          for (let i = 0; i < value.this.length; i++) {
            let t = value.this.get(i);
            let o = value.other.get(i);
            if (!this.filtersMatch(t, o)) {
              status.fail = true;
              return;
            }
            status.common = true;
            return;
          }
        }
      }
    }
    status.fail = true; // not sure why we got to here, but it doesn't matter: we can't tell
  }

  hasValueSets(list) {
    for (const inc of list) {
      if (inc.valueSet) {
        return true;
      }
    }
    return false;
  }

  hasConceptsAndFilters(list) {
    for (const inc of list) {
      if (inc.concept?.length > 0 && inc.filter?.length > 0) {
        return true;
      }
    }
    return false;
  }

  tidyIncludes(list) {
    let collector = null;
    for (let i = list.length - 1; i >= 0; i--) {
      const inc = list[i];
      if (inc.system && inc.concept && !inc.filter) {
        if (collector) {
          collector.concept.push(...inc.concept);
          list.splice(i, 1);
        } else {
          collector = inc;
        }
      }
    }
    for (let inc of list) {
      if (inc.concept) {
        inc.concept.sort((a, b) => (a.code || '').localeCompare(b.code));
      }
      if (inc.filter) {
        inc.filter.sort((a, b) => (a.property || '').localeCompare(b.property) || (a.op || '').localeCompare(b.op) || (a.value || '').localeCompare(b.value));
      }
    }
    function includeRank(inc) {
      if (!inc.system) return 0;
      const hasConcepts = inc.concept?.length > 0;
      const hasFilters = inc.filter?.length > 0;
      if (!hasConcepts && !hasFilters) return 1;
      if (hasConcepts && !hasFilters) return 2;
      if (!hasConcepts && hasFilters) return 3;
      return 4;
    }

    function compareFilter(a, b) {
      const af = a.filter?.[0];
      const bf = b.filter?.[0];
      if (!af && !bf) return 0;
      if (!af) return -1;
      if (!bf) return 1;
      return (af.property || '').localeCompare(bf.property || '') ||
        (af.op || '').localeCompare(bf.op || '') ||
        (af.value || '').localeCompare(bf.value || '');
    }

    list.sort((a, b) =>
      includeRank(a) - includeRank(b) ||
      compareFilter(a, b)
    );
  }

  compareCodeLists(status, t, o) {
    const tSet = new Set(t.map(x => x.code));
    const oSet = new Set(o.map(x => x.code));

    status.common = [...tSet].filter(c => oSet.has(c)).length > 0;
    status.left = [...tSet].filter(c => !oSet.has(c)).length > 0;
    status.right = [...oSet].filter(c => !tSet.has(c)).length > 0;
  }

  makeOutcome(code, msg) {
    const parameters = {
      resourceType: 'Parameters',
      parameter: [
        {name: 'result', valueCode: code}
      ]
    };
    if (msg) {
      parameters.parameter.push({name: 'message', valueString: msg})
    }
    return parameters;
  }

  isFullSystem(inc) {
    return !inc.concept && !inc.filter;
  }

  compareExpansions() { // status, thisC, otherC) {
    return false;
  }

  isConcepts() {
    return false;
  }

  isFilter() {
    return false;
  }

  filtersMatch() {
    return false;
  }
}

module.exports = {
  RelatedWorker
};