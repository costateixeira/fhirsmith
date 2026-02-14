//
// Subsumes Worker - Handles CodeSystem $subsumes operation
//
// GET /CodeSystem/$subsumes?{params}
// POST /CodeSystem/$subsumes
// GET /CodeSystem/{id}/$subsumes?{params}
// POST /CodeSystem/{id}/$subsumes
//

const { TerminologyWorker } = require('./worker');
const { FhirCodeSystemProvider } = require('../cs/cs-cs');
const {TxParameters} = require("../params");
const {Parameters} = require("../library/parameters");
const {Issue, OperationOutcome} = require("../library/operation-outcome");
class SubsumesWorker extends TerminologyWorker {
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
    return 'subsumes';
  }

  /**
   * Handle a type-level $subsumes request
   * GET/POST /CodeSystem/$subsumes
   * @param {express.Request} req - Express request
   * @param {express.Response} res - Express response
   */
  async handle(req, res) {
    try {
      await this.handleTypeLevelSubsumes(req, res);
    } catch (error) {
      req.logInfo = "error "+(error.msgId || error.className);
      this.log.error(error);
      if (error instanceof Issue) {
        let oo = new OperationOutcome();
        oo.addIssue(error);
        return res.status(error.statusCode || 500).json(oo.jsonObj);
      } else {
        return res.status(error.statusCode || 500).json(this.operationOutcome(
          'error', error.issueCode || 'exception', error.message));
      }
    }
  }

  /**
   * Handle an instance-level $subsumes request
   * GET/POST /CodeSystem/{id}/$subsumes
   * @param {express.Request} req - Express request
   * @param {express.Response} res - Express response
   */
  async handleInstance(req, res) {
    try {
      await this.handleInstanceLevelSubsumes(req, res);
    } catch (error) {
      this.log.error(error);
      if (error instanceof Issue) {
        let oo = new OperationOutcome();
        oo.addIssue(error);
        return res.status(error.statusCode || 500).json(oo.jsonObj);
      } else {
        return res.status(error.statusCode || 500).json(this.operationOutcome(
          'error', error.issueCode || 'exception', error.message));
      }
    }
  }

  /**
   * Handle type-level subsumes: /CodeSystem/$subsumes
   * CodeSystem identified by system+version params or from codingA/codingB
   */
  async handleTypeLevelSubsumes(req, res) {
    this.deadCheck('subsumes-type-level');

    // Handle tx-resource and cache-id parameters from Parameters resource
    if (req.body && req.body.resourceType === 'Parameters') {
      this.setupAdditionalResources(req.body);
    }

    // Parse parameters from request
    const params = new Parameters(this.parseParameters(req));
    const txp = new TxParameters(this.opContext.i18n.languageDefinitions, this.opContext.i18n);
    txp.readParams(params.jsonObj);

    // Get the codings and code system provider
    let codingA, codingB;
    let csProvider;

    if (params.has('codingA') && params.has('codingB')) {
      // Using codingA and codingB (only from Parameters resource)
      codingA = params.get('codingA');
      codingB = params.get('codingB');

      // Codings must have the same system
      if (codingA.system !== codingB.system) {
        throw new Issue('error', 'not-found', null, null, 'codingA and codingB must have the same system', null, 400);
      }
      // Get the code system provider from the coding's system
      csProvider = await this.findCodeSystem(codingA.system, codingA.version || '', txp, ['complete'], null, false);
      this.seeSourceProvider(csProvider, codingA.system);
    } else if (params.has('codeA') && params.has('codeB')) {
      // Using codeA, codeB - system is required
      if (!params.has('system')) {
        throw new Issue('error', 'not-found', null, null, 'system parameter is required when using codeA and codeB', null, 404);
      }

      csProvider = await this.findCodeSystem(params.get('system'), params.get('version') || '', txp, ['complete'], null, false);
      this.seeSourceProvider(csProvider, params.get('system'));
      // Create codings from the codes
      codingA = {
        system: csProvider.system(),
        version: csProvider.version(),
        code: params.get('codeA')
      };
      codingB = {
        system: csProvider.system(),
        version: csProvider.version(),
        code: params.get('codeB')
      };

    } else {
      throw new Issue('error', 'invalid', null, null, 'Must provide either codingA and codingB, or codeA and codeB with system', null, 400);
    }

    // Perform the subsumes check
    const result = await this.doSubsumes(csProvider, codingA, codingB);
    req.logInfo = this.usedSources.join("|")+txp.logInfo();
    return res.status(200).json(result);
  }

  /**
   * Handle instance-level subsumes: /CodeSystem/{id}/$subsumes
   * CodeSystem identified by resource ID
   */
  async handleInstanceLevelSubsumes(req, res) {
    this.deadCheck('subsumes-instance-level');

    const { id } = req.params;

    // Find the CodeSystem by ID
    const codeSystem = await this.provider.getCodeSystemById(this.opContext, id);

    if (!codeSystem) {
      throw new Issue('error', 'not found', null, null, `CodeSystem/${id} not found`, null, 404);
    }

    // Handle tx-resource and cache-id parameters from Parameters resource
    if (req.body && req.body.resourceType === 'Parameters') {
      this.setupAdditionalResources(req.body);
    }

    // Parse parameters from request
    const params = new Parameters(this.parseParameters(req));
    const txp = new TxParameters(this.opContext.i18n.languageDefinitions, this.opContext.i18n);
    txp.readParams(params.jsonObj);

    // Load any supplements
    const supplements = this.loadSupplements(codeSystem.url, codeSystem.version, txp.supplements);

    // Create a FhirCodeSystemProvider for this CodeSystem
    const csProvider = new FhirCodeSystemProvider(this.opContext, codeSystem, supplements);

    // Get the codings
    let codingA, codingB;

    if (params.has('codingA') && params.has('codingB')) {
      codingA = params.get('codingA');
      codingB = params.get('codingB');
    } else if (params.has('codeA') && params.has('codeB')) {
      // Create codings from the codes using this CodeSystem
      codingA = {
        system: csProvider.system(),
        version: csProvider.version(),
        code: params.get('codeA')
      };
      codingB = {
        system: csProvider.system(),
        version: csProvider.version(),
        code: params.get('codeB')
      };
    } else {
      throw new Issue('error', 'invalid', null, null, 'Must provide either codingA and codingB, or codeA and codeB with system', null, 400);
    }

    // Perform the subsumes check
    const result = await this.doSubsumes(csProvider, codingA, codingB);
    req.logInfo = this.usedSources.join("|")+txp.logInfo();
    return res.json(result);
  }
  /**
   * Parse parameters from request (query params, form body, or Parameters resource)
   * Returns a FHIR Parameters resource
   * @param {express.Request} req - Express request
   * @returns {Object} FHIR Parameters resource
   */
  parseParameters(req) {
    // Check if body is a Parameters resource
    if (req.body && req.body.resourceType === 'Parameters') {
      return req.body;
    }

    // Parse from query params or form body and convert to Parameters resource
    const params = req.method === 'POST' ? req.body : req.query;
    return this.simpleParamsToParametersResource(params);
  }

  /**
   * Convert simple parameters (query string or form body) to a FHIR Parameters resource
   * @param {Object} params - Query params or form body
   * @returns {Object} FHIR Parameters resource
   */
  simpleParamsToParametersResource(params) {
    const result = {
      resourceType: 'Parameters',
      parameter: []
    };

    if (!params) {
      return result;
    }

    for (const [name, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Handle arrays (e.g., repeated query params)
      if (Array.isArray(value)) {
        for (const v of value) {
          result.parameter.push({
            name: name,
            valueString: String(v)
          });
        }
      } else {
        result.parameter.push({
          name: name,
          valueString: String(value)
        });
      }
    }

    return result;
  }

  /**
   * Perform the actual subsumes check
   * @param {CodeSystemProvider} csProvider - CodeSystem provider
   * @param {Object} codingA - First coding
   * @param {Object} codingB - Second coding
   * @returns {Object} Parameters resource with subsumes result
   */
  async doSubsumes(csProvider, codingA, codingB) {
    this.deadCheck('doSubsumes');

    const csSystem = csProvider.system();

    // Check system uri matches for both codings
    if (csSystem !== codingA.system) {
      const error = new Error(`System uri / code uri mismatch - not supported at this time (${csSystem}/${codingA.system})`);
      error.statusCode = 400;
      error.issueCode = 'not-supported';
      throw error;
    }
    if (csSystem !== codingB.system) {
      const error = new Error(`System uri / code uri mismatch - not supported at this time (${csSystem}/${codingB.system})`);
      error.statusCode = 400;
      error.issueCode = 'not-supported';
      throw error;
    }

    // Validate both codes exist
    const locateA = await csProvider.locate(codingA.code);
    if (!locateA || !locateA.context) {
      const error = new Error(`Invalid code: '${codingA.code}' not found in CodeSystem '${csSystem}'`);
      error.statusCode = 404;
      error.issueCode = 'not-found';
      throw error;
    }

    const locateB = await csProvider.locate(codingB.code);
    if (!locateB || !locateB.context) {
      const error = new Error(`Invalid code: '${codingB.code}' not found in CodeSystem '${csSystem}'`);
      error.statusCode = 404;
      error.issueCode = 'not-found';
      throw error;
    }

    let equal = false;
    if (csProvider.isCaseSensitive()) {
      equal = codingA.code == codingB.code;
    } else {
      equal = codingA.code === codingB.code;
    }
    equal = equal || locateA == locateB;

    // Determine the subsumption relationship
    let outcome = equal ? 'equivalent' : await csProvider.subsumesTest(codingA.code, codingB.code);

    return {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'outcome',
          valueCode: outcome
        }
      ]
    };
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
}

module.exports = SubsumesWorker;