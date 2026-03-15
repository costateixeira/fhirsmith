const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const htmlServer = require('../library/html-server');
const escape = require('escape-html');
const packageJson = require('../package.json');

const TEMPLATE_NAME = 'ext-tracker';

class ExtensionTrackerModule {
  constructor(stats) {
    this.stats = stats;
    this.db = null;
    this.urlBase = '/ext-tracker';
  }

  initialize(config, app) {
    const dbPath = config.database || path.join(config.folder || '.', 'extension-tracker.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.createSchema();
    this.prepareStatements();

    this.urlBase = config.url || '/ext-tracker';

    // load template
    const templatePath = path.join(__dirname, 'extension-tracker-template.html');
    htmlServer.loadTemplate(TEMPLATE_NAME, templatePath);

    const router = express.Router();

    // POST - submit extension data
    router.post(this.urlBase, express.json({ limit: '5mb' }), (req, res) => {
      this.handleSubmission(req, res);
    });

    // GET - HTML views
    router.get(this.urlBase, (req, res) => this.handleHome(req, res));
    router.get(this.urlBase + '/extensions', (req, res) => this.handleExtensions(req, res));
    router.get(this.urlBase + '/profiles', (req, res) => this.handleProfiles(req, res));
    router.get(this.urlBase + '/usage', (req, res) => this.handleUsage(req, res));
    router.get(this.urlBase + '/package/:pkg', (req, res) => this.handlePackageDetail(req, res));

    app.use('/', router);
    const count = this.db.prepare('SELECT COUNT(*) as count FROM packages').get().count;
    console.log(`Extension tracker: loaded (${count} packages in database) at ${this.urlBase}`);
  }

  createSchema() {
    this.db.exec(`
        CREATE TABLE IF NOT EXISTS packages (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                package TEXT NOT NULL UNIQUE,
                                                version TEXT NOT NULL,
                                                fhir_version TEXT NOT NULL,
                                                jurisdiction TEXT,
                                                submitted_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS extensions (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            title TEXT
            );

        CREATE TABLE IF NOT EXISTS extension_types (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       extension_id INTEGER NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
            type TEXT NOT NULL
            );

        CREATE TABLE IF NOT EXISTS profiles (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
            resource_type TEXT NOT NULL,
            url TEXT NOT NULL,
            title TEXT
            );

        CREATE TABLE IF NOT EXISTS usages (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
            extension_url TEXT NOT NULL,
            location TEXT NOT NULL
            );

        CREATE INDEX IF NOT EXISTS idx_extensions_package ON extensions(package_id);
        CREATE INDEX IF NOT EXISTS idx_extensions_url ON extensions(url);
        CREATE INDEX IF NOT EXISTS idx_extension_types_ext ON extension_types(extension_id);
        CREATE INDEX IF NOT EXISTS idx_profiles_package ON profiles(package_id);
        CREATE INDEX IF NOT EXISTS idx_profiles_resource ON profiles(resource_type);
        CREATE INDEX IF NOT EXISTS idx_usages_package ON usages(package_id);
        CREATE INDEX IF NOT EXISTS idx_usages_url ON usages(extension_url);
        CREATE INDEX IF NOT EXISTS idx_usages_location ON usages(location);
    `);
  }

  prepareStatements() {
    this.stmts = {
      deletePackage: this.db.prepare('DELETE FROM packages WHERE package = ?'),
      insertPackage: this.db.prepare(
        'INSERT INTO packages (package, version, fhir_version, jurisdiction, submitted_at) VALUES (?, ?, ?, ?, ?)'
      ),
      insertExtension: this.db.prepare(
        'INSERT INTO extensions (package_id, url, title) VALUES (?, ?, ?)'
      ),
      insertExtensionType: this.db.prepare(
        'INSERT INTO extension_types (extension_id, type) VALUES (?, ?)'
      ),
      insertProfile: this.db.prepare(
        'INSERT INTO profiles (package_id, resource_type, url, title) VALUES (?, ?, ?, ?)'
      ),
      insertUsage: this.db.prepare(
        'INSERT INTO usages (package_id, extension_url, location) VALUES (?, ?, ?)'
      )
    };
  }

  // ---- Template rendering ----

  renderPage(title, content, processingTime) {
    if (!htmlServer.hasTemplate(TEMPLATE_NAME)) {
      const templatePath = path.join(__dirname, 'extension-tracker-template.html');
      htmlServer.loadTemplate(TEMPLATE_NAME, templatePath);
    }
    const count = this.db.prepare('SELECT COUNT(*) as count FROM packages').get().count;
    const stats = {
      version: packageJson.version,
      totalPackages: count,
      processingTime: processingTime
    };
    return htmlServer.renderPage(TEMPLATE_NAME, title, content, stats);
  }

  sendHtmlResponse(res, title, content, startTime) {
    const html = this.renderPage(title, content, Date.now() - startTime);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  // ---- POST handler ----

  handleSubmission(req, res) {
    const startTime = Date.now();
    const data = req.body;

    if (!data.package || !data.version || !data.fhirVersion) {
      return res.status(400).json({ error: 'Missing required fields: package, version, fhirVersion' });
    }

    try {
      this.ingestData(data);
      this.stats.countRequest('handleSubmission', Date.now() - startTime);
      return res.status(200).json({ status: 'ok', package: data.package, version: data.version });
    } catch (err) {
      console.log(`Extension tracker: error ingesting ${data.package}: ${err.message}`);
      return res.status(500).json({ error: 'Failed to process submission' });
    }
  }

  ingestData(data) {
    const ingest = this.db.transaction(() => {
      // delete any existing entry for this package (cascade cleans children)
      this.stmts.deletePackage.run(data.package);

      // insert package
      const result = this.stmts.insertPackage.run(
        data.package, data.version, data.fhirVersion,
        data.jurisdiction || null, new Date().toISOString()
      );
      const packageId = result.lastInsertRowid;

      // insert extensions
      if (Array.isArray(data.extensions)) {
        for (const ext of data.extensions) {
          const extResult = this.stmts.insertExtension.run(packageId, ext.url, ext.title || null);
          const extId = extResult.lastInsertRowid;

          // deduplicate types
          if (Array.isArray(ext.types)) {
            const seen = new Set();
            for (const type of ext.types) {
              if (!seen.has(type)) {
                seen.add(type);
                this.stmts.insertExtensionType.run(extId, type);
              }
            }
          }
        }
      }

      // insert profiles
      if (data.profiles && typeof data.profiles === 'object') {
        for (const [resourceType, profileList] of Object.entries(data.profiles)) {
          if (Array.isArray(profileList)) {
            for (const profile of profileList) {
              this.stmts.insertProfile.run(packageId, resourceType, profile.url, profile.title || null);
            }
          }
        }
      }

      // insert usage
      if (data.usage && typeof data.usage === 'object') {
        for (const [extUrl, locations] of Object.entries(data.usage)) {
          if (Array.isArray(locations)) {
            for (const location of locations) {
              this.stmts.insertUsage.run(packageId, extUrl, location);
            }
          }
        }
      }
    });

    ingest();
  }

  // ---- GET handlers ----

  handleHome(req, res) {
    const startTime = Date.now();
    try {
      const summary = this.db.prepare(`
        SELECT
          COUNT(*) as packageCount,
          COUNT(DISTINCT fhir_version) as fhirVersionCount
        FROM packages
      `).get();

      const extCount = this.db.prepare('SELECT COUNT(*) as count FROM extensions').get().count;
      const profileCount = this.db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;
      const usageCount = this.db.prepare('SELECT COUNT(*) as count FROM usages').get().count;

      const packages = this.db.prepare(
        'SELECT package, version, fhir_version, jurisdiction, submitted_at FROM packages ORDER BY package'
      ).all();

      let content = '<table class="grid">';
      content += `<tr><td><b>Packages</b></td><td>${summary.packageCount}</td></tr>`;
      content += `<tr><td><b>FHIR Versions</b></td><td>${summary.fhirVersionCount}</td></tr>`;
      content += `<tr><td><b>Extensions defined</b></td><td>${extCount}</td></tr>`;
      content += `<tr><td><b>Profiles defined</b></td><td>${profileCount}</td></tr>`;
      content += `<tr><td><b>Extension usages tracked</b></td><td>${usageCount}</td></tr>`;
      content += '</table>';

      content += '<h3>Packages</h3>';
      content += '<table class="grid"><tr><th>Package</th><th>Version</th><th>FHIR</th><th>Jurisdiction</th><th>Submitted</th></tr>';
      for (const p of packages) {
        content += '<tr>';
        content += `<td><a href="${this.urlBase}/package/${encodeURIComponent(p.package)}">${escape(p.package)}</a></td>`;
        content += `<td>${escape(p.version)}</td>`;
        content += `<td>${escape(p.fhir_version)}</td>`;
        content += `<td>${escape(p.jurisdiction || '')}</td>`;
        content += `<td>${escape(p.submitted_at.substring(0, 10))}</td>`;
        content += '</tr>';
      }
      content += '</table>';

      this.stats.countRequest('handleHome', Date.now() - startTime);
      this.sendHtmlResponse(res, 'Extension Tracker', content, startTime);
    } catch (error) {
      console.log('Extension tracker: error rendering home:', error);
      htmlServer.sendErrorResponse(res, TEMPLATE_NAME, error);
    }
  }

  handleExtensions(req, res) {
    const startTime = Date.now();
    try {
      const filterPkg = req.query.package || null;

      let query = `
        SELECT e.url, e.title, p.package, p.version,
          GROUP_CONCAT(DISTINCT et.type) as types
        FROM extensions e
        JOIN packages p ON p.id = e.package_id
        LEFT JOIN extension_types et ON et.extension_id = e.id
      `;
      const params = [];
      if (filterPkg) {
        query += ' WHERE p.package = ?';
        params.push(filterPkg);
      }
      query += ' GROUP BY e.id ORDER BY p.package, e.url';

      const rows = this.db.prepare(query).all(...params);

      let content = '';
      if (filterPkg) {
        content += `<p>Filtered to package: <b>${escape(filterPkg)}</b> (<a href="${this.urlBase}/extensions">show all</a>)</p>`;
      }

      content += `<p>${rows.length} extensions</p>`;
      content += '<table class="grid"><tr><th>Extension</th><th>Title</th><th>Types</th><th>Package</th></tr>';
      for (const r of rows) {
        content += '<tr>';
        content += `<td>${escape(r.url)}</td>`;
        content += `<td>${escape(r.title || '')}</td>`;
        content += `<td>${escape(r.types || '')}</td>`;
        content += `<td><a href="${this.urlBase}/package/${encodeURIComponent(r.package)}">${escape(r.package)}#${escape(r.version)}</a></td>`;
        content += '</tr>';
      }
      content += '</table>';

      this.stats.countRequest('handleExtensions', Date.now() - startTime);
      this.sendHtmlResponse(res, 'Extensions', content, startTime);
    } catch (error) {
      console.log('Extension tracker: error rendering extensions:', error);
      htmlServer.sendErrorResponse(res, TEMPLATE_NAME, error);
    }
  }

  handleProfiles(req, res) {
    const startTime = Date.now();
    try {
      const filterResource = req.query.resource || null;
      const filterPkg = req.query.package || null;

      let query = `
        SELECT pr.resource_type, pr.url, pr.title, p.package, p.version
        FROM profiles pr
        JOIN packages p ON p.id = pr.package_id
      `;
      const conditions = [];
      const params = [];
      if (filterResource) {
        conditions.push('pr.resource_type = ?');
        params.push(filterResource);
      }
      if (filterPkg) {
        conditions.push('p.package = ?');
        params.push(filterPkg);
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY pr.resource_type, p.package, pr.url';

      const rows = this.db.prepare(query).all(...params);

      // get distinct resource types for filter links
      const resourceTypes = this.db.prepare(
        'SELECT DISTINCT resource_type FROM profiles ORDER BY resource_type'
      ).all();

      let content = '<p>Filter by resource: ';
      content += `<a href="${this.urlBase}/profiles">All</a>`;
      for (const rt of resourceTypes) {
        content += ` | <a href="${this.urlBase}/profiles?resource=${encodeURIComponent(rt.resource_type)}">${escape(rt.resource_type)}</a>`;
      }
      content += '</p>';

      if (filterResource || filterPkg) {
        const parts = [];
        if (filterResource) parts.push(`resource: <b>${escape(filterResource)}</b>`);
        if (filterPkg) parts.push(`package: <b>${escape(filterPkg)}</b>`);
        content += `<p>Filtered to ${parts.join(', ')} (<a href="${this.urlBase}/profiles">show all</a>)</p>`;
      }

      content += `<p>${rows.length} profiles</p>`;
      content += '<table class="grid"><tr><th>Resource</th><th>Profile</th><th>Title</th><th>Package</th></tr>';
      for (const r of rows) {
        content += '<tr>';
        content += `<td>${escape(r.resource_type)}</td>`;
        content += `<td>${escape(r.url)}</td>`;
        content += `<td>${escape(r.title || '')}</td>`;
        content += `<td><a href="${this.urlBase}/package/${encodeURIComponent(r.package)}">${escape(r.package)}#${escape(r.version)}</a></td>`;
        content += '</tr>';
      }
      content += '</table>';

      this.stats.countRequest('handleProfiles', Date.now() - startTime);
      this.sendHtmlResponse(res, 'Profiles', content, startTime);
    } catch (error) {
      console.log('Extension tracker: error rendering profiles:', error);
      htmlServer.sendErrorResponse(res, TEMPLATE_NAME, error);
    }
  }

  handleUsage(req, res) {
    const startTime = Date.now();
    try {
      const filterUrl = req.query.url || null;
      const filterLocation = req.query.location || null;

      let query = `
        SELECT u.extension_url, u.location, p.package, p.version
        FROM usages u
        JOIN packages p ON p.id = u.package_id
      `;
      const conditions = [];
      const params = [];
      if (filterUrl) {
        conditions.push('u.extension_url = ?');
        params.push(filterUrl);
      }
      if (filterLocation) {
        conditions.push('u.location = ?');
        params.push(filterLocation);
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY u.extension_url, u.location, p.package';

      const rows = this.db.prepare(query).all(...params);

      let content = '';
      if (filterUrl || filterLocation) {
        const parts = [];
        if (filterUrl) parts.push(`extension: <b>${escape(filterUrl)}</b>`);
        if (filterLocation) parts.push(`location: <b>${escape(filterLocation)}</b>`);
        content += `<p>Filtered to ${parts.join(', ')} (<a href="${this.urlBase}/usage">show all</a>)</p>`;
      }

      content += `<p>${rows.length} usage entries</p>`;
      content += '<table class="grid"><tr><th>Extension</th><th>Used on</th><th>Package</th></tr>';
      for (const r of rows) {
        content += '<tr>';
        content += `<td><a href="${this.urlBase}/usage?url=${encodeURIComponent(r.extension_url)}">${escape(r.extension_url)}</a></td>`;
        content += `<td><a href="${this.urlBase}/usage?location=${encodeURIComponent(r.location)}">${escape(r.location)}</a></td>`;
        content += `<td><a href="${this.urlBase}/package/${encodeURIComponent(r.package)}">${escape(r.package)}#${escape(r.version)}</a></td>`;
        content += '</tr>';
      }
      content += '</table>';

      this.stats.countRequest('handleUsage', Date.now() - startTime);
      this.sendHtmlResponse(res, 'Extension Usage', content, startTime);
    } catch (error) {
      console.log('Extension tracker: error rendering usage:', error);
      htmlServer.sendErrorResponse(res, TEMPLATE_NAME, error);
    }
  }

  handlePackageDetail(req, res) {
    const startTime = Date.now();
    try {
      const pkgName = req.params.pkg;
      const pkg = this.db.prepare('SELECT * FROM packages WHERE package = ?').get(pkgName);
      if (!pkg) {
        return res.status(404).send('Package not found');
      }

      const extensions = this.db.prepare(`
        SELECT e.url, e.title, GROUP_CONCAT(DISTINCT et.type) as types
        FROM extensions e
        LEFT JOIN extension_types et ON et.extension_id = e.id
        WHERE e.package_id = ?
        GROUP BY e.id ORDER BY e.url
      `).all(pkg.id);

      const profiles = this.db.prepare(
        'SELECT resource_type, url, title FROM profiles WHERE package_id = ? ORDER BY resource_type, url'
      ).all(pkg.id);

      const usages = this.db.prepare(
        'SELECT extension_url, location FROM usages WHERE package_id = ? ORDER BY extension_url, location'
      ).all(pkg.id);

      let content = '<table class="grid">';
      content += `<tr><td><b>Package</b></td><td>${escape(pkg.package)}</td></tr>`;
      content += `<tr><td><b>Version</b></td><td>${escape(pkg.version)}</td></tr>`;
      content += `<tr><td><b>FHIR Version</b></td><td>${escape(pkg.fhir_version)}</td></tr>`;
      content += `<tr><td><b>Jurisdiction</b></td><td>${escape(pkg.jurisdiction || '')}</td></tr>`;
      content += `<tr><td><b>Submitted</b></td><td>${escape(pkg.submitted_at)}</td></tr>`;
      content += '</table>';

      if (extensions.length > 0) {
        content += `<h3>Extensions Defined (${extensions.length})</h3>`;
        content += '<table class="grid"><tr><th>URL</th><th>Title</th><th>Types</th></tr>';
        for (const e of extensions) {
          content += '<tr>';
          content += `<td>${escape(e.url)}</td>`;
          content += `<td>${escape(e.title || '')}</td>`;
          content += `<td>${escape(e.types || '')}</td>`;
          content += '</tr>';
        }
        content += '</table>';
      }

      if (profiles.length > 0) {
        content += `<h3>Profiles Defined (${profiles.length})</h3>`;
        content += '<table class="grid"><tr><th>Resource</th><th>URL</th><th>Title</th></tr>';
        for (const p of profiles) {
          content += '<tr>';
          content += `<td>${escape(p.resource_type)}</td>`;
          content += `<td>${escape(p.url)}</td>`;
          content += `<td>${escape(p.title || '')}</td>`;
          content += '</tr>';
        }
        content += '</table>';
      }

      if (usages.length > 0) {
        content += `<h3>Extension Usage (${usages.length})</h3>`;
        content += '<table class="grid"><tr><th>Extension</th><th>Used on</th></tr>';
        for (const u of usages) {
          content += '<tr>';
          content += `<td><a href="${this.urlBase}/usage?url=${encodeURIComponent(u.extension_url)}">${escape(u.extension_url)}</a></td>`;
          content += `<td>${escape(u.location)}</td>`;
          content += '</tr>';
        }
        content += '</table>';
      }
      this.stats.countRequest('packageDetail', Date.now() - startTime);

      this.sendHtmlResponse(res, `${escape(pkgName)}#${escape(pkg.version)}`, content, startTime);
    } catch (error) {
      console.log('Extension tracker: error rendering package detail:', error);
      htmlServer.sendErrorResponse(res, TEMPLATE_NAME, error);
    }
  }

  // ---- Module lifecycle ----

  shutdown() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  getStatus() {
    let startTime = Date.now();
    if (!this.db) {
      return { status: 'closed' };
    }
    const count = this.db.prepare('SELECT COUNT(*) as count FROM packages').get().count;
    this.stats.countRequest('search', Date.now() - startTime);
    return { status: 'running', packages: count };
  }
}

module.exports = ExtensionTrackerModule;
