# ontoserver.app/mcp — MCP Interface Reference

Reference notes for the Ontoserver-hosted terminology MCP server, captured by directly probing the live endpoint at `https://ontoserver.app/mcp` on 2026-04-25. Intended as input for designing the FHIRsmith terminology MCP server.

## 1. Transport & protocol

| Aspect | Value |
|---|---|
| Endpoint | `https://ontoserver.app/mcp` |
| Transport | MCP **Streamable HTTP** (POST returning `text/event-stream`) |
| Protocol version (advertised) | `2025-06-18` |
| Server identity | `name: "terminology"`, `version: "1.0.0"` |
| Session header | `mcp-session-id` (issued on `initialize`, required on subsequent requests) |
| Required client headers | `Content-Type: application/json`, `Accept: application/json, text/event-stream`, `MCP-Protocol-Version: 2025-06-18` |
| CORS | `*`, exposes `mcp-session-id`; allows `GET, POST, DELETE, OPTIONS` |
| Auth | None observed (open endpoint) |

A bare `GET` returns 406 — the endpoint only speaks the MCP HTTP transport. Behind Cloudflare; IPv6 reachable.

### Server-declared capabilities

```json
{
  "resources": { "listChanged": true },
  "tools":     { "listChanged": true }
}
```

No `prompts` capability (`prompts/list` returns method-not-found).

### Server instructions returned on initialize

> *IMPORTANT: Do not include patient names, identifiers, or other PII in requests. Use only clinical terms, codes, and general medical concepts.*

This is delivered via the standard MCP `instructions` field on the `initialize` response — worth replicating in FHIRsmith.

## 2. Tools (6)

All tools share `execution: { taskSupport: "forbidden" }`, i.e. they are synchronous request/response with no long-running task semantics.

All tools that take a `system` parameter accept either:

- A **CodeSystem URI** (e.g. `http://www.whocc.no/atc`, `urn:oid:...`), or
- An **alias**: `snomed`, `loinc`, `icd10`, `rxnorm`, `atc`, `ucum`, `cpt`, `ndc`, `cvx`, `icd10cm`, `icd10pcs`, `icd10am`.

All tools that take a `version` parameter treat it as system-specific (edition string).

### 2.1 `search_concepts`

> Search concepts by term in a terminology system. Returns matching concepts with codes and display names. Use `valueset` to constrain search to a specific ValueSet (e.g. SNOMED descendants). Do not include PII in queries.

| Param | Type | Required | Notes |
|---|---|---|---|
| `system` | string | yes | URI or alias |
| `query` | string | yes | Search term, e.g. `"heart attack"` |
| `limit` | number | no | Default 10 |
| `version` | string | no | |
| `valueset` | string | no | ValueSet URL — see ECL/VCL guides below |
| `includeInactive` | boolean | no | Default `false` |

Backed conceptually by `ValueSet/$expand` with a text filter.

**Example response** for `system=snomed, query=asthma, limit=3`:

```
195967001: Asthma
400987003: Asthma trigger
225057002: Brittle asthma
```

### 2.2 `lookup_concept`

> Get detailed information about a concept including display name, definition, properties, and synonyms.

| Param | Type | Required |
|---|---|---|
| `system` | string | yes |
| `code` | string | yes |
| `version` | string | no |

Backed by `CodeSystem/$lookup`. Output includes display, system label, properties (including SNOMED `normalForm` / `normalFormTerse` when applicable), and designations with language tags. Example:

```
Code: 22298006
System: SNOMED CT
Display: Myocardial infarction

Properties:
  116676008: 55641003
  363698007: 74281007
  parent: 251061000
  child: 738061000168100
  effectiveTime: 20020131
  ...
  normalForm: === 414545008|Ischemic heart disease|+251061000|...

Designations:
  Cardiac infarction (Synonym) [en]
  Heart attack (Synonym) [en]
  ...
```

### 2.3 `validate_concept`

> Check if a code is valid in a terminology system and optionally verify its display name.

| Param | Type | Required |
|---|---|---|
| `system` | string | yes |
| `code` | string | yes |
| `display` | string | no |
| `version` | string | no |

Backed by `CodeSystem/$validate-code`. Example response:

```
Code: 2345-7
System: LOINC
Valid: Yes
Display: Glucose [Mass/volume] in Serum or Plasma
```

### 2.4 `check_subsumption`

> Check the hierarchical relationship between two concepts. Returns whether codeA subsumes codeB, is subsumed by codeB, they are equivalent, or not related. Not all systems support subsumption.

| Param | Type | Required |
|---|---|---|
| `system` | string | yes |
| `codeA` | string | yes |
| `codeB` | string | yes |
| `version` | string | no |

Backed by `CodeSystem/$subsumes`. Example output:

```
Outcome: subsumes
56265001 subsumes (is broader than) 22298006
```

### 2.5 `search_codesystems`

> Search for CodeSystems by metadata (name, title, URL, status). Useful for discovering available code systems.

| Param | Type | Required | Notes |
|---|---|---|---|
| `name` | string | no | |
| `title` | string | no | |
| `url` | string | no | |
| `status` | enum | no | `draft \| active \| retired \| unknown` |
| `_count` | number | no | Default 10 |

A thin wrapper over the FHIR `CodeSystem` search. Output includes a `Total:` line (1029 active CodeSystems on this instance, for context) followed by per-system blocks with title, URL, status. Note: no required parameter, it’ll list all if none given.

### 2.6 `find_mappings`

> Map free-text terms to coded concepts using automap strategies. Default target is SNOMED CT. Do not include patient names or identifiers in the term.

| Param | Type | Required | Notes |
|---|---|---|---|
| `term` | string | yes | Free-text term |
| `target` | string | no | ValueSet URL; default `http://snomed.info/sct?fhir_vs` |
| `strategy` | enum | no | `default \| strict \| MML` |
| `minScore` | number | no | 0–1, filter threshold |
| `maxResults` | number | no | |

Backed by Ontoserver's automap `ConceptMap/$translate` extension (referenced in output as `http://ontoserver.csiro.au/fhir/ConceptMap/automapstrategy-default`). This is a **proprietary Ontoserver feature** — there is no standard FHIR equivalent. Output includes match strength labels like `(inexact)`. Example:

```
Mappings for "heart attack" (strategy: default):

22298006: Myocardial infarction (disorder) (inexact)
  System: http://snomed.info/sct
  Source: http://ontoserver.csiro.au/fhir/ConceptMap/automapstrategy-default
...
```

For FHIRsmith, options here are:
1. Skip this tool.
2. Implement a simpler equivalent based on `$expand` text search ranked by match score.
3. Implement the full automap (likely out of scope short-term).

## 3. Resources (2)

Resources are static documentation — both are quick-reference markdown guides for constructing ValueSet URLs that get passed to `search_concepts.valueset`.

| URI | Name | Purpose |
|---|---|---|
| `ecl://guide` | `ecl-guide` | SNOMED CT Expression Constraint Language reference |
| `vcl://guide` | `vcl-guide` | ValueSet Compose Language reference (generic, any CodeSystem) |

No resource templates. No resources for actual terminology data — code systems are queried via tools, not exposed as resources.

### 3.1 `ecl://guide` highlights

Tells the LLM how to build URLs of the form:

```
http://snomed.info/sct?fhir_vs=ecl/{URL-encoded ECL expression}
```

Documents hierarchy operators (`<`, `<<`, `>`, `>>`, `<!`, `>!`), set operations (`AND`, `OR`, `MINUS`), refset membership (`^`), attribute refinements (`: attr = val`, grouped with `{...}`, wildcard `*`), and percent-encoding for `<`, `>`, `:`, `=`, space.

### 3.2 `vcl://guide` highlights

Generic version for any CodeSystem. URL form:

```
http://fhir.org/VCL?v1={URL-encoded VCL expression}
```

Documents hierarchy (`<<`, `<`, `>>`, `<!`, `!!<`), set operations (`,` AND, `;` OR, `-` exclusion, `()` grouping), membership (`^`, `~^`, `~<<`), property predicates (`prop = val`, `prop?true`, `.prop` reverse, `*`), regex (`/regex/`), and CodeSystem scoping `(uri)expr`. Also covers quoting rules for non-alphanumerics.

VCL is from the FHIR IG Guidance build at `build.fhir.org/ig/FHIR/ig-guidance/vcl.html`.

## 4. Response shape

All tool responses use a single `text` content block:

```json
{
  "result": {
    "content": [
      { "type": "text", "text": "...formatted response..." }
    ]
  }
}
```

The text payload is **human-readable formatted, not structured JSON**. Codes are colon-prefixed (`22298006: Myocardial infarction`), properties indented two spaces, designations tagged with type and language. This is a deliberate LLM-friendly format optimised for in-context consumption rather than programmatic parsing.

No `structuredContent`, no resource links, no embedded resources. No errors observed beyond the standard JSON-RPC `-32601 Method not found` for `prompts/list`.

## 5. Design takeaways for FHIRsmith terminology MCP

Patterns worth keeping:

1. **Six-tool surface area**: `search_concepts`, `lookup_concept`, `validate_concept`, `check_subsumption`, `search_codesystems`, plus an automap-style mapper. This is a tight, well-shaped set that maps cleanly onto the FHIR terminology operations FHIRsmith already supports (`$expand`, `$lookup`, `$validate-code`, `$subsumes`, `$translate`).
2. **Alias list for `system`** alongside full URIs — significant ergonomics win for LLMs. FHIRsmith should support at minimum `snomed, loinc, icd10, rxnorm, atc, ucum, cvx`, and probably more given the breadth of code systems supported.
3. **`valueset` parameter on `search_concepts`** that takes an ECL/VCL-encoded ValueSet URL — pushes ValueSet construction into the LLM rather than exposing a separate ValueSet expansion tool. Clean.
4. **ECL and VCL quick-reference resources** as MCP resources. These exist purely so the LLM can self-serve learning the URL syntax. Cheap to include and clearly useful. FHIRsmith should ship equivalents — and given Grahame's recent ECL filter work in `cs-snomed.js`, ECL support is already in place.
5. **`instructions` field on initialize** carrying a PII warning. Worth including; healthcare-specific MCP servers all need this.
6. **Plain-text formatted output** with consistent shapes per tool. LLM-friendly. Less useful for programmatic consumers but those have FHIR REST already.

Patterns worth reconsidering:

1. **No structured content alongside text**. The 2025-06-18 spec supports `structuredContent`; emitting both would let programmatic clients parse cleanly while keeping the LLM-readable text. Cost is small.
2. **`search_codesystems` has no required parameter** — easy footgun for an LLM to dump everything. Consider requiring at least one filter, or always paginating.
3. **`find_mappings` is Ontoserver-proprietary**. FHIRsmith equivalent should either be built on `$translate` with declared ConceptMaps, or skipped in v1.
4. **No prompts capability**. There's a case for shipping a couple of prompts (e.g. "find the best SNOMED code for this clinical phrase", "expand this ValueSet and explain the constraint") — they amortise the LLM thinking cost across users.
5. **No ValueSet `$expand` exposed directly**. Folded into `search_concepts` via the `valueset` param. Reasonable, but consider whether a dedicated `expand_valueset` tool (without a query term) is warranted for cases where the LLM wants to see the full set.

Open questions for FHIRsmith design:

- Do we want a `translate_concept` tool that wraps `ConceptMap/$translate` for declared maps (e.g. SNOMED → ICD-10-AM)? Different from automap.
- Should there be a `terminology_capabilities` tool exposing `metadata` / `TerminologyCapabilities`? The Ontoserver MCP doesn't expose this but FHIRsmith already supports `TerminologyCapabilities`.
- Resources for IPS-related ValueSets? Given the IPS work and the package management infrastructure, exposing canonical ValueSet/CodeSystem package metadata as resources might be a FHIRsmith differentiator.
- Test fixture — the [Comparing FHIR Terminology Services](https://en.rath.asia/blog/2025/04/27/comparing-3-fhir-terminology-services/) blog post covers the kind of operations a terminology MCP needs to handle competently and could seed an eval set.

## 6. Reproducing this probe

```bash
# 1. Initialize (capture mcp-session-id from response headers)
curl -i -X POST https://ontoserver.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{
        "protocolVersion":"2025-06-18","capabilities":{},
        "clientInfo":{"name":"probe","version":"0.1"}}}'

# 2. Confirm initialization
curl -X POST https://ontoserver.app/mcp \
  -H "mcp-session-id: $SESSION" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'

# 3. List tools / resources
curl -X POST https://ontoserver.app/mcp \
  -H "mcp-session-id: $SESSION" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

Responses come back as SSE frames — strip the `event: message\ndata: ` prefix to get JSON-RPC.