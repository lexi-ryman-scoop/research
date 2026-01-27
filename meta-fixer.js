#!/usr/bin/env node

/**
 * Meta Description & Canonical Tag Fixer
 *
 * Fixes duplicate meta descriptions and adds canonical tags for duplicate content.
 * Works with Webflow CMS API.
 *
 * Usage:
 *   node meta-fixer.js analyze
 *   node meta-fixer.js fix-meta --dry-run
 *   node meta-fixer.js fix-meta
 *   node meta-fixer.js add-canonical --dry-run
 *   node meta-fixer.js add-canonical
 */

const fs = require('fs');
const path = require('path');

// Webflow credentials (update these)
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN || 'd80f0401d9f38719979ce74ba898729dfff9af4981dd9ccf059624aabefa151b';
const WEBFLOW_SITE_ID = process.env.WEBFLOW_SITE_ID || '65fdc9041545b81c2e66e5ac';

class MetaFixer {
  constructor() {
    this.duplicateMetaIssues = [];
    this.duplicateContentIssues = [];
    this.fixes = [];
  }

  /**
   * Load issues from CSV files
   */
  loadIssues() {
    console.log('📂 Loading SEO issues...\n');

    // Load duplicate meta descriptions
    const metaFile = path.join(__dirname, 'data', 'scoopanalytics.com_duplicate_meta_description_20260127.csv');
    if (fs.existsSync(metaFile)) {
      this.duplicateMetaIssues = this.parseCSV(metaFile);
      console.log(`✅ Loaded ${this.duplicateMetaIssues.length} duplicate meta description issues`);
    }

    // Load duplicate content
    const contentFile = path.join(__dirname, 'data', 'scoopanalytics.com_duplicate_content_20260127.csv');
    if (fs.existsSync(contentFile)) {
      this.duplicateContentIssues = this.parseCSV(contentFile);
      console.log(`✅ Loaded ${this.duplicateContentIssues.length} duplicate content issues`);
    }

    console.log('');
  }

  /**
   * Parse CSV file
   */
  parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');

    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

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

      const row = {};
      headers.forEach((header, index) => {
        row[header] = fields[index] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  /**
   * Analyze issues and generate fixes
   */
  analyze() {
    console.log('🔍 Analyzing SEO issues...\n');

    // Analyze duplicate meta descriptions
    console.log('📝 Duplicate Meta Descriptions:\n');

    const metaDescGroups = new Map();
    this.duplicateMetaIssues.forEach(issue => {
      const url = issue['Page URL'] || issue.URL || '';
      const duplicates = (issue['Pages with same meta description'] || '').split(',').map(u => u.trim());

      if (!metaDescGroups.has(url)) {
        metaDescGroups.set(url, new Set([url, ...duplicates]));
      }
    });

    metaDescGroups.forEach((urls, baseUrl) => {
      console.log(`  ${baseUrl}`);
      urls.forEach(url => {
        if (url !== baseUrl) {
          console.log(`    ↔ ${url}`);
        }
      });
      console.log('');
    });

    // Analyze duplicate content
    console.log('📄 Duplicate Content (Canonical Tags Needed):\n');

    const canonicalNeeded = new Map();

    this.duplicateContentIssues.forEach(issue => {
      const url = issue['Page URL'] || issue.URL || '';

      // Check if it's a pagination URL
      if (url.includes('?f73e57f1_page=') || url.includes('?f3548407_page=')) {
        const baseUrl = url.split('?')[0];

        if (!canonicalNeeded.has(baseUrl)) {
          canonicalNeeded.set(baseUrl, []);
        }

        canonicalNeeded.get(baseUrl).push(url);
      }
    });

    canonicalNeeded.forEach((paginatedUrls, baseUrl) => {
      console.log(`  Base: ${baseUrl}`);
      paginatedUrls.forEach(url => {
        console.log(`    → ${url} (needs canonical)`);
      });
      console.log('');
    });

    console.log('─'.repeat(70));
    console.log(`Total pages needing unique meta: ${metaDescGroups.size}`);
    console.log(`Total pages needing canonical: ${Array.from(canonicalNeeded.values()).flat().length}`);
    console.log('─'.repeat(70));
    console.log('');
  }

  /**
   * Generate unique meta descriptions
   */
  generateMetaDescriptions() {
    console.log('✍️  Generating unique meta descriptions...\n');

    const fixes = [];
    const processed = new Set();

    this.duplicateMetaIssues.forEach(issue => {
      const url = issue['Page URL'] || issue.URL || '';

      if (processed.has(url)) return;
      processed.add(url);

      const path = url.replace('https://www.scoopanalytics.com', '');
      const newMetaDescription = this.generateMetaDescription(path);

      fixes.push({
        url: url,
        path: path,
        newMetaDescription: newMetaDescription,
        action: 'update-meta-description'
      });

      console.log(`  ${path}`);
      console.log(`    → ${newMetaDescription.substring(0, 100)}...`);
      console.log('');
    });

    this.fixes = [...this.fixes, ...fixes];
    return fixes;
  }

  /**
   * Generate meta description based on page path
   */
  generateMetaDescription(path) {
    const descriptions = {
      '/comparison': 'Compare Scoop Analytics with other business intelligence platforms. See feature differences, pricing, and use cases to find the best BI tool for your needs.',
      '/competitors': 'Explore how Scoop Analytics compares to leading BI platforms. Compare features, pricing, ease of use, and customer reviews to make an informed decision.',
      '/industries': 'Discover how Scoop Analytics serves different industries. Learn about industry-specific analytics solutions, use cases, and customer success stories.',
      '/use-case': 'Explore real-world use cases for Scoop Analytics. See how businesses use AI-powered analytics to make data-driven decisions and accelerate growth.',
      '/solutions/customer-success': 'Empower your Customer Success team with AI-driven analytics. Track retention metrics, identify churn risks, and improve customer satisfaction with Scoop.',
      '/solutions/sales-ops': 'Optimize your sales operations with AI-powered insights. Analyze pipeline performance, forecast revenue accurately, and identify growth opportunities.',
      '/solutions/marketing': 'Transform your marketing strategy with AI analytics. Track campaign performance, optimize marketing ROI, and understand customer behavior patterns.',
      '/why-scoop': 'Discover why teams choose Scoop Analytics. AI-powered insights, no-code data analysis, automated reporting, and fast time-to-value for better business decisions.'
    };

    if (descriptions[path]) {
      return descriptions[path];
    }

    // Generate generic description
    const pageName = path.split('/').filter(Boolean).pop() || 'home';
    const formattedName = pageName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `Learn more about ${formattedName} with Scoop Analytics. AI-powered business intelligence platform that transforms your data into actionable insights. Start making better decisions today.`;
  }

  /**
   * Generate canonical tag instructions
   */
  generateCanonicalInstructions() {
    console.log('🔗 Generating canonical tag instructions...\n');

    const canonicalFixes = new Map();

    this.duplicateContentIssues.forEach(issue => {
      const url = issue['Page URL'] || issue.URL || '';

      if (url.includes('?f73e57f1_page=') || url.includes('?f3548407_page=')) {
        const baseUrl = url.split('?')[0];

        if (!canonicalFixes.has(baseUrl)) {
          canonicalFixes.set(baseUrl, []);
        }

        canonicalFixes.get(baseUrl).push(url);
      }
    });

    console.log('📋 Add these canonical tags to your Webflow pages:\n');
    console.log('In Webflow:');
    console.log('  1. Go to Page Settings');
    console.log('  2. Click "SEO Settings"');
    console.log('  3. Add to "Head Code":\n');

    canonicalFixes.forEach((paginatedUrls, baseUrl) => {
      console.log(`For all blog pagination pages (?page=N):`);
      console.log(`  <link rel="canonical" href="${baseUrl}" />\n`);
    });

    // Save instructions to file
    const instructions = {
      canonicalTags: [],
      instructions: 'Add canonical tags to prevent duplicate content issues',
      implementation: {
        webflow: 'Page Settings > SEO Settings > Head Code',
        code: '<link rel="canonical" href="BASE_URL" />'
      }
    };

    canonicalFixes.forEach((paginatedUrls, baseUrl) => {
      paginatedUrls.forEach(url => {
        instructions.canonicalTags.push({
          url: url,
          canonicalUrl: baseUrl
        });
      });
    });

    const outputPath = path.join(__dirname, 'data', 'fixes', 'canonical-tags-instructions.json');
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(instructions, null, 2));
    console.log(`✅ Instructions saved: ${outputPath}\n`);
  }

  /**
   * Fix meta descriptions (export for Webflow)
   */
  async fixMetaDescriptions(dryRun = true) {
    console.log(`${dryRun ? '🔍 DRY RUN:' : '✅ APPLYING:'} Fixing meta descriptions...\n`);

    const fixes = this.generateMetaDescriptions();

    if (dryRun) {
      console.log('─'.repeat(70));
      console.log(`Total meta descriptions to update: ${fixes.length}`);
      console.log('\nRun without --dry-run to export fixes for Webflow');
      console.log('─'.repeat(70));
    } else {
      // Export to JSON for manual application in Webflow
      const outputPath = path.join(__dirname, 'data', 'fixes', 'meta-descriptions-to-update.json');
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
      console.log(`✅ Meta description fixes exported: ${outputPath}`);
      console.log('\n📋 Next Steps:');
      console.log('   1. Open Webflow Designer');
      console.log('   2. For each page in the export:');
      console.log('      - Go to Page Settings > SEO Settings');
      console.log('      - Update Meta Description');
      console.log('   3. Publish changes\n');

      // Also create a CSV for easier viewing
      const csvPath = path.join(__dirname, 'data', 'fixes', 'meta-descriptions.csv');
      let csv = 'Page URL,New Meta Description\n';
      fixes.forEach(fix => {
        csv += `"${fix.url}","${fix.newMetaDescription}"\n`;
      });
      fs.writeFileSync(csvPath, csv);
      console.log(`📄 CSV version: ${csvPath}\n`);
    }
  }

  /**
   * Export all fixes
   */
  exportAllFixes() {
    console.log('📤 Exporting all fixes...\n');

    // Generate fixes
    const metaFixes = this.generateMetaDescriptions();
    this.generateCanonicalInstructions();

    // Create comprehensive report
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalMetaDescriptionFixes: metaFixes.length,
        totalCanonicalTagsNeeded: this.duplicateContentIssues.filter(i =>
          i['Page URL'].includes('?f73e57f1_page=') ||
          i['Page URL'].includes('?f3548407_page=')
        ).length
      },
      metaDescriptionFixes: metaFixes,
      canonicalTags: this.duplicateContentIssues
        .filter(i => i['Page URL'].includes('?f73e57f1_page=') || i['Page URL'].includes('?f3548407_page='))
        .map(i => ({
          url: i['Page URL'],
          canonicalUrl: i['Page URL'].split('?')[0]
        }))
    };

    const reportPath = path.join(__dirname, 'data', 'fixes', 'seo-fixes-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Full report exported: ${reportPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Meta descriptions to update: ${metaFixes.length}`);
    console.log(`   Canonical tags to add: ${report.summary.totalCanonicalTagsNeeded}`);
    console.log('');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = args.includes('--dry-run');

  const fixer = new MetaFixer();
  fixer.loadIssues();

  switch (command) {
    case 'analyze':
      fixer.analyze();
      break;

    case 'fix-meta':
      await fixer.fixMetaDescriptions(dryRun);
      break;

    case 'add-canonical':
      fixer.generateCanonicalInstructions();
      break;

    case 'export-all':
      fixer.exportAllFixes();
      break;

    default:
      console.log('Meta Description & Canonical Tag Fixer\n');
      console.log('Usage:');
      console.log('  node meta-fixer.js analyze              # Analyze issues');
      console.log('  node meta-fixer.js fix-meta --dry-run   # Preview meta fixes');
      console.log('  node meta-fixer.js fix-meta             # Export meta fixes');
      console.log('  node meta-fixer.js add-canonical        # Generate canonical instructions');
      console.log('  node meta-fixer.js export-all           # Export everything');
      console.log('\nExamples:');
      console.log('  node meta-fixer.js analyze');
      console.log('  node meta-fixer.js fix-meta');
      console.log('  node meta-fixer.js export-all\n');
      process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = MetaFixer;
