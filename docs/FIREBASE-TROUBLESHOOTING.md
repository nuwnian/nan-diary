# Firebase troubleshooting and fixes — Nan Diary

Date: 2025-10-18

This document summarizes the authentication and cloud-save issues encountered while developing Nan Diary, the root causes we identified, the code and configuration fixes applied, verification steps taken, and recommended next steps for production hardening.

## Problems observed

1. 403 errors from securetoken.googleapis.com during token refresh, plus Firebase auth popup internal assertion failures.
2. "Session expired, please sign in again" errors when saving notes to cloud.
3. Runtime ReferenceError: "Cannot access 'detailNotes' before initialization" causing app crashes on page load.
4. Noisy UX: repeated alert popups telling users "save failed" when they navigated away while not signed in.
5. Accidental risk of committing the Firebase Web API key in repository files.

## Root causes

- Wrong or stale API key values in HTML/config files (browser cached or multiple copies across files). Old API keys or restricted keys caused securetoken requests to return 403.
- Firebase Authentication requires that the page origin be listed in the project's Authorized domains (in Firebase Console) for OAuth popup flows. Missing domains caused popup failures.
- The app attempted to call or save to Firestore before a signed-in user was present; session validation code tried to force-refresh tokens and failed when securetoken calls were blocked.
- A DOM reference (`detailNotes`) was used before it was defined, causing the ReferenceError.
- Committed files contained API key literals or placeholder variants; without an injection workflow, stale commits could leak keys or remain inconsistent.

## Files changed (high level)

- `src/js/main.js` (and `deploy/src/js/main.js`)
  - Moved `detailNotes` initialization earlier to fix ReferenceError.
  - Improved `signInWithGoogle()` to handle benign popup closures and provide clearer guidance for re-authorization when required.
  - Reworked `saveProjectsToCloud()` to:
    - Skip saving silently if the user is not signed in or Firebase is not ready.
    - Validate session and prompt a re-sign-in only when necessary.
    - Avoid alert storms for transient or expected failures.

- `dashboard.html` and `deploy/dashboard.html`
  - Replaced committed API key values with a placeholder and added a `window.ENV.FIREBASE_API_KEY` fallback used by `firebaseConfig`.
  - Added cache-busting query param to script includes (`?v=5`) to reduce stale caching issues.

- `src/js/config.js`
  - Switched to using an environment fallback: `process.env.FIREBASE_API_KEY || "YOUR_API_KEY_HERE"` and included a security note.

- `inject-env.js` (new)
  - A small build/dev-time script that reads `.env.local` and injects the real `FIREBASE_API_KEY` into local HTML files before serving or building.

- `.env.local` (local-only)
  - Stores sensitive values (e.g., `FIREBASE_API_KEY`) and is included in `.gitignore` to avoid committing secrets.

- `package.json`
  - Updated `scripts` to run `inject-env.js` during `dev` and `build` steps (so local builds use the environment key without committing it).

- Docs added:
  - `docs/CLEAR-CACHE-INSTRUCTIONS.md` (how to clear cache/force reload)
  - `docs/GOOGLE-AUTH-TROUBLESHOOTING.md` (how to add authorized domains and enable APIs)

## Fixes applied (detailed)

1. Fix ReferenceError:
   - Moved the `const detailNotes = document.getElementById('detailNotes')` line to the start of the `DOMContentLoaded` handler so it exists before other code references it.

2. Reduce noisy save alerts & handle expired sessions:
   - `saveProjectsToCloud()` now checks for `auth.currentUser` and whether Firebase is initialized before attempting to save.
   - If session validation (`getIdToken(true)`) fails, the code displays a single friendly confirm dialog offering to re-sign in, and only shows a console warning otherwise.

3. Avoid committing API keys & support environment injection:
   - Replaced keys in committed HTML/config with placeholders.
   - Added `.env.local` and `inject-env.js` to inject keys during local development or build.
   - Updated `package.json` scripts to run the injection step automatically.

4. Guided fixes for Google/Firebase console misconfiguration:
   - You must add the origin(s) used during development and production to Firebase Console → Authentication → Sign-in method → Authorized domains (exact hostnames, no ports). Add `localhost` and `127.0.0.1` for local dev.
   - If you see 403 errors specifically from `securetoken.googleapis.com`, enable the Identity Toolkit API and (if applicable) Token Service / Secure Token APIs in the Google Cloud Console for your project.

## How we verified the fix

- Ran the injection script to populate `dashboard.html` and `deploy/dashboard.html` with the real API key from `.env.local`.
- Started the local dev server (served at `http://127.0.0.1:3000`) and performed a sign-in with Google.
- Confirmed console output: "Auth state changed. User: signed in" and no more immediate securetoken 403 failures after adding authorized domains.
- Confirmed `saveProjectsToCloud()` no longer produces repeated alert popups when the user is signed out; instead it prompts or logs appropriately.

## Short checklist: If you see these errors again

1. 403 from `securetoken.googleapis.com`:
   - Verify the API key used by the page is the correct key for this Firebase project (no extra spaces, correct project).
   - Confirm the API key isn't restricted to other referers or IPs that block your environment. Temporarily remove restrictions to test.
   - In Google Cloud Console for the project, ensure Identity Toolkit API and Cloud Token Service (Secure Token) are enabled.
   - Confirm the page origin is listed under Firebase Console → Authentication → Authorized domains.

2. Popup closes or internal assertion errors during Google sign-in:
   - Add `localhost` and `127.0.0.1` to authorized domains.
   - Make sure you don't have aggressive popup blockers running.
   - Retry in Incognito to check for extension interference.

3. Session expired, please sign in again when saving:
   - Check browser console for sign-in state; if `auth.currentUser` is null, prompt user to sign in.
   - Clear cache or open an incognito window to ensure cached auth state isn't stale.

4. If an API key was committed publicly:
   - Rotate the API key in Google Cloud Console immediately.
   - Update `.env.local` with the new key and re-run `node inject-env.js`.
   - Check commit history — if the key was exposed publicly, rotate any other keys or secrets used by the project.

## Emergency key rotation steps

1. Go to the Google Cloud Console → APIs & Services → Credentials.
2. Locate the Web API key and click 'Restrict key' → 'Delete' or 'Regenerate' (you can create a new key instead of regenerating if you prefer).
3. Update `.env.local` with the new `FIREBASE_API_KEY` value.
4. Run:

```powershell
# from project root on Windows PowerShell
node inject-env.js; npm run dev
```

5. For production builds, ensure your CI/CD injects the new key securely (don't commit it to git).

## Production hardening recommendations (next steps)

- Enable App Check (reCAPTCHA or Debug provider for testing) to reduce abuse of your API key.
- Restrict API key usage to specific HTTP referrers for production domains (set in Google Cloud Console).
- Move sensitive operations (key rotation, admin writes) to a secure backend when possible.
- Integrate a pre-commit Git hook or CI check to fail if `.env.local` or known API key patterns are staged for commit.
- Consider automated key rotation policies and a central secrets manager for deployments (e.g., Google Secret Manager, Azure Key Vault, AWS Secrets Manager).

## Changes made (git/patch-friendly list)

- Modified:
  - `src/js/main.js` and `deploy/src/js/main.js`
  - `src/js/config.js`
  - `dashboard.html`, `deploy/dashboard.html`
  - `package.json` (scripts)

- Added:
  - `inject-env.js`
  - `docs/FIREBASE-TROUBLESHOOTING.md`
  - `docs/CLEAR-CACHE-INSTRUCTIONS.md`
  - `docs/GOOGLE-AUTH-TROUBLESHOOTING.md`
  - `enable-firebase-apis.ps1`
  - `.env.local` (local only; not committed)

## Contact / rollback notes

If you want me to revert any of the repository changes or open a small PR with only a subset of the fixes (for review), tell me which files to include and I'll prepare it.

---

If you'd like, I can also:
- Add a short README entry with the `npm run dev` workflow that securely injects keys (and show how to run it in PowerShell).
- Create a pre-commit hook to block committing `.env.local`.
- Draft a brief email/Slack message you can send to teammates explaining they must add `localhost`/`127.0.0.1` to the Firebase authorized domains.
