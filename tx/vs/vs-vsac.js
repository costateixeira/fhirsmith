const path = require('path');
const axios = require('axios');
const { AbstractValueSetProvider } = require('./vs-api');
const { ValueSetDatabase } = require('./vs-database');
const { VersionUtilities } = require('../../library/version-utilities');

/**
 * VSAC (Value Set Authority Center) ValueSet provider
 * Fetches and caches ValueSets from the NLM VSAC FHIR server
 */
class VSACValueSetProvider extends AbstractValueSetProvider {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - API key for VSAC authentication
   * @param {string} config.cacheFolder - Local folder for cached database
   * @param {number} [config.refreshIntervalHours=24] - Hours between refresh scans
   * @param {string} [config.baseUrl='http://cts.nlm.nih.gov/fhir'] - Base URL for VSAC FHIR server
   */
  constructor(config) {
    super();

    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.cacheFolder) {
      throw new Error('Cache folder is required');
    }

    this.apiKey = config.apiKey;
    this.cacheFolder = config.cacheFolder;
    this.baseUrl = config.baseUrl || 'http://cts.nlm.nih.gov/fhir';
    this.refreshIntervalHours = config.refreshIntervalHours || 24;

    this.dbPath = path.join(config.cacheFolder, 'vsac-valuesets.db');
    this.database = new ValueSetDatabase(this.dbPath);
    this.valueSetMap = new Map();
    this.initialized = false;
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.lastRefresh = null;

    // HTTP client with authentication - manually create Basic auth header
    const authString = Buffer.from(`apikey:${this.apiKey}`).toString('base64');
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/fhir+json',
        'User-Agent': 'FHIR-ValueSet-Provider/1.0',
        'Authorization': `Basic ${authString}`
      }
    });
  }

  /**
   * Initialize the provider - setup database and start refresh cycle
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Create database if it doesn't exist
    if (!(await this.database.exists())) {
      await this.database.create();
      // Force initial refresh for new database
      await this.refreshValueSets();
    } else {
      // Load existing data
      await this._reloadMap();
    }

    // Start periodic refresh
    this._startRefreshTimer();
    this.initialized = true;
  }

  /**
   * Start the periodic refresh timer
   * @private
   */
  _startRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    const intervalMs = this.refreshIntervalHours * 60 * 60 * 1000;
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshValueSets();
      } catch (error) {
        this.log.error(error, 'Error during scheduled refresh:');
      }
    }, intervalMs);
  }

  /**
   * Stop the refresh timer (for cleanup)
   */
  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Perform a full refresh of ValueSets from the server
   * @returns {Promise<void>}
   */
  async refreshValueSets() {
    if (this.isRefreshing) {
      console.log('Refresh already in progress, skipping');
      return;
    }

    this.isRefreshing = true;
    const refreshStartTime = Math.floor(Date.now() / 1000);

    try {
      console.log('Starting VSAC ValueSet refresh...');

      let totalFetched = 0;
      let url = '/ValueSet?_offset=0&_count=100';

      while (url) {
        console.log(`Fetching page: ${url}`);
        const bundle = await this._fetchBundle(url);

        if (bundle.entry && bundle.entry.length > 0) {
          // Extract ValueSets from bundle entries
          const valueSets = bundle.entry
            .filter(entry => entry.resource && entry.resource.resourceType === 'ValueSet')
            .map(entry => entry.resource);

          if (valueSets.length > 0) {
            await this.database.batchUpsertValueSets(valueSets);
            totalFetched += valueSets.length;
            console.log(`Processed ${valueSets.length} ValueSets (total: ${totalFetched})`);
          }
        }

        // Find next link
        url = this._getNextUrl(bundle);

        // Safety check against infinite loops
        if (bundle.total && totalFetched >= bundle.total) {
          console.log(`Reached total count (${bundle.total}), stopping`);
          break;
        }
      }

      // Clean up old records
      const deletedCount = await this.database.deleteOldValueSets(refreshStartTime);
      if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} old ValueSets`);
      }

      // Reload map with fresh data
      await this._reloadMap();

      this.lastRefresh = new Date();
      console.log(`VSAC refresh completed. Total: ${totalFetched} ValueSets, Deleted: ${deletedCount}`);

    } catch (error) {
      console.log(error, 'Error during VSAC refresh:');
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Fetch a FHIR Bundle from the server
   * @param {string} url - Relative URL to fetch
   * @returns {Promise<Object>} FHIR Bundle
   * @private
   */
  async _fetchBundle(url) {
    try {
      const response = await this.httpClient.get(url);

      if (response.data && response.data.resourceType === 'Bundle') {
        return response.data;
      } else {
        throw new Error('Response is not a FHIR Bundle');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response received');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Extract the next URL from a FHIR Bundle's link array
   * @param {Object} bundle - FHIR Bundle
   * @returns {string|null} Next URL or null if no more pages
   * @private
   */
  _getNextUrl(bundle) {
    if (!bundle.link || !Array.isArray(bundle.link)) {
      return null;
    }

    const nextLink = bundle.link.find(link => link.relation === 'next');
    if (!nextLink || !nextLink.url) {
      return null;
    }

    // Extract relative path from full URL
    let s = nextLink.url;
    s = s.replace(this.baseUrl, '');
    return s;
  }

  /**
   * Reload the in-memory map from database (thread-safe)
   * @returns {Promise<void>}
   * @private
   */
  async _reloadMap() {
    const newMap = await this.database.loadAllValueSets("vsac");

    // Atomic replacement of the map
    this.valueSetMap = newMap;
  }

  /**
   * Fetches a value set by URL and version
   * @param {string} url - The canonical URL of the value set
   * @param {string} version - The version of the value set
   * @returns {Promise<Object>} The requested value set
   */
  async fetchValueSet(url, version) {
    await this.initialize();
    this._validateFetchParams(url, version);

    // Try exact match first: url|version
    let key = `${url}|${version}`;
    if (this.valueSetMap.has(key)) {
      return this.valueSetMap.get(key);
    }

    // If version is semver, try url|major.minor
    try {
      if (VersionUtilities.isSemVer(version)) {
        const majorMinor = VersionUtilities.getMajMin(version);
        if (majorMinor) {
          key = `${url}|${majorMinor}`;
          if (this.valueSetMap.has(key)) {
            return this.valueSetMap.get(key);
          }
        }
      }
    } catch (error) {
      // Ignore version parsing errors
    }

    // Finally try just the URL
    if (this.valueSetMap.has(url)) {
      return this.valueSetMap.get(url);
    }

    throw new Error(`Value set not found: ${url} version ${version}`);
  }

  /**
   * Searches for value sets based on criteria
   * @param {Array<{name: string, value: string}>} searchParams - Search criteria
   * @returns {Promise<Array<Object>>} List of matching value sets
   */
  async searchValueSets(searchParams, elements) {
    await this.initialize();
    this._validateSearchParams(searchParams);

    if (searchParams.length === 0) {
      return [];
    }

    return await this.database.search(this.spaceId, searchParams, elements);
  }

  /**
   * Get statistics about the cached ValueSets
   * @returns {Promise<Object>} Statistics object including refresh info
   */
  async getStatistics() {
    await this.initialize();

    const dbStats = await this.database.getStatistics();

    return {
      ...dbStats,
      refreshInfo: {
        lastRefresh: this.lastRefresh,
        isRefreshing: this.isRefreshing,
        refreshIntervalHours: this.refreshIntervalHours,
        nextRefresh: this.refreshTimer && this.lastRefresh
          ? new Date(this.lastRefresh.getTime() + (this.refreshIntervalHours * 60 * 60 * 1000))
          : null
      }
    };
  }

  /**
   * Get the number of value sets loaded into memory
   * @returns {number} Number of unique value sets in map
   */
  getMapSize() {
    const uniqueUrls = new Set();
    for (const [key, valueSet] of this.valueSetMap.entries()) {
      if (!key.includes('|')) { // Only count base URL keys
        uniqueUrls.add(valueSet.url);
      }
    }
    return uniqueUrls.size;
  }

  /**
   * Force a refresh (useful for testing or manual updates)
   * @returns {Promise<void>}
   */
  async forceRefresh() {
    await this.refreshValueSets();
  }

  /**
   * Check if the provider is currently refreshing
   * @returns {boolean} True if refresh is in progress
   */
  isCurrentlyRefreshing() {
    return this.isRefreshing;
  }

  /**
   * Get the last refresh timestamp
   * @returns {Date|null} Last refresh date or null if never refreshed
   */
  getLastRefreshTime() {
    return this.lastRefresh;
  }

  count() {
    return this.database.vsCount;
  }

  async listAllValueSets() {
    return await this.database.listAllValueSets();
  }

  async close() {
    await this.database.close();
  }

}

// Usage examples:
module.exports = {
  VSACValueSetProvider
};