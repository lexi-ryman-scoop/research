# Scoop Analytics - Marketing & Growth Research

This repo contains marketing strategies, campaign assets, and research for Scoop Analytics.

## Folder Structure

```
├── strategies/         # Growth and lead gen strategy docs
├── campaigns/          # Campaign playbooks and execution plans
├── product/            # Product positioning, messaging, differentiation
├── brand/              # Brand voice and style guidelines
├── sales/              # Sales enablement materials
└── data/               # Raw data, exports, research
    ├── gsc/            # Google Search Console exports
    └── hbs-outreach/   # HBS alumni outreach data
```

## Key Documents

- **[Self-Service Pipeline Strategy](strategies/scoop-self-service-pipeline-strategy.md)** - SEO, Reddit, retargeting, partnerships
- **[Lead Gen Strategy Research](strategies/scoop-lead-gen-strategy-research.md)** - Volume-focused lead gen tactics
- **[Campaign Master](campaigns/scoop-campaign-master.md)** - Apollo segments and outreach playbook
- **[Messaging Framework](product/scoop-messaging-framework-v7.md)** - Core messaging by segment
- **[Competitive Positioning](product/competitive-positioning-guide-v2.md)** - How we compare to competitors

## Data Files

Place exports here:
- GSC 404 exports → `data/gsc/`
- Webflow exports → `data/`
- Apollo/outreach lists → `data/`
- SEMrush audit exports → `data/`

## SEMrush + Webflow Integration

Automated SEO fix system that connects SEMrush site audits to Webflow.

### Quick Start

```bash
# 1. Set your API credentials
export SEMRUSH_API_KEY="your-key"
export SEMRUSH_PROJECT_ID="your-project-id"
export WEBFLOW_API_TOKEN="your-token"
export WEBFLOW_SITE_ID="your-site-id"

# 2. Scan for SEO issues
node seo-fixer.js scan

# 3. Preview fixes
node seo-fixer.js fix --dry-run

# 4. Apply fixes
node seo-fixer.js fix
```

### Scripts

| Script | Purpose |
|--------|---------|
| `semrush-api.js` | Pull SEMrush site audit data |
| `webflow-cms.js` | Manage Webflow CMS content |
| `seo-fixer.js` | Combined tool to auto-fix SEO issues |

See **[SEMRUSH-WEBFLOW-SETUP.md](SEMRUSH-WEBFLOW-SETUP.md)** for full setup instructions.
