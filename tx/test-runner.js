
const FhirValidator = require('fhir-validator-wrapper');

async function startTxTests() {
    await startServer();
    await loadValidator();
}

async function  finishTxTests() {
    await unloadValidator();
    await stopServer();
}


async function runTest(test) {
    expect(true).toBe(false);
}

module.exports = { startTxTests, finishTxTests, runTest };