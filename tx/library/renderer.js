const {CodeSystemProvider} = require("../cs/cs-api");
const {Extensions} = require("./extensions");
const {div} = require("../../library/html");
const {getValuePrimitive} = require("../../library/utilities");

/**
 * @typedef {Object} TerminologyLinkResolver
 * @property {function(OperationContext, string, string=): {description: string, link: string}|null} resolveURL
 *   Given a URL and optional version, returns description and link, or null if not found
 * @property {function(OperationContext, string, string, string=): {display: string, link: string}|null} resolveCode
 *   Given a URL, code, and optional version, returns display and link, or null if not found
 */

class Renderer {

  constructor(opContext, linkResolver = null) {
    this.opContext = opContext;
    this.linkResolver = linkResolver;
  }

  displayCoded(...args) {
    if (args.length === 1) {
      const arg = args[0];
      if (arg.systemUri !== undefined && arg.version !== undefined && arg.code !== undefined && arg.display !== undefined) {
        // It's a Coding
        return this.displayCodedCoding(arg);
      } else if (arg.coding !== undefined || arg.text) {
        // It's a CodeableConcept
        return this.displayCodedCodeableConcept(arg);
      } else if (arg.systemUri !== undefined && arg.version !== undefined) {
        // It's a CodeSystemProvider
        return this.displayCodedProvider(arg);
      } else if (arg instanceof CodeSystemProvider) {
        let cs = arg;
        return cs.system() + "|" + cs.version();
      }
    } else if (args.length === 2) {
      return this.displayCodedSystemVersion(args[0], args[1]);
    } else if (args.length === 3) {
      return this.displayCodedSystemVersionCode(args[0], args[1], args[2]);
    } else if (args.length === 4) {
      return this.displayCodedSystemVersionCodeDisplay(args[0], args[1], args[2], args[3]);
    }
    throw new Error('Invalid arguments to renderCoded');
  }

  displayCodedProvider(system) {
    let result = system.systemUri + '|' + system.version;
    if (system.sourcePackage) {
      result = result + ' (from ' + system.sourcePackage + ')';
    }
    return result;
  }

  displayCodedSystemVersion(system, version) {
    if (!version) {
      return system;
    } else {
      return system + '|' + version;
    }
  }

  displayCodedSystemVersionCode(system, version, code) {
    return this.displayCodedSystemVersion(system, version) + '#' + code;
  }

  displayCodedSystemVersionCodeDisplay(system, version, code, display) {
    return this.displayCodedSystemVersionCode(system, version, code) + ' ("' + display + '")';
  }

  displayCodedCoding(code) {
    return this.displayCodedSystemVersionCodeDisplay(code.systemUri, code.version, code.code, code.display);
  }

  displayCodedCodeableConcept(code) {
    let result = '';
    if (code.text && !code.coding) {
      result = '"'+code.text+'"';
    } else {
      for (const c of code.coding || []) {
        if (result) {
          result = result + ', ';
        }
        result = result + this.displayCodedCoding(c);
      }
    }
    return '[' + result + ']';
  }

  displayValueSetInclude(inc) {
    let result;
    if (inc.systemUri) {
      result = '(' + inc.systemUri + ')';
      if (inc.hasConcepts) {
        result = result + '(';
        let first = true;
        for (const cc of inc.concepts) {
          if (first) {
            first = false;
          } else {
            result = result + ',';
          }
          result = result + cc.code;
        }
        result = result + ')';
      }
      if (inc.hasFilters) {
        result = result + '(';
        let first = true;
        for (const ci of inc.filters) {
          if (first) {
            first = false;
          } else {
            result = result + ',';
          }
          result = result + ci.prop + ci.op + ci.value;
        }
        result = result + ')';
      }
    } else {
      result = '(';
      let first = true;
      for (const s of inc.valueSets || []) {
        if (first) {
          first = false;
        } else {
          result = result + ',';
        }
        result = result + '^' + s;
      }
      result = result + ')';
    }
    return result;
  }

  async renderMetadataTable(res, tbl) {
    this.renderMetadataVersion(res, tbl);
    await this.renderMetadataProfiles(res, tbl);
    this.renderMetadataTags(res, tbl);
    this.renderMetadataLabels(res, tbl);
    this.renderMetadataLastUpdated(res, tbl);
    this.renderMetadataSource(res, tbl);
    this.renderProperty(tbl, 'TEST_PLAN_LANG', res.language);
    this.renderProperty(tbl, 'GENERAL_DEFINING_URL', res.url);
    this.renderProperty(tbl, 'GENERAL_VER', res.version);
    this.renderProperty(tbl, 'GENERAL_NAME', res.name);
    this.renderProperty(tbl, 'GENERAL_TITLE', res.title);
    this.renderProperty(tbl, 'GENERAL_STATUS', res.status);
    this.renderPropertyMD(tbl, 'GENERAL_DEFINITION', res.description);
    this.renderProperty(tbl, 'CANON_REND_PUBLISHER', res.publisher);
    this.renderProperty(tbl, 'CANON_REND_COMMITTEE', Extensions.readString(res, 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg'));
    this.renderProperty(tbl, 'GENERAL_COPYRIGHT', res.copyright);
    this.renderProperty(tbl, 'EXT_FMM_LEVEL', Extensions.readString(res, 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm'));
    this.renderProperty(tbl, 'PAT_PERIOD', res.effectivePeriod);

    // capability statement things
    this.renderProperty(tbl, 'Kind', res.kind);
    if (res.software?.name) {
      let s = res.software.name;
      if (res.software.version) {
        s = s+" v"+res.software.version;
        this.renderProperty(tbl, 'Software', s);
      }
    }
    this.renderProperty(tbl, 'GENERAL_URL', res.implementation?.url);
    this.renderProperty(tbl, 'Kind', res.kind);
    this.renderProperty(tbl, 'EX_SCEN_FVER', res.fhirVersion);

    if (res.content === 'supplement' && res.supplements) {
      const tr = tbl.tr();
      tr.td().b().tx(this.translate('CODESYSTEM_SUPPLEMENTS'));
      await this.renderLink(tr.td(), res.supplements);
    }

    if (res.valueSet) {
      const tr = tbl.tr();
      tr.td().b().tx(this.translate('GENERAL_VALUESET'));
      await this.renderLink(tr.td(), res.valueSet);
    }
  }

  async renderMetadataProfiles(res, tbl) {
    if (res.meta?.profile) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate('GENERAL_PROF'));
      if (res.meta.profile.length > 1) {
        let ul = tr.td();
        for (let u of res.meta.profile) {
          await this.renderLink(ul.li(), u);
        }
      } else {
        await this.renderLink(tr.td(), res.meta.profile[0]);
      }
    }
  }

  renderMetadataTags(res, tbl) {
    if (res.meta?.tag) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate('GENERAL_PROF'));
      if (res.meta.tag.length > 1) {
        let ul = tr.td();
        for (let u of res.meta.tag) {
          this.renderCoding(ul.li(), u);
        }
      } else {
        this.renderCoding(tr.td(), res.meta.tag[0]);
      }
    }
  }

  renderMetadataLabels(res, tbl) {
    if (res.meta?.label) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate('GENERAL_PROF'));
      if (res.meta.label.length > 1) {
        let ul = tr.td();
        for (let u of res.meta.label) {
          this.renderCodin(ul.li(), u);
        }
      } else {
        this.renderCoding(tr.td(), res.meta.label[0]);
      }
    }
  }

  renderMetadataVersion(res, tbl) {
    if (res.meta?.version) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate('RES_REND_VER'));
      tr.td().tx(res.meta.version);
    }
  }

  renderMetadataLastUpdated(res, tbl) {
    if (res.meta?.version) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate('RES_REND_UPDATED'));
      tr.td().tx(this.displayDate(res.meta.version));
    }
  }

  renderProperty(tbl, msgId, value) {
    if (value) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate(msgId));
      if (value instanceof Object) {
        tr.td().tx("todo");
      } else {
        tr.td().tx(value);
      }
    }
  }

  async renderPropertyLink(tbl, msgId, value) {
    if (value) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate(msgId));
      const linkinfo = await this.linkResolver.resolveURL(this.opContext, value);
      if (linkinfo) {
        tr.td().ah(linkinfo.link).tx(linkinfo.description);
      } else {
        tr.td().tx(value);
      }
    }
  }

  renderPropertyMD(tbl, msgId, value) {
    if (value) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate(msgId));
      if (value instanceof Object) {
        tr.td().tx("todo");
      } else {
        tr.td().markdown(value);
      }
    }
  }

  renderMetadataSource(res, tbl) {
    if (res.meta?.source) {
      let tr = tbl.tr();
      tr.td().b().tx(this.translate('RES_REND_INFO_SOURCE'));
      tr.td().tx(res.meta.source);
    }
  }

  async renderLink(x, uri) {
    const result = this.linkResolver ? await this.linkResolver.resolveURL(this.opContext, uri) : null;
    if (result) {
      x.ah(result.link).tx(result.description);
    } else {
      x.code().tx(uri);
    }
  }

  renderLinkComma(x, uri) {
    let {desc, url} = this.linkResolver ? this.linkResolver.resolveURL(this.opContext, uri) : null;
    if (url) {
      x.commaItem(desc, url);
    } else {
      x.commaItem(uri);
    }
  }


  async renderCoding(x, coding) {
    let {
      desc,
      url
    } = this.linkResolver ? await this.linkResolver.resolveCode(this.opContext, coding.system, coding.version, coding.code) : null;
    if (url) {
      x.ah(url).tx(desc);
    } else {
      x.code(coding.code);
    }
  }

  translate(msgId) {
    return this.opContext.i18n.formatPhrase(msgId, this.opContext.langs, []);
  }

  translatePlural(num, msgId) {
    return this.opContext.i18n.formatPhrasePlural(msgId, this.opContext.langs, num,[]);
  }

  async renderValueSet(vs) {
    if (vs.json) {
      vs = vs.json;
    }

    let div_ = div();
    div_.h2().tx("Properties");
    let tbl = div_.table("grid");
    await this.renderMetadataTable(vs, tbl);
    if (vs.compose) {
      div_.h2().tx("Logical Definition");
      await this.renderCompose(vs, div_.table("grid"));
    }
    if (vs.expansion) {
      div_.h2().tx("Expansion");
      await this.renderExpansion(div_.table("grid"), vs, tbl);
    }

    return div_.toString();
  }

  async renderCodeSystem(cs) {
    if (cs.json) {
      cs = cs.json;
    }

    let div_ = div();

    // Metadata table
    div_.h3().tx("Properties");
    await this.renderMetadataTable(cs, div_.table("grid"));

    // Code system properties
    const hasProps = this.generateProperties(div_, cs);

    // Filters
    this.generateFilters(div_, cs);

    // Concepts
    await this.generateCodeSystemContent(div_, cs, hasProps);

    return div_.toString();
  }

  async renderCompose(vs, x) {
    let supplements = Extensions.list(vs, 'http://hl7.org/fhir/StructureDefinition/valueset-supplement');
    if (supplements && supplements.length > 0) {
      let p = x.para();
      p.tx(this.translatePlural(supplements.length, 'VALUE_SET_NEEDS_SUPPL'));
      p.tx(" ");
      p.startCommaList("and");
      for (let ext of supplements) {
        this.renderLinkComma(p, ext);
      }
      p.stopCommaList();
      p.tx(".");
    }
    let parameters = Extensions.list(vs, 'http://hl7.org/fhir/tools/StructureDefinition/valueset-parameter');
    if (parameters && parameters.length > 0) {
      x.para().b().tx("This ValueSet has parameters");
      const tbl = x.table("grid");
      const tr = tbl.tr();
      tr.th().tx("Name");
      tr.th().tx("Documentation");
      for (let ext of parameters) {
        const tr = tbl.tr();
        tr.td().tx(Extensions.readValue(ext, "name"));
        tr.td().markdown(Extensions.readValue(ext, "documentation"));
      }
    }
    let comp = vs.compose;
    if (comp.include) {
      let p = x.para();
      p.tx(this.translatePlural(supplements.length, 'VALUE_SET_RULES_INC'));
      let ul = x.ul();
      for (let inc of comp.include) {
        await this.renderInclude(ul.li(), inc);
      }
    }
    if (comp.exclude) {
      let p = x.para();
      p.tx(this.translatePlural(supplements.length, 'VALUE_SET_RULES_EXC'));
      let ul = x.ul();
      for (let inc of comp.exclude) {
        await this.renderInclude(ul.li(), inc);
      }
    }
  }

  async renderInclude(li, inc) {
    if (inc.system) {
      if (!inc.concept && !inc.filter) {
        li.tx(this.translate('VALUE_SET_ALL_CODES_DEF')+" ");
        await this.renderLink(li,inc.system+(inc.version ? "|"+inc.version : ""));
      } else if (inc.concept) {
        li.tx(this.translate('VALUE_SET_THESE_CODES_DEF'));
        await this.renderLink(li,inc.system+(inc.version ? "|"+inc.version : ""));
        li.tx(":");
        const ul = li.ul();
        for (let c of inc.concept) {
          const li = ul.li();
          const link = this.linkResolver ? await this.linkResolver.resolveCode(this.opContext, inc.system, inc.version, c.code) : null;
          if (link) {
            li.ah(link.link).tx(c.code);
          } else {
            li.tx(c.code);
          }
          if (c.display) {
            li.tx(": "+c.display);
          } else if (link) {
            li.span("opaque: 0.5").tx(": "+link.description);
          }
        }
      } else {
        li.tx(this.translate('VALUE_SET_CODES_FROM'));
        await this.renderLink(li,inc.system+(inc.version ? "|"+inc.version : ""));
        li.tx(" "+ this.translate('VALUE_SET_WHERE')+" ");
        li.startCommaList("and");
        for (let f of inc.filter) {
          if (f.op == 'exists') {
            if (f.value == "true") {
              li.commaItem(f.property+" "+ this.translate('VALUE_SET_EXISTS'));
            } else {
              li.commaItem(f.property+" "+ this.translate('VALUE_SET_DOESNT_EXIST'));
            }
          } else {
            li.commaItem(f.property + " " + f.op + " ");
            const loc = this.linkResolver ? await this.linkResolver.resolveCode(this.opContext, inc.system, inc.version, f.value) : null;
            if (loc) {
              li.ah(loc.link).tx(loc.description);
            } else {
              li.tx(f.value);
            }
          }
        }
        li.stopCommaList();
      }
    } else {
      li.tx(this.translatePlural(inc.valueSet.length, 'VALUE_SET_RULES_INC'));
      li.startCommaList("and");
      for (let vs of inc.valueSet) {
        this.renderLinkComma(li, vs);
      }
      li.stopCommaList();
    }
  }

  generateProperties(x, cs) {
    if (!cs.property || cs.property.length === 0) {
      return false;
    }

    // Check what columns we need
    let hasURI = false;
    let hasDescription = false;

    for (const p of cs.property) {
      hasURI = hasURI || !!p.uri;
      hasDescription = hasDescription || !!p.description;
    }

    x.para().b().tx(this.translate('GENERAL_PROPS'));
    x.para().tx(this.translate('CODESYSTEM_PROPS_DESC'));

    const tbl = x.table("grid");
    const tr = tbl.tr();
    tr.th().tx(this.translate('GENERAL_CODE'));
    if (hasURI) {
      tr.th().tx(this.translate('GENERAL_URI'));
    }
    tr.th().tx(this.translate('GENERAL_TYPE'));
    if (hasDescription) {
      tr.th().tx(this.translate('GENERAL_DESC'));
    }

    for (const p of cs.property) {
      const row = tbl.tr();
      row.td().tx(p.code);
      if (hasURI) {
        row.td().tx(p.uri || '');
      }
      row.td().tx(p.type || '');
      if (hasDescription) {
        row.td().tx(p.description || '');
      }
    }

    return true;
  }

  generateFilters(x, cs) {
    if (!cs.filter || cs.filter.length === 0) {
      return;
    }

    x.para().b().tx(this.translate('CODESYSTEM_FILTERS'));

    const tbl = x.table("grid");
    const tr = tbl.tr();
    tr.th().tx(this.translate('GENERAL_CODE'));
    tr.th().tx(this.translate('GENERAL_DESC'));
    tr.th().tx(this.translate('CODESYSTEM_FILTER_OP'));
    tr.th().tx(this.translate('GENERAL_VALUE'));

    for (const f of cs.filter) {
      const row = tbl.tr();
      row.td().tx(f.code);
      row.td().tx(f.description || '');
      row.td().tx(f.operator ? f.operator.join(' ') : '');
      row.td().tx(f.value || '');
    }
  }

  async generateCodeSystemContent(x, cs, hasProps) {
    if (hasProps) {
      x.para().b().tx(this.translate('CODESYSTEM_CONCEPTS'));
    }

    const p = x.para();
    p.startScript("csc");
    p.param("cs").code().tx(cs.url);
    this.makeCasedParam(p.param("cased"), cs, cs.caseSensitive);
    this.makeHierarchyParam(p.param("h"), cs, cs.hierarchyMeaning);
    p.paramValue("code-count", this.countConcepts(cs.concept));
    p.execScript(this.sentenceForContent(cs.content, cs));
    p.closeScript();

    if (cs.content === 'not-present') {
      return;
    }

    if (!cs.concept || cs.concept.length === 0) {
      return;
    }

    // Determine table columns needed
    const columnInfo = this.analyzeConceptColumns(cs);

    // Build the concepts table
    const tbl = x.table("codes");

    // Header row
    const headerRow = tbl.tr();
    if (columnInfo.hasHierarchy) {
      headerRow.th().tx(this.translate('CODESYSTEM_LVL'));
    }
    headerRow.th().tx(this.translate('GENERAL_CODE'));
    if (columnInfo.hasDisplay) {
      headerRow.th().tx(this.translate('TX_DISPLAY'));
    }
    if (columnInfo.hasDefinition) {
      headerRow.th().tx(this.translate('GENERAL_DEFINITION'));
    }
    if (columnInfo.hasDeprecated) {
      headerRow.th().tx(this.translate('CODESYSTEM_DEPRECATED'));
    }

    // Property columns
    for (const prop of columnInfo.properties) {
      headerRow.th().tx(this.getDisplayForProperty(prop) || prop.code);
    }

    // Render concepts recursively
    for (const concept of cs.concept) {
      await this.addConceptRow(tbl, concept, 0, cs, columnInfo);
    }
  }

  makeCasedParam(x, cs, caseSensitive) {
    if (caseSensitive) {
      let s = caseSensitive ? "case-sensitive" : "case-insensitive";
      x.tx(s);
    } else {
      x.tx("");
    }
  }

  makeHierarchyParam(x, cs, hm) {
    if (hm) {
      let s = hm; // look it up?
      x.tx(" "+this.translate('CODE_SYS_IN_A_HIERARCHY', [s]));
    } else if ((cs.concept || []).find(c => (c.concept || []).length > 0)) {
      x.tx(" "+ this.translate('CODE_SYS_UNDEF_HIER'));
    }
  }

  analyzeConceptColumns(cs) {
    const info = {
      hasHierarchy: false,
      hasDisplay: false,
      hasDefinition: false,
      hasDeprecated: false,
      hasComment: false,
      properties: []
    };

    // Check which properties are actually used
    const usedProperties = new Set();

    const analyzeConceptList = (concepts) => {
      for (const c of concepts) {
        if (c.display && c.display !== c.code) {
          info.hasDisplay = true;
        }
        if (c.definition) {
          info.hasDefinition = true;
        }
        if (c.concept && c.concept.length > 0) {
          info.hasHierarchy = true;
          analyzeConceptList(c.concept);
        }

        // Check for deprecated
        if (this.isDeprecated(c)) {
          info.hasDeprecated = true;
        }

        // Track used properties
        if (c.property) {
          for (const prop of c.property) {
            usedProperties.add(prop.code);
          }
        }
      }
    };

    analyzeConceptList(cs.concept || []);

    // Filter to properties that are actually used
    if (cs.property) {
      for (const prop of cs.property) {
        if (usedProperties.has(prop.code) && this.showPropertyInTable(prop)) {
          info.properties.push(prop);
        }
      }
    }

    return info;
  }

  showPropertyInTable(prop) {
    // Skip certain internal properties
    const skipCodes = ['status', 'inactive', 'deprecated', 'notSelectable'];
    return !skipCodes.includes(prop.code);
  }

  getDisplayForProperty(prop) {
    // Could look up a display name for well-known properties
    return prop.description || prop.code;
  }

  isDeprecated(concept) {
    if (concept.property) {
      for (const prop of concept.property) {
        if ((prop.code === 'status' && prop.valueCode === 'deprecated') ||
            (prop.code === 'deprecated' && prop.valueBoolean === true) ||
            (prop.code === 'inactive' && prop.valueBoolean === true)) {
          return true;
        }
      }
    }
    return false;
  }

  async addConceptRow(tbl, concept, level, cs, columnInfo) {
    const tr = tbl.tr();

    // Apply styling for deprecated concepts
    if (this.isDeprecated(concept)) {
      tr.style("background-color: #ffeeee");
    }

    // Level column
    if (columnInfo.hasHierarchy) {
      tr.td().tx(String(level + 1));
    }

    // Code column
    const codeTd = tr.td();
    if (level > 0) {
      codeTd.tx('\u00A0'.repeat(level * 2)); // Non-breaking spaces for indentation
    }

    // Link code if it's a supplement
    if (cs.content === 'supplement' && cs.supplements) {
      const link = this.linkResolver ?
          await this.linkResolver.resolveCode(this.opContext, cs.supplements, null, concept.code) : null;
      if (link) {
        codeTd.ah(link.link).tx(concept.code);
      } else {
        codeTd.tx(concept.code);
      }
    } else {
      codeTd.code().tx(concept.code);
    }
    codeTd.an(concept.code);

    // Display column
    if (columnInfo.hasDisplay) {
      tr.td().tx(concept.display || '');
    }

    // Definition column
    if (columnInfo.hasDefinition) {
      tr.td().tx(concept.definition || '');
    }

    // Deprecated column
    if (columnInfo.hasDeprecated) {
      const td = tr.td();
      if (this.isDeprecated(concept)) {
        td.tx(this.translate('CODESYSTEM_DEPRECATED_TRUE'));

        // Check for replacement
        const replacedBy = this.getPropertyValue(concept, 'replacedBy');
        if (replacedBy) {
          td.tx(' ' + this.translate('CODESYSTEM_REPLACED_BY') + ' ');
          td.code().tx(replacedBy);
        }
      }
    }

    // Property columns
    for (const prop of columnInfo.properties) {
      const td = tr.td();
      const values = this.getPropertyValues(concept, prop.code);

      let first = true;
      for (const val of values) {
        if (!first) {
          td.tx(', ');
        }
        first = false;

        await this.renderPropertyValue(td, val, prop, cs);
      }
    }

    // Recurse for child concepts
    if (concept.concept) {
      for (const child of concept.concept) {
        await this.addConceptRow(tbl, child, level + 1, cs, columnInfo);
      }
    }
  }

  getPropertyValue(concept, code) {
    if (!concept.property) return null;
    const prop = concept.property.find(p => p.code === code);
    return prop ? this.extractPropertyValue(prop) : null;
  }

  getPropertyValues(concept, code) {
    if (!concept.property) return [];
    return concept.property
        .filter(p => p.code === code)
        .map(p => this.extractPropertyValue(p))
        .filter(v => v !== null);
  }

  extractPropertyValue(prop) {
    if (prop.valueCode !== undefined) return { type: 'code', value: prop.valueCode };
    if (prop.valueString !== undefined) return { type: 'string', value: prop.valueString };
    if (prop.valueBoolean !== undefined) return { type: 'boolean', value: prop.valueBoolean };
    if (prop.valueInteger !== undefined) return { type: 'integer', value: prop.valueInteger };
    if (prop.valueDecimal !== undefined) return { type: 'decimal', value: prop.valueDecimal };
    if (prop.valueDateTime !== undefined) return { type: 'dateTime', value: prop.valueDateTime };
    if (prop.valueCoding !== undefined) return { type: 'coding', value: prop.valueCoding };
    return null;
  }

  async renderPropertyValue(td, val, propDef, cs) {
    if (!val) return;

    switch (val.type) {
      case 'code': {
        // If it's a parent reference, link to it
        if (propDef.code === 'parent' || propDef.code === 'child') {
          td.ah('#' + cs.id + '-' + val.value).tx(val.value);
        } else {
          td.code().tx(val.value);
        }
        break;
      }
      case 'coding': {
        const coding = val.value;
        const link = this.linkResolver ?
            await this.linkResolver.resolveCode(this.opContext, coding.system, coding.version, coding.code) : null;
        if (link) {
          td.ah(link.link).tx(coding.code);
        } else {
          td.tx(coding.code);
        }
        if (coding.display) {
          td.tx(' "' + coding.display + '"');
        }
        break;
      }
      case 'boolean': {
        td.tx(val.value ? 'true' : 'false');
        break;
      }
      case 'string': {
        // Check if it's a URL
        if (val.value.startsWith('http://') || val.value.startsWith('https://')) {
          td.ah(val.value).tx(val.value);
        } else {
          td.tx(val.value);
        }
        break;
      }
      default:
        td.tx(String(val.value));
    }
  }

  sentenceForContent(mode, cs) {
    switch (mode) {
      case 'complete':
        return this.translate('CODESYSTEM_CONTENT_COMPLETE');
      case 'example':
        return this.translate('CODESYSTEM_CONTENT_EXAMPLE');
      case 'fragment':
        return this.translate('CODESYSTEM_CONTENT_FRAGMENT');
      case 'not-present':
        return this.translate('CODESYSTEM_CONTENT_NOTPRESENT');
      case 'supplement': {
        const hasProperties = cs.property && cs.property.length > 0;
        const hasDesignations = this.hasDesignations(cs);
        let features;
        if (hasProperties && hasDesignations) {
          features = this.translate('CODE_SYS_DISP_PROP');
        } else if (hasProperties) {
          features = this.translate('CODE_SYS_PROP');
        } else if (hasDesignations) {
          features = this.translate('CODE_SYS_DISP');
        } else {
          features = this.translate('CODE_SYS_FEAT');
        }
        return this.translate('CODESYSTEM_CONTENT_SUPPLEMENT', [features]);
      }
      default:
        return this.translate('CODESYSTEM_CONTENT_NOTPRESENT');
    }
  }

  hasDesignations(cs) {
    const checkConcepts = (concepts) => {
      for (const c of concepts) {
        if (c.designation && c.designation.length > 0) {
          return true;
        }
        if (c.concept && checkConcepts(c.concept)) {
          return true;
        }
      }
      return false;
    };
    return checkConcepts(cs.concept || []);
  }

  countConcepts(concepts) {
    if (!concepts) {
      return 0;
    }
    let count = concepts.length;
    for (const c of concepts) {
      if (c.concept) {
        count += this.countConcepts(c.concept);
      }
    }
    return count;
  }

  async renderExpansion(x, vs, tbl) {
    this.renderProperty(tbl, 'Expansion Identifier', vs.expansion.identifier);
    this.renderProperty(tbl, 'Expansion Timestamp', vs.expansion.timestamp);
    this.renderProperty(tbl, 'Expansion Total', vs.expansion.total);
    this.renderProperty(tbl, 'Expansion Offset', vs.expansion.offset);
    for (let p of vs.expansion.parameter || []) {
      await this.renderPropertyLink(tbl, "Parameter: " + p.name, getValuePrimitive(p));
    }

    if (!vs.expansion.contains || vs.expansion.contains.length === 0) {
      x.para().i().tx('No concepts in expansion');
      return;
    }

    // Analyze columns needed
    const columnInfo = this.analyzeExpansionColumns(vs.expansion);

    // Build the expansion table
    const expTbl = x.table("codes");

    // Header row
    const headerRow = expTbl.tr();

    if (columnInfo.hasHierarchy) {
      headerRow.th().tx(this.translate('CODESYSTEM_LVL'));
    }
    headerRow.th().tx(this.translate('GENERAL_CODE'));
    headerRow.th().tx(this.translate('VALUE_SET_SYSTEM'));
    if (columnInfo.hasVersion) {
      headerRow.th().tx(this.translate('GENERAL_VER'));
    }
    headerRow.th().tx(this.translate('TX_DISPLAY'));
    if (columnInfo.hasAbstract) {
      headerRow.th().tx('Abstract');
    }
    if (columnInfo.hasInactive) {
      headerRow.th().tx('Inactive');
    }

    // Property columns (from expansion.property definitions)
    for (const prop of columnInfo.properties) {
      headerRow.th().tx(prop.code);
    }

    // Designation columns (use|language combinations)
    for (const desig of columnInfo.designations) {
      headerRow.th().tx(this.formatDesignationHeader(desig));
    }

    // Render contains recursively
    for (const contains of vs.expansion.contains) {
      await this.addExpansionRow(expTbl, contains, 0, columnInfo);
    }
  }

  /**
   * Analyze expansion contains to determine which columns are needed
   */
  analyzeExpansionColumns(expansion) {
    const info = {
      hasHierarchy: false,
      hasVersion: false,
      hasAbstract: false,
      hasInactive: false,
      properties: [],
      designations: []
    };

    // Build map of property codes from expansion.property
    const propertyDefs = new Map();
    for (const prop of expansion.property || []) {
      propertyDefs.set(prop.code, prop);
    }

    // Track which properties and designations are actually used
    const usedProperties = new Set();
    const usedDesignations = new Map(); // key: "use|language", value: {use, language}

    const analyzeContains = (containsList, level) => {
      for (const c of containsList) {
        if (c.version) {
          info.hasVersion = true;
        }
        if (c.abstract === true) {
          info.hasAbstract = true;
        }
        if (c.inactive === true) {
          info.hasInactive = true;
        }

        // Check for nested contains (hierarchy)
        if (c.contains && c.contains.length > 0) {
          info.hasHierarchy = true;
          analyzeContains(c.contains, level + 1);
        }

        // Track used properties
        if (c.property) {
          for (const prop of c.property) {
            usedProperties.add(prop.code);
          }
        }

        // Track used designations
        if (c.designation) {
          for (const desig of c.designation) {
            const key = this.getDesignationKey(desig);
            if (!usedDesignations.has(key)) {
              usedDesignations.set(key, {
                use: desig.use,
                language: desig.language
              });
            }
          }
        }
      }
    };

    analyzeContains(expansion.contains || [], 0);

    // Filter to properties that are defined and used
    for (const [code, def] of propertyDefs) {
      if (usedProperties.has(code)) {
        info.properties.push(def);
      }
    }

    // Convert designation map to array, sorted for consistent ordering
    info.designations = Array.from(usedDesignations.values()).sort((a, b) => {
      const keyA = this.getDesignationKey(a);
      const keyB = this.getDesignationKey(b);
      return keyA.localeCompare(keyB);
    });

    return info;
  }

  /**
   * Get a unique key for a designation based on use and language
   */
  getDesignationKey(desig) {
    const useCode = desig.use?.code || '';
    const useSystem = desig.use?.system || '';
    const lang = desig.language || '';
    return `${useSystem}|${useCode}|${lang}`;
  }

  /**
   * Format a designation header for display
   */
  formatDesignationHeader(desig) {
    const parts = [];
    if (desig.use?.display) {
      parts.push(desig.use.display);
    } else if (desig.use?.code) {
      parts.push(desig.use.code);
    }
    if (desig.language) {
      parts.push(`(${desig.language})`);
    }
    return parts.length > 0 ? parts.join(' ') : 'Designation';
  }

  /**
   * Add a row for an expansion contains entry
   */
  async addExpansionRow(tbl, contains, level, columnInfo) {
    const tr = tbl.tr();

    // Apply styling for abstract or inactive concepts
    if (contains.abstract === true) {
      tr.style("font-style: italic");
    }
    if (contains.inactive === true) {
      tr.style("background-color: #ffeeee");
    }

    // Level column
    if (columnInfo.hasHierarchy) {
      tr.td().tx(String(level + 1));
    }

    // Code column
    const codeTd = tr.td();
    if (level > 0) {
      codeTd.tx('\u00A0'.repeat(level * 2)); // Non-breaking spaces for indentation
    }

    // Try to link the code
    if (contains.code) {
      const link = this.linkResolver ?
          await this.linkResolver.resolveCode(this.opContext, contains.system, contains.version, contains.code) : null;
      if (link) {
        codeTd.ah(link.link).tx(contains.code);
      } else {
        codeTd.code().tx(contains.code);
      }
    }

    // System column
    const systemTd = tr.td();
    if (contains.system) {
      systemTd.code().tx(contains.system);
    }

    // Version column
    if (columnInfo.hasVersion) {
      tr.td().tx(contains.version || '');
    }

    // Display column
    tr.td().tx(contains.display || '');

    // Abstract column
    if (columnInfo.hasAbstract) {
      tr.td().tx(contains.abstract === true ? 'true' : '');
    }

    // Inactive column
    if (columnInfo.hasInactive) {
      tr.td().tx(contains.inactive === true ? 'true' : '');
    }

    // Property columns
    for (const propDef of columnInfo.properties) {
      const td = tr.td();
      const values = this.getContainsPropertyValues(contains, propDef.code);

      let first = true;
      for (const val of values) {
        if (!first) {
          td.tx(', ');
        }
        first = false;
        await this.renderExpansionPropertyValue(td, val, propDef);
      }
    }

    // Designation columns
    for (const desigDef of columnInfo.designations) {
      const td = tr.td();
      const value = this.getDesignationValue(contains, desigDef);
      if (value) {
        td.tx(value);
      }
    }

    // Recurse for nested contains
    if (contains.contains) {
      for (const child of contains.contains) {
        await this.addExpansionRow(tbl, child, level + 1, columnInfo);
      }
    }
  }

  /**
   * Get property values from a contains entry
   */
  getContainsPropertyValues(contains, code) {
    if (!contains.property) return [];
    return contains.property
        .filter(p => p.code === code)
        .map(p => this.extractExpansionPropertyValue(p))
        .filter(v => v !== null);
  }

  /**
   * Extract the value from an expansion property
   */
  extractExpansionPropertyValue(prop) {
    if (prop.valueCode !== undefined) return { type: 'code', value: prop.valueCode };
    if (prop.valueString !== undefined) return { type: 'string', value: prop.valueString };
    if (prop.valueBoolean !== undefined) return { type: 'boolean', value: prop.valueBoolean };
    if (prop.valueInteger !== undefined) return { type: 'integer', value: prop.valueInteger };
    if (prop.valueDecimal !== undefined) return { type: 'decimal', value: prop.valueDecimal };
    if (prop.valueDateTime !== undefined) return { type: 'dateTime', value: prop.valueDateTime };
    if (prop.valueCoding !== undefined) return { type: 'coding', value: prop.valueCoding };
    return null;
  }

  /**
   * Render an expansion property value
   */
  // eslint-disable-next-line no-unused-vars
  async renderExpansionPropertyValue(td, val, propDef) {
    if (!val) return;

    switch (val.type) {
      case 'code': {
        td.code().tx(val.value);
        break;
      }
      case 'coding': {
        const coding = val.value;
        const link = this.linkResolver ?
            await this.linkResolver.resolveCode(this.opContext, coding.system, coding.version, coding.code) : null;
        if (link) {
          td.ah(link.link).tx(coding.code);
        } else {
          td.code().tx(coding.code);
        }
        if (coding.display) {
          td.tx(' "' + coding.display + '"');
        }
        break;
      }
      case 'boolean': {
        td.tx(val.value ? 'true' : 'false');
        break;
      }
      case 'string': {
        if (val.value.startsWith('http://') || val.value.startsWith('https://')) {
          td.ah(val.value).tx(val.value);
        } else {
          td.tx(val.value);
        }
        break;
      }
      default:
        td.tx(String(val.value));
    }
  }

  /**
   * Get a designation value matching the given use/language
   */
  getDesignationValue(contains, desigDef) {
    if (!contains.designation) return null;

    for (const desig of contains.designation) {
      // Match on use and language
      const useMatches = this.codingMatches(desig.use, desigDef.use);
      const langMatches = (desig.language || '') === (desigDef.language || '');

      if (useMatches && langMatches) {
        return desig.value;
      }
    }
    return null;
  }

  /**
   * Check if two codings match (both null, or same system/code)
   */
  codingMatches(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (a.system || '') === (b.system || '') && (a.code || '') === (b.code || '');
  }

  async renderCapabilityStatement(cs) {
    if (cs.json) {
      cs = cs.json;
    }

    let div_ = div();

    // Metadata table
    div_.h3().tx("Properties");
    await this.renderMetadataTable(cs, div_.table("grid"));

    // Formats
    if (cs.format && cs.format.length > 0) {
      div_.h3().tx(this.translate('Formats') || 'Formats');
      div_.para().tx(cs.format.join(', '));
    }

    // Implementation Guides
    if (cs.implementationGuide && cs.implementationGuide.length > 0) {
      div_.h3().tx(this.translate('CAPABILITY_IMP_GUIDES') || 'Implementation Guides');
      const ul = div_.ul();
      for (const ig of cs.implementationGuide) {
        await this.renderLink(ul.li(), ig);
      }
    }

    // REST definitions
    if (cs.rest && cs.rest.length > 0) {
      for (const rest of cs.rest) {
        await this.renderCapabilityRest(div_, rest, cs);
      }
    }

    return div_.toString();
  }

  async renderCapabilityRest(x, rest) {
    x.h3().tx(`REST ${rest.mode || 'server'} Definition`);

    if (rest.documentation) {
      x.para().markdown(rest.documentation);
    }

    // Security
    if (rest.security) {
      await this.renderCapabilitySecurity(x, rest.security);
    }

    // Resources table
    if (rest.resource && rest.resource.length > 0) {
      await this.renderCapabilityResources(x, rest);
    }

    // System-level operations
    if (rest.operation && rest.operation.length > 0) {
      x.h4().tx(this.translate('CAPABILITY_OP') || 'System Operations');
      const ul = x.ul();
      for (const op of rest.operation) {
        const li = ul.li();
        if (op.definition) {
          li.ah(op.definition).tx(op.name);
        } else {
          li.tx(op.name);
        }
        if (op.documentation) {
          li.tx(': ');
          li.tx(op.documentation);
        }
      }
    }

    // Compartments
    if (rest.compartment && rest.compartment.length > 0) {
      x.h4().tx(this.translate('CAPABILITY_COMPARTMENTS') || 'Compartments');
      const ul = x.ul();
      for (const comp of rest.compartment) {
        await this.renderLink(ul.li(), comp);
      }
    }
  }

  async renderCapabilitySecurity(x, security) {
    x.h4().tx('Security');

    const tbl = x.table("grid");

    if (security.cors !== undefined) {
      const tr = tbl.tr();
      tr.td().b().tx('CORS');
      tr.td().tx(security.cors ? 'enabled' : 'disabled');
    }

    if (security.service && security.service.length > 0) {
      const tr = tbl.tr();
      tr.td().b().tx(this.translate('CAPABILITY_SEC_SERVICES') || 'Security Services');
      const td = tr.td();
      let first = true;
      for (const svc of security.service) {
        if (!first) {
          td.tx(', ');
        }
        first = false;
        // Render CodeableConcept - prefer text, then first coding display, then first coding code
        if (svc.text) {
          td.tx(svc.text);
        } else if (svc.coding && svc.coding.length > 0) {
          const coding = svc.coding[0];
          td.tx(coding.display || coding.code || '');
        }
      }
    }

    if (security.description) {
      const tr = tbl.tr();
      tr.td().b().tx(this.translate('GENERAL_DESC') || 'Description');
      tr.td().markdown(security.description);
    }
  }

  async renderCapabilityResources(x, rest) {
    x.h4().tx('Resources');

    // Analyze what columns we need
    const columnInfo = this.analyzeCapabilityResourceColumns(rest.resource);

    const tbl = x.table("grid");

    // Header row
    const headerRow = tbl.tr();
    headerRow.th().tx(this.translate('GENERAL_TYPE') || 'Type');

    if (columnInfo.hasProfile) {
      headerRow.th().tx(this.translate('GENERAL_PROF') || 'Profile');
    }

    // Interaction columns
    for (const intCode of columnInfo.interactions) {
      headerRow.th().tx(intCode);
    }

    if (columnInfo.hasSearchParams) {
      headerRow.th().tx(this.translate('CAPABILITY_SEARCH_PARS') || 'Search Parameters');
    }

    if (columnInfo.hasOperations) {
      headerRow.th().tx(this.translate('CAPABILITY_OP') || 'Operations');
    }

    // Resource rows
    for (const resource of rest.resource) {
      await this.addCapabilityResourceRow(tbl, resource, columnInfo);
    }
  }

  analyzeCapabilityResourceColumns(resources) {
    const info = {
      hasProfile: false,
      interactions: new Set(),
      hasSearchParams: false,
      hasOperations: false
    };

    for (const res of resources) {
      if (res.profile) {
        info.hasProfile = true;
      }

      if (res.interaction) {
        for (const int of res.interaction) {
          info.interactions.add(int.code);
        }
      }

      if (res.searchParam && res.searchParam.length > 0) {
        info.hasSearchParams = true;
      }

      if (res.operation && res.operation.length > 0) {
        info.hasOperations = true;
      }
    }

    // Convert interactions to sorted array for consistent column ordering
    const interactionOrder = ['read', 'vread', 'update', 'patch', 'delete', 'history-instance', 'history-type', 'create', 'search-type'];
    info.interactions = interactionOrder.filter(i => info.interactions.has(i));

    // Add any other interactions not in our predefined order
    for (const res of resources) {
      if (res.interaction) {
        for (const int of res.interaction) {
          if (!info.interactions.includes(int.code)) {
            info.interactions.push(int.code);
          }
        }
      }
    }

    return info;
  }

  async addCapabilityResourceRow(tbl, resource, columnInfo) {
    const tr = tbl.tr();

    // Type column
    tr.td().b().tx(resource.type);

    // Profile column
    if (columnInfo.hasProfile) {
      const td = tr.td();
      if (resource.profile) {
        await this.renderLink(td, resource.profile);
      }
      // Also show supportedProfile if present
      if (resource.supportedProfile && resource.supportedProfile.length > 0) {
        if (resource.profile) {
          td.br();
          td.tx('Also: ');
        }
        let first = true;
        for (const sp of resource.supportedProfile) {
          if (!first) {
            td.tx(', ');
          }
          first = false;
          await this.renderLink(td, sp);
        }
      }
    }

    // Interaction columns - render checkmarks
    const supportedInteractions = new Set(
        (resource.interaction || []).map(i => i.code)
    );

    for (const intCode of columnInfo.interactions) {
      const td = tr.td();
      td.style("text-align: center");
      if (supportedInteractions.has(intCode)) {
        td.tx('✓');
      }
    }

    // Search parameters column
    if (columnInfo.hasSearchParams) {
      const td = tr.td();
      if (resource.searchParam && resource.searchParam.length > 0) {
        const paramNames = resource.searchParam.map(sp => sp.name);
        td.tx(paramNames.join(', '));
      }
    }

    // Operations column
    if (columnInfo.hasOperations) {
      const td = tr.td();
      if (resource.operation && resource.operation.length > 0) {
        let first = true;
        for (const op of resource.operation) {
          if (!first) {
            td.tx(', ');
          }
          first = false;
          if (op.definition) {
            td.ah(op.definition).tx(op.name);
          } else {
            td.tx(op.name);
          }
        }
      }
    }
  }

  async renderTerminologyCapabilities(tc) {
    if (tc.json) {
      tc = tc.json;
    }

    let div_ = div();

    // Metadata table
    div_.h3().tx("Properties");
    await this.renderMetadataTable(tc, div_.table("grid"));

    // Code Systems
    if (tc.codeSystem && tc.codeSystem.length > 0) {
      div_.h3().tx('Code Systems');
      const ul = div_.ul();
      for (const cs of tc.codeSystem) {
        if (cs.uri) {
          const li = ul.li();
          if (cs.version && cs.version.length > 0) {
            // List each version
            let first = true;
            for (const v of cs.version) {
              if (!first) {
                li.tx(', ');
              }
              first = false;
              const versionedUri = v.code ? `${cs.uri}|${v.code}` : cs.uri;
              await this.renderLink(li, versionedUri);
            }
          } else {
            // No versions specified
            await this.renderLink(li, cs.uri);
          }
        }
      }
    }

    return div_.toString();
  }
}

module.exports = { Renderer };
