// k6 load test script
// Run: docker run --rm -i --network host grafana/k6 run - <load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  duration: '3m',
  vus: 50, // concurrent users
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests under 500ms
  },
};

const BASE_URL = 'http://host.docker.internal:3000/tx/r4';

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
  // Pick random endpoint
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${BASE_URL}${endpoint}`;

  const res = http.get(url, {
    headers: { Accept: 'application/fhir+json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // No sleep = maximum throughput
}
