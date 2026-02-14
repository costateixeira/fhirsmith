# ![🔥](static/FHIRsmith64.png) FHIRsmith - FHIR Server toolkit



This server provides a set of server-side services that are useful for the FHIR Community. The set of are two kinds of services:

## Modules useful to anyone in the community

* (Coming) R4/R6 interconverter
* [tx.fhir.org](tx/README.md) server
* [SHL Server](shl/readme.md) - SHL/VHL support services

## Services useful the community as a whole

* [TX Registry](registry/readme.md) - **Terminology System Registry** as [described by the terminology ecosystem specification](https://build.fhir.org/ig/HL7/fhir-tx-ecosystem-ig)(as running at http://tx.fhir.org/tx-reg)
* [Package server](packages/readme.md) - **NPM-style FHIR package registry** with search, versioning, and downloads, consistent with the FHIR NPM Specification (as running at http://packages2.fhir.org/packages)
* [XIG server](xig/readme.md) -  **Comprehensive FHIR IG analytics** with resource breakdowns by version, authority, and realm (as running at http://packages2.fhir.org/packages)
* [Publisher](publisher/readme.md) - FHIR publishing services (coming)
* [VCL](vcl/readme.md) - **Parse VCL expressions** into FHIR ValueSet resources for http://fhir.org/vcl
* (Coming) Token services

## Build Status
![CI Build](https://github.com/HealthIntersections/fhirsmith/actions/workflows/ci.yml/badge.svg)
[![Release](https://img.shields.io/github/v/release/HealthIntersections/fhirsmith?include_prereleases)](https://github.com/HealthIntersections/fhirsmith/releases)
[![Docker](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/HealthIntersections/fhirsmith/pkgs/container/fhirsmith)

Note: In production, this server always runs behind an nginx reverse proxy, so there's no
in-build support for SSL, rate limiting etc.

## Quick Start

There are 4 executable programs:
* the server (`node server`)
* the test cases (`npm test`)
* the terminology importer (`node --max-old-space-size=8192 tx/importers/tx-import XXX`) - see [Doco](tx/importers/readme.md)
* the test cases generater (`node tx/tests/testcases-generator.js`)

### Data Directory

The server separates code from runtime data. All databases, caches, logs, and downloaded
files are stored in a single data directory. The location is determined by:

1. The `FHIRSMITH_DATA_DIR` environment variable (if set)
2. Otherwise, defaults to `./data` relative to the working directory

The data directory contains (depending on which modules are in use):
* `config.json` — server and module configuration
* `logs/` — server and nginx log files
* `terminology-cache/` — downloaded terminology packages and FHIR packages
* `packages/` — package server database
* `xig/` — XIG database
* `shl/` — SHL databases and certificates
* `registry/` — registry crawler data
* `publisher/` — publisher database and build workspace
* `token/` — token database

During development with a cloned repository, the data directory defaults to `[root]/data`
(the test cases require this setup). When deployed via Docker or npm, the data directory
is provided by the host — see Deployment below.

### Prerequisites
- Node.js 16+
- NPM or Yarn
- Java 17+ (for FHIR validator, also for the test cases)

### Installation

These instructions are for Development. For deployment, see below.

```bash
# Clone the repository
git clone https://github.com/HealthIntersections/FHIRsmith
cd FHIRsmith

# Install dependencies
npm install

# Create required directories
mkdir -p data data/logs

# Copy example configuration
cp config.example.json data/config.json

# Edit configuration as needed
nano data/config.json
```

Each Module has it's own entry in the config, as described by the module

### Basic Configuration

Create a `config.json` file in your data directory (use `config-template.json` as a starting point):

```json
{
  "hostName" : "[descriptive name for the server]",
  "server": {
    "port": 3000,
    "cors": {
      "origin": "*",
      "credentials": true
    }
  },
  "modules": {
    // per modules...
  }
}
```

### Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will be available at `http://localhost:{port}` using the port specified in the config.
In the production servers listed above, the server always sits behind an NGINX server which manages
SSL, security, rate limiting etc.

## Testing

```bash
npm test
```

## Deployment

There are three deployment options: npm global install, Docker, or clone-and-run. All three
use the `FHIRSMITH_DATA_DIR` environment variable to locate the data directory.

### npm Global Install

```bash
# Install globally
npm install -g fhirsmith

# Create a data directory
mkdir -p /var/lib/fhirsmith
cp node_modules/fhirsmith/config-template.json /var/lib/fhirsmith/config.json
# Edit config.json as needed

# Set the data directory and run
export FHIRSMITH_DATA_DIR=/var/lib/fhirsmith
fhirsmith
```

Or run it inline:

```bash
FHIRSMITH_DATA_DIR=/var/lib/fhirsmith fhirsmith
```

### Docker Installation

The server is available as a Docker image. Mount a host directory as the data directory:

```bash
# Pull the latest image
docker pull ghcr.io/healthintersections/fhirsmith:latest

# Create and populate data directory on host
mkdir -p /path/to/data
cp config-template.json /path/to/data/config.json
# Edit config.json as needed

# Run with data directory mounted
docker run -d --name fhirsmith \
  -p 3000:3000 \
  -e FHIRSMITH_DATA_DIR=/app/data \
  -v /path/to/data:/app/data \
  ghcr.io/healthintersections/fhirsmith:latest
```

Available tags:
- `latest`: Latest stable release
- `vX.Y.Z`: Specific version (e.g., `v1.0.0`)
- `cibuild`: Latest build from the main branch

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `FHIRSMITH_DATA_DIR` | Path to the data directory | `./data` |
| `PORT` | Server port (overrides config) | from config.json |
| `NODE_ENV` | Node environment | `production` |

### Windows Installation

You can install as a windows service using [windows-install.js](utilities/windows-install.js). You might need to 
hack that. 

## Releases

This project follows [Semantic Versioning](https://semver.org/) and uses a [CHANGELOG.md](CHANGELOG.md) file to track changes.

### What's in a Release

Each GitHub Release includes:
- **Release notes** extracted from CHANGELOG.md
- **Source code** archives (zip and tar.gz)
- **Docker images** pushed to GitHub Container Registry:
  - `ghcr.io/healthintersections/fhirsmith:latest`
  - `ghcr.io/healthintersections/fhirsmith:vX.Y.Z`
  - `ghcr.io/healthintersections/fhirsmith:X.Y.Z`
- **npm package** published to npmjs.org as `fhirsmith` *(if you add this)*

### Creating a Release

GitHub Actions will automatically:
- Run tests
- Create a GitHub Release with notes from CHANGELOG.md
- Build and publish Docker images with appropriate tags

**Prerequisites:**
- All tests passing on main branch
- CHANGELOG.md updated with changes

**Steps:**
1. Update `CHANGELOG.md` with your changes under a new version section:
```markdown
   ## [vX.Y.Z] - YYYY-MM-DD
   ### Added
   - New feature description
   ### Changed
   - Change description
   ### Fixed
   - Bug fix description
```
2. Update `package.json` to have the same release version

3. Commit your changes:
```bash
   git commit -m "Prepare release vX.Y.Z"
   git push origin main:XXXXXX
```

do it via a PR

4. Tag and push the release:
```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
```

5. Monitor the release:
   - Check [GitHub Actions](https://github.com/HealthIntersections/fhirsmith/actions) for the Release workflow
   - Verify the [GitHub Release](https://github.com/HealthIntersections/fhirsmith/releases) was created
   - Confirm Docker images are available at [GHCR](https://github.com/HealthIntersections/fhirsmith/pkgs/container/fhirsmith)

6. Update `package.json` to have the next release version -SNAPSHOT

**If a release fails:**
- Delete the tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
- Fix the issue
- Re-tag and push

### Creating a Release

## License

[BSD-3](https://opensource.org/license/bsd-3-clause)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Issues:** [GitHub Issues](repository-url/issues)
- **Documentation:** [Wiki](repository-url/wiki)
- **FHIR Community:** [chat.fhir.org](https://chat.fhir.org)