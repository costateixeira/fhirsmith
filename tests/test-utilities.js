const path = require('path');
const { LanguageDefinitions } = require('../library/languages');
const {I18nSupport} = require("../library/i18nsupport");

const ONLINE = false; // flip to true when online
const testOrSkip = ONLINE ? test : test.skip;

class TestUtilities {
  static i18n;
  static langDefs;

  static async loadLanguageDefinitions() {
    if (!this.langDefs) {
      this.langDefs = await LanguageDefinitions.fromFiles(path.join(__dirname, '../tx/data'));
    }
    return this.langDefs;
  }

  static async loadTranslations(languageDefinitions = null) {
    if (!this.i18n) {
      this.i18n = new I18nSupport(path.join(__dirname, '../translations'), languageDefinitions ? languageDefinitions : await this.loadLanguageDefinitions());
      await this.i18n.load();
    }
    return this.i18n;
  }
}

module.exports = {
  TestUtilities, testOrSkip
};