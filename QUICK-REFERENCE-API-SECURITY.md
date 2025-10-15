# 🔧 Quick Reference: Secure API Key Management

## TL;DR - The Problem
Build system was putting real API keys back into source files → Git commits exposed secrets → Security alert

## TL;DR - The Fix  
✅ Build system now only modifies `deploy/` files  
✅ Source files use environment variables  
✅ No more API key leaks in git commits

## File Status After Fix

| File | Contains | Safe to Commit? |
|------|----------|----------------|
| `src/js/config.js` | `process.env.FIREBASE_API_KEY \|\| "PLACEHOLDER"` | ✅ Yes |
| `dashboard.html` | `window.ENV.FIREBASE_API_KEY \|\| "PLACEHOLDER"` | ✅ Yes |
| `deploy/src/js/config.js` | Real API key (when env var set) | ❌ No (git ignored) |
| `deploy/dashboard.html` | Real API key (when env var set) | ❌ No (git ignored) |

## Commands to Remember

### Check Security Status
```bash
# Should find NO API keys in source files
findstr "AIza" src\*.* dashboard.html
```

### Build Process
```bash
# Set your API key (local development)
$env:FIREBASE_API_KEY="your-api-key-here"

# Build (injects real key into deploy files only)
npm run build

# Deploy files get real key, source files stay clean
```

### Production Deployment
- GitHub Actions uses: `${{ secrets.FIREBASE_API_KEY }}`
- Source files: Always contain placeholders
- Deploy files: Get real key injected at build time

## Red Flags to Watch For

❌ **Never see this in source files:**
```javascript
"apiKey": "[REDACTED_API_KEY]"
```

✅ **Always see this in source files:**
```javascript
"apiKey": process.env.FIREBASE_API_KEY || "SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY"
```

## Emergency Recovery
1. **Revoke API key** in Google Cloud Console (most important!)
2. **Clean source files** (remove any hardcoded keys)
3. **Commit cleanup** immediately
4. **Generate new restricted API key**
5. **Update GitHub secrets** with new key

---
**Remember**: Source files = placeholders only. Deploy files = real secrets (but git ignored).