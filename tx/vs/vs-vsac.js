const path = require('path');
const axios = require('axios');
const { AbstractValueSetProvider } = require('./vs-api');
const { ValueSetDatabase } = require('./vs-database');
const { VersionUtilities } = require('../../library/version-utilities');
const folders = require('../../library/folder-setup');
const ValueSet = require("../library/valueset");

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
  constructor(config, stats) {
    super();
    this.stats = stats;

    if (!config.apiKey) {
      throw new Error('VSAC API key is required');
    }

    this.apiKey = config.apiKey;
    this.cacheFolder = folders.ensureFilePath("terminology-cache/vsac");
    this.baseUrl = config.baseUrl || 'http://cts.nlm.nih.gov/fhir';
    this.refreshIntervalHours = config.refreshIntervalHours || 24;

    this.dbPath = path.join(this.cacheFolder, 'vsac-valuesets.db');
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
    this.stats.addTask('VSAC Sync', `${this.refreshIntervalHours} hours`);

    // Create database if it doesn't exist
    if (!(await this.database.exists())) {
      await this.database.create();
    } else {
      // Load existing data
      await this._reloadMap();
    }
    if (this.valueSetMap.size == 0) {
      await this.refreshValueSets();
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
    this.stats.task('VSAC Sync', 'running');
    if (this.isRefreshing) {
      console.log('Refresh already in progress, skipping');
      return;
    }
    this.queue = [];

    this.isRefreshing = true;

    try {
      // phase 1: list all value sets
      console.log('Starting VSAC ValueSet refresh...');

      // This lists all the currently valid value sets by URL, but not the older versions
      let url = '/ValueSet?_offset=0&_count=100&_elements=id,url,version,status';

      let total = undefined;
      let count = 0;
      let ncount = 0;

      while (url) {
        console.log(`Sync: ${count} of ${total} - ${ncount} new`);
        this.stats.task('VSAC Sync', `Sync: ${count} of ${total} - ${ncount} new`);

        const bundle = await this._fetchBundle(url);

        if (!total) {
          total = bundle.total;
        }
        for (let be of bundle.entry || []) {
          let vs = be.resource;
          if (vs) {
            count++;
            // if we've seen this value set before, then we've got nothing new here.
            if (!this.valueSetMap.has(vs.url+"|"+vs.version)) {
              this.queue.push(vs.url);
              ncount++;
            }
          }
        }
        // Find next link
        url = this._getNextUrl(bundle);

        // Safety check against infinite loops
        if (count > total) {
          console.log(`Reached total count (${total}), stopping`);
          break;
        }
      }

      this.lastRefresh = new Date();
      console.log(`VSAC refresh phase 1 done. Total: ${count} with ${ncount} new items`);
      this.stats.task('VSAC Sync', `VSAC refresh phase 1 done. Total: ${count} with ${ncount} new items`);

      let tracking = { totalFetched: 0, totalNew: 0, count: 0, newCount : 0 };
      // phase 2: query for history & content
      this.requeue = [];
      for (let q of this.queue) {
        this.stats.task('VSAC History for '+q, `running (${tracking.totalFetched} fetched, ${tracking.totalNew} new)`);
        try {
          await this.processContentAndHistory(q, tracking, this.queue.length);
        } catch (error) {
          this.requeue.push(q)
          console.log(error);
          this.stats.task('VSAC Sync', error.message);
        }
        // `running (${totalFetched} fetched, ${totalNew} new)`)
        tracking.count++;
      }
      console.log("Requeue");
      for (let q of this.requeue) {
        this.stats.task('VSAC History for '+q, `running (${tracking.totalFetched} fetched, ${tracking.totalNew} new)`);
        try {
          await this.processContentAndHistory(q, tracking, this.requeue.length);
        } catch (error) {
          console.log(error);
          this.stats.task('VSAC Sync', error.message);
        }
        // `running (${totalFetched} fetched, ${totalNew} new)`)
        tracking.count++;
      }

      // Reload map with fresh data
      await this._reloadMap();
      console.log(`VSAC refresh completed. Total: ${tracking.totalFetched} ValueSets, Deleted: ${tracking.deletedCount}`);
    } catch (error) {
      console.log(error, 'Error during VSAC refresh:');
      this.stats.task('VSAC Sync', `Error (${error.message})`);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Insert multiple ValueSets in a batch operation
   * @param {Array<Object>} valueSets - Array of ValueSet resources
   * @returns {Promise<void>}
   */
  async batchUpsertValueSets(valueSets) {
    if (valueSets.length === 0) {
      return;
    }

    let count = 0;
    // Process sequentially to avoid database locking
    for (const valueSet of valueSets) {
      let key = valueSet.url+"|"+valueSet.version;
      let vs = this.valueSetMap.get(key);
      if (vs) {
        // we've seen this before, and maybe fetched it's history, so just update
        // the timestamp
        await this.database.seeValueSet(valueSet);
      } else {
        await this.database.upsertValueSet(valueSet);
        count++;
      }
    }
    return count;
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
        throw new Error('VSAC Response is not a FHIR Bundle');
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
   * Fetch a FHIR Bundle from the server
   * @param {string} url - Relative URL to fetch
   * @returns {Promise<Object>} FHIR Bundle
   * @private
   */
  async _fetchValueSet(id) {
    try {
      const response = await this.httpClient.get("/ValueSet/"+id);

      if (response.data && response.data.resourceType === 'ValueSet') {
        return response.data;
      } else {
        throw new Error('VSAC Response is not a FHIR ValueSet');
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
      return await this.checkFullVS(this.valueSetMap.get(key));
    }

    // If version is semver, try url|major.minor
    try {
      if (VersionUtilities.isSemVer(version)) {
        const majorMinor = VersionUtilities.getMajMin(version);
        if (majorMinor) {
          key = `${url}|${majorMinor}`;
          if (this.valueSetMap.has(key)) {
            return await this.checkFullVS(this.valueSetMap.get(key));
          }
        }
      }
    } catch (error) {
      // Ignore version parsing errors
    }

    // Finally try just the URL
    if (this.valueSetMap.has(url)) {
      return await this.checkFullVS(this.valueSetMap.get(url));
    }

    return null;
  }

  async fetchValueSetById(id) {
    return await this.checkFullVS(this.valueSetMap.get(id));
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

    return await this.database.search(this.spaceId, this.valueSetMap, searchParams, elements);
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

  // eslint-disable-next-line no-unused-vars
  assignIds(ids) {
    // nothing?
  }

  // when we get a valueset from vsac via search, the compose is not
  // populated. We don't load all the composes. Instead, when value sets
  // are fetched, we check to see if we've got the compose, and if we
  // haven't, then we fetch it and store it
  async checkFullVS(vs) {
    if (!vs) {
      return null;
    }
    if (vs.jsonObj.compose) {
      return vs;
    }
    console.log('get a full copy for the ValueSet '+vs.url+'|'+vs.version);
    let vsNew = await this._fetchValueSet(vs.id);
    await this.database.upsertValueSet(vsNew);
    this.database.addToMap(this.valueSetMap, vsNew.id, vsNew.url, vsNew.version, vsNew);
    return new ValueSet(vsNew);
  }

  async processContentAndHistory(q, tracking, length) {
    let url = `/ValueSet?url=${q}`;
    const bundle = await this._fetchBundle(url);

    let vcount = 0;
    if (bundle.entry && bundle.entry.length > 0) {
      // Extract ValueSets from bundle entries
      const valueSets = bundle.entry
        .filter(entry => entry.resource && entry.resource.resourceType === 'ValueSet')
        .map(entry => entry.resource);
      if (valueSets.length > 0) {
        tracking.totalNew = tracking.totalNew + await this.batchUpsertValueSets(valueSets);
        tracking.totalFetched += valueSets.length;
        vcount = valueSets.length;
      }
    }
    let logMsg = `VSAC (${tracking.count} of ${length}) ${q}: ${vcount} versions`;
    console.log(logMsg);
    this.stats.task('VSAC Sync', logMsg);

  }
}

// Usage examples:
module.exports = {
  VSACValueSetProvider
};