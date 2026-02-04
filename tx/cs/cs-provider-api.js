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
  * Returns the list of CodeSystems this provider provides
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

  async close() {

  }

}

module.exports = {
  AbstractCodeSystemProvider
};