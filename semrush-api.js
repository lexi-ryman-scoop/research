#!/usr/bin/env node

/**
 * SEMrush Site Audit API Integration
 *
 * This script connects to your SEMrush account to pull site audit data,
 * including errors, warnings, and notices that affect your site health score.
 *
 * Setup:
 *   1. Get your SEMrush API key from: https://www.semrush.com/accounts/profile/subscription-info/api-units
 *   2. Get your Project ID from your SEMrush project URL (e.g., /projects/12345/...)
 *   3. Set environment variables or update the config below
 *
 * Usage:
 *   node semrush-api.js overview              - Get site health overview
 *   node semrush-api.js issues                - Get all issues (errors, warnings, notices)
 *   node semrush-api.js issues --errors       - Get only errors
 *   node semrush-api.js issues --warnings     - Get only warnings
 *   node semrush-api.js export                - Export issues to JSON file
 *   node semrush-api.js history               - View audit history
 */

// Configuration - Set these via environment variables or edit directly
const CONFIG = {
  apiKey: process.env.SEMRUSH_API_KEY || 'YOUR_SEMRUSH_API_KEY',
  projectId: process.env.SEMRUSH_PROJECT_ID || 'YOUR_PROJECT_ID',
  baseUrl: 'https://api.semrush.com/reports/v1/projects'
};

// Common SEO issues that can be fixed programmatically in Webflow
const FIXABLE_ISSUES = {
  // Meta-related issues
  'missing_meta_description': { category: 'meta', severity: 'error', webflowFixable: true },
  'duplicate_meta_description': { category: 'meta', severity: 'warning', webflowFixable: true },
  'meta_description_too_long': { category: 'meta', severity: 'warning', webflowFixable: true },
  'meta_description_too_short': { category: 'meta', severity: 'warning', webflowFixable: true },

  // Title-related issues
  'missing_title': { category: 'title', severity: 'error', webflowFixable: true },
  'duplicate_title': { category: 'title', severity: 'warning', webflowFixable: true },
  'title_too_long': { category: 'title', severity: 'warning', webflowFixable: true },
  'title_too_short': { category: 'title', severity: 'warning', webflowFixable: true },

  // Heading issues
  'missing_h1': { category: 'content', severity: 'warning', webflowFixable: true },
  'multiple_h1': { category: 'content', severity: 'warning', webflowFixable: true },

  // Image issues
  'missing_alt_text': { category: 'images', severity: 'warning', webflowFixable: true },
  'broken_images': { category: 'images', severity: 'error', webflowFixable: true },

  // Link issues
  'broken_internal_links': { category: 'links', severity: 'error', webflowFixable: true },
  'broken_external_links': { category: 'links', severity: 'warning', webflowFixable: false },

  // Technical issues
  'missing_canonical': { category: 'technical', severity: 'warning', webflowFixable: true },
  'noindex_pages': { category: 'technical', severity: 'notice', webflowFixable: true },
  '4xx_errors': { category: 'technical', severity: 'error', webflowFixable: true },
  '5xx_errors': { category: 'technical', severity: 'error', webflowFixable: false },
  'slow_pages': { category: 'performance', severity: 'warning', webflowFixable: false },

  // Structured data
  'missing_structured_data': { category: 'structured_data', severity: 'notice', webflowFixable: true },
  'invalid_structured_data': { category: 'structured_data', severity: 'warning', webflowFixable: true }
};

async function semrushRequest(endpoint, params = {}) {
  const url = new URL(`${CONFIG.baseUrl}/${CONFIG.projectId}${endpoint}`);
  url.searchParams.set('key', CONFIG.apiKey);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SEMrush API Error: ${response.status} - ${text}`);
  }

  return response.json();
}

async function getAuditOverview() {
  console.log('Fetching site audit overview...\n');

  try {
    const data = await semrushRequest('/siteaudit/snapshot');

    console.log('=== Site Audit Overview ===\n');
    console.log(`Site Health Score: ${data.score || 'N/A'}%`);
    console.log(`Total Pages Crawled: ${data.pages_crawled || 'N/A'}`);
    console.log(`Last Audit: ${data.finish_date || 'N/A'}\n`);

    console.log('Issues Summary:');
    console.log(`  Errors: ${data.errors || 0}`);
    console.log(`  Warnings: ${data.warnings || 0}`);
    console.log(`  Notices: ${data.notices || 0}`);
    console.log(`  Total Issues: ${(data.errors || 0) + (data.warnings || 0) + (data.notices || 0)}\n`);

    if (data.checks) {
      console.log('Checks Status:');
      console.log(`  Passed: ${data.checks.passed || 0}`);
      console.log(`  Failed: ${data.checks.failed || 0}`);
    }

    return data;
  } catch (error) {
    if (error.message.includes('API Error')) {
      console.error('\nAPI Error - Please check:');
      console.error('1. Your API key is valid');
      console.error('2. Your project ID is correct');
      console.error('3. You have API units available');
      console.error('\nGet your API key: https://www.semrush.com/accounts/profile/subscription-info/api-units');
    }
    throw error;
  }
}

async function getIssues(filter = 'all') {
  console.log(`Fetching ${filter} issues...\n`);

  // Get the latest snapshot ID first
  const snapshot = await semrushRequest('/siteaudit/snapshot');
  const snapshotId = snapshot.id || snapshot.snapshot_id;

  if (!snapshotId) {
    console.log('No audit snapshot found. Please run a site audit in SEMrush first.');
    return [];
  }

  // Build filter params based on severity
  const params = {};
  if (filter === 'errors') {
    params.filter = 'severity|eq|error';
  } else if (filter === 'warnings') {
    params.filter = 'severity|eq|warning';
  } else if (filter === 'notices') {
    params.filter = 'severity|eq|notice';
  }

  const data = await semrushRequest(`/siteaudit/snapshot/${snapshotId}/issues`, params);

  const issues = data.issues || data.data || [];

  console.log(`=== Site Audit Issues (${filter}) ===\n`);
  console.log(`Found ${issues.length} issues\n`);

  // Group by severity
  const grouped = {
    error: [],
    warning: [],
    notice: []
  };

  issues.forEach(issue => {
    const severity = issue.severity || 'notice';
    if (grouped[severity]) {
      grouped[severity].push(issue);
    }
  });

  // Display grouped issues
  ['error', 'warning', 'notice'].forEach(severity => {
    if (grouped[severity].length > 0) {
      const label = severity.charAt(0).toUpperCase() + severity.slice(1) + 's';
      console.log(`--- ${label} (${grouped[severity].length}) ---\n`);

      grouped[severity].forEach((issue, i) => {
        const fixable = FIXABLE_ISSUES[issue.type]?.webflowFixable ? '[FIXABLE]' : '';
        console.log(`${i + 1}. ${issue.title || issue.name || issue.type} ${fixable}`);
        console.log(`   Type: ${issue.type || 'N/A'}`);
        console.log(`   Affected Pages: ${issue.pages_count || issue.affected_pages || 'N/A'}`);
        if (issue.description) {
          console.log(`   Description: ${issue.description.substring(0, 100)}...`);
        }
        console.log('');
      });
    }
  });

  // Summary of fixable issues
  const fixableCount = issues.filter(i => FIXABLE_ISSUES[i.type]?.webflowFixable).length;
  console.log(`\n=== Summary ===`);
  console.log(`Total Issues: ${issues.length}`);
  console.log(`Webflow-Fixable: ${fixableCount}`);
  console.log(`Manual Fix Required: ${issues.length - fixableCount}`);

  return issues;
}

async function getIssueDetails(issueType) {
  console.log(`Fetching details for issue: ${issueType}...\n`);

  const snapshot = await semrushRequest('/siteaudit/snapshot');
  const snapshotId = snapshot.id || snapshot.snapshot_id;

  const data = await semrushRequest(`/siteaudit/snapshot/${snapshotId}/issue/${issueType}`);

  console.log(`=== Issue Details: ${issueType} ===\n`);
  console.log(`Severity: ${data.severity || 'N/A'}`);
  console.log(`Description: ${data.description || 'N/A'}`);
  console.log(`How to Fix: ${data.how_to_fix || 'N/A'}\n`);

  if (data.pages && data.pages.length > 0) {
    console.log('Affected Pages:');
    data.pages.forEach((page, i) => {
      console.log(`  ${i + 1}. ${page.url}`);
      if (page.details) {
        console.log(`     Details: ${page.details}`);
      }
    });
  }

  return data;
}

async function getAuditHistory() {
  console.log('Fetching audit history...\n');

  const data = await semrushRequest('/siteaudit/history', { limit: 10 });

  console.log('=== Audit History ===\n');

  const audits = data.audits || data.data || [];

  if (audits.length === 0) {
    console.log('No previous audits found.');
    return [];
  }

  audits.forEach((audit, i) => {
    console.log(`${i + 1}. Audit ID: ${audit.id}`);
    console.log(`   Date: ${audit.finish_date || audit.date}`);
    console.log(`   Score: ${audit.score || 'N/A'}%`);
    console.log(`   Pages: ${audit.pages_crawled || 'N/A'}`);
    console.log('');
  });

  return audits;
}

async function exportIssues(filename = null) {
  const timestamp = new Date().toISOString().split('T')[0];
  const outputFile = filename || `data/semrush-issues-${timestamp}.json`;

  console.log('Exporting all issues to JSON...\n');

  const overview = await semrushRequest('/siteaudit/snapshot');
  const snapshotId = overview.id || overview.snapshot_id;

  const issuesData = await semrushRequest(`/siteaudit/snapshot/${snapshotId}/issues`);
  const issues = issuesData.issues || issuesData.data || [];

  // Enrich with fixability info
  const enrichedIssues = issues.map(issue => ({
    ...issue,
    webflowFixable: FIXABLE_ISSUES[issue.type]?.webflowFixable || false,
    category: FIXABLE_ISSUES[issue.type]?.category || 'other'
  }));

  const exportData = {
    exportDate: new Date().toISOString(),
    siteHealthScore: overview.score,
    totalIssues: issues.length,
    summary: {
      errors: enrichedIssues.filter(i => i.severity === 'error').length,
      warnings: enrichedIssues.filter(i => i.severity === 'warning').length,
      notices: enrichedIssues.filter(i => i.severity === 'notice').length,
      webflowFixable: enrichedIssues.filter(i => i.webflowFixable).length
    },
    issues: enrichedIssues
  };

  const fs = require('fs');
  fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));

  console.log(`Exported ${issues.length} issues to ${outputFile}`);
  console.log(`\nSummary:`);
  console.log(`  Errors: ${exportData.summary.errors}`);
  console.log(`  Warnings: ${exportData.summary.warnings}`);
  console.log(`  Notices: ${exportData.summary.notices}`);
  console.log(`  Webflow-Fixable: ${exportData.summary.webflowFixable}`);

  return exportData;
}

// Validate configuration
function validateConfig() {
  if (CONFIG.apiKey === 'YOUR_SEMRUSH_API_KEY') {
    console.log('\n=== SEMrush API Setup Required ===\n');
    console.log('To use this integration, you need to configure your SEMrush API credentials.\n');
    console.log('Option 1: Set environment variables');
    console.log('  export SEMRUSH_API_KEY="your-api-key"');
    console.log('  export SEMRUSH_PROJECT_ID="your-project-id"\n');
    console.log('Option 2: Edit this file and update the CONFIG object\n');
    console.log('Where to find your credentials:');
    console.log('  API Key: https://www.semrush.com/accounts/profile/subscription-info/api-units');
    console.log('  Project ID: Look at your SEMrush project URL (e.g., /projects/12345/...)');
    console.log('\nNote: Site Audit API requires a SEMrush subscription with API access.\n');
    return false;
  }
  return true;
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === 'help' || command === '--help') {
    console.log(`
SEMrush Site Audit API Integration
===================================

Commands:
  overview              Get site health score and summary
  issues                Get all issues (errors, warnings, notices)
  issues --errors       Get only errors
  issues --warnings     Get only warnings
  issues --notices      Get only notices
  issue-details <type>  Get details for a specific issue type
  history               View audit history
  export                Export all issues to JSON

Environment Variables:
  SEMRUSH_API_KEY       Your SEMrush API key
  SEMRUSH_PROJECT_ID    Your SEMrush project ID

Examples:
  node semrush-api.js overview
  node semrush-api.js issues --errors
  node semrush-api.js export
    `);
    return;
  }

  if (!validateConfig()) {
    return;
  }

  try {
    switch (command) {
      case 'overview':
        await getAuditOverview();
        break;

      case 'issues':
        let filter = 'all';
        if (args.includes('--errors')) filter = 'errors';
        else if (args.includes('--warnings')) filter = 'warnings';
        else if (args.includes('--notices')) filter = 'notices';
        await getIssues(filter);
        break;

      case 'issue-details':
        if (!args[0]) {
          console.error('Usage: node semrush-api.js issue-details <issue-type>');
          process.exit(1);
        }
        await getIssueDetails(args[0]);
        break;

      case 'history':
        await getAuditHistory();
        break;

      case 'export':
        await exportIssues(args[0]);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "node semrush-api.js help" for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Export for use as a module
module.exports = {
  CONFIG,
  FIXABLE_ISSUES,
  getAuditOverview,
  getIssues,
  getIssueDetails,
  getAuditHistory,
  exportIssues,
  semrushRequest
};

main();
