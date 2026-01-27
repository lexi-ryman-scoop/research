#!/bin/bash

###############################################################################
# Weekly SEO Automation Script
#
# Automates weekly SEO tasks:
# 1. Download fresh SEMrush data (manual CSVs)
# 2. Fetch Google Search Console data
# 3. Generate SEO dashboard
# 4. Track progress
# 5. Send summary email (optional)
#
# Usage:
#   ./weekly-seo-automation.sh
#
# Setup cron job (run every Monday at 9 AM):
#   0 9 * * 1 /path/to/weekly-seo-automation.sh
###############################################################################

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
REPORTS_DIR="$DATA_DIR/reports"
LOG_FILE="$SCRIPT_DIR/seo-automation.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Create directories if they don't exist
mkdir -p "$DATA_DIR/gsc"
mkdir -p "$REPORTS_DIR"

###############################################################################
# Main Workflow
###############################################################################

log "🚀 Starting Weekly SEO Automation"
log "========================================"

# Step 1: Fetch Google Search Console Data
log "Step 1: Fetching Google Search Console data..."

if [ -f "$SCRIPT_DIR/.gsc-token.json" ]; then
    info "GSC credentials found, fetching data..."

    # Fetch performance data
    node "$SCRIPT_DIR/google-search-console.js" performance --days=30 --export >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ GSC performance data fetched"
    else
        error "Failed to fetch GSC performance data"
    fi

    # Fetch top queries
    node "$SCRIPT_DIR/google-search-console.js" queries --limit=100 --export >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ GSC queries data fetched"
    else
        error "Failed to fetch GSC queries data"
    fi

    # Fetch top pages
    node "$SCRIPT_DIR/google-search-console.js" pages --limit=100 --export >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ GSC pages data fetched"
    else
        error "Failed to fetch GSC pages data"
    fi
else
    warn "GSC credentials not found. Run: node google-search-console.js performance"
    warn "Skipping GSC data fetch..."
fi

# Step 2: Process SEMrush CSV data
log ""
log "Step 2: Processing SEMrush CSV data..."

if [ -d "$DATA_DIR" ]; then
    info "Analyzing SEMrush data..."
    node "$SCRIPT_DIR/semrush-csv-processor.js" report >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ SEMrush data analyzed"
    else
        error "Failed to analyze SEMrush data"
    fi
else
    error "Data directory not found: $DATA_DIR"
fi

# Step 3: Generate SEO Dashboard
log ""
log "Step 3: Generating SEO dashboard..."

node "$SCRIPT_DIR/seo-dashboard.js" generate >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    log "✅ Text dashboard generated"
else
    error "Failed to generate text dashboard"
fi

node "$SCRIPT_DIR/seo-dashboard.js" html >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    log "✅ HTML dashboard generated"
else
    error "Failed to generate HTML dashboard"
fi

# Step 4: Track Progress
log ""
log "Step 4: Tracking SEO progress..."

node "$SCRIPT_DIR/seo-dashboard.js" track >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    log "✅ Progress tracked"
else
    error "Failed to track progress"
fi

# Step 5: Generate Summary Report
log ""
log "Step 5: Generating summary..."

# Find most recent dashboard report
LATEST_REPORT=$(ls -t "$REPORTS_DIR"/dashboard-*.json 2>/dev/null | head -n 1)

if [ -f "$LATEST_REPORT" ]; then
    SCORE=$(jq -r '.score' "$LATEST_REPORT")
    CRITICAL_ISSUES=$(jq -r '.issues | map(select(.priority == "Critical")) | length' "$LATEST_REPORT")
    HIGH_ISSUES=$(jq -r '.issues | map(select(.priority == "High")) | length' "$LATEST_REPORT")

    log ""
    log "📊 Weekly SEO Summary"
    log "===================="
    log "SEO Health Score: $SCORE/100"
    log "Critical Issues: $CRITICAL_ISSUES"
    log "High Priority Issues: $HIGH_ISSUES"
    log ""
    log "📁 Reports saved to: $REPORTS_DIR"
    log "🌐 HTML Dashboard: $SCRIPT_DIR/seo-dashboard.html"
else
    warn "No dashboard report found"
fi

# Step 6: Manual Task Reminders
log ""
log "📝 Manual Tasks Reminder"
log "========================"
log "1. Download latest SEMrush CSV exports from:"
log "   https://www.semrush.com/siteaudit/"
log "   - Save to: $DATA_DIR/"
log ""
log "2. Review HTML dashboard: file://$SCRIPT_DIR/seo-dashboard.html"
log ""
log "3. If there are new 404 errors, run:"
log "   node webflow-redirect-manager.js export"
log ""
log "4. If there are meta description issues, run:"
log "   node meta-fixer.js export-all"
log ""

# Step 7: Cleanup old reports (keep last 30 days)
log "Step 7: Cleaning up old reports..."
find "$REPORTS_DIR" -name "*.json" -mtime +30 -delete 2>/dev/null
log "✅ Cleanup complete"

log ""
log "✅ Weekly SEO automation complete!"
log "========================================"

# Optional: Send email notification
# Uncomment and configure if you want email notifications
# if command -v mail &> /dev/null; then
#     mail -s "Weekly SEO Report - Score: $SCORE/100" your@email.com < "$LOG_FILE"
# fi

exit 0
