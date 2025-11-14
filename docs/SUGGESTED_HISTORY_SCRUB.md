# Suggested history scrub commands (do NOT run without backup)

This file lists recommended commands to remove the exposed API key from git history.
Only run these if you understand the impact: rewriting history will change commit SHAs and require all collaborators to re-clone.

1) Backup your repo (important):

   git clone --mirror "$(git config --get remote.origin.url)" ../nan-diary-backup.git

2) Create `replacements.txt` with the exact secret replacement mapping (example):

   <REPLACE_WITH_THE_EXACT_SECRET_YOU_ROTATED_OR_REMOVED>==>REDACTED_KEY

3) Run `git filter-repo` (recommended):

   # Install git-filter-repo if you don't have it: https://github.com/newren/git-filter-repo
   git filter-repo --replace-text replacements.txt

4) Force-push the cleaned branch to origin (for each branch you cleaned):

   git push --force --all
   git push --force --tags

5) Instruct all collaborators to re-clone the repository.

Notes:
- If you cannot run git-filter-repo, consider `git filter-branch` as an alternative but it's slower and more complex.
- After rotation and history rewrite, re-run secret scanners and GitGuardian to confirm the secret is no longer present.

If you want, I can prepare a tailored `replacements.txt` for you (I won't run the scrub). Request: "prepare replacements and scrub steps" if you want that.
