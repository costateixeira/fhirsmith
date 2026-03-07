/**
 * Abstract base class for value set providers
 * Defines the interface that all value set providers must implement
 */
class AbstractCodeSystemProvider {
  /**
   * {int} Unique number assigned to this provider
   */
  spaceId;

  /**
   * ensure that the ids on the code systems are unique, if they are
   * in the global namespace
   *
   * @param {Set<String>} ids
   */
  // eslint-disable-next-line no-unused-vars
  assignIds(ids) {
    throw new Error('assignIds must be implemented by subclass');
  }

  /**
   * Returns the list of CodeSystems this provider provides. This is called once at start up.
   * The code systems should be fully loaded; lazy loading code systems is not considered good
   * for engineering.
   *
   *
   * Note that unlike value sets, which are accessed from the provider on the fly, code systems
   * are all preloaded into the kernel (e.g. provider) at start up
   *
  * @param {string} fhirVersion - The FHIRVersion in scope - if relevant (there's always a stated version, though R5 is always used)
  * @param {string} context - The client's stated context - if provided.
  * @returns {Map<String, CodeSystem>} The list of CodeSystems
  * @throws {Error} Must be implemented by subclasses
  */
  // eslint-disable-next-line no-unused-vars
  async listCodeSystems(fhirVersion, context) {
    throw new Error('listCodeSystems must be implemented by AbstractCodeSystemProvider subclass');
  }

  /**
   * This is called once a minute to update the code system list that the provider maintains.
   *
   * return an object that has three Map<String, CodeSystem>: {added, changed, deleted}
   *
   * these use the same key as the
   *
   * code systems are identified by url and version
   *
   * @param fhirVersion
   * @param context
   * @returns {Promise<null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getCodeSystemChanges(fhirVersion, context){
    return null;
  }

  async close() {

  }

}

module.exports = {
  AbstractCodeSystemProvider
};