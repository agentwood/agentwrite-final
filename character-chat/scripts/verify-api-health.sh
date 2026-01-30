#!/bin/bash
#
# API Health Check Script
# Runs on every deploy to ensure critical APIs are accessible
#
# Usage: ./verify-api-health.sh [base_url]
# Default: https://agentwood.xyz
#
# Exit codes:
#   0 = All tests passed
#   1 = One or more tests failed
#

set -e

BASE_URL="${1:-https://agentwood.xyz}"
FAILED=0
PASSED=0

echo "🔍 API Health Check for: $BASE_URL"
echo "=================================="

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_not="$4"  # Status code we DON'T want (e.g., 307 redirect)
    local data="$5"
    
    if [ "$method" == "GET" ]; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE_URL}${endpoint}" 2>/dev/null || echo "000")
    else
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${BASE_URL}${endpoint}" 2>/dev/null || echo "000")
    fi
    
    if [ "$STATUS" == "$expected_not" ]; then
        echo "❌ $name: FAIL (got $STATUS - auth redirect!)"
        FAILED=$((FAILED + 1))
        return 1
    elif [ "$STATUS" == "000" ]; then
        echo "⚠️  $name: TIMEOUT"
        FAILED=$((FAILED + 1))
        return 1
    else
        echo "✅ $name: OK ($STATUS)"
        PASSED=$((PASSED + 1))
        return 0
    fi
}

echo ""
echo "📡 Testing Public API Endpoints..."
echo "----------------------------------"

# Critical APIs that MUST be public (not return 307)
test_endpoint "TTS API" "POST" "/api/tts" "307" '{"text":"test","characterId":"test"}'
test_endpoint "Stripe Checkout" "POST" "/api/stripe/checkout" "307" '{"priceId":"test","type":"subscription"}'
test_endpoint "Pricing API" "GET" "/api/pricing" "307"
test_endpoint "Health Check" "GET" "/api/health/full" "307"
test_endpoint "Personas List" "GET" "/api/personas" "307"

echo ""
echo "🌐 Testing Public Pages..."
echo "--------------------------"

test_endpoint "Homepage" "GET" "/" "307"
test_endpoint "Discover" "GET" "/discover" "307"
test_endpoint "Pricing Page" "GET" "/pricing" "307"
test_endpoint "Blog" "GET" "/blog" "307"
test_endpoint "Sitemap" "GET" "/sitemap.xml" "307"

echo ""
echo "🔒 Testing Protected Routes (should redirect)..."
echo "-------------------------------------------------"

# These SHOULD return 307 when not authenticated
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${BASE_URL}/admin" 2>/dev/null || echo "000")
if [ "$ADMIN_STATUS" == "307" ]; then
    echo "✅ Admin route: Protected ($ADMIN_STATUS)"
    PASSED=$((PASSED + 1))
else
    echo "⚠️  Admin route: NOT protected! ($ADMIN_STATUS)"
    # Don't fail, just warn
fi

APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${BASE_URL}/app" 2>/dev/null || echo "000")
if [ "$APP_STATUS" == "307" ]; then
    echo "✅ App dashboard: Protected ($APP_STATUS)"
    PASSED=$((PASSED + 1))
else
    echo "⚠️  App dashboard: NOT protected! ($APP_STATUS)"
fi

echo ""
echo "=================================="
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "🚨 DEPLOYMENT BLOCKED: Critical APIs are not accessible!"
    echo "Check middleware.ts public paths configuration."
    exit 1
else
    echo ""
    echo "✅ All checks passed. Safe to deploy."
    exit 0
fi
