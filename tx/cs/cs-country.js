const { CodeSystemProvider, FilterExecutionContext } = require('../../tx/cs/cs-api');
const assert = require('assert');
const { CodeSystem } = require("../library/codesystem");
const {CodeSystemFactoryProvider} = require("./cs-api");

class CountryCodeConcept {
  constructor(code, display) {
    this.code = code;
    this.display = display;
  }
}

class CountryCodeConceptFilter {
  constructor() {
    this.list = [];
    this.cursor = -1;
  }
}

class CountryCodeServices extends CodeSystemProvider {
  constructor(opContext, supplements, codes, codeMap) {
    super(opContext, supplements);
    this.codes = codes || [];
    this.codeMap = codeMap || new Map();
    this.supplements = [];
  }

  // Metadata methods
  system() {
    return 'urn:iso:std:iso:3166';
  }

  version() {
    return '2018';
  }

  description() {
    return 'ISO Country Codes';
  }

  name() {
    return 'Country Codes';
  }

  totalCount() {
    return this.codes.length;
  }

  hasParents() {
    return false; // No hierarchical relationships
  }

  hasAnyDisplays(languages) {
    const langs = this._ensureLanguages(languages);
    if (this._hasAnySupplementDisplays(langs)) {
      return true;
    }
    return super.hasAnyDisplays(langs);
  }

  // Core concept methods
  async code(code) {
    
    const ctxt = await this.#ensureContext(code);
    return ctxt ? ctxt.code : null;
  }

  async display(code) {
    
    const ctxt = await this.#ensureContext(code);
    if (!ctxt) {
      return null;
    }
    if (ctxt.display && this.opContext.langs.isEnglishOrNothing()) {
      return ctxt.display;
    }
    let disp = this._displayFromSupplements(ctxt.code);
    if (disp) {
      return disp;
    }
    return ctxt.display;
  }

  async definition(code) {
    
    await this.#ensureContext(code);
    return null; // No definitions provided
  }

  async isAbstract(code) {
    
    await this.#ensureContext(code);
    return false; // No abstract concepts
  }

  async isInactive(code) {
    
    await this.#ensureContext(code);
    return false; // No inactive concepts
  }

  async isDeprecated(code) {
    
    await this.#ensureContext(code);
    return false; // No deprecated concepts
  }


  async designations(code, displays) {
    
    const ctxt = await this.#ensureContext(code);
    if (ctxt != null) {
      displays.addDesignation( true, 'active', 'en', CodeSystem.makeUseForDisplay(), ctxt.display);
      this._listSupplementDesignations(ctxt.code, displays);
    }
  }

  async #ensureContext(code) {
    if (!code) {
      return code;
    }
    if (typeof code === 'string') {
      const ctxt = await this.locate(code);
      if (!ctxt.context) {
        throw new Error(ctxt.message);
      } else {
        return ctxt.context;
      }
    }
    if (code instanceof CountryCodeConcept) {
      return code;
    }
    throw new Error("Unknown Type at #ensureContext: "+ (typeof code));
  }

  // Lookup methods
  async locate(code) {
    
    assert(!code || typeof code === 'string', 'code must be string');
    if (!code) return { context: null, message: 'Empty code' };

    const concept = this.codeMap.get(code);
    if (concept) {
      return { context: concept, message: null };
    }
    return { context: null, message: undefined};
  }

  // Iterator methods
  async iterator(code) {
    
    const ctxt = await this.#ensureContext(code);
    if (!ctxt) {
      return { index: 0, total: this.totalCount() };
    }
    return null; // No child iteration
  }

  async nextContext(iteratorContext) {
    
    assert(iteratorContext, 'iteratorContext must be provided');
    if (iteratorContext && iteratorContext.index < iteratorContext.total) {
      const concept = this.codes[iteratorContext.index];
      iteratorContext.index++;
      return concept;
    }
    return null;
  }

  // Filtering methods
  async doesFilter(prop, op, value) {
    assert(prop != null && typeof prop === 'string', 'prop must be a non-null string');
    assert(op != null && typeof op === 'string', 'op must be a non-null string');
    assert(value != null && typeof value === 'string', 'value must be a non-null string');


    
    return prop === 'code' && op === 'regex';
  }


  async searchFilter(filterContext, filter, sort) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(filter && typeof filter === 'string', 'filter must be a non-null string');
    assert(typeof sort === 'boolean', 'sort must be a boolean');

    throw new Error('Search filter not implemented for CountryCode');
  }

  async filter(filterContext, prop, op, value) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(prop != null && typeof prop === 'string', 'prop must be a non-null string');
    assert(op != null && typeof op === 'string', 'op must be a non-null string');
    assert(value != null && typeof value === 'string', 'value must be a non-null string');

    if (prop === 'code' && op === 'regex') {
      const result = new CountryCodeConceptFilter();

      try {
        // Create regex with anchors to match the Pascal implementation (^value$)
        const regex = new RegExp('^' + value + '$');

        for (const concept of this.codes) {
          if (regex.test(concept.code)) {
            result.list.push(concept);
          }
        }

        filterContext.filters.push(result);
      } catch (error) {
        throw new Error(`Invalid regex pattern: ${value}`);
      }
    } else {
      throw new Error(`The filter ${prop} ${op} = ${value} is not supported for ${this.system()}`);
    }
  }

  async executeFilters(filterContext) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    return filterContext.filters;
  }

  async filterSize(filterContext, set) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(set && set instanceof CountryCodeConceptFilter, 'set must be a CountryCodeConceptFilter');
    return set.list.length;
  }

  async filtersNotClosed(filterContext) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    return false; // Finite set
  }

  async filterMore(filterContext, set) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(set && set instanceof CountryCodeConceptFilter, 'set must be a CountryCodeConceptFilter');
    set.cursor++;
    return set.cursor < set.list.length;
  }

  async filterConcept(filterContext, set) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(set && set instanceof CountryCodeConceptFilter, 'set must be a CountryCodeConceptFilter');
    if (set.cursor >= 0 && set.cursor < set.list.length) {
      return set.list[set.cursor];
    }
    return null;
  }

  async filterLocate(filterContext, set, code) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(set && set instanceof CountryCodeConceptFilter, 'set must be a CountryCodeConceptFilter');
    assert(typeof code === 'string', 'code must be non-null string');

    // For country codes, we can just use the main lookup since the filter
    // doesn't change which codes are available, just which ones match
    const concept = this.codeMap.get(code);
    if (concept && set.list.includes(concept)) {
      return concept;
    }
    return `Code '${code}' not found in filter set`;
  }

  async filterCheck(filterContext, set, concept) {
    
    assert(filterContext && filterContext instanceof FilterExecutionContext, 'filterContext must be a FilterExecutionContext');
    assert(set && set instanceof CountryCodeConceptFilter, 'set must be a CountryCodeConceptFilter');
    const ctxt = await this.#ensureContext(concept);
    return set.list.includes(ctxt);
  }

  // Subsumption
  async subsumesTest(codeA, codeB) {
    await this.#ensureContext(codeA);
    await this.#ensureContext(codeB);
    return 'not-subsumed'; // No subsumption relationships
  }

  versionAlgorithm() {
    return 'date';
  }
}

class CountryCodeFactoryProvider extends CodeSystemFactoryProvider {
  constructor(i18n) {
    super(i18n);
    this.uses = 0;
  }

  defaultVersion() {
    return '2018';
  }

  // Metadata methods
  system() {
    return 'urn:iso:std:iso:3166';
  }

  version() {
    return '2018';
  }

  build(opContext, supplements) {
    this.uses++;
    return new CountryCodeServices(opContext, supplements, this.codes, this.codeMap);
  }

  useCount() {
    return this.uses;
  }

  recordUse() {
    this.uses++;
  }

  // Load the hardcoded country code data
  async load() {
    this.codes = [];
    this.codeMap = new Map();

    const data = [
      // 2-letter codes
      ['AD', 'Andorra'],
      ['AE', 'United Arab Emirates'],
      ['AF', 'Afghanistan'],
      ['AG', 'Antigua and Barbuda'],
      ['AI', 'Anguilla'],
      ['AL', 'Albania'],
      ['AM', 'Armenia'],
      ['AO', 'Angola'],
      ['AQ', 'Antarctica'],
      ['AR', 'Argentina'],
      ['AS', 'American Samoa'],
      ['AT', 'Austria'],
      ['AU', 'Australia'],
      ['AW', 'Aruba'],
      ['AX', 'Åland Islands'],
      ['AZ', 'Azerbaijan'],
      ['BA', 'Bosnia and Herzegovina'],
      ['BB', 'Barbados'],
      ['BD', 'Bangladesh'],
      ['BE', 'Belgium'],
      ['BF', 'Burkina Faso'],
      ['BG', 'Bulgaria'],
      ['BH', 'Bahrain'],
      ['BI', 'Burundi'],
      ['BJ', 'Benin'],
      ['BL', 'Saint Barthélemy'],
      ['BM', 'Bermuda'],
      ['BN', 'Brunei Darussalam'],
      ['BO', 'Bolivia, Plurinational State of'],
      ['BQ', 'Bonaire, Sint Eustatius and Saba'],
      ['BR', 'Brazil'],
      ['BS', 'Bahamas'],
      ['BT', 'Bhutan'],
      ['BV', 'Bouvet Island'],
      ['BW', 'Botswana'],
      ['BY', 'Belarus'],
      ['BZ', 'Belize'],
      ['CA', 'Canada'],
      ['CC', 'Cocos (Keeling) Islands'],
      ['CD', 'Congo, the Democratic Republic of the'],
      ['CF', 'Central African Republic'],
      ['CG', 'Congo'],
      ['CH', 'Switzerland'],
      ['CI', 'Côte d\'Ivoire'],
      ['CK', 'Cook Islands'],
      ['CL', 'Chile'],
      ['CM', 'Cameroon'],
      ['CN', 'China'],
      ['CO', 'Colombia'],
      ['CR', 'Costa Rica'],
      ['CU', 'Cuba'],
      ['CV', 'Cabo Verde'],
      ['CW', 'Curaçao'],
      ['CX', 'Christmas Island'],
      ['CY', 'Cyprus'],
      ['CZ', 'Czechia'],
      ['DE', 'Germany'],
      ['DJ', 'Djibouti'],
      ['DK', 'Denmark'],
      ['DM', 'Dominica'],
      ['DO', 'Dominican Republic'],
      ['DZ', 'Algeria'],
      ['EC', 'Ecuador'],
      ['EE', 'Estonia'],
      ['EG', 'Egypt'],
      ['EH', 'Western Sahara'],
      ['ER', 'Eritrea'],
      ['ES', 'Spain'],
      ['ET', 'Ethiopia'],
      ['FI', 'Finland'],
      ['FJ', 'Fiji'],
      ['FK', 'Falkland Islands (Malvinas)'],
      ['FM', 'Micronesia, Federated States of'],
      ['FO', 'Faroe Islands'],
      ['FR', 'France'],
      ['GA', 'Gabon'],
      ['GB', 'United Kingdom of Great Britain and Northern Ireland'],
      ['GD', 'Grenada'],
      ['GE', 'Georgia'],
      ['GF', 'French Guiana'],
      ['GG', 'Guernsey'],
      ['GH', 'Ghana'],
      ['GI', 'Gibraltar'],
      ['GL', 'Greenland'],
      ['GM', 'Gambia'],
      ['GN', 'Guinea'],
      ['GP', 'Guadeloupe'],
      ['GQ', 'Equatorial Guinea'],
      ['GR', 'Greece'],
      ['GS', 'South Georgia and the South Sandwich Islands'],
      ['GT', 'Guatemala'],
      ['GU', 'Guam'],
      ['GW', 'Guinea-Bissau'],
      ['GY', 'Guyana'],
      ['HK', 'Hong Kong'],
      ['HM', 'Heard Island and McDonald Islands'],
      ['HN', 'Honduras'],
      ['HR', 'Croatia'],
      ['HT', 'Haiti'],
      ['HU', 'Hungary'],
      ['ID', 'Indonesia'],
      ['IE', 'Ireland'],
      ['IL', 'Israel'],
      ['IM', 'Isle of Man'],
      ['IN', 'India'],
      ['IO', 'British Indian Ocean Territory'],
      ['IQ', 'Iraq'],
      ['IR', 'Iran, Islamic Republic of'],
      ['IS', 'Iceland'],
      ['IT', 'Italy'],
      ['JE', 'Jersey'],
      ['JM', 'Jamaica'],
      ['JO', 'Jordan'],
      ['JP', 'Japan'],
      ['KE', 'Kenya'],
      ['KG', 'Kyrgyzstan'],
      ['KH', 'Cambodia'],
      ['KI', 'Kiribati'],
      ['KM', 'Comoros'],
      ['KN', 'Saint Kitts and Nevis'],
      ['KP', 'Korea, Democratic People\'s Republic of'],
      ['KR', 'Korea, Republic of'],
      ['KW', 'Kuwait'],
      ['KY', 'Cayman Islands'],
      ['KZ', 'Kazakhstan'],
      ['LA', 'Lao People\'s Democratic Republic'],
      ['LB', 'Lebanon'],
      ['LC', 'Saint Lucia'],
      ['LI', 'Liechtenstein'],
      ['LK', 'Sri Lanka'],
      ['LR', 'Liberia'],
      ['LS', 'Lesotho'],
      ['LT', 'Lithuania'],
      ['LU', 'Luxembourg'],
      ['LV', 'Latvia'],
      ['LY', 'Libya'],
      ['MA', 'Morocco'],
      ['MC', 'Monaco'],
      ['MD', 'Moldova, Republic of'],
      ['ME', 'Montenegro'],
      ['MF', 'Saint Martin (French part)'],
      ['MG', 'Madagascar'],
      ['MH', 'Marshall Islands'],
      ['MK', 'Macedonia, the former Yugoslav Republic of'],
      ['ML', 'Mali'],
      ['MM', 'Myanmar'],
      ['MN', 'Mongolia'],
      ['MO', 'Macao'],
      ['MP', 'Northern Mariana Islands'],
      ['MQ', 'Martinique'],
      ['MR', 'Mauritania'],
      ['MS', 'Montserrat'],
      ['MT', 'Malta'],
      ['MU', 'Mauritius'],
      ['MV', 'Maldives'],
      ['MW', 'Malawi'],
      ['MX', 'Mexico'],
      ['MY', 'Malaysia'],
      ['MZ', 'Mozambique'],
      ['NA', 'Namibia'],
      ['NC', 'New Caledonia'],
      ['NE', 'Niger'],
      ['NF', 'Norfolk Island'],
      ['NG', 'Nigeria'],
      ['NI', 'Nicaragua'],
      ['NL', 'Netherlands'],
      ['NO', 'Norway'],
      ['NP', 'Nepal'],
      ['NR', 'Nauru'],
      ['NU', 'Niue'],
      ['NZ', 'New Zealand'],
      ['OM', 'Oman'],
      ['PA', 'Panama'],
      ['PE', 'Peru'],
      ['PF', 'French Polynesia'],
      ['PG', 'Papua New Guinea'],
      ['PH', 'Philippines'],
      ['PK', 'Pakistan'],
      ['PL', 'Poland'],
      ['PM', 'Saint Pierre and Miquelon'],
      ['PN', 'Pitcairn'],
      ['PR', 'Puerto Rico'],
      ['PS', 'Palestine, State of'],
      ['PT', 'Portugal'],
      ['PW', 'Palau'],
      ['PY', 'Paraguay'],
      ['QA', 'Qatar'],
      ['RE', 'Réunion'],
      ['RO', 'Romania'],
      ['RS', 'Serbia'],
      ['RU', 'Russian Federation'],
      ['RW', 'Rwanda'],
      ['SA', 'Saudi Arabia'],
      ['SB', 'Solomon Islands'],
      ['SC', 'Seychelles'],
      ['SD', 'Sudan'],
      ['SE', 'Sweden'],
      ['SG', 'Singapore'],
      ['SH', 'Saint Helena, Ascension and Tristan da Cunha'],
      ['SI', 'Slovenia'],
      ['SJ', 'Svalbard and Jan Mayen'],
      ['SK', 'Slovakia'],
      ['SL', 'Sierra Leone'],
      ['SM', 'San Marino'],
      ['SN', 'Senegal'],
      ['SO', 'Somalia'],
      ['SR', 'Suriname'],
      ['SS', 'South Sudan'],
      ['ST', 'Sao Tome and Principe'],
      ['SV', 'El Salvador'],
      ['SX', 'Sint Maarten (Dutch part)'],
      ['SY', 'Syrian Arab Republic'],
      ['SZ', 'Swaziland'],
      ['TC', 'Turks and Caicos Islands'],
      ['TD', 'Chad'],
      ['TF', 'French Southern Territories'],
      ['TG', 'Togo'],
      ['TH', 'Thailand'],
      ['TJ', 'Tajikistan'],
      ['TK', 'Tokelau'],
      ['TL', 'Timor-Leste'],
      ['TM', 'Turkmenistan'],
      ['TN', 'Tunisia'],
      ['TO', 'Tonga'],
      ['TR', 'Turkey'],
      ['TT', 'Trinidad and Tobago'],
      ['TV', 'Tuvalu'],
      ['TW', 'Taiwan, Province of China'],
      ['TZ', 'Tanzania, United Republic of'],
      ['UA', 'Ukraine'],
      ['UG', 'Uganda'],
      ['UM', 'United States Minor Outlying Islands'],
      ['US', 'United States of America'],
      ['UY', 'Uruguay'],
      ['UZ', 'Uzbekistan'],
      ['VA', 'Holy See'],
      ['VC', 'Saint Vincent and the Grenadines'],
      ['VE', 'Venezuela, Bolivarian Republic of'],
      ['VG', 'Virgin Islands, British'],
      ['VI', 'Virgin Islands, U.S.'],
      ['VN', 'Viet Nam'],
      ['VU', 'Vanuatu'],
      ['WF', 'Wallis and Futuna'],
      ['WS', 'Samoa'],
      ['YE', 'Yemen'],
      ['YT', 'Mayotte'],
      ['ZA', 'South Africa'],
      ['ZM', 'Zambia'],
      ['ZW', 'Zimbabwe'],

      // ISO 3166-1 User-assigned code elements
      // These codes are reserved for user assignment and will never be used for country names
      // See: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#User-assigned_code_elements
      ['AA', 'User-assigned'],
      ['QM', 'User-assigned'],
      ['QN', 'User-assigned'],
      ['QO', 'User-assigned'],
      ['QP', 'User-assigned'],
      ['QQ', 'User-assigned'],
      ['QR', 'User-assigned'],
      ['QS', 'User-assigned'],
      ['QT', 'User-assigned'],
      ['QU', 'User-assigned'],
      ['QV', 'User-assigned'],
      ['QW', 'User-assigned'],
      ['QX', 'User-assigned'],
      ['QY', 'User-assigned'],
      ['QZ', 'User-assigned'],
      ['XA', 'User-assigned'],
      ['XB', 'User-assigned'],
      ['XC', 'User-assigned'],
      ['XD', 'User-assigned'],
      ['XE', 'User-assigned'],
      ['XF', 'User-assigned'],
      ['XG', 'User-assigned'],
      ['XH', 'User-assigned'],
      ['XI', 'User-assigned'],
      ['XJ', 'User-assigned'],
      ['XK', 'Kosovo'],
      ['XL', 'User-assigned'],
      ['XM', 'User-assigned'],
      ['XN', 'User-assigned'],
      ['XO', 'User-assigned'],
      ['XP', 'User-assigned'],
      ['XQ', 'User-assigned'],
      ['XR', 'User-assigned'],
      ['XS', 'User-assigned'],
      ['XT', 'User-assigned'],
      ['XU', 'User-assigned'],
      ['XV', 'User-assigned'],
      ['XW', 'User-assigned'],
      ['XX', 'Unknown'],
      ['XY', 'User-assigned'],
      ['XZ', 'International Waters'],
      ['ZZ', 'Unknown or Invalid Territory'],

      // 3-letter codes
      ['ABW', 'Aruba'],
      ['AFG', 'Afghanistan'],
      ['AGO', 'Angola'],
      ['AIA', 'Anguilla'],
      ['ALA', 'Åland Islands'],
      ['ALB', 'Albania'],
      ['AND', 'Andorra'],
      ['ARE', 'United Arab Emirates'],
      ['ARG', 'Argentina'],
      ['ARM', 'Armenia'],
      ['ASM', 'American Samoa'],
      ['ATA', 'Antarctica'],
      ['ATF', 'French Southern Territories'],
      ['ATG', 'Antigua and Barbuda'],
      ['AUS', 'Australia'],
      ['AUT', 'Austria'],
      ['AZE', 'Azerbaijan'],
      ['BDI', 'Burundi'],
      ['BEL', 'Belgium'],
      ['BEN', 'Benin'],
      ['BES', 'Bonaire, Sint Eustatius and Saba'],
      ['BFA', 'Burkina Faso'],
      ['BGD', 'Bangladesh'],
      ['BGR', 'Bulgaria'],
      ['BHR', 'Bahrain'],
      ['BHS', 'Bahamas'],
      ['BIH', 'Bosnia and Herzegovina'],
      ['BLM', 'Saint Barthélemy'],
      ['BLR', 'Belarus'],
      ['BLZ', 'Belize'],
      ['BMU', 'Bermuda'],
      ['BOL', 'Bolivia, Plurinational State of'],
      ['BRA', 'Brazil'],
      ['BRB', 'Barbados'],
      ['BRN', 'Brunei Darussalam'],
      ['BTN', 'Bhutan'],
      ['BVT', 'Bouvet Island'],
      ['BWA', 'Botswana'],
      ['CAF', 'Central African Republic'],
      ['CAN', 'Canada'],
      ['CCK', 'Cocos (Keeling) Islands'],
      ['CHE', 'Switzerland'],
      ['CHL', 'Chile'],
      ['CHN', 'China'],
      ['CIV', 'Côte d\'Ivoire'],
      ['CMR', 'Cameroon'],
      ['COD', 'Congo, the Democratic Republic of the'],
      ['COG', 'Congo'],
      ['COK', 'Cook Islands'],
      ['COL', 'Colombia'],
      ['COM', 'Comoros'],
      ['CPV', 'Cabo Verde'],
      ['CRI', 'Costa Rica'],
      ['CUB', 'Cuba'],
      ['CUW', 'Curaçao'],
      ['CXR', 'Christmas Island'],
      ['CYM', 'Cayman Islands'],
      ['CYP', 'Cyprus'],
      ['CZE', 'Czechia'],
      ['DEU', 'Germany'],
      ['DJI', 'Djibouti'],
      ['DMA', 'Dominica'],
      ['DNK', 'Denmark'],
      ['DOM', 'Dominican Republic'],
      ['DZA', 'Algeria'],
      ['ECU', 'Ecuador'],
      ['EGY', 'Egypt'],
      ['ERI', 'Eritrea'],
      ['ESH', 'Western Sahara'],
      ['ESP', 'Spain'],
      ['EST', 'Estonia'],
      ['ETH', 'Ethiopia'],
      ['FIN', 'Finland'],
      ['FJI', 'Fiji'],
      ['FLK', 'Falkland Islands (Malvinas)'],
      ['FRA', 'France'],
      ['FRO', 'Faroe Islands'],
      ['FSM', 'Micronesia, Federated States of'],
      ['GAB', 'Gabon'],
      ['GBR', 'United Kingdom'],
      ['GEO', 'Georgia'],
      ['GGY', 'Guernsey'],
      ['GHA', 'Ghana'],
      ['GIB', 'Gibraltar'],
      ['GIN', 'Guinea'],
      ['GLP', 'Guadeloupe'],
      ['GMB', 'Gambia'],
      ['GNB', 'Guinea-Bissau'],
      ['GNQ', 'Equatorial Guinea'],
      ['GRC', 'Greece'],
      ['GRD', 'Grenada'],
      ['GRL', 'Greenland'],
      ['GTM', 'Guatemala'],
      ['GUF', 'French Guiana'],
      ['GUM', 'Guam'],
      ['GUY', 'Guyana'],
      ['HKG', 'Hong Kong'],
      ['HMD', 'Heard Island and McDonald Islands'],
      ['HND', 'Honduras'],
      ['HRV', 'Croatia'],
      ['HTI', 'Haiti'],
      ['HUN', 'Hungary'],
      ['IDN', 'Indonesia'],
      ['IMN', 'Isle of Man'],
      ['IND', 'India'],
      ['IOT', 'British Indian Ocean Territory'],
      ['IRL', 'Ireland'],
      ['IRN', 'Iran, Islamic Republic of'],
      ['IRQ', 'Iraq'],
      ['ISL', 'Iceland'],
      ['ISR', 'Israel'],
      ['ITA', 'Italy'],
      ['JAM', 'Jamaica'],
      ['JEY', 'Jersey'],
      ['JOR', 'Jordan'],
      ['JPN', 'Japan'],
      ['KAZ', 'Kazakhstan'],
      ['KEN', 'Kenya'],
      ['KGZ', 'Kyrgyzstan'],
      ['KHM', 'Cambodia'],
      ['KIR', 'Kiribati'],
      ['KNA', 'Saint Kitts and Nevis'],
      ['KOR', 'Korea, Republic of'],
      ['KWT', 'Kuwait'],
      ['LAO', 'Lao People\'s Democratic Republic'],
      ['LBN', 'Lebanon'],
      ['LBR', 'Liberia'],
      ['LBY', 'Libya'],
      ['LCA', 'Saint Lucia'],
      ['LIE', 'Liechtenstein'],
      ['LKA', 'Sri Lanka'],
      ['LSO', 'Lesotho'],
      ['LTU', 'Lithuania'],
      ['LUX', 'Luxembourg'],
      ['LVA', 'Latvia'],
      ['MAC', 'Macao'],
      ['MAF', 'Saint Martin (French part)'],
      ['MAR', 'Morocco'],
      ['MCO', 'Monaco'],
      ['MDA', 'Moldova, Republic of'],
      ['MDG', 'Madagascar'],
      ['MDV', 'Maldives'],
      ['MEX', 'Mexico'],
      ['MHL', 'Marshall Islands'],
      ['MKD', 'Macedonia, the former Yugoslav Republic of'],
      ['MLI', 'Mali'],
      ['MLT', 'Malta'],
      ['MMR', 'Myanmar'],
      ['MNE', 'Montenegro'],
      ['MNG', 'Mongolia'],
      ['MNP', 'Northern Mariana Islands'],
      ['MOZ', 'Mozambique'],
      ['MRT', 'Mauritania'],
      ['MSR', 'Montserrat'],
      ['MTQ', 'Martinique'],
      ['MUS', 'Mauritius'],
      ['MWI', 'Malawi'],
      ['MYS', 'Malaysia'],
      ['MYT', 'Mayotte'],
      ['NAM', 'Namibia'],
      ['NCL', 'New Caledonia'],
      ['NER', 'Niger'],
      ['NFK', 'Norfolk Island'],
      ['NGA', 'Nigeria'],
      ['NIC', 'Nicaragua'],
      ['NIU', 'Niue'],
      ['NLD', 'Netherlands'],
      ['NOR', 'Norway'],
      ['NPL', 'Nepal'],
      ['NRU', 'Nauru'],
      ['NZL', 'New Zealand'],
      ['OMN', 'Oman'],
      ['PAK', 'Pakistan'],
      ['PAN', 'Panama'],
      ['PCN', 'Pitcairn'],
      ['PER', 'Peru'],
      ['PHL', 'Philippines'],
      ['PLW', 'Palau'],
      ['PNG', 'Papua New Guinea'],
      ['POL', 'Poland'],
      ['PRI', 'Puerto Rico'],
      ['PRK', 'Korea, Democratic People\'s Republic of'],
      ['PRT', 'Portugal'],
      ['PRY', 'Paraguay'],
      ['PSE', 'Palestine, State of'],
      ['PYF', 'French Polynesia'],
      ['QAT', 'Qatar'],
      ['REU', 'Réunion'],
      ['ROU', 'Romania'],
      ['RUS', 'Russian Federation'],
      ['RWA', 'Rwanda'],
      ['SAU', 'Saudi Arabia'],
      ['SDN', 'Sudan'],
      ['SEN', 'Senegal'],
      ['SGP', 'Singapore'],
      ['SGS', 'South Georgia and the South Sandwich Islands'],
      ['SHN', 'Saint Helena, Ascension and Tristan da Cunha'],
      ['SJM', 'Svalbard and Jan Mayen'],
      ['SLB', 'Solomon Islands'],
      ['SLE', 'Sierra Leone'],
      ['SLV', 'El Salvador'],
      ['SMR', 'San Marino'],
      ['SOM', 'Somalia'],
      ['SPM', 'Saint Pierre and Miquelon'],
      ['SRB', 'Serbia'],
      ['SSD', 'South Sudan'],
      ['STP', 'Sao Tome and Principe'],
      ['SUR', 'Suriname'],
      ['SVK', 'Slovakia'],
      ['SVN', 'Slovenia'],
      ['SWE', 'Sweden'],
      ['SWZ', 'Swaziland'],
      ['SXM', 'Sint Maarten (Dutch part)'],
      ['SYC', 'Seychelles'],
      ['SYR', 'Syrian Arab Republic'],
      ['TCA', 'Turks and Caicos Islands'],
      ['TCD', 'Chad'],
      ['TGO', 'Togo'],
      ['THA', 'Thailand'],
      ['TJK', 'Tajikistan'],
      ['TKL', 'Tokelau'],
      ['TKM', 'Turkmenistan'],
      ['TLS', 'Timor-Leste'],
      ['TON', 'Tonga'],
      ['TTO', 'Trinidad and Tobago'],
      ['TUN', 'Tunisia'],
      ['TUR', 'Turkey'],
      ['TUV', 'Tuvalu'],
      ['TWN', 'Taiwan, Province of China'],
      ['TZA', 'Tanzania, United Republic of'],
      ['UGA', 'Uganda'],
      ['UKR', 'Ukraine'],
      ['UMI', 'United States Minor Outlying Islands'],
      ['URY', 'Uruguay'],
      ['USA', 'United States of America'],
      ['UZB', 'Uzbekistan'],
      ['VAT', 'Holy See'],
      ['VCT', 'Saint Vincent and the Grenadines'],
      ['VEN', 'Venezuela, Bolivarian Republic of'],
      ['VGB', 'Virgin Islands, British'],
      ['VIR', 'Virgin Islands, U.S.'],
      ['VNM', 'Viet Nam'],
      ['VUT', 'Vanuatu'],
      ['WLF', 'Wallis and Futuna'],
      ['WSM', 'Samoa'],
      ['YEM', 'Yemen'],
      ['ZAF', 'South Africa'],
      ['ZMB', 'Zambia'],
      ['ZWE', 'Zimbabwe'],

      // Numeric codes
      ['004', 'Afghanistan'],
      ['008', 'Albania'],
      ['010', 'Antarctica'],
      ['012', 'Algeria'],
      ['016', 'American Samoa'],
      ['020', 'Andorra'],
      ['024', 'Angola'],
      ['028', 'Antigua and Barbuda'],
      ['031', 'Azerbaijan'],
      ['032', 'Argentina'],
      ['036', 'Australia'],
      ['040', 'Austria'],
      ['044', 'Bahamas'],
      ['048', 'Bahrain'],
      ['050', 'Bangladesh'],
      ['051', 'Armenia'],
      ['052', 'Barbados'],
      ['056', 'Belgium'],
      ['060', 'Bermuda'],
      ['064', 'Bhutan'],
      ['068', 'Bolivia, Plurinational State of'],
      ['070', 'Bosnia and Herzegovina'],
      ['072', 'Botswana'],
      ['074', 'Bouvet Island'],
      ['076', 'Brazil'],
      ['084', 'Belize'],
      ['086', 'British Indian Ocean Territory'],
      ['090', 'Solomon Islands'],
      ['092', 'Virgin Islands, British'],
      ['096', 'Brunei Darussalam'],
      ['100', 'Bulgaria'],
      ['104', 'Myanmar'],
      ['108', 'Burundi'],
      ['112', 'Belarus'],
      ['116', 'Cambodia'],
      ['120', 'Cameroon'],
      ['124', 'Canada'],
      ['132', 'Cabo Verde'],
      ['136', 'Cayman Islands'],
      ['140', 'Central African Republic'],
      ['144', 'Sri Lanka'],
      ['148', 'Chad'],
      ['152', 'Chile'],
      ['156', 'China'],
      ['158', 'Taiwan, Province of China'],
      ['162', 'Christmas Island'],
      ['166', 'Cocos (Keeling) Islands'],
      ['170', 'Colombia'],
      ['174', 'Comoros'],
      ['175', 'Mayotte'],
      ['178', 'Congo'],
      ['180', 'Congo, the Democratic Republic of the'],
      ['184', 'Cook Islands'],
      ['188', 'Costa Rica'],
      ['191', 'Croatia'],
      ['192', 'Cuba'],
      ['196', 'Cyprus'],
      ['203', 'Czechia'],
      ['204', 'Benin'],
      ['208', 'Denmark'],
      ['212', 'Dominica'],
      ['214', 'Dominican Republic'],
      ['218', 'Ecuador'],
      ['222', 'El Salvador'],
      ['226', 'Equatorial Guinea'],
      ['231', 'Ethiopia'],
      ['232', 'Eritrea'],
      ['233', 'Estonia'],
      ['234', 'Faroe Islands'],
      ['238', 'Falkland Islands (Malvinas)'],
      ['239', 'South Georgia and the South Sandwich Islands'],
      ['242', 'Fiji'],
      ['246', 'Finland'],
      ['248', 'Åland Islands'],
      ['250', 'France'],
      ['254', 'French Guiana'],
      ['258', 'French Polynesia'],
      ['260', 'French Southern Territories'],
      ['262', 'Djibouti'],
      ['266', 'Gabon'],
      ['268', 'Georgia'],
      ['270', 'Gambia'],
      ['275', 'Palestine, State of'],
      ['276', 'Germany'],
      ['288', 'Ghana'],
      ['292', 'Gibraltar'],
      ['296', 'Kiribati'],
      ['300', 'Greece'],
      ['304', 'Greenland'],
      ['308', 'Grenada'],
      ['312', 'Guadeloupe'],
      ['316', 'Guam'],
      ['320', 'Guatemala'],
      ['324', 'Guinea'],
      ['328', 'Guyana'],
      ['332', 'Haiti'],
      ['334', 'Heard Island and McDonald Islands'],
      ['336', 'Holy See'],
      ['340', 'Honduras'],
      ['344', 'Hong Kong'],
      ['348', 'Hungary'],
      ['352', 'Iceland'],
      ['356', 'India'],
      ['360', 'Indonesia'],
      ['364', 'Iran, Islamic Republic of'],
      ['368', 'Iraq'],
      ['372', 'Ireland'],
      ['376', 'Israel'],
      ['380', 'Italy'],
      ['384', 'Côte d\'Ivoire'],
      ['388', 'Jamaica'],
      ['392', 'Japan'],
      ['398', 'Kazakhstan'],
      ['400', 'Jordan'],
      ['404', 'Kenya'],
      ['408', 'Korea, Democratic People\'s Republic of'],
      ['410', 'Korea, Republic of'],
      ['414', 'Kuwait'],
      ['417', 'Kyrgyzstan'],
      ['418', 'Lao People\'s Democratic Republic'],
      ['422', 'Lebanon'],
      ['426', 'Lesotho'],
      ['428', 'Latvia'],
      ['430', 'Liberia'],
      ['434', 'Libya'],
      ['438', 'Liechtenstein'],
      ['440', 'Lithuania'],
      ['442', 'Luxembourg'],
      ['446', 'Macao'],
      ['450', 'Madagascar'],
      ['454', 'Malawi'],
      ['458', 'Malaysia'],
      ['462', 'Maldives'],
      ['466', 'Mali'],
      ['470', 'Malta'],
      ['474', 'Martinique'],
      ['478', 'Mauritania'],
      ['480', 'Mauritius'],
      ['484', 'Mexico'],
      ['492', 'Monaco'],
      ['496', 'Mongolia'],
      ['498', 'Moldova, Republic of'],
      ['499', 'Montenegro'],
      ['500', 'Montserrat'],
      ['504', 'Morocco'],
      ['508', 'Mozambique'],
      ['512', 'Oman'],
      ['516', 'Namibia'],
      ['520', 'Nauru'],
      ['524', 'Nepal'],
      ['528', 'Netherlands'],
      ['531', 'Curaçao'],
      ['533', 'Aruba'],
      ['534', 'Sint Maarten (Dutch part)'],
      ['535', 'Bonaire, Sint Eustatius and Saba'],
      ['540', 'New Caledonia'],
      ['548', 'Vanuatu'],
      ['554', 'New Zealand'],
      ['558', 'Nicaragua'],
      ['562', 'Niger'],
      ['566', 'Nigeria'],
      ['570', 'Niue'],
      ['574', 'Norfolk Island'],
      ['578', 'Norway'],
      ['580', 'Northern Mariana Islands'],
      ['581', 'United States Minor Outlying Islands'],
      ['583', 'Micronesia, Federated States of'],
      ['584', 'Marshall Islands'],
      ['585', 'Palau'],
      ['586', 'Pakistan'],
      ['591', 'Panama'],
      ['598', 'Papua New Guinea'],
      ['600', 'Paraguay'],
      ['604', 'Peru'],
      ['608', 'Philippines'],
      ['612', 'Pitcairn'],
      ['616', 'Poland'],
      ['620', 'Portugal'],
      ['624', 'Guinea-Bissau'],
      ['626', 'Timor-Leste'],
      ['630', 'Puerto Rico'],
      ['634', 'Qatar'],
      ['638', 'Réunion'],
      ['642', 'Romania'],
      ['643', 'Russian Federation'],
      ['646', 'Rwanda'],
      ['652', 'Saint Barthélemy'],
      ['654', 'Saint Helena, Ascension and Tristan da Cunha'],
      ['659', 'Saint Kitts and Nevis'],
      ['660', 'Anguilla'],
      ['662', 'Saint Lucia'],
      ['663', 'Saint Martin (French part)'],
      ['666', 'Saint Pierre and Miquelon'],
      ['670', 'Saint Vincent and the Grenadines'],
      ['674', 'San Marino'],
      ['678', 'Sao Tome and Principe'],
      ['682', 'Saudi Arabia'],
      ['686', 'Senegal'],
      ['688', 'Serbia'],
      ['690', 'Seychelles'],
      ['694', 'Sierra Leone'],
      ['702', 'Singapore'],
      ['703', 'Slovakia'],
      ['704', 'Viet Nam'],
      ['705', 'Slovenia'],
      ['706', 'Somalia'],
      ['710', 'South Africa'],
      ['716', 'Zimbabwe'],
      ['724', 'Spain'],
      ['728', 'South Sudan'],
      ['729', 'Sudan'],
      ['732', 'Western Sahara'],
      ['740', 'Suriname'],
      ['744', 'Svalbard and Jan Mayen'],
      ['748', 'Swaziland'],
      ['752', 'Sweden'],
      ['756', 'Switzerland'],
      ['760', 'Syrian Arab Republic'],
      ['762', 'Tajikistan'],
      ['764', 'Thailand'],
      ['768', 'Togo'],
      ['772', 'Tokelau'],
      ['776', 'Tonga'],
      ['780', 'Trinidad and Tobago'],
      ['784', 'United Arab Emirates'],
      ['788', 'Tunisia'],
      ['792', 'Turkey'],
      ['795', 'Turkmenistan'],
      ['796', 'Turks and Caicos Islands'],
      ['798', 'Tuvalu'],
      ['800', 'Uganda'],
      ['804', 'Ukraine'],
      ['807', 'Macedonia, the former Yugoslav Republic of'],
      ['818', 'Egypt'],
      ['826', 'United Kingdom'],
      ['831', 'Guernsey'],
      ['832', 'Jersey'],
      ['833', 'Isle of Man'],
      ['834', 'Tanzania, United Republic of'],
      ['840', 'United States of America'],
      ['850', 'Virgin Islands, U.S.'],
      ['854', 'Burkina Faso'],
      ['858', 'Uruguay'],
      ['860', 'Uzbekistan'],
      ['862', 'Venezuela, Bolivarian Republic of'],
      ['876', 'Wallis and Futuna'],
      ['882', 'Samoa'],
      ['887', 'Yemen'],
      ['894', 'Zambia']
    ];

    // Load concepts into arrays and map
    for (const [code, display] of data) {
      const concept = new CountryCodeConcept(code, display);
      this.codes.push(concept);
      this.codeMap.set(code, concept);
    }
  }

  // eslint-disable-next-line no-unused-vars
  async buildKnownValueSet(url, version) {
    return null;
  }
  name() {
    return 'Country Codes';
  }

  id() {
    return "countries";
  }
}

module.exports = {
  CountryCodeServices,
  CountryCodeFactoryProvider,
  CountryCodeConcept,
  CountryCodeConceptFilter
};