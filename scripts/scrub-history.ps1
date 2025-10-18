<#
PowerShell helper to scrub a literal secret from git history using git-filter-repo.
This script only prepares files and shows the exact commands to run.
It will NOT run `git filter-repo` or push by default to avoid accidental destructive actions.

Usage: .\scripts\scrub-history.ps1 -Secret "AIzaSyOLDKEY..." -Remote "origin"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Secret,

    [string]$Replacement = 'REDACTED_KEY',
    [string]$Remote = 'origin'
)

$cwd = Get-Location
Write-Host "Working directory: $cwd"

# Confirm git repository
if (-not (Test-Path .git)) {
    Write-Host "This does not look like a git repo. Run this from the repository root." -ForegroundColor Red
    exit 1
}

$replacementsFile = Join-Path $cwd "replacements.txt"
"$Secret==>$Replacement" | Out-File -Encoding UTF8 -FilePath $replacementsFile

Write-Host "Created replacements file at: $replacementsFile"
Write-Host "Contents:"
Get-Content $replacementsFile | ForEach-Object { Write-Host "  $_" }

# SECURITY NOTE: 'replacements.txt' contains the secret in plaintext. Keep it secret.
Write-Host "\nNOTE: 'replacements.txt' contains the secret in plaintext. Do not commit it to git." -ForegroundColor Yellow
Write-Host "You can add it to .gitignore temporarily (example):`n  echo 'replacements.txt' >> .gitignore`n"

Write-Host "
SAFE MODE: This script will only print the commands you should run next. It will NOT run them.
Review them carefully. To run them manually copy & paste into PowerShell.
"

# Try to resolve the remote URL; fall back to empty string if it fails
try {
    $remoteUrl = (& git remote get-url $Remote) 2>$null
    $remoteUrl = $remoteUrl.Trim()
} catch {
    Write-Host "Failed to get remote URL for '$Remote' - continuing with empty remote URL." -ForegroundColor Yellow
    $remoteUrl = ''
}

# Ensure git is available before building commands
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: 'git' is not available in PATH. Install Git and retry." -ForegroundColor Red
    exit 2
}

# Build an ordered list of commands for the user to run manually
$cmds = @()
$cmds += '# Optional: create a backup clone or bundle'
if ($remoteUrl -ne '') {
    $cmds += 'git clone --mirror "' + $remoteUrl + '" ../nan-diary-backup.git'
    $cmds += 'git clone "' + $remoteUrl + '" nan-diary-scrub'
} else {
    $cmds += '# Could not determine remote URL automatically. Replace <REMOTE_URL> below.'
    $cmds += 'git clone --mirror <REMOTE_URL> ../nan-diary-backup.git'
    $cmds += 'git clone <REMOTE_URL> nan-diary-scrub'
}

$cmds += 'cd nan-diary-scrub'
$cmds += '# Run git-filter-repo with the replacements file (ensure git-filter-repo is installed)'
$cmds += 'git filter-repo --replace-text "' + $replacementsFile + '"'
$cmds += '# Verify the old secret is gone:'
# Build a Select-String example safely by escaping single quotes in the secret
$escapedSecret = $Secret -replace "'", "''"
$selectCmd = 'Select-String -Path . -Pattern "' + $escapedSecret + '" -SimpleMatch -List'
$cmds += $selectCmd
$cmds += '# If everything looks good, force-push rewritten history:'
$cmds += 'git push ' + $Remote + ' --all --force'
$cmds += 'git push ' + $Remote + ' --tags --force'
$cmds += '# Inform collaborators to reclone the repository'

Write-Host "Recommended commands to execute:"
foreach ($c in $cmds) { Write-Host "  $c" }

Write-Host "`nWhen you're ready and have reviewed the backup, run those commands manually in PowerShell." 
