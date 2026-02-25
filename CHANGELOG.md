# Changelog

All notable changes to the Health Intersections Node Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.5.5] - 2026-02-26

### Changed
- Fix loading problem for multiple versions of the same code system
- Fix url matching in search to be precise

### Tx Conformance Statement

FHIRsmith 0.5.5 passed all 1382 HL7 terminology service tests (modes tx.fhir.org,omop,general,snomed, tests v1.9.0, runner v6.8.1)

## [v0.5.4] - 2026-02-25

This version requires that you delete all package content from the terminology-cache directly
by hand before running this version.

### Changed
- Improved Problem page
- Ignore system version in VSAC value sets
- Improve value set search
- better handling of code systems without a content property

### Tx Conformance Statement

FHIRsmith 0.5.4 passed all 1382 HL7 terminology service tests (modes tx.fhir.org,omop,general,snomed, tests v1.9.0, runner v6.8.1)

## [v0.5.3] - 2026-02-24

### Added
- Page listing logical problems in terminology definitions

### Changed
- Fixed many bugs identified by usage

### Tx Conformance Statement

FHIRsmith 0.5.1 passed all 1382 HL7 terminology service tests (modes tx.fhir.org,omop,general,snomed, tests v1.9.0, runner v6.8.1)

## [v0.5.1] - 2026-02-20

### Added
- Improved logging of startup conditions and failure

### Changed
- Fixed bad cron scheduled processing in XIG module

### Tx Conformance Statement

FHIRsmith 0.5.1 passed all 1288 HL7 terminology service tests (modes tx.fhir.org,omop,general,snomed, tests v1.9.1-SNAPSHOT, runner v6.8.0)

## [v0.5.2] - 2026-02-20

### Changed
- Fixed bad count reference in XIG

### Tx Conformance Statement

FHIRsmith 0.5.2 passed all 1288 HL7 terminology service tests (modes tx.fhir.org,omop,general,snomed, tests v1.9.1-SNAPSHOT, runner v6.8.0)

## [v0.5.0] - 2026-02-19

### Added
- Prototype Implementation of $related operation

### Changed
- A great deal of QA work preparing the server to run tx.fhir.org, which led to 100s of fixes

### Tx Conformance Statement

FHIRsmith passed all 1288 HL7 terminology service tests (modes tx.fhir.org,omop,general,snomed, tests v1.9.1-SNAPSHOT, runner v6.8.0)

## [v0.4.2] - 2026-02-05
### Changed
- Even More testing the release process; some tidy up to testing data

## [v0.4.1] - 2026-02-05
### Changed
- More testing the release process; some tidy up to testing data

## [v0.4.0] - 2026-02-05
### Changed
- Just testing the release process; some tidy up to testing data

## [v0.3.0] - 2026-02-05
### Added
- Add first draft of publishing engine

### Changed
- Move all runtime files to a data directory, where an environment variable says. Existing configurations MUST change
- Finish porting the terminology server
- Lots of QA related changes, and consistency.

## [v0.2.0] - 2026-01-13
### Added
- port tx.fhir.org to FHIRsmith, and pass all the tests

### Changed
- rework logging, testing, etc infrastructure

## [v0.1.1] - 2025-08-21
### Added
- set up ci and release workflows with Docker
- Add tx-reg implementation

### Changed

- rework logging from scratch 

## [v0.1.0] - 2025-08-20

First Documented Release 

### Added
- SHL Module: Support services for SHL and VHL implementations
- VCL Module: Support services for ValueSet Compose Language 
- XIG Module: The Cross-IG Resource server 
- Packages Modules: The server for packages2.fhir.org/packages 
- Testing Infrastructure
