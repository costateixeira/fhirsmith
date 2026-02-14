import http from 'http';
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';

const LISTEN_PORT = 3002;
const PROD_HOST = '127.0.0.1';
const PROD_PORT = 3001;
const DEV_HOST = 'tx-dev.fhir.org';
const DEV_PORT = 443;
const DEV_HTTPS = true;
const LOG_LOCATION = '/Users/grahamegrieve/temp/tx-comp-log/log.ndjson'; // 'T:\\logs\\comparison.ndjson';

const logStream = fs.createWriteStream(LOG_LOCATION, { flags: 'a' });

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function forward(method, url, headers, body, host, port, useHttps = false) {
  return new Promise((resolve, reject) => {
    const mod = useHttps ? https : http;
    const req = mod.request({
      hostname: host,
      port,
      path: url,
      method,
      headers: { ...headers, host: 'tx.fhir.org' },
      timeout: 600000,
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

function isJsonRequest(req) {
  const accept = (req.headers['accept'] || '').toLowerCase();
  const ct = (req.headers['content-type'] || '').toLowerCase();
  return accept.includes('json') || accept.includes('fhir') ||
    ct.includes('json') || ct.includes('fhir');
}

function summarise(result) {
  if (result.status === 'rejected') {
    return { error: result.reason?.message || 'unknown' };
  }
  const r = result.value;
  return {
    status: r.status,
    contentType: r.headers['content-type'] || '',
    size: r.body.length,
    hash: crypto.createHash('md5').update(r.body).digest('hex'),
  };
}

http.createServer(async (req, res) => {
  const body = await collectBody(req);

  if (!isJsonRequest(req)) {
    try {
      const prod = await forward(req.method, req.url, req.headers, body, PROD_HOST, PROD_PORT);
      res.writeHead(prod.status, prod.headers);
      res.end(prod.body);
    } catch (e) {
      res.writeHead(502);
      res.end('Bad Gateway');
    }
    return;
  }

  const [prodResult, devResult] = await Promise.allSettled([
    forward(req.method, req.url, req.headers, body, PROD_HOST, PROD_PORT),
    forward(req.method, req.url, req.headers, body, DEV_HOST, DEV_PORT, DEV_HTTPS),
  ]);

  const prodSummary = summarise(prodResult);
  const devSummary = summarise(devResult);
  const match = prodSummary.hash === devSummary.hash && prodSummary.status === devSummary.status;

  const logEntry = {
    ts: new Date().toISOString(),
    id: crypto.randomUUID(),
    method: req.method,
    url: req.url,
    match,
    prod: prodSummary,
    dev: devSummary,
  };

  if (!match) {
    if (prodResult.status === 'fulfilled') logEntry.prodBody = prodResult.value.body.toString('utf8').substring(0, 50000);
    if (devResult.status === 'fulfilled') logEntry.devBody = devResult.value.body.toString('utf8').substring(0, 50000);
  }

  logStream.write(JSON.stringify(logEntry) + '\n');

  if (prodResult.status === 'fulfilled') {
    const p = prodResult.value;
    res.writeHead(p.status, p.headers);
    res.end(p.body);
  } else {
    res.writeHead(502);
    res.end('Bad Gateway');
  }
}).listen(LISTEN_PORT);

console.log(`Comparison proxy listening on port ${LISTEN_PORT}`);
console.log(`Production: ${PROD_HOST}:${PROD_PORT} | Dev: ${DEV_HOST}:${DEV_PORT}${DEV_HTTPS ? ' (HTTPS)' : ''}`);