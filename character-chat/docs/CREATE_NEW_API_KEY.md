# Create New Gemini API Key - Step by Step

## Problem
Your current API key is tied to a Google Cloud Project that requires permissions you don't have. We need to create a new key under your own account.

## Solution: Create New API Key in Google AI Studio

### Step 1: Go to Google AI Studio
1. Visit: **https://aistudio.google.com/**
2. Sign in with your Google account (the one you want to use)

### Step 2: Create API Key
1. Click **"Get API Key"** button (top right)
2. Select **"Create API key in new project"** (recommended)
   - OR select an existing project if you have one
3. Click **"Create API key in Google Cloud"**
4. Copy the new API key (it will look like: `AIzaSy...`)

### Step 3: Update Your .env File
1. Open: `character-chat/.env`
2. Find the line: `GEMINI_API_KEY=...`
3. Replace the old key with your new key:
   ```
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```
4. Save the file

### Step 4: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd character-chat && npm run dev
```

### Step 5: Upgrade Your Plan (Optional)
1. Still in Google AI Studio
2. Check your usage/quota
3. Upgrade your plan if needed for TTS access
4. The new key will have the upgraded quota

## Benefits of New Key
- ✅ Full control over your API key
- ✅ Can upgrade plan without permission issues
- ✅ Owned by your Google account
- ✅ No GCP project permission conflicts

## Verify It Works
After updating, test the API:
```bash
cd character-chat
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Test","voiceName":"Alex"}'
```

If it works, you'll get audio data back. If quota is still exceeded, upgrade your plan in Google AI Studio.




