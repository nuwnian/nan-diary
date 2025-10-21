# Sentry Project Setup - Step by Step Guide

## Step 1: Create Sentry Account

1. Go to **https://sentry.io**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with:
   - GitHub (recommended - auto-links your repo)
   - Google
   - Email

## Step 2: Create Your First Project

After signing up, Sentry will guide you:

1. **Choose Platform**: Select **"React"**
2. **Set Alert Frequency**: Choose **"Alert me on every new issue"** (you can change this later)
3. **Name Your Project**: Enter `nan-diary`
4. Click **"Create Project"**

## Step 3: Get Your DSN

After creating the project, you'll see installation instructions. Look for your DSN (Data Source Name):

```
https://[KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
```

**Copy this entire URL** - you'll need it in the next step.

## Step 4: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist):
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and add your Sentry DSN:
   ```bash
   # Sentry Configuration
   VITE_SENTRY_DSN=https://[YOUR_KEY]@o[YOUR_ORG].ingest.sentry.io/[YOUR_PROJECT_ID]
   ```

   Example:
   ```bash
   VITE_SENTRY_DSN=https://examplePublicKey@o4505876293386240.ingest.sentry.io/4505876293386241
   ```

## Step 5: Get Auth Token for Source Maps (Optional but Recommended)

This allows Sentry to show you the exact line of code where errors occur:

1. In Sentry, click your profile icon (bottom left) → **"Organization Settings"**
2. Go to **"Auth Tokens"** in the left sidebar
3. Click **"Create New Token"**
4. Configure:
   - **Name**: `nan-diary-ci-cd`
   - **Scopes**: Select:
     - ✅ `project:read`
     - ✅ `project:write`
     - ✅ `project:releases`
     - ✅ `org:read`
5. Click **"Create Token"**
6. **Copy the token immediately** (you won't see it again!)

7. Add to your `.env`:
   ```bash
   SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=nan-diary
   ```

   To find your org slug:
   - Look at your Sentry URL: `https://sentry.io/organizations/[YOUR-ORG-SLUG]/`
   - Or go to Settings → Organization Settings and look for "Organization Slug"

## Step 6: Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000`

3. Open browser console and check for Sentry initialization:
   - You should see: "Sentry initialized" or no errors about Sentry DSN

4. **Trigger a test error** (add this temporarily to your App.tsx):
   ```tsx
   <button onClick={() => {
     throw new Error('Test Sentry Error - Setup Working!');
   }}>
     Test Sentry
   </button>
   ```

5. Click the button and check:
   - Error should appear in browser console
   - Go to Sentry dashboard → Issues
   - You should see your test error appear within seconds!

## Step 7: Setup GitHub Secrets (For CI/CD)

If you want source maps in production:

1. Go to your GitHub repo: `https://github.com/nuwnian/nan-diary`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:
   - **Name**: `SENTRY_AUTH_TOKEN`, **Value**: Your auth token
   - **Name**: `SENTRY_ORG`, **Value**: Your org slug
   - **Name**: `SENTRY_PROJECT`, **Value**: `nan-diary`

## Step 8: Verify Everything Works

### Check Sentry Dashboard
- Go to https://sentry.io
- Click on your `nan-diary` project
- You should see:
  - ✅ Project created
  - ✅ SDK configured
  - ✅ First error received (your test error)

### Check Features Enabled
In Sentry project settings, verify:
- ✅ **Error Tracking**: Enabled by default
- ✅ **Performance Monitoring**: Enabled (check Settings → Performance)
- ✅ **Session Replay**: Enabled (check Settings → Replays)

## Step 9: Clean Up

Remove the test error button from your code!

## What You Get

### Automatic Features Now Active:
- 🎯 **Error Tracking**: All JavaScript errors captured automatically
- 📊 **Performance Monitoring**: Track slow components and API calls
- 🎥 **Session Replay**: Watch user sessions that encountered errors
- 👤 **User Context**: Errors linked to authenticated users
- 🍞 **Breadcrumbs**: See user actions leading to errors
- 📍 **Source Maps**: See exact code lines in production errors

### Error Monitoring:
- Real-time alerts via email
- Slack/Discord notifications (configure in Integrations)
- Group similar errors automatically
- Track error frequency and trends

## Common Issues & Solutions

### Issue: "Sentry DSN not configured"
**Solution**: Make sure `.env` file exists and `VITE_SENTRY_DSN` is set correctly

### Issue: No errors appearing in Sentry
**Solutions**:
1. Check browser console for Sentry errors
2. Verify DSN is correct (no extra spaces)
3. Make sure you're not blocking Sentry domains in ad-blockers
4. Check network tab for requests to `ingest.sentry.io`

### Issue: Source maps not working in production
**Solutions**:
1. Verify `SENTRY_AUTH_TOKEN` has correct scopes
2. Check build logs for source map upload confirmation
3. Ensure token is added to GitHub secrets

### Issue: Too many events (quota exceeded)
**Solutions**:
1. Lower sample rates in `src/lib/sentry.ts`:
   ```typescript
   tracesSampleRate: 0.01,  // 1% instead of 10%
   replaysSessionSampleRate: 0.01,
   ```
2. Add more filters in `beforeSend` function
3. Upgrade Sentry plan if needed

## Next Steps: Jira Integration

Once Sentry is working, you can connect it to Jira:

1. In Sentry, go to **Settings** → **Integrations**
2. Find **"Jira"** and click **"Install"**
3. Authorize Sentry to access your Jira account
4. Choose which Jira project should receive issues
5. Configure **Alert Rules** to automatically create Jira tickets:
   - Go to **Alerts** → **Create Alert Rule**
   - Set conditions (e.g., "error seen more than 10 times in 1 hour")
   - Set action: **"Create a Jira issue"**

## Support

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Community Discord**: https://discord.gg/sentry
- **Status Page**: https://status.sentry.io/

## Your Project Info

Fill this in after setup:

```
Sentry Organization: _______________________
Sentry Project: nan-diary
Sentry DSN: https://________________.ingest.sentry.io/___________
Environment: development / production
```

---

**Ready to start?** Follow Step 1 above! 🚀
