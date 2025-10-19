# Remediation: Exposed Firebase / Google API Key

A key was detected in the repository history and in a deployed HTML file. Follow these steps to remediate and reduce risk.

1) Rotate the exposed API key
   - Immediately rotate the API key in the Google Cloud / Firebase Console.
   - Generate a new API key and update your environment and CI secrets.

2) Update local and deployed files
   - Replace any hard-coded occurrences in the repository with the placeholder `PLACEHOLDER_FOR_BUILD_INJECTION`.
   - We updated `deploy/dashboard.html` to use the placeholder.
   - Keep the real key only in `.env.local` (which is in `.gitignore`) and in your CI secret store.

3) Remove secrets from git history (optional but recommended)
   - Use `git filter-repo` or `git-filter-branch` to remove the secret from history.
   - Example using `git filter-repo` (recommended):
     - Create `replacements.txt` with a single line:
       `AIzaSyOLDKEY...==>REDACTED_KEY`
     - Run: `git filter-repo --replace-text replacements.txt`
   - Follow this by forcing the cleaned branch to the remote and informing collaborators to re-clone.

4) Scan and verify
   - Run the project's secret scanner (`.githooks/secret-scan.js` or CI secret-scan workflow) locally to confirm no secrets remain.
   - Check GitGuardian / other scanner alerts to confirm remediation.

5) Prevent recurrence
   - Ensure `.env.local` and `replacements.txt` are in `.gitignore` (they already are).
   - Add pre-commit secret scanning to fail commits that contain common secret patterns (already present in `.githooks`).
   - Use CI to block PRs containing secrets.

If you want, I can:
- Push the placeholder-only changes to your branch and update the draft PR.
- Initiate a suggested replacement command set for scrubbing history (I will not run history rewrite without your explicit approval).
- Rotate the API key guidance step-by-step.

