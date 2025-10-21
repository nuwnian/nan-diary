# Quick Start: Sentry Setup in 5 Minutes

## 🚀 Fast Track Setup

### 1. Create Account (2 min)
```
https://sentry.io/signup/
```
- Choose: Sign up with GitHub (fastest, auto-links repo)
- Or use Google/Email

### 2. Create Project (1 min)
- Platform: **React**
- Name: `nan-diary`
- Click "Create Project"

### 3. Get Your DSN (30 sec)
After creating project, copy the DSN that looks like:
```
https://abc123@o12345.ingest.sentry.io/67890
```

### 4. Add to Your App (1 min)
Create `.env` file in project root:
```bash
VITE_SENTRY_DSN=paste_your_dsn_here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=nan-diary
```

Example:
```bash
VITE_SENTRY_DSN=https://abc123@o12345.ingest.sentry.io/67890
SENTRY_ORG=nuwnian
SENTRY_PROJECT=nan-diary
```

### 5. Test It (30 sec)
```bash
npm run dev
```

Open http://localhost:3000 and add this button temporarily:
```tsx
<button onClick={() => { throw new Error('Sentry Test!'); }}>
  Test Error
</button>
```

Click it → Check Sentry dashboard → See your error! ✅

## That's It! 🎉

Your app now has:
- ✅ Automatic error tracking
- ✅ Performance monitoring
- ✅ Session replay on errors
- ✅ User tracking

## Optional: Source Maps (For Production)

Get auth token from Sentry:
1. Settings → Auth Tokens → Create Token
2. Scopes: `project:read`, `project:write`, `project:releases`
3. Add to `.env`:
```bash
SENTRY_AUTH_TOKEN=your_token_here
```

4. Add to GitHub Secrets for CI/CD

## Need Help?

See full guide: `docs/SENTRY-SETUP-GUIDE.md`
