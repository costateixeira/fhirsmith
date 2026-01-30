
const FhirValidator = require('fhir-validator-wrapper');
const express = require('express');
const path = require('path');
const fs = require('fs');
const TXModule = require('../tx/tx.js');
const ServerStats = require("../stats");
const Logger = require("../common/logger");

async function startTxTests() {
    await startServer();
    await loadValidator();
}

async function  finishTxTests() {
    await unloadValidator();
    await stopServer();
}

async function runTest(test) {
    const params = {
        server: 'http://localhost:'+TEST_PORT+"/r5",
        suiteName: test.suite,
        testName: test.test,
        version: '5.0'
    };
    const result = await validator.runTxTest(params);
    expect(result).toEqual({ result: true });
}


const TEST_PORT = 9095;
const VALIDATOR_PORT = 9096;
const TEST_CONFIG_FILE = path.join(__dirname, 'fixtures', 'test-cases-setup.json');

let server = null;
let validator = null;
let txModule = null;
let log = null;
let stats = null;

async function startServer() {
    const app = express();

    // Load test configuration
    let config;
    try {
        const configData = fs.readFileSync(TEST_CONFIG_FILE, 'utf8');
        config = JSON.parse(configData);
    } catch (error) {
        throw new Error(`Failed to load test config: ${error.message}`);
    }

    // Middleware
    app.use(express.raw({ type: 'application/fhir+json', limit: '50mb' }));
    app.use(express.raw({ type: 'application/fhir+xml', limit: '50mb' }));
    app.use(express.json({ limit: '50mb' }));

    // Initialize TX module only
    stats = new ServerStats();
    txModule = new TXModule(stats);
    await txModule.initialize(config, app);

    return new Promise((resolve, reject) => {
        server = app.listen(TEST_PORT, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Test server started on port ${TEST_PORT}`);
                resolve();
            }
        });
    });
}

async function stopServer() {
    stats.finishStats();

    if (txModule && typeof txModule.shutdown === 'function') {
        await txModule.shutdown();
        txModule = null;
    }

    if (server) {
        return new Promise((resolve) => {
            server.closeAllConnections();
            server.close(() => {
                console.log('Test server stopped');
                server = null;
                resolve();
            });
        });
    }
}

async function loadValidator() {
    const validatorJarPath = path.join(__dirname, '../bin/validator_cli.jar');
    log =  Logger.getInstance().child({ module: 'test-runner' });
    validator = new FhirValidator(validatorJarPath, log);
    const validatorConfig = {
        version : '4.0',
        txServer : 'http://tx-dev.fhir.org',
        txLog : path.join(__dirname, '../logs/text-cases.log'),
        port: VALIDATOR_PORT,
        timeout: 60000
    }
    await validator.start(validatorConfig);
}


async function unloadValidator() {

    // Stop FHIR validator
    if (validator) {
        try {
            log.info('Stopping FHIR validator...');
            await validator.stop();
            log.info('FHIR validator stopped');
        } catch (error) {
            log.error('Error stopping FHIR validator:', error);
        }
        validator = null;
    }

}
module.exports = { startTxTests, finishTxTests, runTest };