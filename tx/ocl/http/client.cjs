const axios = require('axios');
const { DEFAULT_BASE_URL } = require('../shared/constants');

function createOclHttpClient(config = {}) {
  const options = typeof config === 'string' ? { baseUrl: config } : (config || {});

  const baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'FHIRSmith-OCL-Provider/1.0'
  };

  if (options.token) {
    headers.Authorization = options.token.startsWith('Token ') || options.token.startsWith('Bearer ')
      ? options.token
      : `Token ${options.token}`;
  }

  return {
    baseUrl,
    client: axios.create({
      baseURL: baseUrl,
      timeout: options.timeout || 30000,
      headers
    })
  };
}

module.exports = {
  createOclHttpClient
};
