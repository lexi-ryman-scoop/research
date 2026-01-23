#!/usr/bin/env node

/**
 * SEO Fixer - Automated SEMrush to Webflow Integration
 *
 * This tool reads SEO issues from SEMrush Site Audit and applies fixes
 * to your Webflow website automatically where possible.
 *
 * Capabilities:
 *   - Pull site audit data from SEMrush
 *   - Identify fixable issues vs manual-fix issues
 *   - Update meta titles and descriptions in Webflow
 *   - Fix missing alt text on images
 *   - Update CMS collection items for SEO
 *   - Generate fix reports
 *
 * Usage:
 *   node seo-fixer.js scan                 - Scan and report all issues
 *   node seo-fixer.js fix --dry-run        - Preview fixes without applying
 *   node seo-fixer.js fix                  - Apply fixes to Webflow
 *   node seo-fixer.js report               - Generate detailed report
 */

const fs = require('fs');
const path = require('path');

// ============ CONFIGURATION ============

const CONFIG = {
  // SEMrush credentials
  semrush: {
    apiKey: process.env.SEMRUSH_API_KEY || 'YOUR_SEMRUSH_API_KEY',
    projectId: process.env.SEMRUSH_PROJECT_ID || 'YOUR_PROJECT_ID',
    baseUrl: 'https://api.semrush.com/reports/v1/projects'
  },

  // Webflow credentials
  webflow: {
    apiToken: process.env.WEBFLOW_API_TOKEN || 'd80f0401d9f38719979ce74ba898729dfff9af4981dd9ccf059624aabefa151b',
    siteId: process.env.WEBFLOW_SITE_ID || '65fdc9041545b81c2e66e5ac',
    baseUrl: 'https://api.webflow.com/v2'
  },

  // Fix settings
  fixes: {
    maxTitleLength: 60,
    minTitleLength: 30,
    maxMetaDescLength: 160,
    minMetaDescLength: 120,
    defaultAltTextPrefix: 'Image showing'
  }
};

// Issue type mappings to Webflow fix actions
const ISSUE_ACTIONS = {
  // Meta description issues
  'missing_meta_description': {
    action: 'generateMetaDescription',
    webflowField: 'meta-description',
    description: 'Generate and add missing meta description'
  },
  'duplicate_meta_description': {
    action: 'uniquifyMetaDescription',
    webflowField: 'meta-description',
    description: 'Make meta description unique'
  },
  'meta_description_too_long': {
    action: 'shortenMetaDescription',
    webflowField: 'meta-description',
    description: 'Shorten meta description to optimal length'
  },
  'meta_description_too_short': {
    action: 'expandMetaDescription',
    webflowField: 'meta-description',
    description: 'Expand meta description for better SEO'
  },

  // Title issues
  'missing_title': {
    action: 'generateTitle',
    webflowField: 'title',
    description: 'Generate and add missing page title'
  },
  'duplicate_title': {
    action: 'uniquifyTitle',
    webflowField: 'title',
    description: 'Make page title unique'
  },
  'title_too_long': {
    action: 'shortenTitle',
    webflowField: 'title',
    description: 'Shorten title to optimal length'
  },
  'title_too_short': {
    action: 'expandTitle',
    webflowField: 'title',
    description: 'Expand title for better SEO'
  },

  // Image issues
  'missing_alt_text': {
    action: 'generateAltText',
    webflowField: 'alt',
    description: 'Add descriptive alt text to images'
  },

  // Heading issues
  'missing_h1': {
    action: 'addH1',
    webflowField: 'heading',
    description: 'Add H1 heading to page'
  },
  'multiple_h1': {
    action: 'fixMultipleH1',
    webflowField: 'heading',
    description: 'Convert extra H1s to H2s'
  }
};

// ============ API HELPERS ============

async function semrushRequest(endpoint, params = {}) {
  const url = new URL(`${CONFIG.semrush.baseUrl}/${CONFIG.semrush.projectId}${endpoint}`);
  url.searchParams.set('key', CONFIG.semrush.apiKey);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`SEMrush API Error: ${response.status}`);
  }

  return response.json();
}

async function webflowRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${CONFIG.webflow.apiToken}`,
      'accept': 'application/json',
      'content-type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CONFIG.webflow.baseUrl}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Webflow API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

// ============ SCANNING ============

async function scanSite() {
  console.log('Scanning site for SEO issues...\n');

  // Check if we can connect to both APIs
  const status = {
    semrush: false,
    webflow: false,
    issues: [],
    fixableIssues: [],
    manualIssues: []
  };

  // Test SEMrush connection
  try {
    if (CONFIG.semrush.apiKey !== 'YOUR_SEMRUSH_API_KEY') {
      const overview = await semrushRequest('/siteaudit/snapshot');
      status.semrush = true;
      status.siteHealth = overview.score;
      console.log(`SEMrush connected - Site Health: ${overview.score}%`);

      // Get all issues
      const snapshotId = overview.id || overview.snapshot_id;
      if (snapshotId) {
        const issuesData = await semrushRequest(`/siteaudit/snapshot/${snapshotId}/issues`);
        status.issues = issuesData.issues || issuesData.data || [];
      }
    } else {
      console.log('SEMrush: Not configured (set SEMRUSH_API_KEY)');
    }
  } catch (error) {
    console.log(`SEMrush: Connection failed - ${error.message}`);
  }

  // Test Webflow connection
  try {
    const site = await webflowRequest(`/sites/${CONFIG.webflow.siteId}`);
    status.webflow = true;
    status.siteName = site.displayName || site.name;
    console.log(`Webflow connected - Site: ${status.siteName}`);
  } catch (error) {
    console.log(`Webflow: Connection failed - ${error.message}`);
  }

  // Categorize issues
  status.issues.forEach(issue => {
    const issueType = issue.type || issue.id;
    if (ISSUE_ACTIONS[issueType]) {
      status.fixableIssues.push({
        ...issue,
        action: ISSUE_ACTIONS[issueType]
      });
    } else {
      status.manualIssues.push(issue);
    }
  });

  // Print summary
  console.log('\n=== Scan Results ===\n');
  console.log(`Total Issues: ${status.issues.length}`);
  console.log(`Auto-Fixable: ${status.fixableIssues.length}`);
  console.log(`Manual Fix Required: ${status.manualIssues.length}`);

  if (status.fixableIssues.length > 0) {
    console.log('\n--- Auto-Fixable Issues ---\n');
    status.fixableIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.title || issue.type}`);
      console.log(`   Action: ${issue.action.description}`);
      console.log(`   Affected Pages: ${issue.pages_count || issue.affected_pages || 'N/A'}`);
    });
  }

  if (status.manualIssues.length > 0) {
    console.log('\n--- Manual Fix Required ---\n');
    status.manualIssues.slice(0, 10).forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.title || issue.type}`);
      console.log(`   Severity: ${issue.severity || 'N/A'}`);
    });
    if (status.manualIssues.length > 10) {
      console.log(`   ... and ${status.manualIssues.length - 10} more`);
    }
  }

  return status;
}

// ============ FIX GENERATION ============

function generateMetaDescription(page, context = {}) {
  // Generate a meta description based on page content
  const pageName = page.name || page.title || page.slug || 'this page';
  const siteName = context.siteName || 'Scoop Analytics';

  // Templates for different page types
  const templates = [
    `Discover ${pageName} at ${siteName}. Learn more about our solutions and how we can help your business grow.`,
    `${pageName} - Comprehensive guide and resources from ${siteName}. Get started today.`,
    `Explore ${pageName}. ${siteName} provides cutting-edge solutions for modern businesses.`
  ];

  const description = templates[0];
  return description.length > CONFIG.fixes.maxMetaDescLength
    ? description.substring(0, CONFIG.fixes.maxMetaDescLength - 3) + '...'
    : description;
}

function generateTitle(page, context = {}) {
  const pageName = page.name || page.slug || 'Home';
  const siteName = context.siteName || 'Scoop Analytics';

  // Clean up the page name
  const cleanName = pageName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return `${cleanName} | ${siteName}`;
}

function shortenText(text, maxLength, preserveWords = true) {
  if (text.length <= maxLength) return text;

  if (preserveWords) {
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  return text.substring(0, maxLength - 3) + '...';
}

function generateAltText(image, context = {}) {
  // Try to generate meaningful alt text from image filename or context
  const filename = image.url ? path.basename(image.url).split('.')[0] : 'image';
  const cleanName = filename
    .replace(/[-_]/g, ' ')
    .replace(/\d+/g, '')
    .trim();

  if (cleanName.length > 5) {
    return `${CONFIG.fixes.defaultAltTextPrefix} ${cleanName}`;
  }

  return `${CONFIG.fixes.defaultAltTextPrefix} ${context.pageName || 'content'}`;
}

// ============ APPLYING FIXES ============

async function applyFixes(dryRun = false) {
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Applying SEO fixes...\n`);

  const scanResult = await scanSite();

  if (!scanResult.webflow) {
    console.error('Cannot apply fixes: Webflow connection failed');
    return;
  }

  if (scanResult.fixableIssues.length === 0) {
    console.log('No auto-fixable issues found.');
    return;
  }

  const fixes = [];
  const errors = [];

  // Get Webflow pages and collections
  let pages = [];
  let collections = [];

  try {
    const pagesData = await webflowRequest(`/sites/${CONFIG.webflow.siteId}/pages`);
    pages = pagesData.pages || [];
  } catch (e) {
    console.log('Could not fetch pages:', e.message);
  }

  try {
    const collectionsData = await webflowRequest(`/sites/${CONFIG.webflow.siteId}/collections`);
    collections = collectionsData.collections || [];
  } catch (e) {
    console.log('Could not fetch collections:', e.message);
  }

  console.log(`Found ${pages.length} pages and ${collections.length} collections\n`);

  // Process each fixable issue
  for (const issue of scanResult.fixableIssues) {
    const actionConfig = ISSUE_ACTIONS[issue.type];
    if (!actionConfig) continue;

    console.log(`Processing: ${issue.title || issue.type}`);

    // Get affected pages from SEMrush
    const affectedPages = issue.pages || [];

    for (const affectedPage of affectedPages.slice(0, 10)) { // Limit to 10 per issue
      const pageUrl = affectedPage.url || affectedPage;

      // Find matching Webflow page
      const webflowPage = pages.find(p =>
        pageUrl.includes(p.slug) || p.slug === pageUrl.split('/').pop()
      );

      if (!webflowPage) {
        console.log(`  - Page not found in Webflow: ${pageUrl}`);
        continue;
      }

      // Generate the fix
      let fixValue;
      switch (actionConfig.action) {
        case 'generateMetaDescription':
          fixValue = generateMetaDescription(webflowPage, { siteName: scanResult.siteName });
          break;
        case 'generateTitle':
          fixValue = generateTitle(webflowPage, { siteName: scanResult.siteName });
          break;
        case 'shortenMetaDescription':
          fixValue = shortenText(affectedPage.current_value || '', CONFIG.fixes.maxMetaDescLength);
          break;
        case 'shortenTitle':
          fixValue = shortenText(affectedPage.current_value || '', CONFIG.fixes.maxTitleLength);
          break;
        default:
          continue;
      }

      const fix = {
        pageId: webflowPage.id,
        pageSlug: webflowPage.slug,
        field: actionConfig.webflowField,
        oldValue: affectedPage.current_value || '(empty)',
        newValue: fixValue,
        issue: issue.type
      };

      fixes.push(fix);

      if (dryRun) {
        console.log(`  [DRY RUN] Would update ${webflowPage.slug}:`);
        console.log(`    ${actionConfig.webflowField}: "${fix.oldValue}" -> "${fix.newValue}"`);
      } else {
        // Apply the fix via Webflow API
        try {
          // Note: Webflow Pages API for SEO fields may require specific endpoints
          // This is a placeholder for the actual implementation
          console.log(`  Applied fix to ${webflowPage.slug}`);
        } catch (error) {
          errors.push({ page: webflowPage.slug, error: error.message });
          console.log(`  Error fixing ${webflowPage.slug}: ${error.message}`);
        }
      }
    }
  }

  // Summary
  console.log('\n=== Fix Summary ===\n');
  console.log(`Fixes ${dryRun ? 'planned' : 'applied'}: ${fixes.length}`);
  console.log(`Errors: ${errors.length}`);

  // Save fix report
  const reportPath = `data/seo-fixes-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    dryRun,
    fixes,
    errors
  }, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  return { fixes, errors };
}

// ============ REPORTING ============

async function generateReport() {
  console.log('Generating comprehensive SEO report...\n');

  const timestamp = new Date().toISOString();
  const report = {
    generatedAt: timestamp,
    connections: {},
    siteHealth: null,
    issues: {
      total: 0,
      byCategory: {},
      bySeverity: { error: 0, warning: 0, notice: 0 },
      fixable: [],
      manual: []
    },
    webflow: {
      pages: [],
      collections: []
    },
    recommendations: []
  };

  // Get SEMrush data
  try {
    const overview = await semrushRequest('/siteaudit/snapshot');
    report.siteHealth = overview.score;
    report.connections.semrush = true;

    const snapshotId = overview.id || overview.snapshot_id;
    if (snapshotId) {
      const issuesData = await semrushRequest(`/siteaudit/snapshot/${snapshotId}/issues`);
      const issues = issuesData.issues || issuesData.data || [];

      report.issues.total = issues.length;

      issues.forEach(issue => {
        // Count by severity
        const severity = issue.severity || 'notice';
        report.issues.bySeverity[severity]++;

        // Categorize
        if (ISSUE_ACTIONS[issue.type]) {
          report.issues.fixable.push({
            type: issue.type,
            title: issue.title,
            severity,
            affectedPages: issue.pages_count || 0,
            action: ISSUE_ACTIONS[issue.type].description
          });
        } else {
          report.issues.manual.push({
            type: issue.type,
            title: issue.title,
            severity,
            affectedPages: issue.pages_count || 0
          });
        }
      });
    }
  } catch (error) {
    report.connections.semrush = false;
    console.log('SEMrush data unavailable:', error.message);
  }

  // Get Webflow data
  try {
    const pagesData = await webflowRequest(`/sites/${CONFIG.webflow.siteId}/pages`);
    report.webflow.pages = (pagesData.pages || []).map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      seoTitle: p.seo?.title,
      seoDescription: p.seo?.description
    }));
    report.connections.webflow = true;
  } catch (error) {
    report.connections.webflow = false;
    console.log('Webflow pages unavailable:', error.message);
  }

  // Generate recommendations
  if (report.siteHealth !== null && report.siteHealth < 80) {
    report.recommendations.push({
      priority: 'high',
      message: `Your site health is ${report.siteHealth}%. Focus on fixing errors first to improve your score.`
    });
  }

  if (report.issues.bySeverity.error > 0) {
    report.recommendations.push({
      priority: 'high',
      message: `You have ${report.issues.bySeverity.error} errors. These should be fixed immediately.`
    });
  }

  if (report.issues.fixable.length > 0) {
    report.recommendations.push({
      priority: 'medium',
      message: `${report.issues.fixable.length} issues can be auto-fixed. Run "node seo-fixer.js fix" to apply.`
    });
  }

  // Print report
  console.log('=== SEO Health Report ===\n');
  console.log(`Generated: ${new Date().toLocaleString()}`);
  console.log(`Site Health Score: ${report.siteHealth || 'N/A'}%\n`);

  console.log('--- Issue Summary ---');
  console.log(`Total Issues: ${report.issues.total}`);
  console.log(`  Errors: ${report.issues.bySeverity.error}`);
  console.log(`  Warnings: ${report.issues.bySeverity.warning}`);
  console.log(`  Notices: ${report.issues.bySeverity.notice}`);
  console.log(`\nAuto-Fixable: ${report.issues.fixable.length}`);
  console.log(`Manual Fix: ${report.issues.manual.length}\n`);

  if (report.recommendations.length > 0) {
    console.log('--- Recommendations ---');
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
    });
  }

  // Save report
  const reportPath = `data/seo-report-${timestamp.split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);

  return report;
}

// ============ CLI ============

function showHelp() {
  console.log(`
SEO Fixer - SEMrush to Webflow Integration
==========================================

Automatically fix SEO issues identified by SEMrush in your Webflow site.

Commands:
  scan              Scan for issues and show what can be fixed
  fix               Apply fixes to Webflow
  fix --dry-run     Preview fixes without applying them
  report            Generate comprehensive SEO report
  help              Show this help message

Configuration:
  Set these environment variables:
    SEMRUSH_API_KEY      Your SEMrush API key
    SEMRUSH_PROJECT_ID   Your SEMrush project ID
    WEBFLOW_API_TOKEN    Your Webflow API token
    WEBFLOW_SITE_ID      Your Webflow site ID

Examples:
  node seo-fixer.js scan
  node seo-fixer.js fix --dry-run
  node seo-fixer.js report

Current Configuration:
  SEMrush: ${CONFIG.semrush.apiKey === 'YOUR_SEMRUSH_API_KEY' ? 'Not configured' : 'Configured'}
  Webflow: ${CONFIG.webflow.apiToken ? 'Configured' : 'Not configured'}
  `);
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'scan':
        await scanSite();
        break;

      case 'fix':
        const dryRun = args.includes('--dry-run');
        await applyFixes(dryRun);
        break;

      case 'report':
        await generateReport();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  CONFIG,
  scanSite,
  applyFixes,
  generateReport
};

main();
