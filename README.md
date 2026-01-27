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

### Prerequisites
- Node.js 16+ 
- NPM or Yarn
- Java 8+ (for FHIR validator)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fhir-server

# Install dependencies
npm install

# Create required directories
mkdir -p data logs static

# Copy example configuration
cp config.example.json config.json

# Edit configuration as needed
nano config.json
```
Each Module has it's own entry in the config, as described by the module.

### Basic Configuration

Create a `config.json` file (use `config-template.json`):

```json
{
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
In the production servers listed above, the server always sits behind an NGINX server.

## Testing

```bash
npm test
```

You need to provide additional data files for testing:
- (none yet)

## Deployment

### Docker Installation

The server is available as a Docker image:

```bash
# Pull the latest image
docker pull ghcr.io/healthintersections/fhirsmith:latest

# Run with mounted volumes
docker run -d --name fhir-server \
  -p 3000:3000 \
  -v /path/to/config.json:/app/config.json \
  -v /path/to/data:/app/data \
  ghcr.io/healthintersections/fhirsmith:v1.0.0
```

Available tags:
- `latest`: Latest stable release
- `vX.Y.Z`: Specific version (e.g., `v1.0.0`)
- `cibuild`: Latest build from the main branch

### Environment Variables

```bash
export PORT=3000
export NODE_ENV=production
export FHIR_SERVER_CONFIG=/path/to/config.json
```

### Windows Installation

You can install as a windows service using...

## Releases

This project follows [Semantic Versioning](https://semver.org/) and uses a [CHANGELOG.md](CHANGELOG.md) file to track changes.

To create a new release:

1. Update CHANGELOG.md with your changes under a new version section
2. Commit your changes
3. Tag the commit with the new version: `git tag vX.Y.Z`
4. Push the tag: `git push origin vX.Y.Z`

GitHub Actions will automatically:
- Run tests
- Create a GitHub Release with notes from CHANGELOG.md
- Build and publish Docker images with appropriate tags

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
