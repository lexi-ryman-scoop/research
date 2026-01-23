const fs = require('fs');

// Read SEMrush errors
const semrushErrors = fs.readFileSync('data/Table.csv', 'utf8')
  .split('\n')
  .slice(1)
  .filter(line => line.trim())
  .map(line => {
    const url = line.split(',')[0].replace(/"/g, '').trim();
    return url;
  });

// Read existing redirects
const existingRedirects = fs.readFileSync('data/scoop-webflow-303-redirects.csv', 'utf8')
  .split('\n')
  .slice(1)
  .filter(line => line.trim())
  .map(line => {
    const parts = line.split(',');
    return { source: parts[0], target: parts[1] };
  });

// Extract paths from SEMrush URLs
const errorPaths = semrushErrors.map(url => {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url;
  }
});

// Find which error paths already have redirects
const redirectSources = new Set(existingRedirects.map(r => r.source));
const coveredByRedirect = errorPaths.filter(path => redirectSources.has(path));
const notCovered = errorPaths.filter(path => !redirectSources.has(path));

// Categorize by domain
const byDomain = {};
semrushErrors.forEach(url => {
  try {
    const domain = new URL(url).hostname;
    byDomain[domain] = (byDomain[domain] || 0) + 1;
  } catch {}
});

console.log('=== SEMrush Error Analysis ===\n');
console.log('Total SEMrush Errors:', semrushErrors.length);
console.log('Existing Webflow Redirects:', existingRedirects.length);
console.log('');
console.log('Errors already covered by redirects:', coveredByRedirect.length);
console.log('Errors WITHOUT redirects:', notCovered.length);
console.log('');

console.log('=== Errors by Domain ===');
Object.entries(byDomain).sort((a,b) => b[1]-a[1]).forEach(([domain, count]) => {
  console.log('  ' + domain + ': ' + count);
});

// Categorize uncovered errors
const docsErrors = [];
const mainSiteErrors = [];
const otherErrors = [];

semrushErrors.forEach((url, i) => {
  if (redirectSources.has(errorPaths[i])) return;

  if (url.includes('docs.scoopanalytics.com')) {
    docsErrors.push(url);
  } else if (url.includes('www.scoopanalytics.com') || url.includes('scoopanalytics.com')) {
    mainSiteErrors.push(url);
  } else {
    otherErrors.push(url);
  }
});

console.log('\n=== Uncovered Errors by Site ===');
console.log('  docs.scoopanalytics.com:', docsErrors.length);
console.log('  www.scoopanalytics.com:', mainSiteErrors.length);
console.log('  Other:', otherErrors.length);

console.log('\n=== Docs Site Errors (need fixing in docs platform) ===');
docsErrors.slice(0, 20).forEach((url, i) => {
  console.log((i+1) + '. ' + url);
});
if (docsErrors.length > 20) console.log('  ... and ' + (docsErrors.length - 20) + ' more');

console.log('\n=== Main Site Errors (fixable in Webflow) ===');
mainSiteErrors.forEach((url, i) => {
  console.log((i+1) + '. ' + url);
});

// Export the main site errors for fixing
if (mainSiteErrors.length > 0) {
  const csvOutput = 'url,suggested_redirect\n' + mainSiteErrors.map(url => {
    try {
      const path = new URL(url).pathname;
      return url + ',' + path;
    } catch {
      return url + ',';
    }
  }).join('\n');
  fs.writeFileSync('data/semrush-main-site-errors.csv', csvOutput);
  console.log('\n[Exported main site errors to data/semrush-main-site-errors.csv]');
}

// Export docs errors separately
if (docsErrors.length > 0) {
  fs.writeFileSync('data/semrush-docs-errors.csv', 'url\n' + docsErrors.join('\n'));
  console.log('[Exported docs errors to data/semrush-docs-errors.csv]');
}
