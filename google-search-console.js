#!/usr/bin/env node

/**
 * Google Search Console API Integration
 *
 * Fetches performance data, URL inspection, and sitemap data from GSC.
 *
 * Setup:
 * 1. Enable Google Search Console API in Google Cloud Console
 * 2. Create OAuth 2.0 credentials and download JSON
 * 3. Run: npm install googleapis
 * 4. Set environment variable: GSC_CREDENTIALS_PATH=/path/to/credentials.json
 *
 * Usage:
 *   node google-search-console.js performance [--days=30]
 *   node google-search-console.js queries [--limit=100]
 *   node google-search-console.js pages [--limit=100]
 *   node google-search-console.js sitemaps
 *   node google-search-console.js crawl-errors
 *   node google-search-console.js inspect <url>
 *   node google-search-console.js export [--type=performance|queries|pages]
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Configuration
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const TOKEN_PATH = path.join(__dirname, '.gsc-token.json');
const CREDENTIALS_PATH = process.env.GSC_CREDENTIALS_PATH || path.join(__dirname, '.gsc-credentials.json');
const SITE_URL = 'sc-domain:scoopanalytics.com'; // Or 'https://www.scoopanalytics.com/'

class GoogleSearchConsole {
  constructor() {
    this.auth = null;
    this.searchconsole = null;
  }

  /**
   * Load or request authorization
   */
  async authorize() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('❌ Credentials file not found!');
      console.error(`Expected at: ${CREDENTIALS_PATH}`);
      console.error('\nSetup instructions:');
      console.error('1. Go to https://console.cloud.google.com/');
      console.error('2. Enable Google Search Console API');
      console.error('3. Create OAuth 2.0 credentials (Desktop app)');
      console.error('4. Download credentials.json');
      console.error(`5. Save as: ${CREDENTIALS_PATH}`);
      process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have a token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oAuth2Client.setCredentials(token);
      this.auth = oAuth2Client;
      this.searchconsole = google.searchconsole({ version: 'v1', auth: oAuth2Client });
      return;
    }

    // Get new token
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('🔐 Authorize this app by visiting this URL:');
    console.log(authUrl);
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) => {
      rl.question('Enter the code from that page here: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

    console.log('✅ Token stored to', TOKEN_PATH);
    this.auth = oAuth2Client;
    this.searchconsole = google.searchconsole({ version: 'v1', auth: oAuth2Client });
  }

  /**
   * Get performance data (impressions, clicks, CTR, position)
   */
  async getPerformance(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await this.searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
        rowLimit: 1000,
      },
    });

    return response.data;
  }

  /**
   * Get top search queries
   */
  async getTopQueries(limit = 100, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await this.searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query'],
        rowLimit: limit,
      },
    });

    return response.data;
  }

  /**
   * Get top pages by impressions
   */
  async getTopPages(limit = 100, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await this.searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['page'],
        rowLimit: limit,
      },
    });

    return response.data;
  }

  /**
   * Get sitemaps status
   */
  async getSitemaps() {
    const response = await this.searchconsole.sitemaps.list({
      siteUrl: SITE_URL,
    });

    return response.data;
  }

  /**
   * Inspect a specific URL
   */
  async inspectUrl(inspectionUrl) {
    const response = await this.searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: inspectionUrl,
        siteUrl: SITE_URL,
      },
    });

    return response.data;
  }

  /**
   * Export data to CSV
   */
  exportToCSV(data, filename) {
    const outputPath = path.join(__dirname, 'data', 'gsc', filename);

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!data.rows || data.rows.length === 0) {
      console.log('⚠️  No data to export');
      return;
    }

    // Get headers from first row
    const firstRow = data.rows[0];
    const headers = [
      ...firstRow.keys.map((_, i) => data.dimensions ? data.dimensions[i] : `dimension${i}`),
      'clicks',
      'impressions',
      'ctr',
      'position'
    ];

    // Create CSV
    let csv = headers.join(',') + '\n';

    for (const row of data.rows) {
      const values = [
        ...row.keys.map(k => `"${k}"`),
        row.clicks || 0,
        row.impressions || 0,
        (row.ctr || 0).toFixed(4),
        (row.position || 0).toFixed(2)
      ];
      csv += values.join(',') + '\n';
    }

    fs.writeFileSync(outputPath, csv);
    console.log(`✅ Exported to: ${outputPath}`);
  }

  /**
   * Pretty print performance data
   */
  printPerformance(data) {
    console.log('\n📊 Search Performance Summary\n');

    if (!data.rows || data.rows.length === 0) {
      console.log('No data available');
      return;
    }

    // Calculate totals
    let totalClicks = 0;
    let totalImpressions = 0;
    let sumPosition = 0;

    for (const row of data.rows) {
      totalClicks += row.clicks || 0;
      totalImpressions += row.impressions || 0;
      sumPosition += (row.position || 0) * (row.impressions || 0);
    }

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    const avgPosition = totalImpressions > 0 ? (sumPosition / totalImpressions).toFixed(2) : 0;

    console.log(`Total Clicks:       ${totalClicks.toLocaleString()}`);
    console.log(`Total Impressions:  ${totalImpressions.toLocaleString()}`);
    console.log(`Average CTR:        ${avgCTR}%`);
    console.log(`Average Position:   ${avgPosition}`);
    console.log(`\nData points:        ${data.rows.length}`);
  }

  /**
   * Pretty print top queries
   */
  printQueries(data, limit = 20) {
    console.log('\n🔍 Top Search Queries\n');

    if (!data.rows || data.rows.length === 0) {
      console.log('No data available');
      return;
    }

    console.log('Rank | Query                                    | Clicks | Impr.  | CTR    | Pos.');
    console.log('-----|------------------------------------------|--------|--------|--------|------');

    const rows = data.rows.slice(0, limit);
    rows.forEach((row, i) => {
      const query = row.keys[0].substring(0, 40).padEnd(40);
      const clicks = String(row.clicks || 0).padStart(6);
      const impressions = String(row.impressions || 0).padStart(6);
      const ctr = ((row.ctr || 0) * 100).toFixed(2).padStart(6);
      const position = (row.position || 0).toFixed(1).padStart(4);

      console.log(`${String(i + 1).padStart(4)} | ${query} | ${clicks} | ${impressions} | ${ctr}% | ${position}`);
    });
  }

  /**
   * Pretty print top pages
   */
  printPages(data, limit = 20) {
    console.log('\n📄 Top Pages by Impressions\n');

    if (!data.rows || data.rows.length === 0) {
      console.log('No data available');
      return;
    }

    console.log('Rank | Page                                                      | Clicks | Impr.  | CTR    | Pos.');
    console.log('-----|-----------------------------------------------------------|--------|--------|--------|------');

    const rows = data.rows.slice(0, limit);
    rows.forEach((row, i) => {
      const url = row.keys[0].replace('https://www.scoopanalytics.com', '').substring(0, 57).padEnd(57);
      const clicks = String(row.clicks || 0).padStart(6);
      const impressions = String(row.impressions || 0).padStart(6);
      const ctr = ((row.ctr || 0) * 100).toFixed(2).padStart(6);
      const position = (row.position || 0).toFixed(1).padStart(4);

      console.log(`${String(i + 1).padStart(4)} | ${url} | ${clicks} | ${impressions} | ${ctr}% | ${position}`);
    });
  }

  /**
   * Print sitemaps
   */
  printSitemaps(data) {
    console.log('\n🗺️  Sitemaps\n');

    if (!data.sitemap || data.sitemap.length === 0) {
      console.log('No sitemaps found');
      return;
    }

    for (const sitemap of data.sitemap) {
      console.log(`Path: ${sitemap.path}`);
      console.log(`Last Submitted: ${sitemap.lastSubmitted || 'Never'}`);
      console.log(`Last Downloaded: ${sitemap.lastDownloaded || 'Never'}`);
      console.log(`Status: ${sitemap.isPending ? 'Pending' : 'Processed'}`);
      if (sitemap.errors) {
        console.log(`Errors: ${sitemap.errors}`);
      }
      if (sitemap.warnings) {
        console.log(`Warnings: ${sitemap.warnings}`);
      }
      console.log('');
    }
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

  const gsc = new GoogleSearchConsole();

  try {
    await gsc.authorize();

    switch (command) {
      case 'performance': {
        const days = parseInt(flags.days) || 30;
        console.log(`📊 Fetching performance data for last ${days} days...`);
        const data = await gsc.getPerformance(days);
        gsc.printPerformance(data);
        if (flags.export) {
          gsc.exportToCSV(data, `performance-${days}days.csv`);
        }
        break;
      }

      case 'queries': {
        const limit = parseInt(flags.limit) || 100;
        const days = parseInt(flags.days) || 30;
        console.log(`🔍 Fetching top ${limit} queries from last ${days} days...`);
        const data = await gsc.getTopQueries(limit, days);
        gsc.printQueries(data, 20);
        if (flags.export) {
          gsc.exportToCSV(data, `top-queries-${days}days.csv`);
        }
        break;
      }

      case 'pages': {
        const limit = parseInt(flags.limit) || 100;
        const days = parseInt(flags.days) || 30;
        console.log(`📄 Fetching top ${limit} pages from last ${days} days...`);
        const data = await gsc.getTopPages(limit, days);
        gsc.printPages(data, 20);
        if (flags.export) {
          gsc.exportToCSV(data, `top-pages-${days}days.csv`);
        }
        break;
      }

      case 'sitemaps': {
        console.log('🗺️  Fetching sitemaps...');
        const data = await gsc.getSitemaps();
        gsc.printSitemaps(data);
        break;
      }

      case 'inspect': {
        const url = args[1];
        if (!url) {
          console.error('❌ Please provide a URL to inspect');
          console.error('Usage: node google-search-console.js inspect <url>');
          process.exit(1);
        }
        console.log(`🔍 Inspecting URL: ${url}`);
        const data = await gsc.inspectUrl(url);
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'export': {
        const type = flags.type || 'performance';
        const days = parseInt(flags.days) || 30;
        console.log(`📥 Exporting ${type} data...`);

        let data;
        switch (type) {
          case 'queries':
            data = await gsc.getTopQueries(1000, days);
            gsc.exportToCSV(data, `queries-export-${Date.now()}.csv`);
            break;
          case 'pages':
            data = await gsc.getTopPages(1000, days);
            gsc.exportToCSV(data, `pages-export-${Date.now()}.csv`);
            break;
          default:
            data = await gsc.getPerformance(days);
            gsc.exportToCSV(data, `performance-export-${Date.now()}.csv`);
        }
        break;
      }

      default:
        console.log('Google Search Console API Integration\n');
        console.log('Usage:');
        console.log('  node google-search-console.js performance [--days=30] [--export]');
        console.log('  node google-search-console.js queries [--limit=100] [--days=30] [--export]');
        console.log('  node google-search-console.js pages [--limit=100] [--days=30] [--export]');
        console.log('  node google-search-console.js sitemaps');
        console.log('  node google-search-console.js inspect <url>');
        console.log('  node google-search-console.js export [--type=performance|queries|pages] [--days=30]');
        console.log('\nExamples:');
        console.log('  node google-search-console.js performance --days=90');
        console.log('  node google-search-console.js queries --limit=50 --export');
        console.log('  node google-search-console.js inspect https://www.scoopanalytics.com/blog');
        process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GoogleSearchConsole;
