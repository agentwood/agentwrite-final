#!/bin/bash
#
# Agentwood Indexing Automation Script
# Submits URLs to IndexNow (Bing/Yandex) for faster indexing
#
# NOTE: Google deprecated sitemap ping in June 2023
# https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
#
# For Google indexing, use:
# 1. Google Search Console URL Inspection API
# 2. Automatic discovery via sitemap.xml
#
# Usage: ./submit-urls-for-indexing.sh
# Recommended: Run daily via launchd
#

set -e

# Configuration
SITE_URL="https://agentwood.xyz"
INDEXNOW_KEY="agentwood-indexnow-key"  # Replace with your actual key from Bing Webmaster Tools
SITEMAP_URL="${SITE_URL}/sitemap.xml"
LOG_FILE="$HOME/Library/Logs/agentwood-indexing.log"

# URLs to prioritize for indexing (high-value pages)
PRIORITY_PATHS=(
    "/"
    "/discover"
    "/create"
    "/pricing"
    "/blog"
    "/chat-with/vampire"
    "/chat-with/yandere"
    "/chat-with/ai-girlfriend"
    "/chat-with/ai-boyfriend"
    "/chat-with/tsundere"
    "/roleplay/vampire/coffee-shop"
    "/roleplay/yandere/school"
    "/roleplay/gojo-satoru/training"
    "/talk-to/yandere"
    "/talk-to/villain"
    "/naruto-uzumaki-ai-chat"
    "/gojo-satoru-ai-chat"
    "/rem-ai-chat"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create log directory if needed
mkdir -p "$(dirname "$LOG_FILE")"

log "=== Starting Agentwood Indexing Run ==="
log "Site: $SITE_URL"

# 1. Verify sitemap is accessible
log "Verifying sitemap accessibility..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITEMAP_URL")
log "Sitemap status: $SITEMAP_STATUS"

if [ "$SITEMAP_STATUS" != "200" ]; then
    log "WARNING: Sitemap not accessible!"
fi

# 2. Submit priority URLs to IndexNow (Bing/Yandex/Seznam/Naver)
log "Submitting ${#PRIORITY_PATHS[@]} priority URLs to IndexNow..."

# Build URL list
URL_LIST=""
for path in "${PRIORITY_PATHS[@]}"; do
    URL_LIST="${URL_LIST}\"${SITE_URL}${path}\","
done
# Remove trailing comma
URL_LIST="${URL_LIST%,}"

INDEXNOW_PAYLOAD=$(cat <<EOF
{
    "host": "agentwood.xyz",
    "key": "${INDEXNOW_KEY}",
    "keyLocation": "${SITE_URL}/${INDEXNOW_KEY}.txt",
    "urlList": [${URL_LIST}]
}
EOF
)

# Submit to IndexNow API (supports Bing, Yandex, Seznam, Naver)
INDEXNOW_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$INDEXNOW_PAYLOAD" \
    "https://api.indexnow.org/indexnow" 2>/dev/null || echo "error")

INDEXNOW_STATUS=$(echo "$INDEXNOW_RESPONSE" | tail -n1)
log "IndexNow priority submission: $INDEXNOW_STATUS"

# 3. Generate rotating batch from SEO keywords
log "Generating rotating URL batch..."

# Character samples from SEO_DATA
CHARACTERS=("naruto-uzumaki" "gojo-satoru" "rem" "megumin" "gawr-gura" "sung-jinwoo" 
            "hu-tao" "percy-jackson" "zero-two" "sasuke-uchiha" "hinata-hyuga"
            "levi-ackerman" "mikasa-ackerman" "eren-yeager" "itachi-uchiha"
            "kakashi-hatake" "todoroki-shoto" "bakugo-katsuki" "deku")

SCENARIOS=("coffee-shop" "school" "hospital" "beach" "dungeon" "spaceship" 
           "castle" "apartment" "training" "date" "confession" "adventure")

ARCHETYPES=("vampire" "yandere" "tsundere" "kuudere" "mafia-boss" "demon" 
            "angel" "villain" "hero" "mentor")

RANDOM_URLS=""
COUNT=0

# Add 10 random roleplay pages
for i in {1..10}; do
    CHAR=${CHARACTERS[$RANDOM % ${#CHARACTERS[@]}]}
    SCENARIO=${SCENARIOS[$RANDOM % ${#SCENARIOS[@]}]}
    RANDOM_URLS="${RANDOM_URLS}\"${SITE_URL}/roleplay/${CHAR}/${SCENARIO}\","
    ((COUNT++))
done

# Add 5 random chat-with pages
for i in {1..5}; do
    ARCH=${ARCHETYPES[$RANDOM % ${#ARCHETYPES[@]}]}
    RANDOM_URLS="${RANDOM_URLS}\"${SITE_URL}/chat-with/${ARCH}\","
    ((COUNT++))
done

# Add 5 random [character]-ai-chat pages
for i in {1..5}; do
    CHAR=${CHARACTERS[$RANDOM % ${#CHARACTERS[@]}]}
    RANDOM_URLS="${RANDOM_URLS}\"${SITE_URL}/${CHAR}-ai-chat\","
    ((COUNT++))
done

RANDOM_URLS="${RANDOM_URLS%,}"

BATCH_PAYLOAD=$(cat <<EOF
{
    "host": "agentwood.xyz",
    "key": "${INDEXNOW_KEY}",
    "keyLocation": "${SITE_URL}/${INDEXNOW_KEY}.txt",
    "urlList": [${RANDOM_URLS}]
}
EOF
)

BATCH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$BATCH_PAYLOAD" \
    "https://api.indexnow.org/indexnow" 2>/dev/null || echo "error")

BATCH_STATUS=$(echo "$BATCH_RESPONSE" | tail -n1)
log "IndexNow rotating batch ($COUNT URLs): $BATCH_STATUS"

# 4. Summary
TOTAL_URLS=$((${#PRIORITY_PATHS[@]} + COUNT))
log "=== Indexing Run Complete ==="
log "Total URLs submitted: $TOTAL_URLS"
log "IndexNow Status Codes: 200=OK, 202=Accepted, 400=Bad request, 403=Key invalid, 422=URL invalid"
log ""

# Return success
exit 0
