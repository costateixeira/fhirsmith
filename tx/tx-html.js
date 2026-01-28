//
// TX HTML Rendering Module
//
// Renders FHIR resources as HTML for browser clients
//

const path = require('path');
const htmlServer = require('../common/html-server');
const Logger = require('../common/logger');
const packageJson = require("../package.json");
const { Liquid } = require('liquidjs');

const txHtmlLog = Logger.getInstance().child({ module: 'tx-html' });

const TEMPLATE_PATH = path.join(__dirname, 'html', 'tx-template.html');

// Search parameters for the search form
const SEARCH_PARAMS = [
  { name: 'url', type: 'text', label: 'URL' },
  { name: 'version', type: 'text', label: 'Version' },
  { name: 'name', type: 'text', label: 'Name' },
  { name: 'title', type: 'text', label: 'Title' },
  { name: 'status', type: 'select', label: 'Status', options: ['', 'draft', 'active', 'retired', 'unknown'] },
  { name: 'publisher', type: 'text', label: 'Publisher' },
  { name: 'description', type: 'text', label: 'Description' },
  { name: 'identifier', type: 'text', label: 'Identifier' },
  { name: 'jurisdiction', type: 'text', label: 'Jurisdiction' },
  { name: 'date', type: 'text', label: 'Date' }
];

const CODESYSTEM_PARAMS = [
  ...SEARCH_PARAMS,
  { name: 'content-mode', type: 'select', label: 'Content Mode', options: ['', 'not-present', 'example', 'fragment', 'complete', 'supplement'] },
  { name: 'supplements', type: 'text', label: 'Supplements' },
  { name: 'system', type: 'text', label: 'System' }
];

const SORT_OPTIONS = ['', 'id', 'url', 'version', 'date', 'name', 'vurl'];

const ELEMENT_OPTIONS = ['id', 'url', 'version', 'name', 'title', 'status', 'date', 'publisher', 'description'];

/**
 * Load the TX HTML template
 */
function loadTemplate() {
  try {
    const templateLoaded = htmlServer.loadTemplate('tx', TEMPLATE_PATH);
    if (!templateLoaded) {
      txHtmlLog.error('Failed to load TX HTML template');
    }
  } catch (error) {
    txHtmlLog.error(`Failed to load TX HTML template: ${error.message}`);
  }
}


class TxHtmlRenderer {
  renderer;
  liquid;

  constructor(renderer, liquid) {
    this.renderer = renderer;
    this.liquid = liquid;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    if (text === null || text === undefined) {
      return '';
    }
    if (typeof text !== 'string') {
      return String(text);
    }

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };

    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Render a page with the TX template
   */
  renderPage(title, content, endpoint, startTime) {
    const options = {
      version: packageJson.version,
      endpointpath: endpoint.path,
      fhirversion: endpoint.fhirVersion,
      ms: Date.now() - startTime
    };

    return htmlServer.renderPage('tx', title, content, options);
  }

  /**
   * Check if request accepts HTML
   */
  acceptsHtml(req) {
    const accept = req.headers.accept || '';
    return accept.includes('text/html');
  }

  /**
   * Build page title from JSON response
   */
  buildTitle(json, req) {
    if (req.path == "/") {
      return "Server Home";
    } else {
      const resourceType = json.resourceType || 'Response';

      if (resourceType === 'Bundle' && json.type === 'searchset') {
        // Extract the resource type being searched from self link or entries
        const selfLink = json.link?.find(l => l.relation === 'self')?.url || '';
        const typeMatch = selfLink.match(/\/(CodeSystem|ValueSet|ConceptMap)\?/);
        if (typeMatch) {
          return `Search: ${typeMatch[1]}`;
        }
        const firstEntry = json.entry?.[0]?.resource;
        const searchedType = firstEntry?.resourceType || 'Resources';
        return `Search: ${searchedType}`;
      }

      if (resourceType === 'OperationOutcome') {
        const severity = json.issue?.[0]?.severity || 'info';
        return `${severity.charAt(0).toUpperCase() + severity.slice(1)}`;
      }

      if (json.id) {
        return `${resourceType}/${json.id}`;
      }

      if (json.name) {
        return `${resourceType}: ${json.name}`;
      }

      return resourceType;
    }
  }

// eslint-disable-next-line no-unused-vars
  async buildSearchForm(req, mode, params) {
    const html = await this.liquid.renderFile('search-form', { baseUrl: this.escapeHtml(req.baseUrl) });
    return html;
  }

  async buildHomePage(req) {
    const provider = req.txProvider;

    let html = '';

    // ===== Summary Section =====

    // Calculate uptime
    const uptimeMs = Date.now() - provider.startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeDays = Math.floor(uptimeSeconds / 86400);
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeSecs = uptimeSeconds % 60;
    let uptimeStr = '';
    if (uptimeDays > 0) uptimeStr += `${uptimeDays}d `;
    if (uptimeHours > 0 || uptimeDays > 0) uptimeStr += `${uptimeHours}h `;
    if (uptimeMinutes > 0 || uptimeHours > 0 || uptimeDays > 0) uptimeStr += `${uptimeMinutes}m `;
    uptimeStr += `${uptimeSecs}s`;

    // Memory usage
    const memUsage = process.memoryUsage();
    const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
    const rssMB = (memUsage.rss / 1024 / 1024).toFixed(2);

    html += '<table class="grid">';
    html += '<tr>';
    html += `<td><strong>FHIR Version:</strong> ${this.escapeHtml(provider.getFhirVersion())}</td>`;
    html += `<td><strong>Uptime:</strong> ${this.escapeHtml(uptimeStr)}</td>`;
    html += `<td><strong>Request Count:</strong> ${provider.requestCount}</td>`;
    html += '</tr>';
    html += '<tr>';
    html += `<td><strong>Heap Used:</strong> ${heapUsedMB} MB</td>`;
    html += `<td><strong>Heap Total:</strong> ${heapTotalMB} MB</td>`;
    html += `<td><strong>Process Memory:</strong> ${rssMB} MB</td>`;
    html += '</tr>';

    // Count unique code systems
    const uniqueFactorySystems = new Set();
    for (const factory of provider.codeSystemFactories.values()) {
      uniqueFactorySystems.add(factory.system());
    }
    const uniqueCodeSystems = new Set();
    for (const cs of provider.codeSystems.values()) {
      uniqueCodeSystems.add(cs.url);
    }
    html += '<tr>';
    html += `<td><strong>CodeSystem #:</strong> ${new Set([...uniqueFactorySystems, ...uniqueCodeSystems]).size}</td>`;

    // Count value sets
    let totalValueSets = 0;
    for (const vsp of provider.valueSetProviders) {
      totalValueSets += vsp.vsCount();
    }
    html += `<td><strong>ValueSet #:</strong> ${totalValueSets || 'Unknown'}</td>`;

    let totalConceptMaps = 0;
    for (const cmp of provider.conceptMapProviders) {
      totalConceptMaps += cmp.cmCount();
    }
    html += `<td><strong>ConceptMap #:</strong> ${totalConceptMaps || 'Unknown'}</td>`;
    html += '</tr>';
    html += '</table>';

    html += '<hr/>';
    html += await this.buildSearchForm(req);

    // ===== Packages and Factories Section =====
    html += '<hr/><h3>Content Sources &amp; Code System Factories</h3>';

    // List content sources
    html += '<h6>Content Sources</h6>';
    if (provider.contentSources && provider.contentSources.length > 0) {
      const sorted = [...provider.contentSources].sort();
      html += '<ul>';
      for (const source of sorted) {
        html += `<li>${this.escapeHtml(source)}</li>`;
      }
      html += '</ul>';
    } else {
      html += '<p><em>No content sources available</em></p>';
    }

    // Code System Factories table
// Code System Factories table
    html += '<h6 class="mt-4">External CodeSystems</h6>';
    html += '<table class="grid">';
    html += '<thead><tr><th>Name</th><th>URI</th><th>Version</th><th>Use Count</th></tr></thead>';
    html += '<tbody>';

// Deduplicate factories and sort by system URL
    const seenFactories = new Set();
    const uniqueFactories = [];
    for (const factory of provider.codeSystemFactories.values()) {
      const key = factory.system() + '|' + (factory.version() || '');
      if (!seenFactories.has(key)) {
        seenFactories.add(key);
        uniqueFactories.push(factory);
      }
    }
    uniqueFactories.sort((a, b) => a.name().localeCompare(b.name()));

    for (const factory of uniqueFactories) {
      html += '<tr>';
      html += `<td>${this.escapeHtml(factory.name())}</td>`;
      html += `<td>${this.escapeHtml(factory.system())}</td>`;
      html += `<td>${this.escapeHtml(factory.version() || '-')}</td>`;
      html += `<td>${factory.useCount ? factory.useCount() : '-'}</td>`;
      html += '</tr>';
    }

    html += '</tbody></table>';
    html += '</div></div>';

    return html;
  }

  /**
   * Main render - determines what to render based on resource type
   */
  async render(json, req, inBundle = false) {
    if (req && req.path == "/") {
      return await this.buildHomePage(req);
    } else {
      try {
        const resourceType = json.resourceType;

        switch (resourceType) {
          case 'Parameters':
            return await this.renderParameters(json);
          case 'CodeSystem':
            return await this.renderCodeSystem(json, inBundle);
          case 'ValueSet':
            return await this.renderValueSet(json, inBundle);
          case 'ConceptMap':
            return await this.renderConceptMap(json, inBundle);
          case 'CapabilityStatement':
            return await this.renderCapabilityStatement(json, inBundle);
          case 'TerminologyCapabilities':
            return await this.renderTerminologyCapabilities(json, inBundle);
          case 'Bundle':
            return await this.renderBundle(json, req, inBundle);
          case 'OperationOutcome':
            return await this.renderOperationOutcome(json, req);
          case 'Operations':
            return await this.renderOperationsForm(json, req);
          default:
            return await this.renderGeneric(json, inBundle);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }

  /**
   * Render Parameters resource
   */
  async renderParameters(json) {
    let html = '<table class="table grid">';
    html += '<thead><tr><th>Name</th><th>Value</th></tr></thead>';
    html += '<tbody>';

    if (json.parameter && Array.isArray(json.parameter)) {
      for (const param of json.parameter) {
        html += await this.renderParameter(param);
      }
    }

    html += '</tbody></table>';

    // Collapsible JSON source
    const resourceId = this.generateResourceId();
    html += '<div class="json-source">';
    html += `<button type="button" class="btn btn-sm btn-outline-secondary" onclick="toggleJsonSource('${resourceId}')">`;
    html += 'Show JSON Source</button>';
    html += `<div id="${resourceId}" class="json-content" style="display: none; margin-top: 10px;">`;
    html += `<pre>${this.escapeHtml(JSON.stringify(json, null, 2))}</pre>`;
    html += '</div>';
    html += '</div>';

    return html;
  }

  /**
   * Render a single parameter row
   */
  async renderParameter(param) {
    let html = '<tr>';
    html += `<td>${this.escapeHtml(param.name || '')}</td>`;
    html += '<td>';
    html += await this.renderParameterValue(param);
    html += '</td>';
    html += '</tr>';
    return html;
  }

  /**
   * Render the value portion of a parameter
   */
  async renderParameterValue(param) {
    // Check for parts (nested parameters)
    if (param.part && Array.isArray(param.part)) {
      let html = '<ul>';
      for (const part of param.part) {
        html += '<li>';
        html += `<strong>${this.escapeHtml(part.name || '')}:</strong> `;
        html += await this.renderParameterValue(part);
        html += '</li>';
      }
      html += '</ul>';
      return html;
    }

    // Check for resource
    if (param.resource) {
      return await this.render(param.resource, null, true);
    }

    // Check for complex datatypes
    if (param.valueCoding) {
      return this.renderCoding(param.valueCoding);
    }
    if (param.valueCodeableConcept) {
      return this.renderCodeableConcept(param.valueCodeableConcept);
    }
    if (param.valueQuantity) {
      return this.renderQuantity(param.valueQuantity);
    }
    if (param.valueAttachment) {
      return this.renderAttachment(param.valueAttachment);
    }
    if (param.valueIdentifier) {
      return this.renderIdentifier(param.valueIdentifier);
    }
    if (param.valuePeriod) {
      return this.renderPeriod(param.valuePeriod);
    }

    // Primitive types
    if (param.valueString !== undefined) {
      return this.escapeHtml(param.valueString);
    }
    if (param.valueBoolean !== undefined) {
      return param.valueBoolean ? 'true' : 'false';
    }
    if (param.valueInteger !== undefined) {
      return this.escapeHtml(String(param.valueInteger));
    }
    if (param.valueDecimal !== undefined) {
      return this.escapeHtml(String(param.valueDecimal));
    }
    if (param.valueUri !== undefined) {
      return this.escapeHtml(param.valueUri);
    }
    if (param.valueUrl !== undefined) {
      return this.escapeHtml(param.valueUrl);
    }
    if (param.valueCanonical !== undefined) {
      return this.escapeHtml(param.valueCanonical);
    }
    if (param.valueCode !== undefined) {
      return `<code>${this.escapeHtml(param.valueCode)}</code>`;
    }
    if (param.valueDate !== undefined) {
      return this.escapeHtml(param.valueDate);
    }
    if (param.valueDateTime !== undefined) {
      return this.escapeHtml(param.valueDateTime);
    }
    if (param.valueTime !== undefined) {
      return this.escapeHtml(param.valueTime);
    }
    if (param.valueInstant !== undefined) {
      return this.escapeHtml(param.valueInstant);
    }

    return '<em>(empty)</em>';
  }

  /**
   * Render Coding datatype
   */
  async renderCoding(coding) {
    if (!coding) return '';

    let parts = [];
    if (coding.system) {
      parts.push(this.escapeHtml(coding.system));
    }
    if (coding.code) {
      parts.push(`<code>${this.escapeHtml(coding.code)}</code>`);
    }
    if (coding.display) {
      parts.push(`"${this.escapeHtml(coding.display)}"`);
    }
    if (coding.version) {
      parts.push(`(version: ${this.escapeHtml(coding.version)})`);
    }

    return parts.join(' | ') || '<em>(empty coding)</em>';
  }

  /**
   * Render CodeableConcept datatype
   */
  async renderCodeableConcept(cc) {
    if (!cc) return '';

    let html = '';

    if (cc.text) {
      html += `<strong>${this.escapeHtml(cc.text)}</strong>`;
    }

    if (cc.coding && Array.isArray(cc.coding) && cc.coding.length > 0) {
      if (cc.text) html += '<br/>';
      html += '<ul style="margin: 0; padding-left: 20px;">';
      for (const coding of cc.coding) {
        html += `<li>${this.renderCoding(coding)}</li>`;
      }
      html += '</ul>';
    }

    return html || '<em>(empty CodeableConcept)</em>';
  }

  /**
   * Render Quantity datatype
   */
  async renderQuantity(qty) {
    if (!qty) return '';

    let html = '';

    if (qty.comparator) {
      html += this.escapeHtml(qty.comparator) + ' ';
    }
    if (qty.value !== undefined) {
      html += this.escapeHtml(String(qty.value));
    }
    if (qty.unit) {
      html += ' ' + this.escapeHtml(qty.unit);
    } else if (qty.code) {
      html += ' ' + this.escapeHtml(qty.code);
    }
    if (qty.system) {
      html += ` <small>(${this.escapeHtml(qty.system)})</small>`;
    }

    return html || '<em>(empty Quantity)</em>';
  }

  /**
   * Render Attachment datatype
   */
  async renderAttachment(att) {
    if (!att) return '';

    let html = '';

    if (att.title) {
      html += `<strong>${this.escapeHtml(att.title)}</strong><br/>`;
    }
    if (att.contentType) {
      html += `Content-Type: ${this.escapeHtml(att.contentType)}<br/>`;
    }
    if (att.url) {
      html += `URL: <a href="${this.escapeHtml(att.url)}">${this.escapeHtml(att.url)}</a><br/>`;
    }
    if (att.size !== undefined) {
      html += `Size: ${this.escapeHtml(String(att.size))} bytes<br/>`;
    }
    if (att.language) {
      html += `Language: ${this.escapeHtml(att.language)}<br/>`;
    }
    if (att.data) {
      html += `<small>(base64 data present, ${att.data.length} chars)</small>`;
    }

    return html || '<em>(empty Attachment)</em>';
  }

  /**
   * Render Identifier datatype
   */
  async renderIdentifier(id) {
    if (!id) return '';

    let parts = [];

    if (id.use) {
      parts.push(`[${this.escapeHtml(id.use)}]`);
    }
    if (id.type && id.type.text) {
      parts.push(this.escapeHtml(id.type.text));
    }
    if (id.system) {
      parts.push(this.escapeHtml(id.system));
    }
    if (id.value) {
      parts.push(`<strong>${this.escapeHtml(id.value)}</strong>`);
    }
    if (id.period) {
      parts.push(this.renderPeriod(id.period));
    }

    return parts.join(' | ') || '<em>(empty Identifier)</em>';
  }

  /**
   * Render Period datatype
   */
  async renderPeriod(period) {
    if (!period) return '';

    let html = '';

    if (period.start && period.end) {
      html = `${this.escapeHtml(period.start)} to ${this.escapeHtml(period.end)}`;
    } else if (period.start) {
      html = `from ${this.escapeHtml(period.start)}`;
    } else if (period.end) {
      html = `until ${this.escapeHtml(period.end)}`;
    }

    return html || '<em>(empty Period)</em>';
  }

  /**
   * Render CodeSystem resource
   */
  async renderCodeSystem(json, inBundle) {
    let html = await this.renderResourceWithNarrative(json, await this.renderer.renderCodeSystem(json));

    if (!inBundle) {
      html += await this.liquid.renderFile('codesystem-operations', {
        opsId: this.generateResourceId(),
        url: this.escapeHtml(json.url || '')
      });
    }

    return html;
  }

  /**
   * Render ValueSet resource
   */
  async renderValueSet(json, inBundle) {
    let html = await this.renderResourceWithNarrative(json, await this.renderer.renderValueSet(json));

    if (!inBundle) {
      html += await this.liquid.renderFile('valueset-operations', {
        opsId: this.generateResourceId(),
        vcSystemId: this.generateResourceId(),
        inferSystemId: this.generateResourceId(),
        url: this.escapeHtml(json.url || '')
      });
    }

    return html;
  }

  /**
   * Render ConceptMap resource
   */
  // eslint-disable-next-line no-unused-vars
  async renderConceptMap(json, inBundle) {
    return this.renderResourceWithNarrative(json);
  }

  /**
   * Render CapabilityStatement resource
   */
  // eslint-disable-next-line no-unused-vars
  async renderCapabilityStatement(json, inBundle) {
    return await this.renderResourceWithNarrative(json, await this.renderer.renderCapabilityStatement(json));
  }

  // eslint-disable-next-line no-unused-vars
  async renderTerminologyCapabilities(json, inBundle) {
    return await this.renderResourceWithNarrative(json, await this.renderer.renderTerminologyCapabilities(json));
  }

  /**
   * Render OperationOutcome resource
   */
  async renderOperationOutcome(json) {
    let html = '<div class="operation-outcome">';
    html += `<h4>OperationOutcome</h4>`;

    if (json.issue && Array.isArray(json.issue)) {
      for (const issue of json.issue) {
        html += '<div class="alert ';

        // Determine alert style based on this issue's severity
        const severity = issue.severity || 'information';
        switch (severity) {
          case 'error':
          case 'fatal':
            html += 'alert-danger';
            break;
          case 'warning':
            html += 'alert-warning';
            break;
          case 'information':
            html += 'alert-info';
            break;
          default:
            html += 'alert-secondary';
        }

        html += '">';
        html += `<strong>${this.escapeHtml(issue.severity || 'unknown')}:</strong> `;
        html += `[${this.escapeHtml(issue.code || 'unknown')}] `;
        html += this.escapeHtml(issue.diagnostics || issue.details?.text || 'No details');
        html += '</div>';
      }
    }

    html += '</div>';
    return html;
  }

  /**
   * Render Bundle resource
   */
  async renderBundle(json, req) {
    if (json.type === 'searchset') {
      return await this.renderSearchBundle(json, req);
    }

    // Generic bundle rendering
    return await this.renderGenericBundle(json, req);
  }

  /**
   * Render a search result Bundle
   */
  async renderSearchBundle(json, req) {

    // Check if there are any actual search parameters (not just pagination/control params)
    const selfLink = json.link?.find(l => l.relation === 'self')?.url || '';
    const hasSearchParams = this.checkForSearchParams(selfLink);

    // If no search params provided, show the search form
    if (!hasSearchParams) {
      return this.renderSearchForm(json, req);
    }

    // Check if _elements was specified (look in self link)
    const elementsMatch = selfLink.match(/[?&]_elements=([^&]*)/);
    const elements = elementsMatch ? decodeURIComponent(elementsMatch[1]).split(',').map(e => e.trim()) : null;

    if (elements && elements.length > 0) {
      return this.renderSearchTable(json, elements, req);
    }

    // Default: render as summary with individual resources
    return await this.renderSearchSummary(json, req);
  }

  /**
   * Check if URL has any actual search parameters (not just _offset, _count, _elements, _sort)
   */
  checkForSearchParams(url) {
    try {
      const urlObj = new URL(url);
      const controlParams = ['_offset', '_count', '_sort'];

      for (const [key, value] of urlObj.searchParams) {
        if (!controlParams.includes(key) && value) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Render search form (when no search params provided)
   */
  async renderSearchForm(json, req) {
    const resourceType = this.getSearchResourceType(json);
    const params = resourceType === 'CodeSystem' ? CODESYSTEM_PARAMS : SEARCH_PARAMS;

    let html = '<div class="alert alert-info">Enter search criteria:</div>';
    html += `<form method="get" action="${this.escapeHtml(req.baseUrl)}/${this.escapeHtml(resourceType)}">`;
    html += '<div class="row">';

    // Build form fields
    for (const param of params) {
      html += '<div class="col-md-4 mb-3">';
      html += `<label for="${param.name}" class="form-label">${this.escapeHtml(param.label)}</label>`;

      if (param.type === 'select') {
        html += `<select name="${param.name}" id="${param.name}" class="form-select">`;
        for (const opt of param.options) {
          html += `<option value="${this.escapeHtml(opt)}">${this.escapeHtml(opt || '(any)')}</option>`;
        }
        html += '</select>';
      } else {
        html += `<input type="text" name="${param.name}" id="${param.name}"/>`;
      }

      html += '</div>';
    }

    html += '</div>';

    // Sort dropdown
    html += '<div class="row">';
    html += '<div class="col-md-4 mb-3">';
    html += '<label for="_sort" class="form-label">Sort By</label>';
    html += '<select name="_sort" id="_sort" class="form-select">';
    for (const opt of SORT_OPTIONS) {
      html += `<option value="${this.escapeHtml(opt)}">${this.escapeHtml(opt || '(default)')}</option>`;
    }
    html += '</select>';
    html += '</div>';
    html += '</div>';

    // Elements checkboxes
    html += '<div class="mb-3">';
    html += '<label class="form-label">Elements to include:</label><br/>';
    for (const elem of ELEMENT_OPTIONS) {
      html += `<div class="form-check form-check-inline">`;
      html += `<input type="checkbox" name="_elements" value="${this.escapeHtml(elem)}" id="elem_${elem}" class="form-check-input"/>`;
      html += `<label for="elem_${elem}" class="form-check-label">${this.escapeHtml(elem)}</label>`;
      html += '</div>';
    }
    html += '</div>';

    html += '<button type="submit" class="btn btn-primary">Search</button>';
    html += '</form>';

    return html;
  }

  /**
   * Get resource type from search bundle (from self link or first entry)
   */
  getSearchResourceType(json) {
    // Try to get from self link first
    const selfLink = json.link?.find(l => l.relation === 'self')?.url || '';
    const typeMatch = selfLink.match(/\/(CodeSystem|ValueSet|ConceptMap)\?/);
    if (typeMatch) {
      return typeMatch[1];
    }

    // Fall back to first entry
    const firstEntry = json.entry?.[0]?.resource;
    return firstEntry?.resourceType || 'Resource';
  }

  /**
   * Render search results as a table (when _elements is specified)
   */
  async renderSearchTable(json, elements, req) {
    const entries = json.entry || [];
    const total = json.total || 0;

    let html = `<p>Found ${total} result(s)</p>`;

    // Pagination links
    html += this.renderPaginationLinks(json);

    // Build table
    html += '<table class="table table-striped grid">';
    html += '<thead><tr>';
    html += '<th>ID</th>';
    for (const elem of elements) {
      if (elem !== 'id') {
        html += `<th>${this.escapeHtml(elem)}</th>`;
      }
    }
    html += '</tr></thead>';
    html += '<tbody>';

    for (const entry of entries) {
      const resource = entry.resource;
      if (!resource) continue;

      html += '<tr>';

      // ID column with link
      const id = resource.id || '';
      const resourceType = resource.resourceType || '';
      html += `<td><a href="${this.escapeHtml(req.baseUrl)}/${this.escapeHtml(resourceType)}/${this.escapeHtml(id)}">${this.escapeHtml(id)}</a></td>`;

      // Other element columns
      for (const elem of elements) {
        if (elem !== 'id') {
          const value = resource[elem];
          html += `<td>${this.escapeHtml(this.formatValue(value))}</td>`;
        }
      }

      html += '</tr>';
    }

    html += '</tbody></table>';

    // Pagination links again at bottom
    html += this.renderPaginationLinks(json);

    return html;
  }

  /**
   * Render search results as summary with individual resources
   */
  async renderSearchSummary(json, req) {
    const entries = json.entry || [];
    const total = json.total || 0;

    let html = `<p>Found ${total} result(s)</p>`;

    // Pagination links
    html += this.renderPaginationLinks(json);

    // Bundle summary
    html += '<div class="card mb-3">';
    html += '<div class="card-header">Bundle Summary</div>';
    html += '<div class="card-body">';
    html += `<p><strong>Type:</strong> ${this.escapeHtml(json.type)}</p>`;
    html += `<p><strong>Total:</strong> ${total}</p>`;
    html += '</div>';
    html += '</div>';

    // Each entry
    for (const entry of entries) {
      html += '<hr/>';

      if (entry.resource) {
        const resource = entry.resource;
        html += `<h4>${this.escapeHtml(resource.resourceType)}/${this.escapeHtml(resource.id || 'unknown')}</h4>`;

        if (entry.fullUrl) {
          html += `<p><small><a href="${this.escapeHtml(entry.fullUrl)}">${this.escapeHtml(entry.fullUrl)}</a></small></p>`;
        }

        // Render the resource
        html += await this.render(resource, req, true);
      }
    }

    // Pagination links again at bottom
    html += this.renderPaginationLinks(json);

    return html;
  }

  /**
   * Render pagination links
   */
  renderPaginationLinks(json) {
    const links = json.link || [];
    if (links.length === 0) return '';

    let html = '<nav><ul class="pagination">';

    const linkOrder = ['first', 'previous', 'self', 'next', 'last'];

    for (const rel of linkOrder) {
      const link = links.find(l => l.relation === rel);
      if (link) {
        const isDisabled = rel === 'self';
        const label = rel.charAt(0).toUpperCase() + rel.slice(1);

        if (isDisabled) {
          html += `<li class="page-item active"><span class="page-link">${this.escapeHtml(label)}</span></li>`;
        } else {
          html += `<li class="page-item"><a class="page-link" href="${this.escapeHtml(link.url)}">${this.escapeHtml(label)}</a></li>`;
        }
      }
    }

    html += '</ul></nav>';
    return html;
  }

  /**
   * Render a generic bundle (non-search)
   */
  async renderGenericBundle(json, req) {
    let html = '<div class="card mb-3">';
    html += '<div class="card-header">Bundle</div>';
    html += '<div class="card-body">';
    html += `<p><strong>Type:</strong> ${this.escapeHtml(json.type)}</p>`;
    html += `<p><strong>Total:</strong> ${json.total || 'N/A'}</p>`;
    html += '</div>';
    html += '</div>';

    // Links
    if (json.link && json.link.length > 0) {
      html += '<h4>Links</h4>';
      html += '<ul>';
      for (const link of json.link) {
        html += `<li><strong>${this.escapeHtml(link.relation)}:</strong> <a href="${this.escapeHtml(link.url)}">${this.escapeHtml(link.url)}</a></li>`;
      }
      html += '</ul>';
    }

    // Entries
    if (json.entry && json.entry.length > 0) {
      for (const entry of json.entry) {
        html += '<hr/>';
        if (entry.resource) {
          html += await this.render(entry.resource, req, true);
        }
      }
    }

    return html;
  }

  /**
   * Render generic resource (fallback)
   */
  async renderGeneric(json, inBundle) {
    return this.renderResourceWithNarrative(json, inBundle);
  }

  /**
   * Format a value for display
   */
  formatValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Generate a unique ID for collapsible sections
   */
  let
  resourceIdCounter = 0;

  generateResourceId() {
    return 'resource_' + (++this.resourceIdCounter);
  }


  /**
   * Render resource with text/div narrative and collapsible JSON source
   */
  async renderResourceWithNarrative(json, rendered) {
    const resourceId = this.generateResourceId();

    let html = "";

    // Show text/div narrative if present
    if (rendered) {
      html += '<div class="narrative">';
      html += rendered;  // Already HTML, render as-is
      html += '</div>';
    } else {
      html += '<div class="narrative">(No Narrative)</div>';
    }
    if (json.text && json.text.div) {
    // Collapsible JSON source
      html += '<div class="xhtml">';
      html += `<button type="button" class="btn btn-sm btn-outline-secondary" onclick="toggleOriginalNarrative('${resourceId}x')">`;
      html += 'Show Original Narrative</button>';
      html += `<div id="${resourceId}x" class="original-narrative" style="display: none; margin-top: 10px;">`;

      html += '<div class="narrative">';
      html += json.text.div;  // Already HTML, render as-is
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';


    // Collapsible JSON source
    html += '<div class="json-source">';
    html += `<button type="button" class="btn btn-sm btn-outline-secondary" onclick="toggleJsonSource('${resourceId}')">`;
    html += 'Show JSON Source</button>';
    html += `<div id="${resourceId}" class="json-content" style="display: none; margin-top: 10px;">`;
    html += `<pre>${this.escapeHtml(JSON.stringify(json, null, 2))}</pre>`;
    html += '</div>';
    html += '</div>';

    return html;
  }

  // eslint-disable-next-line no-unused-vars
  async renderOperationsForm(json, req) {
    const vcSystemId = this.generateResourceId();
    const inferSystemId = this.generateResourceId();

    return await this.liquid.renderFile('operations-form', {
      vcSystemId,
      inferSystemId,
      valueSetsJson: JSON.stringify(json.valueSets || [])
    });
  }
}

module.exports = {
 TxHtmlRenderer, loadTemplate
};
