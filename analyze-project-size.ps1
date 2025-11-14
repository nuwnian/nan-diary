# Analyze project structure and size

Write-Host "=== PROJECT SIZE ANALYSIS ===" -ForegroundColor Cyan
Write-Host ""

# Key directories to analyze
$directories = @('node_modules', 'server', 'src', 'docs', 'scripts', 'deploy', '.git', '__tests__', 'public')

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue
        $size = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
        $count = $files.Count
        Write-Host "$dir : $([math]::Round($size, 2)) MB ($count files)"
    }
}

Write-Host ""
Write-Host "=== TOTAL PROJECT SIZE ===" -ForegroundColor Cyan
$allFiles = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue
$totalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum / 1MB
$totalCount = $allFiles.Count
Write-Host "Total: $([math]::Round($totalSize, 2)) MB ($totalCount files)"

Write-Host ""
Write-Host "=== CODE SIZE (excluding node_modules and .git) ===" -ForegroundColor Cyan
$codeFiles = Get-ChildItem -Recurse -File -Exclude node_modules,.git -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }
$codeSize = ($codeFiles | Measure-Object -Property Length -Sum).Sum / 1MB
$codeCount = $codeFiles.Count
Write-Host "Code: $([math]::Round($codeSize, 2)) MB ($codeCount files)"
