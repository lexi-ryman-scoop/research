# List Building Guide: Apollo Filterability & Alternative Methods

## Tech Stack Filterability in Apollo

Apollo tracks **~1,500 technologies**, but there's a key distinction: **front-end/marketing tools** (detectable via website code) vs. **back-end/internal tools** (not detectable).

### ✅ Highly Filterable in Apollo (Front-End/Marketing Tools)

These tools leave detectable signatures on websites or have strong Apollo coverage:

| Technology | Apollo Filterable | Detection Method |
|------------|-------------------|------------------|
| **HubSpot** | ✅ Yes | Marketing tracking code, forms |
| **Salesforce** | ✅ Yes | Pardot tracking, Salesforce integrations |
| **Google Analytics** | ✅ Yes | GA tracking code on website |
| **Google Ads** | ✅ Yes | Conversion pixels, remarketing tags |
| **Pipedrive** | ✅ Yes | Web forms, chat widgets |
| **Copper** | ✅ Partial | Google Workspace signals |
| **Airtable** | ✅ Yes | Embedded bases, forms |
| **Monday.com** | ✅ Yes | Embedded boards, integrations |
| **TikTok** | ✅ Yes | TikTok Pixel on website |
| **Google Sheets** | ⚠️ Indirect | Via Google Workspace detection |

### ⚠️ Partially Filterable (May Require Enrichment)

| Technology | Apollo Filterable | Notes |
|------------|-------------------|-------|
| **LinkedIn** (as a tool) | ⚠️ Indirect | Can filter by "uses LinkedIn Sales Navigator" |
| **Apollo** | ⚠️ Limited | Ironic—Apollo users ARE in Apollo |
| **Attio** | ❌ Limited | New tool, limited coverage |
| **Close** | ⚠️ Partial | Growing coverage |
| **QuickBooks** | ⚠️ Indirect | Via accounting software category |

### ❌ Not Directly Filterable in Apollo (Back-End/Internal Tools)

These are internal tools with no website footprint—Apollo can't detect them:

| Technology | Why Not Filterable | Alternative Method |
|------------|-------------------|-------------------|
| **Snowflake** | Internal data warehouse | Job postings, LinkedIn, communities |
| **PostgreSQL** | Internal database | Job postings, GitHub, tech blogs |
| **MySQL** | Internal database | Job postings, GitHub |
| **Amazon Redshift** | Internal data warehouse | Job postings, AWS partner lists |
| **Google BigQuery** | Internal data warehouse | Job postings, GCP partner lists |
| **Oracle Database** | Internal database | Job postings, Oracle partner lists |
| **SQL Server** | Internal database | Job postings, Microsoft partner lists |
| **MariaDB** | Internal database | Job postings, GitHub |
| **ClickHouse** | Internal database | Job postings, ClickHouse community |
| **Greenplum** | Internal database | Job postings, VMware partner lists |
| **IBM DB2** | Internal database | Job postings, IBM partner lists |
| **Teradata** | Internal data warehouse | Job postings, Teradata events |
| **Vertica** | Internal data warehouse | Job postings, Vertica community |
| **Amplitude** | Internal analytics | Job postings, Amplitude community |
| **Jira** | Internal project management | Job postings, Atlassian community |
| **Sharetribe** | Marketplace platform | Sharetribe showcase, communities |

---

## Alternative List-Building Methods

### Method 1: Job Posting Mining (Best for Internal Tools)

Job postings reveal internal tech stacks. Tools to use:

| Tool | Cost | Best For |
|------|------|----------|
| **TheirStack** | $0.11/company | Budget-friendly tech detection via job posts |
| **Bloomberry** | $199/mo | Premium job post analysis for tech stacks |
| **LinkedIn Jobs** | Free (manual) | Search "Snowflake" or "Amplitude" in job descriptions |
| **Indeed/Glassdoor** | Free (manual) | Cross-reference tech requirements |

**How to use:**
1. Search LinkedIn Jobs for "Snowflake engineer" or "Amplitude analyst"
2. Note the companies hiring for those roles
3. Cross-reference with Apollo to get contacts at those companies
4. Filter by title (Marketing Manager, RevOps, etc.)

**Example search strings:**
- `"Snowflake" AND "data analyst"` → Companies using Snowflake
- `"Amplitude" AND "product"` → Companies using Amplitude
- `"BigQuery" AND "marketing"` → Companies using BigQuery for marketing

### Method 2: LinkedIn Sales Navigator Boolean Search

LinkedIn Sales Navigator lets you search job descriptions and profiles for tech mentions:

**Example searches:**
```
Title: "Marketing Manager"
Company Size: 51-500
Keywords in profile: "HubSpot" AND "Google Analytics"
```

```
Title: "RevOps" OR "Revenue Operations"
Company Size: 101-500
Keywords: "Salesforce" AND "BigQuery"
```

```
Title: "Product Manager"
Company Size: 101-500
Keywords: "Amplitude" AND "Jira"
```

**Pro tip:** People often list tools they use in their LinkedIn summaries or job descriptions.

### Method 3: Community & Event Lists

| Technology | Community/Event | How to Access |
|------------|-----------------|---------------|
| **Snowflake** | Snowflake Summit attendees, Snowflake Community | Snowflake partner programs, event sponsorship |
| **Amplitude** | Amplify conference, Amplitude Community | Amplitude events, community Slack |
| **BigQuery** | Google Cloud Next attendees | GCP partner programs |
| **Jira** | Atlassian Team conference | Atlassian community, user groups |
| **HubSpot** | INBOUND conference attendees | HubSpot partner directory |
| **Salesforce** | Dreamforce, Trailblazer Community | Salesforce AppExchange, events |

### Method 4: Integration Partner Directories

Many tools have public directories of companies using them:

| Technology | Directory/Marketplace |
|------------|----------------------|
| **HubSpot** | HubSpot Solutions Directory, App Marketplace reviews |
| **Salesforce** | AppExchange reviews, Salesforce Customer Stories |
| **Snowflake** | Snowflake Partner Network, case studies |
| **Amplitude** | Amplitude customer stories page |
| **Jira** | Atlassian Marketplace reviews |
| **Monday.com** | Monday.com customer stories |

### Method 5: BuiltWith + Enrichment Combo

For front-end detectable tools, use BuiltWith to find websites, then enrich in Apollo:

1. **BuiltWith** → Find websites using HubSpot + Google Analytics + Google Ads
2. **Export domain list** from BuiltWith
3. **Import to Apollo** → Enrich with contacts
4. **Filter by title** → Marketing Manager, etc.

**BuiltWith categories that work:**
- Analytics: Google Analytics, Amplitude (web SDK), Mixpanel
- Marketing Automation: HubSpot, Marketo, Pardot
- Advertising: Google Ads, TikTok Pixel, Facebook Pixel
- CRM widgets: Salesforce chat, HubSpot chat

### Method 6: GitHub & Technical Communities

For database technologies specifically:

| Source | What to Search | How to Extract |
|--------|---------------|----------------|
| **GitHub** | Company repos using PostgreSQL/MySQL | Company domain → Apollo lookup |
| **Stack Overflow** | Companies with employees asking Snowflake questions | Employer data → Apollo lookup |
| **dbt Community** | dbt + Snowflake/BigQuery users | Community member companies |
| **Reddit** | r/snowflake, r/bigquery, r/dataengineering | Company mentions |

---

## Recommended List-Building Strategy by Segment

### Segment 1: Marketing Managers (HubSpot + GA + Google Ads)
**Primary method:** Apollo direct filter ✅
```
Apollo filters:
- Technologies: HubSpot Marketing Hub, Google Analytics, Google Ads
- Title: Marketing Manager, Demand Gen Manager
- Company size: 51-500
- Industry: Computer Software, Professional Services
```
**Backup:** BuiltWith export → Apollo enrichment

---

### Segment 2: RevOps Managers (Salesforce + HubSpot + BigQuery)
**Primary method:** Apollo (Salesforce + HubSpot) + Job posting mining (BigQuery)
```
Step 1 - Apollo filters:
- Technologies: Salesforce, HubSpot
- Title: RevOps Manager, Revenue Operations
- Company size: 101-500

Step 2 - Refine with job posting data:
- Search LinkedIn Jobs for "BigQuery" at those same companies
- Or use TheirStack to identify BigQuery users, then cross-reference
```

---

### Segment 3: B2B Sales (Salesforce + LinkedIn + Apollo)
**Primary method:** Apollo direct ✅ (they're literally Apollo users)
```
Apollo filters:
- Technologies: Salesforce
- Title: SDR Manager, Sales Manager, VP Sales
- Company size: 101-500
- Intent signal: Using sales engagement tools
```
**Note:** Apollo users are IN Apollo—you can filter by "Apollo.io" technology usage.

---

### Segment 4: Product Managers (Jira + Amplitude + BigQuery)
**Primary method:** Job posting mining + LinkedIn boolean
```
Step 1 - LinkedIn Sales Navigator:
- Title: Product Manager, Senior PM
- Company size: 101-500
- Boolean: "Amplitude" OR "product analytics"

Step 2 - Cross-reference:
- Search LinkedIn Jobs for "Jira" AND "Amplitude" at those companies
- Use TheirStack to find companies hiring for Amplitude roles

Step 3 - Enrich in Apollo:
- Import company list → get PM contacts
```

---

### Segment 5: Operations Managers (Monday.com + Airtable + Google Sheets)
**Primary method:** Apollo direct filter ✅
```
Apollo filters:
- Technologies: Monday.com, Airtable
- Title: Operations Manager, Project Manager
- Company size: 51-500
- Industry: Marketing & Advertising, Professional Services
```
**Backup:** Monday.com customer stories + Airtable Universe contributors

---

## Tool Cost Comparison

| Tool | Monthly Cost | Best Use Case |
|------|-------------|---------------|
| **Apollo** | $49-119/user | Primary list building + outreach |
| **BuiltWith** | $295-495/mo | Front-end tech detection at scale |
| **TheirStack** | ~$50/mo | Job posting tech stack mining |
| **Bloomberry** | $199/mo | Premium job post intelligence |
| **LinkedIn Sales Nav** | $99/user | Boolean search + relationship mapping |
| **UpLead** | $99/mo | 16,000+ technologies tracked |
| **ZoomInfo** | $15K+/year | Enterprise technographics + intent |

---

## Recommended Stack for Your Campaign

**Budget option ($150-250/mo):**
- Apollo (primary) + LinkedIn Sales Nav + manual job post mining

**Mid-tier option ($400-600/mo):**
- Apollo + BuiltWith + TheirStack

**Premium option ($800+/mo):**
- Apollo + BuiltWith + Bloomberry + LinkedIn Sales Nav

---

## Quick Reference: Your 5 Segments

| Segment | Apollo Filterable? | Alternative Needed? |
|---------|-------------------|---------------------|
| 1. Marketing (HubSpot + GA + Ads) | ✅ 100% | No |
| 2. RevOps (SF + HubSpot + BigQuery) | ⚠️ 66% | Yes - BigQuery via job posts |
| 3. Sales (SF + LinkedIn + Apollo) | ✅ 100% | No |
| 4. Product (Jira + Amplitude + BQ) | ❌ 0% | Yes - all via job posts/LinkedIn |
| 5. Ops (Monday + Airtable + Sheets) | ✅ 90% | Minimal |

**Bottom line:** Segments 1, 3, and 5 can be built entirely in Apollo. Segments 2 and 4 need supplemental job posting mining or LinkedIn boolean searches for the internal tools (BigQuery, Jira, Amplitude).

