# Audio Troubleshooting Guide

## Why Audio Might Not Work Locally

Audio **should work locally** if properly configured. Here's what you need:

### 1. **GEMINI_API_KEY Required**

The TTS (Text-to-Speech) feature requires a Google Gemini API key:

```bash
# Check if .env file exists and has the key
cd character-chat
cat .env | grep GEMINI_API_KEY
```

**If missing:**
1. Get your API key from: https://aistudio.google.com/apikey
2. Add to `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Restart the dev server: `npm run dev`

### 2. **Voice Button Not Visible**

The voice button only appears when:
- Voice is enabled in the sidebar (click "Voice" menu item)
- You're viewing an assistant message
- The message has text to speak

**To enable:**
1. Open a chat with a character
2. Click "Voice" in the right sidebar
3. The voice button should appear on assistant messages

### 3. **Browser Audio Permissions**

Modern browsers require user interaction before playing audio:
- ✅ Clicking the voice button = user interaction (should work)
- ❌ Auto-playing on page load = blocked (expected behavior)

### 4. **Check Console for Errors**

Open browser DevTools (F12) and check:
- **Console tab**: Look for errors like:
  - "GEMINI_API_KEY not set"
  - "Failed to generate TTS"
  - Audio playback errors
- **Network tab**: Check if `/api/tts` requests are:
  - ✅ Returning 200 (success)
  - ❌ Returning 400/500 (error)

### 5. **Test TTS API Directly**

Test the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voiceName": "Puck"}'
```

**Expected response:**
```json
{
  "audio": "base64_encoded_audio_data...",
  "format": "pcm",
  "sampleRate": 24000
}
```

**If you get an error:**
- Check `.env` has `GEMINI_API_KEY`
- Verify the API key is valid
- Check server logs for detailed error messages

### 6. **Common Issues**

| Issue | Solution |
|-------|----------|
| "GEMINI_API_KEY not set" | Add key to `.env` and restart server |
| Voice button not showing | Enable voice in sidebar first |
| Audio plays but no sound | Check browser volume, system audio |
| "Failed to generate TTS" | Check API key is valid, check server logs |
| CORS errors | Shouldn't happen locally, check Next.js config |

### 7. **Quick Diagnostic**

Run this in your browser console on a chat page:

```javascript
// Test if API key is configured (server-side only)
// Instead, test the TTS endpoint:
fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Test', voiceName: 'Puck' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected:** Returns audio data or error message
**If error:** Check server terminal for detailed error

### 8. **Audio Call (Live API)**

The audio call feature (`/call/[id]`) requires:
- `GEMINI_API_KEY` in `.env`
- Browser microphone permissions
- WebSocket support (all modern browsers)

**To test:**
1. Navigate to `/call/[character-id]`
2. Allow microphone access when prompted
3. Click "Start Call"
4. Speak into microphone

---

## Summary

**Audio SHOULD work locally if:**
- ✅ `GEMINI_API_KEY` is set in `.env`
- ✅ Dev server restarted after adding key
- ✅ Voice is enabled in sidebar
- ✅ Browser allows audio playback (user interaction)

**If still not working:**
1. Check browser console for errors
2. Check server terminal for API errors
3. Verify API key is valid at https://aistudio.google.com/apikey
4. Test TTS endpoint directly with curl



