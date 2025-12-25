# How to Increase Google Gemini API Quota

## Current Issue
The audit system is hitting daily quota limits: `"limit: 0" for "generate_requests_per_model_per_day"`

## Option 1: Request Quota Increase (Recommended)

### Via Google AI Studio (Easiest)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click on your profile → **Settings** or **API Keys**
3. Check your current usage and limits
4. Look for "Request quota increase" or "Upgrade plan" option
5. Fill out the form explaining your use case (voice audit system for character matching)

### Via Google Cloud Console (More Control)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** → **Quotas**
3. Search for: `Generative Language API` or `gemini`
4. Filter by:
   - **Metric**: `generate_requests_per_model_per_day`
   - **Service**: `Generative Language API`
5. Select the quota → Click **Edit Quotas**
6. Request increase (e.g., from 0 to 50,000+ requests/day)
7. Provide justification:
   - "Running automated voice-character matching audit system"
   - "Need to evaluate 900 character-voice combinations with 5 AI evaluators"
   - "Total: ~4,500 API calls per audit run"

### Typical Quota Tiers
- **Free Tier**: Usually 0-1,500 requests/day
- **Paid Tier**: Can request 10,000-100,000+ requests/day
- **Enterprise**: Custom limits

## Option 2: Use Multiple API Keys

If you have multiple API keys, we can rotate them:

1. Add multiple keys to `.env`:
   ```bash
   GEMINI_API_KEY_1=key1_here
   GEMINI_API_KEY_2=key2_here
   GEMINI_API_KEY_3=key3_here
   ```

2. The system will automatically rotate between them when one hits quota

## Option 3: Wait for Daily Reset

- Daily quotas typically reset at **midnight UTC**
- Check when your quota resets in Google Cloud Console
- The audit can resume automatically after reset

## Option 4: Reduce Scope (Temporary)

Instead of evaluating all 30 voices for each character:
- Evaluate only top 10 most promising voices per character
- Reduces from 900 to 300 evaluations (1,500 API calls instead of 4,500)

## Checking Current Quota Status

1. **Google AI Studio**: https://aistudio.google.com/ → Check usage dashboard
2. **Google Cloud Console**: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
3. **API Usage Page**: https://ai.dev/usage?tab=rate-limit

## Recommended Action

1. **Immediate**: Request quota increase via Google AI Studio (fastest)
2. **Short-term**: Wait for daily reset if increase takes time
3. **Long-term**: Upgrade to paid tier for higher limits

## Contact Support

If quota increase requests are taking too long:
- Google AI Studio Support: Check help section in AI Studio
- Google Cloud Support: https://cloud.google.com/support



