#!/usr/bin/env node

/**
 * Unified SEO Dashboard
 *
 * Combines data from:
 * - SEMrush CSV exports (Site Audit)
 * - Google Search Console API
 * - Webflow CMS
 *
 * Generates a comprehensive SEO health dashboard with:
 * - Overall health score
 * - Priority issues
 * - Traffic trends
 * - Top performing/underperforming pages
 * - Recommended actions
 *
 * Usage:
 *   node seo-dashboard.js generate
 *   node seo-dashboard.js html
 *   node seo-dashboard.js track
 */

const fs = require('fs');
const path = require('path');
const SEMrushCSVProcessor = require('./semrush-csv-processor');

class SEODashboard {
  constructor() {
    this.data = {
      semrush: null,
      gsc: null,
      webflow: null,
      score: 0,
      issues: [],
      opportunities: [],
      trends: []
    };
  }

  /**
   * Load all data sources
   */
  async loadAllData() {
    console.log('📊 Loading SEO data from all sources...\n');

    // Load SEMrush CSV data
    const semrushProcessor = new SEMrushCSVProcessor('./data');
    semrushProcessor.loadAllData();
    this.data.semrush = semrushProcessor.issues;

    // Try to load GSC data (if available)
    try {
      const gscPerformancePath = path.join(__dirname, 'data', 'gsc', 'performance-30days.csv');
      const gscQueriesPath = path.join(__dirname, 'data', 'gsc', 'top-queries-30days.csv');

      if (fs.existsSync(gscPerformancePath)) {
        this.data.gsc = {
          performance: this.parseCSV(gscPerformancePath),
          queries: fs.existsSync(gscQueriesPath) ? this.parseCSV(gscQueriesPath) : []
        };
        console.log('✅ Loaded Google Search Console data');
      } else {
        console.log('⚠️  No GSC data found. Run: node google-search-console.js export');
      }
    } catch (error) {
      console.log('⚠️  Could not load GSC data:', error.message);
    }

    console.log('');
  }

  /**
   * Calculate overall SEO health score (0-100)
   */
  calculateHealthScore() {
    let score = 100;
    const issues = this.data.semrush;

    // Deduct points for issues
    score -= Math.min(issues._404Errors.length * 0.2, 20); // 404s: up to -20 points
    score -= Math.min(issues.duplicateContent.length * 0.1, 15); // Duplicate content: up to -15
    score -= Math.min(issues.structuredDataErrors.length * 0.05, 10); // Structured data: up to -10
    score -= Math.min(issues.slowLoadingSpeed.length * 0.5, 10); // Slow pages: up to -10
    score -= Math.min(issues.duplicateMetaDescriptions.length * 0.5, 5); // Meta descriptions: up to -5
    score -= Math.min(issues.uncompressedFiles.length * 0.01, 10); // Uncompressed files: up to -10
    score -= Math.min(issues.singleInternalLink.length * 0.1, 10); // Single links: up to -10
    score -= Math.min(issues.nonDescriptiveAnchors.length * 0.01, 10); // Anchors: up to -10

    this.data.score = Math.max(0, Math.round(score));
    return this.data.score;
  }

  /**
   * Identify priority issues
   */
  identifyPriorityIssues() {
    const issues = [];

    // Critical: 404 errors
    if (this.data.semrush._404Errors.length > 0) {
      issues.push({
        priority: 'Critical',
        type: '404 Errors',
        count: this.data.semrush._404Errors.length,
        impact: 'High',
        action: 'Implement redirects',
        estimatedTrafficImpact: '+15-20%'
      });
    }

    // High: Duplicate content
    if (this.data.semrush.duplicateContent.length > 20) {
      issues.push({
        priority: 'High',
        type: 'Duplicate Content',
        count: this.data.semrush.duplicateContent.length,
        impact: 'High',
        action: 'Add canonical tags',
        estimatedTrafficImpact: '+10%'
      });
    }

    // High: Structured data errors
    if (this.data.semrush.structuredDataErrors.length > 0) {
      issues.push({
        priority: 'High',
        type: 'Structured Data Errors',
        count: this.data.semrush.structuredDataErrors.length,
        impact: 'High',
        action: 'Fix schema markup',
        estimatedTrafficImpact: 'Rich snippets eligibility'
      });
    }

    // Medium: Slow loading
    if (this.data.semrush.slowLoadingSpeed.length > 0) {
      issues.push({
        priority: 'Medium',
        type: 'Slow Loading Speed',
        count: this.data.semrush.slowLoadingSpeed.length,
        impact: 'Medium',
        action: 'Enable compression & optimize',
        estimatedTrafficImpact: '+5-10%'
      });
    }

    // Medium: Duplicate meta descriptions
    if (this.data.semrush.duplicateMetaDescriptions.length > 0) {
      issues.push({
        priority: 'Medium',
        type: 'Duplicate Meta Descriptions',
        count: this.data.semrush.duplicateMetaDescriptions.length,
        impact: 'Medium',
        action: 'Write unique descriptions',
        estimatedTrafficImpact: '+2-5% CTR'
      });
    }

    this.data.issues = issues;
    return issues;
  }

  /**
   * Identify growth opportunities
   */
  identifyOpportunities() {
    const opportunities = [];

    // Opportunity 1: Content gaps (from your strategy)
    opportunities.push({
      type: 'Content Gap',
      title: 'Create Alternatives Pages',
      description: 'Target high-volume competitor comparison keywords',
      keywords: ['Tableau alternatives', 'Power BI alternatives', 'Looker alternatives'],
      estimatedVolume: '5,000+ monthly searches',
      difficulty: 'Medium',
      estimatedImpact: '+25% organic traffic',
      action: 'Implement programmatic SEO strategy from /strategies/programmatic-seo'
    });

    // Opportunity 2: Integration pages
    opportunities.push({
      type: 'Content Expansion',
      title: 'Build Integration Pages',
      description: 'Target long-tail integration keywords',
      keywords: ['HubSpot Google Analytics integration', 'Salesforce HubSpot integration'],
      estimatedVolume: '10,000+ monthly searches',
      difficulty: 'Low',
      estimatedImpact: '+30% organic traffic',
      action: 'Create 100+ integration pages (programmatic)'
    });

    // Opportunity 3: Featured snippets
    if (this.data.gsc && this.data.gsc.queries.length > 0) {
      const queriesWithGoodPosition = this.data.gsc.queries.filter(q =>
        q.position >= 2 && q.position <= 5
      );

      if (queriesWithGoodPosition.length > 0) {
        opportunities.push({
          type: 'Featured Snippets',
          title: 'Target Featured Snippets',
          description: 'Optimize for queries ranking #2-5',
          keywords: queriesWithGoodPosition.slice(0, 5).map(q => q.keys[0]),
          estimatedVolume: 'Varies',
          difficulty: 'Low',
          estimatedImpact: '+40% CTR on targeted queries',
          action: 'Add structured data and improve answer formatting'
        });
      }
    }

    // Opportunity 4: Low-hanging fruit (pages with high impressions, low CTR)
    if (this.data.gsc && this.data.gsc.queries.length > 0) {
      const lowCTRHighImpressions = this.data.gsc.queries.filter(q =>
        q.impressions > 100 && q.ctr < 0.02
      );

      if (lowCTRHighImpressions.length > 0) {
        opportunities.push({
          type: 'CTR Optimization',
          title: 'Improve Titles & Meta Descriptions',
          description: 'Pages with high impressions but low CTR',
          keywords: lowCTRHighImpressions.slice(0, 5).map(q => q.keys[0]),
          estimatedVolume: `${lowCTRHighImpressions.reduce((sum, q) => sum + q.impressions, 0)} impressions/month`,
          difficulty: 'Low',
          estimatedImpact: '+50-100% clicks from existing impressions',
          action: 'Rewrite titles and meta descriptions with strong CTAs'
        });
      }
    }

    this.data.opportunities = opportunities;
    return opportunities;
  }

  /**
   * Parse CSV helper
   */
  parseCSV(filePath) {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = fields[index] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  /**
   * Generate dashboard report
   */
  generateReport() {
    console.log('═'.repeat(70));
    console.log('                    🚀 SEO HEALTH DASHBOARD');
    console.log('═'.repeat(70));
    console.log('\n');

    // Health Score
    const score = this.calculateHealthScore();
    const scoreEmoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : score >= 40 ? '🟠' : '🔴';
    console.log(`${scoreEmoji} Overall SEO Health Score: ${score}/100`);
    console.log('');

    // Priority Issues
    const issues = this.identifyPriorityIssues();
    console.log('🔴 Priority Issues to Fix:\n');
    issues.forEach((issue, i) => {
      const priorityEmoji = issue.priority === 'Critical' ? '🔴' :
                           issue.priority === 'High' ? '🟠' :
                           issue.priority === 'Medium' ? '🟡' : '🟢';

      console.log(`${i + 1}. ${priorityEmoji} ${issue.type} (${issue.count} issues)`);
      console.log(`   Priority: ${issue.priority} | Impact: ${issue.impact}`);
      console.log(`   Action: ${issue.action}`);
      console.log(`   Estimated Impact: ${issue.estimatedTrafficImpact}`);
      console.log('');
    });

    // Growth Opportunities
    const opportunities = this.identifyOpportunities();
    console.log('💡 Growth Opportunities:\n');
    opportunities.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.title} (${opp.type})`);
      console.log(`   ${opp.description}`);
      console.log(`   Difficulty: ${opp.difficulty} | Est. Impact: ${opp.estimatedImpact}`);
      console.log(`   Action: ${opp.action}`);
      console.log('');
    });

    // GSC Performance Summary
    if (this.data.gsc && this.data.gsc.performance.length > 0) {
      console.log('📊 Search Performance (Last 30 Days):\n');

      let totalClicks = 0;
      let totalImpressions = 0;

      this.data.gsc.performance.forEach(row => {
        totalClicks += parseInt(row.clicks || 0);
        totalImpressions += parseInt(row.impressions || 0);
      });

      const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

      console.log(`   Clicks:       ${totalClicks.toLocaleString()}`);
      console.log(`   Impressions:  ${totalImpressions.toLocaleString()}`);
      console.log(`   Avg CTR:      ${avgCTR}%`);
      console.log('');
    }

    // Next Actions
    console.log('✅ Recommended Next Actions:\n');
    console.log('   1. Fix 404 errors (use: node webflow-redirect-manager.js)');
    console.log('   2. Add canonical tags to blog pagination');
    console.log('   3. Fix structured data errors');
    console.log('   4. Enable Webflow compression settings');
    console.log('   5. Start creating alternatives pages from /strategies/programmatic-seo');
    console.log('');

    console.log('═'.repeat(70));
    console.log(`Generated: ${new Date().toLocaleString()}`);
    console.log('═'.repeat(70));
    console.log('\n');

    // Save report
    const reportData = {
      generatedAt: new Date().toISOString(),
      score: score,
      issues: issues,
      opportunities: opportunities,
      gscSummary: this.data.gsc ? {
        totalClicks: this.data.gsc.performance.reduce((sum, r) => sum + parseInt(r.clicks || 0), 0),
        totalImpressions: this.data.gsc.performance.reduce((sum, r) => sum + parseInt(r.impressions || 0), 0)
      } : null
    };

    const reportPath = path.join(__dirname, 'data', 'reports', `dashboard-${Date.now()}.json`);
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📁 Full report saved: ${reportPath}\n`);
  }

  /**
   * Generate HTML dashboard
   */
  generateHTML() {
    const score = this.calculateHealthScore();
    const issues = this.identifyPriorityIssues();
    const opportunities = this.identifyOpportunities();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Health Dashboard - Scoop Analytics</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f7fa;
            padding: 40px 20px;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 36px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .score-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .score-number {
            font-size: 72px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .score-label { font-size: 18px; color: #666; margin-top: 10px; }
        .section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .section h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .issue-card, .opportunity-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
        }
        .issue-card.critical { border-left-color: #ef4444; }
        .issue-card.high { border-left-color: #f59e0b; }
        .issue-card.medium { border-left-color: #eab308; }
        .issue-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .issue-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: #e5e7eb;
            color: #374151;
        }
        .badge.critical { background: #fee2e2; color: #991b1b; }
        .badge.high { background: #fed7aa; color: #9a3412; }
        .badge.medium { background: #fef3c7; color: #92400e; }
        .action { color: #667eea; font-weight: 500; }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 40px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SEO Health Dashboard</h1>
            <p>Scoop Analytics | Generated ${new Date().toLocaleString()}</p>
        </div>

        <div class="score-card">
            <div class="score-number">${score}</div>
            <div class="score-label">Overall SEO Health Score</div>
        </div>

        <div class="section">
            <h2>🔴 Priority Issues</h2>
            ${issues.map(issue => `
                <div class="issue-card ${issue.priority.toLowerCase()}">
                    <div class="issue-title">${issue.type}</div>
                    <div class="issue-meta">
                        <span><span class="badge ${issue.priority.toLowerCase()}">${issue.priority}</span></span>
                        <span>${issue.count} issues</span>
                        <span>Impact: ${issue.impact}</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <strong>Action:</strong> <span class="action">${issue.action}</span>
                    </div>
                    <div>
                        <strong>Est. Impact:</strong> ${issue.estimatedTrafficImpact}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>💡 Growth Opportunities</h2>
            ${opportunities.map(opp => `
                <div class="opportunity-card">
                    <div class="issue-title">${opp.title}</div>
                    <div style="margin: 10px 0; color: #666;">${opp.description}</div>
                    <div class="issue-meta">
                        <span><span class="badge">${opp.type}</span></span>
                        <span>Difficulty: ${opp.difficulty}</span>
                        <span>Est. Impact: ${opp.estimatedImpact}</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Action:</strong> <span class="action">${opp.action}</span>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>✅ Next Actions</h2>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>Fix 404 errors (use: <code>node webflow-redirect-manager.js</code>)</li>
                <li>Add canonical tags to blog pagination</li>
                <li>Fix structured data errors</li>
                <li>Enable Webflow compression settings</li>
                <li>Start creating alternatives pages from <code>/strategies/programmatic-seo</code></li>
            </ol>
        </div>

        <div class="footer">
            <p>Generated by SEO Dashboard | Last updated: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;

    const htmlPath = path.join(__dirname, 'seo-dashboard.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ HTML dashboard generated: ${htmlPath}`);
    console.log(`   Open in browser: file://${htmlPath}\n`);
  }

  /**
   * Track progress over time
   */
  async track() {
    const trackingFile = path.join(__dirname, 'data', 'reports', 'tracking.json');
    let tracking = { history: [] };

    if (fs.existsSync(trackingFile)) {
      tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
    }

    const score = this.calculateHealthScore();
    const issues = this.identifyPriorityIssues();

    tracking.history.push({
      date: new Date().toISOString(),
      score: score,
      totalIssues: issues.reduce((sum, i) => sum + i.count, 0),
      criticalIssues: issues.filter(i => i.priority === 'Critical').reduce((sum, i) => sum + i.count, 0)
    });

    fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
    console.log('📈 Progress tracked!\n');

    // Show trend
    if (tracking.history.length > 1) {
      const prev = tracking.history[tracking.history.length - 2];
      const current = tracking.history[tracking.history.length - 1];

      const scoreDiff = current.score - prev.score;
      const issuesDiff = current.totalIssues - prev.totalIssues;

      console.log('Trend:');
      console.log(`  Score: ${current.score} (${scoreDiff >= 0 ? '+' : ''}${scoreDiff})`);
      console.log(`  Issues: ${current.totalIssues} (${issuesDiff >= 0 ? '+' : ''}${issuesDiff})`);
      console.log('');
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const dashboard = new SEODashboard();
  await dashboard.loadAllData();

  switch (command) {
    case 'generate':
      dashboard.generateReport();
      break;

    case 'html':
      dashboard.generateHTML();
      break;

    case 'track':
      await dashboard.track();
      break;

    default:
      console.log('Unified SEO Dashboard\n');
      console.log('Usage:');
      console.log('  node seo-dashboard.js generate    # Generate text report');
      console.log('  node seo-dashboard.js html        # Generate HTML dashboard');
      console.log('  node seo-dashboard.js track       # Track progress over time');
      console.log('\nExamples:');
      console.log('  node seo-dashboard.js generate');
      console.log('  node seo-dashboard.js html\n');
      process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = SEODashboard;
