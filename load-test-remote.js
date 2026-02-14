// k6 load test script for remote execution
//
// Usage:
//   k6 run -e SERVER=192.168.1.100:3000 load-test-remote.js
//   k6 run -e SERVER=myserver.example.com:3000 -e DURATION=5m -e VUS=100 load-test-remote.js
//
// Or with Docker:
//   docker run --rm -i grafana/k6 run -e SERVER=192.168.1.100:3000 - <load-test-remote.js

import http from 'k6/http';
import { check } from 'k6';

// Configuration from environment variables
const SERVER = __ENV.SERVER || 'localhost:3000';
const BASE_URL = `http://${SERVER}/tx/r4`;

export const options = {
  duration: __ENV.DURATION || '3m',
  vus: parseInt(__ENV.VUS) || 50,
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

const endpoints = [
  '/metadata',
  '/CodeSystem?_count=10',
  '/ValueSet?_count=10',
  '/CodeSystem/$lookup?system=http://snomed.info/sct&code=73211009',
  '/CodeSystem/$lookup?system=http://snomed.info/sct&code=22298006',
  '/CodeSystem/$lookup?system=http://loinc.org&code=8867-4',
  '/CodeSystem?url=http://snomed.info/sct',
  '/CodeSystem?url=http://loinc.org',
];

export default function () {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${BASE_URL}${endpoint}`;

  const res = http.get(url, {
    headers: { Accept: 'application/fhir+json' },
    timeout: '30s',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const metrics = data.metrics;
  return `
================================================================================
                           LOAD TEST RESULTS
================================================================================
Target Server: ${SERVER}
Duration: ${options.duration}
Virtual Users: ${options.vus}

REQUESTS:
  Total:      ${metrics.http_reqs.values.count}
  Rate:       ${metrics.http_reqs.values.rate.toFixed(2)}/s
  Failed:     ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%

RESPONSE TIMES:
  Average:    ${metrics.http_req_duration.values.avg.toFixed(2)}ms
  Min:        ${metrics.http_req_duration.values.min.toFixed(2)}ms
  Max:        ${metrics.http_req_duration.values.max.toFixed(2)}ms
  p(90):      ${metrics.http_req_duration.values['p(90)'].toFixed(2)}ms
  p(95):      ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms

DATA:
  Received:   ${(metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB
  Sent:       ${(metrics.data_sent.values.count / 1024 / 1024).toFixed(2)} MB
================================================================================
`;
}
