# Run all test requests against the TX server
$baseUrl = "http://localhost:3000/tx/r4"

Write-Host "=== Testing TX Server ===" -ForegroundColor Cyan

# Health check
Write-Host "`n[1] Health check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/health" | ConvertTo-Json

# Metadata
Write-Host "`n[2] Metadata..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/metadata" -Headers @{Accept="application/fhir+json"} | ConvertTo-Json -Depth 3

# List CodeSystems
Write-Host "`n[3] List CodeSystems (first 5)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/CodeSystem?_count=5" -Headers @{Accept="application/fhir+json"} | ConvertTo-Json -Depth 3

# List ValueSets
Write-Host "`n[4] List ValueSets (first 5)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/ValueSet?_count=5" -Headers @{Accept="application/fhir+json"} | ConvertTo-Json -Depth 3

# SNOMED lookup
Write-Host "`n[5] SNOMED lookup (73211009 - Diabetes)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/CodeSystem/`$lookup?system=http://snomed.info/sct&code=73211009" -Headers @{Accept="application/fhir+json"} | ConvertTo-Json -Depth 5

# LOINC lookup
Write-Host "`n[6] LOINC lookup (8867-4 - Heart rate)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/CodeSystem/`$lookup?system=http://loinc.org&code=8867-4" -Headers @{Accept="application/fhir+json"} | ConvertTo-Json -Depth 5

Write-Host "`n=== All tests completed ===" -ForegroundColor Green
