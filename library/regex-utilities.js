const { RE2 } = require('re2-wasm');

class RegExUtilities {

  constructor() {
    this._cache = new Map();
  }

  compile(pattern, flags) {
    // re2-wasm has a fixed 16 MB WASM heap with no real free(): every
    // new RE2(...) permanently consumes a few KB. Cache by (pattern, flags)
    // so the same regex compiles at most once.
    // TODO: replace re2-wasm with native re2 to eliminate the underlying leak.
    const re2Flags = flags && flags.includes('u') ? flags : (flags || '') + 'u';
    const key = pattern + '|' + re2Flags;
    let compiled = this._cache.get(key);
    if (!compiled) {
      compiled = new RE2(pattern, re2Flags);
      this._cache.set(key, compiled);
    }
    return compiled;
  }

}

module.exports = new RegExUtilities();
 