#!/bin/bash
# Daily Blog Publishing Cron Script
# Add to crontab: 0 9 * * * /path/to/scripts/daily-publish-cron.sh

# Set working directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run the publishing check
echo "[$(date)] Starting daily blog publishing check..."

# If using Node.js directly
if command -v node &> /dev/null; then
    node -e "
        const { checkAndPublishScheduledPosts } = require('./services/dailyPublishingCron.ts');
        checkAndPublishScheduledPosts().then(result => {
            console.log('Publishing results:', result);
            process.exit(result.errors > 0 ? 1 : 0);
        }).catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
    "
else
    echo "Node.js not found. Please install Node.js to run this script."
    exit 1
fi

echo "[$(date)] Daily publishing check complete."




