# Load test - sends many requests over 3 minutes
param(
    [int]$DurationSeconds = 180,  # 3 minutes
    [int]$ConcurrentJobs = 10,
    [string]$BaseUrl = "http://localhost:3000/tx/r4"
)

$endpoints = @(
    "/metadata",
    "/CodeSystem?_count=10",
    "/ValueSet?_count=10",
    "/CodeSystem/`$lookup?system=http://snomed.info/sct&code=73211009",
    "/CodeSystem/`$lookup?system=http://loinc.org&code=8867-4",
    "/CodeSystem?url=http://snomed.info/sct"
)

$startTime = Get-Date
$endTime = $startTime.AddSeconds($DurationSeconds)
$totalRequests = 0
$successCount = 0
$errorCount = 0

Write-Host "=== Load Test Started ===" -ForegroundColor Cyan
Write-Host "Duration: $DurationSeconds seconds"
Write-Host "Concurrent jobs: $ConcurrentJobs"
Write-Host "Base URL: $BaseUrl"
Write-Host ""

while ((Get-Date) -lt $endTime) {
    $jobs = @()

    for ($i = 0; $i -lt $ConcurrentJobs; $i++) {
        $endpoint = $endpoints | Get-Random
        $url = "$BaseUrl$endpoint"

        $jobs += Start-Job -ScriptBlock {
            param($url)
            try {
                $response = Invoke-WebRequest -Uri $url -Headers @{Accept="application/fhir+json"} -TimeoutSec 30 -ErrorAction Stop
                return @{ Success = $true; StatusCode = $response.StatusCode }
            } catch {
                return @{ Success = $false; Error = $_.Exception.Message }
            }
        } -ArgumentList $url
    }

    # Wait for jobs and collect results
    $results = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job

    foreach ($result in $results) {
        $totalRequests++
        if ($result.Success) {
            $successCount++
        } else {
            $errorCount++
        }
    }

    $elapsed = ((Get-Date) - $startTime).TotalSeconds
    $rps = [math]::Round($totalRequests / $elapsed, 2)
    Write-Host "`rRequests: $totalRequests | Success: $successCount | Errors: $errorCount | RPS: $rps    " -NoNewline
}

$totalTime = ((Get-Date) - $startTime).TotalSeconds
$finalRps = [math]::Round($totalRequests / $totalTime, 2)

Write-Host ""
Write-Host ""
Write-Host "=== Load Test Complete ===" -ForegroundColor Green
Write-Host "Total time: $([math]::Round($totalTime, 2)) seconds"
Write-Host "Total requests: $totalRequests"
Write-Host "Successful: $successCount"
Write-Host "Errors: $errorCount"
Write-Host "Average RPS: $finalRps"
Write-Host "Success rate: $([math]::Round(($successCount / $totalRequests) * 100, 2))%"
