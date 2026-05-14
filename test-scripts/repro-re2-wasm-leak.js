// Manual reproducer for the re2-wasm WASM heap leak.
// See library/regex-utilities.js for the workaround.
//
//   node test-scripts/repro-re2-wasm-leak.js            # same-pattern stress
//   node test-scripts/repro-re2-wasm-leak.js --unique   # unique-pattern stress
//
// Without the cache, same-pattern OOMs at ~2965 iterations.
// With the cache, same-pattern runs indefinitely.
// Unique-pattern still OOMs (each pattern is a real compile and the underlying
// re2-wasm heap leak still applies). A proper fix is to replace re2-wasm with
// the native `re2` package.

const re = require('../library/regex-utilities');

const mode = process.argv.includes('--unique') ? 'unique' : 'same';
const basePattern =
  'CYTO|HL7\\.CYTOGEN|HL7\\.GENETICS|^PATH(\\..*)?|^MOLPATH(\\..*)?|NR STATS|H&P\\.HX\\.LAB|CHALSKIN|LABORDERS';

console.log(`mode: ${mode}-pattern`);

let i = 0;
try {
  for (;;) {
    const pattern = mode === 'unique' ? basePattern + `|UNIQUE${i}` : basePattern;
    re.compile(pattern);
    i++;
    if (i % 100 === 0) console.log(`iter ${i}`);
  }
} catch (e) {
  console.error(`OOMed at iteration ${i}: ${e.message}`);
  process.exit(1);
}
 