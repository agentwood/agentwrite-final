# Tier 1 Quota Issue Investigation

## Current Situation
- **API Key Status**: Tier 1 (confirmed by user)
- **Expected Limit**: 10,000+ requests/day
- **Actual Error**: `"limit: 0"` for `generate_requests_per_model_per_day`
- **Model**: `gemini-2.5-flash`

## Recent Google Changes (December 7, 2025)

Google recently reduced Tier 1 quotas:
- **Gemini 2.5 Flash**: Reduced from 5,000 to **1,000 requests/day** for Tier 1
- This is a significant reduction from previous expectations

## The "Limit: 0" Issue

The error showing `"limit: 0"` typically means:

1. **Daily quota exhausted** - You've used all 1,000 requests for today
2. **Quota not enabled** - The specific quota metric needs to be enabled in Google Cloud Console
3. **Billing account issue** - Billing account not properly linked or inactive

## How to Fix

### Step 1: Check Current Usage
1. Go to: https://aistudio.google.com/
2. Settings → Usage & Limits
3. Check your daily usage for `gemini-2.5-flash`

### Step 2: Enable Quota in Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Search for: `generate_requests_per_model_per_day`
3. Filter by: `gemini-2.5-flash` model
4. Check if quota is enabled
5. If showing 0, click "Edit Quotas" → Request increase

### Step 3: Verify Billing Account
1. Go to: https://console.cloud.google.com/billing
2. Ensure billing account is:
   - Active
   - Linked to your project
   - Has payment method on file

### Step 4: Request Quota Increase (if needed)
1. In Google Cloud Console → Quotas
2. Find: `Generate requests per model per day`
3. Select: `gemini-2.5-flash`
4. Click "Edit Quotas"
5. Request increase to 10,000+ (or your needed amount)
6. Justification: "Running automated voice-character matching audit (4,500 API calls needed)"

## Current Tier 1 Limits (After Dec 7, 2025 Changes)

- **Gemini 2.5 Flash**: 1,000 requests/day (Tier 1)
- **Gemini 2.5 Pro**: 500 requests/day (Tier 1)
- **Gemini 3 Pro Preview**: 200 requests/day (Tier 1)

## To Get Higher Limits

### Tier 2 Requirements:
- Total spend > $250
- At least 30 days since successful payment
- Request upgrade via: https://ai.google.dev/gemini-api/docs/quota

### Tier 3 Requirements:
- Total spend > $1,000
- At least 30 days since successful payment

## For Our Audit System

**Current Need**: ~4,500 API calls
**Tier 1 Limit**: 1,000 requests/day
**Solution Options**:

1. **Wait 4-5 days** - Spread audit across multiple days
2. **Request quota increase** - Request 10,000+ for this specific use case
3. **Reduce scope** - Evaluate fewer combinations (e.g., top 10 voices per character = 1,500 calls)
4. **Upgrade to Tier 2** - If you meet spending requirements

## Quick Check Commands

```bash
# Test if API is working
cd character-chat
npx tsx scripts/test-quota.ts

# Check current evaluation progress
jq 'length' scripts/voice-evaluations.json
```

## References
- [Google AI Studio](https://aistudio.google.com/)
- [Google Cloud Console Quotas](https://console.cloud.google.com/apis/quotas)
- [Gemini API Quota Docs](https://ai.google.dev/gemini-api/docs/quota)



