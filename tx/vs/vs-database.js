const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const { VersionUtilities } = require('../../library/version-utilities');
const ValueSet = require("../library/valueset");

// Columns that can be returned directly without parsing JSON
const INDEXED_COLUMNS = ['id', 'url', 'version', 'date', 'description', 'name', 'publisher', 'status', 'title'];

/**
 * Shared database layer for ValueSet providers
 * Handles SQLite operations for indexing and searching ValueSets
 */
class ValueSetDatabase {
  vsCount;

  /**
   * @param {string} dbPath - Path to the SQLite database file
   */
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  /**
   * Check if the SQLite database already exists
   * @returns {Promise<boolean>}
   */
  async exists() {
    try {
      await fs.access(this.dbPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create the SQLite database with required schema
   * @returns {Promise<void>}
   */
  async create() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to create database: ${err.message}`));
          return;
        }

        // Create tables
        db.serialize(() => {
          // Main value sets table
          db.run(`
              CREATE TABLE valuesets (
                                         id TEXT PRIMARY KEY,
                                         url TEXT,
                                         version TEXT,
                                         date TEXT,
                                         description TEXT,
                                         effectivePeriod_start TEXT,
                                         effectivePeriod_end TEXT,
                                         expansion_identifier TEXT,
                                         name TEXT,
                                         publisher TEXT,
                                         status TEXT,
                                         title TEXT,
                                         content TEXT NOT NULL,
                                         last_seen INTEGER DEFAULT (strftime('%s', 'now'))
              )
          `);

          // Identifiers table (0..* Identifier)
          db.run(`
              CREATE TABLE valueset_identifiers (
                                                    valueset_id TEXT,
                                                    system TEXT,
                                                    value TEXT,
                                                    use_code TEXT,
                                                    type_system TEXT,
                                                    type_code TEXT,
                                                    FOREIGN KEY (valueset_id) REFERENCES valuesets(url)
              )
          `);

          // Jurisdictions table (0..* CodeableConcept with 0..* Coding)
          db.run(`
              CREATE TABLE valueset_jurisdictions (
                                                      valueset_id TEXT,
                                                      system TEXT,
                                                      code TEXT,
                                                      display TEXT,
                                                      FOREIGN KEY (valueset_id) REFERENCES valuesets(url)
              )
          `);

          // Systems table (from compose.include[].system)
          db.run(`
              CREATE TABLE valueset_systems (
                                                valueset_id TEXT,
                                                system TEXT,
                                                FOREIGN KEY (valueset_id) REFERENCES valuesets(url)
              )
          `);

          // Create indexes for better search performance
          db.run('CREATE INDEX idx_valuesets_url ON valuesets(url, version)');
          db.run('CREATE INDEX idx_valuesets_version ON valuesets(version)');
          db.run('CREATE INDEX idx_valuesets_status ON valuesets(status)');
          db.run('CREATE INDEX idx_valuesets_name ON valuesets(name)');
          db.run('CREATE INDEX idx_valuesets_title ON valuesets(title)');
          db.run('CREATE INDEX idx_valuesets_publisher ON valuesets(publisher)');
          db.run('CREATE INDEX idx_valuesets_last_seen ON valuesets(last_seen)');
          db.run('CREATE INDEX idx_identifiers_system ON valueset_identifiers(system)');
          db.run('CREATE INDEX idx_identifiers_value ON valueset_identifiers(value)');
          db.run('CREATE INDEX idx_jurisdictions_system ON valueset_jurisdictions(system)');
          db.run('CREATE INDEX idx_jurisdictions_code ON valueset_jurisdictions(code)');
          db.run('CREATE INDEX idx_systems_system ON valueset_systems(system)');

          db.close((err) => {
            if (err) {
              reject(new Error(`Failed to close database after creation: ${err.message}`));
            } else {
              resolve();
            }
          });
        });
      });
    });
  }

  /**
   * Insert or update a single ValueSet in the database
   * @param {Object} valueSet - The ValueSet resource
   * @returns {Promise<void>}
   */
  async upsertValueSet(valueSet) {
    if (!valueSet.url) {
      throw new Error('ValueSet must have a url property');
    }

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to open database: ${err.message}`));
          return;
        }

        // Step 1: Delete existing related records
        db.run('DELETE FROM valueset_identifiers WHERE valueset_id = ?', [valueSet.id], (err) => {
          if (err) {
            db.close();
            reject(new Error(`Failed to delete identifiers: ${err.message}`));
            return;
          }

          db.run('DELETE FROM valueset_jurisdictions WHERE valueset_id = ?', [valueSet.id], (err) => {
            if (err) {
              db.close();
              reject(new Error(`Failed to delete jurisdictions: ${err.message}`));
              return;
            }

            db.run('DELETE FROM valueset_systems WHERE valueset_id = ?', [valueSet.id], (err) => {
              if (err) {
                db.close();
                reject(new Error(`Failed to delete systems: ${err.message}`));
                return;
              }

              // Step 2: Insert main record
              const effectiveStart = valueSet.effectivePeriod?.start || null;
              const effectiveEnd = valueSet.effectivePeriod?.end || null;
              const expansionId = valueSet.expansion?.identifier || null;

              db.run(`
                  INSERT OR REPLACE INTO valuesets (
                  id, url, version, date, description, effectivePeriod_start, effectivePeriod_end,
                  expansion_identifier, name, publisher, status, title, content, last_seen
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
              `, [
                valueSet.id,
                valueSet.url,
                valueSet.version || null,
                valueSet.date || null,
                valueSet.description || null,
                effectiveStart,
                effectiveEnd,
                expansionId,
                valueSet.name || null,
                valueSet.publisher || null,
                valueSet.status || null,
                valueSet.title || null,
                JSON.stringify(valueSet)
              ], (err) => {
                if (err) {
                  db.close();
                  reject(new Error(`Failed to insert main record: ${err.message}`));
                  return;
                }

                // Step 3: Insert related records
                this._insertRelatedRecords(db, valueSet, resolve, reject);
              });
            });
          });
        });
      });
    });
  }

  /**
   * Insert related records for a ValueSet
   * @param {sqlite3.Database} db - Database connection
   * @param {Object} valueSet - ValueSet resource
   * @param {Function} resolve - Promise resolve function
   * @param {Function} reject - Promise reject function
   * @private
   */
  _insertRelatedRecords(db, valueSet, resolve, reject) {
    let pendingOperations = 0;
    let hasError = false;

    const operationComplete = () => {
      pendingOperations--;
      if (pendingOperations === 0 && !hasError) {
        db.close();
        resolve();
      }
    };

    const operationError = (err) => {
      if (!hasError) {
        hasError = true;
        db.close();
        reject(err);
      }
    };

    // Insert identifiers
    if (valueSet.identifier) {
      const identifiers = Array.isArray(valueSet.identifier) ? valueSet.identifier : [valueSet.identifier];
      for (const id of identifiers) {
        pendingOperations++;
        const typeSystem = id.type?.coding?.[0]?.system || null;
        const typeCode = id.type?.coding?.[0]?.code || null;

        db.run(`
            INSERT INTO valueset_identifiers (
                valueset_id, system, value, use_code, type_system, type_code
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          valueSet.id,
          id.system || null,
          id.value || null,
          id.use || null,
          typeSystem,
          typeCode
        ], (err) => {
          if (err) operationError(new Error(`Failed to insert identifier: ${err.message}`));
          else operationComplete();
        });
      }
    }

    // Insert jurisdictions
    if (valueSet.jurisdiction) {
      for (const jurisdiction of valueSet.jurisdiction) {
        if (jurisdiction.coding) {
          for (const coding of jurisdiction.coding) {
            pendingOperations++;
            db.run(`
                INSERT INTO valueset_jurisdictions (
                    valueset_id, system, code, display
                ) VALUES (?, ?, ?, ?)
            `, [
              valueSet.id,
              coding.system || null,
              coding.code || null,
              coding.display || null
            ], (err) => {
              if (err) operationError(new Error(`Failed to insert jurisdiction: ${err.message}`));
              else operationComplete();
            });
          }
        }
      }
    }

    // Insert systems from compose.include
    if (valueSet.compose?.include) {
      for (const include of valueSet.compose.include) {
        if (include.system) {
          pendingOperations++;

          db.run(`
              INSERT INTO valueset_systems (valueset_id, system) VALUES (?, ?)
          `, [valueSet.id, include.system], function(err) {
            if (err) {
              operationError(new Error(`Failed to insert system: ${err.message}`));
            } else {
              operationComplete();
            }
          });
        }
      }
    }

    // If no pending operations, close immediately
    if (pendingOperations === 0) {
      db.close();
      resolve();
    }
  }

  /**
   * Insert multiple ValueSets in a batch operation
   * @param {Array<Object>} valueSets - Array of ValueSet resources
   * @returns {Promise<void>}
   */
  async batchUpsertValueSets(valueSets) {
    if (valueSets.length === 0) {
      return;
    }

    // Process sequentially to avoid database locking
    for (const valueSet of valueSets) {
      await this.upsertValueSet(valueSet);
    }
  }

  /**
   * Load all ValueSets from the database
   * @returns {Promise<Map<string, Object>>} Map of all ValueSets keyed by various combinations
   */
  async loadAllValueSets(source) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(new Error(`Failed to open database for loading: ${err.message}`));
          return;
        }

        db.all('SELECT id, url, version, content FROM valuesets', [], (err, rows) => {
          if (err) {
            db.close();
            reject(new Error(`Failed to load value sets: ${err.message}`));
            return;
          }

          try {
            this.vsCount = rows.length;
            const valueSetMap = new Map();

            for (const row of rows) {
              const valueSet = new ValueSet(JSON.parse(row.content));
              valueSet.sourcePackage = source;

              // Store by URL and id alone
              valueSetMap.set(row.url, valueSet);
              valueSetMap.set(row.id, valueSet);

              if (row.version) {
                // Store by url|version
                const versionKey = `${row.url}|${row.version}`;
                valueSetMap.set(versionKey, valueSet);

                // If version is semver, also store by url|major.minor
                try {
                  if (VersionUtilities.isSemVer(row.version)) {
                    const majorMinor = VersionUtilities.getMajMin(row.version);
                    if (majorMinor) {
                      const majorMinorKey = `${row.url}|${majorMinor}`;
                      valueSetMap.set(majorMinorKey, valueSet);
                    }
                  }
                } catch (error) {
                  // Ignore version parsing errors, just don't add major.minor key
                }
              }
            }

            db.close((err) => {
              if (err) {
                reject(new Error(`Failed to close database after loading: ${err.message}`));
              } else {
                resolve(valueSetMap);
              }
            });
          } catch (error) {
            db.close();
            reject(new Error(`Failed to parse value set content: ${error.message}`));
          }
        });
      });
    });
  }

  /**
   * Search for ValueSets based on criteria
   * @param {Array<{name: string, value: string}>} searchParams - Search criteria
   * @param {Array<string>|null} elements - Optional list of elements to return (for optimization)
   * @returns {Promise<Array<Object>>} List of matching ValueSets
   */
  async search(spaceId, searchParams, elements = null) {
    // Check if we can optimize by selecting only indexed columns
    const canOptimize = elements && elements.length > 0 &&
      elements.every(e => INDEXED_COLUMNS.includes(e));

    // Always include 'id' in the columns to select when optimizing
    const columnsToSelect = canOptimize
      ? (elements.includes('id') ? elements : ['id', ...elements])
      : null;

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(new Error(`Failed to open database for search: ${err.message}`));
          return;
        }

        const { query, params } = this._buildSearchQuery(searchParams, columnsToSelect);

        db.all(query, params, (err, rows) => {
          if (err) {
            db.close();
            reject(new Error(`Search query failed: ${err.message}`));
            return;
          }

          try {
            let results;
            if (canOptimize) {
              // Construct objects directly from columns - much faster!
              results = rows.map(row => {
                const obj = { resourceType: 'ValueSet' };
                for (const elem of columnsToSelect) {
                  if (row[elem] !== null && row[elem] !== undefined) {
                    if (elem === 'id' && spaceId) {
                      obj[elem] = `${spaceId}-${row[elem]}`;
                    } else {
                      obj[elem] = row[elem];
                    }
                  }
                }
                return obj;
              });
            } else {
              // Fall back to parsing JSON
              results = rows.map(row => {
                const parsed = JSON.parse(row.content);
                // Prefix id with spaceId if provided
                if (spaceId && parsed.id) {
                  parsed.id = `${spaceId}-${parsed.id}`;
                }
                return parsed;
              });
            }

            db.close((err) => {
              if (err) {
                reject(new Error(`Failed to close database after search: ${err.message}`));
              } else {
                resolve(results);
              }
            });
          } catch (error) {
            db.close();
            reject(new Error(`Failed to parse search results: ${error.message}`));
          }
        });
      });
    });
  }

  /**
   * Delete ValueSets that weren't seen in the latest scan
   * @param {number} cutoffTimestamp - Unix timestamp, delete records older than this
   * @returns {Promise<number>} Number of records deleted
   */
  async deleteOldValueSets(cutoffTimestamp) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to open database for cleanup: ${err.message}`));
          return;
        }

        // Get URLs to delete first
        db.all('SELECT url FROM valuesets WHERE last_seen < ?', [cutoffTimestamp], (err, rows) => {
          if (err) {
            db.close();
            reject(new Error(`Failed to find old records: ${err.message}`));
            return;
          }

          if (rows.length === 0) {
            db.close();
            resolve(0);
            return;
          }

          const idsToDelete = rows.map(row => row.id);
          let deletedCount = 0;
          let pendingDeletes = 0;
          let hasError = false;

          const deleteComplete = () => {
            pendingDeletes--;
            if (pendingDeletes === 0 && !hasError) {
              // Finally delete main records
              db.run('DELETE FROM valuesets WHERE last_seen < ?', [cutoffTimestamp], function(err) {
                if (err) {
                  db.close();
                  reject(new Error(`Failed to delete old records: ${err.message}`));
                } else {
                  deletedCount = this.changes;
                  db.close();
                  resolve(deletedCount);
                }
              });
            }
          };

          const deleteError = (err) => {
            if (!hasError) {
              hasError = true;
              db.close();
              reject(err);
            }
          };

          // Delete related records first
          const placeholders = idsToDelete.map(() => '?').join(',');

          pendingDeletes = 3; // identifiers, jurisdictions, systems

          db.run(`DELETE FROM valueset_identifiers WHERE valueset_id IN (${placeholders})`, idsToDelete, (err) => {
            if (err) deleteError(new Error(`Failed to delete identifier records: ${err.message}`));
            else deleteComplete();
          });

          db.run(`DELETE FROM valueset_jurisdictions WHERE valueset_id IN (${placeholders})`, idsToDelete, (err) => {
            if (err) deleteError(new Error(`Failed to delete jurisdiction records: ${err.message}`));
            else deleteComplete();
          });

          db.run(`DELETE FROM valueset_systems WHERE valueset_id IN (${placeholders})`, idsToDelete, (err) => {
            if (err) deleteError(new Error(`Failed to delete system records: ${err.message}`));
            else deleteComplete();
          });
        });
      });
    });
  }

  /**
   * Get statistics about the database
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(new Error(`Failed to open database for statistics: ${err.message}`));
          return;
        }

        const queries = [
          'SELECT COUNT(*) as total FROM valuesets',
          'SELECT status, COUNT(*) as count FROM valuesets GROUP BY status',
          'SELECT COUNT(DISTINCT system) as systems FROM valueset_systems'
        ];

        const results = {};
        let completed = 0;

        const checkComplete = () => {
          completed++;
          if (completed === queries.length) {
            db.close();
            resolve(results);
          }
        };

        // Total count
        db.get(queries[0], [], (err, row) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          results.totalValueSets = row.total;
          checkComplete();
        });

        // Status breakdown
        db.all(queries[1], [], (err, rows) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          results.byStatus = {};
          for (const row of rows) {
            results.byStatus[row.status || 'null'] = row.count;
          }
          checkComplete();
        });

        // System count
        db.get(queries[2], [], (err, row) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          results.totalSystems = row.systems;
          checkComplete();
        });
      });
    });
  }

  /**
   * Build SQL query for search parameters
   * @param {Array<{name: string, value: string}>} searchParams - Search parameters
   * @param {Array<string>|null} elements - If provided, select only these columns (optimization)
   * @returns {{query: string, params: Array}} Query and parameters
   * @private
   */
  _buildSearchQuery(searchParams, elements = null) {
    const conditions = [];
    const params = [];
    const joins = new Set();

    for (const param of searchParams) {
      const { name, value } = param;

      switch (name.toLowerCase()) {
        case 'url':
          conditions.push('v.url = ?');
          params.push(value);
          break;

        case 'version':
          conditions.push('v.version LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'name':
          conditions.push('v.name LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'title':
          conditions.push('v.title LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'status':
          conditions.push('v.status LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'publisher':
          conditions.push('v.publisher LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'description':
          conditions.push('v.description LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'date':
          conditions.push('v.date LIKE ?');
          params.push(`%${value}%`);
          break;

        case 'identifier':
          joins.add('JOIN valueset_identifiers vi ON v.id = vi.valueset_id');
          conditions.push('(vi.system = ? OR vi.value LIKE ?)');
          params.push(value, `%${value}%`);
          break;

        case 'jurisdiction':
          joins.add('JOIN valueset_jurisdictions vj ON v.id = vj.valueset_id');
          conditions.push('(vj.system = ? OR vj.code LIKE ?)');
          params.push(value, `%${value}%`);
          break;

        case 'system':
          joins.add('JOIN valueset_systems vs ON v.id = vs.valueset_id');
          conditions.push('vs.system = ?');
          params.push(value);
          break;

        default:
          // For unknown parameters, try to search in the JSON content
          conditions.push('v.content LIKE ?');
          params.push(`%${value}%`);
          break;
      }
    }

    const joinClause = Array.from(joins).join(' ');
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Select columns based on optimization
    let selectClause;
    if (elements) {
      // Optimized: select only the columns we need
      const columns = elements.map(e => `v.${e}`).join(', ');
      selectClause = `SELECT DISTINCT ${columns}`;
    } else {
      // Full content needed
      selectClause = 'SELECT DISTINCT v.content';
    }

    const query = `
        ${selectClause}
        FROM valuesets v
            ${joinClause}
            ${whereClause}
        ORDER BY v.url
    `;

    return { query, params };
  }

  // eslint-disable-next-line no-unused-vars
  assignIds(ids) {
    // nothing - we don't do any assigning.
  }

  /**
   * Get a list of all ValueSet URLs in the database
   * @returns {Promise<string[]>} Array of ValueSet URLs
   */
  async listAllValueSets() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(new Error(`Failed to open database for listing: ${err.message}`));
          return;
        }

        db.all('SELECT url FROM valuesets ORDER BY url', [], (err, rows) => {
          if (err) {
            db.close();
            reject(new Error(`Failed to list value sets: ${err.message}`));
            return;
          }

          const urls = rows.map(row => row.url);

          db.close((err) => {
            if (err) {
              reject(new Error(`Failed to close database after listing: ${err.message}`));
            } else {
              resolve(urls);
            }
          });
        });
      });
    });
  }
}

module.exports = {
  ValueSetDatabase
};
