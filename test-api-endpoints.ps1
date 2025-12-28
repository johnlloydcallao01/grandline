Write-Host "Testing About Page Data Fetching..." -ForegroundColor Cyan
Write-Host ""

# Test the endpoint the Next.js page would use
$testUrls = @(
    "http://localhost:3001/api/company-members",
    "https://cms.grandlinemaritime.com/api/company-members"
)

foreach ($url in $testUrls) {
    Write-Host "Testing: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers @{
            'Authorization' = 'users API-Key db6c3436-72f8-47d0-855a-30112b7e9214'
        } -ErrorAction Stop
        
        Write-Host "  ✓ SUCCESS - Found $($response.totalDocs) members" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Recommendation:" -ForegroundColor Cyan
Write-Host "  Set NEXT_PUBLIC_API_URL=http://localhost:3001/api in .env.local" -ForegroundColor White
Write-Host "  Set PAYLOAD_API_KEY=db6c3436-72f8-47d0-855a-30112b7e9214 in .env.local" -ForegroundColor White
