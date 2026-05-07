# FHIRsmith Extension Tracker Module

Tracks extensions, profiles, and extension usage across FHIR Implementation Guides. IGs submit data via POST, and the module provides browsable views of the collected data.

## Configuration

```json
"ext-tracker": {
  "enabled": true,
  "database": "/var/fhir/data/extension-tracker.db",
  "url": "/ext-tracker"
}
```

- **database**: path to the SQLite database file (auto-created if missing)
- **url** (optional): URL base to mount at (defaults to `/ext-tracker`)

## POST — Submit IG Data

POST JSON to the module root. Required fields: `package`, `version`, `fhirVersion`. Optional: `jurisdiction`, `extensions`, `profiles`, `usage`.

```
POST /ext-tracker
Content-Type: application/json

{
  "package": "hl7.fhir.uv.tx-ecosystem",
  "version": "1.9.1",
  "fhirVersion": "5.0.0",
  "jurisdiction": "001",
  "extensions": [
    { "url": "http://example.org/ext", "title": "My Extension", "types": ["string"] }
  ],
  "profiles": {
    "Patient": [
      { "url": "http://example.org/profile", "title": "My Profile" }
    ]
  },
  "usage": {
    "http://example.org/ext": ["Patient", "Patient.name"]
  }
}
```

Submitting a new version for an existing package replaces the old data entirely — only the latest submission per package is kept.

Duplicate types in extensions are automatically deduplicated.

## GET — Browse Data

- `/ext-tracker` — Summary dashboard with package list
- `/ext-tracker/extensions` — All extensions, filterable by `?package=`
- `/ext-tracker/profiles` — All profiles, filterable by `?resource=` and `?package=`
- `/ext-tracker/usage` — Extension usage, filterable by `?url=` and `?location=`
- `/ext-tracker/package/:name` — Detail page for a specific package

## Dependencies

Requires `better-sqlite3` (`npm install better-sqlite3`).

## Database

The SQLite database is auto-created on first run with five tables: `packages`, `extensions`, `extension_types`, `profiles`, and `usages`. Foreign keys cascade deletes, so removing a package cleans up all related data.
