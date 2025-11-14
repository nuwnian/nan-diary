# Jira Integration Setup Guide

## Step 1: Install Sentry in Jira Marketplace

### Option A: From Jira (Recommended)
1. **Go to your Jira instance**: https://your-company.atlassian.net
2. Click the **Settings icon** (⚙️) in the top right
3. Select **"Apps"** or **"Find new apps"**
4. Search for **"Sentry"**
5. Click **"Get app"** or **"Install"** on the Sentry integration
6. Click **"Get it now"** to confirm installation
7. Wait for installation to complete

### Option B: From Jira Marketplace
1. Go to: https://marketplace.atlassian.com/apps/1219432/sentry-for-jira
2. Click **"Get it now"**
3. Select your Jira site from the dropdown
4. Click **"Install app"**
5. Authorize the installation

## Step 2: Configure Sentry Add-on in Jira

1. After installation, go to **Jira Settings** (⚙️) → **Apps** → **Manage apps**
2. Find **"Sentry"** in the left sidebar under "User-installed apps"
3. Click **"Configure"** next to Sentry
4. Click **"Add organization"** or **"Connect to Sentry"**

## Step 3: Connect Sentry to Jira

You'll be redirected to Sentry:

1. **Log in to Sentry** (if not already logged in)
2. **Select your organization**: `nuwnian`
3. **Authorize the integration** - Click **"Install"**
4. **Grant permissions**:
   - ✅ Read and write issues
   - ✅ Read projects
   - ✅ Read users
5. Click **"Authorize"**

## Step 4: Link Sentry Project to Jira Project

Back in Sentry:

1. Go to **Settings** → **Integrations**
2. Find **Jira** (should show "Installed")
3. Click **"Configure"**
4. You'll see your Jira instance listed
5. Click **"Configure"** next to your Jira instance
6. Under **"Project Mappings"**, click **"Add Project"**
7. Select:
   - **Sentry Project**: `nan-diary`
   - **Jira Project**: Choose your Jira project (e.g., "NAN" or "DIARY")
8. Click **"Save"**

## Step 5: Create Alert Rules for Auto-Creating Jira Issues

1. In Sentry, go to **Alerts** → **Create Alert**
2. Choose **"Issues"** alert type
3. Configure the alert:

   **When**: Set conditions
   ```
   An event is seen
   AND the issue's tags match: level equals error
   ```
   
   Or use frequency-based:
   ```
   An event is seen more than 10 times in 1 hour
   ```

4. **Then**: Add action
   - Select **"Create a new Jira issue"**
   - Choose your **Jira project**
   - Configure issue template:
     ```
     Issue Type: Bug
     Priority: {priority} or High
     Summary: {title}
     Description: {description}
     ```

5. **Action Interval**: How often to perform action
   - Choose: **"Create a new issue for each triggering event"**
   - Or: **"Create one issue per rule"** (to avoid spam)

6. **Name your alert**: e.g., "Auto-create Jira for high-priority errors"

7. Click **"Save Rule"**

## Step 6: Test the Integration

### Method 1: Manual Test
1. In Sentry, go to **Issues**
2. Click on any existing issue (or create a test error in your app)
3. In the issue detail page, click **"Link Jira Issue"**
4. Click **"Create Issue"**
5. Fill in details and click **"Create"**
6. Check your Jira project - the issue should appear!

### Method 2: Trigger Alert
1. In your app, add this code temporarily:
   ```tsx
   // Trigger multiple errors to meet alert threshold
   for (let i = 0; i < 15; i++) {
     setTimeout(() => {
       throw new Error(`Test Jira Integration - Error ${i}`);
     }, i * 1000);
   }
   ```
2. Run the code
3. Wait a few minutes
4. Check your Jira project for auto-created issues

## Step 7: Customize Jira Issue Templates

1. In Sentry → **Settings** → **Integrations** → **Jira** → **Configure**
2. Click **"Issue Link Settings"**
3. Customize:
   - **Summary template**: `[Sentry] {title}`
   - **Description template**:
     ```
     {description}
     
     Error Count: {count}
     First Seen: {first_seen}
     Last Seen: {last_seen}
     
     [View in Sentry]({link})
     ```
   - **Issue Type**: Bug
   - **Priority mapping**: 
     - fatal → Highest
     - error → High
     - warning → Medium
     - info → Low

## Step 8: Configure Auto-Resolution (Optional)

Link Jira issue status to Sentry:

1. In Sentry → **Jira Integration Settings**
2. Enable **"Sync Issue Status"**
3. Map Jira statuses to Sentry:
   - **Done** → Mark as Resolved in Sentry
   - **In Progress** → Mark as Ongoing in Sentry
   - **To Do** → Mark as Unresolved in Sentry

## Verification Checklist

✅ Sentry installed in Jira Marketplace
✅ Sentry add-on configured in Jira
✅ Sentry connected to Jira instance
✅ nan-diary project linked to Jira project
✅ Alert rule created for auto-issue creation
✅ Test issue created successfully
✅ Issues sync between Sentry and Jira

## Common Jira Issue Workflow

1. **Error occurs** in your app → Sentry captures it
2. **Alert triggers** (based on your rules)
3. **Jira issue created** automatically with:
   - Error title as summary
   - Stack trace in description
   - Link to Sentry for details
   - User context (if available)
4. **Developer fixes** the issue in Jira
5. **Mark as Done** in Jira → Sentry marks as Resolved

## Useful Settings

### Prevent Issue Spam
- Set alert threshold higher (e.g., 50+ occurrences)
- Use "one issue per rule" instead of per event
- Add filters to exclude known issues

### Custom Fields
Map Sentry data to Jira custom fields:
- Environment → Custom Field "Environment"
- Release Version → Custom Field "Affected Version"
- User ID → Custom Field "Affected User"

### Team Notifications
- Configure Jira notifications for new Sentry issues
- Set up Slack/Discord webhooks for alerts
- Assign issues to specific teams based on tags

## Troubleshooting

### Issue: Can't find Sentry in Jira Marketplace
**Solution**: Make sure you're a Jira admin. Contact your Jira administrator.

### Issue: Integration not showing in Sentry
**Solution**: 
1. Refresh the Integrations page
2. Try disconnecting and reconnecting
3. Check organization permissions

### Issue: No issues being created automatically
**Solution**:
1. Verify alert rules are active
2. Check that errors meet the threshold
3. Review alert rule conditions
4. Check Sentry → Alerts → Alert History

### Issue: Jira issues missing information
**Solution**: Customize the issue template in Jira integration settings

## Next Steps

Once integrated:
1. **Monitor** your Jira board for Sentry-created issues
2. **Adjust alert thresholds** based on noise level
3. **Create sprint** dedicated to fixing Sentry issues
4. **Set up dashboards** in Jira to track error trends

## Resources

- Jira Marketplace: https://marketplace.atlassian.com/apps/1219432/sentry-for-jira
- Sentry Jira Docs: https://docs.sentry.io/product/integrations/issue-tracking/jira/
- Video Tutorial: https://www.youtube.com/watch?v=jira-sentry-integration

---

**Ready?** Start with Step 1! 🚀
