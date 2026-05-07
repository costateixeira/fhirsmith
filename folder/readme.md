# FHIRsmith Folder Module

Serves static files from one or more directories, with optional authenticated upload via PUT.

## Configuration

Add a `folder` entry under `modules` in your config, following the standard FHIRsmith module pattern:

```json
"folder": {
"enabled": true,
"folders": [
{ "name": "packages", "folder": "/var/fhir/packages", "url": "/packages" },
{ "name": "igs", "folder": "/var/fhir/igs", "url": "/igs", "enabled": false }
]
}
```

The top-level `enabled` controls whether the module loads at all. Each folder entry also supports its own `enabled: false` to disable individual folders without removing them from the config.

- **name**: display name (used in status and logging)
- **folder**: absolute path to the directory to serve
- **url**: URL path to mount at
- **enabled** (optional): set to `false` to skip this entry

Directories that don't exist at startup are skipped with a warning. Zero folders is valid.

## GET — File Serving

Any GET request under the configured URL serves files directly. If the path is a directory, it returns an HTML listing showing subdirectories first, then files with sizes.

## PUT — Authenticated Upload

PUT writes a file to the path specified in the URL. The parent directory is created automatically if it doesn't exist.

All PUT requests require HTTP Basic authentication. Credentials are checked against `.users.json` files (see below).

Special case: uploading `main.zip` or `master.zip` automatically creates a copy named `default.zip` in the same directory.

## .users.json

Authentication for PUT is controlled by `.users.json` files placed anywhere in the served directory tree. Format is a simple JSON object mapping usernames to passwords:

```json
{
  "grahame": "secretpassword",
  "ci-bot": "buildtoken123"
}
```

When a PUT comes in, the module walks up from the target directory to the folder root looking for a `.users.json` file. The first one found that contains a matching username and password grants access. If no match is found at any level, the request is rejected with 403.

This means you can put a `.users.json` at the root to cover everything, or use per-subdirectory files to grant more specific access. `.users.json` files are never served by GET.

## Dependencies

No additional npm dependencies required.
