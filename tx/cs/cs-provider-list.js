const { AbstractCodeSystemProvider } = require('./cs-provider-api');

/**
 * Package-based ValueSet provider using shared database layer
 */
class ListCodeSystemProvider extends AbstractCodeSystemProvider {
  /**
   * {Map<String, CodeSystem>} A list of code system factories that contains all the preloaded native code systems
   */
  codeSystems = [];

  /**
   * ensure that the ids on the code systems are unique, if they are
   * in the global namespace
   *
   * @param {Set<String>} ids
   */
  // eslint-disable-next-line no-unused-vars
  assignIds(ids) {
    for (const cs of this.codeSystems) {
      if (!cs.id || ids.has("CodeSystem/"+cs.id)) {
        cs.id = ""+ids.size;
      }
      ids.add("CodeSystem/"+cs.id);
    }
  }


  // eslint-disable-next-line no-unused-vars
  async listCodeSystems(fhirVersion, context) {
    return this.codeSystems;
  }
}

module.exports = {
  ListCodeSystemProvider
};
