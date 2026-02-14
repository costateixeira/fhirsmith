import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = '/Users/grahamegrieve/temp/tx-comp/';

function stripDiagnostics(jsonStr) {
  let obj;
  try { obj = JSON.parse(jsonStr); } catch { return null; }
  if (obj.resourceType === 'Parameters' && Array.isArray(obj.parameter)) {
    obj.parameter = obj.parameter.filter(p => p.name !== 'diagnostics');
  }
  return obj;
}

const files = readdirSync(dir).filter(f => f.startsWith('system-') && f.endsWith('.ndjson'));

let totalWritten = 0;
let totalSkipped = 0;

for (const file of files) {
  const subdir = join(dir, file.replace('.ndjson', ''));
  let prodDirCreated = false;
  let devDirCreated = false;
  const prodDir = join(subdir, 'prod');
  const devDir = join(subdir, 'dev');

  const lines = readFileSync(join(dir, file), 'utf8').split('\n').filter(l => l.trim());
  let written = 0;
  let skipped = 0;
  for (const line of lines) {
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    const id = obj.id || `unknown-${written + skipped}`;

    const prod = obj.prodBody ? stripDiagnostics(obj.prodBody) : null;
    const dev = obj.devBody ? stripDiagnostics(obj.devBody) : null;

    // Compare after stripping diagnostics
    const prodStr = prod ? JSON.stringify(prod) : '';
    const devStr = dev ? JSON.stringify(dev) : '';
    if (prodStr === devStr) {
      skipped++;
      continue;
    }

    // They differ - write them out
    if (!prodDirCreated) { mkdirSync(prodDir, { recursive: true }); prodDirCreated = true; }
    if (!devDirCreated) { mkdirSync(devDir, { recursive: true }); devDirCreated = true; }

    if (prod) writeFileSync(join(prodDir, `${id}.json`), JSON.stringify(prod, null, 2) + '\n');
    if (dev) writeFileSync(join(devDir, `${id}.json`), JSON.stringify(dev, null, 2) + '\n');
    written++;
  }
  totalWritten += written;
  totalSkipped += skipped;
  console.log(`${file}: ${written} differ, ${skipped} match (after removing diagnostics)`);
}
console.log(`\nDone. ${totalWritten} written, ${totalSkipped} skipped.`);
