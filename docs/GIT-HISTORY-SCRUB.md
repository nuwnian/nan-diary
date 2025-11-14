# Git history scrub guide

This document explains safe, reversible steps to remove a secret (API key) from your Git history. It covers two tools: `git-filter-repo` (recommended) and `BFG Repo-Cleaner` (alternative). Both rewrite history and require a force-push; coordinate with collaborators.

IMPORTANT: Back up your repository before proceeding. Either clone a fresh copy or create a bare `bundle`:

```powershell
# Create a backup bundle
git clone --mirror https://github.com/nuwnian/nan-diary.git nan-diary-backup.git
cd nan-diary-backup.git
git bundle create ../nan-diary-backup.bundle --all
```

Summary of steps (recommended):

1. Install `git-filter-repo`.
   - On Windows, the easiest route is to install Python 3.8+ and then: `pip install git-filter-repo`.
   - Or use your OS package manager if available.

2. Clone a fresh copy to operate on (do NOT run these steps in your main working copy unless you understand the consequences):

```powershell
# Create a fresh local clone (non-bare)
cd D:\
git clone https://github.com/nuwnian/nan-diary.git nan-diary-scrub
cd nan-diary-scrub
```

3. Run `git-filter-repo` to remove the API key. Replace `AIzaSyOLDKEY...` with the exact secret you want to scrub.

```powershell
# Remove a literal string from the entire history
git filter-repo --replace-text <(echo "AIzaSyOLDKEY...==>REDACTED_KEY")
```

If PowerShell doesn't support process substitution `<(...)`, create a `replacements.txt` file and pass it to `--replace-text`:

```powershell
# Create replacements file
"AIzaSyOLDKEY...==>REDACTED_KEY" | Out-File -Encoding UTF8 replacements.txt

# Run git-filter-repo
git filter-repo --replace-text replacements.txt
```

4. Verify the scrub locally by searching the repository for the old key:

```powershell
# Search for the old key
Select-String -Path . -Pattern "AIzaSyOLDKEY" -SimpleMatch -List
```

5. Force-push the rewritten history to the remote (coordinate with team):

```powershell
# Force push all branches and tags
git push origin --all --force
git push origin --tags --force
```

6. Ask collaborators to reclone or follow instructions to reset their local clones.

Alternative: BFG Repo-Cleaner (simpler, Java-based)

- Install Java (8+) and download the BFG jar: https://rtyley.github.io/bfg-repo-cleaner/.
- Create `bfg-clean.txt` containing the secret and run:

```powershell
java -jar bfg.jar --replace-text bfg-clean.txt nan-diary.git
cd nan-diary.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

Notes & Post-clean steps

- After pushing rewritten history, invalidate old deploys and credentials where possible.
- Rotate any exposed keys (you already rotated the Firebase key). Consider regenerating any other credentials that may have been exposed.
- Keep `.env.local` and other sensitive files out of the repo; add them to `.gitignore`.
- Use the repo's secret scanning in CI to prevent future commits.

If you'd like, I can produce a PowerShell script that automates creating `replacements.txt`, running `git-filter-repo` locally, and verifying the result. Running it will rewrite history and force-push; confirm when you want me to produce that script.