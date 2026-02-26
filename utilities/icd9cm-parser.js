#!/usr/bin/env node
/**
 * parse-icd9.js
 * Parses an ICD-9-CM text file into a FHIR R4 CodeSystem resource.
 *
 * Usage:
 *   node parse-icd9.js <input-file> [output-file]
 *
 * File format observed:
 *
 *   GROUP HEADERS (two forms):
 *     [Roman numeral.  ]DISPLAY (NNN-NNN)          <- top-level chapter
 *     DISPLAY (NNN-NNN)                             <- sub-chapter / block
 *
 *   ICD-9 CONCEPT HEADERS:
 *     NNN[.D...]<whitespace>DISPLAY
 *     (code is left-aligned; display follows after one or more spaces/tabs)
 *
 *   CONTINUATION / ANNOTATION LINES:
 *     Lines that are neither a group header nor a code header and are not
 *     blank.  They belong to the most recently opened concept.
 *     Keyword prefixes  Includes:  Excludes:  Note:  start a named section.
 *     Subsequent indented lines continue that section.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────

function normalise(str) {
  return str.replace(/[ \t]+/g, ' ').trim();
}

// Group header: optional roman-numeral prefix + display text + (NNN-NNN)
// Also handles V-code ranges like (V01-V91) and E-code ranges (E800-E999)
const GROUP_HDR = /^(?:[IVXLCDM]+\.\s+)?(.*?)\s+\(([A-Z]?\d{1,3}-[A-Z]?\d{1,3})\)\s*$/;

// ICD-9 / V-code / E-code concept header: code at column 0, then 1+ spaces, then display
const CODE_HDR = /^([A-Z]?\d{2,3}(?:\.\d+)?)\s+(\S.*)/;

function isGroupHeader(line) {
  return GROUP_HDR.test(line.trim());
}

function isCodeHeader(line) {
  // Must start at column 0 (no leading whitespace)
  return /^[A-Z]?\d/.test(line) && CODE_HDR.test(line);
}

function parseGroupHeader(line) {
  const m = line.trim().match(GROUP_HDR);
  if (!m) return null;
  return { code: m[2], display: normalise(m[1]) };
}

function parseCodeHeader(line) {
  const m = line.match(CODE_HDR);
  if (!m) return null;
  return { code: m[1].trim(), display: normalise(m[2]) };
}

// ── block collection ──────────────────────────────────────────────────────────

/**
 * Walk lines and emit raw blocks.
 * Each block = { type: 'group'|'icd9', lines: string[] }
 * The first line is the header; subsequent lines are body lines (still raw).
 */
function collectBlocks(lines) {
  const blocks = [];
  let current = null;

  const flush = () => { if (current) { blocks.push(current); current = null; } };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      // blank line - keep current open; annotations can span blank lines
      continue;
    }

    if (isGroupHeader(trimmed)) {
      flush();
      current = { type: 'group', lines: [trimmed] };
    } else if (isCodeHeader(raw)) {
      flush();
      current = { type: 'icd9', lines: [raw] };
    } else {
      // continuation / annotation
      if (current) current.lines.push(raw);
      // lines before the first recognised header are silently dropped
    }
  }
  flush();
  return blocks;
}

// ── block -> record ────────────────────────────────────────────────────────────

/**
 * Given a list of body lines (after the header), split into named sections.
 * Returns { description, includes, excludes, note } - each a plain string or undefined.
 */
function parseSections(bodyLines) {
  const lines = bodyLines.map(normalise).filter(Boolean);

  const sections = { description: [], includes: [], excludes: [], note: [] };
  let cur = 'description';

  for (const line of lines) {
    if (/^includes?:/i.test(line)) {
      cur = 'includes';
      const rest = line.replace(/^includes?:\s*/i, '').trim();
      if (rest) sections.includes.push(rest);
    } else if (/^excludes?:/i.test(line)) {
      cur = 'excludes';
      const rest = line.replace(/^excludes?:\s*/i, '').trim();
      if (rest) sections.excludes.push(rest);
    } else if (/^note:/i.test(line)) {
      cur = 'note';
      const rest = line.replace(/^note:\s*/i, '').trim();
      if (rest) sections.note.push(rest);
    } else {
      sections[cur].push(line);
    }
  }

  const join = arr => arr.join(' ').replace(/\s+/g, ' ').trim() || undefined;
  return {
    description : join(sections.description),
    includes    : join(sections.includes),
    excludes    : join(sections.excludes),
    note        : join(sections.note),
  };
}

function parseBlock(block) {
  let header;
  if (block.type === 'group') {
    header = parseGroupHeader(block.lines[0]);
  } else {
    header = parseCodeHeader(block.lines[0]);
  }
  if (!header) return null;

  const sections = parseSections(block.lines.slice(1));

  return {
    code    : header.code,
    display : header.display,
    isGroup : block.type === 'group',
    ...sections,
  };
}

// ── hierarchy ─────────────────────────────────────────────────────────────────

/**
 * Find the best (narrowest) parent for a given code from codes already seen.
 * Parents always precede children in the source file.
 */
function findParent(code, seenCodes) {
  const isRange = /^[A-Z]?\d{1,3}-[A-Z]?\d{1,3}$/.test(code);

  // Helper: strip leading letter and parse int
  const numOf = s => parseInt(s.replace(/^[A-Z]/, ''), 10);

  if (isRange) {
    const [loStr, hiStr] = code.split('-');
    const lo = numOf(loStr), hi = numOf(hiStr);
    let best = null, bestSpan = Infinity;
    for (const c of seenCodes) {
      if (!/^[A-Z]?\d{1,3}-[A-Z]?\d{1,3}$/.test(c) || c === code) continue;
      const [pLo, pHi] = c.split('-').map(numOf);
      if (pLo <= lo && pHi >= hi) {
        const span = pHi - pLo;
        if (span < bestSpan) { best = c; bestSpan = span; }
      }
    }
    return best;
  }

  // Decimal code e.g. "002.1" -> try "002"
  const dotIdx = code.indexOf('.');
  if (dotIdx !== -1) {
    for (let len = code.length - 1; len >= dotIdx; len--) {
      const candidate = code.substring(0, len);
      if (seenCodes.includes(candidate)) return candidate;
    }
    const base = code.substring(0, dotIdx);
    if (seenCodes.includes(base)) return base;
  }

  // Integer code e.g. "002" -> find narrowest containing range
  const num = numOf(code);
  let best = null, bestSpan = Infinity;
  for (const c of seenCodes) {
    if (!/^[A-Z]?\d{1,3}-[A-Z]?\d{1,3}$/.test(c)) continue;
    const [pLo, pHi] = c.split('-').map(numOf);
    if (pLo <= num && pHi >= num) {
      const span = pHi - pLo;
      if (span < bestSpan) { best = c; bestSpan = span; }
    }
  }
  return best;
}

// ── FHIR CodeSystem builder ───────────────────────────────────────────────────

function buildFhirCodeSystem(records) {
  const byCode    = new Map(records.map(r => [r.code, r]));
  const parentOf  = new Map();
  const seenCodes = [];

  for (const r of records) {
    parentOf.set(r.code, findParent(r.code, seenCodes));
    seenCodes.push(r.code);
  }

  const childrenOf = new Map();
  for (const r of records) {
    const p = parentOf.get(r.code);
    if (p) {
      if (!childrenOf.has(p)) childrenOf.set(p, []);
      childrenOf.get(p).push(r.code);
    }
  }

  function buildConcept(code) {
    const r       = byCode.get(code);
    const concept = { code: r.code, display: r.display };

    const props = [];
    if (r.isGroup)     props.push({ code: 'notSelectable', valueBoolean: true });
    if (r.description) props.push({ code: 'description',   valueString: r.description });
    if (r.includes)    props.push({ code: 'includes',      valueString: r.includes });
    if (r.excludes)    props.push({ code: 'excludes',      valueString: r.excludes });
    if (r.note)        props.push({ code: 'note',          valueString: r.note });
    if (props.length)  concept.property = props;

    const kids = childrenOf.get(code);
    if (kids?.length)  concept.concept = kids.map(buildConcept);

    return concept;
  }

  const roots = records.filter(r => !parentOf.get(r.code));

  return {
    resourceType     : 'CodeSystem',
    id               : 'icd-9-cm',
    url              : 'http://hl7.org/fhir/sid/icd-9-cm',
    version          : '2015',
    name             : 'ICD9CM',
    title            : 'International Classification of Diseases, 9th Revision, Clinical Modification',
    status           : 'active',
    content          : 'complete',
    hierarchyMeaning : 'is-a',
    property         : [
      {
        code        : 'notSelectable',
        uri         : 'http://hl7.org/fhir/concept-properties#notSelectable',
        description : 'Grouping code not intended for direct coding',
        type        : 'boolean',
      },
      { code: 'description', description: 'Additional descriptive text', type: 'string' },
      { code: 'includes',    description: 'Inclusion notes',             type: 'string' },
      { code: 'excludes',    description: 'Exclusion notes',             type: 'string' },
      { code: 'note',        description: 'Additional notes',            type: 'string' },
    ],
    concept: roots.map(r => buildConcept(r.code)),
  };
}

// ── main ──────────────────────────────────────────────────────────────────────

function countAll(concepts) {
  if (!concepts) return 0;
  return concepts.reduce((n, c) => n + 1 + countAll(c.concept), 0);
}

function main() {
  const [,, inputFile, outputFile] = process.argv;
  if (!inputFile) {
    console.error('Usage: node parse-icd9.js <input-file> [output-file]');
    process.exit(1);
  }

  const outFile = outputFile || path.join(path.dirname(inputFile), 'icd9-cm.json');

  const text  = fs.readFileSync(inputFile, 'utf8');
  const lines = text.split(/\r?\n/);
  console.log(`Read ${lines.length} lines`);

  const blocks  = collectBlocks(lines);
  console.log(`Collected ${blocks.length} blocks`);

  const records = blocks.map(parseBlock).filter(Boolean);
  const groups  = records.filter(r => r.isGroup).length;
  console.log(`Parsed ${records.length} records  (${groups} groups, ${records.length - groups} codes)`);

  const cs = buildFhirCodeSystem(records);
  console.log(`CodeSystem has ${countAll(cs.concept)} concepts`);

  fs.writeFileSync(outFile, JSON.stringify(cs, null, 2), 'utf8');
  console.log(`Written -> ${outFile}`);
}

main();