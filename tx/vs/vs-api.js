/**
 * Abstract base class for value set providers
 * Defines the interface that all value set providers must implement
 */
class AbstractValueSetProvider {
  /**
   * {int} Unique number assigned to this provider
   */
  spaceId;

  /**
   * ensure that the ids on the value sets are unique, if they are
   * in the global namespace
   *
   * @param {Set<String>} ids
   */
  // eslint-disable-next-line no-unused-vars
  assignIds(ids) {
    throw new Error('assignIds must be implemented by AbstractValueSetProvider subclass');
  }

  /**
   * Fetches a specific value set by URL and version
   * @param {string} url - The URL/identifier of the value set
   * @param {string} version - The version of the value set
   * @returns {Promise<ValueSet>} The requested value set
   * @throws {Error} Must be implemented by subclasses
   */
  // eslint-disable-next-line no-unused-vars
  async fetchValueSet(url, version) {
    throw new Error('fetchValueSet must be implemented by subclass');
  }

  /**
   * Fetches a specific value set by id. ValueSet providers must enforce that value set ids are unique
   * either globally (as enforced by assignIds) or in their space
   *
   * @param {string} id - The id of the value set
   * @returns {Promise<ValueSet>} The requested value set
   * @throws {Error} Must be implemented by subclasses
   */
  // eslint-disable-next-line no-unused-vars
  async fetchValueSetById(id) {
    throw new Error('fetchValueSetById must be implemented by subclass');
  }

  /**
   * Searches for value sets based on provided criteria
   * @param {Array<{name: string, value: string}>} searchParams - List of name/value pairs for search criteria
   * @returns {Promise<Array<ValueSet>>} List of matching value sets
   * @throws {Error} Must be implemented by subclasses
   */
  // eslint-disable-next-line no-unused-vars
  async searchValueSets(searchParams, elements = null) {
    throw new Error('searchValueSets must be implemented by subclass');
  }

  /**
   *
   * @returns {number} total number of value sets
   */
  vsCount() {
    return 0;
  }

  /**
   * Validates search parameters
   * @param {Array<{name: string, value: string}>} searchParams - Search parameters to validate
   * @protected
   */
  _validateSearchParams(searchParams) {
    if (!Array.isArray(searchParams)) {
      throw new Error('Search parameters must be an array');
    }

    for (const param of searchParams) {
      if (!param || typeof param !== 'object') {
        throw new Error('Each search parameter must be an object');
      }
      if (typeof param.name !== 'string' || typeof param.value !== 'string') {
        throw new Error('Search parameter must have string name and value properties');
      }
    }
  }

  /**
   * Validates URL and version parameters
   * @param {string} url - URL to validate
   * @param {string} version - Version to validate
   * @protected
   */
  _validateFetchParams(url, version) {
    if (typeof url !== 'string' || !url.trim()) {
      throw new Error('URL must be a non-empty string');
    }
    if (version != null && typeof version !== 'string') {
      throw new Error('Version must be a string');
    }
  }

  async listAllValueSets() {
    return [];
  }

  async close() {

  }
}

module.exports = {
  AbstractValueSetProvider
};