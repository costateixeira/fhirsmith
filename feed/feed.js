//
// Feed Module — Atom syndication feed (Phase 1: producer)
//
// Exposes:
//   GET /feed                     -> Atom feed listing artifacts in terminology-cache
//   GET /feed/files/:filename     -> serves a single binary cache file (.cache/.db/.xml)
//   GET /feed/packages/:id/:version/package.tgz
//                                 -> repacks an extracted NPM package folder into a .tgz
//
// The feed is generated on-demand by walking the terminology-cache folder. No
// new persistent state is introduced. Downstream FHIRsmith deployments can
// point an `atom:` source (Phase 2) at this endpoint to mirror the catalogue.
//

const express = require('express');
const fs = require('fs');
const path = require('path');
const tar = require('tar');

const folders = require('../library/folder-setup');
const Logger = require('../library/logger');

class FeedModule {
  constructor(stats) {
    this.stats = stats;
    this.router = express.Router();
    this.config = null;
    this.cacheFolder = null;
    this.log = null;
  }

  async initialize(config) {
    this.config = config || {};
    this.log = Logger.getInstance().child({ module: 'feed' });
    this.cacheFolder = folders.subDir('terminology-cache');
    this.log.info(`Feed module initialized; cache folder: ${this.cacheFolder}`);

    this.router.get('/', this.handleFeed.bind(this));
    this.router.get('/files/:filename', this.handleFile.bind(this));
    this.router.get('/packages/:id/:version/package.tgz', this.handlePackage.bind(this));
  }

  async shutdown() { /* no-op */ }

  // ---------- routes ----------

  async handleFeed(req, res) {
    try {
      const entries = await this.scanCache();
      const baseUrl = this.config.baseUrl || `${req.protocol}://${req.get('host')}`;
      const xml = this.renderAtom(entries, baseUrl);
      res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
      res.send(xml);
    } catch (err) {
      this.log.error('Failed to build feed:', err);
      res.status(500).send('Failed to build feed');
    }
  }

  handleFile(req, res) {
    const name = req.params.filename;
    if (!this.isSafeName(name)) {
      return res.status(400).send('Invalid filename');
    }
    const filePath = path.join(this.cacheFolder, name);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).send('Not found');
    }
    res.sendFile(filePath);
  }

  handlePackage(req, res) {
    const { id, version } = req.params;
    if (!this.isSafeName(id) || !this.isSafeName(version)) {
      return res.status(400).send('Invalid path');
    }
    const dirPath = path.join(this.cacheFolder, `${id}#${version}`);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      return res.status(404).send('Not found');
    }
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${id}-${version}.tgz"`);
    tar.create({ gzip: true, cwd: dirPath, portable: true }, ['.']).pipe(res);
  }

  // ---------- scanning ----------

  async scanCache() {
    const entries = [];
    if (!fs.existsSync(this.cacheFolder)) return entries;

    const items = await fs.promises.readdir(this.cacheFolder, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(this.cacheFolder, item.name);
      try {
        if (item.isDirectory()) {
          const e = await this.classifyNpmDirectory(item.name, fullPath);
          if (e) entries.push(e);
        } else if (item.isFile()) {
          const e = await this.classifyFile(item.name, fullPath);
          if (e) entries.push(e);
        }
      } catch (err) {
        this.log.warn(`Skipping ${item.name}: ${err.message}`);
      }
    }
    return entries;
  }

  async classifyNpmDirectory(name, dirPath) {
    const hashIdx = name.lastIndexOf('#');
    if (hashIdx < 1 || hashIdx === name.length - 1) return null;
    const id = name.substring(0, hashIdx);
    const version = name.substring(hashIdx + 1);

    let canonical = null;
    let title = `${id} ${version}`;
    let description = null;

    const pkgJsonPath = path.join(dirPath, 'package', 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pj = JSON.parse(await fs.promises.readFile(pkgJsonPath, 'utf8'));
        if (pj.canonical) canonical = pj.canonical;
        if (pj.description) description = pj.description;
        if (pj.title) title = `${pj.title} ${version}`;
      } catch { /* fall through */ }
    }

    const stat = await fs.promises.stat(dirPath);
    return {
      category: 'fhir-package',
      title,
      description,
      identifier: canonical || `urn:fhir:package:${id}`,
      version,
      url: `/feed/packages/${encodeURIComponent(id)}/${encodeURIComponent(version)}/package.tgz`,
      mediaType: 'application/gzip',
      updated: stat.mtime,
    };
  }

  async classifyFile(name, filePath) {
    const stat = await fs.promises.stat(filePath);
    const lower = name.toLowerCase();
    let category, mediaType;

    if (lower.endsWith('.cache')) {
      category = 'snomed-cache';
      mediaType = 'application/octet-stream';
    } else if (lower.endsWith('.db')) {
      category = 'terminology-db';
      mediaType = 'application/x-sqlite3';
    } else if (lower.endsWith('.xml')) {
      category = 'xml-resource';
      mediaType = 'application/xml';
    } else {
      return null;
    }

    return {
      category,
      title: name,
      description: null,
      identifier: `urn:fhirsmith-cache:${name}`,
      version: null,
      url: `/feed/files/${encodeURIComponent(name)}`,
      mediaType,
      updated: stat.mtime,
      size: stat.size,
    };
  }

  // ---------- rendering ----------

  renderAtom(entries, baseUrl) {
    const updated = new Date().toISOString();
    const feedId = `${baseUrl}/feed`;
    const items = entries.map(e => this.renderEntry(e, baseUrl)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:sy="http://ns.electronichealth.net.au/ncts/syndication/asf/extensions/1.0.0"
      xmlns:fs="http://fhirsmith.org/syndication/1.0">
  <title>FHIRsmith Syndication Feed</title>
  <id>${escapeXml(feedId)}</id>
  <updated>${updated}</updated>
  <link rel="self" href="${escapeXml(feedId)}"/>
${items}
</feed>`;
  }

  renderEntry(e, baseUrl) {
    const href = baseUrl + e.url;
    const datePart = e.updated.toISOString().substring(0, 10);
    const idTag = `tag:fhirsmith,${datePart}:${escapeXml(e.identifier)}`;
    const sizeAttr = e.size !== undefined ? ` length="${e.size}"` : '';
    const versionTag = e.version
      ? `\n    <sy:contentItemVersion>${escapeXml(e.version)}</sy:contentItemVersion>`
      : '';
    const descTag = e.description
      ? `\n    <content type="text">${escapeXml(e.description)}</content>`
      : '';
    return `  <entry>
    <id>${idTag}</id>
    <title>${escapeXml(e.title)}</title>
    <updated>${e.updated.toISOString()}</updated>
    <category term="${escapeXml(e.category)}"/>
    <link rel="alternate" type="${escapeXml(e.mediaType)}" href="${escapeXml(href)}"${sizeAttr}/>
    <sy:contentItemIdentifier>${escapeXml(e.identifier)}</sy:contentItemIdentifier>${versionTag}${descTag}
  </entry>`;
  }

  // ---------- helpers ----------

  isSafeName(s) {
    return typeof s === 'string' && s.length > 0 && !s.includes('/') && !s.includes('\\') && !s.includes('..');
  }
}

function escapeXml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = FeedModule;
