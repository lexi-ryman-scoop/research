# SEMrush + Webflow Integration Setup Guide

This guide will help you connect SEMrush site audits to your Webflow website for automated SEO fixes.

## Overview

The integration consists of three scripts:
- `semrush-api.js` - Pull SEO audit data from SEMrush
- `webflow-cms.js` - Manage Webflow CMS content
- `seo-fixer.js` - Automated tool that combines both to fix issues

## Prerequisites

- Node.js 18+ (for native fetch support)
- SEMrush account with API access (Guru plan or higher)
- Webflow account with API access

## Step 1: Get Your SEMrush API Key

1. Log in to SEMrush: https://www.semrush.com
2. Go to **Profile** → **Subscription Info** → **API Units**
   - Direct link: https://www.semrush.com/accounts/profile/subscription-info/api-units
3. Copy your **API Key**

### Get Your Project ID

1. In SEMrush, go to your **Projects** dashboard
2. Click on your project
3. Look at the URL: `https://www.semrush.com/projects/12345678/...`
4. The number after `/projects/` is your **Project ID**

> **Note**: The Site Audit API requires that you've already run at least one audit in SEMrush. If you haven't, go to your project → Site Audit → Run Audit first.

## Step 2: Get Your Webflow API Token

1. Log in to Webflow: https://webflow.com
2. Go to **Account Settings** → **Integrations** → **API Access**
   - Or: Site Settings → Apps & Integrations → Generate API Token
3. Create a new API token with these permissions:
   - `sites:read` - Read site info
   - `pages:read` - Read pages
   - `pages:write` - Update pages (for applying fixes)
   - `cms:read` - Read CMS collections
   - `cms:write` - Update CMS items

### Get Your Site ID

1. In Webflow, open your site
2. Go to **Site Settings** → **General**
3. Scroll down to find your **Site ID**
   - Or check the URL in the Designer: `https://webflow.com/design/site-name?...` (use the API to list sites)

## Step 3: Configure Environment Variables

Create a `.env` file or export these variables in your terminal:

```bash
# SEMrush credentials
export SEMRUSH_API_KEY="your-semrush-api-key"
export SEMRUSH_PROJECT_ID="your-project-id"

# Webflow credentials
export WEBFLOW_API_TOKEN="your-webflow-api-token"
export WEBFLOW_SITE_ID="your-webflow-site-id"
```

Or edit the CONFIG section directly in the script files.

## Step 4: Test Your Connection

### Test SEMrush Connection
```bash
node semrush-api.js overview
```

Expected output:
```
Fetching site audit overview...

=== Site Audit Overview ===

Site Health Score: 71%
Total Pages Crawled: 150
Last Audit: 2024-01-15

Issues Summary:
  Errors: 12
  Warnings: 45
  Notices: 28
```

### Test Webflow Connection
```bash
node webflow-cms.js list-collections
```

## Step 5: Run the SEO Fixer

### Scan for Issues
```bash
node seo-fixer.js scan
```

This will:
- Connect to both SEMrush and Webflow
- Pull your latest site audit results
- Show which issues can be auto-fixed vs manual

### Preview Fixes (Dry Run)
```bash
node seo-fixer.js fix --dry-run
```

Review the proposed changes before applying them.

### Apply Fixes
```bash
node seo-fixer.js fix
```

### Generate Full Report
```bash
node seo-fixer.js report
```

## What Can Be Auto-Fixed

| Issue Type | Auto-Fixable | Notes |
|------------|--------------|-------|
| Missing meta description | Yes | Generates based on page content |
| Meta description too long | Yes | Truncates to 160 chars |
| Meta description too short | Partial | Expands where possible |
| Missing title tag | Yes | Generates from page name |
| Title too long | Yes | Truncates to 60 chars |
| Duplicate titles | Partial | Makes unique with suffix |
| Missing alt text | Yes | Generates from filename |
| Broken internal links | Yes | Updates/removes links |
| 4xx errors | Yes | Can create redirects |
| Missing H1 | Manual | Requires content decision |
| Slow page speed | Manual | Requires optimization |
| Broken external links | Manual | Third-party issue |

## Workflow Recommendation

1. **Weekly**: Run `node seo-fixer.js scan` to check current status
2. **After Audit**: Run `node seo-fixer.js fix --dry-run` to preview fixes
3. **Apply Fixes**: Run `node seo-fixer.js fix` to update Webflow
4. **Re-run Audit**: Trigger a new SEMrush audit to verify improvements
5. **Track Progress**: Use `node seo-fixer.js report` to monitor trends

## API Costs

### SEMrush
- API calls consume API units from your subscription
- Site Audit snapshot: ~10,000 units
- Issue details: ~1,000 units per request
- Monitor your usage at: https://www.semrush.com/accounts/profile/subscription-info/api-units

### Webflow
- API has rate limits (60 requests/minute on most plans)
- The script includes built-in rate limiting

## Troubleshooting

### "API Key Invalid" Error
- Verify your API key is copied correctly (no extra spaces)
- Check your SEMrush subscription includes API access

### "Project Not Found" Error
- Verify your Project ID is correct
- Ensure you have at least one Site Audit completed

### "Webflow 401 Unauthorized"
- Regenerate your API token
- Check the token has the required permissions

### "No Issues Found"
- Run a fresh Site Audit in SEMrush first
- Wait for the audit to complete before using the API

## Support

- SEMrush API Docs: https://developer.semrush.com/api/v3/projects/site-audit/
- Webflow API Docs: https://developers.webflow.com/reference
- Issues: Report problems in this repo's Issues tab
