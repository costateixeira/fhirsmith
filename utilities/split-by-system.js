import { createReadStream, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { createHash } from 'crypto';

const inputFile = '/Users/grahamegrieve/temp/tx-comp/comparison.ndjson';
const outDir = '/Users/grahamegrieve/temp/tx-comp/';

// Map well-known system URLs to short names
const systemNames = {
  'http://snomed.info/sct': 'snomed',
  'http://loinc.org': 'loinc',
  'http://unitsofmeasure.org': 'ucum',
  'http://hl7.org/fhir/sid/icd-10': 'icd10',
  'http://hl7.org/fhir/sid/icd-10-cm': 'icd10cm',
  'http://hl7.org/fhir/sid/icd-9-cm': 'icd9cm',
  'http://www.nlm.nih.gov/research/umls/rxnorm': 'rxnorm',
  'http://hl7.org/fhir/sid/ndc': 'ndc',
  'http://www.ama-assn.org/go/cpt': 'cpt',
  'urn:ietf:bcp:13': 'mimetypes',
  'urn:ietf:bcp:47': 'bcp47',
  'urn:iso:std:iso:3166': 'iso3166',
  'urn:iso:std:iso:4217': 'iso4217',
};

let unknownCounter = 0;
const unknownMap = new Map(); // url -> assigned name

function nameForSystem(url) {
  if (!url) return null;
  // exact match
  if (systemNames[url]) return systemNames[url];
  // check if it starts with a known prefix (for versioned URLs like snomed with editions)
  for (const [key, name] of Object.entries(systemNames)) {
    if (url.startsWith(key)) return name;
  }
  // try to derive a name from the URL
  if (url.startsWith('http://hl7.org/fhir/')) {
    // e.g. http://hl7.org/fhir/administrative-gender -> administrative-gender
    const parts = url.replace('http://hl7.org/fhir/', '').split('/');
    const last = parts[parts.length - 1];
    if (last && last.length > 0 && last.length < 60) return 'fhir-' + last;
  }
  if (url.startsWith('http://terminology.hl7.org/')) {
    const parts = url.replace('http://terminology.hl7.org/', '').split('/');
    const last = parts[parts.length - 1];
    if (last && last.length > 0 && last.length < 60) return 'tho-' + last;
  }
  if (url.startsWith('http://hl7.org/fhir/v2/')) {
    return 'v2-' + url.replace('http://hl7.org/fhir/v2/', '').replace(/\//g, '-');
  }
  if (url.startsWith('http://hl7.org/fhir/v3/') || url.startsWith('http://terminology.hl7.org/CodeSystem/v3-')) {
    const tail = url.includes('v3/') ? url.split('v3/').pop() : url.split('v3-').pop();
    return 'v3-' + tail.replace(/\//g, '-');
  }
  // fall back to numbered
  if (unknownMap.has(url)) return unknownMap.get(url);
  unknownCounter++;
  const name = 'n' + String(unknownCounter).padStart(3, '0');
  unknownMap.set(url, name);
  return name;
}

function extractSystems(line) {
  let obj;
  try { obj = JSON.parse(line); } catch { return null; }

  const systems = new Set();
  const reqBody = obj.requestBody;
  if (!reqBody) return { systems: new Set(), obj };

  let req;
  try { req = JSON.parse(reqBody); } catch { return { systems: new Set(), obj }; }

  // Walk the parameters looking for system values, codings, codeableConcepts
  if (req.parameter) {
    for (const p of req.parameter) {
      if (p.name === 'system' && p.valueUri) {
        systems.add(p.valueUri);
      }
      if (p.name === 'coding' && p.valueCoding?.system) {
        systems.add(p.valueCoding.system);
      }
      if (p.name === 'codeableConcept' && p.valueCodeableConcept?.coding) {
        for (const c of p.valueCodeableConcept.coding) {
          if (c.system) systems.add(c.system);
        }
      }
      if (p.name === 'url' && p.valueUri) {
        // This is a ValueSet URL, not a system - skip
      }
      // For batch-validate, look inside nested resources
      if (p.name === 'validation' && p.resource?.parameter) {
        for (const inner of p.resource.parameter) {
          if (inner.name === 'system' && inner.valueUri) systems.add(inner.valueUri);
          if (inner.name === 'coding' && inner.valueCoding?.system) systems.add(inner.valueCoding.system);
          if (inner.name === 'codeableConcept' && inner.valueCodeableConcept?.coding) {
            for (const c of inner.valueCodeableConcept.coding) {
              if (c.system) systems.add(c.system);
            }
          }
        }
      }
    }
  }

  // Also check if it's a Bundle (batch)
  if (req.entry) {
    for (const entry of req.entry) {
      const res = entry.resource;
      if (res?.parameter) {
        for (const p of res.parameter) {
          if (p.name === 'system' && p.valueUri) systems.add(p.valueUri);
          if (p.name === 'coding' && p.valueCoding?.system) systems.add(p.valueCoding.system);
          if (p.name === 'codeableConcept' && p.valueCodeableConcept?.coding) {
            for (const c of p.valueCodeableConcept.coding) {
              if (c.system) systems.add(c.system);
            }
          }
        }
      }
    }
  }

  return { systems, obj };
}

async function run() {
  const seenHashes = new Set();
  const fileLines = new Map(); // filename -> lines[]
  let totalLines = 0;
  let dupes = 0;
  let noSystem = 0;

  const rl = createInterface({
    input: createReadStream(inputFile),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    totalLines++;

    // Hash the requestBody for dedup (not the whole line, since prod/dev responses differ)
    let parsed;
    try { parsed = JSON.parse(line); } catch { continue; }

    const hashInput = (parsed.method || '') + '|' + (parsed.url || '') + '|' + (parsed.requestBody || '');
    const hash = createHash('md5').update(hashInput).digest('hex');

    if (seenHashes.has(hash)) {
      dupes++;
      continue;
    }
    seenHashes.add(hash);

    const result = extractSystems(line);
    if (!result) continue;

    const { systems } = result;

    let filename;
    if (systems.size === 0) {
      noSystem++;
      filename = 'system-unknown.ndjson';
    } else if (systems.size === 1) {
      const sysUrl = [...systems][0];
      const name = nameForSystem(sysUrl);
      filename = `system-${name}.ndjson`;
    } else {
      filename = 'system-multiple.ndjson';
    }

    if (!fileLines.has(filename)) fileLines.set(filename, []);
    fileLines.get(filename).push(line);

    if (totalLines % 50000 === 0) {
      console.log(`  processed ${totalLines} lines...`);
    }
  }

  // Write all files
  for (const [filename, lines] of fileLines) {
    const path = outDir + filename;
    writeFileSync(path, lines.join('\n') + '\n');
    console.log(`  ${filename}: ${lines.length} entries`);
  }

  console.log(`\nDone. ${totalLines} total lines, ${dupes} duplicates removed, ${noSystem} with no system found.`);

  // Write the unknown system mapping
  if (unknownMap.size > 0) {
    const mapping = Object.fromEntries(unknownMap);
    writeFileSync(outDir + 'system-mapping.json', JSON.stringify(mapping, null, 2));
    console.log(`\nUnknown system mapping written to system-mapping.json (${unknownMap.size} systems)`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
