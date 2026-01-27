# 🚀 Complete SEO Tools Setup Guide

**Last Updated:** January 27, 2026
**Website:** scoopanalytics.com (Webflow)
**Tools:** SEMrush (CSV exports), Google Search Console, Webflow CMS

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Prerequisites](#prerequisites)
4. [Tool Setup](#tool-setup)
5. [Weekly Workflow](#weekly-workflow)
6. [Available Scripts](#available-scripts)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🎯 Overview

This SEO automation system helps you:

- ✅ **Monitor** SEO health without expensive API subscriptions
- ✅ **Analyze** issues from SEMrush, Google Search Console, and Webflow
- ✅ **Generate** actionable reports and dashboards
- ✅ **Fix** common issues (404s, meta descriptions, canonical tags)
- ✅ **Track** progress over time

### What Makes This Different?

- **No SEMrush API needed** - Works with free CSV downloads
- **Automated workflows** - Run weekly tasks automatically
- **Unified dashboard** - All data sources in one place
- **Actionable fixes** - Export-ready files for Webflow

---

## ⚡ Quick Start

### Installation

```bash
# 1. Install Node.js dependencies
npm install googleapis

# 2. Test SEMrush CSV processor
node semrush-csv-processor.js analyze

# 3. Generate your first dashboard
node seo-dashboard.js generate

# 4. View HTML dashboard
node seo-dashboard.js html
# Open: seo-dashboard.html in browser
```

### First Time Setup (5 minutes)

1. **Download SEMrush data** (no API needed):
   - Go to https://www.semrush.com/siteaudit/
   - Click on your project
   - Export issues as CSV
   - Save to `./data/` folder

2. **Setup Google Search Console** (optional but recommended):
   ```bash
   node google-search-console.js performance
   # Follow the OAuth flow (one-time setup)
   ```

3. **Generate your dashboard**:
   ```bash
   node seo-dashboard.js html
   open seo-dashboard.html
   ```

✅ Done! You now have a complete SEO health dashboard.

---

## 📦 Prerequisites

### Required

- **Node.js** v18 or higher
- **Webflow account** with site access
- **SEMrush account** (free tier works - just download CSVs manually)
- **Google Search Console** access

### Optional

- **Google Cloud account** (for GSC API automation)
- **Cron/Task Scheduler** (for weekly automation)

---

## 🔧 Tool Setup

### 1. SEMrush (CSV-based - No API)

**Since you don't pay for the SEMrush API, we'll use CSV downloads:**

#### How to Download SEMrush Data

1. Go to https://www.semrush.com/siteaudit/
2. Select your project (scoopanalytics.com)
3. Click on specific issue types:
   - Duplicate meta descriptions
   - Duplicate content
   - Slow loading speed
   - Uncompressed files
   - Non-descriptive anchors
   - Structured data errors
4. Click "Export" → "CSV"
5. Save files to `./data/` folder

**File naming convention:**
```
data/
  ├── scoopanalytics.com_duplicate_meta_description_20260127.csv
  ├── scoopanalytics.com_duplicate_content_20260127.csv
  ├── scoopanalytics.com_slow_loading_speed_20260127.csv
  └── ... (other CSV files)
```

#### Processing SEMrush Data

```bash
# Analyze all CSV files
node semrush-csv-processor.js analyze

# Get prioritized list of fixes
node semrush-csv-processor.js prioritize

# Generate fix scripts
node semrush-csv-processor.js export-fixes
```

---

### 2. Google Search Console API

**Setup (one-time):**

1. **Enable Google Search Console API:**
   - Go to https://console.cloud.google.com/
   - Create a new project (or use existing)
   - Enable "Google Search Console API"
   - Go to "Credentials"
   - Create "OAuth 2.0 Client ID" (Desktop app)
   - Download credentials JSON

2. **Save credentials:**
   ```bash
   # Save as .gsc-credentials.json
   mv ~/Downloads/credentials.json ./.gsc-credentials.json
   ```

3. **Authenticate:**
   ```bash
   node google-search-console.js performance
   # Click the URL, authorize, paste code
   ```

4. **Test:**
   ```bash
   # Get last 30 days performance
   node google-search-console.js performance --days=30

   # Get top queries
   node google-search-console.js queries --limit=50

   # Get top pages
   node google-search-console.js pages --limit=50
   ```

#### GSC Export Options

```bash
# Export performance data
node google-search-console.js export --type=performance --days=90

# Export top queries
node google-search-console.js export --type=queries

# Export top pages
node google-search-console.js export --type=pages
```

All exports are saved to `./data/gsc/`

---

### 3. Webflow Integration

**Your Webflow credentials are already configured:**

```javascript
WEBFLOW_API_TOKEN: d80f0401d9f38719979ce74ba898729dfff9af4981dd9ccf059624aabefa151b
WEBFLOW_SITE_ID: 65fdc9041545b81c2e66e5ac
```

**Available Webflow scripts:**

```bash
# List CMS collections
node webflow-cms.js list-collections

# List items in a collection
node webflow-cms.js list-items <collection-id>

# Create/update CMS items
node webflow-cms.js create-item <collection-id> '{"name": "value"}'
```

---

## 📅 Weekly Workflow

### Automated (Recommended)

```bash
# Run weekly automation script
./weekly-seo-automation.sh

# Or setup cron job (every Monday at 9 AM):
0 9 * * 1 /path/to/weekly-seo-automation.sh
```

**What it does:**
1. ✅ Fetches Google Search Console data
2. ✅ Processes SEMrush CSV files
3. ✅ Generates SEO dashboard (text + HTML)
4. ✅ Tracks progress over time
5. ✅ Creates summary report

### Manual (Step-by-step)

#### Monday Morning Routine (15 minutes)

1. **Download fresh SEMrush data** (5 min):
   - Visit SEMrush Site Audit
   - Export new issues as CSV
   - Save to `./data/` folder

2. **Fetch GSC data** (2 min):
   ```bash
   node google-search-console.js performance --export
   node google-search-console.js queries --export
   node google-search-console.js pages --export
   ```

3. **Generate dashboard** (1 min):
   ```bash
   node seo-dashboard.js html
   open seo-dashboard.html
   ```

4. **Review and prioritize** (5 min):
   ```bash
   node semrush-csv-processor.js prioritize
   ```

5. **Take action** (2 min):
   - If new 404s: `node webflow-redirect-manager.js export`
   - If meta issues: `node meta-fixer.js export-all`

---

## 🛠️ Available Scripts

### Core Tools

| Script | Purpose | Usage |
|--------|---------|-------|
| `semrush-csv-processor.js` | Process SEMrush CSV downloads | `node semrush-csv-processor.js analyze` |
| `google-search-console.js` | Fetch GSC data via API | `node google-search-console.js performance` |
| `seo-dashboard.js` | Generate unified SEO dashboard | `node seo-dashboard.js html` |
| `webflow-redirect-manager.js` | Manage 404 redirects | `node webflow-redirect-manager.js export` |
| `meta-fixer.js` | Fix meta descriptions & canonicals | `node meta-fixer.js export-all` |
| `webflow-cms.js` | Manage Webflow CMS content | `node webflow-cms.js list-collections` |

---

### 1. SEMrush CSV Processor

**Process downloaded SEMrush CSV files**

```bash
# Analyze all issues
node semrush-csv-processor.js analyze

# Get summary
node semrush-csv-processor.js summarize

# Get prioritized action list
node semrush-csv-processor.js prioritize

# Generate fix scripts
node semrush-csv-processor.js export-fixes

# Generate comprehensive report
node semrush-csv-processor.js report
```

**Output:**
- Summary of all SEO issues
- Priority-ranked fix list
- Auto-generated fix scripts
- JSON reports in `./data/reports/`

---

### 2. Google Search Console API

**Fetch performance data from GSC**

```bash
# Get performance summary (last 30 days)
node google-search-console.js performance --days=30

# Get top search queries
node google-search-console.js queries --limit=100

# Get top performing pages
node google-search-console.js pages --limit=100

# View sitemap status
node google-search-console.js sitemaps

# Inspect specific URL
node google-search-console.js inspect https://www.scoopanalytics.com/blog

# Export to CSV
node google-search-console.js performance --export
node google-search-console.js queries --export
node google-search-console.js pages --export
```

**Output:**
- Performance metrics (clicks, impressions, CTR, position)
- CSV exports in `./data/gsc/`

---

### 3. SEO Dashboard

**Generate unified dashboard with all data sources**

```bash
# Generate text report
node seo-dashboard.js generate

# Generate HTML dashboard
node seo-dashboard.js html

# Track progress over time
node seo-dashboard.js track
```

**Output:**
- Overall SEO health score (0-100)
- Priority issues ranked by impact
- Growth opportunities
- Historical tracking
- Interactive HTML dashboard

**Dashboard includes:**
- ✅ SEO health score
- ✅ Critical/high/medium priority issues
- ✅ Growth opportunities
- ✅ GSC performance summary
- ✅ Next action items

---

### 4. Webflow Redirect Manager

**Manage 301 redirects to fix 404 errors**

```bash
# Generate redirect list from 404-redirect-plan.md
node webflow-redirect-manager.js generate

# Validate redirects (check for conflicts)
node webflow-redirect-manager.js validate

# Export to Webflow CSV format
node webflow-redirect-manager.js export

# Preview redirects
node webflow-redirect-manager.js preview
```

**Output:**
- `data/fixes/webflow-redirects.csv` (ready to import to Webflow)
- `data/fixes/all-redirects-with-metadata.json` (complete list)

**How to apply:**
1. Run `node webflow-redirect-manager.js export`
2. Go to Webflow: Project Settings → Hosting → 301 Redirects
3. Click "Import redirects"
4. Upload `data/fixes/webflow-redirects.csv`
5. Review and publish

---

### 5. Meta Description & Canonical Fixer

**Fix duplicate meta descriptions and add canonical tags**

```bash
# Analyze issues
node meta-fixer.js analyze

# Generate unique meta descriptions
node meta-fixer.js fix-meta --dry-run  # Preview
node meta-fixer.js fix-meta            # Export

# Generate canonical tag instructions
node meta-fixer.js add-canonical

# Export everything
node meta-fixer.js export-all
```

**Output:**
- `data/fixes/meta-descriptions-to-update.json` (new descriptions)
- `data/fixes/canonical-tags-instructions.json` (canonical URLs)
- `data/fixes/seo-fixes-report.json` (comprehensive report)

**How to apply:**

1. **Meta Descriptions:**
   - Open `meta-descriptions.csv`
   - For each page in Webflow:
     - Go to Page Settings → SEO Settings
     - Update Meta Description field
     - Publish

2. **Canonical Tags:**
   - For blog pagination pages:
     - Go to Page Settings → SEO Settings → Head Code
     - Add: `<link rel="canonical" href="BASE_URL" />`
     - Publish

---

### 6. Webflow CMS Manager

**Manage Webflow CMS content programmatically**

```bash
# List all collections
node webflow-cms.js list-collections

# List items in a collection
node webflow-cms.js list-items <collection-id>

# Create new item
node webflow-cms.js create-item <collection-id> '{"name": "Test", "slug": "test"}'

# Update existing item
node webflow-cms.js update-item <collection-id> <item-id> '{"name": "Updated"}'

# Delete item
node webflow-cms.js delete-item <collection-id> <item-id>
```

---

## 🔥 Priority Fixes (Start Here)

Based on your current data, fix these issues **in order** for maximum impact:

### Week 1: Foundation (Quick Wins)

#### 1. Fix 404 Errors (177 URLs) 🔴 **CRITICAL**

**Impact:** +15-20% organic traffic
**Effort:** Medium (2-3 hours)

```bash
node webflow-redirect-manager.js export
```

Then upload `webflow-redirects.csv` to Webflow.

#### 2. Add Canonical Tags (Blog Pagination) 🟠 **HIGH**

**Impact:** +10% indexing improvement
**Effort:** Low (30 minutes)

```bash
node meta-fixer.js add-canonical
```

Add canonical tags to all blog pagination pages pointing to base URL.

---

### Week 2: Content Quality

#### 3. Fix Structured Data Errors 🟠 **HIGH**

**Impact:** Rich snippets eligibility
**Effort:** Medium (1-2 hours)

Fix JSON-LD schema markup errors identified in SEMrush.

#### 4. Update Meta Descriptions (9 pages) 🟡 **MEDIUM**

**Impact:** +2-5% CTR improvement
**Effort:** Low (30 minutes)

```bash
node meta-fixer.js fix-meta
```

Apply unique meta descriptions to each page.

---

### Week 3: Performance

#### 5. Enable Webflow Compression 🟡 **MEDIUM**

**Impact:** +5-10% organic traffic, better Core Web Vitals
**Effort:** Low (15 minutes)

In Webflow:
- Project Settings → Hosting → Performance
- Enable Gzip/Brotli compression
- Enable asset minification
- Publish

---

### Week 4: Growth

#### 6. Create Alternatives Pages 💡 **OPPORTUNITY**

**Impact:** +25% organic traffic
**Effort:** High (ongoing)

Implement programmatic SEO strategy from `/strategies/programmatic-seo/`:
- Start with Tier 1: Tableau, Power BI, Looker alternatives
- Use template: `alternatives-page-template.md`
- Target keywords with 1,000+ monthly searches

---

## 📊 Understanding Your Dashboard

### Health Score Calculation

Your SEO health score (0-100) is calculated as:

- **Base:** 100 points
- **404 errors:** -0.2 points each (max -20)
- **Duplicate content:** -0.1 points each (max -15)
- **Structured data errors:** -0.05 points each (max -10)
- **Slow pages:** -0.5 points each (max -10)
- **Duplicate meta:** -0.5 points each (max -5)
- **Uncompressed files:** -0.01 points each (max -10)
- **Other issues:** Various deductions

**Current Score:** ~65/100 (needs improvement)

**Score Ranges:**
- 🟢 80-100: Excellent
- 🟡 60-79: Good (minor issues)
- 🟠 40-59: Needs work
- 🔴 0-39: Critical issues

---

### Issue Priority Levels

| Priority | Description | Action Timeline |
|----------|-------------|-----------------|
| 🔴 **Critical** | Blocking traffic/indexing | Fix immediately |
| 🟠 **High** | Significant impact on rankings | Fix this week |
| 🟡 **Medium** | Moderate impact | Fix this month |
| 🟢 **Low** | Minor optimization | Fix when able |

---

## 🎯 Growth Opportunities

### 1. Programmatic SEO: Alternatives Pages

**Current Status:** Strategy documented, 6 draft pages created
**Potential Impact:** +25% organic traffic
**Monthly Search Volume:** 5,000+ searches

**Quick Start:**
```bash
# Templates are in: ./strategies/programmatic-seo/
# Start with Tier 1 pages (highest volume):
- Tableau alternatives
- Power BI alternatives
- Looker alternatives
- ThoughtSpot alternatives
- Domo alternatives
```

**Implementation:**
1. Use `alternatives-page-template.md` as base
2. Research competitor (pricing, features, pain points)
3. Position Scoop as solution
4. Optimize for featured snippets
5. Create in Webflow CMS
6. Publish and monitor GSC

---

### 2. Integration Pages

**Potential Impact:** +30% organic traffic
**Target:** 100+ pages
**Monthly Search Volume:** 10,000+ searches

**Examples:**
- "HubSpot Google Analytics integration"
- "Salesforce HubSpot integration"
- "Shopify Google Analytics integration"

**Template Structure:**
1. H1: "[Tool A] [Tool B] Integration"
2. Quick answer (what it does)
3. Why integrate (benefits)
4. How to set up (step-by-step)
5. Scoop as alternative (easier integration)
6. FAQ (schema markup)

---

### 3. Featured Snippet Optimization

**Current Opportunity:** Pages ranking #2-5

Check GSC data for queries where you rank 2-5:
```bash
node google-search-console.js queries --limit=100
```

**Optimization:**
- Add quick answer box at top
- Use structured data (HowTo, FAQ schemas)
- Format content as lists/tables
- Add schema markup

---

## 🚨 Troubleshooting

### Google Search Console Issues

**Problem:** Authentication fails

**Solution:**
```bash
# Delete old token
rm .gsc-token.json

# Re-authenticate
node google-search-console.js performance
# Follow OAuth flow again
```

---

**Problem:** "Permission denied" error

**Solution:**
- Verify you're a site owner in GSC
- Check property URL matches (with/without www)
- Update `SITE_URL` in `google-search-console.js`:
  ```javascript
  const SITE_URL = 'sc-domain:scoopanalytics.com';
  // or
  const SITE_URL = 'https://www.scoopanalytics.com/';
  ```

---

### SEMrush CSV Issues

**Problem:** "No data to export" error

**Solution:**
- Check CSV files are in `./data/` folder
- Verify file names match expected pattern
- Ensure CSVs have headers (first row)
- Check CSV encoding (should be UTF-8)

---

**Problem:** CSV parsing errors

**Solution:**
```bash
# Check file format
head -n 5 data/scoopanalytics.com_duplicate_content_20260127.csv

# Ensure proper CSV format:
# - Comma-separated values
# - Quoted strings with commas
# - First row is headers
```

---

### Webflow Integration Issues

**Problem:** API token expired or invalid

**Solution:**
- Go to Webflow Dashboard → Account Settings → Integrations
- Generate new API token
- Update in scripts:
  ```bash
  export WEBFLOW_API_TOKEN="your-new-token"
  ```

---

**Problem:** "Site not found" error

**Solution:**
- Verify site ID:
  ```bash
  node webflow-cms.js list-collections
  ```
- Update `WEBFLOW_SITE_ID` if needed

---

## ❓ FAQ

### Do I need to pay for the SEMrush API?

**No!** The system works with free CSV downloads from SEMrush. Just:
1. Log into SEMrush
2. Go to Site Audit
3. Export issues as CSV
4. Save to `./data/` folder

The `semrush-csv-processor.js` script processes these CSVs without API access.

---

### How often should I run the automation?

**Recommended:** Weekly (every Monday morning)

- Download fresh SEMrush CSVs: **Weekly**
- Fetch GSC data: **Weekly** (automated)
- Generate dashboard: **Weekly** (automated)
- Apply fixes: **As needed** (based on dashboard)

---

### Can I automate SEMrush CSV downloads?

Unfortunately, SEMrush doesn't provide CSV download via API on free plans. You'll need to:
1. Log in to SEMrush manually
2. Download CSVs (takes 2-3 minutes)
3. Save to `./data/` folder

**Tip:** Bookmark the Site Audit page for quick access.

---

### How do I track progress over time?

```bash
# Track progress automatically
node seo-dashboard.js track

# View historical data
cat data/reports/tracking.json
```

The tracking file stores:
- SEO health score over time
- Issue counts
- Trends (improving/declining)

---

### What if I have multiple Webflow sites?

Update the site ID for each site:
```javascript
// In each script, change:
const WEBFLOW_SITE_ID = 'your-other-site-id';
```

Or use environment variables:
```bash
export WEBFLOW_SITE_ID="site-id-2"
node seo-dashboard.js generate
```

---

### Can I use this with other CMS platforms?

The SEMrush and GSC integrations work with any platform. The Webflow-specific scripts (`webflow-cms.js`, redirect manager) would need to be adapted for your CMS.

---

### How do I export the dashboard for my team?

```bash
# Generate HTML dashboard
node seo-dashboard.js html

# Share the file:
# - Email seo-dashboard.html
# - Host on internal server
# - Share via Google Drive/Dropbox
```

The HTML dashboard is self-contained (no external dependencies).

---

## 📚 Additional Resources

### Strategy Documents

- `404-redirect-plan.md` - Comprehensive 404 fix plan
- `strategies/programmatic-seo/` - Alternatives pages strategy
- `strategies/scoop-self-service-pipeline-strategy.md` - Growth strategy
- `SEMRUSH-WEBFLOW-SETUP.md` - Original setup guide (with API)

### Data Files

- `data/gsc/` - Google Search Console exports
- `data/reports/` - Generated reports and tracking
- `data/fixes/` - Generated fix files for Webflow
- `data/scoop-webflow-303-redirects.csv` - Existing redirects

### Example Pages

- `strategies/programmatic-seo/examples/` - 6 draft alternatives pages
- `alternatives-page-template.md` - Template for new pages

---

## 🎓 Best Practices

### 1. Weekly SEO Routine

**Every Monday (15 minutes):**
1. ☑️ Download latest SEMrush CSVs
2. ☑️ Run `./weekly-seo-automation.sh`
3. ☑️ Review HTML dashboard
4. ☑️ Apply top 2-3 priority fixes
5. ☑️ Track progress

---

### 2. Prioritization Framework

When facing multiple issues, fix in this order:

1. **Critical blockers** (404s, indexing issues)
2. **High-impact, low-effort** (meta descriptions, canonical tags)
3. **High-impact, medium-effort** (structured data, compression)
4. **Growth opportunities** (new content, features)
5. **Low-priority optimizations** (anchor text, minor issues)

---

### 3. Testing Before Publishing

Always test fixes in Webflow staging:

```bash
# 1. Generate fixes with dry-run first
node meta-fixer.js fix-meta --dry-run

# 2. Review output

# 3. Export for real
node meta-fixer.js fix-meta

# 4. Apply in Webflow staging

# 5. Test in staging

# 6. Publish to production
```

---

### 4. Monitoring Results

After implementing fixes, monitor:

- **Week 1:** Check GSC for crawl errors
- **Week 2:** Monitor impressions/clicks
- **Month 1:** Check ranking improvements
- **Month 3:** Measure traffic impact

```bash
# Track weekly
node seo-dashboard.js track

# Compare scores
cat data/reports/tracking.json | jq '.history[-5:]'
```

---

## 🎉 Success Metrics

### Short-term (1-2 weeks)
- ✅ All critical 404s redirected
- ✅ Canonical tags added to pagination
- ✅ Unique meta descriptions on all key pages
- ✅ SEO health score above 75/100

### Medium-term (1-3 months)
- ✅ 10+ alternatives pages published
- ✅ Structured data errors reduced by 80%
- ✅ Average position improved by 2+ ranks
- ✅ Organic traffic +15-20%

### Long-term (3-6 months)
- ✅ 26+ alternatives pages live (full strategy)
- ✅ 100+ integration pages published
- ✅ SEO health score above 85/100
- ✅ Organic traffic +40-50%

---

## 🤝 Support

### Getting Help

1. **Check the FAQ** above
2. **Review error logs:** `cat seo-automation.log`
3. **Test individual scripts** to isolate issues
4. **Check data files** are in correct format

### Common Commands Cheatsheet

```bash
# Quick health check
node seo-dashboard.js generate

# Download latest GSC data
node google-search-console.js performance --export
node google-search-console.js queries --export

# Process SEMrush CSVs
node semrush-csv-processor.js analyze

# Generate HTML dashboard
node seo-dashboard.js html && open seo-dashboard.html

# Export redirects
node webflow-redirect-manager.js export

# Export meta fixes
node meta-fixer.js export-all

# Run full automation
./weekly-seo-automation.sh
```

---

## 🚀 Next Steps

Now that you're set up, here's your action plan:

### Today (30 minutes)
1. ✅ Run `node seo-dashboard.js html`
2. ✅ Review your current SEO health score
3. ✅ Identify top 3 priority issues

### This Week (2-3 hours)
1. ✅ Fix 404 errors (`node webflow-redirect-manager.js export`)
2. ✅ Add canonical tags to blog pagination
3. ✅ Update duplicate meta descriptions

### This Month (ongoing)
1. ✅ Create first 5 alternatives pages
2. ✅ Fix structured data errors
3. ✅ Enable Webflow compression
4. ✅ Start weekly automation routine

---

**Ready to improve your organic traffic? Let's go! 🚀**

For questions or issues, review the troubleshooting section or check the logs.
