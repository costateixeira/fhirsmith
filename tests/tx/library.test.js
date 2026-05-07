const {Library} = require("../../tx/library");
const path = require("path");
const {OperationContext, debugLog} = require("../../tx/operation-context");
const {Languages} = require("../../library/languages");

const NO_LOAD_TEST = true;

describe('Provider Test', () => {

  test('Full tx.fhir.org load', async () => {
    const isCI = process.env.CI === 'true';
    if (!NO_LOAD_TEST && !isCI) {
      let configFile = path.resolve(__dirname, '../../tx/tx.fhir.org.yml')
      let library = new Library(configFile);
      await library.load();
      expect(library.codeSystemFactories.size).toBeGreaterThan(0);
      expect(library.codeSystemProviders.length).toBeGreaterThan(0);
      expect(library.valueSetProviders.length).toBeGreaterThan(0);

      let r4 = await library.cloneWithFhirVersion("r4");

      expect(r4.codeSystemFactories.size).toEqual(library.codeSystemFactories.size);
      expect(r4.codeSystems.size).toBeGreaterThan(library.codeSystemProviders.length);
      expect(r4.valueSetProviders.length).toBeGreaterThanOrEqual(library.valueSetProviders.length);

      // Test all code system factories can produce providers
      await testAllCodeSystemFactories(r4);

      // Test random selection of loaded code systems can produce providers
      await testRandomCodeSystems(r4);
      await testCodeSystemProviderEdgeCases(r4);
    }
  }, 5000000);

  /**
   * Test that all loaded code system factories can successfully create CodeSystemProvider instances
   */
  async function testAllCodeSystemFactories(library) {
    console.log(`\nTesting ${library.codeSystemFactories.size} code system factories...`);

    const opContext = new OperationContext(Languages.fromAcceptLanguage("en"), library.i18n);
    let successCount = 0;
    let failureCount = 0;
    const failures = [];

    for (const [key] of library.codeSystemFactories.entries()) {
      try {
        // Parse system and version from key
        let system, version;
        if (key.includes('|')) {
          [system, version] = key.split('|');
        } else {
          system = key;
          version = null;
        }

        // Attempt to get a provider using getCodeSystemProvider
        const startTime = performance.now();
        const provider = await library.getCodeSystemProvider(opContext, system, version, []);
        const endTime = performance.now();

        if (provider) {
          successCount++;
          console.log(`✓ Successfully created provider for: ${key} in ${endTime - startTime} milliseconds`);
        } else {
          failureCount++;
          failures.push(`${key}: getCodeSystemProvider returned null`);
          console.log(`✗ Failed to create provider for: ${key} (returned null) in ${endTime - startTime} milliseconds`);
        }

      } catch (error) {
        debugLog(error);
        failureCount++;
        failures.push(`${key}: ${error.message}`);
        console.log(`✗ Error creating provider for ${key}: ${error.message}`);
      }
    }

    console.log(`\nCode System Factory Results:`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failures: ${failureCount}`);

    if (failures.length > 0) {
      console.log(`  Failed systems:`);
      failures.forEach(failure => console.log(`    - ${failure}`));
    }

    expect(failureCount).toBe(0);
  }

  /**
   * Test a random selection of loaded CodeSystem resources can create providers
   */
  async function testRandomCodeSystems(library) {
    console.log(`\nTesting random selection of ${library.codeSystems.size} loaded code systems...`);

    const opContext = new OperationContext(Languages.fromAcceptLanguage('en'));
    const codeSystemEntries = Array.from(library.codeSystems.entries());

    // Test up to 20 random code systems, or all if less than 20
    const sampleSize = Math.min(20, codeSystemEntries.length);
    const randomSample = getRandomSample(codeSystemEntries, sampleSize);

    let successCount = 0;
    let failureCount = 0;
    const failures = [];

    for (const [key, codeSystem] of randomSample) {
      try {
        // Test createCodeSystemProvider directly
        const provider = await library.createCodeSystemProvider(opContext, codeSystem, []);

        if (provider) {
          successCount++;
          console.log(`✓ Successfully created provider for CodeSystem: ${key}`);

          // Additional validation - check if provider has expected methods
          if (typeof provider.lookup === 'function') {
            console.log(`  - Provider has lookup method`);
          }
          if (typeof provider.validate === 'function') {
            console.log(`  - Provider has validate method`);
          }
        } else {
          failureCount++;
          failures.push(`${key}: createCodeSystemProvider returned null`);
          console.log(`✗ Failed to create provider for CodeSystem: ${key} (returned null)`);
        }

      } catch (error) {
        failureCount++;
        failures.push(`${key}: ${error.message}`);
        console.log(`✗ Error creating provider for CodeSystem ${key}: ${error.message}`);
      }
    }

    console.log(`\nCodeSystem Provider Results:`);
    console.log(`  Tested: ${randomSample.length} code systems`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failures: ${failureCount}`);

    if (failures.length > 0) {
      console.log(`  Failed systems:`);
      failures.forEach(failure => console.log(`    - ${failure}`));
    }

    // Assert that all tested code systems can create providers successfully
    expect(successCount).toEqual(randomSample.length);
    expect(failureCount).toEqual(0);
  }

  /**
   * Get a random sample from an array
   */
  function getRandomSample(array, sampleSize) {
    if (sampleSize >= array.length) {
      return array;
    }

    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, sampleSize);
  }


  /**
   * Test edge cases for createCodeSystemProvider
   */async function testCodeSystemProviderEdgeCases(library) {
    const opContext = new OperationContext(Languages.fromAcceptLanguage('en'));

    // Test with invalid parameters
    await expect(library.createCodeSystemProvider(null, {}, []))
      .rejects.toThrow("opContext must be provided");

    await expect(library.createCodeSystemProvider(opContext, null, []))
      .rejects.toThrow("codeSystem must be provided");

    await expect(library.createCodeSystemProvider(opContext, library.codeSystems.get("http://terminology.hl7.org/CodeSystem/adjudication-error"), "not-an-array"))
      .rejects.toThrow("supplements must be an array");

    // Test with valid CodeSystem if available
    if (library.codeSystems.size > 0) {
      const firstCodeSystem = library.codeSystems.values().next().value;
      const provider = await library.createCodeSystemProvider(opContext, firstCodeSystem, []);
      expect(provider).not.toBeNull();
    }
  }
});