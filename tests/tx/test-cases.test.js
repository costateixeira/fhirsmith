// AUTO-GENERATED FILE - DO NOT EDIT
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
describe('metadata', () => {
  // tests for minimal requirements for metadata statements

  it('metadataR5', async () => {
    await runTest({"suite":"metadata","test":"metadata"}, "5.0");
  });

  it('metadataR4', async () => {
    await runTest({"suite":"metadata","test":"metadata"}, "4.0");
  });

  it('term-capsR5', async () => {
    await runTest({"suite":"metadata","test":"term-caps"}, "5.0");
  });

  it('term-capsR4', async () => {
    await runTest({"suite":"metadata","test":"term-caps"}, "4.0");
  });

});

describe('simple-cases', () => {
  // basic tests, setting up for the API tests to come

  it('simple-expand-allR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-all"}, "5.0");
  });

  it('simple-expand-allR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-all"}, "4.0");
  });

  it('simple-expand-activeR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-active"}, "5.0");
  });

  it('simple-expand-activeR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-active"}, "4.0");
  });

  it('simple-expand-inactiveR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-inactive"}, "5.0");
  });

  it('simple-expand-inactiveR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-inactive"}, "4.0");
  });

  it('simple-expand-enumR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-enum"}, "5.0");
  });

  it('simple-expand-enumR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-enum"}, "4.0");
  });

  it('simple-expand-enum-badR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-enum-bad"}, "5.0");
  });

  it('simple-expand-enum-badR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-enum-bad"}, "4.0");
  });

  it('simple-expand-isaR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa"}, "5.0");
  });

  it('simple-expand-isaR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa"}, "4.0");
  });

  it('simple-expand-isa-o2R5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-o2"}, "5.0");
  });

  it('simple-expand-isa-o2R4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-o2"}, "4.0");
  });

  it('simple-expand-isa-c2R5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-c2"}, "5.0");
  });

  it('simple-expand-isa-c2R4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-c2"}, "4.0");
  });

  it('simple-expand-isa-o2c2R5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-o2c2"}, "5.0");
  });

  it('simple-expand-isa-o2c2R4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-o2c2"}, "4.0");
  });

  it('simple-expand-propR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-prop"}, "5.0");
  });

  it('simple-expand-propR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-prop"}, "4.0");
  });

  it('simple-expand-regexR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regex"}, "5.0");
  });

  it('simple-expand-regexR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regex"}, "4.0");
  });

  it('simple-expand-regex2R5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regex2"}, "5.0");
  });

  it('simple-expand-regex2R4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regex2"}, "4.0");
  });

  it('simple-expand-regexp-propR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regexp-prop"}, "5.0");
  });

  it('simple-expand-regexp-propR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regexp-prop"}, "4.0");
  });

  it('simple-lookup-1R5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-lookup-1"}, "5.0");
  });

  it('simple-lookup-1R4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-lookup-1"}, "4.0");
  });

  it('simple-lookup-2R5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-lookup-2"}, "5.0");
  });

  it('simple-lookup-2R4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-lookup-2"}, "4.0");
  });

  it('simple-expand-all-countR5', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-all-count"}, "5.0");
  });

  it('simple-expand-all-countR4', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-all-count"}, "4.0");
  });

});

describe('parameters', () => {
  // Testing out the various expansion parameters that the IG publisher makes use of

  it('parameters-expand-all-hierarchyR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-hierarchy"}, "5.0");
  });

  it('parameters-expand-all-hierarchyR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-hierarchy"}, "4.0");
  });

  it('parameters-expand-enum-hierarchyR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-hierarchy"}, "5.0");
  });

  it('parameters-expand-enum-hierarchyR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-hierarchy"}, "4.0");
  });

  it('parameters-expand-isa-hierarchyR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-hierarchy"}, "5.0");
  });

  it('parameters-expand-isa-hierarchyR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-hierarchy"}, "4.0");
  });

  it('parameters-expand-all-activeR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-active"}, "5.0");
  });

  it('parameters-expand-all-activeR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-active"}, "4.0");
  });

  it('parameters-expand-active-activeR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-active-active"}, "5.0");
  });

  it('parameters-expand-active-activeR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-active-active"}, "4.0");
  });

  it('parameters-expand-inactive-activeR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-inactive-active"}, "5.0");
  });

  it('parameters-expand-inactive-activeR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-inactive-active"}, "4.0");
  });

  it('parameters-expand-enum-activeR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-active"}, "5.0");
  });

  it('parameters-expand-enum-activeR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-active"}, "4.0");
  });

  it('parameters-expand-isa-activeR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-active"}, "5.0");
  });

  it('parameters-expand-isa-activeR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-active"}, "4.0");
  });

  it('parameters-expand-all-inactiveR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-inactive"}, "5.0");
  });

  it('parameters-expand-all-inactiveR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-inactive"}, "4.0");
  });

  it('parameters-expand-active-inactiveR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-active-inactive"}, "5.0");
  });

  it('parameters-expand-active-inactiveR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-active-inactive"}, "4.0");
  });

  it('parameters-expand-inactive-inactiveR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-inactive-inactive"}, "5.0");
  });

  it('parameters-expand-inactive-inactiveR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-inactive-inactive"}, "4.0");
  });

  it('parameters-expand-enum-inactiveR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-inactive"}, "5.0");
  });

  it('parameters-expand-enum-inactiveR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-inactive"}, "4.0");
  });

  it('parameters-expand-isa-inactiveR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-inactive"}, "5.0");
  });

  it('parameters-expand-isa-inactiveR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-inactive"}, "4.0");
  });

  it('parameters-expand-all-designationsR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-designations"}, "5.0");
  });

  it('parameters-expand-all-designationsR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-designations"}, "4.0");
  });

  it('parameters-expand-enum-designationsR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-designations"}, "5.0");
  });

  it('parameters-expand-enum-designationsR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-designations"}, "4.0");
  });

  it('parameters-expand-isa-designationsR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-designations"}, "5.0");
  });

  it('parameters-expand-isa-designationsR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-designations"}, "4.0");
  });

  it('parameters-expand-all-definitionsR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-definitions"}, "5.0");
  });

  it('parameters-expand-all-definitionsR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-definitions"}, "4.0");
  });

  it('parameters-expand-enum-definitionsR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions"}, "5.0");
  });

  it('parameters-expand-enum-definitionsR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions"}, "4.0");
  });

  it('parameters-expand-isa-definitionsR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-definitions"}, "5.0");
  });

  it('parameters-expand-isa-definitionsR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-definitions"}, "4.0");
  });

  it('parameters-expand-all-definitions2R5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-definitions2"}, "5.0");
  });

  it('parameters-expand-all-definitions2R4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-definitions2"}, "4.0");
  });

  it('parameters-expand-enum-definitions2R5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions2"}, "5.0");
  });

  it('parameters-expand-enum-definitions2R4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions2"}, "4.0");
  });

  it('parameters-expand-enum-definitions3R5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions3"}, "5.0");
  });

  it('parameters-expand-enum-definitions3R4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions3"}, "4.0");
  });

  it('parameters-expand-isa-definitions2R5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-definitions2"}, "5.0");
  });

  it('parameters-expand-isa-definitions2R4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-definitions2"}, "4.0");
  });

  it('parameters-expand-all-propertyR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-property"}, "5.0");
  });

  it('parameters-expand-all-propertyR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-property"}, "4.0");
  });

  it('parameters-expand-enum-propertyR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-property"}, "5.0");
  });

  it('parameters-expand-enum-propertyR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-property"}, "4.0");
  });

  it('parameters-expand-isa-propertyR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-property"}, "5.0");
  });

  it('parameters-expand-isa-propertyR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-property"}, "4.0");
  });

  it('parameters-expand-supplement-noneR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-supplement-none"}, "5.0");
  });

  it('parameters-expand-supplement-noneR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-supplement-none"}, "4.0");
  });

  it('parameters-expand-supplement-goodR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-supplement-good"}, "5.0");
  });

  it('parameters-expand-supplement-goodR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-supplement-good"}, "4.0");
  });

  it('parameters-expand-supplement-badR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-supplement-bad"}, "5.0");
  });

  it('parameters-expand-supplement-badR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-supplement-bad"}, "4.0");
  });

  it('parameters-validate-supplement-noneR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-validate-supplement-none"}, "5.0");
  });

  it('parameters-validate-supplement-noneR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-validate-supplement-none"}, "4.0");
  });

  it('parameters-validate-supplement-goodR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-validate-supplement-good"}, "5.0");
  });

  it('parameters-validate-supplement-goodR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-validate-supplement-good"}, "4.0");
  });

  it('parameters-validate-supplement-badR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-validate-supplement-bad"}, "5.0");
  });

  it('parameters-validate-supplement-badR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-validate-supplement-bad"}, "4.0");
  });

  it('parameters-lookup-supplement-noneR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-lookup-supplement-none"}, "5.0");
  });

  it('parameters-lookup-supplement-noneR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-lookup-supplement-none"}, "4.0");
  });

  it('parameters-lookup-supplement-goodR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-lookup-supplement-good"}, "5.0");
  });

  it('parameters-lookup-supplement-goodR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-lookup-supplement-good"}, "4.0");
  });

  it('parameters-lookup-supplement-badR5', async () => {
    await runTest({"suite":"parameters","test":"parameters-lookup-supplement-bad"}, "5.0");
  });

  it('parameters-lookup-supplement-badR4', async () => {
    await runTest({"suite":"parameters","test":"parameters-lookup-supplement-bad"}, "4.0");
  });

});

describe('language', () => {
  // Testing returning language by request, getting the right designation

  it('language-echo-en-noneR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-none"}, "5.0");
  });

  it('language-echo-en-noneR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-none"}, "4.0");
  });

  it('language-echo-de-noneR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-none"}, "5.0");
  });

  it('language-echo-de-noneR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-none"}, "4.0");
  });

  it('language-echo-en-multi-noneR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-none"}, "5.0");
  });

  it('language-echo-en-multi-noneR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-none"}, "4.0");
  });

  it('language-echo-de-multi-noneR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-none"}, "5.0");
  });

  it('language-echo-de-multi-noneR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-none"}, "4.0");
  });

  it('language-echo-en-en-paramR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-param"}, "5.0");
  });

  it('language-echo-en-en-paramR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-param"}, "4.0");
  });

  it('language-echo-en-en-vsR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-vs"}, "5.0");
  });

  it('language-echo-en-en-vsR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-vs"}, "4.0");
  });

  it('language-echo-en-en-headerR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-header"}, "5.0");
  });

  it('language-echo-en-en-headerR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-header"}, "4.0");
  });

  it('language-echo-en-en-vslangR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-vslang"}, "5.0");
  });

  it('language-echo-en-en-vslangR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-vslang"}, "4.0");
  });

  it('language-echo-en-en-mixedR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-mixed"}, "5.0");
  });

  it('language-echo-en-en-mixedR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-mixed"}, "4.0");
  });

  it('language-echo-de-de-paramR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-param"}, "5.0");
  });

  it('language-echo-de-de-paramR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-param"}, "4.0");
  });

  it('language-echo-de-de-vsR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-vs"}, "5.0");
  });

  it('language-echo-de-de-vsR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-vs"}, "4.0");
  });

  it('language-echo-de-de-headerR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-header"}, "5.0");
  });

  it('language-echo-de-de-headerR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-header"}, "4.0");
  });

  it('language-echo-en-multi-en-paramR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-param"}, "5.0");
  });

  it('language-echo-en-multi-en-paramR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-param"}, "4.0");
  });

  it('language-echo-en-multi-en-vsR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-vs"}, "5.0");
  });

  it('language-echo-en-multi-en-vsR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-vs"}, "4.0");
  });

  it('language-echo-en-multi-en-headerR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-header"}, "5.0");
  });

  it('language-echo-en-multi-en-headerR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-header"}, "4.0");
  });

  it('language-echo-de-multi-de-paramR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-param"}, "5.0");
  });

  it('language-echo-de-multi-de-paramR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-param"}, "4.0");
  });

  it('language-echo-de-multi-de-vsR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-vs"}, "5.0");
  });

  it('language-echo-de-multi-de-vsR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-vs"}, "4.0");
  });

  it('language-echo-de-multi-de-headerR5', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-header"}, "5.0");
  });

  it('language-echo-de-multi-de-headerR4', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-header"}, "4.0");
  });

  it('language-xform-en-multi-de-softR5', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-soft"}, "5.0");
  });

  it('language-xform-en-multi-de-softR4', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-soft"}, "4.0");
  });

  it('language-xform-en-multi-de-hardR5', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-hard"}, "5.0");
  });

  it('language-xform-en-multi-de-hardR4', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-hard"}, "4.0");
  });

  it('language-xform-en-multi-de-defaultR5', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-default"}, "5.0");
  });

  it('language-xform-en-multi-de-defaultR4', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-default"}, "4.0");
  });

  it('language-xform-de-multi-en-softR5', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-soft"}, "5.0");
  });

  it('language-xform-de-multi-en-softR4', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-soft"}, "4.0");
  });

  it('language-xform-de-multi-en-hardR5', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-hard"}, "5.0");
  });

  it('language-xform-de-multi-en-hardR4', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-hard"}, "4.0");
  });

  it('language-xform-de-multi-en-defaultR5', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-default"}, "5.0");
  });

  it('language-xform-de-multi-en-defaultR4', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-default"}, "4.0");
  });

  it('language-echo-en-designationR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-designation"}, "5.0");
  });

  it('language-echo-en-designationR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-designation"}, "4.0");
  });

  it('language-echo-en-designationsR5', async () => {
    await runTest({"suite":"language","test":"language-echo-en-designations"}, "5.0");
  });

  it('language-echo-en-designationsR4', async () => {
    await runTest({"suite":"language","test":"language-echo-en-designations"}, "4.0");
  });

});

describe('language2', () => {
  // A series of tests that test display name validation for various permutations of languages

  it('validation-right-de-enR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-en"}, "5.0");
  });

  it('validation-right-de-enR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-en"}, "4.0");
  });

  it('validation-right-de-ende-NR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-ende-N"}, "5.0");
  });

  it('validation-right-de-ende-NR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-ende-N"}, "4.0");
  });

  it('validation-right-de-endeR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-ende"}, "5.0");
  });

  it('validation-right-de-endeR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-ende"}, "4.0");
  });

  it('validation-right-de-noneR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-none"}, "5.0");
  });

  it('validation-right-de-noneR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-none"}, "4.0");
  });

  it('validation-right-en-enR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-en"}, "5.0");
  });

  it('validation-right-en-enR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-en"}, "4.0");
  });

  it('validation-right-en-ende-NR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-ende-N"}, "5.0");
  });

  it('validation-right-en-ende-NR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-ende-N"}, "4.0");
  });

  it('validation-right-en-endeR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-ende"}, "5.0");
  });

  it('validation-right-en-endeR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-ende"}, "4.0");
  });

  it('validation-right-en-noneR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-none"}, "5.0");
  });

  it('validation-right-en-noneR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-none"}, "4.0");
  });

  it('validation-right-none-enR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-en"}, "5.0");
  });

  it('validation-right-none-enR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-en"}, "4.0");
  });

  it('validation-right-none-ende-NR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-ende-N"}, "5.0");
  });

  it('validation-right-none-ende-NR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-ende-N"}, "4.0");
  });

  it('validation-right-none-endeR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-ende"}, "5.0");
  });

  it('validation-right-none-endeR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-ende"}, "4.0");
  });

  it('validation-right-none-noneR5', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-none"}, "5.0");
  });

  it('validation-right-none-noneR4', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-none"}, "4.0");
  });

  it('validation-wrong-de-enR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-en"}, "5.0");
  });

  it('validation-wrong-de-enR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-en"}, "4.0");
  });

  it('validation-wrong-de-en-badR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-en-bad"}, "5.0");
  });

  it('validation-wrong-de-en-badR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-en-bad"}, "4.0");
  });

  it('validation-wrong-de-ende-NR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-ende-N"}, "5.0");
  });

  it('validation-wrong-de-ende-NR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-ende-N"}, "4.0");
  });

  it('validation-wrong-de-endeR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-ende"}, "5.0");
  });

  it('validation-wrong-de-endeR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-ende"}, "4.0");
  });

  it('validation-wrong-de-noneR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-none"}, "5.0");
  });

  it('validation-wrong-de-noneR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-none"}, "4.0");
  });

  it('validation-wrong-en-enR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-en"}, "5.0");
  });

  it('validation-wrong-en-enR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-en"}, "4.0");
  });

  it('validation-wrong-en-ende-NR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-ende-N"}, "5.0");
  });

  it('validation-wrong-en-ende-NR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-ende-N"}, "4.0");
  });

  it('validation-wrong-en-endeR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-ende"}, "5.0");
  });

  it('validation-wrong-en-endeR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-ende"}, "4.0");
  });

  it('validation-wrong-en-noneR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-none"}, "5.0");
  });

  it('validation-wrong-en-noneR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-none"}, "4.0");
  });

  it('validation-wrong-none-enR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-en"}, "5.0");
  });

  it('validation-wrong-none-enR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-en"}, "4.0");
  });

  it('validation-wrong-none-ende-NR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-ende-N"}, "5.0");
  });

  it('validation-wrong-none-ende-NR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-ende-N"}, "4.0");
  });

  it('validation-wrong-none-endeR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-ende"}, "5.0");
  });

  it('validation-wrong-none-endeR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-ende"}, "4.0");
  });

  it('validation-wrong-none-noneR5', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-none"}, "5.0");
  });

  it('validation-wrong-none-noneR4', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-none"}, "4.0");
  });

});

describe('extensions', () => {
  // Testing proper handling of extensions, which depends on the extension

  it('extensions-echo-allR5', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-all"}, "5.0");
  });

  it('extensions-echo-allR4', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-all"}, "4.0");
  });

  it('extensions-echo-enumeratedR5', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-enumerated"}, "5.0");
  });

  it('extensions-echo-enumeratedR4', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-enumerated"}, "4.0");
  });

  it('extensions-echo-bad-supplementR5', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-bad-supplement"}, "5.0");
  });

  it('extensions-echo-bad-supplementR4', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-bad-supplement"}, "4.0");
  });

  it('validate-code-bad-supplementR5', async () => {
    await runTest({"suite":"extensions","test":"validate-code-bad-supplement"}, "5.0");
  });

  it('validate-code-bad-supplementR4', async () => {
    await runTest({"suite":"extensions","test":"validate-code-bad-supplement"}, "4.0");
  });

  it('validate-coding-bad-supplementR5', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-bad-supplement"}, "5.0");
  });

  it('validate-coding-bad-supplementR4', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-bad-supplement"}, "4.0");
  });

  it('validate-coding-bad-supplement-urlR5', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-bad-supplement-url"}, "5.0");
  });

  it('validate-coding-bad-supplement-urlR4', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-bad-supplement-url"}, "4.0");
  });

  it('validate-codeableconcept-bad-supplementR5', async () => {
    await runTest({"suite":"extensions","test":"validate-codeableconcept-bad-supplement"}, "5.0");
  });

  it('validate-codeableconcept-bad-supplementR4', async () => {
    await runTest({"suite":"extensions","test":"validate-codeableconcept-bad-supplement"}, "4.0");
  });

  it('validate-coding-good-supplementR5', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-good-supplement"}, "5.0");
  });

  it('validate-coding-good-supplementR4', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-good-supplement"}, "4.0");
  });

  it('validate-coding-good2-supplementR5', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-good2-supplement"}, "5.0");
  });

  it('validate-coding-good2-supplementR4', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-good2-supplement"}, "4.0");
  });

  it('validate-code-inactive-displayR5', async () => {
    await runTest({"suite":"extensions","test":"validate-code-inactive-display"}, "5.0");
  });

  it('validate-code-inactive-displayR4', async () => {
    await runTest({"suite":"extensions","test":"validate-code-inactive-display"}, "4.0");
  });

  it('validate-code-inactiveR5', async () => {
    await runTest({"suite":"extensions","test":"validate-code-inactive"}, "5.0");
  });

  it('validate-code-inactiveR4', async () => {
    await runTest({"suite":"extensions","test":"validate-code-inactive"}, "4.0");
  });

});

describe('validation', () => {
  // Testing various validation parameter combinations

  it('validation-simple-code-goodR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good"}, "5.0");
  });

  it('validation-simple-code-goodR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good"}, "4.0");
  });

  it('validation-simple-code-implied-goodR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-implied-good"}, "5.0");
  });

  it('validation-simple-code-implied-goodR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-implied-good"}, "4.0");
  });

  it('validation-simple-coding-goodR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good"}, "5.0");
  });

  it('validation-simple-coding-goodR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good"}, "4.0");
  });

  it('validation-simple-codeableconcept-goodR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good"}, "5.0");
  });

  it('validation-simple-codeableconcept-goodR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good"}, "4.0");
  });

  it('validation-simple-code-bad-codeR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-code"}, "5.0");
  });

  it('validation-simple-code-bad-codeR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-code"}, "4.0");
  });

  it('validation-simple-code-implied-bad-codeR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-implied-bad-code"}, "5.0");
  });

  it('validation-simple-code-implied-bad-codeR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-implied-bad-code"}, "4.0");
  });

  it('validation-simple-coding-bad-codeR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-code"}, "5.0");
  });

  it('validation-simple-coding-bad-codeR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-code"}, "4.0");
  });

  it('validation-simple-coding-bad-code-inactiveR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-code-inactive"}, "5.0");
  });

  it('validation-simple-coding-bad-code-inactiveR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-code-inactive"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-codeR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-code"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-codeR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-code"}, "4.0");
  });

  it('validation-simple-code-bad-valueSetR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-valueSet"}, "5.0");
  });

  it('validation-simple-code-bad-valueSetR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-valueSet"}, "4.0");
  });

  it('validation-simple-coding-bad-valueSetR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-valueSet"}, "5.0");
  });

  it('validation-simple-coding-bad-valueSetR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-valueSet"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-valueSetR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-valueSet"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-valueSetR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-valueSet"}, "4.0");
  });

  it('validation-simple-code-bad-importR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-import"}, "5.0");
  });

  it('validation-simple-code-bad-importR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-import"}, "4.0");
  });

  it('validation-simple-coding-bad-importR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-import"}, "5.0");
  });

  it('validation-simple-coding-bad-importR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-import"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-importR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-import"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-importR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-import"}, "4.0");
  });

  it('validation-simple-code-bad-systemR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-system"}, "5.0");
  });

  it('validation-simple-code-bad-systemR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-system"}, "4.0");
  });

  it('validation-simple-coding-bad-systemR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system"}, "5.0");
  });

  it('validation-simple-coding-bad-systemR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system"}, "4.0");
  });

  it('validation-simple-coding-bad-system2R5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system2"}, "5.0");
  });

  it('validation-simple-coding-bad-system2R4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system2"}, "4.0");
  });

  it('validation-simple-coding-bad-system-localR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system-local"}, "5.0");
  });

  it('validation-simple-coding-bad-system-localR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system-local"}, "4.0");
  });

  it('validation-simple-coding-no-systemR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-no-system"}, "5.0");
  });

  it('validation-simple-coding-no-systemR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-no-system"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-systemR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-system"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-systemR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-system"}, "4.0");
  });

  it('validation-simple-code-good-displayR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-display"}, "5.0");
  });

  it('validation-simple-code-good-displayR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-display"}, "4.0");
  });

  it('validation-simple-coding-good-displayR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good-display"}, "5.0");
  });

  it('validation-simple-coding-good-displayR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good-display"}, "4.0");
  });

  it('validation-simple-codeableconcept-good-displayR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good-display"}, "5.0");
  });

  it('validation-simple-codeableconcept-good-displayR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good-display"}, "4.0");
  });

  it('validation-simple-code-bad-displayR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display"}, "5.0");
  });

  it('validation-simple-code-bad-displayR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display"}, "4.0");
  });

  it('validation-simple-code-bad-display-wsR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display-ws"}, "5.0");
  });

  it('validation-simple-code-bad-display-wsR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display-ws"}, "4.0");
  });

  it('validation-simple-coding-bad-displayR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-display"}, "5.0");
  });

  it('validation-simple-coding-bad-displayR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-display"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-displayR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-display"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-displayR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-display"}, "4.0");
  });

  it('validation-simple-code-bad-display-warningR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display-warning"}, "5.0");
  });

  it('validation-simple-code-bad-display-warningR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display-warning"}, "4.0");
  });

  it('validation-simple-coding-bad-display-warningR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-display-warning"}, "5.0");
  });

  it('validation-simple-coding-bad-display-warningR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-display-warning"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-display-warningR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-display-warning"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-display-warningR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-display-warning"}, "4.0");
  });

  it('validation-simple-code-good-languageR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-language"}, "5.0");
  });

  it('validation-simple-code-good-languageR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-language"}, "4.0");
  });

  it('validation-simple-coding-good-languageR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good-language"}, "5.0");
  });

  it('validation-simple-coding-good-languageR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good-language"}, "4.0");
  });

  it('validation-simple-codeableconcept-good-languageR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good-language"}, "5.0");
  });

  it('validation-simple-codeableconcept-good-languageR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good-language"}, "4.0");
  });

  it('validation-simple-code-bad-languageR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-language"}, "5.0");
  });

  it('validation-simple-code-bad-languageR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-language"}, "4.0");
  });

  it('validation-simple-code-good-regexR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-regex"}, "5.0");
  });

  it('validation-simple-code-good-regexR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-regex"}, "4.0");
  });

  it('validation-simple-code-bad-regexR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-regex"}, "5.0");
  });

  it('validation-simple-code-bad-regexR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-regex"}, "4.0");
  });

  it('validation-simple-coding-bad-languageR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language"}, "5.0");
  });

  it('validation-simple-coding-bad-languageR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language"}, "4.0");
  });

  it('validation-simple-coding-bad-language-headerR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-header"}, "5.0");
  });

  it('validation-simple-coding-bad-language-headerR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-header"}, "4.0");
  });

  it('validation-simple-coding-bad-language-vsR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-vs"}, "5.0");
  });

  it('validation-simple-coding-bad-language-vsR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-vs"}, "4.0");
  });

  it('validation-simple-coding-bad-language-vslangR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-vslang"}, "5.0");
  });

  it('validation-simple-coding-bad-language-vslangR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-vslang"}, "4.0");
  });

  it('validation-simple-codeableconcept-bad-languageR5', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-language"}, "5.0");
  });

  it('validation-simple-codeableconcept-bad-languageR4', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-language"}, "4.0");
  });

  it('validation-complex-codeableconcept-fullR5', async () => {
    await runTest({"suite":"validation","test":"validation-complex-codeableconcept-full"}, "5.0");
  });

  it('validation-complex-codeableconcept-fullR4', async () => {
    await runTest({"suite":"validation","test":"validation-complex-codeableconcept-full"}, "4.0");
  });

  it('validation-complex-codeableconcept-vsonlyR5', async () => {
    await runTest({"suite":"validation","test":"validation-complex-codeableconcept-vsonly"}, "5.0");
  });

  it('validation-complex-codeableconcept-vsonlyR4', async () => {
    await runTest({"suite":"validation","test":"validation-complex-codeableconcept-vsonly"}, "4.0");
  });

  it('validation-cs-code-goodR5', async () => {
    await runTest({"suite":"validation","test":"validation-cs-code-good"}, "5.0");
  });

  it('validation-cs-code-goodR4', async () => {
    await runTest({"suite":"validation","test":"validation-cs-code-good"}, "4.0");
  });

  it('validation-cs-code-bad-codeR5', async () => {
    await runTest({"suite":"validation","test":"validation-cs-code-bad-code"}, "5.0");
  });

  it('validation-cs-code-bad-codeR4', async () => {
    await runTest({"suite":"validation","test":"validation-cs-code-bad-code"}, "4.0");
  });

});

describe('version', () => {
  // Testing various version issues. There's two versions of a code system, and three value sets that select different versions

  it('version-simple-code-bad-version1R5', async () => {
    await runTest({"suite":"version","test":"version-simple-code-bad-version1"}, "5.0");
  });

  it('version-simple-code-bad-version1R4', async () => {
    await runTest({"suite":"version","test":"version-simple-code-bad-version1"}, "4.0");
  });

  it('version-simple-coding-bad-version1R5', async () => {
    await runTest({"suite":"version","test":"version-simple-coding-bad-version1"}, "5.0");
  });

  it('version-simple-coding-bad-version1R4', async () => {
    await runTest({"suite":"version","test":"version-simple-coding-bad-version1"}, "4.0");
  });

  it('version-simple-codeableconcept-bad-version1R5', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-bad-version1"}, "5.0");
  });

  it('version-simple-codeableconcept-bad-version1R4', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-bad-version1"}, "4.0");
  });

  it('version-simple-codeableconcept-bad-version2R5', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-bad-version2"}, "5.0");
  });

  it('version-simple-codeableconcept-bad-version2R4', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-bad-version2"}, "4.0");
  });

  it('version-simple-code-good-versionR5', async () => {
    await runTest({"suite":"version","test":"version-simple-code-good-version"}, "5.0");
  });

  it('version-simple-code-good-versionR4', async () => {
    await runTest({"suite":"version","test":"version-simple-code-good-version"}, "4.0");
  });

  it('version-simple-coding-good-versionR5', async () => {
    await runTest({"suite":"version","test":"version-simple-coding-good-version"}, "5.0");
  });

  it('version-simple-coding-good-versionR4', async () => {
    await runTest({"suite":"version","test":"version-simple-coding-good-version"}, "4.0");
  });

  it('version-simple-codeableconcept-good-versionR5', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-good-version"}, "5.0");
  });

  it('version-simple-codeableconcept-good-versionR4', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-good-version"}, "4.0");
  });

  it('version-version-profile-noneR5', async () => {
    await runTest({"suite":"version","test":"version-version-profile-none"}, "5.0");
  });

  it('version-version-profile-noneR4', async () => {
    await runTest({"suite":"version","test":"version-version-profile-none"}, "4.0");
  });

  it('version-version-profile-defaultR5', async () => {
    await runTest({"suite":"version","test":"version-version-profile-default"}, "5.0");
  });

  it('version-version-profile-defaultR4', async () => {
    await runTest({"suite":"version","test":"version-version-profile-default"}, "4.0");
  });

  it('validation-version-profile-codingR5', async () => {
    await runTest({"suite":"version","test":"validation-version-profile-coding"}, "5.0");
  });

  it('validation-version-profile-codingR4', async () => {
    await runTest({"suite":"version","test":"validation-version-profile-coding"}, "4.0");
  });

  it('coding-vnn-vsnnR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn"}, "5.0");
  });

  it('coding-vnn-vsnnR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn"}, "4.0");
  });

  it('coding-v10-vs1wR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w"}, "5.0");
  });

  it('coding-v10-vs1wR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w"}, "4.0");
  });

  it('coding-v10-vs1wbR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb"}, "5.0");
  });

  it('coding-v10-vs1wbR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb"}, "4.0");
  });

  it('coding-v10-vs10R5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10"}, "5.0");
  });

  it('coding-v10-vs10R4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10"}, "4.0");
  });

  it('coding-v10-vs20R5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20"}, "5.0");
  });

  it('coding-v10-vs20R4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20"}, "4.0");
  });

  it('coding-v10-vsbbR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb"}, "5.0");
  });

  it('coding-v10-vsbbR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb"}, "4.0");
  });

  it('coding-v10-vsbbR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb"}, "5.0");
  });

  it('coding-v10-vsbbR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb"}, "4.0");
  });

  it('coding-v10-vsnnR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn"}, "5.0");
  });

  it('coding-v10-vsnnR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn"}, "4.0");
  });

  it('coding-vbb-vs10R5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10"}, "5.0");
  });

  it('coding-vbb-vs10R4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10"}, "4.0");
  });

  it('coding-vbb-vsnnR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn"}, "5.0");
  });

  it('coding-vbb-vsnnR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn"}, "4.0");
  });

  it('coding-vnn-vs1wR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w"}, "5.0");
  });

  it('coding-vnn-vs1wR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w"}, "4.0");
  });

  it('coding-vnn-vs1wbR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb"}, "5.0");
  });

  it('coding-vnn-vs1wbR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb"}, "4.0");
  });

  it('coding-vnn-vs10R5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10"}, "5.0");
  });

  it('coding-vnn-vs10R4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10"}, "4.0");
  });

  it('coding-vnn-vsbbR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb"}, "5.0");
  });

  it('coding-vnn-vsbbR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb"}, "4.0");
  });

  it('coding-vnn-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-default"}, "5.0");
  });

  it('coding-vnn-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-default"}, "4.0");
  });

  it('coding-v10-vs1w-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-default"}, "5.0");
  });

  it('coding-v10-vs1w-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-default"}, "4.0");
  });

  it('coding-v10-vs1wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-default"}, "5.0");
  });

  it('coding-v10-vs1wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-default"}, "4.0");
  });

  it('coding-v10-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-default"}, "5.0");
  });

  it('coding-v10-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-default"}, "4.0");
  });

  it('coding-v10-vs20-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-default"}, "5.0");
  });

  it('coding-v10-vs20-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-default"}, "4.0");
  });

  it('coding-v10-vsbb-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-default"}, "5.0");
  });

  it('coding-v10-vsbb-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-default"}, "4.0");
  });

  it('coding-v10-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-default"}, "5.0");
  });

  it('coding-v10-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-default"}, "4.0");
  });

  it('coding-vbb-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-default"}, "5.0");
  });

  it('coding-vbb-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-default"}, "4.0");
  });

  it('coding-vbb-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-default"}, "5.0");
  });

  it('coding-vbb-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-default"}, "4.0");
  });

  it('coding-vnn-vs1w-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-default"}, "5.0");
  });

  it('coding-vnn-vs1w-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-default"}, "4.0");
  });

  it('coding-vnn-vs1wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-default"}, "5.0");
  });

  it('coding-vnn-vs1wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-default"}, "4.0");
  });

  it('coding-vnn-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-default"}, "5.0");
  });

  it('coding-vnn-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-default"}, "4.0");
  });

  it('coding-vnn-vsbb-defaultR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-default"}, "5.0");
  });

  it('coding-vnn-vsbb-defaultR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-default"}, "4.0");
  });

  it('coding-vnn-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-check"}, "5.0");
  });

  it('coding-vnn-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-check"}, "4.0");
  });

  it('coding-v10-vs1w-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-check"}, "5.0");
  });

  it('coding-v10-vs1w-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-check"}, "4.0");
  });

  it('coding-v10-vs1wb-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-check"}, "5.0");
  });

  it('coding-v10-vs1wb-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-check"}, "4.0");
  });

  it('coding-v10-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-check"}, "5.0");
  });

  it('coding-v10-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-check"}, "4.0");
  });

  it('coding-v10-vs20-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-check"}, "5.0");
  });

  it('coding-v10-vs20-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-check"}, "4.0");
  });

  it('coding-v10-vsbb-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-check"}, "5.0");
  });

  it('coding-v10-vsbb-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-check"}, "4.0");
  });

  it('coding-v10-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-check"}, "5.0");
  });

  it('coding-v10-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-check"}, "4.0");
  });

  it('coding-vbb-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-check"}, "5.0");
  });

  it('coding-vbb-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-check"}, "4.0");
  });

  it('coding-vbb-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-check"}, "5.0");
  });

  it('coding-vbb-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-check"}, "4.0");
  });

  it('coding-vnn-vs1w-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-check"}, "5.0");
  });

  it('coding-vnn-vs1w-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-check"}, "4.0");
  });

  it('coding-vnn-vs1wb-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-check"}, "5.0");
  });

  it('coding-vnn-vs1wb-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-check"}, "4.0");
  });

  it('coding-vnn-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-check"}, "5.0");
  });

  it('coding-vnn-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-check"}, "4.0");
  });

  it('coding-vnn-vsbb-checkR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-check"}, "5.0");
  });

  it('coding-vnn-vsbb-checkR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-check"}, "4.0");
  });

  it('coding-vnn-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-force"}, "5.0");
  });

  it('coding-vnn-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-force"}, "4.0");
  });

  it('coding-v10-vs1w-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-force"}, "5.0");
  });

  it('coding-v10-vs1w-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-force"}, "4.0");
  });

  it('coding-v10-vs1wb-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-force"}, "5.0");
  });

  it('coding-v10-vs1wb-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-force"}, "4.0");
  });

  it('coding-v10-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-force"}, "5.0");
  });

  it('coding-v10-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-force"}, "4.0");
  });

  it('coding-v10-vs20-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-force"}, "5.0");
  });

  it('coding-v10-vs20-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-force"}, "4.0");
  });

  it('coding-v10-vsbb-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-force"}, "5.0");
  });

  it('coding-v10-vsbb-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-force"}, "4.0");
  });

  it('coding-v10-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-force"}, "5.0");
  });

  it('coding-v10-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-force"}, "4.0");
  });

  it('coding-vbb-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-force"}, "5.0");
  });

  it('coding-vbb-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-force"}, "4.0");
  });

  it('coding-vbb-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-force"}, "5.0");
  });

  it('coding-vbb-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-force"}, "4.0");
  });

  it('coding-vnn-vs1w-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-force"}, "5.0");
  });

  it('coding-vnn-vs1w-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-force"}, "4.0");
  });

  it('coding-vnn-vs1wb-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-force"}, "5.0");
  });

  it('coding-vnn-vs1wb-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-force"}, "4.0");
  });

  it('coding-vnn-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-force"}, "5.0");
  });

  it('coding-vnn-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-force"}, "4.0");
  });

  it('coding-vnn-vsbb-forceR5', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-force"}, "5.0");
  });

  it('coding-vnn-vsbb-forceR4', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-force"}, "4.0");
  });

  it('codeableconcept-vnn-vsnnR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn"}, "5.0");
  });

  it('codeableconcept-vnn-vsnnR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn"}, "4.0");
  });

  it('codeableconcept-v10-vs1wR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w"}, "5.0");
  });

  it('codeableconcept-v10-vs1wR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w"}, "4.0");
  });

  it('codeableconcept-v10-vs1wbR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb"}, "5.0");
  });

  it('codeableconcept-v10-vs1wbR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb"}, "4.0");
  });

  it('codeableconcept-v10-vs10R5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10"}, "5.0");
  });

  it('codeableconcept-v10-vs10R4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10"}, "4.0");
  });

  it('codeableconcept-v10-vs20R5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20"}, "5.0");
  });

  it('codeableconcept-v10-vs20R4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20"}, "4.0");
  });

  it('codeableconcept-v10-vsbbR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb"}, "5.0");
  });

  it('codeableconcept-v10-vsbbR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb"}, "4.0");
  });

  it('codeableconcept-v10-vsbbR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb"}, "5.0");
  });

  it('codeableconcept-v10-vsbbR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb"}, "4.0");
  });

  it('codeableconcept-v10-vsnnR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn"}, "5.0");
  });

  it('codeableconcept-v10-vsnnR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn"}, "4.0");
  });

  it('codeableconcept-vbb-vs10R5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10"}, "5.0");
  });

  it('codeableconcept-vbb-vs10R4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10"}, "4.0");
  });

  it('codeableconcept-vbb-vsnnR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn"}, "5.0");
  });

  it('codeableconcept-vbb-vsnnR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn"}, "4.0");
  });

  it('codeableconcept-vnn-vs1wR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w"}, "5.0");
  });

  it('codeableconcept-vnn-vs1wR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w"}, "4.0");
  });

  it('codeableconcept-vnn-vs1wbR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb"}, "5.0");
  });

  it('codeableconcept-vnn-vs1wbR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb"}, "4.0");
  });

  it('codeableconcept-vnn-vs10R5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10"}, "5.0");
  });

  it('codeableconcept-vnn-vs10R4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10"}, "4.0");
  });

  it('codeableconcept-vnn-vsbbR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb"}, "5.0");
  });

  it('codeableconcept-vnn-vsbbR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb"}, "4.0");
  });

  it('codeableconcept-vnn-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-default"}, "5.0");
  });

  it('codeableconcept-vnn-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-default"}, "4.0");
  });

  it('codeableconcept-v10-vs1w-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-default"}, "5.0");
  });

  it('codeableconcept-v10-vs1w-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-default"}, "4.0");
  });

  it('codeableconcept-v10-vs1wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-default"}, "5.0");
  });

  it('codeableconcept-v10-vs1wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-default"}, "4.0");
  });

  it('codeableconcept-v10-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-default"}, "5.0");
  });

  it('codeableconcept-v10-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-default"}, "4.0");
  });

  it('codeableconcept-v10-vs20-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-default"}, "5.0");
  });

  it('codeableconcept-v10-vs20-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-default"}, "4.0");
  });

  it('codeableconcept-v10-vsbb-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-default"}, "5.0");
  });

  it('codeableconcept-v10-vsbb-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-default"}, "4.0");
  });

  it('codeableconcept-v10-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-default"}, "5.0");
  });

  it('codeableconcept-v10-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-default"}, "4.0");
  });

  it('codeableconcept-vbb-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-default"}, "5.0");
  });

  it('codeableconcept-vbb-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-default"}, "4.0");
  });

  it('codeableconcept-vbb-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-default"}, "5.0");
  });

  it('codeableconcept-vbb-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-default"}, "4.0");
  });

  it('codeableconcept-vnn-vs1w-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-default"}, "5.0");
  });

  it('codeableconcept-vnn-vs1w-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-default"}, "4.0");
  });

  it('codeableconcept-vnn-vs1wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-default"}, "5.0");
  });

  it('codeableconcept-vnn-vs1wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-default"}, "4.0");
  });

  it('codeableconcept-vnn-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-default"}, "5.0");
  });

  it('codeableconcept-vnn-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-default"}, "4.0");
  });

  it('codeableconcept-vnn-vsbb-defaultR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-default"}, "5.0");
  });

  it('codeableconcept-vnn-vsbb-defaultR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-default"}, "4.0");
  });

  it('codeableconcept-vnn-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-check"}, "5.0");
  });

  it('codeableconcept-vnn-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-check"}, "4.0");
  });

  it('codeableconcept-v10-vs1w-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-check"}, "5.0");
  });

  it('codeableconcept-v10-vs1w-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-check"}, "4.0");
  });

  it('codeableconcept-v10-vs1wb-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-check"}, "5.0");
  });

  it('codeableconcept-v10-vs1wb-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-check"}, "4.0");
  });

  it('codeableconcept-v10-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-check"}, "5.0");
  });

  it('codeableconcept-v10-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-check"}, "4.0");
  });

  it('codeableconcept-v10-vs20-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-check"}, "5.0");
  });

  it('codeableconcept-v10-vs20-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-check"}, "4.0");
  });

  it('codeableconcept-v10-vsbb-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-check"}, "5.0");
  });

  it('codeableconcept-v10-vsbb-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-check"}, "4.0");
  });

  it('codeableconcept-v10-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-check"}, "5.0");
  });

  it('codeableconcept-v10-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-check"}, "4.0");
  });

  it('codeableconcept-vbb-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-check"}, "5.0");
  });

  it('codeableconcept-vbb-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-check"}, "4.0");
  });

  it('codeableconcept-vbb-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-check"}, "5.0");
  });

  it('codeableconcept-vbb-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-check"}, "4.0");
  });

  it('codeableconcept-vnn-vs1w-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-check"}, "5.0");
  });

  it('codeableconcept-vnn-vs1w-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-check"}, "4.0");
  });

  it('codeableconcept-vnn-vs1wb-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-check"}, "5.0");
  });

  it('codeableconcept-vnn-vs1wb-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-check"}, "4.0");
  });

  it('codeableconcept-vnn-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-check"}, "5.0");
  });

  it('codeableconcept-vnn-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-check"}, "4.0");
  });

  it('codeableconcept-vnn-vsbb-checkR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-check"}, "5.0");
  });

  it('codeableconcept-vnn-vsbb-checkR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-check"}, "4.0");
  });

  it('codeableconcept-vnn-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-force"}, "5.0");
  });

  it('codeableconcept-vnn-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-force"}, "4.0");
  });

  it('codeableconcept-v10-vs1w-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-force"}, "5.0");
  });

  it('codeableconcept-v10-vs1w-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-force"}, "4.0");
  });

  it('codeableconcept-v10-vs1wb-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-force"}, "5.0");
  });

  it('codeableconcept-v10-vs1wb-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-force"}, "4.0");
  });

  it('codeableconcept-v10-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-force"}, "5.0");
  });

  it('codeableconcept-v10-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-force"}, "4.0");
  });

  it('codeableconcept-v10-vs20-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-force"}, "5.0");
  });

  it('codeableconcept-v10-vs20-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-force"}, "4.0");
  });

  it('codeableconcept-v10-vsbb-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-force"}, "5.0");
  });

  it('codeableconcept-v10-vsbb-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-force"}, "4.0");
  });

  it('codeableconcept-v10-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-force"}, "5.0");
  });

  it('codeableconcept-v10-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-force"}, "4.0");
  });

  it('codeableconcept-vbb-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-force"}, "5.0");
  });

  it('codeableconcept-vbb-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-force"}, "4.0");
  });

  it('codeableconcept-vbb-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-force"}, "5.0");
  });

  it('codeableconcept-vbb-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-force"}, "4.0");
  });

  it('codeableconcept-vnn-vs1w-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-force"}, "5.0");
  });

  it('codeableconcept-vnn-vs1w-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-force"}, "4.0");
  });

  it('codeableconcept-vnn-vs1wb-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-force"}, "5.0");
  });

  it('codeableconcept-vnn-vs1wb-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-force"}, "4.0");
  });

  it('codeableconcept-vnn-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-force"}, "5.0");
  });

  it('codeableconcept-vnn-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-force"}, "4.0");
  });

  it('codeableconcept-vnn-vsbb-forceR5', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-force"}, "5.0");
  });

  it('codeableconcept-vnn-vsbb-forceR4', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-force"}, "4.0");
  });

  it('code-vnn-vsnnR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn"}, "5.0");
  });

  it('code-vnn-vsnnR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn"}, "4.0");
  });

  it('code-v10-vs1wR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w"}, "5.0");
  });

  it('code-v10-vs1wR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w"}, "4.0");
  });

  it('code-v10-vs1wbR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb"}, "5.0");
  });

  it('code-v10-vs1wbR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb"}, "4.0");
  });

  it('code-v10-vs10R5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10"}, "5.0");
  });

  it('code-v10-vs10R4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10"}, "4.0");
  });

  it('code-v10-vs20R5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20"}, "5.0");
  });

  it('code-v10-vs20R4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20"}, "4.0");
  });

  it('code-v10-vsbbR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb"}, "5.0");
  });

  it('code-v10-vsbbR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb"}, "4.0");
  });

  it('code-v10-vsnnR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn"}, "5.0");
  });

  it('code-v10-vsnnR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn"}, "4.0");
  });

  it('code-vbb-vs10R5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10"}, "5.0");
  });

  it('code-vbb-vs10R4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10"}, "4.0");
  });

  it('code-vbb-vsnnR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn"}, "5.0");
  });

  it('code-vbb-vsnnR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn"}, "4.0");
  });

  it('code-vnn-vs1wR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w"}, "5.0");
  });

  it('code-vnn-vs1wR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w"}, "4.0");
  });

  it('code-vnn-vs1wbR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb"}, "5.0");
  });

  it('code-vnn-vs1wbR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb"}, "4.0");
  });

  it('code-vnn-vs10R5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10"}, "5.0");
  });

  it('code-vnn-vs10R4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10"}, "4.0");
  });

  it('code-vnn-vsbbR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb"}, "5.0");
  });

  it('code-vnn-vsbbR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb"}, "4.0");
  });

  it('code-vnn-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-default"}, "5.0");
  });

  it('code-vnn-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-default"}, "4.0");
  });

  it('code-v10-vs1w-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-default"}, "5.0");
  });

  it('code-v10-vs1w-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-default"}, "4.0");
  });

  it('code-v10-vs1wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-default"}, "5.0");
  });

  it('code-v10-vs1wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-default"}, "4.0");
  });

  it('code-v10-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-default"}, "5.0");
  });

  it('code-v10-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-default"}, "4.0");
  });

  it('code-v10-vs20-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-default"}, "5.0");
  });

  it('code-v10-vs20-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-default"}, "4.0");
  });

  it('code-v10-vsbb-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-default"}, "5.0");
  });

  it('code-v10-vsbb-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-default"}, "4.0");
  });

  it('code-v10-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-default"}, "5.0");
  });

  it('code-v10-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-default"}, "4.0");
  });

  it('code-vbb-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-default"}, "5.0");
  });

  it('code-vbb-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-default"}, "4.0");
  });

  it('code-vbb-vsnn-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-default"}, "5.0");
  });

  it('code-vbb-vsnn-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-default"}, "4.0");
  });

  it('code-vnn-vs1wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-default"}, "5.0");
  });

  it('code-vnn-vs1wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-default"}, "4.0");
  });

  it('code-vnn-vs10-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-default"}, "5.0");
  });

  it('code-vnn-vs10-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-default"}, "4.0");
  });

  it('code-vnn-vsbb-defaultR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-default"}, "5.0");
  });

  it('code-vnn-vsbb-defaultR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-default"}, "4.0");
  });

  it('code-vnn-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-check"}, "5.0");
  });

  it('code-vnn-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-check"}, "4.0");
  });

  it('code-v10-vs1w-checkR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-check"}, "5.0");
  });

  it('code-v10-vs1w-checkR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-check"}, "4.0");
  });

  it('code-v10-vs1wb-checkR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-check"}, "5.0");
  });

  it('code-v10-vs1wb-checkR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-check"}, "4.0");
  });

  it('code-v10-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-check"}, "5.0");
  });

  it('code-v10-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-check"}, "4.0");
  });

  it('code-v10-vs20-checkR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-check"}, "5.0");
  });

  it('code-v10-vs20-checkR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-check"}, "4.0");
  });

  it('code-v10-vsbb-checkR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-check"}, "5.0");
  });

  it('code-v10-vsbb-checkR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-check"}, "4.0");
  });

  it('code-v10-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-check"}, "5.0");
  });

  it('code-v10-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-check"}, "4.0");
  });

  it('code-vbb-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-check"}, "5.0");
  });

  it('code-vbb-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-check"}, "4.0");
  });

  it('code-vbb-vsnn-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-check"}, "5.0");
  });

  it('code-vbb-vsnn-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-check"}, "4.0");
  });

  it('code-vnn-vs1w-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w-check"}, "5.0");
  });

  it('code-vnn-vs1w-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w-check"}, "4.0");
  });

  it('code-vnn-vs1wb-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-check"}, "5.0");
  });

  it('code-vnn-vs1wb-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-check"}, "4.0");
  });

  it('code-vnn-vs10-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-check"}, "5.0");
  });

  it('code-vnn-vs10-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-check"}, "4.0");
  });

  it('code-vnn-vsbb-checkR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-check"}, "5.0");
  });

  it('code-vnn-vsbb-checkR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-check"}, "4.0");
  });

  it('code-vnn-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-force"}, "5.0");
  });

  it('code-vnn-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-force"}, "4.0");
  });

  it('code-v10-vs1w-forceR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-force"}, "5.0");
  });

  it('code-v10-vs1w-forceR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-force"}, "4.0");
  });

  it('code-v10-vs1wb-forceR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-force"}, "5.0");
  });

  it('code-v10-vs1wb-forceR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-force"}, "4.0");
  });

  it('code-v10-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-force"}, "5.0");
  });

  it('code-v10-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-force"}, "4.0");
  });

  it('code-v10-vs20-forceR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-force"}, "5.0");
  });

  it('code-v10-vs20-forceR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-force"}, "4.0");
  });

  it('code-v10-vsbb-forceR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-force"}, "5.0");
  });

  it('code-v10-vsbb-forceR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-force"}, "4.0");
  });

  it('code-v10-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-force"}, "5.0");
  });

  it('code-v10-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-force"}, "4.0");
  });

  it('code-vbb-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-force"}, "5.0");
  });

  it('code-vbb-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-force"}, "4.0");
  });

  it('code-vbb-vsnn-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-force"}, "5.0");
  });

  it('code-vbb-vsnn-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-force"}, "4.0");
  });

  it('code-vnn-vs1w-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w-force"}, "5.0");
  });

  it('code-vnn-vs1w-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w-force"}, "4.0");
  });

  it('code-vnn-vs1wb-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-force"}, "5.0");
  });

  it('code-vnn-vs1wb-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-force"}, "4.0");
  });

  it('code-vnn-vs10-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-force"}, "5.0");
  });

  it('code-vnn-vs10-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-force"}, "4.0");
  });

  it('code-vnn-vsbb-forceR5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-force"}, "5.0");
  });

  it('code-vnn-vsbb-forceR4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-force"}, "4.0");
  });

  it('code-vnn-vsmix-1R5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsmix-1"}, "5.0");
  });

  it('code-vnn-vsmix-1R4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsmix-1"}, "4.0");
  });

  it('code-vnn-vsmix-2R5', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsmix-2"}, "5.0");
  });

  it('code-vnn-vsmix-2R4', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsmix-2"}, "4.0");
  });

  it('vs-expand-all-vR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v"}, "5.0");
  });

  it('vs-expand-all-vR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v"}, "4.0");
  });

  it('vs-expand-all-v1R5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1"}, "5.0");
  });

  it('vs-expand-all-v1R4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1"}, "4.0");
  });

  it('vs-expand-all-v2R5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2"}, "5.0");
  });

  it('vs-expand-all-v2R4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2"}, "4.0");
  });

  it('vs-expand-v-mixedR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed"}, "5.0");
  });

  it('vs-expand-v-mixedR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed"}, "4.0");
  });

  it('vs-expand-v-n-requestR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-request"}, "5.0");
  });

  it('vs-expand-v-n-requestR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-request"}, "4.0");
  });

  it('vs-expand-v-wR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w"}, "5.0");
  });

  it('vs-expand-v-wR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w"}, "4.0");
  });

  it('vs-expand-v-wbR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb"}, "5.0");
  });

  it('vs-expand-v-wbR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb"}, "4.0");
  });

  it('vs-expand-v1R5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1"}, "5.0");
  });

  it('vs-expand-v1R4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1"}, "4.0");
  });

  it('vs-expand-v2R5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2"}, "5.0");
  });

  it('vs-expand-v2R4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2"}, "4.0");
  });

  it('vs-expand-all-v-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-force"}, "5.0");
  });

  it('vs-expand-all-v-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-force"}, "4.0");
  });

  it('vs-expand-all-v1-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-force"}, "5.0");
  });

  it('vs-expand-all-v1-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-force"}, "4.0");
  });

  it('vs-expand-all-v2-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-force"}, "5.0");
  });

  it('vs-expand-all-v2-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-force"}, "4.0");
  });

  it('vs-expand-v-mixed-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-force"}, "5.0");
  });

  it('vs-expand-v-mixed-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-force"}, "4.0");
  });

  it('vs-expand-v-n-force-requestR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-force-request"}, "5.0");
  });

  it('vs-expand-v-n-force-requestR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-force-request"}, "4.0");
  });

  it('vs-expand-v-w-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-force"}, "5.0");
  });

  it('vs-expand-v-w-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-force"}, "4.0");
  });

  it('vs-expand-v-wb-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-force"}, "5.0");
  });

  it('vs-expand-v-wb-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-force"}, "4.0");
  });

  it('vs-expand-v1-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-force"}, "5.0");
  });

  it('vs-expand-v1-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-force"}, "4.0");
  });

  it('vs-expand-v2-forceR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-force"}, "5.0");
  });

  it('vs-expand-v2-forceR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-force"}, "4.0");
  });

  it('vs-expand-all-v-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-default"}, "5.0");
  });

  it('vs-expand-all-v-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-default"}, "4.0");
  });

  it('vs-expand-all-v1-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-default"}, "5.0");
  });

  it('vs-expand-all-v1-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-default"}, "4.0");
  });

  it('vs-expand-all-v2-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-default"}, "5.0");
  });

  it('vs-expand-all-v2-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-default"}, "4.0");
  });

  it('vs-expand-v-mixed-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-default"}, "5.0");
  });

  it('vs-expand-v-mixed-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-default"}, "4.0");
  });

  it('vs-expand-v-n-default-requestR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-default-request"}, "5.0");
  });

  it('vs-expand-v-n-default-requestR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-default-request"}, "4.0");
  });

  it('vs-expand-v-w-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-default"}, "5.0");
  });

  it('vs-expand-v-w-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-default"}, "4.0");
  });

  it('vs-expand-v-wb-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-default"}, "5.0");
  });

  it('vs-expand-v-wb-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-default"}, "4.0");
  });

  it('vs-expand-v1-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-default"}, "5.0");
  });

  it('vs-expand-v1-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-default"}, "4.0");
  });

  it('vs-expand-v2-defaultR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-default"}, "5.0");
  });

  it('vs-expand-v2-defaultR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-default"}, "4.0");
  });

  it('vs-expand-all-v-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-check"}, "5.0");
  });

  it('vs-expand-all-v-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-check"}, "4.0");
  });

  it('vs-expand-all-v1-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-check"}, "5.0");
  });

  it('vs-expand-all-v1-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-check"}, "4.0");
  });

  it('vs-expand-all-v2-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-check"}, "5.0");
  });

  it('vs-expand-all-v2-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-check"}, "4.0");
  });

  it('vs-expand-v-mixed-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-check"}, "5.0");
  });

  it('vs-expand-v-mixed-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-check"}, "4.0");
  });

  it('vs-expand-v-n-check-requestR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-check-request"}, "5.0");
  });

  it('vs-expand-v-n-check-requestR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-check-request"}, "4.0");
  });

  it('vs-expand-v-w-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-check"}, "5.0");
  });

  it('vs-expand-v-w-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-check"}, "4.0");
  });

  it('vs-expand-v-wb-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-check"}, "5.0");
  });

  it('vs-expand-v-wb-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-check"}, "4.0");
  });

  it('vs-expand-v1-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-check"}, "5.0");
  });

  it('vs-expand-v1-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-check"}, "4.0");
  });

  it('vs-expand-v2-checkR5', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-check"}, "5.0");
  });

  it('vs-expand-v2-checkR4', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-check"}, "4.0");
  });

});

describe('fragment', () => {
  // Testing handling a code system fragment

  it('validation-fragment-code-goodR5', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-code-good"}, "5.0");
  });

  it('validation-fragment-code-goodR4', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-code-good"}, "4.0");
  });

  it('validation-fragment-coding-goodR5', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-coding-good"}, "5.0");
  });

  it('validation-fragment-coding-goodR4', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-coding-good"}, "4.0");
  });

  it('validation-fragment-codeableconcept-goodR5', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-codeableconcept-good"}, "5.0");
  });

  it('validation-fragment-codeableconcept-goodR4', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-codeableconcept-good"}, "4.0");
  });

  it('validation-fragment-code-bad-codeR5', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-code-bad-code"}, "5.0");
  });

  it('validation-fragment-code-bad-codeR4', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-code-bad-code"}, "4.0");
  });

  it('validation-fragment-coding-bad-codeR5', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-coding-bad-code"}, "5.0");
  });

  it('validation-fragment-coding-bad-codeR4', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-coding-bad-code"}, "4.0");
  });

  it('validation-fragment-codeableconcept-bad-codeR5', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-codeableconcept-bad-code"}, "5.0");
  });

  it('validation-fragment-codeableconcept-bad-codeR4', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-codeableconcept-bad-code"}, "4.0");
  });

});

describe('big', () => {
  // Testing handling a big code system

  it('big-echo-no-limitR5', async () => {
    await runTest({"suite":"big","test":"big-echo-no-limit"}, "5.0");
  });

  it('big-echo-no-limitR4', async () => {
    await runTest({"suite":"big","test":"big-echo-no-limit"}, "4.0");
  });

  it('big-echo-zero-fifty-limitR5', async () => {
    await runTest({"suite":"big","test":"big-echo-zero-fifty-limit"}, "5.0");
  });

  it('big-echo-zero-fifty-limitR4', async () => {
    await runTest({"suite":"big","test":"big-echo-zero-fifty-limit"}, "4.0");
  });

  it('big-echo-fifty-fifty-limitR5', async () => {
    await runTest({"suite":"big","test":"big-echo-fifty-fifty-limit"}, "5.0");
  });

  it('big-echo-fifty-fifty-limitR4', async () => {
    await runTest({"suite":"big","test":"big-echo-fifty-fifty-limit"}, "4.0");
  });

  it('big-circle-bangR5', async () => {
    await runTest({"suite":"big","test":"big-circle-bang"}, "5.0");
  });

  it('big-circle-bangR4', async () => {
    await runTest({"suite":"big","test":"big-circle-bang"}, "4.0");
  });

  it('big-circle-validateR5', async () => {
    await runTest({"suite":"big","test":"big-circle-validate"}, "5.0");
  });

  it('big-circle-validateR4', async () => {
    await runTest({"suite":"big","test":"big-circle-validate"}, "4.0");
  });

});

describe('other', () => {
  // Misc tests based on issues submitted by users

  it('dual-filterR5', async () => {
    await runTest({"suite":"other","test":"dual-filter"}, "5.0");
  });

  it('dual-filterR4', async () => {
    await runTest({"suite":"other","test":"dual-filter"}, "4.0");
  });

  it('validation-dual-filter-inR5', async () => {
    await runTest({"suite":"other","test":"validation-dual-filter-in"}, "5.0");
  });

  it('validation-dual-filter-inR4', async () => {
    await runTest({"suite":"other","test":"validation-dual-filter-in"}, "4.0");
  });

  it('validation-dual-filter-outR5', async () => {
    await runTest({"suite":"other","test":"validation-dual-filter-out"}, "5.0");
  });

  it('validation-dual-filter-outR4', async () => {
    await runTest({"suite":"other","test":"validation-dual-filter-out"}, "4.0");
  });

});

describe('errors', () => {
  // Testing Various Error Conditions

  it('unknown-system1R5', async () => {
    await runTest({"suite":"errors","test":"unknown-system1"}, "5.0");
  });

  it('unknown-system1R4', async () => {
    await runTest({"suite":"errors","test":"unknown-system1"}, "4.0");
  });

  it('unknown-system2R5', async () => {
    await runTest({"suite":"errors","test":"unknown-system2"}, "5.0");
  });

  it('unknown-system2R4', async () => {
    await runTest({"suite":"errors","test":"unknown-system2"}, "4.0");
  });

  it('broken-filter-validateR5', async () => {
    await runTest({"suite":"errors","test":"broken-filter-validate"}, "5.0");
  });

  it('broken-filter-validateR4', async () => {
    await runTest({"suite":"errors","test":"broken-filter-validate"}, "4.0");
  });

  it('broken-filter2-validateR5', async () => {
    await runTest({"suite":"errors","test":"broken-filter2-validate"}, "5.0");
  });

  it('broken-filter2-validateR4', async () => {
    await runTest({"suite":"errors","test":"broken-filter2-validate"}, "4.0");
  });

  it('broken-filter-expandR5', async () => {
    await runTest({"suite":"errors","test":"broken-filter-expand"}, "5.0");
  });

  it('broken-filter-expandR4', async () => {
    await runTest({"suite":"errors","test":"broken-filter-expand"}, "4.0");
  });

  it('combination-okR5', async () => {
    await runTest({"suite":"errors","test":"combination-ok"}, "5.0");
  });

  it('combination-okR4', async () => {
    await runTest({"suite":"errors","test":"combination-ok"}, "4.0");
  });

  it('combination-badR5', async () => {
    await runTest({"suite":"errors","test":"combination-bad"}, "5.0");
  });

  it('combination-badR4', async () => {
    await runTest({"suite":"errors","test":"combination-bad"}, "4.0");
  });

});

describe('deprecated', () => {
  // Testing Deprecated+Withdrawn warnings

  it('withdrawnR5', async () => {
    await runTest({"suite":"deprecated","test":"withdrawn"}, "5.0");
  });

  it('withdrawnR4', async () => {
    await runTest({"suite":"deprecated","test":"withdrawn"}, "4.0");
  });

  it('not-withdrawnR5', async () => {
    await runTest({"suite":"deprecated","test":"not-withdrawn"}, "5.0");
  });

  it('not-withdrawnR4', async () => {
    await runTest({"suite":"deprecated","test":"not-withdrawn"}, "4.0");
  });

  it('withdrawn-validateR5', async () => {
    await runTest({"suite":"deprecated","test":"withdrawn-validate"}, "5.0");
  });

  it('withdrawn-validateR4', async () => {
    await runTest({"suite":"deprecated","test":"withdrawn-validate"}, "4.0");
  });

  it('not-withdrawn-validateR5', async () => {
    await runTest({"suite":"deprecated","test":"not-withdrawn-validate"}, "5.0");
  });

  it('not-withdrawn-validateR4', async () => {
    await runTest({"suite":"deprecated","test":"not-withdrawn-validate"}, "4.0");
  });

  it('experimentalR5', async () => {
    await runTest({"suite":"deprecated","test":"experimental"}, "5.0");
  });

  it('experimentalR4', async () => {
    await runTest({"suite":"deprecated","test":"experimental"}, "4.0");
  });

  it('experimental-validateR5', async () => {
    await runTest({"suite":"deprecated","test":"experimental-validate"}, "5.0");
  });

  it('experimental-validateR4', async () => {
    await runTest({"suite":"deprecated","test":"experimental-validate"}, "4.0");
  });

  it('draftR5', async () => {
    await runTest({"suite":"deprecated","test":"draft"}, "5.0");
  });

  it('draftR4', async () => {
    await runTest({"suite":"deprecated","test":"draft"}, "4.0");
  });

  it('draft-validateR5', async () => {
    await runTest({"suite":"deprecated","test":"draft-validate"}, "5.0");
  });

  it('draft-validateR4', async () => {
    await runTest({"suite":"deprecated","test":"draft-validate"}, "4.0");
  });

  it('vs-deprecationR5', async () => {
    await runTest({"suite":"deprecated","test":"vs-deprecation"}, "5.0");
  });

  it('vs-deprecationR4', async () => {
    await runTest({"suite":"deprecated","test":"vs-deprecation"}, "4.0");
  });

  it('deprecating-validateR5', async () => {
    await runTest({"suite":"deprecated","test":"deprecating-validate"}, "5.0");
  });

  it('deprecating-validateR4', async () => {
    await runTest({"suite":"deprecated","test":"deprecating-validate"}, "4.0");
  });

  it('deprecating-validate-2R5', async () => {
    await runTest({"suite":"deprecated","test":"deprecating-validate-2"}, "5.0");
  });

  it('deprecating-validate-2R4', async () => {
    await runTest({"suite":"deprecated","test":"deprecating-validate-2"}, "4.0");
  });

});

describe('notSelectable', () => {
  // Testing notSelectable

  it('notSelectable-prop-allR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-all"}, "5.0");
  });

  it('notSelectable-prop-allR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-all"}, "4.0");
  });

  it('notSelectable-noprop-allR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-all"}, "5.0");
  });

  it('notSelectable-noprop-allR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-all"}, "4.0");
  });

  it('notSelectable-reprop-allR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-all"}, "5.0");
  });

  it('notSelectable-reprop-allR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-all"}, "4.0");
  });

  it('notSelectable-unprop-allR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-all"}, "5.0");
  });

  it('notSelectable-unprop-allR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-all"}, "4.0");
  });

  it('notSelectable-prop-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true"}, "5.0");
  });

  it('notSelectable-prop-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true"}, "4.0");
  });

  it('notSelectable-prop-trueUCR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-trueUC"}, "5.0");
  });

  it('notSelectable-prop-trueUCR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-trueUC"}, "4.0");
  });

  it('notSelectable-noprop-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true"}, "5.0");
  });

  it('notSelectable-noprop-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true"}, "4.0");
  });

  it('notSelectable-reprop-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true"}, "5.0");
  });

  it('notSelectable-reprop-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true"}, "4.0");
  });

  it('notSelectable-unprop-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true"}, "5.0");
  });

  it('notSelectable-unprop-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true"}, "4.0");
  });

  it('notSelectable-prop-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false"}, "5.0");
  });

  it('notSelectable-prop-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false"}, "4.0");
  });

  it('notSelectable-noprop-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false"}, "5.0");
  });

  it('notSelectable-noprop-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false"}, "4.0");
  });

  it('notSelectable-reprop-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false"}, "5.0");
  });

  it('notSelectable-reprop-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false"}, "4.0");
  });

  it('notSelectable-unprop-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false"}, "5.0");
  });

  it('notSelectable-unprop-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false"}, "4.0");
  });

  it('notSelectable-prop-inR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in"}, "5.0");
  });

  it('notSelectable-prop-inR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in"}, "4.0");
  });

  it('notSelectable-prop-outR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out"}, "5.0");
  });

  it('notSelectable-prop-outR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out"}, "4.0");
  });

  it('notSelectable-prop-true-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true"}, "5.0");
  });

  it('notSelectable-prop-true-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true"}, "4.0");
  });

  it('notSelectable-prop-trueUC-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-trueUC-true"}, "5.0");
  });

  it('notSelectable-prop-trueUC-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-trueUC-true"}, "4.0");
  });

  it('notSelectable-prop-in-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-true"}, "5.0");
  });

  it('notSelectable-prop-in-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-true"}, "4.0");
  });

  it('notSelectable-prop-out-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-true"}, "5.0");
  });

  it('notSelectable-prop-out-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-true"}, "4.0");
  });

  it('notSelectable-noprop-true-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-true"}, "5.0");
  });

  it('notSelectable-noprop-true-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-true"}, "4.0");
  });

  it('notSelectable-reprop-true-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-true"}, "5.0");
  });

  it('notSelectable-reprop-true-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-true"}, "4.0");
  });

  it('notSelectable-unprop-true-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-true"}, "5.0");
  });

  it('notSelectable-unprop-true-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-true"}, "4.0");
  });

  it('notSelectable-prop-true-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-false"}, "5.0");
  });

  it('notSelectable-prop-true-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-false"}, "4.0");
  });

  it('notSelectable-prop-in-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-false"}, "5.0");
  });

  it('notSelectable-prop-in-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-false"}, "4.0");
  });

  it('notSelectable-prop-in-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-unknown"}, "5.0");
  });

  it('notSelectable-prop-in-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-unknown"}, "4.0");
  });

  it('notSelectable-prop-out-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-unknown"}, "5.0");
  });

  it('notSelectable-prop-out-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-unknown"}, "4.0");
  });

  it('notSelectable-prop-out-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-false"}, "5.0");
  });

  it('notSelectable-prop-out-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-false"}, "4.0");
  });

  it('notSelectable-noprop-true-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-false"}, "5.0");
  });

  it('notSelectable-noprop-true-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-false"}, "4.0");
  });

  it('notSelectable-reprop-true-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-false"}, "5.0");
  });

  it('notSelectable-reprop-true-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-false"}, "4.0");
  });

  it('notSelectable-unprop-true-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-false"}, "5.0");
  });

  it('notSelectable-unprop-true-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-false"}, "4.0");
  });

  it('notSelectable-prop-false-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-true"}, "5.0");
  });

  it('notSelectable-prop-false-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-true"}, "4.0");
  });

  it('notSelectable-noprop-false-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-true"}, "5.0");
  });

  it('notSelectable-noprop-false-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-true"}, "4.0");
  });

  it('notSelectable-reprop-false-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-true"}, "5.0");
  });

  it('notSelectable-reprop-false-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-true"}, "4.0");
  });

  it('notSelectable-unprop-false-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-true"}, "5.0");
  });

  it('notSelectable-unprop-false-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-true"}, "4.0");
  });

  it('notSelectable-prop-false-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false"}, "5.0");
  });

  it('notSelectable-prop-false-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false"}, "4.0");
  });

  it('notSelectable-noprop-false-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-false"}, "5.0");
  });

  it('notSelectable-noprop-false-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-false"}, "4.0");
  });

  it('notSelectable-reprop-false-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-false"}, "5.0");
  });

  it('notSelectable-reprop-false-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-false"}, "4.0");
  });

  it('notSelectable-unprop-false-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-false"}, "5.0");
  });

  it('notSelectable-unprop-false-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-false"}, "4.0");
  });

  it('notSelectable-noprop-true-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-unknown"}, "5.0");
  });

  it('notSelectable-noprop-true-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-unknown"}, "4.0");
  });

  it('notSelectable-reprop-true-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-unknown"}, "5.0");
  });

  it('notSelectable-reprop-true-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-unknown"}, "4.0");
  });

  it('notSelectable-unprop-true-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-unknown"}, "5.0");
  });

  it('notSelectable-unprop-true-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-unknown"}, "4.0");
  });

  it('notSelectable-prop-true-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-unknown"}, "5.0");
  });

  it('notSelectable-prop-true-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-unknown"}, "4.0");
  });

  it('notSelectable-prop-false-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-unknown"}, "5.0");
  });

  it('notSelectable-prop-false-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-unknown"}, "4.0");
  });

  it('notSelectable-noprop-false-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-unknown"}, "5.0");
  });

  it('notSelectable-noprop-false-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-unknown"}, "4.0");
  });

  it('notSelectable-reprop-false-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-unknown"}, "5.0");
  });

  it('notSelectable-reprop-false-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-unknown"}, "4.0");
  });

  it('notSelectable-unprop-false-unknownR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-unknown"}, "5.0");
  });

  it('notSelectable-unprop-false-unknownR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-unknown"}, "4.0");
  });

  it('notSelectable-prop-true-true-param-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true-param-true"}, "5.0");
  });

  it('notSelectable-prop-true-true-param-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true-param-true"}, "4.0");
  });

  it('notSelectable-prop-true-true-param-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true-param-false"}, "5.0");
  });

  it('notSelectable-prop-true-true-param-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true-param-false"}, "4.0");
  });

  it('notSelectable-prop-false-false-param-trueR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false-param-true"}, "5.0");
  });

  it('notSelectable-prop-false-false-param-trueR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false-param-true"}, "4.0");
  });

  it('notSelectable-prop-false-false-param-falseR5', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false-param-false"}, "5.0");
  });

  it('notSelectable-prop-false-false-param-falseR4', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false-param-false"}, "4.0");
  });

});

describe('inactive', () => {
  // Testing Inactive codes

  it('inactive-expandR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-expand"}, "5.0");
  });

  it('inactive-expandR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-expand"}, "4.0");
  });

  it('inactive-inactive-expandR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-inactive-expand"}, "5.0");
  });

  it('inactive-inactive-expandR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-inactive-expand"}, "4.0");
  });

  it('inactive-active-expandR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-active-expand"}, "5.0");
  });

  it('inactive-active-expandR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-active-expand"}, "4.0");
  });

  it('inactive-1-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-1-validate"}, "5.0");
  });

  it('inactive-1-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-1-validate"}, "4.0");
  });

  it('inactive-2-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-2-validate"}, "5.0");
  });

  it('inactive-2-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-2-validate"}, "4.0");
  });

  it('inactive-3-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-3-validate"}, "5.0");
  });

  it('inactive-3-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-3-validate"}, "4.0");
  });

  it('inactive-1a-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-1a-validate"}, "5.0");
  });

  it('inactive-1a-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-1a-validate"}, "4.0");
  });

  it('inactive-2a-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-2a-validate"}, "5.0");
  });

  it('inactive-2a-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-2a-validate"}, "4.0");
  });

  it('inactive-3a-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-3a-validate"}, "5.0");
  });

  it('inactive-3a-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-3a-validate"}, "4.0");
  });

  it('inactive-1b-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-1b-validate"}, "5.0");
  });

  it('inactive-1b-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-1b-validate"}, "4.0");
  });

  it('inactive-2b-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-2b-validate"}, "5.0");
  });

  it('inactive-2b-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-2b-validate"}, "4.0");
  });

  it('inactive-3b-validateR5', async () => {
    await runTest({"suite":"inactive","test":"inactive-3b-validate"}, "5.0");
  });

  it('inactive-3b-validateR4', async () => {
    await runTest({"suite":"inactive","test":"inactive-3b-validate"}, "4.0");
  });

});

describe('case', () => {
  // Test Case Sensitivity handling

  it('case-insensitive-code1-1R5', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-1"}, "5.0");
  });

  it('case-insensitive-code1-1R4', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-1"}, "4.0");
  });

  it('case-insensitive-code1-2R5', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-2"}, "5.0");
  });

  it('case-insensitive-code1-2R4', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-2"}, "4.0");
  });

  it('case-insensitive-code1-3R5', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-3"}, "5.0");
  });

  it('case-insensitive-code1-3R4', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-3"}, "4.0");
  });

  it('case-sensitive-code1-1R5', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-1"}, "5.0");
  });

  it('case-sensitive-code1-1R4', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-1"}, "4.0");
  });

  it('case-sensitive-code1-2R5', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-2"}, "5.0");
  });

  it('case-sensitive-code1-2R4', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-2"}, "4.0");
  });

  it('case-sensitive-code1-3R5', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-3"}, "5.0");
  });

  it('case-sensitive-code1-3R4', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-3"}, "4.0");
  });

});

describe('translate', () => {
  // Tests for ConceptMap.$translate

  it('translate-1R5', async () => {
    await runTest({"suite":"translate","test":"translate-1"}, "5.0");
  });

  it('translate-1R4', async () => {
    await runTest({"suite":"translate","test":"translate-1"}, "4.0");
  });

});

describe('tho', () => {
  // Misc assorted test cases from tho

  it('act-classR5', async () => {
    await runTest({"suite":"tho","test":"act-class"}, "5.0");
  });

  it('act-classR4', async () => {
    await runTest({"suite":"tho","test":"act-class"}, "4.0");
  });

  it('act-class-activeonlyR5', async () => {
    await runTest({"suite":"tho","test":"act-class-activeonly"}, "5.0");
  });

  it('act-class-activeonlyR4', async () => {
    await runTest({"suite":"tho","test":"act-class-activeonly"}, "4.0");
  });

});

describe('exclude', () => {
  // Tests for proper functioning of exclude

  it('exclude-1R5', async () => {
    await runTest({"suite":"exclude","test":"exclude-1"}, "5.0");
  });

  it('exclude-1R4', async () => {
    await runTest({"suite":"exclude","test":"exclude-1"}, "4.0");
  });

  it('exclude-2R5', async () => {
    await runTest({"suite":"exclude","test":"exclude-2"}, "5.0");
  });

  it('exclude-2R4', async () => {
    await runTest({"suite":"exclude","test":"exclude-2"}, "4.0");
  });

  it('exclude-zeroR5', async () => {
    await runTest({"suite":"exclude","test":"exclude-zero"}, "5.0");
  });

  it('exclude-zeroR4', async () => {
    await runTest({"suite":"exclude","test":"exclude-zero"}, "4.0");
  });

});

describe('default-valueset-version', () => {
  // Test the default-valueset-version parameter

  it('direct-expand-oneR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"direct-expand-one"}, "5.0");
  });

  it('direct-expand-oneR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"direct-expand-one"}, "4.0");
  });

  it('direct-expand-twoR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"direct-expand-two"}, "5.0");
  });

  it('direct-expand-twoR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"direct-expand-two"}, "4.0");
  });

  it('indirect-expand-oneR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-one"}, "5.0");
  });

  it('indirect-expand-oneR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-one"}, "4.0");
  });

  it('indirect-expand-twoR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-two"}, "5.0");
  });

  it('indirect-expand-twoR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-two"}, "4.0");
  });

  it('indirect-expand-zeroR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero"}, "5.0");
  });

  it('indirect-expand-zeroR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero"}, "4.0");
  });

  it('indirect-expand-zero-pinnedR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero-pinned"}, "5.0");
  });

  it('indirect-expand-zero-pinnedR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero-pinned"}, "4.0");
  });

  it('indirect-expand-zero-pinned-wrongR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero-pinned-wrong"}, "5.0");
  });

  it('indirect-expand-zero-pinned-wrongR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero-pinned-wrong"}, "4.0");
  });

  it('indirect-validation-oneR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-one"}, "5.0");
  });

  it('indirect-validation-oneR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-one"}, "4.0");
  });

  it('indirect-validation-twoR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-two"}, "5.0");
  });

  it('indirect-validation-twoR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-two"}, "4.0");
  });

  it('indirect-validation-zeroR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero"}, "5.0");
  });

  it('indirect-validation-zeroR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero"}, "4.0");
  });

  it('indirect-validation-zero-pinnedR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero-pinned"}, "5.0");
  });

  it('indirect-validation-zero-pinnedR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero-pinned"}, "4.0");
  });

  it('indirect-validation-zero-pinned-wrongR5', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero-pinned-wrong"}, "5.0");
  });

  it('indirect-validation-zero-pinned-wrongR4', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero-pinned-wrong"}, "4.0");
  });

});

describe('tx.fhir.org', () => {
  // These are tx.fhir.org specific tests. There's no expectation that other servers will pass these tests, and they are not executed by default. (other servers can, but they depend on other set up not controlled by the tests

  it('snomed-validation-1R5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"snomed-validation-1"}, "5.0");
  });

  it('snomed-validation-1R4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"snomed-validation-1"}, "4.0");
  });

  it('loinc-lookup-codeR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-code"}, "5.0");
  });

  it('loinc-lookup-codeR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-code"}, "4.0");
  });

  it('loinc-lookup-partR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-part"}, "5.0");
  });

  it('loinc-lookup-partR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-part"}, "4.0");
  });

  it('loinc-lookup-listR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-list"}, "5.0");
  });

  it('loinc-lookup-listR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-list"}, "4.0");
  });

  it('loinc-lookup-answerR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-answer"}, "5.0");
  });

  it('loinc-lookup-answerR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-answer"}, "4.0");
  });

  it('loinc-validate-codeR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code"}, "5.0");
  });

  it('loinc-validate-codeR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code"}, "4.0");
  });

  it('loinc-validate-discouraged-codeR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-discouraged-code"}, "5.0");
  });

  it('loinc-validate-discouraged-codeR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-discouraged-code"}, "4.0");
  });

  it('loinc-validate-code-supp1R5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code-supp1"}, "5.0");
  });

  it('loinc-validate-code-supp1R4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code-supp1"}, "4.0");
  });

  it('loinc-validate-code-supp2R5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code-supp2"}, "5.0");
  });

  it('loinc-validate-code-supp2R4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code-supp2"}, "4.0");
  });

  it('loinc-validate-partR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-part"}, "5.0");
  });

  it('loinc-validate-partR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-part"}, "4.0");
  });

  it('loinc-validate-listR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list"}, "5.0");
  });

  it('loinc-validate-listR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list"}, "4.0");
  });

  it('loinc-validate-answerR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-answer"}, "5.0");
  });

  it('loinc-validate-answerR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-answer"}, "4.0");
  });

  it('loinc-validate-invalidR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-invalid"}, "5.0");
  });

  it('loinc-validate-invalidR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-invalid"}, "4.0");
  });

  it('loinc-expand-enumR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-enum"}, "5.0");
  });

  it('loinc-expand-enumR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-enum"}, "4.0");
  });

  it('loinc-expand-allR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-all"}, "5.0");
  });

  it('loinc-expand-allR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-all"}, "4.0");
  });

  it('loinc-expand-all-limitedR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-all-limited"}, "5.0");
  });

  it('loinc-expand-all-limitedR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-all-limited"}, "4.0");
  });

  it('loinc-expand-enum-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-enum-bad"}, "5.0");
  });

  it('loinc-expand-enum-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-enum-bad"}, "4.0");
  });

  it('loinc-expand-statusR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-status"}, "5.0");
  });

  it('loinc-expand-statusR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-status"}, "4.0");
  });

  it('loinc-expand-class-regexR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-class-regex"}, "5.0");
  });

  it('loinc-expand-class-regexR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-class-regex"}, "4.0");
  });

  it('loinc-expand-prop-componentR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-component"}, "5.0");
  });

  it('loinc-expand-prop-componentR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-component"}, "4.0");
  });

  it('loinc-expand-prop-methodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-method"}, "5.0");
  });

  it('loinc-expand-prop-methodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-method"}, "4.0");
  });

  it('loinc-expand-prop-component-strR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-component-str"}, "5.0");
  });

  it('loinc-expand-prop-component-strR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-component-str"}, "4.0");
  });

  it('loinc-expand-prop-order-obsR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-order-obs"}, "5.0");
  });

  it('loinc-expand-prop-order-obsR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-order-obs"}, "4.0");
  });

  it('loinc-expand-concept-is-aR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-concept-is-a"}, "5.0");
  });

  it('loinc-expand-concept-is-aR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-concept-is-a"}, "4.0");
  });

  it('loinc-expand-copyrightR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-copyright"}, "5.0");
  });

  it('loinc-expand-copyrightR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-copyright"}, "4.0");
  });

  it('loinc-expand-scale-typeR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-scale-type"}, "5.0");
  });

  it('loinc-expand-scale-typeR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-scale-type"}, "4.0");
  });

  it('loinc-validate-enum-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-enum-good"}, "5.0");
  });

  it('loinc-validate-enum-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-enum-good"}, "4.0");
  });

  it('loinc-validate-enum-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-enum-bad"}, "5.0");
  });

  it('loinc-validate-enum-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-enum-bad"}, "4.0");
  });

  it('loinc-validate-filter-prop-component-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-prop-component-good"}, "5.0");
  });

  it('loinc-validate-filter-prop-component-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-prop-component-good"}, "4.0");
  });

  it('loinc-validate-filter-prop-component-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-prop-component-bad"}, "5.0");
  });

  it('loinc-validate-filter-prop-component-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-prop-component-bad"}, "4.0");
  });

  it('loinc-validate-filter-status-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-status-good"}, "5.0");
  });

  it('loinc-validate-filter-status-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-status-good"}, "4.0");
  });

  it('loinc-validate-filter-status-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-status-bad"}, "5.0");
  });

  it('loinc-validate-filter-status-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-status-bad"}, "4.0");
  });

  it('loinc-validate-filter-class-regex-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-class-regex-good"}, "5.0");
  });

  it('loinc-validate-filter-class-regex-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-class-regex-good"}, "4.0");
  });

  it('loinc-validate-filter-class-regex-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-class-regex-bad"}, "5.0");
  });

  it('loinc-validate-filter-class-regex-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-class-regex-bad"}, "4.0");
  });

  it('loinc-validate-filter-scale-type-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-scale-type-good"}, "5.0");
  });

  it('loinc-validate-filter-scale-type-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-scale-type-good"}, "4.0");
  });

  it('loinc-validate-filter-scale-type-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-scale-type-bad"}, "5.0");
  });

  it('loinc-validate-filter-scale-type-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-scale-type-bad"}, "4.0");
  });

  it('loinc-expand-list-request-parametersR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-list-request-parameters"}, "5.0");
  });

  it('loinc-expand-list-request-parametersR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-list-request-parameters"}, "4.0");
  });

  it('loinc-validate-list-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list-good"}, "5.0");
  });

  it('loinc-validate-list-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list-good"}, "4.0");
  });

  it('loinc-validate-list-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list-bad"}, "5.0");
  });

  it('loinc-validate-list-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list-bad"}, "4.0");
  });

  it('loinc-expand-filter-list-request-parametersR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-list-request-parameters"}, "5.0");
  });

  it('loinc-expand-filter-list-request-parametersR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-list-request-parameters"}, "4.0");
  });

  it('loinc-validate-filter-list-type-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-list-type-good"}, "5.0");
  });

  it('loinc-validate-filter-list-type-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-list-type-good"}, "4.0");
  });

  it('loinc-validate-filter-list-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-list-bad"}, "5.0");
  });

  it('loinc-validate-filter-list-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-list-bad"}, "4.0");
  });

  it('loinc-expand-filter-dockind-request-parametersR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-dockind-request-parameters"}, "5.0");
  });

  it('loinc-expand-filter-dockind-request-parametersR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-dockind-request-parameters"}, "4.0");
  });

  it('loinc-validate-filter-dockind-type-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-dockind-type-good"}, "5.0");
  });

  it('loinc-validate-filter-dockind-type-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-dockind-type-good"}, "4.0");
  });

  it('loinc-validate-filter-dockind-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-dockind-bad"}, "5.0");
  });

  it('loinc-validate-filter-dockind-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-dockind-bad"}, "4.0");
  });

  it('loinc-validate-filter-classtype-goodR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-classtype-good"}, "5.0");
  });

  it('loinc-validate-filter-classtype-goodR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-classtype-good"}, "4.0");
  });

  it('loinc-validate-filter-classtype-badR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-classtype-bad"}, "5.0");
  });

  it('loinc-validate-filter-classtype-badR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-classtype-bad"}, "4.0");
  });

  it('loinc-expand-filter-answers-for1R5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answers-for1"}, "5.0");
  });

  it('loinc-expand-filter-answers-for1R4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answers-for1"}, "4.0");
  });

  it('loinc-expand-filter-answers-for2R5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answers-for2"}, "5.0");
  });

  it('loinc-expand-filter-answers-for2R4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answers-for2"}, "4.0");
  });

  it('loinc-expand-filter-answer-listR5', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answer-list"}, "5.0");
  });

  it('loinc-expand-filter-answer-listR4', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answer-list"}, "4.0");
  });

});

describe('snomed', () => {
  // This snomed tests are based on the subset distributed with the tx-ecosystem IG

  it('snomed-inactive-displayR5', async () => {
    await runTest({"suite":"snomed","test":"snomed-inactive-display"}, "5.0");
  });

  it('snomed-inactive-displayR4', async () => {
    await runTest({"suite":"snomed","test":"snomed-inactive-display"}, "4.0");
  });

  it('snomed-procedure-in-displayR5', async () => {
    await runTest({"suite":"snomed","test":"snomed-procedure-in-display"}, "5.0");
  });

  it('snomed-procedure-in-displayR4', async () => {
    await runTest({"suite":"snomed","test":"snomed-procedure-in-display"}, "4.0");
  });

  it('snomed-procedure-out-displayR5', async () => {
    await runTest({"suite":"snomed","test":"snomed-procedure-out-display"}, "5.0");
  });

  it('snomed-procedure-out-displayR4', async () => {
    await runTest({"suite":"snomed","test":"snomed-procedure-out-display"}, "4.0");
  });

  it('snomed-expand-inactiveR5', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-inactive"}, "5.0");
  });

  it('snomed-expand-inactiveR4', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-inactive"}, "4.0");
  });

  it('snomed-expand-diabetesR5', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-diabetes"}, "5.0");
  });

  it('snomed-expand-diabetesR4', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-diabetes"}, "4.0");
  });

  it('snomed-expand-proceduresR5', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-procedures"}, "5.0");
  });

  it('snomed-expand-proceduresR4', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-procedures"}, "4.0");
  });

});

describe('batch', () => {
  // Test Batch Validation

  it('batch-validateR5', async () => {
    await runTest({"suite":"batch","test":"batch-validate"}, "5.0");
  });

  it('batch-validateR4', async () => {
    await runTest({"suite":"batch","test":"batch-validate"}, "4.0");
  });

  it('batch-validate-badR5', async () => {
    await runTest({"suite":"batch","test":"batch-validate-bad"}, "5.0");
  });

  it('batch-validate-badR4', async () => {
    await runTest({"suite":"batch","test":"batch-validate-bad"}, "4.0");
  });

});

describe('omop', () => {
  // Tests for OMOP implementations. Note that some servers only do OMOP (and some don't). The tests are based on a stable subset of OMOP maintained by Davera Gabriel

  it('omop-basic-validation-code-goodR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good"}, "5.0");
  });

  it('omop-basic-validation-code-goodR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good"}, "4.0");
  });

  it('omop-basic-validation-coding-goodR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-good"}, "5.0");
  });

  it('omop-basic-validation-coding-goodR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-good"}, "4.0");
  });

  it('omop-basic-validation-codeableconcept-goodR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-good"}, "5.0");
  });

  it('omop-basic-validation-codeableconcept-goodR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-good"}, "4.0");
  });

  it('omop-basic-validation-code-badR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad"}, "5.0");
  });

  it('omop-basic-validation-code-badR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad"}, "4.0");
  });

  it('omop-basic-validation-coding-badR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad"}, "5.0");
  });

  it('omop-basic-validation-coding-badR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad"}, "4.0");
  });

  it('omop-basic-validation-codeableconcept-badR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad"}, "5.0");
  });

  it('omop-basic-validation-codeableconcept-badR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad"}, "4.0");
  });

  it('omop-basic-validation-code-bad-displayR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-display"}, "5.0");
  });

  it('omop-basic-validation-code-bad-displayR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-display"}, "4.0");
  });

  it('omop-basic-validation-coding-bad-displayR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-display"}, "5.0");
  });

  it('omop-basic-validation-coding-bad-displayR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-display"}, "4.0");
  });

  it('omop-basic-validation-codeableconcept-bad-displayR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-display"}, "5.0");
  });

  it('omop-basic-validation-codeableconcept-bad-displayR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-display"}, "4.0");
  });

  it('omop-basic-validation-code-bad-versionR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-version"}, "5.0");
  });

  it('omop-basic-validation-code-bad-versionR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-version"}, "4.0");
  });

  it('omop-basic-validation-coding-bad-versionR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-version"}, "5.0");
  });

  it('omop-basic-validation-coding-bad-versionR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-version"}, "4.0");
  });

  it('omop-basic-validation-codeableconcept-bad-versionR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-version"}, "5.0");
  });

  it('omop-basic-validation-codeableconcept-bad-versionR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-version"}, "4.0");
  });

  it('omop-basic-validation-code-good-vsR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good-vs"}, "5.0");
  });

  it('omop-basic-validation-code-good-vsR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good-vs"}, "4.0");
  });

  it('omop-basic-validation-coding-good-vsR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-good-vs"}, "5.0");
  });

  it('omop-basic-validation-coding-good-vsR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-good-vs"}, "4.0");
  });

  it('omop-basic-validation-codeableconcept-good-vsR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-good-vs"}, "5.0");
  });

  it('omop-basic-validation-codeableconcept-good-vsR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-good-vs"}, "4.0");
  });

  it('omop-basic-validation-code-bad-vsR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-vs"}, "5.0");
  });

  it('omop-basic-validation-code-bad-vsR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-vs"}, "4.0");
  });

  it('omop-basic-validation-coding-bad-vsR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-vs"}, "5.0");
  });

  it('omop-basic-validation-coding-bad-vsR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-vs"}, "4.0");
  });

  it('omop-basic-validation-codeableconcept-bad-vsR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-vs"}, "5.0");
  });

  it('omop-basic-validation-codeableconcept-bad-vsR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-vs"}, "4.0");
  });

  it('omop-lookup-codeR5', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code"}, "5.0");
  });

  it('omop-lookup-codeR4', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code"}, "4.0");
  });

  it('omop-lookup-code2R5', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code2"}, "5.0");
  });

  it('omop-lookup-code2R4', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code2"}, "4.0");
  });

  it('omop-lookup-code3R5', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code3"}, "5.0");
  });

  it('omop-lookup-code3R4', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code3"}, "4.0");
  });

  it('omop-basic-validation-code-good-vs-urlR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good-vs-url"}, "5.0");
  });

  it('omop-basic-validation-code-good-vs-urlR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good-vs-url"}, "4.0");
  });

  it('omop-basic-validation-code-bad-vs-urlR5', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-vs-url"}, "5.0");
  });

  it('omop-basic-validation-code-bad-vs-urlR4', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-vs-url"}, "4.0");
  });

  it('omop-expand-explicitR5', async () => {
    await runTest({"suite":"omop","test":"omop-expand-explicit"}, "5.0");
  });

  it('omop-expand-explicitR4', async () => {
    await runTest({"suite":"omop","test":"omop-expand-explicit"}, "4.0");
  });

  it('translate-loinc-implicitR5', async () => {
    await runTest({"suite":"omop","test":"translate-loinc-implicit"}, "5.0");
  });

  it('translate-loinc-implicitR4', async () => {
    await runTest({"suite":"omop","test":"translate-loinc-implicit"}, "4.0");
  });

  it('translate-loinc-implicit-badR5', async () => {
    await runTest({"suite":"omop","test":"translate-loinc-implicit-bad"}, "5.0");
  });

  it('translate-loinc-implicit-badR4', async () => {
    await runTest({"suite":"omop","test":"translate-loinc-implicit-bad"}, "4.0");
  });

});

describe('UCUM', () => {
  // UCUM Test Cases

  it('lookupR5', async () => {
    await runTest({"suite":"UCUM","test":"lookup"}, "5.0");
  });

  it('lookupR4', async () => {
    await runTest({"suite":"UCUM","test":"lookup"}, "4.0");
  });

  it('lookup-with-annotationR5', async () => {
    await runTest({"suite":"UCUM","test":"lookup-with-annotation"}, "5.0");
  });

  it('lookup-with-annotationR4', async () => {
    await runTest({"suite":"UCUM","test":"lookup-with-annotation"}, "4.0");
  });

  it('expand-ucum-all-4R4', async () => {
    await runTest({"suite":"UCUM","test":"expand-ucum-all-4"}, "4.0");
  });

  it('expand-ucum-all-5R5', async () => {
    await runTest({"suite":"UCUM","test":"expand-ucum-all-5"}, "5.0");
  });

  it('expand-ucum-canonicalR5', async () => {
    await runTest({"suite":"UCUM","test":"expand-ucum-canonical"}, "5.0");
  });

  it('expand-ucum-canonicalR4', async () => {
    await runTest({"suite":"UCUM","test":"expand-ucum-canonical"}, "4.0");
  });

  it('validate-ucum-canonical-goodR5', async () => {
    await runTest({"suite":"UCUM","test":"validate-ucum-canonical-good"}, "5.0");
  });

  it('validate-ucum-canonical-goodR4', async () => {
    await runTest({"suite":"UCUM","test":"validate-ucum-canonical-good"}, "4.0");
  });

  it('validate-ucum-canonical-badR5', async () => {
    await runTest({"suite":"UCUM","test":"validate-ucum-canonical-bad"}, "5.0");
  });

  it('validate-ucum-canonical-badR4', async () => {
    await runTest({"suite":"UCUM","test":"validate-ucum-canonical-bad"}, "4.0");
  });

  it('validate-all-canonical-goodR5', async () => {
    await runTest({"suite":"UCUM","test":"validate-all-canonical-good"}, "5.0");
  });

  it('validate-all-canonical-goodR4', async () => {
    await runTest({"suite":"UCUM","test":"validate-all-canonical-good"}, "4.0");
  });

  it('validate-ucum-all-badR5', async () => {
    await runTest({"suite":"UCUM","test":"validate-ucum-all-bad"}, "5.0");
  });

  it('validate-ucum-all-badR4', async () => {
    await runTest({"suite":"UCUM","test":"validate-ucum-all-bad"}, "4.0");
  });

});

describe('bugs', () => {
  // A series of tests that deal with discovered bugs in FHIRsmith. These tests are specific to FHIRsmith - internal QA

  it('country-codesR5', async () => {
    await runTest({"suite":"bugs","test":"country-codes"}, "5.0");
  });

  it('country-codesR4', async () => {
    await runTest({"suite":"bugs","test":"country-codes"}, "4.0");
  });

  it('no-systemR5', async () => {
    await runTest({"suite":"bugs","test":"no-system"}, "5.0");
  });

  it('no-systemR4', async () => {
    await runTest({"suite":"bugs","test":"no-system"}, "4.0");
  });

  it('sct-parseR5', async () => {
    await runTest({"suite":"bugs","test":"sct-parse"}, "5.0");
  });

  it('sct-parseR4', async () => {
    await runTest({"suite":"bugs","test":"sct-parse"}, "4.0");
  });

  it('sct-parse-pcR5', async () => {
    await runTest({"suite":"bugs","test":"sct-parse-pc"}, "5.0");
  });

  it('sct-parse-pcR4', async () => {
    await runTest({"suite":"bugs","test":"sct-parse-pc"}, "4.0");
  });

  it('lang-caseR5', async () => {
    await runTest({"suite":"bugs","test":"lang-case"}, "5.0");
  });

  it('lang-caseR4', async () => {
    await runTest({"suite":"bugs","test":"lang-case"}, "4.0");
  });

  it('lang-case2R5', async () => {
    await runTest({"suite":"bugs","test":"lang-case2"}, "5.0");
  });

  it('lang-case2R4', async () => {
    await runTest({"suite":"bugs","test":"lang-case2"}, "4.0");
  });

  it('provenanceR5', async () => {
    await runTest({"suite":"bugs","test":"provenance"}, "5.0");
  });

  it('provenanceR4', async () => {
    await runTest({"suite":"bugs","test":"provenance"}, "4.0");
  });

  it('country-codeR5', async () => {
    await runTest({"suite":"bugs","test":"country-code"}, "5.0");
  });

  it('country-codeR4', async () => {
    await runTest({"suite":"bugs","test":"country-code"}, "4.0");
  });

  it('sct-msg-4R4', async () => {
    await runTest({"suite":"bugs","test":"sct-msg-4"}, "4.0");
  });

  it('sct-msg-5R5', async () => {
    await runTest({"suite":"bugs","test":"sct-msg-5"}, "5.0");
  });

  it('sct-display-1R5', async () => {
    await runTest({"suite":"bugs","test":"sct-display-1"}, "5.0");
  });

  it('sct-display-1R4', async () => {
    await runTest({"suite":"bugs","test":"sct-display-1"}, "4.0");
  });

  it('sct-display-2R5', async () => {
    await runTest({"suite":"bugs","test":"sct-display-2"}, "5.0");
  });

  it('sct-display-2R4', async () => {
    await runTest({"suite":"bugs","test":"sct-display-2"}, "4.0");
  });

  it('x12-badR5', async () => {
    await runTest({"suite":"bugs","test":"x12-bad"}, "5.0");
  });

  it('x12-badR4', async () => {
    await runTest({"suite":"bugs","test":"x12-bad"}, "4.0");
  });

});

describe('permutations', () => {
  // A set of permutations generated by Claude with the goal of increasing test coverage.

  it('bad-cc1-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-all-request"}, "5.0");
  });

  it('bad-cc1-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-all-request"}, "4.0");
  });

  it('bad-cc1-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-enumerated-request"}, "5.0");
  });

  it('bad-cc1-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-enumerated-request"}, "4.0");
  });

  it('bad-cc1-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-exclude-filter-request"}, "5.0");
  });

  it('bad-cc1-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-exclude-filter-request"}, "4.0");
  });

  it('bad-cc1-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-exclude-import-request"}, "5.0");
  });

  it('bad-cc1-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-exclude-import-request"}, "4.0");
  });

  it('bad-cc1-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-exclude-list-request"}, "5.0");
  });

  it('bad-cc1-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-exclude-list-request"}, "4.0");
  });

  it('bad-cc1-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-import-request"}, "5.0");
  });

  it('bad-cc1-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-import-request"}, "4.0");
  });

  it('bad-cc1-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-isa-request"}, "5.0");
  });

  it('bad-cc1-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc1-isa-request"}, "4.0");
  });

  it('bad-cc2-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-all-request"}, "5.0");
  });

  it('bad-cc2-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-all-request"}, "4.0");
  });

  it('bad-cc2-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-enumerated-request"}, "5.0");
  });

  it('bad-cc2-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-enumerated-request"}, "4.0");
  });

  it('bad-cc2-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-exclude-filter-request"}, "5.0");
  });

  it('bad-cc2-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-exclude-filter-request"}, "4.0");
  });

  it('bad-cc2-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-exclude-import-request"}, "5.0");
  });

  it('bad-cc2-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-exclude-import-request"}, "4.0");
  });

  it('bad-cc2-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-exclude-list-request"}, "5.0");
  });

  it('bad-cc2-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-exclude-list-request"}, "4.0");
  });

  it('bad-cc2-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-import-request"}, "5.0");
  });

  it('bad-cc2-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-import-request"}, "4.0");
  });

  it('bad-cc2-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-isa-request"}, "5.0");
  });

  it('bad-cc2-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-cc2-isa-request"}, "4.0");
  });

  it('bad-coding-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-all-request"}, "5.0");
  });

  it('bad-coding-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-all-request"}, "4.0");
  });

  it('bad-coding-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-enumerated-request"}, "5.0");
  });

  it('bad-coding-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-enumerated-request"}, "4.0");
  });

  it('bad-coding-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-exclude-filter-request"}, "5.0");
  });

  it('bad-coding-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-exclude-filter-request"}, "4.0");
  });

  it('bad-coding-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-exclude-import-request"}, "5.0");
  });

  it('bad-coding-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-exclude-import-request"}, "4.0");
  });

  it('bad-coding-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-exclude-list-request"}, "5.0");
  });

  it('bad-coding-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-exclude-list-request"}, "4.0");
  });

  it('bad-coding-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-import-request"}, "5.0");
  });

  it('bad-coding-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-import-request"}, "4.0");
  });

  it('bad-coding-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-isa-request"}, "5.0");
  });

  it('bad-coding-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-coding-isa-request"}, "4.0");
  });

  it('bad-scd-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-all-request"}, "5.0");
  });

  it('bad-scd-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-all-request"}, "4.0");
  });

  it('bad-scd-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-enumerated-request"}, "5.0");
  });

  it('bad-scd-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-enumerated-request"}, "4.0");
  });

  it('bad-scd-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-exclude-filter-request"}, "5.0");
  });

  it('bad-scd-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-exclude-filter-request"}, "4.0");
  });

  it('bad-scd-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-exclude-import-request"}, "5.0");
  });

  it('bad-scd-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-exclude-import-request"}, "4.0");
  });

  it('bad-scd-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-exclude-list-request"}, "5.0");
  });

  it('bad-scd-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-exclude-list-request"}, "4.0");
  });

  it('bad-scd-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-import-request"}, "5.0");
  });

  it('bad-scd-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-import-request"}, "4.0");
  });

  it('bad-scd-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-isa-request"}, "5.0");
  });

  it('bad-scd-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"bad-scd-isa-request"}, "4.0");
  });

  it('good-cc1-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-all-request"}, "5.0");
  });

  it('good-cc1-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-all-request"}, "4.0");
  });

  it('good-cc1-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-enumerated-request"}, "5.0");
  });

  it('good-cc1-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-enumerated-request"}, "4.0");
  });

  it('good-cc1-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-exclude-filter-request"}, "5.0");
  });

  it('good-cc1-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-exclude-filter-request"}, "4.0");
  });

  it('good-cc1-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-exclude-import-request"}, "5.0");
  });

  it('good-cc1-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-exclude-import-request"}, "4.0");
  });

  it('good-cc1-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-exclude-list-request"}, "5.0");
  });

  it('good-cc1-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-exclude-list-request"}, "4.0");
  });

  it('good-cc1-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-import-request"}, "5.0");
  });

  it('good-cc1-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-import-request"}, "4.0");
  });

  it('good-cc1-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-isa-request"}, "5.0");
  });

  it('good-cc1-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc1-isa-request"}, "4.0");
  });

  it('good-cc2-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-all-request"}, "5.0");
  });

  it('good-cc2-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-all-request"}, "4.0");
  });

  it('good-cc2-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-enumerated-request"}, "5.0");
  });

  it('good-cc2-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-enumerated-request"}, "4.0");
  });

  it('good-cc2-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-exclude-filter-request"}, "5.0");
  });

  it('good-cc2-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-exclude-filter-request"}, "4.0");
  });

  it('good-cc2-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-exclude-import-request"}, "5.0");
  });

  it('good-cc2-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-exclude-import-request"}, "4.0");
  });

  it('good-cc2-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-exclude-list-request"}, "5.0");
  });

  it('good-cc2-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-exclude-list-request"}, "4.0");
  });

  it('good-cc2-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-import-request"}, "5.0");
  });

  it('good-cc2-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-import-request"}, "4.0");
  });

  it('good-cc2-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-isa-request"}, "5.0");
  });

  it('good-cc2-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-cc2-isa-request"}, "4.0");
  });

  it('good-coding-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-all-request"}, "5.0");
  });

  it('good-coding-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-all-request"}, "4.0");
  });

  it('good-coding-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-enumerated-request"}, "5.0");
  });

  it('good-coding-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-enumerated-request"}, "4.0");
  });

  it('good-coding-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-exclude-filter-request"}, "5.0");
  });

  it('good-coding-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-exclude-filter-request"}, "4.0");
  });

  it('good-coding-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-exclude-import-request"}, "5.0");
  });

  it('good-coding-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-exclude-import-request"}, "4.0");
  });

  it('good-coding-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-exclude-list-request"}, "5.0");
  });

  it('good-coding-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-exclude-list-request"}, "4.0");
  });

  it('good-coding-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-import-request"}, "5.0");
  });

  it('good-coding-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-import-request"}, "4.0");
  });

  it('good-coding-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-coding-isa-request"}, "5.0");
  });

  it('good-coding-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-coding-isa-request"}, "4.0");
  });

  it('good-scd-all-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-all-request"}, "5.0");
  });

  it('good-scd-all-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-all-request"}, "4.0");
  });

  it('good-scd-enumerated-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-enumerated-request"}, "5.0");
  });

  it('good-scd-enumerated-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-enumerated-request"}, "4.0");
  });

  it('good-scd-exclude-filter-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-exclude-filter-request"}, "5.0");
  });

  it('good-scd-exclude-filter-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-exclude-filter-request"}, "4.0");
  });

  it('good-scd-exclude-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-exclude-import-request"}, "5.0");
  });

  it('good-scd-exclude-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-exclude-import-request"}, "4.0");
  });

  it('good-scd-exclude-list-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-exclude-list-request"}, "5.0");
  });

  it('good-scd-exclude-list-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-exclude-list-request"}, "4.0");
  });

  it('good-scd-import-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-import-request"}, "5.0");
  });

  it('good-scd-import-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-import-request"}, "4.0");
  });

  it('good-scd-isa-requestR5', async () => {
    await runTest({"suite":"permutations","test":"good-scd-isa-request"}, "5.0");
  });

  it('good-scd-isa-requestR4', async () => {
    await runTest({"suite":"permutations","test":"good-scd-isa-request"}, "4.0");
  });

});

});

