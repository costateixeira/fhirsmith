# Fast load test - no pauses, maximum requests
param(
    [int]$DurationSeconds = 180,
    [string]$BaseUrl = "http://localhost:3000/tx/r4"
)

$endpoints = @(
    "/metadata",
    "/CodeSystem?_count=10",
    "/ValueSet?_count=10",
    "/CodeSystem/`$lookup?system=http://snomed.info/sct&code=73211009",
    "/CodeSystem/`$lookup?system=http://loinc.org&code=8867-4"
)

# Use WebClient for speed (faster than Invoke-WebRequest)
$webClient = New-Object System.Net.WebClient
$webClient.Headers.Add("Accept", "application/fhir+json")

$startTime = Get-Date
$endTime = $startTime.AddSeconds($DurationSeconds)
$total = 0
$success = 0
$errors = 0

Write-Host "=== Fast Load Test ===" -ForegroundColor Cyan
Write-Host "Duration: $DurationSeconds seconds | Target: $BaseUrl"
Write-Host "Press Ctrl+C to stop early"
Write-Host ""

while ((Get-Date) -lt $endTime) {
    $endpoint = $endpoints | Get-Random
    $url = "$BaseUrl$endpoint"

    try {
        $null = $webClient.DownloadString($url)
        $success++
    } catch {
        $errors++
    }
    $total++

    # Update display every 100 requests
    if ($total % 100 -eq 0) {
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        $rps = [math]::Round($total / $elapsed, 1)
        $remaining = [math]::Round($DurationSeconds - $elapsed, 0)
        Write-Host "`rRequests: $total | OK: $success | Err: $errors | RPS: $rps | Remaining: ${remaining}s   " -NoNewline
    }
}

$webClient.Dispose()

$totalTime = ((Get-Date) - $startTime).TotalSeconds
$rps = [math]::Round($total / $totalTime, 2)

Write-Host ""
Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Green
Write-Host "Total requests: $total"
Write-Host "Successful: $success"
Write-Host "Errors: $errors"
Write-Host "Duration: $([math]::Round($totalTime, 2))s"
Write-Host "Requests/sec: $rps"
