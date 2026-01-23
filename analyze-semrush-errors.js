const XLSX = require('xlsx');

// Analyze duplicate titles
console.log('=== DUPLICATE TITLE TAGS ===\n');
const titles = XLSX.utils.sheet_to_json(XLSX.readFile('data/scoopanalytics.com_duplicate_title_tag_20260123.xlsx').Sheets['Sheet1']);

// Group by title
const byTitle = {};
titles.forEach(row => {
  const title = row['Page Title'] || 'Unknown';
  if (byTitle[title] === undefined) byTitle[title] = [];
  byTitle[title].push(row['Page URL']);
});

console.log('Duplicate title groups:');
Object.entries(byTitle).slice(0, 10).forEach(([title, urls]) => {
  console.log('\n"' + title + '" (' + urls.length + ' pages):');
  urls.slice(0, 3).forEach(url => console.log('  - ' + url));
  if (urls.length > 3) console.log('  ... and ' + (urls.length - 3) + ' more');
});

// Check for pagination pattern
const paginatedCount = titles.filter(r => r['Page URL'].includes('_page=')).length;
console.log('\nPaginated URLs (with ?xxx_page=):', paginatedCount, 'of', titles.length);

// Analyze canonical URLs
console.log('\n\n=== MULTIPLE CANONICAL URLs ===\n');
const canonicals = XLSX.utils.sheet_to_json(XLSX.readFile('data/scoopanalytics.com_multiple_canonical_urls_20260123.xlsx').Sheets['Sheet1']);
console.log('Total pages with multiple canonicals:', canonicals.length);

// Check patterns
const caseStudies = canonicals.filter(r => r['Page URL'].includes('/industry-case-studies/')).length;
const recipes = canonicals.filter(r => r['Page URL'].includes('/recipes/')).length;
console.log('Industry case studies:', caseStudies);
console.log('Recipes:', recipes);
console.log('Other:', canonicals.length - caseStudies - recipes);

// Show sample
console.log('\nSample issues:');
canonicals.slice(0, 5).forEach((row, i) => {
  console.log((i+1) + '. ' + row['Page URL']);
  console.log('   Canonical: ' + (row['First Canonical Link URL'] || '').substring(0, 80) + '...');
});
