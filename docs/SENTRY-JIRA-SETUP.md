# Sentry & Jira Integration Guide

## Overview
This project uses Sentry for error tracking and monitoring, with optional Jira integration for issue management.

## Setup

### 1. Sentry Setup

#### Create Sentry Account
1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for "React"
3. Note your DSN (Data Source Name) - it looks like: `https://xxxx@xxxx.ingest.sentry.io/xxxxx`

#### Configure Environment Variables
Add these to your `.env` file (create if it doesn't exist):

```bash
# Sentry Configuration
VITE_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org_slug
SENTRY_PROJECT=your_sentry_project_slug
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

#### Get Sentry Auth Token
1. Go to Sentry Settings → Auth Tokens
2. Create a new token with `project:releases` and `project:write` scopes
3. Add the token to your `.env` file

### 2. Jira Integration

#### Enable Sentry-Jira Integration
1. In Sentry, go to Settings → Integrations
2. Find and install the Jira integration
3. Authorize Sentry to access your Jira instance
4. Configure which Jira project should receive issues from Sentry

#### Configure Issue Rules
1. In your Sentry project, go to Settings → Alerts
2. Create a new Alert Rule with conditions like:
   - "An event is seen more than X times in Y minutes"
   - "An event's tags match..."
3. Add action: "Create a Jira issue"
4. Configure the Jira issue template

### 3. GitHub Actions CI/CD

Add these secrets to your GitHub repository:
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

Update your `.github/workflows/deploy.yml` to include:

```yaml
- name: Create Sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  run: |
    npm run build
```

## Usage

### Automatic Error Tracking
All unhandled errors and exceptions are automatically captured by Sentry.

### Manual Error Reporting
```typescript
import * as Sentry from '@sentry/react';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'auth' },
    level: 'error',
  });
}
```

### Create Jira Issue from Code
```typescript
import { createJiraIssueFromError } from './lib/sentry';

createJiraIssueFromError(error, {
  component: 'Authentication',
  priority: 'high',
});
```

### Add Breadcrumbs for Context
```typescript
import { addBreadcrumb } from './lib/sentry';

addBreadcrumb('User clicked login button', 'user.action');
addBreadcrumb('API request started', 'network', 'info');
```

## Features

### Enabled Sentry Features
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Session replay (captures user sessions with errors)
- ✅ User context tracking
- ✅ Breadcrumbs for debugging
- ✅ Source maps for production debugging

### Jira Integration Features
- ✅ Automatic issue creation from Sentry alerts
- ✅ Link Sentry errors to Jira issues
- ✅ Sync issue status between Sentry and Jira
- ✅ Custom tags for Jira routing

## Testing

### Test Sentry Integration
Add this button to your app temporarily:

```tsx
<button onClick={() => {
  throw new Error('Test Sentry Error!');
}}>
  Trigger Test Error
</button>
```

### Verify Jira Integration
1. Trigger multiple errors to meet your alert threshold
2. Check your Jira project for automatically created issues
3. Verify the issue contains error details and stack traces

## Best Practices

1. **Filter Sensitive Data**: The Sentry config already filters passwords and auth tokens
2. **Set User Context**: Always call `setSentryUser()` after authentication
3. **Use Tags**: Tag errors for easier filtering and routing to Jira
4. **Adjust Sample Rates**: Lower sample rates in production to reduce costs
5. **Clear PII**: Use `beforeSend` to scrub any personally identifiable information

## Monitoring

### Sentry Dashboard
- View error trends and frequency
- Monitor performance metrics
- Watch session replays
- Track releases and deployments

### Jira Dashboard
- See all auto-created issues from Sentry
- Track resolution status
- Assign to team members
- Link related issues

## Troubleshooting

### Sentry Not Capturing Errors
- Check that `VITE_SENTRY_DSN` is set correctly
- Verify Sentry is initialized before app render
- Check browser console for Sentry initialization messages

### Jira Issues Not Created
- Verify Jira integration is installed in Sentry
- Check alert rules are configured correctly
- Ensure errors meet threshold conditions
- Check Sentry → Settings → Integrations → Jira for connection status

### Source Maps Not Working
- Ensure `SENTRY_AUTH_TOKEN` is set in CI/CD
- Check build logs for source map upload confirmation
- Verify token has `project:releases` scope

## Environment-Specific Configuration

### Development
- Full sampling (100%) for all features
- No source map upload
- Console warnings for debugging

### Production
- 10% performance sampling
- 10% session replay sampling
- 100% error replay sampling
- Source maps uploaded to Sentry
- PII filtering enabled

## Cost Optimization

To reduce Sentry costs in production:
1. Lower `tracesSampleRate` to 0.01 (1%)
2. Lower `replaysSessionSampleRate` to 0.01 (1%)
3. Add more filters in `beforeSend`
4. Use Sentry's spike protection features

## Support

- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/react/
- Jira Integration: https://docs.sentry.io/product/integrations/issue-tracking/jira/
- Community: https://discord.gg/sentry
