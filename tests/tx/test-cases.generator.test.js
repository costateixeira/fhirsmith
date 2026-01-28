const fs = require('fs');
const path = require('path');

const TEST_CASES_FILE = '/Users/grahamegrieve/igs/fhir-tx-ecosystem-ig/tests/test-cases.json';
const OUTPUT_FILE = path.join(__dirname, 'test-cases.test.js');


function generate() {
    const testCases = JSON.parse(fs.readFileSync(TEST_CASES_FILE, 'utf8'));
    let output = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from test-cases.json
// Regenerate with: node generate-tests.js

const { runTest, startTxTests, finishTxTests } = require('../../tx/test-runner');

describe('Tx Tests', () => {

  beforeAll(async () => {
    await startTxTests();
  });
  afterAll(async () => {
    await finishTxTests();
  });
`;

    for (const suite of testCases.suites) {
        output += `describe('${suite.name}', () => {\n`;

        if (suite.description) {
            output += `  // ${suite.description}\n\n`;
        }

        for (const test of suite.tests) {
            let testDetails = {
                suite: suite.name,
                test: test.name
            }

            const escapedName = test.name.replace(/'/g, "\\'");
            output += `  it('${escapedName}', async () => {\n`;
            output += `    await runTest(${JSON.stringify(testDetails)});\n`;
            output += `  });\n\n`;
        }

        output += `});\n\n`;
    }

    output += `});\n\n`;
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Generated ${OUTPUT_FILE}`);
}

describe('Generate Test Cases', () => {
    test('Do Generation', () => {
        generate();
        expect(true).toBeTruthy();
    });
 }
);