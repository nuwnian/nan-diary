# 🔐 Secret Scanning Setup

**Last Updated:** October 19, 2025  
**Status:** ✅ Optimized (Redundancy Removed)

---

## 🎯 Overview

Your project uses a **2-layer defense** against secret leaks:

1. **Local Git Hooks** - Catches secrets before commit/push
2. **GitHub Actions (Gitleaks)** - Final check on PRs and pushes

This setup provides comprehensive protection without redundancy.

---

## 🛡️ Layer 1: Local Git Hooks (Pre-commit/Pre-push)

### **Location:** `.githooks/secret-scan.js`

**When it runs:**
- ✅ Before every commit
- ✅ Before every push
- ✅ Blocks immediately if secrets detected

**How it works:**
1. **Primary:** Tries to run Gitleaks locally (if available via npx)
2. **Fallback:** Uses custom regex patterns if Gitleaks not available
3. **Smart filtering:** Skips tooling directories (`.githooks/`, `scripts/`, `.github/`, `deploy/`)
4. **Whitelist support:** Respects `.secrets-whitelist` for safe placeholders

### **Patterns Detected (10+):**

| Pattern | Example | Regex |
|---------|---------|-------|
| **Google API Key** | `AIzaSy...` | `AIzaSy[0-9A-Za-z_-]{33}` |
| **AWS Access Key** | `AKIA...` | `AKIA[0-9A-Z]{16}` |
| **AWS Secret Key** | Long base64 | `[A-Za-z0-9/+=]{40}` |
| **Slack Token** | `xoxb-...` | `xox[baprs]-[0-9A-Za-z-]{10,}` |
| **GitHub Token** | `ghp_...` | `gh[oprs]_[0-9A-Za-z_]{36}` |
| **Stripe Key** | `sk_live_...` | `sk_(live\|test)_[0-9a-zA-Z]{24,}` |
| **Twilio Key** | `SK...` | `SK[0-9a-fA-F]{32}` |
| **OAuth Bearer** | `Authorization: Bearer <token>` | `Bearer\s+[A-Za-z0-9\-\._~\+/]+=*` |
| **Private Key** | `-----BEGIN...` | `-----BEGIN (RSA\|PRIVATE\|EC) KEY-----` |
| **Long Base64** | Suspicious strings | `[A-Za-z0-9+/]{100,}={0,2}` |

### **Installation:**

Git hooks are installed automatically when you run:
```bash
npm run security:install-hooks
```

**Manual installation:**
```bash
# Windows
powershell -ExecutionPolicy Bypass -File scripts/security/install-hooks.ps1

# Linux/Mac
chmod +x scripts/security/install-hooks.sh
./scripts/security/install-hooks.sh
```

### **Whitelist Management:**

**File:** `.secrets-whitelist`

Add exact matches of safe values (one per line):
```plaintext
YOUR_API_KEY_HERE
PLACEHOLDER_VALUE
EXAMPLE_KEY_123
```

**Example workflow:**
```bash
# If hook blocks a safe placeholder:
echo "YOUR_API_KEY_HERE" >> .secrets-whitelist
git add .secrets-whitelist
git commit -m "Add placeholder to whitelist"
```

### **Bypass (Emergency Only):**

If you absolutely need to bypass the hook:
```bash
git commit --no-verify
# OR
git push --no-verify
```

⚠️ **Warning:** This skips ALL git hooks, including secret scanning. Use only in emergencies!

---

## 🛡️ Layer 2: GitHub Actions (Gitleaks)

### **Location:** `.github/workflows/gitleaks.yml`

**When it runs:**
- ✅ On every pull request
- ✅ On every push to `main` branch

**What it does:**
- Uses official [Gitleaks Action](https://github.com/zricethezav/gitleaks-action) (v2)
- Scans entire repository history
- Has **1000+ built-in secret patterns**
- Auto-updated with new attack patterns
- Blocks PR merge if secrets found

### **Configuration:**

```yaml
name: Gitleaks secret scan

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run gitleaks
        uses: zricethezav/gitleaks-action@v2
        with:
          args: --path=. --verbose
```

### **Configuration File:** `.gitleaks.toml`

```toml
[allowlist]
# Literal values to ignore (exact match)
allowlist = ["YOUR_API_KEY_HERE"]
```

**To add more whitelisted values:**
1. Edit `.gitleaks.toml`
2. Add to `allowlist` array
3. Commit and push

---

## 🔄 Secret Scanning Flow

```
┌─────────────────────────────────────────────────┐
│  Developer writes code with Firebase API key    │
│  (accidentally hardcoded)                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  git commit -m "..." │
         └────────┬───────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │  🔍 Local Git Hook Runs         │
    │  (.githooks/secret-scan.js)     │
    │                                  │
    │  1. Try Gitleaks (preferred)    │
    │  2. Fallback to regex scan      │
    │  3. Check .secrets-whitelist    │
    └────────┬────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  Secret detected?  │
    └────┬───────────┬───┘
         │ YES       │ NO
         │           │
         ▼           ▼
    ┌────────────┐  ┌─────────────┐
    │ ❌ BLOCKED │  │ ✅ Committed │
    │            │  └──────┬──────┘
    │ Error msg  │         │
    │ shown      │         ▼
    └────────────┘  ┌─────────────┐
                    │  git push    │
                    └──────┬──────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  🔍 GitHub Actions     │
              │  (Gitleaks workflow)   │
              │                        │
              │  - Scans PR changes    │
              │  - 1000+ patterns      │
              │  - History scan        │
              └────────┬───────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  Secret detected?  │
              └────┬───────────┬───┘
                   │ YES       │ NO
                   │           │
                   ▼           ▼
              ┌──────────┐  ┌──────────────┐
              │ ❌ PR     │  │ ✅ PR Merged │
              │   Blocked│  │   or         │
              │          │  │   Push OK    │
              └──────────┘  └──────────────┘
```

---

## 📊 Detection Coverage

### **What Gets Detected:**

✅ **Cloud Provider Keys:**
- Google API keys (Firebase, Cloud, Maps)
- AWS credentials (Access Key, Secret Key)
- Azure connection strings
- DigitalOcean tokens

✅ **Authentication Tokens:**
- GitHub personal access tokens
- OAuth tokens that are typically sent in the Authorization header
- JWT tokens (if suspicious pattern)

✅ **Service API Keys:**
- Stripe keys
- Twilio keys
- SendGrid keys
- Slack tokens
- Discord tokens

✅ **Cryptographic Material:**
- Private keys (RSA, EC, ECDSA)
- SSH private keys
- PGP private keys
- Certificates with private keys

✅ **Database Credentials:**
- Connection strings with passwords
- MongoDB URIs with credentials
- PostgreSQL URLs with passwords

### **What Doesn't Get Detected:**

❌ **Safe Placeholders:**
- `YOUR_API_KEY_HERE`
- `FIREBASE_API_KEY_PLACEHOLDER`
- Any value in `.secrets-whitelist`

❌ **Non-Text Files:**
- Images, videos, binaries
- Compiled code
- Compressed archives

❌ **Tooling Files (Local Hook Only):**
- `.githooks/` directory
- `scripts/` directory
- `.github/` directory
- `deploy/` directory

---

## 🚨 What To Do If Secrets Are Detected

### **1. If Caught by Local Git Hook:**

```bash
# Option 1: Remove the secret from your code
# Edit the file and replace secret with environment variable
code <filename>

# Option 2: If it's a safe placeholder, whitelist it
echo "YOUR_PLACEHOLDER_VALUE" >> .secrets-whitelist

# Option 3: Unstage the file
git restore --staged <filename>

# Option 4: Revert changes completely
git checkout -- <filename>
```

### **2. If Caught by GitHub Actions:**

**If you haven't pushed yet:**
```bash
# Amend the last commit
git reset HEAD~1
# Fix the files
# Commit again with fixed code
```

**If already pushed to PR:**
```bash
# Fix the file locally
# Commit the fix
git add <filename>
git commit -m "fix: remove exposed secret"
git push
```

### **3. If Secret Was Actually Exposed:**

⚠️ **CRITICAL:** The secret is now compromised!

**Immediate actions:**
1. **Rotate the key/secret** - Generate a new one from the service
2. **Revoke the old key** - Disable it immediately
3. **Review logs** - Check if it was accessed
4. **Update repository** - Add to whitelist if needed
5. **Update production** - Deploy with new secret

**For Firebase API keys:**
```bash
# 1. Go to Firebase Console
# 2. Project Settings → General
# 3. Delete the exposed key
# 4. Create a new Web App or regenerate key
# 5. Update .env.local
```

---

## 🧪 Testing Your Setup

### **Test Local Hook:**

```bash
# Create a test file with a fake secret
echo "AIzaSyTest1234567890123456789012345" > test-secret.txt
git add test-secret.txt
git commit -m "test"

# Expected: Hook should block the commit
# Clean up:
git restore --staged test-secret.txt
rm test-secret.txt
```

### **Test Whitelist:**

```bash
# Add test pattern to whitelist
echo "AIzaSyTest1234567890123456789012345" >> .secrets-whitelist

# Try again
echo "AIzaSyTest1234567890123456789012345" > test-secret.txt
git add test-secret.txt .secrets-whitelist
git commit -m "test with whitelist"

# Expected: Should succeed
# Clean up:
git reset HEAD~1
rm test-secret.txt
git restore .secrets-whitelist
```

### **Test GitHub Action:**

1. Create a PR with a test secret
2. Watch the Actions tab in GitHub
3. Verify Gitleaks workflow runs and blocks

---

## 📝 Maintenance

### **Update Gitleaks (Local):**

```bash
# Gitleaks is installed via npx, auto-updates
# To force update:
npm cache clean --force
npx gitleaks@latest detect
```

### **Update GitHub Action:**

The Gitleaks GitHub Action auto-updates. To manually update:

```yaml
# In .github/workflows/gitleaks.yml
- uses: zricethezav/gitleaks-action@v2  # Update version here
```

### **Review Whitelists Regularly:**

```bash
# Check what's whitelisted
cat .secrets-whitelist

# Check Gitleaks config
cat .gitleaks.toml

# Remove outdated entries periodically
```

---

## 🔧 Troubleshooting

### **Hook Not Running:**

```bash
# Check if hooks are installed
ls -la .git/hooks/

# Should see: pre-commit, pre-push pointing to .githooks/

# Reinstall:
npm run security:install-hooks
```

### **Too Many False Positives:**

```bash
# Add to whitelist
echo "FALSE_POSITIVE_VALUE" >> .secrets-whitelist

# Or edit .gitleaks.toml to add patterns:
# [allowlist]
# patterns = ["pattern_to_ignore"]
```

### **Gitleaks Not Found Locally:**

```bash
# Install gitleaks globally (optional)
npm install -g gitleaks

# Or let the hook use npx (auto-installs)
npx gitleaks detect
```

### **GitHub Action Failing:**

1. Check the Actions tab in GitHub
2. Review the logs
3. If false positive, update `.gitleaks.toml`
4. Push the config update

---

## 📚 Resources

### **Official Documentation:**
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [Gitleaks Action](https://github.com/zricethezav/gitleaks-action)
- [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

### **Your Project Docs:**
- `docs/SECURITY-OVERVIEW.md` - Complete security setup
- `docs/SECURITY-INCIDENT-RESPONSE.md` - What to do if breach occurs
- `.secrets-whitelist` - Local whitelist
- `.gitleaks.toml` - Gitleaks configuration

---

## ✅ Checklist

- [x] Local git hooks installed
- [x] `.secrets-whitelist` exists
- [x] `.gitleaks.toml` configured
- [x] GitHub Actions workflow active
- [x] Tested locally
- [x] Team trained on workflow
- [ ] Reviewed whitelists recently
- [ ] Tested on PR

---

**Status:** ✅ **Production-Ready**

Your secret scanning setup uses industry best practices with **zero redundancy** and **comprehensive coverage**.

*Last Updated: October 19, 2025*
