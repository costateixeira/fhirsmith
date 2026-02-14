//
// Read Worker - Handles resource read operations
//
// GET /{type}/{id}
//

const { TerminologyWorker } = require('./worker');

class ReadWorker extends TerminologyWorker {
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
    return 'read';
  }
  /**
   * Handle a read request
   * @param {express.Request} req - Express request (with txProvider attached)
   * @param {express.Response} res - Express response
   * @param {string} resourceType - The resource type (CodeSystem, ValueSet, ConceptMap)
   * @param {Object} log - Logger instance
   */
  async handle(req, res, resourceType) {
    const { id } = req.params;

    this.log.debug(`Read ${resourceType}/${id}`);

    try {
      switch (resourceType) {
        case 'CodeSystem':
          return await this.handleCodeSystem(req, res, id);

        case 'ValueSet':
          return await this.handleValueSet(req, res, id);

        case 'ConceptMap':
          return res.status(501).json({
            resourceType: 'OperationOutcome',
            issue: [{
              severity: 'error',
              code: 'not-supported',
              diagnostics: 'ConceptMap read not yet implemented'
            }]
          });

        default:
          return res.status(404).json({
            resourceType: 'OperationOutcome',
            issue: [{
              severity: 'error',
              code: 'not-found',
              diagnostics: `Unknown resource type: ${resourceType}`
            }]
          });
      }
    } catch (error) {
      req.logInfo = this.usedSources.join("|")+" - error"+(error.msgId  ? " "+error.msgId : "");
      this.log.error(error);
      return res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error.message
        }]
      });
    }
  }

  /**
   * Handle CodeSystem read
   */
  async handleCodeSystem(req, res, id) {
    let cs = this.provider.getCodeSystemById(this.opContext, id);
    if (cs != null) {
      return res.json(cs.jsonObj);
    }

    if (id.startsWith("x-")) {
      cs = this.provider.getCodeSystemFactoryById(this.opContext, id.substring(2));
      if (cs != null) {
        let json = {
          resourceType: "CodeSystem",
          id: "x-" + cs.id(),
          url: cs.system(),
          name: cs.name(),
          status: "active",
          description: "This is a place holder for the code system which is fully supported through internal means (not by this code system)",
          content: "not-present"
        }
        if (cs.version()) {
          json.version = cs.version();
        }
        if (cs.iteratable()) {
          json.content =  "complete",
          json.concept = [];
          let csp = cs.build(this.opContext, []);
          let iter = await csp.iteratorAll();
          let c = await csp.nextContext(iter);
          while (c) {
            let cc = {
              code: await csp.code(c),
              display: await csp.display(c)
            }
            let def = await csp.definition(c);
            if (def) {
              cc.definition = def;
            }
            json.concept.push(cc);
            c = await csp.nextContext(iter);
          }

        }
        return res.json(json);
      }
    }

    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: `CodeSystem/${id} not found`
      }]
    });
  }

  /**
   * Handle ValueSet read
   */
  async handleValueSet(req, res, id) {
    // Iterate through valueSetProviders in order
    for (const vsp of this.provider.valueSetProviders) {
      this.deadCheck('handleValueSet-loop');
      const vs = await vsp.fetchValueSetById(id);
      if (vs) {
        return res.json(vs.jsonObj);
      }
    }

    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: `ValueSet/${id} not found`
      }]
    });
  }
}

module.exports = ReadWorker;