# GSC 404 Redirect Plan

## Summary

**Total 404s:** 177 URLs

| Category | Count | Fix |
|----------|-------|-----|
| Docs - Branch URLs | ~35 | Redirect `/branches/2.1/guides/X` → `/docs/X` |
| Docs - Spaces in URLs | ~15 | Broken crawls, likely not real pages |
| Docs - `.md` extensions | ~5 | Redirect to clean URLs |
| Docs - Duplicate paths | ~10 | Redirect `/docs/docs` → `/docs` |
| Docs - Database pages | ~15 | Consolidate database doc paths |
| Docs - Reference pages | ~5 | Redirect or remove from sitemap |
| Main site - Old pages | ~20 | Redirect to current equivalents |
| Main site - Case studies | ~15 | Check if pages exist, redirect or 410 |
| Main site - Template bugs | ~5 | `${comp.slug}` - fix in Webflow |
| Main site - Tracking params | ~3 | Redirect to clean URLs |
| Broken/Empty paths | ~10 | 410 (gone) or redirect to parent |

---

## Category 1: Docs Branch URLs (~35 URLs)

**Pattern:** `docs.scoopanalytics.com/branches/2.1/guides/X`

These are versioned doc URLs that should redirect to current docs.

| 404 URL | Redirect To |
|---------|-------------|
| `/branches/2.1/guides/email-automated-imports` | `/docs/email-automated-imports` |
| `/branches/2.1/guides/scoop-process-mining` | `/docs/scoop-process-mining` |
| `/branches/2.1/guides/live-query` | `/docs/live-query` |
| `/branches/2.1/guides/grouped-reports` | `/docs/grouped-reports` |
| `/branches/2.1/guides/visualizing-charts-and-tables` | `/docs/visualizing-charts-and-tables` |
| `/branches/2.1/guides/recipes-collaboration-guide` | `/docs/recipes-collaboration-guide` |
| `/branches/2.1/guides/visualizations-reporting-guide` | `/docs/visualizations-reporting-guide` |
| `/branches/2.1/guides/reprocessing-data` | `/docs/reprocessing-data` |
| `/branches/2.1/guides/canvases-recipes-deep-dive` | `/docs/canvases-recipes-deep-dive` |
| `/branches/2.1/guides/enterprise-slack-sharing` | `/docs/enterprise-slack-sharing` |
| `/branches/2.1/guides/meet-your-ai-data-analyst` | `/docs/meet-your-ai-data-analyst` |
| `/branches/2.1/guides/machine-learning-analytics` | `/docs/machine-learning-analytics` |
| `/branches/2.1/guides/predictive-relationships` | `/docs/predictive-relationships` |
| `/branches/2.1/guides/grouppopulation-comparisons` | `/docs/grouppopulation-comparisons` |
| `/branches/2.1/guides/automated-analysis` | `/docs/automated-analysis` |
| `/branches/2.1/guides/scoop-for-slack` | `/docs/scoop-for-slack` |
| `/branches/2.1/guides/dataset-queries` | `/docs/dataset-queries` |
| `/branches/2.1/guides/best-practices-in-selectingcreating-source-reports` | `/docs/best-practices` |
| `/branches/2.1/guides/asana` | `/docs/asana` |
| `/branches/2.1/guides/bulk-data-loading` | `/docs/bulk-data-loading` |
| `/branches/2.1/guides/how-to-create-a-presentation` | `/docs/how-to-create-a-presentation` |
| `/branches/2.1/guides/periodtime-range-comparisons` | `/docs/periodtime-range-comparisons` |
| `/branches/2.1/guides/what-is-scoop` | `/docs/what-is-scoop` |
| `/branches/2.1/guides/process-analysis` | `/docs/process-analysis` |
| `/branches/2.1/guides/blending-two-datasets` | `/docs/blending-two-datasets` |
| `/branches/2.1/guides/understanding-scoop-ai` | `/docs/understanding-scoop-ai` |
| `/branches/2.1/guides/using-scoop-in-channels` | `/docs/using-scoop-in-channels` |
| `/branches/2.1/guides/woocommerce` | `/docs/woocommerce` |
| `/branches/2.1/guides/connect-your-data` | `/docs/connect-your-data` |
| `/branches/2.1/guides/bring-your-own-key-byok` | `/docs/bring-your-own-key-byok` |
| `/branches/2.1/guides/automatically-filling-out-a-presentation-table` | `/docs/automatically-filling-out-a-presentation-table` |
| `/branches/2.1/guides/google-analytics` | `/docs/google-analytics` |
| `/branches/1.0` | `/docs` |

**Action:** Set up wildcard redirect in docs platform: `/branches/*/guides/*` → `/docs/*`

---

## Category 2: Docs - Spaces in URLs (~15 URLs)

**Pattern:** URLs with literal spaces (likely encoding issues in sitemap)

These are malformed URLs - Google crawled broken links.

| 404 URL | Issue |
|---------|-------|
| `/Connecting to Data/specific-applications/index` | Space in path |
| `/Connecting to Data/specific-applications/hubspot` | Space in path |
| `/Exploring and Visualizing Data/time-series-analysis` | Space in path |
| `/Exploring and Visualizing Data/charting-time-series-data` | Space in path |
| `/Preparing Datasets/blending-two-datasets/index` | Space in path |
| `/Preparing Datasets/blending-two-datasets` | Space in path |
| `/Preparing Datasets/dataset-queries` | Space in path |
| `/AI Analytics/automated-analysis` | Space in path |
| `/Canvases/canvas-objects` | Space in path |
| `/Canvases/canvas-objects/interactive-charts-and-tables` | Space in path |
| `/Canvases/canvas-objects/prompts` | Space in path |
| `/Canvases/importing-a-powerpoint-or-slides-presentation/how-to-create-a-presentation` | Space in path |
| `/Canvases/what-is-a-canvas-and-what-can-it-do` | Space in path |
| `/Live Worksheets/creating-a-livesheet` | Space in path |
| `/Enterprise Features/crm-writeback` | Space in path |
| `/Scoop for Slack/scoop-for-slack/understanding-scoop-ai.md` | Space + .md |
| `/Scoop for Slack/scoop-for-slack/machine-learning-analytics.md` | Space + .md |
| `/Scoop for Slack/scoop-for-slack/enterprise-slack-sharing.md` | Space + .md |
| `/Enterprise Features/bring-your-own-key-byok.md` | Space + .md |

**Action:**
1. Find source of broken links (internal links, sitemap)
2. Set up redirects: `/Connecting%20to%20Data/*` → `/docs/connect-your-data/*`

---

## Category 3: Main Site - Old Pages (~20 URLs)

| 404 URL | Redirect To |
|---------|-------------|
| `/book-a-demo` | `/demo` or current booking page |
| `/book-demo` | `/demo` |
| `/schedule-demo` | `/demo` |
| `/free-trial` | `/signup` or `/try` |
| `/solutions` | `/` or `/use-cases` |
| `/our-solutions` | `/` or `/use-cases` |
| `/features` | `/` or `/product` |
| `/agencies` | `/` (if discontinued) |
| `/ai` | `/` or `/product` |
| `/type-of-companies` | `/` |
| `/deep-dives` | `/blog` |
| `/quick-reads` | `/blog` |
| `/kpi-library` | Keep or redirect to relevant page |
| `/analysis-pages` | Keep or redirect |
| `/industry-case-studies` | Keep or redirect to `/case-studies` |

---

## Category 4: Template/Bug URLs (~5 URLs)

These are broken template variables that were published:

| 404 URL | Fix |
|---------|-----|
| `/competitors/${comp.slug}` | Fix in Webflow CMS template |
| `/embed/` | Remove or redirect to `/` |
| `/blog-category/` | Redirect to `/blog` |
| `/watch?v` | Remove (YouTube embed mistake) |

**Action:** Fix in Webflow, then 410 these URLs

---

## Category 5: Database Docs (~15 URLs)

Multiple paths for same content:

| 404 URL | Redirect To |
|---------|-------------|
| `/docs/databases/clickhouse` | `/databases/clickhouse` |
| `/docs/databases/greenplum` | `/databases/greenplum` |
| `/docs/databases/ibm-db2` | `/databases/ibm-db2` |
| `/docs/databases/vertica` | `/databases/vertica` |
| `/docs/databases/bigquery` | `/databases/bigquery` |
| `/docs/databases/mysql` | `/databases/mysql` |
| `/docs/databases/teradata` | `/databases/teradata` |
| `/docs/databases/redshift` | `/databases/redshift` |
| `/docs/databases/postgresql` | `/databases/postgresql` |
| `/docs/databases/oracle` | `/databases/oracle` |
| `/docs/databases/sqlserver` | `/databases/sqlserver` |
| `/docs/databases/snowflake` | `/databases/snowflake` |
| `/docs/databases/mariadb` | `/databases/mariadb` |
| `/databases/live-query` | `/docs/live-query` |
| `/databases/sql-server` | `/databases/sqlserver` |
| `/databases/index` | `/databases` |
| `/databases` | Check if page exists |

---

## Category 6: Duplicate/Broken Doc Paths

| 404 URL | Redirect To |
|---------|-------------|
| `/docs/docs` | `/docs` |
| `/docs/index` | `/docs` |
| `/docs/concepts` | `/docs` |
| `/reference/DOMAIN_INTELLIGENCE_INVESTIGATION_COORDINATOR` | Remove (internal) |
| `/reference/MESSAGING_BIBLE` | Remove (internal) |
| `/reference/BULK_CSV_LOADER_GUIDE` | Remove (internal) |
| `/docs/ai-presentations/index.md` | `/docs/ai-presentations` |
| `/docs/win-loss-investigation.md` | `/docs/win-loss-investigation` |
| `/docs/segmentation-investigation.md` | `/docs/segmentation-investigation` |
| `/docs/revenue-investigation.md` | `/docs/revenue-investigation` |

---

## Priority Actions

### Immediate (This Week)
1. **Fix Webflow template bug** - `${comp.slug}` generating bad URLs
2. **Set up main redirect rules:**
   - `/book-a-demo` → `/demo`
   - `/book-demo` → `/demo`
   - `/free-trial` → `/signup`
3. **410 broken paths:** `/embed/`, `/watch?v`, `/blog-category/`

### Short-term (This Month)
4. **Docs platform:** Add wildcard redirect `/branches/*/guides/*` → `/docs/*`
5. **Consolidate database docs** to single path structure
6. **Fix space-in-URL issues** - find source and correct

### Ongoing
7. **Remove internal reference pages** from sitemap
8. **Monitor GSC** for new 404s weekly
9. **Submit updated sitemap** after fixes

---

## Implementation Notes

**For Webflow (main site):**
- Go to Project Settings → Hosting → 301 Redirects
- Add each redirect as: Old Path → New Path
- Can use regex patterns for bulk redirects

**For Docs site:**
- Depends on platform (GitBook, Readme, custom?)
- Need access to configure redirects

**After implementing:**
1. Wait 1-2 weeks for Google to recrawl
2. Check GSC for reduced 404 count
3. Use "Validate Fix" in GSC for each issue type
