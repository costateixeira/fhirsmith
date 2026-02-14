const fs = require('fs');
const TestUtils = require('./utils/test-utils');
const folders = require('../library/folder-setup');

// Global test setup
beforeAll(() => {
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';

  global.console = require('console');

  // Suppress console.log during tests (optional)
  if (process.env.SUPPRESS_LOGS === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

const testDirs = [
  folders.ensureFolder('terminology-cache/vsac')
];

for (const dir of testDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

afterAll(async () => {
  // Clean up any test files or connections
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock external dependencies that we don't want to actually call during tests
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({ stop: jest.fn() }))
}));

// Global test utilities
global.TEST_TIMEOUT = 120000;
global.TestUtils = {
  createTempDir: () => {
    const tmp = require('tmp');
    return tmp.dirSync({ unsafeCleanup: true });
  },

  createTempFile: (content = '') => {
    const tmp = require('tmp');
    const tmpFile = tmp.fileSync();
    if (content) {
      fs.writeFileSync(tmpFile.name, content);
    }
    return tmpFile;
  },

  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to wait for a condition
  waitFor: async (condition, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await TestUtils.delay(50);
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};
