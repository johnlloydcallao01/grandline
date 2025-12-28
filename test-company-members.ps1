Write-Host ""
Write-Host "=== Testing Company Members API ===" -ForegroundColor Green
Write-Host "Endpoint: http://localhost:3001/api/company-members" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/company-members' -Headers @{
        'Authorization' = 'users API-Key db6c3436-72f8-47d0-855a-30112b7e9214'
    }

    Write-Host "SUCCESS: API Response Received!" -ForegroundColor Green
    Write-Host "Total Members: $($response.totalDocs)" -ForegroundColor Cyan
    Write-Host "Active Members: $($response.docs.Count)" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "=== Company Members List ===" -ForegroundColor Yellow
    foreach ($member in $response.docs) {
        Write-Host ""
        Write-Host "[$($member.id)]" -NoNewline -ForegroundColor Magenta
        Write-Host " $($member.firstName) $($member.lastName)" -ForegroundColor White
        Write-Host "    Position: $($member.position)" -ForegroundColor Gray
        Write-Host "    Active: $($member.isActive)" -ForegroundColor Gray
        Write-Host "    Middle Name: $($member.middleName)" -ForegroundColor Gray
        
        if ($member.bio) {
            $bioShort = if ($member.bio.Length -gt 60) { $member.bio.Substring(0, 60) + "..." } else { $member.bio }
            Write-Host "    Bio: $bioShort" -ForegroundColor DarkGray
        }
        
        if ($member.profilePicture) {
            Write-Host "    Profile Picture: YES" -ForegroundColor Green
        } else {
            Write-Host "    Profile Picture: NO" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "=== Test Complete ===" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "ERROR: API Request Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
