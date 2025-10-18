# Install githooks by setting core.hooksPath to .githooks
param()
Write-Host "Setting git hooks path to .githooks"
git config core.hooksPath .githooks
Write-Host "Done."
