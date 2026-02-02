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

  it('metadata', async () => {
    await runTest({"suite":"metadata","test":"metadata"});
  });

  it('term-caps', async () => {
    await runTest({"suite":"metadata","test":"term-caps"});
  });

});

describe('simple-cases', () => {
  // basic tests, setting up for the API tests to come

  it('simple-expand-all', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-all"});
  });

  it('simple-expand-active', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-active"});
  });

  it('simple-expand-inactive', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-inactive"});
  });

  it('simple-expand-enum', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-enum"});
  });

  it('simple-expand-enum-bad', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-enum-bad"});
  });

  it('simple-expand-isa', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa"});
  });

  it('simple-expand-isa-o2', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-o2"});
  });

  it('simple-expand-isa-c2', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-c2"});
  });

  it('simple-expand-isa-o2c2', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-isa-o2c2"});
  });

  it('simple-expand-prop', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-prop"});
  });

  it('simple-expand-regex', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regex"});
  });

  it('simple-expand-regex2', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regex2"});
  });

  it('simple-expand-regexp-prop', async () => {
    await runTest({"suite":"simple-cases","test":"simple-expand-regexp-prop"});
  });

  it('simple-lookup-1', async () => {
    await runTest({"suite":"simple-cases","test":"simple-lookup-1"});
  });

  it('simple-lookup-2', async () => {
    await runTest({"suite":"simple-cases","test":"simple-lookup-2"});
  });

});

describe('parameters', () => {
  // Testing out the various expansion parameters that the IG publisher makes use of

  it('parameters-expand-all-hierarchy', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-hierarchy"});
  });

  it('parameters-expand-enum-hierarchy', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-hierarchy"});
  });

  it('parameters-expand-isa-hierarchy', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-hierarchy"});
  });

  it('parameters-expand-all-active', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-active"});
  });

  it('parameters-expand-active-active', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-active-active"});
  });

  it('parameters-expand-inactive-active', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-inactive-active"});
  });

  it('parameters-expand-enum-active', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-active"});
  });

  it('parameters-expand-isa-active', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-active"});
  });

  it('parameters-expand-all-inactive', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-inactive"});
  });

  it('parameters-expand-active-inactive', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-active-inactive"});
  });

  it('parameters-expand-inactive-inactive', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-inactive-inactive"});
  });

  it('parameters-expand-enum-inactive', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-inactive"});
  });

  it('parameters-expand-isa-inactive', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-inactive"});
  });

  it('parameters-expand-all-designations', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-designations"});
  });

  it('parameters-expand-enum-designations', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-designations"});
  });

  it('parameters-expand-isa-designations', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-designations"});
  });

  it('parameters-expand-all-definitions', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-definitions"});
  });

  it('parameters-expand-enum-definitions', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions"});
  });

  it('parameters-expand-isa-definitions', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-definitions"});
  });

  it('parameters-expand-all-definitions2', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-definitions2"});
  });

  it('parameters-expand-enum-definitions2', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions2"});
  });

  it('parameters-expand-enum-definitions3', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-definitions3"});
  });

  it('parameters-expand-isa-definitions2', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-definitions2"});
  });

  it('parameters-expand-all-property', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-all-property"});
  });

  it('parameters-expand-enum-property', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-enum-property"});
  });

  it('parameters-expand-isa-property', async () => {
    await runTest({"suite":"parameters","test":"parameters-expand-isa-property"});
  });

});

describe('language', () => {
  // Testing returning language by request, getting the right designation

  it('language-echo-en-none', async () => {
    await runTest({"suite":"language","test":"language-echo-en-none"});
  });

  it('language-echo-de-none', async () => {
    await runTest({"suite":"language","test":"language-echo-de-none"});
  });

  it('language-echo-en-multi-none', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-none"});
  });

  it('language-echo-de-multi-none', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-none"});
  });

  it('language-echo-en-en-param', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-param"});
  });

  it('language-echo-en-en-vs', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-vs"});
  });

  it('language-echo-en-en-header', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-header"});
  });

  it('language-echo-en-en-vslang', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-vslang"});
  });

  it('language-echo-en-en-mixed', async () => {
    await runTest({"suite":"language","test":"language-echo-en-en-mixed"});
  });

  it('language-echo-de-de-param', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-param"});
  });

  it('language-echo-de-de-vs', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-vs"});
  });

  it('language-echo-de-de-header', async () => {
    await runTest({"suite":"language","test":"language-echo-de-de-header"});
  });

  it('language-echo-en-multi-en-param', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-param"});
  });

  it('language-echo-en-multi-en-vs', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-vs"});
  });

  it('language-echo-en-multi-en-header', async () => {
    await runTest({"suite":"language","test":"language-echo-en-multi-en-header"});
  });

  it('language-echo-de-multi-de-param', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-param"});
  });

  it('language-echo-de-multi-de-vs', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-vs"});
  });

  it('language-echo-de-multi-de-header', async () => {
    await runTest({"suite":"language","test":"language-echo-de-multi-de-header"});
  });

  it('language-xform-en-multi-de-soft', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-soft"});
  });

  it('language-xform-en-multi-de-hard', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-hard"});
  });

  it('language-xform-en-multi-de-default', async () => {
    await runTest({"suite":"language","test":"language-xform-en-multi-de-default"});
  });

  it('language-xform-de-multi-en-soft', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-soft"});
  });

  it('language-xform-de-multi-en-hard', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-hard"});
  });

  it('language-xform-de-multi-en-default', async () => {
    await runTest({"suite":"language","test":"language-xform-de-multi-en-default"});
  });

  it('language-echo-en-designation', async () => {
    await runTest({"suite":"language","test":"language-echo-en-designation"});
  });

  it('language-echo-en-designations', async () => {
    await runTest({"suite":"language","test":"language-echo-en-designations"});
  });

});

describe('language2', () => {
  // A series of tests that test display name validation for various permutations of languages

  it('validation-right-de-en', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-en"});
  });

  it('validation-right-de-ende-N', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-ende-N"});
  });

  it('validation-right-de-ende', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-ende"});
  });

  it('validation-right-de-none', async () => {
    await runTest({"suite":"language2","test":"validation-right-de-none"});
  });

  it('validation-right-en-en', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-en"});
  });

  it('validation-right-en-ende-N', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-ende-N"});
  });

  it('validation-right-en-ende', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-ende"});
  });

  it('validation-right-en-none', async () => {
    await runTest({"suite":"language2","test":"validation-right-en-none"});
  });

  it('validation-right-none-en', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-en"});
  });

  it('validation-right-none-ende-N', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-ende-N"});
  });

  it('validation-right-none-ende', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-ende"});
  });

  it('validation-right-none-none', async () => {
    await runTest({"suite":"language2","test":"validation-right-none-none"});
  });

  it('validation-wrong-de-en', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-en"});
  });

  it('validation-wrong-de-en-bad', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-en-bad"});
  });

  it('validation-wrong-de-ende-N', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-ende-N"});
  });

  it('validation-wrong-de-ende', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-ende"});
  });

  it('validation-wrong-de-none', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-de-none"});
  });

  it('validation-wrong-en-en', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-en"});
  });

  it('validation-wrong-en-ende-N', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-ende-N"});
  });

  it('validation-wrong-en-ende', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-ende"});
  });

  it('validation-wrong-en-none', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-en-none"});
  });

  it('validation-wrong-none-en', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-en"});
  });

  it('validation-wrong-none-ende-N', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-ende-N"});
  });

  it('validation-wrong-none-ende', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-ende"});
  });

  it('validation-wrong-none-none', async () => {
    await runTest({"suite":"language2","test":"validation-wrong-none-none"});
  });

});

describe('extensions', () => {
  // Testing proper handling of extensions, which depends on the extension

  it('extensions-echo-all', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-all"});
  });

  it('extensions-echo-enumerated', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-enumerated"});
  });

  it('extensions-echo-bad-supplement', async () => {
    await runTest({"suite":"extensions","test":"extensions-echo-bad-supplement"});
  });

  it('validate-code-bad-supplement', async () => {
    await runTest({"suite":"extensions","test":"validate-code-bad-supplement"});
  });

  it('validate-coding-bad-supplement', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-bad-supplement"});
  });

  it('validate-coding-bad-supplement-url', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-bad-supplement-url"});
  });

  it('validate-codeableconcept-bad-supplement', async () => {
    await runTest({"suite":"extensions","test":"validate-codeableconcept-bad-supplement"});
  });

  it('validate-coding-good-supplement', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-good-supplement"});
  });

  it('validate-coding-good2-supplement', async () => {
    await runTest({"suite":"extensions","test":"validate-coding-good2-supplement"});
  });

  it('validate-code-inactive-display', async () => {
    await runTest({"suite":"extensions","test":"validate-code-inactive-display"});
  });

  it('validate-code-inactive', async () => {
    await runTest({"suite":"extensions","test":"validate-code-inactive"});
  });

});

describe('validation', () => {
  // Testing various validation parameter combinations

  it('validation-simple-code-good', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good"});
  });

  it('validation-simple-code-implied-good', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-implied-good"});
  });

  it('validation-simple-coding-good', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good"});
  });

  it('validation-simple-codeableconcept-good', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good"});
  });

  it('validation-simple-code-bad-code', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-code"});
  });

  it('validation-simple-code-implied-bad-code', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-implied-bad-code"});
  });

  it('validation-simple-coding-bad-code', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-code"});
  });

  it('validation-simple-coding-bad-code-inactive', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-code-inactive"});
  });

  it('validation-simple-codeableconcept-bad-code', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-code"});
  });

  it('validation-simple-code-bad-valueSet', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-valueSet"});
  });

  it('validation-simple-coding-bad-valueSet', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-valueSet"});
  });

  it('validation-simple-codeableconcept-bad-valueSet', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-valueSet"});
  });

  it('validation-simple-code-bad-import', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-import"});
  });

  it('validation-simple-coding-bad-import', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-import"});
  });

  it('validation-simple-codeableconcept-bad-import', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-import"});
  });

  it('validation-simple-code-bad-system', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-system"});
  });

  it('validation-simple-coding-bad-system', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system"});
  });

  it('validation-simple-coding-bad-system2', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system2"});
  });

  it('validation-simple-coding-bad-system-local', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-system-local"});
  });

  it('validation-simple-coding-no-system', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-no-system"});
  });

  it('validation-simple-codeableconcept-bad-system', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-system"});
  });

  it('validation-simple-code-good-display', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-display"});
  });

  it('validation-simple-coding-good-display', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good-display"});
  });

  it('validation-simple-codeableconcept-good-display', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good-display"});
  });

  it('validation-simple-code-bad-display', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display"});
  });

  it('validation-simple-code-bad-display-ws', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display-ws"});
  });

  it('validation-simple-coding-bad-display', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-display"});
  });

  it('validation-simple-codeableconcept-bad-display', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-display"});
  });

  it('validation-simple-code-bad-display-warning', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-display-warning"});
  });

  it('validation-simple-coding-bad-display-warning', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-display-warning"});
  });

  it('validation-simple-codeableconcept-bad-display-warning', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-display-warning"});
  });

  it('validation-simple-code-good-language', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-language"});
  });

  it('validation-simple-coding-good-language', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-good-language"});
  });

  it('validation-simple-codeableconcept-good-language', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-good-language"});
  });

  it('validation-simple-code-bad-language', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-language"});
  });

  it('validation-simple-code-good-regex', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-good-regex"});
  });

  it('validation-simple-code-bad-regex', async () => {
    await runTest({"suite":"validation","test":"validation-simple-code-bad-regex"});
  });

  it('validation-simple-coding-bad-language', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language"});
  });

  it('validation-simple-coding-bad-language-header', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-header"});
  });

  it('validation-simple-coding-bad-language-vs', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-vs"});
  });

  it('validation-simple-coding-bad-language-vslang', async () => {
    await runTest({"suite":"validation","test":"validation-simple-coding-bad-language-vslang"});
  });

  it('validation-simple-codeableconcept-bad-language', async () => {
    await runTest({"suite":"validation","test":"validation-simple-codeableconcept-bad-language"});
  });

  it('validation-complex-codeableconcept-full', async () => {
    await runTest({"suite":"validation","test":"validation-complex-codeableconcept-full"});
  });

  it('validation-complex-codeableconcept-vsonly', async () => {
    await runTest({"suite":"validation","test":"validation-complex-codeableconcept-vsonly"});
  });

  it('validation-cs-code-good', async () => {
    await runTest({"suite":"validation","test":"validation-cs-code-good"});
  });

  it('validation-cs-code-bad-code', async () => {
    await runTest({"suite":"validation","test":"validation-cs-code-bad-code"});
  });

});

describe('version', () => {
  // Testing various version issues. There's two versions of a code system, and three value sets that select different versions

  it('version-simple-code-bad-version1', async () => {
    await runTest({"suite":"version","test":"version-simple-code-bad-version1"});
  });

  it('version-simple-coding-bad-version1', async () => {
    await runTest({"suite":"version","test":"version-simple-coding-bad-version1"});
  });

  it('version-simple-codeableconcept-bad-version1', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-bad-version1"});
  });

  it('version-simple-codeableconcept-bad-version2', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-bad-version2"});
  });

  it('version-simple-code-good-version', async () => {
    await runTest({"suite":"version","test":"version-simple-code-good-version"});
  });

  it('version-simple-coding-good-version', async () => {
    await runTest({"suite":"version","test":"version-simple-coding-good-version"});
  });

  it('version-simple-codeableconcept-good-version', async () => {
    await runTest({"suite":"version","test":"version-simple-codeableconcept-good-version"});
  });

  it('version-version-profile-none', async () => {
    await runTest({"suite":"version","test":"version-version-profile-none"});
  });

  it('version-version-profile-default', async () => {
    await runTest({"suite":"version","test":"version-version-profile-default"});
  });

  it('validation-version-profile-coding', async () => {
    await runTest({"suite":"version","test":"validation-version-profile-coding"});
  });

  it('coding-vnn-vsnn', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn"});
  });

  it('coding-v10-vs1w', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w"});
  });

  it('coding-v10-vs1wb', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb"});
  });

  it('coding-v10-vs10', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10"});
  });

  it('coding-v10-vs20', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20"});
  });

  it('coding-v10-vsbb', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb"});
  });

  it('coding-v10-vsbb', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb"});
  });

  it('coding-v10-vsnn', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn"});
  });

  it('coding-vbb-vs10', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10"});
  });

  it('coding-vbb-vsnn', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn"});
  });

  it('coding-vnn-vs1w', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w"});
  });

  it('coding-vnn-vs1wb', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb"});
  });

  it('coding-vnn-vs10', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10"});
  });

  it('coding-vnn-vsbb', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb"});
  });

  it('coding-vnn-vsnn-default', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-default"});
  });

  it('coding-v10-vs1w-default', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-default"});
  });

  it('coding-v10-vs1wb-default', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-default"});
  });

  it('coding-v10-vs10-default', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-default"});
  });

  it('coding-v10-vs20-default', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-default"});
  });

  it('coding-v10-vsbb-default', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-default"});
  });

  it('coding-v10-vsnn-default', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-default"});
  });

  it('coding-vbb-vs10-default', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-default"});
  });

  it('coding-vbb-vsnn-default', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-default"});
  });

  it('coding-vnn-vs1w-default', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-default"});
  });

  it('coding-vnn-vs1wb-default', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-default"});
  });

  it('coding-vnn-vs10-default', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-default"});
  });

  it('coding-vnn-vsbb-default', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-default"});
  });

  it('coding-vnn-vsnn-check', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-check"});
  });

  it('coding-v10-vs1w-check', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-check"});
  });

  it('coding-v10-vs1wb-check', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-check"});
  });

  it('coding-v10-vs10-check', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-check"});
  });

  it('coding-v10-vs20-check', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-check"});
  });

  it('coding-v10-vsbb-check', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-check"});
  });

  it('coding-v10-vsnn-check', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-check"});
  });

  it('coding-vbb-vs10-check', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-check"});
  });

  it('coding-vbb-vsnn-check', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-check"});
  });

  it('coding-vnn-vs1w-check', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-check"});
  });

  it('coding-vnn-vs1wb-check', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-check"});
  });

  it('coding-vnn-vs10-check', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-check"});
  });

  it('coding-vnn-vsbb-check', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-check"});
  });

  it('coding-vnn-vsnn-force', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsnn-force"});
  });

  it('coding-v10-vs1w-force', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1w-force"});
  });

  it('coding-v10-vs1wb-force', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs1wb-force"});
  });

  it('coding-v10-vs10-force', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs10-force"});
  });

  it('coding-v10-vs20-force', async () => {
    await runTest({"suite":"version","test":"coding-v10-vs20-force"});
  });

  it('coding-v10-vsbb-force', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsbb-force"});
  });

  it('coding-v10-vsnn-force', async () => {
    await runTest({"suite":"version","test":"coding-v10-vsnn-force"});
  });

  it('coding-vbb-vs10-force', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vs10-force"});
  });

  it('coding-vbb-vsnn-force', async () => {
    await runTest({"suite":"version","test":"coding-vbb-vsnn-force"});
  });

  it('coding-vnn-vs1w-force', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1w-force"});
  });

  it('coding-vnn-vs1wb-force', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs1wb-force"});
  });

  it('coding-vnn-vs10-force', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vs10-force"});
  });

  it('coding-vnn-vsbb-force', async () => {
    await runTest({"suite":"version","test":"coding-vnn-vsbb-force"});
  });

  it('codeableconcept-vnn-vsnn', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn"});
  });

  it('codeableconcept-v10-vs1w', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w"});
  });

  it('codeableconcept-v10-vs1wb', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb"});
  });

  it('codeableconcept-v10-vs10', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10"});
  });

  it('codeableconcept-v10-vs20', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20"});
  });

  it('codeableconcept-v10-vsbb', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb"});
  });

  it('codeableconcept-v10-vsbb', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb"});
  });

  it('codeableconcept-v10-vsnn', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn"});
  });

  it('codeableconcept-vbb-vs10', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10"});
  });

  it('codeableconcept-vbb-vsnn', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn"});
  });

  it('codeableconcept-vnn-vs1w', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w"});
  });

  it('codeableconcept-vnn-vs1wb', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb"});
  });

  it('codeableconcept-vnn-vs10', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10"});
  });

  it('codeableconcept-vnn-vsbb', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb"});
  });

  it('codeableconcept-vnn-vsnn-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-default"});
  });

  it('codeableconcept-v10-vs1w-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-default"});
  });

  it('codeableconcept-v10-vs1wb-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-default"});
  });

  it('codeableconcept-v10-vs10-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-default"});
  });

  it('codeableconcept-v10-vs20-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-default"});
  });

  it('codeableconcept-v10-vsbb-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-default"});
  });

  it('codeableconcept-v10-vsnn-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-default"});
  });

  it('codeableconcept-vbb-vs10-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-default"});
  });

  it('codeableconcept-vbb-vsnn-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-default"});
  });

  it('codeableconcept-vnn-vs1w-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-default"});
  });

  it('codeableconcept-vnn-vs1wb-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-default"});
  });

  it('codeableconcept-vnn-vs10-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-default"});
  });

  it('codeableconcept-vnn-vsbb-default', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-default"});
  });

  it('codeableconcept-vnn-vsnn-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-check"});
  });

  it('codeableconcept-v10-vs1w-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-check"});
  });

  it('codeableconcept-v10-vs1wb-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-check"});
  });

  it('codeableconcept-v10-vs10-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-check"});
  });

  it('codeableconcept-v10-vs20-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-check"});
  });

  it('codeableconcept-v10-vsbb-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-check"});
  });

  it('codeableconcept-v10-vsnn-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-check"});
  });

  it('codeableconcept-vbb-vs10-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-check"});
  });

  it('codeableconcept-vbb-vsnn-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-check"});
  });

  it('codeableconcept-vnn-vs1w-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-check"});
  });

  it('codeableconcept-vnn-vs1wb-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-check"});
  });

  it('codeableconcept-vnn-vs10-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-check"});
  });

  it('codeableconcept-vnn-vsbb-check', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-check"});
  });

  it('codeableconcept-vnn-vsnn-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsnn-force"});
  });

  it('codeableconcept-v10-vs1w-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1w-force"});
  });

  it('codeableconcept-v10-vs1wb-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs1wb-force"});
  });

  it('codeableconcept-v10-vs10-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs10-force"});
  });

  it('codeableconcept-v10-vs20-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vs20-force"});
  });

  it('codeableconcept-v10-vsbb-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsbb-force"});
  });

  it('codeableconcept-v10-vsnn-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-v10-vsnn-force"});
  });

  it('codeableconcept-vbb-vs10-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vs10-force"});
  });

  it('codeableconcept-vbb-vsnn-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vbb-vsnn-force"});
  });

  it('codeableconcept-vnn-vs1w-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1w-force"});
  });

  it('codeableconcept-vnn-vs1wb-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs1wb-force"});
  });

  it('codeableconcept-vnn-vs10-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vs10-force"});
  });

  it('codeableconcept-vnn-vsbb-force', async () => {
    await runTest({"suite":"version","test":"codeableconcept-vnn-vsbb-force"});
  });

  it('code-vnn-vsnn', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn"});
  });

  it('code-v10-vs1w', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w"});
  });

  it('code-v10-vs1wb', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb"});
  });

  it('code-v10-vs10', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10"});
  });

  it('code-v10-vs20', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20"});
  });

  it('code-v10-vsbb', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb"});
  });

  it('code-v10-vsnn', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn"});
  });

  it('code-vbb-vs10', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10"});
  });

  it('code-vbb-vsnn', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn"});
  });

  it('code-vnn-vs1w', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w"});
  });

  it('code-vnn-vs1wb', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb"});
  });

  it('code-vnn-vs10', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10"});
  });

  it('code-vnn-vsbb', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb"});
  });

  it('code-vnn-vsnn-default', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-default"});
  });

  it('code-v10-vs1w-default', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-default"});
  });

  it('code-v10-vs1wb-default', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-default"});
  });

  it('code-v10-vs10-default', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-default"});
  });

  it('code-v10-vs20-default', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-default"});
  });

  it('code-v10-vsbb-default', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-default"});
  });

  it('code-v10-vsnn-default', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-default"});
  });

  it('code-vbb-vs10-default', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-default"});
  });

  it('code-vbb-vsnn-default', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-default"});
  });

  it('code-vnn-vs1wb-default', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-default"});
  });

  it('code-vnn-vs10-default', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-default"});
  });

  it('code-vnn-vsbb-default', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-default"});
  });

  it('code-vnn-vsnn-check', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-check"});
  });

  it('code-v10-vs1w-check', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-check"});
  });

  it('code-v10-vs1wb-check', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-check"});
  });

  it('code-v10-vs10-check', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-check"});
  });

  it('code-v10-vs20-check', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-check"});
  });

  it('code-v10-vsbb-check', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-check"});
  });

  it('code-v10-vsnn-check', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-check"});
  });

  it('code-vbb-vs10-check', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-check"});
  });

  it('code-vbb-vsnn-check', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-check"});
  });

  it('code-vnn-vs1w-check', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w-check"});
  });

  it('code-vnn-vs1wb-check', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-check"});
  });

  it('code-vnn-vs10-check', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-check"});
  });

  it('code-vnn-vsbb-check', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-check"});
  });

  it('code-vnn-vsnn-force', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsnn-force"});
  });

  it('code-v10-vs1w-force', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1w-force"});
  });

  it('code-v10-vs1wb-force', async () => {
    await runTest({"suite":"version","test":"code-v10-vs1wb-force"});
  });

  it('code-v10-vs10-force', async () => {
    await runTest({"suite":"version","test":"code-v10-vs10-force"});
  });

  it('code-v10-vs20-force', async () => {
    await runTest({"suite":"version","test":"code-v10-vs20-force"});
  });

  it('code-v10-vsbb-force', async () => {
    await runTest({"suite":"version","test":"code-v10-vsbb-force"});
  });

  it('code-v10-vsnn-force', async () => {
    await runTest({"suite":"version","test":"code-v10-vsnn-force"});
  });

  it('code-vbb-vs10-force', async () => {
    await runTest({"suite":"version","test":"code-vbb-vs10-force"});
  });

  it('code-vbb-vsnn-force', async () => {
    await runTest({"suite":"version","test":"code-vbb-vsnn-force"});
  });

  it('code-vnn-vs1w-force', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1w-force"});
  });

  it('code-vnn-vs1wb-force', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs1wb-force"});
  });

  it('code-vnn-vs10-force', async () => {
    await runTest({"suite":"version","test":"code-vnn-vs10-force"});
  });

  it('code-vnn-vsbb-force', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsbb-force"});
  });

  it('code-vnn-vsmix-1', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsmix-1"});
  });

  it('code-vnn-vsmix-2', async () => {
    await runTest({"suite":"version","test":"code-vnn-vsmix-2"});
  });

  it('vs-expand-all-v', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v"});
  });

  it('vs-expand-all-v1', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1"});
  });

  it('vs-expand-all-v2', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2"});
  });

  it('vs-expand-v-mixed', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed"});
  });

  it('vs-expand-v-n-request', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-request"});
  });

  it('vs-expand-v-w', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w"});
  });

  it('vs-expand-v-wb', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb"});
  });

  it('vs-expand-v1', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1"});
  });

  it('vs-expand-v2', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2"});
  });

  it('vs-expand-all-v-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-force"});
  });

  it('vs-expand-all-v1-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-force"});
  });

  it('vs-expand-all-v2-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-force"});
  });

  it('vs-expand-v-mixed-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-force"});
  });

  it('vs-expand-v-n-force-request', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-force-request"});
  });

  it('vs-expand-v-w-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-force"});
  });

  it('vs-expand-v-wb-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-force"});
  });

  it('vs-expand-v1-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-force"});
  });

  it('vs-expand-v2-force', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-force"});
  });

  it('vs-expand-all-v-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-default"});
  });

  it('vs-expand-all-v1-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-default"});
  });

  it('vs-expand-all-v2-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-default"});
  });

  it('vs-expand-v-mixed-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-default"});
  });

  it('vs-expand-v-n-default-request', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-default-request"});
  });

  it('vs-expand-v-w-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-default"});
  });

  it('vs-expand-v-wb-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-default"});
  });

  it('vs-expand-v1-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-default"});
  });

  it('vs-expand-v2-default', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-default"});
  });

  it('vs-expand-all-v-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v-check"});
  });

  it('vs-expand-all-v1-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v1-check"});
  });

  it('vs-expand-all-v2-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-all-v2-check"});
  });

  it('vs-expand-v-mixed-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-mixed-check"});
  });

  it('vs-expand-v-n-check-request', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-n-check-request"});
  });

  it('vs-expand-v-w-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-w-check"});
  });

  it('vs-expand-v-wb-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-v-wb-check"});
  });

  it('vs-expand-v1-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-v1-check"});
  });

  it('vs-expand-v2-check', async () => {
    await runTest({"suite":"version","test":"vs-expand-v2-check"});
  });

});

describe('fragment', () => {
  // Testing handling a code system fragment

  it('validation-fragment-code-good', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-code-good"});
  });

  it('validation-fragment-coding-good', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-coding-good"});
  });

  it('validation-fragment-codeableconcept-good', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-codeableconcept-good"});
  });

  it('validation-fragment-code-bad-code', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-code-bad-code"});
  });

  it('validation-fragment-coding-bad-code', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-coding-bad-code"});
  });

  it('validation-fragment-codeableconcept-bad-code', async () => {
    await runTest({"suite":"fragment","test":"validation-fragment-codeableconcept-bad-code"});
  });

});

describe('big', () => {
  // Testing handling a big code system

  it('big-echo-no-limit', async () => {
    await runTest({"suite":"big","test":"big-echo-no-limit"});
  });

  it('big-echo-zero-fifty-limit', async () => {
    await runTest({"suite":"big","test":"big-echo-zero-fifty-limit"});
  });

  it('big-echo-fifty-fifty-limit', async () => {
    await runTest({"suite":"big","test":"big-echo-fifty-fifty-limit"});
  });

  it('big-circle-bang', async () => {
    await runTest({"suite":"big","test":"big-circle-bang"});
  });

  it('big-circle-validate', async () => {
    await runTest({"suite":"big","test":"big-circle-validate"});
  });

});

describe('other', () => {
  // Misc tests based on issues submitted by users

  it('dual-filter', async () => {
    await runTest({"suite":"other","test":"dual-filter"});
  });

  it('validation-dual-filter-in', async () => {
    await runTest({"suite":"other","test":"validation-dual-filter-in"});
  });

  it('validation-dual-filter-out', async () => {
    await runTest({"suite":"other","test":"validation-dual-filter-out"});
  });

});

describe('errors', () => {
  // Testing Various Error Conditions

  it('unknown-system1', async () => {
    await runTest({"suite":"errors","test":"unknown-system1"});
  });

  it('unknown-system2', async () => {
    await runTest({"suite":"errors","test":"unknown-system2"});
  });

  it('broken-filter-validate', async () => {
    await runTest({"suite":"errors","test":"broken-filter-validate"});
  });

  it('broken-filter2-validate', async () => {
    await runTest({"suite":"errors","test":"broken-filter2-validate"});
  });

  it('broken-filter-expand', async () => {
    await runTest({"suite":"errors","test":"broken-filter-expand"});
  });

  it('combination-ok', async () => {
    await runTest({"suite":"errors","test":"combination-ok"});
  });

  it('combination-bad', async () => {
    await runTest({"suite":"errors","test":"combination-bad"});
  });

});

describe('deprecated', () => {
  // Testing Deprecated+Withdrawn warnings

  it('withdrawn', async () => {
    await runTest({"suite":"deprecated","test":"withdrawn"});
  });

  it('not-withdrawn', async () => {
    await runTest({"suite":"deprecated","test":"not-withdrawn"});
  });

  it('withdrawn-validate', async () => {
    await runTest({"suite":"deprecated","test":"withdrawn-validate"});
  });

  it('not-withdrawn-validate', async () => {
    await runTest({"suite":"deprecated","test":"not-withdrawn-validate"});
  });

  it('experimental', async () => {
    await runTest({"suite":"deprecated","test":"experimental"});
  });

  it('experimental-validate', async () => {
    await runTest({"suite":"deprecated","test":"experimental-validate"});
  });

  it('draft', async () => {
    await runTest({"suite":"deprecated","test":"draft"});
  });

  it('draft-validate', async () => {
    await runTest({"suite":"deprecated","test":"draft-validate"});
  });

  it('vs-deprecation', async () => {
    await runTest({"suite":"deprecated","test":"vs-deprecation"});
  });

  it('deprecating-validate', async () => {
    await runTest({"suite":"deprecated","test":"deprecating-validate"});
  });

  it('deprecating-validate-2', async () => {
    await runTest({"suite":"deprecated","test":"deprecating-validate-2"});
  });

});

describe('notSelectable', () => {
  // Testing notSelectable

  it('notSelectable-prop-all', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-all"});
  });

  it('notSelectable-noprop-all', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-all"});
  });

  it('notSelectable-reprop-all', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-all"});
  });

  it('notSelectable-unprop-all', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-all"});
  });

  it('notSelectable-prop-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true"});
  });

  it('notSelectable-prop-trueUC', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-trueUC"});
  });

  it('notSelectable-noprop-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true"});
  });

  it('notSelectable-reprop-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true"});
  });

  it('notSelectable-unprop-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true"});
  });

  it('notSelectable-prop-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false"});
  });

  it('notSelectable-noprop-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false"});
  });

  it('notSelectable-reprop-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false"});
  });

  it('notSelectable-unprop-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false"});
  });

  it('notSelectable-prop-in', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in"});
  });

  it('notSelectable-prop-out', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out"});
  });

  it('notSelectable-prop-true-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-true"});
  });

  it('notSelectable-prop-trueUC-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-trueUC-true"});
  });

  it('notSelectable-prop-in-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-true"});
  });

  it('notSelectable-prop-out-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-true"});
  });

  it('notSelectable-noprop-true-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-true"});
  });

  it('notSelectable-reprop-true-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-true"});
  });

  it('notSelectable-unprop-true-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-true"});
  });

  it('notSelectable-prop-true-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-false"});
  });

  it('notSelectable-prop-in-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-false"});
  });

  it('notSelectable-prop-in-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-in-unknown"});
  });

  it('notSelectable-prop-out-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-unknown"});
  });

  it('notSelectable-prop-out-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-out-false"});
  });

  it('notSelectable-noprop-true-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-false"});
  });

  it('notSelectable-reprop-true-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-false"});
  });

  it('notSelectable-unprop-true-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-false"});
  });

  it('notSelectable-prop-false-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-true"});
  });

  it('notSelectable-noprop-false-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-true"});
  });

  it('notSelectable-reprop-false-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-true"});
  });

  it('notSelectable-unprop-false-true', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-true"});
  });

  it('notSelectable-prop-false-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-false"});
  });

  it('notSelectable-noprop-false-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-false"});
  });

  it('notSelectable-reprop-false-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-false"});
  });

  it('notSelectable-unprop-false-false', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-false"});
  });

  it('notSelectable-noprop-true-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-true-unknown"});
  });

  it('notSelectable-reprop-true-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-true-unknown"});
  });

  it('notSelectable-unprop-true-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-true-unknown"});
  });

  it('notSelectable-prop-true-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-true-unknown"});
  });

  it('notSelectable-prop-false-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-prop-false-unknown"});
  });

  it('notSelectable-noprop-false-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-noprop-false-unknown"});
  });

  it('notSelectable-reprop-false-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-reprop-false-unknown"});
  });

  it('notSelectable-unprop-false-unknown', async () => {
    await runTest({"suite":"notSelectable","test":"notSelectable-unprop-false-unknown"});
  });

});

describe('inactive', () => {
  // Testing Inactive codes

  it('inactive-expand', async () => {
    await runTest({"suite":"inactive","test":"inactive-expand"});
  });

  it('inactive-inactive-expand', async () => {
    await runTest({"suite":"inactive","test":"inactive-inactive-expand"});
  });

  it('inactive-active-expand', async () => {
    await runTest({"suite":"inactive","test":"inactive-active-expand"});
  });

  it('inactive-1-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-1-validate"});
  });

  it('inactive-2-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-2-validate"});
  });

  it('inactive-3-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-3-validate"});
  });

  it('inactive-1a-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-1a-validate"});
  });

  it('inactive-2a-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-2a-validate"});
  });

  it('inactive-3a-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-3a-validate"});
  });

  it('inactive-1b-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-1b-validate"});
  });

  it('inactive-2b-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-2b-validate"});
  });

  it('inactive-3b-validate', async () => {
    await runTest({"suite":"inactive","test":"inactive-3b-validate"});
  });

});

describe('case', () => {
  // Test Case Sensitivity handling

  it('case-insensitive-code1-1', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-1"});
  });

  it('case-insensitive-code1-2', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-2"});
  });

  it('case-insensitive-code1-3', async () => {
    await runTest({"suite":"case","test":"case-insensitive-code1-3"});
  });

  it('case-sensitive-code1-1', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-1"});
  });

  it('case-sensitive-code1-2', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-2"});
  });

  it('case-sensitive-code1-3', async () => {
    await runTest({"suite":"case","test":"case-sensitive-code1-3"});
  });

});

describe('translate', () => {
  // Tests for ConceptMap.$translate

  it('translate-1', async () => {
    await runTest({"suite":"translate","test":"translate-1"});
  });

});

describe('tho', () => {
  // Misc assorted test cases from tho

  it('act-class', async () => {
    await runTest({"suite":"tho","test":"act-class"});
  });

  it('act-class-activeonly', async () => {
    await runTest({"suite":"tho","test":"act-class-activeonly"});
  });

});

describe('exclude', () => {
  // Tests for proper functioning of exclude

  it('exclude-1', async () => {
    await runTest({"suite":"exclude","test":"exclude-1"});
  });

});

describe('default-valueset-version', () => {
  // Test the default-valueset-version parameter

  it('direct-expand-one', async () => {
    await runTest({"suite":"default-valueset-version","test":"direct-expand-one"});
  });

  it('direct-expand-two', async () => {
    await runTest({"suite":"default-valueset-version","test":"direct-expand-two"});
  });

  it('indirect-expand-one', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-one"});
  });

  it('indirect-expand-two', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-two"});
  });

  it('indirect-expand-zero', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero"});
  });

  it('indirect-expand-zero-pinned', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero-pinned"});
  });

  it('indirect-expand-zero-pinned-wrong', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-expand-zero-pinned-wrong"});
  });

  it('indirect-validation-one', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-one"});
  });

  it('indirect-validation-two', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-two"});
  });

  it('indirect-validation-zero', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero"});
  });

  it('indirect-validation-zero-pinned', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero-pinned"});
  });

  it('indirect-validation-zero-pinned-wrong', async () => {
    await runTest({"suite":"default-valueset-version","test":"indirect-validation-zero-pinned-wrong"});
  });

});

describe('tx.fhir.org', () => {
  // These are tx.fhir.org specific tests. There's no expectation that other servers will pass these tests, and they are not executed by default. (other servers can, but they depend on other set up not controlled by the tests

  it('snomed-validation-1', async () => {
    await runTest({"suite":"tx.fhir.org","test":"snomed-validation-1"});
  });

  it('loinc-lookup-code', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-code"});
  });

  it('loinc-lookup-part', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-part"});
  });

  it('loinc-lookup-list', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-list"});
  });

  it('loinc-lookup-answer', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-lookup-answer"});
  });

  it('loinc-validate-code', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code"});
  });

  it('loinc-validate-discouraged-code', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-discouraged-code"});
  });

  it('loinc-validate-code-supp1', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code-supp1"});
  });

  it('loinc-validate-code-supp2', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-code-supp2"});
  });

  it('loinc-validate-part', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-part"});
  });

  it('loinc-validate-list', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list"});
  });

  it('loinc-validate-answer', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-answer"});
  });

  it('loinc-validate-invalid', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-invalid"});
  });

  it('loinc-expand-enum', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-enum"});
  });

  it('loinc-expand-all', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-all"});
  });

  it('loinc-expand-all-limited', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-all-limited"});
  });

  it('loinc-expand-enum-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-enum-bad"});
  });

  it('loinc-expand-status', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-status"});
  });

  it('loinc-expand-class-regex', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-class-regex"});
  });

  it('loinc-expand-prop-component', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-component"});
  });

  it('loinc-expand-prop-method', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-method"});
  });

  it('loinc-expand-prop-component-str', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-component-str"});
  });

  it('loinc-expand-prop-order-obs', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-prop-order-obs"});
  });

  it('loinc-expand-concept-is-a', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-concept-is-a"});
  });

  it('loinc-expand-copyright', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-copyright"});
  });

  it('loinc-expand-scale-type', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-scale-type"});
  });

  it('loinc-validate-enum-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-enum-good"});
  });

  it('loinc-validate-enum-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-enum-bad"});
  });

  it('loinc-validate-filter-prop-component-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-prop-component-good"});
  });

  it('loinc-validate-filter-prop-component-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-prop-component-bad"});
  });

  it('loinc-validate-filter-status-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-status-good"});
  });

  it('loinc-validate-filter-status-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-status-bad"});
  });

  it('loinc-validate-filter-class-regex-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-class-regex-good"});
  });

  it('loinc-validate-filter-class-regex-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-class-regex-bad"});
  });

  it('loinc-validate-filter-scale-type-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-scale-type-good"});
  });

  it('loinc-validate-filter-scale-type-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-scale-type-bad"});
  });

  it('loinc-expand-list-request-parameters', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-list-request-parameters"});
  });

  it('loinc-validate-list-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list-good"});
  });

  it('loinc-validate-list-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-list-bad"});
  });

  it('loinc-expand-filter-list-request-parameters', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-list-request-parameters"});
  });

  it('loinc-validate-filter-list-type-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-list-type-good"});
  });

  it('loinc-validate-filter-list-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-list-bad"});
  });

  it('loinc-expand-filter-dockind-request-parameters', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-dockind-request-parameters"});
  });

  it('loinc-validate-filter-dockind-type-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-dockind-type-good"});
  });

  it('loinc-validate-filter-dockind-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-dockind-bad"});
  });

  it('loinc-validate-filter-classtype-good', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-classtype-good"});
  });

  it('loinc-validate-filter-classtype-bad', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-validate-filter-classtype-bad"});
  });

  it('loinc-expand-filter-answers-for1', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answers-for1"});
  });

  it('loinc-expand-filter-answers-for2', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answers-for2"});
  });

  it('loinc-expand-filter-answer-list', async () => {
    await runTest({"suite":"tx.fhir.org","test":"loinc-expand-filter-answer-list"});
  });

});

describe('snomed', () => {
  // This snomed tests are based on the subset distributed with the tx-ecosystem IG

  it('snomed-inactive-display', async () => {
    await runTest({"suite":"snomed","test":"snomed-inactive-display"});
  });

  it('snomed-expand-inactive', async () => {
    await runTest({"suite":"snomed","test":"snomed-expand-inactive"});
  });

});

describe('batch', () => {
  // Test Batch Validation

  it('batch-validate', async () => {
    await runTest({"suite":"batch","test":"batch-validate"});
  });

  it('batch-validate-bad', async () => {
    await runTest({"suite":"batch","test":"batch-validate-bad"});
  });

});

describe('omop', () => {
  // Tests for OMOP implementations. Note that some servers only do OMOP (and some don't). The tests are based on a stable subset of OMOP maintained by Davera Gabriel

  it('omop-basic-validation-code-good', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good"});
  });

  it('omop-basic-validation-coding-good', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-good"});
  });

  it('omop-basic-validation-codeableconcept-good', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-good"});
  });

  it('omop-basic-validation-code-bad', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad"});
  });

  it('omop-basic-validation-coding-bad', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad"});
  });

  it('omop-basic-validation-codeableconcept-bad', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad"});
  });

  it('omop-basic-validation-code-bad-display', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-display"});
  });

  it('omop-basic-validation-coding-bad-display', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-display"});
  });

  it('omop-basic-validation-codeableconcept-bad-display', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-display"});
  });

  it('omop-basic-validation-code-bad-version', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-version"});
  });

  it('omop-basic-validation-coding-bad-version', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-version"});
  });

  it('omop-basic-validation-codeableconcept-bad-version', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-version"});
  });

  it('omop-basic-validation-code-good-vs', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good-vs"});
  });

  it('omop-basic-validation-coding-good-vs', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-good-vs"});
  });

  it('omop-basic-validation-codeableconcept-good-vs', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-good-vs"});
  });

  it('omop-basic-validation-code-bad-vs', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-vs"});
  });

  it('omop-basic-validation-coding-bad-vs', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-coding-bad-vs"});
  });

  it('omop-basic-validation-codeableconcept-bad-vs', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-codeableconcept-bad-vs"});
  });

  it('omop-lookup-code', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code"});
  });

  it('omop-lookup-code2', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code2"});
  });

  it('omop-lookup-code3', async () => {
    await runTest({"suite":"omop","test":"omop-lookup-code3"});
  });

  it('omop-basic-validation-code-good-vs-url', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-good-vs-url"});
  });

  it('omop-basic-validation-code-bad-vs-url', async () => {
    await runTest({"suite":"omop","test":"omop-basic-validation-code-bad-vs-url"});
  });

  it('omop-expand-explicit', async () => {
    await runTest({"suite":"omop","test":"omop-expand-explicit"});
  });

  it('translate-loinc-implicit', async () => {
    await runTest({"suite":"omop","test":"translate-loinc-implicit"});
  });

  it('translate-loinc-implicit-bad', async () => {
    await runTest({"suite":"omop","test":"translate-loinc-implicit-bad"});
  });

});

});

