const { Library } = require('../../tx/library');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

describe('Library error handling', () => {
  let tmpDir;
  let yamlPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lib-test-'));
    yamlPath = path.join(tmpDir, 'library.yml');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  function createLibrary(configFile) {
    const log = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    const stats = { addStat: jest.fn() };
    return { library: new Library(configFile, undefined, log, stats), log };
  }

  test('failed source reports which source failed and throws', async () => {
    await fs.writeFile(yamlPath, [
      'base:',
      '  url: https://storage.googleapis.com/tx-fhir-org',
      'sources:',
      '  - internal:lang',
      '  - internal:INVALID_SOURCE',
      '  - internal:country',
    ].join('\n'));

    const { library } = createLibrary(yamlPath);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(library.load()).rejects.toThrow();

    // The error message should identify the failing source
    const errorMessages = consoleSpy.mock.calls.map(c => c[0]);
    expect(errorMessages.some(msg => msg.includes('INVALID_SOURCE'))).toBe(true);

    consoleSpy.mockRestore();
  }, 30000);

  test('error message includes source name on fetch failure', async () => {
    await fs.writeFile(yamlPath, [
      'base:',
      '  url: https://storage.googleapis.com/tx-fhir-org',
      'sources:',
      '  - npm:nonexistent.package.that.does.not.exist#99.99.99',
    ].join('\n'));

    const { library } = createLibrary(yamlPath);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(library.load()).rejects.toThrow();

    const errorMessages = consoleSpy.mock.calls.map(c => c[0]);
    expect(errorMessages.some(msg => msg.includes('nonexistent.package'))).toBe(true);

    consoleSpy.mockRestore();
  }, 60000);

  test('load succeeds with empty sources', async () => {
    await fs.writeFile(yamlPath, [
      'base:',
      '  url: https://storage.googleapis.com/tx-fhir-org',
      'sources: []',
    ].join('\n'));

    const { library, log } = createLibrary(yamlPath);
    await library.load();

    expect(log.error).not.toHaveBeenCalled();
  }, 30000);

  test('load succeeds with valid sources', async () => {
    await fs.writeFile(yamlPath, [
      'base:',
      '  url: https://storage.googleapis.com/tx-fhir-org',
      'sources:',
      '  - internal:lang',
      '  - internal:country',
    ].join('\n'));

    const { library } = createLibrary(yamlPath);
    await library.load();

    expect(library.codeSystemFactories.size).toBeGreaterThanOrEqual(2);
  }, 30000);
});
