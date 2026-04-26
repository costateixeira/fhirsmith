# ontoserver.app/mcp — MCP Interface Reference

Reference notes for the Ontoserver-hosted terminology MCP server, captured by directly probing the live endpoint at `https://ontoserver.app/mcp` on **2026-04-26**. Intended as input for designing the FHIRsmith terminology MCP server.

## 1. Transport & protocol

| Aspect | Value |
|---|---|
| Endpoint | `https://ontoserver.app/mcp` |
| Legacy alternate | `https://ontoserver.app/sse` (advertised via `Link: </sse>; rel="alternate"; type="text/event-stream"`) |
| Browser landing | `/mcp` serves an HTML page when `Accept: text/html` |
| Transport | MCP **Streamable HTTP** (POST returning `text/event-stream`) |
| Protocol version (advertised) | `2025-06-18` |
| Server identity | `name: "ontoserver-mcp"`, `version: "1.1.0"` |
| Session header | `mcp-session-id` (issued on `initialize`, required on subsequent requests) |
| Required client headers | `Content-Type: application/json`, `Accept: application/json, text/event-stream`, `MCP-Protocol-Version: 2025-06-18` |
| CORS | `*`, exposes `mcp-session-id`; allows `GET, POST, DELETE, OPTIONS`; allows `Content-Type, Accept, mcp-session-id, mcp-protocol-version` headers |
| Auth | None observed (open endpoint) |

A bare `GET` on `/mcp` with `Accept: application/json` returns 406; only the MCP HTTP transport (or HTML browser request) is honoured.

### Server-declared capabilities

```json
{
  "resources": { "listChanged": true },
  "tools":     { "listChanged": true },
  "prompts":   { "listChanged": true }
}
```

### Server instructions returned on initialize

> *IMPORTANT: Do not include patient names, identifiers, or other PII in requests. Use only clinical terms, codes, and general medical concepts.*

This is delivered via the standard MCP `instructions` field on the `initialize` response — worth replicating in FHIRsmith.

## 2. Tools (7)

All tools share `execution: { taskSupport: "forbidden" }`, i.e. synchronous request/response with no long-running task semantics.
All tools advertise both an `inputSchema` and an `outputSchema` (JSON Schema draft-07), and tool results carry both a human-readable `content[].text` block and a machine-readable `structuredContent` object conforming to the `outputSchema`.

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

Output schema: `{ results: [{ code, display }] }`.
Backed conceptually by `ValueSet/$expand` with a text filter.

**Example response** for `system=snomed, query=asthma, limit=2`:

```json
{
  "content": [{ "type": "text", "text": "195967001: Asthma\n400987003: Asthma trigger" }],
  "structuredContent": {
    "results": [
      { "code": "195967001", "display": "Asthma" },
      { "code": "400987003", "display": "Asthma trigger" }
    ]
  }
}
```

### 2.2 `lookup_concept`

> Get detailed information about a concept including display name, definition, properties, and synonyms.

| Param | Type | Required |
|---|---|---|
| `system` | string | yes |
| `code` | string | yes |
| `version` | string | no |

Output schema: `{ display?, definition?, properties: {[k]: string}, designations: [{ language?, use?, value }] }`.
Backed by `CodeSystem/$lookup`.
The text channel includes display, system label, properties (including SNOMED `normalForm` / `normalFormTerse` when applicable), and designations with language tags.

**Example response** for `system=snomed, code=22298006` (truncated for brevity):

```json
{
  "content": [{ "type": "text", "text": "Code: 22298006\nSystem: SNOMED CT\nDisplay: Myocardial infarction\n\nProperties:\n  116676008: 55641003\n  363698007: 74281007\n  parent: 251061000\n  child: 738061000168100\n  effectiveTime: 20020131\n  moduleId: 900000000000207008\n  normalFormTerse: ===414545008+251061000:{...}\n  normalForm: === 414545008|Ischemic heart disease|+251061000|Myocardial necrosis|:{...}\n\nDesignations:\n  Cardiac infarction (Synonym) [en]\n  Heart attack (Synonym) [en]\n  Myocardial infarction (disorder) (Fully specified name) [en]\n  ..." }],
  "structuredContent": {
    "display": "Myocardial infarction",
    "properties": {
      "116676008": "55641003",
      "363698007": "74281007",
      "parent": "251061000",
      "child": "738061000168100",
      "effectiveTime": "20020131",
      "moduleId": "900000000000207008",
      "normalFormTerse": "===414545008+251061000:{116676008=55641003,363698007=74281007}",
      "normalForm": "=== 414545008|Ischemic heart disease|+251061000|Myocardial necrosis|:{116676008|Associated morphology|=55641003|Infarct|,363698007|Finding site|=74281007|Myocardium structure|}"
    },
    "designations": [
      { "language": "en", "use": "Synonym", "value": "Cardiac infarction" },
      { "language": "en", "use": "Synonym", "value": "Heart attack" },
      { "language": "en", "use": "Fully specified name", "value": "Myocardial infarction (disorder)" }
    ]
  }
}
```

### 2.3 `validate_concept`

> Check if a code is valid in a terminology system and optionally verify its display name.

| Param | Type | Required |
|---|---|---|
| `system` | string | yes |
| `code` | string | yes |
| `display` | string | no |
| `version` | string | no |

Output schema: `{ valid: boolean, display?: string, message?: string }`.
Backed by `CodeSystem/$validate-code`. Example:

```json
{
  "content": [{ "type": "text", "text": "Code: 2345-7\nSystem: LOINC\nValid: Yes\nDisplay: Glucose [Mass/volume] in Serum or Plasma" }],
  "structuredContent": { "valid": true, "display": "Glucose [Mass/volume] in Serum or Plasma" }
}
```

### 2.4 `check_subsumption`

> Check the hierarchical relationship between two concepts. Returns whether codeA subsumes codeB, is subsumed by codeB, they are equivalent, or not related. Not all systems support subsumption.

| Param | Type | Required |
|---|---|---|
| `system` | string | yes |
| `codeA` | string | yes |
| `codeB` | string | yes |
| `version` | string | no |

Output schema: `{ outcome: "equivalent" | "subsumes" | "subsumed-by" | "not-subsumed" }`.
Backed by `CodeSystem/$subsumes`.

```
Outcome: subsumes
56265001 subsumes (is broader than) 22298006
```

### 2.5 `search_codesystems`

> Search for CodeSystems by metadata (name, title, URL, status). Useful for discovering available code systems. Paginated with default page size 100.

| Param | Type | Required | Notes |
|---|---|---|---|
| `name` | string | no | |
| `title` | string | no | |
| `url` | string | no | |
| `status` | enum | no | `draft \| active \| retired \| unknown` |
| `_count` | integer | no | Default 100, min 1, max 1000 |
| `_offset` | integer | no | Default 0 |

Output schema: `{ results: [{ id, url?, name?, title?, status?, version? }], total?, offset, count, hasMore }`. 
A thin wrapper over the FHIR `CodeSystem` search. Output includes a `Total:` line (1029 active CodeSystems on this instance, for context) followed by per-system blocks with title, URL, status. Note: no required parameter, it’ll list all if none given.

### 2.6 `expand_valueset`

> Expand a ValueSet (`$expand` without filter), returning all member concepts. Paginated with default page size 100. Consult `ecl://guide` (SNOMED) or `vcl://guide` (other systems) for ValueSet URL syntax.

| Param | Type | Required | Notes |
|---|---|---|---|
| `valueset` | string | yes | ValueSet URL, e.g. `http://snomed.info/sct?fhir_vs=ecl/<<73211009` |
| `_count` | integer | no | Default 100, min 1, **max 10000** |
| `_offset` | integer | no | Default 0 |
| `activeOnly` | boolean | no | Default: server decides |

Output schema: `{ results: [{ code, display, system? }], total?, offset, count, hasMore }`.
Backed by `ValueSet/$expand`. Complements `search_concepts` for the case where the LLM wants the full set (or a paginated walk) rather than a text-filtered slice.

**Example response** for `valueset=http://snomed.info/sct?fhir_vs=ecl/<<73211009, _count=3`:

```json
{
  "content": [{ "type": "text", "text": "Showing 1-3 of 121\n\n609578001: Maturity-onset diabetes of the young, type 11\n609564002: Pre-existing type 1 diabetes in pregnancy\n609566000: Pregnancy and type 1 diabetes\n\nMore results available — call again with _offset=3" }],
  "structuredContent": {
    "results": [
      { "code": "609578001", "display": "Maturity-onset diabetes of the young, type 11", "system": "http://snomed.info/sct" },
      { "code": "609564002", "display": "Pre-existing type 1 diabetes in pregnancy", "system": "http://snomed.info/sct" },
      { "code": "609566000", "display": "Pregnancy and type 1 diabetes", "system": "http://snomed.info/sct" }
    ],
    "total": 121, "offset": 0, "count": 3, "hasMore": true
  }
}
```

### 2.7 `find_mappings`

> Map free-text terms to coded concepts using automap strategies. Default target is SNOMED CT. Do not include patient names or identifiers in the term.

| Param | Type | Required | Notes |
|---|---|---|---|
| `term` | string | yes | Free-text term |
| `target` | string | no | ValueSet URL; default `http://snomed.info/sct?fhir_vs` |
| `strategy` | enum | no | `default \| strict \| MML` |
| `minScore` | number | no | 0–1, filter threshold |
| `maxResults` | number | no | |

Output schema: `{ inputTerm, strategyUrl, matches: [{ code, system, display, equivalence?, score?, source? }] }`.
Backed by Ontoserver's automap `ConceptMap/$translate` extension (referenced in output as `http://ontoserver.csiro.au/fhir/ConceptMap/automapstrategy-default`).
This is a **proprietary Ontoserver feature** — there is no standard FHIR equivalent. Output text includes match strength labels like `(inexact)`.

Example:

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

Resources are static documentation — both are quick-reference markdown guides for constructing ValueSet URLs that get passed to `search_concepts.valueset` and `expand_valueset.valueset`.

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

## 4. Prompts (5)

The server exposes a `prompts` capability. Each prompt is a parameterised instruction template that the host can surface to the user; on `prompts/get` the server returns a `messages` array (single user-role text message) with concrete steps for the LLM. All prompts conclude with a PII reminder.

| Name | Required args | Optional args | Purpose |
|---|---|---|---|
| `find-code` | `term` | `system` (default `snomed`) | Find the best terminology code for a clinical term |
| `map-code` | `code`, `fromSystem`, `toSystem` | — | Translate a code between terminology systems |
| `validate-coding` | `code`, `system` | `valueSet` | Validate a coding against a system or ValueSet |
| `explore-hierarchy` | `code` | `system` (default `snomed`) | Walk parents and children of a concept |
| `summary-to-codes` | `text` | `system` (default `snomed`) | Extract coded concepts from a clinical summary |

The prompts orchestrate the existing tools — e.g. `find-code` instructs the LLM to call `search_concepts`, narrow with ECL/VCL if ambiguous, then `lookup_concept` to confirm. They amortise the “how do I use this server well” reasoning across users and sessions.

## 5. Response shape

All tool responses use the v2025-06-18 dual-content shape:

```json
{
  "result": {
    "content": [
      { "type": "text", "text": "...formatted human-readable response..." }
    ],
    "structuredContent": { /* matches the tool's outputSchema */ }
  }
}
```

The text payload is human-readable and consistent per tool: property codes are colon-prefixed (`22298006: Myocardial infarction`), properties indented two spaces, designations tagged with type and language. The `structuredContent` is the same data in a programmatically parseable form, validated against the tool's declared `outputSchema`.

Paginated tools (`expand_valueset`, `search_codesystems`) wrap their text content with a `Showing {offset+1}-{offset+count} of {total}` header and, when `hasMore` is true, a `More results available — call again with _offset={offset+count}` footer — letting an LLM consuming only the text channel still walk pages without parsing `structuredContent`.

No resource links, no embedded resources. No errors observed beyond the standard JSON-RPC error envelope (`-32601 Method not found` for unsupported methods, `-32000` `Unsupported Media Type` if `Content-Type` is wrong).

## 6. Design takeaways for FHIRsmith terminology MCP

Patterns worth keeping:

1. **Seven-tool surface area** — `search_concepts`, `lookup_concept`, `validate_concept`, `check_subsumption`, `search_codesystems`, `expand_valueset`, plus an automap-style mapper. This maps cleanly onto the FHIR terminology operations FHIRsmith already supports (`$expand`, `$lookup`, `$validate-code`, `$subsumes`, `$translate`). The split between text-filtered `search_concepts` and unfiltered paginated `expand_valueset` is a useful pair — the first is for “what's the code for X”, the second is for “show me the contents of this set”.
2. **Alias list for `system`** alongside full URIs — significant ergonomics win for LLMs. FHIRsmith should support at minimum `snomed, loinc, icd10, rxnorm, atc, ucum, cvx`, and probably more given the breadth of code systems supported.
3. **`valueset` parameter on `search_concepts`** that takes an ECL/VCL-encoded ValueSet URL — pushes ValueSet construction into the LLM rather than exposing a separate ValueSet expansion tool. Clean.
4. **ECL and VCL quick-reference resources** as MCP resources. These exist purely so the LLM can self-serve learning the URL syntax. Cheap to include and clearly useful. FHIRsmith should ship equivalents — and given Grahame's recent ECL filter work in `cs-snomed.js`, ECL support is already in place.
5. **`instructions` field on initialize** carrying a PII warning. Worth including; healthcare-specific MCP servers all need this.
6. **Both `text` content and `structuredContent`**. Programmatic clients get the validated object; LLM-only clients get a clean human-readable form. Output-schema-validated `structuredContent` is a 2025-06-18 feature that's cheap to ship and worth shipping.
7. **Prompts that orchestrate tool sequences** (`find-code`, `map-code`, `validate-coding`, `explore-hierarchy`, `summary-to-codes`) — encode best-practice tool-use patterns once, server-side, instead of relying on every host to figure them out. Particularly valuable for the “narrow with ECL when ambiguous” idiom.
8. **Pagination with explicit `offset/count/hasMore`** in `structuredContent`, plus standard `_count`/`_offset` params. Lets agents walk large sets safely.

Patterns worth reconsidering:

1. **`search_codesystems` has no required parameter** — easy footgun for an LLM to dump everything (1029+ entries). Consider requiring at least one filter, or capping the page size more aggressively for the unfiltered case.
2. **`find_mappings` is Ontoserver-proprietary**. FHIRsmith equivalent should either be built on `$translate` with declared ConceptMaps, or skipped in v1.
3. **`expand_valueset.activeOnly`** is the only “server decides” default in the surface — most other defaults are explicit. Worth deciding upfront for FHIRsmith and documenting.
4. **No `terminology_capabilities` tool** exposing `metadata` / `TerminologyCapabilities`. FHIRsmith already supports `TerminologyCapabilities`; surfacing it would let agents probe what a given deployment can do (which CodeSystems, which ops) before calling.

Open questions for FHIRsmith design:

- Do we want a `translate_concept` tool that wraps `ConceptMap/$translate` for declared maps (e.g. SNOMED → ICD-10-AM)? Different from automap. Note that `map-code` here is a *prompt*, not a tool — it currently relies on the LLM gluing things together.
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

SESSION=...   # value of mcp-session-id response header

# 2. Confirm initialization
curl -X POST https://ontoserver.app/mcp \
  -H "mcp-session-id: $SESSION" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'

# 3. List tools / resources / prompts
for METHOD in tools/list resources/list prompts/list resources/templates/list; do
  curl -X POST https://ontoserver.app/mcp \
    -H "mcp-session-id: $SESSION" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "MCP-Protocol-Version: 2025-06-18" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"$METHOD\"}"
done

# 4. Call a tool (note structuredContent in the result)
curl -X POST https://ontoserver.app/mcp \
  -H "mcp-session-id: $SESSION" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":10,"method":"tools/call","params":{
        "name":"validate_concept",
        "arguments":{"system":"loinc","code":"2345-7"}}}'
```

Responses come back as SSE frames — strip the `event: message\ndata: ` prefix to get JSON-RPC.
