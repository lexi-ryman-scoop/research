#!/usr/bin/env node

/**
 * Webflow Redirect Manager
 *
 * Helps manage 301/302 redirects in Webflow to fix 404 errors.
 * Reads from 404-redirect-plan.md and generates redirect CSV for Webflow.
 *
 * Webflow redirect format:
 * /old-url, /new-url
 *
 * Usage:
 *   node webflow-redirect-manager.js generate
 *   node webflow-redirect-manager.js validate
 *   node webflow-redirect-manager.js export
 *   node webflow-redirect-manager.js preview
 */

const fs = require('fs');
const path = require('path');

class WebflowRedirectManager {
  constructor() {
    this.redirects = [];
    this.existingRedirects = [];
  }

  /**
   * Generate redirects from 404-redirect-plan.md
   */
  generateFromPlan() {
    console.log('📋 Generating redirects from 404-redirect-plan.md\n');

    // Main site redirects (from the plan)
    const mainSiteRedirects = {
      // Demo/booking pages
      '/book-a-demo': '/demo',
      '/book-demo': '/demo',
      '/schedule-demo': '/demo',
      '/free-trial': '/signup',

      // Solutions pages
      '/solutions': '/use-cases',
      '/our-solutions': '/use-cases',
      '/features': '/product',
      '/agencies': '/',
      '/ai': '/product',
      '/type-of-companies': '/industries',

      // Content pages
      '/deep-dives': '/blog',
      '/quick-reads': '/blog',
      '/analysis-pages': '/resources',
      '/industry-case-studies': '/case-studies',

      // Template bugs
      '/competitors/${comp.slug}': '/competitors',
      '/embed/': '/',
      '/blog-category/': '/blog',
      '/watch?v': '/',

      // Old solution pages
      '/solutions/marketingsolution': '/solutions/marketing',
      '/marketingsolution': '/solutions/marketing',

      // Other
      '/kpi-library': '/resources',
      '/blog/rtest': '/blog',
      '/static-html-test': '/',
      '/reset-password': 'https://app.scoopanalytics.com/reset-password'
    };

    Object.entries(mainSiteRedirects).forEach(([oldPath, newPath]) => {
      this.redirects.push({
        oldUrl: oldPath,
        newUrl: newPath,
        type: '301',
        source: 'main-site',
        reason: 'Old page removed or renamed'
      });
    });

    console.log(`✅ Generated ${this.redirects.length} main site redirects`);

    // Docs redirects (branches → docs)
    const docsBranchPages = [
      'email-automated-imports',
      'scoop-process-mining',
      'live-query',
      'grouped-reports',
      'visualizing-charts-and-tables',
      'recipes-collaboration-guide',
      'visualizations-reporting-guide',
      'reprocessing-data',
      'canvases-recipes-deep-dive',
      'enterprise-slack-sharing',
      'meet-your-ai-data-analyst',
      'machine-learning-analytics',
      'predictive-relationships',
      'grouppopulation-comparisons',
      'automated-analysis',
      'scoop-for-slack',
      'dataset-queries',
      'best-practices-in-selectingcreating-source-reports',
      'asana',
      'bulk-data-loading',
      'how-to-create-a-presentation',
      'periodtime-range-comparisons',
      'what-is-scoop',
      'process-analysis',
      'blending-two-datasets',
      'understanding-scoop-ai',
      'using-scoop-in-channels',
      'woocommerce',
      'connect-your-data',
      'bring-your-own-key-byok',
      'automatically-filling-out-a-presentation-table',
      'google-analytics'
    ];

    docsBranchPages.forEach(page => {
      this.redirects.push({
        oldUrl: `https://docs.scoopanalytics.com/branches/2.1/guides/${page}`,
        newUrl: `https://docs.scoopanalytics.com/docs/${page}`,
        type: '301',
        source: 'docs',
        reason: 'Branch URL → current docs'
      });
    });

    console.log(`✅ Added ${docsBranchPages.length} docs branch redirects`);

    // Database docs consolidation
    const dbTypes = [
      'clickhouse', 'greenplum', 'ibm-db2', 'vertica', 'bigquery',
      'mysql', 'teradata', 'redshift', 'postgresql', 'oracle',
      'sqlserver', 'snowflake', 'mariadb'
    ];

    dbTypes.forEach(db => {
      this.redirects.push({
        oldUrl: `https://docs.scoopanalytics.com/docs/databases/${db}`,
        newUrl: `https://docs.scoopanalytics.com/databases/${db}`,
        type: '301',
        source: 'docs',
        reason: 'Database docs consolidation'
      });
    });

    console.log(`✅ Added ${dbTypes.length} database docs redirects`);

    // Docs cleanup redirects
    const docsCleanup = {
      'https://docs.scoopanalytics.com/docs/docs': 'https://docs.scoopanalytics.com/docs',
      'https://docs.scoopanalytics.com/docs/index': 'https://docs.scoopanalytics.com/docs',
      'https://docs.scoopanalytics.com/docs/concepts': 'https://docs.scoopanalytics.com/docs',
      'https://docs.scoopanalytics.com/databases/live-query': 'https://docs.scoopanalytics.com/docs/live-query',
      'https://docs.scoopanalytics.com/databases/sql-server': 'https://docs.scoopanalytics.com/databases/sqlserver',
      'https://docs.scoopanalytics.com/databases': 'https://docs.scoopanalytics.com/docs/databases'
    };

    Object.entries(docsCleanup).forEach(([oldUrl, newUrl]) => {
      this.redirects.push({
        oldUrl,
        newUrl,
        type: '301',
        source: 'docs',
        reason: 'Docs cleanup'
      });
    });

    console.log(`✅ Added ${Object.keys(docsCleanup).length} docs cleanup redirects`);

    console.log(`\n📊 Total redirects: ${this.redirects.length}\n`);
  }

  /**
   * Load existing redirects from CSV
   */
  loadExistingRedirects() {
    const existingFile = path.join(__dirname, 'data', 'scoop-webflow-303-redirects.csv');

    if (!fs.existsSync(existingFile)) {
      console.log('⚠️  No existing redirects file found');
      return;
    }

    const content = fs.readFileSync(existingFile, 'utf8');
    const lines = content.trim().split('\n');

    for (let i = 1; i < lines.length; i++) {
      const [oldUrl, newUrl] = lines[i].split(',');
      if (oldUrl && newUrl) {
        this.existingRedirects.push({
          oldUrl: oldUrl.trim(),
          newUrl: newUrl.trim()
        });
      }
    }

    console.log(`✅ Loaded ${this.existingRedirects.length} existing redirects\n`);
  }

  /**
   * Validate redirects (check for conflicts and chains)
   */
  validate() {
    console.log('🔍 Validating redirects...\n');

    const issues = [];

    // Check for duplicate old URLs
    const oldUrls = new Map();
    this.redirects.forEach((redirect, index) => {
      if (oldUrls.has(redirect.oldUrl)) {
        issues.push({
          type: 'Duplicate',
          message: `Duplicate old URL: ${redirect.oldUrl}`,
          indices: [oldUrls.get(redirect.oldUrl), index]
        });
      } else {
        oldUrls.set(redirect.oldUrl, index);
      }
    });

    // Check for redirect chains (A → B → C)
    const newUrlMap = new Map();
    this.redirects.forEach(redirect => {
      newUrlMap.set(redirect.newUrl, redirect);
    });

    this.redirects.forEach(redirect => {
      if (newUrlMap.has(redirect.oldUrl)) {
        issues.push({
          type: 'Chain',
          message: `Redirect chain detected: ${redirect.oldUrl} → ${redirect.newUrl}`,
          chain: [redirect.oldUrl, redirect.newUrl, newUrlMap.get(redirect.oldUrl).newUrl]
        });
      }
    });

    // Check for self-redirects
    this.redirects.forEach(redirect => {
      if (redirect.oldUrl === redirect.newUrl) {
        issues.push({
          type: 'Self-redirect',
          message: `Self-redirect detected: ${redirect.oldUrl}`
        });
      }
    });

    // Check against existing redirects
    this.existingRedirects.forEach(existing => {
      const match = this.redirects.find(r => r.oldUrl === existing.oldUrl);
      if (match && match.newUrl !== existing.newUrl) {
        issues.push({
          type: 'Conflict',
          message: `Conflict with existing redirect: ${existing.oldUrl}`,
          existing: existing.newUrl,
          new: match.newUrl
        });
      }
    });

    if (issues.length === 0) {
      console.log('✅ All redirects are valid!\n');
    } else {
      console.log(`⚠️  Found ${issues.length} validation issues:\n`);
      issues.forEach(issue => {
        console.log(`  ${issue.type}: ${issue.message}`);
        if (issue.chain) {
          console.log(`    → Should be: ${issue.chain[0]} → ${issue.chain[2]}`);
        }
        console.log('');
      });
    }

    return issues;
  }

  /**
   * Export redirects to Webflow CSV format
   */
  exportToWebflowCSV() {
    console.log('📤 Exporting redirects to Webflow CSV format\n');

    const outputDir = path.join(__dirname, 'data', 'fixes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Webflow format: /old-url, /new-url (no headers, just comma-separated)
    let csv = '';

    this.redirects.forEach(redirect => {
      const oldPath = redirect.oldUrl.replace('https://www.scoopanalytics.com', '')
                                     .replace('https://docs.scoopanalytics.com', '');
      const newPath = redirect.newUrl.replace('https://www.scoopanalytics.com', '')
                                     .replace('https://docs.scoopanalytics.com', '');

      // Only export main site redirects (Webflow can't handle docs redirects)
      if (redirect.source === 'main-site') {
        csv += `${oldPath}, ${newPath}\n`;
      }
    });

    const csvPath = path.join(outputDir, 'webflow-redirects.csv');
    fs.writeFileSync(csvPath, csv);

    console.log(`✅ Webflow redirects exported: ${csvPath}`);
    console.log(`   Total redirects: ${csv.split('\n').filter(l => l.trim()).length}`);
    console.log('\n📋 Next Steps:');
    console.log('   1. Go to Webflow Project Settings → Hosting → 301 Redirects');
    console.log('   2. Click "Import redirects"');
    console.log(`   3. Upload: ${csvPath}`);
    console.log('   4. Review and publish\n');

    // Also create a full list with metadata for reference
    const fullPath = path.join(outputDir, 'all-redirects-with-metadata.json');
    fs.writeFileSync(fullPath, JSON.stringify(this.redirects, null, 2));
    console.log(`📄 Full redirect list with metadata: ${fullPath}\n`);
  }

  /**
   * Preview redirects in a readable format
   */
  preview() {
    console.log('👀 Redirect Preview\n');
    console.log('─'.repeat(80));

    const bySource = {};
    this.redirects.forEach(redirect => {
      if (!bySource[redirect.source]) {
        bySource[redirect.source] = [];
      }
      bySource[redirect.source].push(redirect);
    });

    Object.entries(bySource).forEach(([source, redirects]) => {
      console.log(`\n${source.toUpperCase()} (${redirects.length} redirects):\n`);

      redirects.slice(0, 10).forEach(redirect => {
        console.log(`  ${redirect.oldUrl}`);
        console.log(`  → ${redirect.newUrl}`);
        console.log(`    ${redirect.reason}`);
        console.log('');
      });

      if (redirects.length > 10) {
        console.log(`  ... and ${redirects.length - 10} more\n`);
      }
    });

    console.log('─'.repeat(80));
    console.log(`\nTotal: ${this.redirects.length} redirects\n`);
  }

  /**
   * Generate instructions for docs platform
   */
  generateDocsInstructions() {
    const docsRedirects = this.redirects.filter(r => r.source === 'docs');

    console.log('\n📚 Docs Platform Redirects\n');
    console.log('If you're using:');
    console.log('\n1. **GitBook:**');
    console.log('   Add to .gitbook.yaml:');
    console.log('   ```yaml');
    console.log('   redirects:');
    docsRedirects.slice(0, 3).forEach(r => {
      const oldPath = r.oldUrl.replace('https://docs.scoopanalytics.com', '');
      const newPath = r.newUrl.replace('https://docs.scoopanalytics.com', '');
      console.log(`     ${oldPath}: ${newPath}`);
    });
    console.log('   ```');

    console.log('\n2. **Readme.io:**');
    console.log('   Use their redirect API or dashboard');

    console.log('\n3. **Custom docs:**');
    console.log('   Add nginx/apache rewrite rules or use Cloudflare redirects');

    console.log(`\n📄 Full docs redirects list: data/fixes/all-redirects-with-metadata.json\n`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new WebflowRedirectManager();

  switch (command) {
    case 'generate':
      manager.generateFromPlan();
      break;

    case 'validate':
      manager.generateFromPlan();
      manager.loadExistingRedirects();
      manager.validate();
      break;

    case 'export':
      manager.generateFromPlan();
      manager.loadExistingRedirects();
      const issues = manager.validate();
      if (issues.length === 0 || confirm('Export despite validation issues?')) {
        manager.exportToWebflowCSV();
        manager.generateDocsInstructions();
      }
      break;

    case 'preview':
      manager.generateFromPlan();
      manager.preview();
      break;

    default:
      console.log('Webflow Redirect Manager\n');
      console.log('Manage 301 redirects to fix 404 errors\n');
      console.log('Usage:');
      console.log('  node webflow-redirect-manager.js generate    # Generate redirect list');
      console.log('  node webflow-redirect-manager.js validate    # Check for issues');
      console.log('  node webflow-redirect-manager.js export      # Export to Webflow CSV');
      console.log('  node webflow-redirect-manager.js preview     # Preview redirects');
      console.log('\nExamples:');
      console.log('  node webflow-redirect-manager.js generate');
      console.log('  node webflow-redirect-manager.js export\n');
      process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = WebflowRedirectManager;
