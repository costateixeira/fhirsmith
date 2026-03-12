const nock = require('nock');
const { OCLBackgroundJobQueue } = require('../../tx/ocl/cs-ocl');
const path = require('path');

function resetQueueState() {
  OCLBackgroundJobQueue.pendingJobs = [];
  OCLBackgroundJobQueue.activeCount = 0;
  OCLBackgroundJobQueue.queuedOrRunningKeys = new Set();
  OCLBackgroundJobQueue.activeJobs = new Map();
  OCLBackgroundJobQueue.enqueueSequence = 0;
  if (OCLBackgroundJobQueue.heartbeatTimer) {
    clearInterval(OCLBackgroundJobQueue.heartbeatTimer);
    OCLBackgroundJobQueue.heartbeatTimer = null;
  }
}

describe('OCL Background Job Resilience', () => {
  const baseUrl = 'https://ocl.resilience.test';
  const conceptsUrl = '/orgs/org-a/sources/src1/concepts/';
  const meta = {
    id: 'src1',
    canonicalUrl: 'http://example.org/cs/source-one',
    version: '1.0.0',
    name: 'Source One',
    checksum: 'meta-1',
    conceptsUrl: `${baseUrl}${conceptsUrl}`,
    codeSystem: { jsonObj: { content: 'not-present' } }
  };
  // Instância real de I18nSupport para testes
  const { I18nSupport } = require('../../library/i18nsupport');
  const { LanguageDefinitions } = require('../../library/languages');
  const translationsPath = path.resolve(__dirname, '../../translations');
  const i18n = new I18nSupport(translationsPath, new LanguageDefinitions());

  beforeEach(() => {
    nock.cleanAll();
    resetQueueState();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  test('OCL API hard offline (connection refused) via job queue', async () => {
    nock(baseUrl)
      .get(conceptsUrl)
      .query(true)
      .replyWithError({ code: 'ECONNREFUSED', message: 'Connection refused' });

    const factory = new (require('../../tx/ocl/cs-ocl').OCLSourceCodeSystemFactory)(i18n, require('axios').create({ baseURL: baseUrl }), meta);
    let jobFailed = false;
    await new Promise((resolve) => {
      OCLBackgroundJobQueue.enqueue(
        'test:offline',
        'Test offline',
        async () => {
          await factory.httpClient.get(conceptsUrl);
        }
      );
      setTimeout(() => resolve(), 1500);
      const origError = console.error;
      console.error = (...args) => {
        if (String(args[0]).includes('Background job failed')) jobFailed = true;
        origError(...args);
      };
    });
    expect(jobFailed).toBe(true);
    expect(OCLBackgroundJobQueue.activeCount).toBe(0);
  });

  test('OCL API hangs (timeout) via job queue', async () => {
    nock(baseUrl)
      .get(conceptsUrl)
      .query(true)
      .delayConnection(2000)
      .reply(200, { results: [] });

    const factory = new (require('../../tx/ocl/cs-ocl').OCLSourceCodeSystemFactory)(i18n, require('axios').create({ baseURL: baseUrl, timeout: 1000 }), meta);
    let jobFailed = false;
    await new Promise((resolve) => {
      OCLBackgroundJobQueue.enqueue(
        'test:hang',
        'Test hang',
        async () => {
          await factory.httpClient.get(conceptsUrl);
        }
      );
      setTimeout(() => resolve(), 2500);
      const origError = console.error;
      console.error = (...args) => {
        if (String(args[0]).includes('Background job failed')) jobFailed = true;
        origError(...args);
      };
    });
    expect(jobFailed).toBe(true);
    expect(OCLBackgroundJobQueue.activeCount).toBe(0);
  });

  test('OCL API returns 500 repeatedly via job queue', async () => {
    nock(baseUrl)
      .get(conceptsUrl)
      .query(true)
      .times(2)
      .reply(500, 'Internal Server Error');

    const factory = new (require('../../tx/ocl/cs-ocl').OCLSourceCodeSystemFactory)(i18n, require('axios').create({ baseURL: baseUrl }), meta);
    let jobFailed = false;
    await new Promise((resolve) => {
      OCLBackgroundJobQueue.enqueue(
        'test:500',
        'Test 500',
        async () => {
          await factory.httpClient.get(conceptsUrl);
        }
      );
      setTimeout(() => resolve(), 1500);
      const origError = console.error;
      console.error = (...args) => {
        if (String(args[0]).includes('Background job failed')) jobFailed = true;
        origError(...args);
      };
    });
    expect(jobFailed).toBe(true);
    expect(OCLBackgroundJobQueue.activeCount).toBe(0);
  });

  test('OCL API returns malformed payload via job queue', async () => {
    nock(baseUrl)
      .get(conceptsUrl)
      .query(true)
      .reply(200, 'not-json');

    const factory = new (require('../../tx/ocl/cs-ocl').OCLSourceCodeSystemFactory)(i18n, require('axios').create({ baseURL: baseUrl }), meta);
    let jobFailed = false;
    await new Promise((resolve) => {
      OCLBackgroundJobQueue.enqueue(
        'test:malformed',
        'Test malformed',
        async () => {
          // Aciona o fluxo real de parsing/validação
          await factory.listCodeSystems('5.0', null);
        }
      );
      setTimeout(() => resolve(), 1500);
      const origError = console.error;
      console.error = (...args) => {
        if (String(args[0]).includes('Background job failed')) jobFailed = true;
        origError(...args);
      };
    });
    expect(jobFailed).toBe(true);
    expect(OCLBackgroundJobQueue.activeCount).toBe(0);
  });

  test('Multiple failures in sequence do not block queue', async () => {
    nock(baseUrl)
      .get(conceptsUrl)
      .query(true)
      .times(2)
      .reply(500, 'Internal Server Error');

    const factory = new (require('../../tx/ocl/cs-ocl').OCLSourceCodeSystemFactory)(i18n, require('axios').create({ baseURL: baseUrl }), meta);
    let jobFailedCount = 0;
    await new Promise((resolve) => {
      OCLBackgroundJobQueue.enqueue(
        'test:fail1',
        'Test fail1',
        async () => {
          await factory.httpClient.get(conceptsUrl);
        }
      );
      OCLBackgroundJobQueue.enqueue(
        'test:fail2',
        'Test fail2',
        async () => {
          await factory.httpClient.get(conceptsUrl);
        }
      );
      setTimeout(() => resolve(), 2000);
      const origError = console.error;
      console.error = (...args) => {
        if (String(args[0]).includes('Background job failed')) jobFailedCount++;
        origError(...args);
      };
    });
    expect(jobFailedCount).toBe(2);
    expect(OCLBackgroundJobQueue.activeCount).toBe(0);
  });

  // Add more tests for partial/truncated response, recovery after outage, etc.
});
