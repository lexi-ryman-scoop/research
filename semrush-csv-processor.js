#!/usr/bin/env node

/**
 * SEMrush CSV Data Processor
 *
 * Process downloaded SEMrush CSV exports without needing API access.
 * Works with manual CSV downloads from SEMrush Site Audit.
 *
 * Usage:
 *   node semrush-csv-processor.js analyze [--dir=./data]
 *   node semrush-csv-processor.js summarize
 *   node semrush-csv-processor.js prioritize
 *   node semrush-csv-processor.js export-fixes
 *   node semrush-csv-processor.js report
 */

const fs = require('fs');
const path = require('path');

class SEMrushCSVProcessor {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.issues = {
      duplicateMetaDescriptions: [],
      duplicateContent: [],
      slowLoadingSpeed: [],
      uncompressedFiles: [],
      nonDescriptiveAnchors: [],
      singleInternalLink: [],
      structuredDataErrors: [],
      _404Errors: []
    };
  }

  /**
   * Parse CSV file
   */
  parseCSV(filePath) {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');

    if (lines.length <= 1) {
      return [];
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());

    // Parse rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle quoted fields
      const fields = [];
      let currentField = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());

      // Create object
      const row = {};
      headers.forEach((header, index) => {
        row[header] = fields[index] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  /**
   * Load all SEMrush CSV files from data directory
   */
  loadAllData() {
    console.log(`📂 Loading data from: ${this.dataDir}\n`);

    // Duplicate Meta Descriptions
    const metaDescFile = path.join(this.dataDir, 'scoopanalytics.com_duplicate_meta_description_20260127.csv');
    if (fs.existsSync(metaDescFile)) {
      this.issues.duplicateMetaDescriptions = this.parseCSV(metaDescFile);
      console.log(`✅ Loaded ${this.issues.duplicateMetaDescriptions.length} duplicate meta description issues`);
    }

    // Duplicate Content
    const dupContentFile = path.join(this.dataDir, 'scoopanalytics.com_duplicate_content_20260127.csv');
    if (fs.existsSync(dupContentFile)) {
      this.issues.duplicateContent = this.parseCSV(dupContentFile);
      console.log(`✅ Loaded ${this.issues.duplicateContent.length} duplicate content issues`);
    }

    // Slow Loading Speed
    const slowLoadFile = path.join(this.dataDir, 'scoopanalytics.com_slow_loading_speed_20260127.csv');
    if (fs.existsSync(slowLoadFile)) {
      this.issues.slowLoadingSpeed = this.parseCSV(slowLoadFile);
      console.log(`✅ Loaded ${this.issues.slowLoadingSpeed.length} slow loading speed issues`);
    }

    // Uncompressed Files
    const uncompressedFile = path.join(this.dataDir, 'scoopanalytics.com_uncompressed_javascript_and_css_files_20260127.csv');
    if (fs.existsSync(uncompressedFile)) {
      this.issues.uncompressedFiles = this.parseCSV(uncompressedFile);
      console.log(`✅ Loaded ${this.issues.uncompressedFiles.length} uncompressed file issues`);
    }

    // Non-descriptive Anchors
    const anchorsFile = path.join(this.dataDir, 'scoopanalytics.com_links_with_non-descriptive_anchor_text_20260127.csv');
    if (fs.existsSync(anchorsFile)) {
      this.issues.nonDescriptiveAnchors = this.parseCSV(anchorsFile);
      console.log(`✅ Loaded ${this.issues.nonDescriptiveAnchors.length} non-descriptive anchor issues`);
    }

    // Single Internal Link
    const singleLinkFile = path.join(this.dataDir, 'scoopanalytics.com_pages_with_only_one_internal_link_20260127.csv');
    if (fs.existsSync(singleLinkFile)) {
      this.issues.singleInternalLink = this.parseCSV(singleLinkFile);
      console.log(`✅ Loaded ${this.issues.singleInternalLink.length} single internal link issues`);
    }

    // Structured Data Errors
    const structuredDataFile = path.join(this.dataDir, 'scoopanalytics.com_structured_data_that_contains_markup_errors_20260123.csv');
    if (fs.existsSync(structuredDataFile)) {
      this.issues.structuredDataErrors = this.parseCSV(structuredDataFile);
      console.log(`✅ Loaded ${this.issues.structuredDataErrors.length} structured data errors`);
    }

    // 404 Errors from GSC
    const gsc404File = path.join(this.dataDir, 'gsc', 'gsc-404-export.csv');
    if (fs.existsSync(gsc404File)) {
      this.issues._404Errors = this.parseCSV(gsc404File);
      console.log(`✅ Loaded ${this.issues._404Errors.length} 404 errors from GSC`);
    }

    console.log('');
  }

  /**
   * Summarize all issues
   */
  summarize() {
    console.log('📊 SEO Issues Summary\n');
    console.log('─'.repeat(60));

    const summary = [
      { name: 'Duplicate Meta Descriptions', count: this.issues.duplicateMetaDescriptions.length, severity: 'Medium', fixable: 'Yes' },
      { name: 'Duplicate Content', count: this.issues.duplicateContent.length, severity: 'High', fixable: 'Partial' },
      { name: 'Slow Loading Speed', count: this.issues.slowLoadingSpeed.length, severity: 'High', fixable: 'Yes' },
      { name: 'Uncompressed JS/CSS Files', count: this.issues.uncompressedFiles.length, severity: 'Medium', fixable: 'Yes' },
      { name: 'Non-descriptive Anchor Text', count: this.issues.nonDescriptiveAnchors.length, severity: 'Low', fixable: 'Manual' },
      { name: 'Pages with Single Internal Link', count: this.issues.singleInternalLink.length, severity: 'Medium', fixable: 'Manual' },
      { name: 'Structured Data Errors', count: this.issues.structuredDataErrors.length, severity: 'High', fixable: 'Yes' },
      { name: '404 Errors', count: this.issues._404Errors.length, severity: 'Critical', fixable: 'Yes' }
    ];

    summary.forEach(issue => {
      const severity = this.getSeverityEmoji(issue.severity);
      const fixable = issue.fixable === 'Yes' ? '✅ Auto-fixable' :
                      issue.fixable === 'Partial' ? '⚠️  Partially fixable' :
                      '❌ Manual fix needed';

      console.log(`${severity} ${issue.name.padEnd(35)} ${String(issue.count).padStart(5)} issues`);
      console.log(`   Severity: ${issue.severity.padEnd(10)} ${fixable}`);
      console.log('');
    });

    const totalIssues = summary.reduce((sum, issue) => sum + issue.count, 0);
    console.log('─'.repeat(60));
    console.log(`Total Issues: ${totalIssues}\n`);
  }

  getSeverityEmoji(severity) {
    const emojis = {
      'Critical': '🔴',
      'High': '🟠',
      'Medium': '🟡',
      'Low': '🟢'
    };
    return emojis[severity] || '⚪';
  }

  /**
   * Prioritize issues by impact
   */
  prioritize() {
    console.log('🎯 Priority Fixes (by SEO impact)\n');
    console.log('─'.repeat(70));

    const priorities = [
      {
        priority: 1,
        name: '404 Errors (177 URLs)',
        impact: 'Critical',
        effort: 'Medium',
        description: 'Broken links hurt crawlability and user experience',
        action: 'Implement redirects from 404-redirect-plan.md',
        benefit: '+15-20% organic traffic from recovered pages'
      },
      {
        priority: 2,
        name: 'Duplicate Content (Blog pagination)',
        impact: 'High',
        effort: 'Low',
        description: 'Pagination pages competing with main blog page',
        action: 'Add canonical tags to paginated blog pages',
        benefit: '+10% improvement in blog indexing'
      },
      {
        priority: 3,
        name: 'Structured Data Errors',
        impact: 'High',
        effort: 'Medium',
        description: 'Invalid schema markup prevents rich snippets',
        action: 'Fix JSON-LD schema errors in templates',
        benefit: 'Eligible for rich results (higher CTR)'
      },
      {
        priority: 4,
        name: 'Slow Loading Speed',
        impact: 'High',
        effort: 'Medium',
        description: 'Page speed is a ranking factor and affects user experience',
        action: 'Enable Brotli compression, optimize images',
        benefit: '+5-10% organic traffic, better Core Web Vitals'
      },
      {
        priority: 5,
        name: 'Uncompressed JS/CSS',
        impact: 'Medium',
        effort: 'Low',
        description: 'Large file sizes slow down page load',
        action: 'Enable Webflow compression settings',
        benefit: '30-40% reduction in file sizes'
      },
      {
        priority: 6,
        name: 'Duplicate Meta Descriptions (9 pages)',
        impact: 'Medium',
        effort: 'Low',
        description: 'Duplicate meta descriptions reduce click-through rate',
        action: 'Write unique meta descriptions for each page',
        benefit: '+2-5% improvement in CTR'
      },
      {
        priority: 7,
        name: 'Pages with Single Internal Link',
        impact: 'Medium',
        effort: 'High',
        description: 'Poor internal linking reduces crawlability',
        action: 'Add contextual internal links to content',
        benefit: 'Better page authority distribution'
      },
      {
        priority: 8,
        name: 'Non-descriptive Anchor Text',
        impact: 'Low',
        effort: 'High',
        description: 'Generic anchors like "click here" provide no SEO value',
        action: 'Replace with descriptive keyword-rich anchors',
        benefit: 'Marginal ranking improvement'
      }
    ];

    priorities.forEach(p => {
      console.log(`\n${p.priority}. ${p.name}`);
      console.log(`   Impact: ${p.impact} | Effort: ${p.effort}`);
      console.log(`   ${p.description}`);
      console.log(`   \n   ✓ Action: ${p.action}`);
      console.log(`   📈 Benefit: ${p.benefit}`);
      console.log('   ' + '─'.repeat(65));
    });

    console.log('\n\n💡 Recommended Approach:\n');
    console.log('Week 1: Fix 404 errors (#1) + Add canonical tags (#2)');
    console.log('Week 2: Fix structured data (#3) + Enable compression (#4, #5)');
    console.log('Week 3: Update meta descriptions (#6) + Improve internal linking (#7)');
    console.log('Week 4: Optimize anchor text (#8) + Monitor results\n');
  }

  /**
   * Generate fixes for auto-fixable issues
   */
  exportFixes() {
    console.log('🔧 Generating Auto-fix Scripts\n');

    const fixes = {
      canonicalTags: this.generateCanonicalFixes(),
      metaDescriptions: this.generateMetaDescriptionFixes(),
      redirects: this.generate404Redirects()
    };

    // Save fixes to files
    const outputDir = path.join(this.dataDir, 'fixes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Canonical tags fix
    const canonicalPath = path.join(outputDir, 'canonical-tags.json');
    fs.writeFileSync(canonicalPath, JSON.stringify(fixes.canonicalTags, null, 2));
    console.log(`✅ Canonical tag fixes: ${canonicalPath}`);

    // Meta descriptions fix
    const metaDescPath = path.join(outputDir, 'meta-descriptions.json');
    fs.writeFileSync(metaDescPath, JSON.stringify(fixes.metaDescriptions, null, 2));
    console.log(`✅ Meta description fixes: ${metaDescPath}`);

    // Redirects
    const redirectsPath = path.join(outputDir, '404-redirects.csv');
    let redirectCSV = 'Old URL,New URL,Type\n';
    fixes.redirects.forEach(r => {
      redirectCSV += `${r.oldUrl},${r.newUrl},${r.type}\n`;
    });
    fs.writeFileSync(redirectsPath, redirectCSV);
    console.log(`✅ 404 redirects: ${redirectsPath}`);

    console.log('\n📋 Next Steps:');
    console.log('1. Review generated fixes');
    console.log('2. Use webflow-cms.js to apply fixes to Webflow');
    console.log('3. Upload redirects to Webflow (Settings > Hosting > 301 Redirects)');
    console.log('4. Test changes in staging before publishing\n');
  }

  /**
   * Generate canonical tag fixes for duplicate content
   */
  generateCanonicalFixes() {
    const fixes = [];

    // Fix blog pagination
    this.issues.duplicateContent.forEach(issue => {
      const pageUrl = issue['Page URL'] || issue.URL || '';

      if (pageUrl.includes('?f73e57f1_page=') || pageUrl.includes('?f3548407_page=')) {
        // This is a paginated page
        const baseUrl = pageUrl.split('?')[0];
        fixes.push({
          url: pageUrl,
          canonicalUrl: baseUrl,
          reason: 'Blog pagination - canonical to base page'
        });
      }
    });

    return fixes;
  }

  /**
   * Generate unique meta descriptions
   */
  generateMetaDescriptionFixes() {
    const fixes = [];
    const processed = new Set();

    this.issues.duplicateMetaDescriptions.forEach(issue => {
      const pageUrl = issue['Page URL'] || issue.URL || '';

      if (processed.has(pageUrl)) return;
      processed.add(pageUrl);

      // Generate unique meta description based on page
      const newMetaDescription = this.generateMetaDescription(pageUrl);

      fixes.push({
        url: pageUrl,
        currentMetaDescription: 'Duplicate',
        newMetaDescription: newMetaDescription
      });
    });

    return fixes;
  }

  /**
   * Generate meta description based on page URL
   */
  generateMetaDescription(url) {
    const path = url.replace('https://www.scoopanalytics.com', '');

    const descriptions = {
      '/comparison': 'Compare Scoop Analytics with other business intelligence platforms. See feature differences, pricing, and use cases to find the best BI tool for your needs.',
      '/competitors': 'Explore how Scoop Analytics compares to leading BI platforms. Compare features, pricing, ease of use, and customer reviews.',
      '/industries': 'Discover how Scoop Analytics serves different industries. Learn about industry-specific analytics solutions and use cases.',
      '/use-case': 'Explore real-world use cases for Scoop Analytics. See how businesses use AI-powered analytics to make data-driven decisions.',
      '/solutions/customer-success': 'Empower your Customer Success team with AI-driven analytics. Track retention, identify churn risks, and improve customer satisfaction.',
      '/solutions/sales-ops': 'Optimize your sales operations with AI-powered insights. Analyze pipeline, forecast revenue, and identify growth opportunities.',
      '/solutions/marketing': 'Transform your marketing strategy with AI analytics. Track campaign performance, optimize ROI, and understand customer behavior.',
      '/why-scoop': 'Discover why teams choose Scoop Analytics. AI-powered insights, no-code data analysis, and automated reporting for better decisions.'
    };

    return descriptions[path] || `Learn more about ${path.split('/').pop() || 'Scoop Analytics'} and how AI-powered analytics can transform your business data into actionable insights.`;
  }

  /**
   * Generate 404 redirect mappings
   */
  generate404Redirects() {
    const redirects = [];

    // Main site redirects
    const mainSiteRedirects = {
      '/book-a-demo': '/demo',
      '/book-demo': '/demo',
      '/schedule-demo': '/demo',
      '/free-trial': '/signup',
      '/solutions': '/use-cases',
      '/our-solutions': '/use-cases',
      '/features': '/product',
      '/agencies': '/',
      '/ai': '/product',
      '/type-of-companies': '/industries',
      '/deep-dives': '/blog',
      '/quick-reads': '/blog',
      '/analysis-pages': '/resources',
      '/industry-case-studies': '/case-studies'
    };

    Object.entries(mainSiteRedirects).forEach(([oldPath, newPath]) => {
      redirects.push({
        oldUrl: oldPath,
        newUrl: newPath,
        type: '301'
      });
    });

    return redirects;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('📄 Generating SEO Health Report\n');

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalIssues: Object.values(this.issues).reduce((sum, arr) => sum + arr.length, 0),
        criticalIssues: this.issues._404Errors.length,
        highPriorityIssues: this.issues.duplicateContent.length +
                            this.issues.slowLoadingSpeed.length +
                            this.issues.structuredDataErrors.length,
        mediumPriorityIssues: this.issues.duplicateMetaDescriptions.length +
                              this.issues.uncompressedFiles.length +
                              this.issues.singleInternalLink.length,
        lowPriorityIssues: this.issues.nonDescriptiveAnchors.length
      },
      issues: this.issues,
      recommendations: [
        {
          priority: 1,
          issue: '404 Errors',
          action: 'Implement redirects from 404-redirect-plan.md',
          estimatedImpact: 'High - Recover lost traffic and improve crawlability'
        },
        {
          priority: 2,
          issue: 'Duplicate Content',
          action: 'Add canonical tags to paginated pages',
          estimatedImpact: 'High - Improve indexing efficiency'
        },
        {
          priority: 3,
          issue: 'Structured Data Errors',
          action: 'Fix JSON-LD schema markup',
          estimatedImpact: 'High - Enable rich snippets'
        }
      ]
    };

    const reportPath = path.join(this.dataDir, 'reports', `seo-health-report-${Date.now()}.json`);
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved: ${reportPath}\n`);

    // Print summary
    console.log('Health Score Summary:');
    console.log(`  Total Issues: ${report.summary.totalIssues}`);
    console.log(`  🔴 Critical: ${report.summary.criticalIssues}`);
    console.log(`  🟠 High: ${report.summary.highPriorityIssues}`);
    console.log(`  🟡 Medium: ${report.summary.mediumPriorityIssues}`);
    console.log(`  🟢 Low: ${report.summary.lowPriorityIssues}`);
    console.log('');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse flags
  const flags = {};
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      flags[key] = value || true;
    }
  });

  const dataDir = flags.dir || './data';
  const processor = new SEMrushCSVProcessor(dataDir);

  processor.loadAllData();

  switch (command) {
    case 'analyze':
      processor.summarize();
      break;

    case 'summarize':
      processor.summarize();
      break;

    case 'prioritize':
      processor.prioritize();
      break;

    case 'export-fixes':
      processor.exportFixes();
      break;

    case 'report':
      processor.generateReport();
      break;

    default:
      console.log('SEMrush CSV Data Processor\n');
      console.log('Process downloaded SEMrush CSV files without API access\n');
      console.log('Usage:');
      console.log('  node semrush-csv-processor.js analyze [--dir=./data]');
      console.log('  node semrush-csv-processor.js summarize');
      console.log('  node semrush-csv-processor.js prioritize');
      console.log('  node semrush-csv-processor.js export-fixes');
      console.log('  node semrush-csv-processor.js report');
      console.log('\nExamples:');
      console.log('  node semrush-csv-processor.js analyze');
      console.log('  node semrush-csv-processor.js prioritize');
      console.log('  node semrush-csv-processor.js export-fixes\n');
      process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = SEMrushCSVProcessor;
