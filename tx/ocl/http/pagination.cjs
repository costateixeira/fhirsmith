const { PAGE_SIZE } = require('../shared/constants');

function extractItemsAndNext(payload, baseUrl = null) {
  if (Array.isArray(payload)) {
    return { items: payload, next: null };
  }

  if (!payload || typeof payload !== 'object') {
    return { items: [], next: null };
  }

  const items = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  const next = payload.next || null;
  if (!next) {
    return { items, next: null };
  }

  if (baseUrl && typeof next === 'string' && next.startsWith(baseUrl)) {
    return { items, next: next.replace(baseUrl, '') };
  }

  return { items, next };
}

async function fetchAllPages(httpClient, path, options = {}) {
  const {
    params = {},
    pageSize = PAGE_SIZE,
    maxPages = Number.MAX_SAFE_INTEGER,
    baseUrl = null,
    useNextLinks = true,
    logger = null,
    loggerPrefix = '[OCL]'
  } = options;

  const results = [];
  let page = 1;
  let nextPath = path;
  let pageCount = 0;
  let usePageMode = true;

  while (nextPath && pageCount < maxPages) {
    try {
      const response = usePageMode
        ? await httpClient.get(path, { params: { ...params, page, limit: pageSize } })
        : await httpClient.get(nextPath);

      if (Array.isArray(response.data)) {
        results.push(...response.data);
        pageCount += 1;

        if (response.data.length < pageSize) {
          break;
        }

        page += 1;
        nextPath = path;
        continue;
      }

      const { items, next } = extractItemsAndNext(response.data, baseUrl);
      results.push(...items);
      pageCount += 1;

      if (useNextLinks && next) {
        usePageMode = false;
        nextPath = next;
        continue;
      }

      if (usePageMode && items.length >= pageSize && pageCount < maxPages) {
        page += 1;
        nextPath = path;
      } else {
        break;
      }
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`${loggerPrefix} Fetch error on page ${page}:`, error.message);
      }
      throw error;
    }
  }

  return results;
}

module.exports = {
  extractItemsAndNext,
  fetchAllPages
};
