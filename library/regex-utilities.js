const { RE2 } = require('re2-wasm');

class RegExUtilities {

  compile(pattern, flags) {
    // RE2 requires the unicode flag; add it if not already present
    const re2Flags = flags && flags.includes('u') ? flags : (flags || '') + 'u';
    return new RE2(pattern, re2Flags);
  }

}

module.exports = new RegExUtilities();
