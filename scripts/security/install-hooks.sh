#!/usr/bin/env bash
# Install git hooks by setting core.hooksPath to the repository .githooks folder
set -e
echo "Installing git hooks (will set core.hooksPath to .githooks)..."
git config core.hooksPath .githooks
echo "Done. Hooks installed."
