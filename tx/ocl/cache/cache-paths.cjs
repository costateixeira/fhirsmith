const path = require('path');

const CACHE_BASE_DIR = path.join(process.cwd(), 'data', 'terminology-cache', 'ocl');
const CACHE_CS_DIR = path.join(CACHE_BASE_DIR, 'codesystems');
const CACHE_VS_DIR = path.join(CACHE_BASE_DIR, 'valuesets');

function sanitizeFilename(text) {
  if (!text || typeof text !== 'string') {
    return 'unknown';
  }
  return text
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200);
}

function getCacheFilePath(baseDir, canonicalUrl, version = null, paramsKey = null) {
  const filename = sanitizeFilename(canonicalUrl)
    + (version ? `_${sanitizeFilename(version)}` : '')
    + (paramsKey && paramsKey !== 'default' ? `_p_${sanitizeFilename(paramsKey)}` : '')
    + '.json';

  return path.join(baseDir, filename);
}

module.exports = {
  CACHE_BASE_DIR,
  CACHE_CS_DIR,
  CACHE_VS_DIR,
  sanitizeFilename,
  getCacheFilePath
};
