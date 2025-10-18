#!/usr/bin/env pwsh
# Script to open Google Cloud Console API pages

Write-Host "🔧 Opening Google Cloud Console to enable APIs..." -ForegroundColor Cyan
Write-Host ""
Write-Host "You need to enable these APIs:" -ForegroundColor Yellow
Write-Host "  1. Identity Toolkit API" -ForegroundColor Green
Write-Host "  2. Token Service API" -ForegroundColor Green
Write-Host "  3. Cloud Firestore API" -ForegroundColor Green
Write-Host ""
Write-Host "Opening Google Cloud Console..." -ForegroundColor Cyan

# Open Google Cloud Console
$projectId = "nan-diary-6cdba"
$apiLibraryUrl = "https://console.cloud.google.com/apis/library?project=$projectId"

Start-Process $apiLibraryUrl

Write-Host ""
Write-Host "📋 Steps to follow:" -ForegroundColor Yellow
Write-Host "  1. In the search box, type: Identity Toolkit API" -ForegroundColor White
Write-Host "  2. Click on it and click 'ENABLE'" -ForegroundColor White
Write-Host "  3. Go back and search: Token Service API" -ForegroundColor White
Write-Host "  4. Click on it and click 'ENABLE'" -ForegroundColor White
Write-Host "  5. Go back and search: Cloud Firestore API" -ForegroundColor White
Write-Host "  6. Click on it and click 'ENABLE'" -ForegroundColor White
Write-Host ""
Write-Host "✅ After enabling all APIs, close your browser and try again!" -ForegroundColor Green
