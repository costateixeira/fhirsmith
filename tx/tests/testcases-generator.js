const fs = require('fs');
const path = require('path');
const { PackageManager} = require("../../library/package-manager");
const {txTestModeSet} = require("./test-runner");
const folders = require('../../library/folder-setup');

const OUTPUT_FILE1 = path.join(__dirname, '../..', 'tests/tx/test-cases.test.js');
const OUTPUT_FILE2 = path.join(__dirname, 'test-cases-version.js');

// we generate the skeleton of the tests so that we have a stable set of tests
// for useability in jest etc. We haven't ported all the test code - that can
// stay in the java validator. We actually execute the test cases by loading
// the java validator in server mode, and then using it to actually execute
// the tests
let npm;
let testCases;

async function load() {
    const packageServers = ['https://packages2.fhir.org/packages'];
    const cacheFolder = folders.ensureFolder('terminology-cache');
    const packageManager = new PackageManager(packageServers, cacheFolder);
    const packagePath = await packageManager.fetch("hl7.fhir.uv.tx-ecosystem", "current");
    const fullPackagePath = path.join(cacheFolder, packagePath);
    npm = JSON.parse(fs.readFileSync(path.join(fullPackagePath, "package", "package.json"), 'utf8'));
    testCases = JSON.parse(fs.readFileSync(path.join(fullPackagePath, "package", "tests", "test-cases.json"), 'utf8'));
}

function generate() {
    const modes = txTestModeSet();

    let output2 = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from test-cases.json
// Regenerate with: node generate-tests.js

function txTestVersion() {
  return '${npm.version}';
}
module.exports = { txTestVersion };
`;

    let output = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from test-cases.json
// Regenerate with: node generate-tests.js

const { runTest, startTxTests, finishTxTests } = require('../../tx/tests/test-runner');

describe('Tx Tests', () => {

  beforeAll(async () => {
    await startTxTests();
  }, 600000);
  afterAll(async () => {
    await finishTxTests();
  });
`;

    for (const suite of testCases.suites) {
        if (!suite.mode || modes.has(suite.mode)) {
            output += `describe('${suite.name}', () => {\n`;

            if (suite.description) {
                output += `  // ${suite.description}\n\n`;
            }

            for (const test of suite.tests) {
                if ((!test.mode || modes.has(test.mode)) && (!test["full-set"])) {
                    let testDetails = {
                        suite: suite.name,
                        test: test.name
                    }

                    const escapedName = test.name.replace(/'/g, "\\'");
                    if (!test.version || test.version.startsWith("5.0")) {
                        output += `  it('${escapedName}R5', async () => {\n`;
                        output += `    await runTest(${JSON.stringify(testDetails)}, "5.0");\n`;
                        output += `  });\n\n`;
                    }
                    if (!test.version || test.version.startsWith("4.0")) {
                        output += `  it('${escapedName}R4', async () => {\n`;
                        output += `    await runTest(${JSON.stringify(testDetails)}, "4.0");\n`;
                        output += `  });\n\n`;
                    }
                }
            }
            output += `});\n\n`;
        }
    }
    output += `});\n\n`;
  fs.writeFileSync(OUTPUT_FILE1, output);
  console.log(`Generated ${OUTPUT_FILE1}`);
  fs.writeFileSync(OUTPUT_FILE2, output2);
  console.log(`Generated ${OUTPUT_FILE2}`);
}

async function generateTestCases() {
  await load();
  generate();
}

// Run if executed directly (not required/imported)
if (require.main === module) {
    generateTestCases().catch(console.error);
}

module.exports = { generateTestCases };
