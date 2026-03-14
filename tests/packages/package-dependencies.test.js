const sqlite3 = require('sqlite3').verbose();

describe('Package dependencies format', () => {

  // Test that the crawler dependency format matches what the reader expects
  describe('crawler dependency extraction', () => {
    test('dependencies use @ separator (npm convention)', () => {
      // Simulate what the crawler does at package-crawler.js:518-524
      const packageJson = {
        dependencies: {
          'hl7.fhir.r4.core': '4.0.1',
          'hl7.fhir.uv.ips': '1.1.0'
        }
      };

      const dependencies = [];
      for (const [dep, ver] of Object.entries(packageJson.dependencies)) {
        dependencies.push(`${dep}@${ver}`);
      }

      expect(dependencies).toEqual([
        'hl7.fhir.r4.core@4.0.1',
        'hl7.fhir.uv.ips@1.1.0'
      ]);
    });

    test('empty dependencies produces empty array', () => {
      const packageJson = {};
      const dependencies = [];
      if (packageJson.dependencies) {
        for (const [dep, ver] of Object.entries(packageJson.dependencies)) {
          dependencies.push(`${dep}@${ver}`);
        }
      }
      expect(dependencies).toEqual([]);
    });
  });

  // Test that the reader (getPackageDependencies) correctly parses @ format
  describe('dependency parsing with @ separator', () => {
    let db;

    beforeAll((done) => {
      db = new sqlite3.Database(':memory:', (err) => {
        if (err) return done(err);
        db.run(`CREATE TABLE PackageDependencies (
          PackageVersionKey INTEGER NOT NULL,
          Dependency TEXT(128) NOT NULL
        )`, done);
      });
    });

    afterAll((done) => {
      db.close(done);
    });

    test('parses dependencies stored with @ separator', (done) => {
      const deps = [
        [1, 'hl7.fhir.r4.core@4.0.1'],
        [1, 'hl7.fhir.uv.ips@1.1.0'],
        [2, 'hl7.fhir.r5.core@5.0.0']
      ];

      const inserts = deps.map(([key, dep]) =>
        new Promise((resolve, reject) => {
          db.run('INSERT INTO PackageDependencies VALUES (?, ?)', [key, dep],
            (err) => err ? reject(err) : resolve());
        })
      );

      Promise.all(inserts).then(() => {
        // Replicate getPackageDependencies logic from packages.js
        const packageVersionKeys = [1, 2];
        const placeholders = packageVersionKeys.map(() => '?').join(',');
        const sql = `SELECT PackageVersionKey, Dependency FROM PackageDependencies WHERE PackageVersionKey IN (${placeholders})`;

        db.all(sql, packageVersionKeys, (err, rows) => {
          if (err) return done(err);

          const result = {};
          for (const row of rows) {
            if (!result[row.PackageVersionKey]) {
              result[row.PackageVersionKey] = {};
            }
            const dependency = row.Dependency;
            const atIndex = dependency.indexOf('@');
            if (atIndex > 0) {
              const depName = dependency.substring(0, atIndex);
              const depVersion = dependency.substring(atIndex + 1);
              result[row.PackageVersionKey][depName] = depVersion;
            }
          }

          expect(result[1]).toEqual({
            'hl7.fhir.r4.core': '4.0.1',
            'hl7.fhir.uv.ips': '1.1.0'
          });
          expect(result[2]).toEqual({
            'hl7.fhir.r5.core': '5.0.0'
          });
          done();
        });
      });
    });

    test('dependencies with # separator are NOT parsed', (done) => {
      db.run('INSERT INTO PackageDependencies VALUES (?, ?)', [3, 'hl7.fhir.r4.core#4.0.1'], (err) => {
        if (err) return done(err);

        db.all('SELECT PackageVersionKey, Dependency FROM PackageDependencies WHERE PackageVersionKey = 3', [], (err, rows) => {
          if (err) return done(err);

          const result = {};
          for (const row of rows) {
            if (!result[row.PackageVersionKey]) {
              result[row.PackageVersionKey] = {};
            }
            const dependency = row.Dependency;
            const atIndex = dependency.indexOf('@');
            if (atIndex > 0) {
              const depName = dependency.substring(0, atIndex);
              const depVersion = dependency.substring(atIndex + 1);
              result[row.PackageVersionKey][depName] = depVersion;
            }
          }

          // # format should NOT be parsed by the @ reader
          expect(result[3]).toEqual({});
          done();
        });
      });
    });
  });
});
