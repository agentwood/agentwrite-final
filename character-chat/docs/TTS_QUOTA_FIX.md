# TTS Quota Issue - Resolution Guide

## Problem

The TTS (Text-to-Speech) feature is showing "quota exceeded" errors. This happens because:

1. **Gemini API Free Tier Limitation**: The free tier has **0 requests** for audio TTS models
2. **Model Requirements**: TTS requires `gemini-2.0-flash-exp-audio` or `gemini-2.5-flash-preview-tts` which are not available on the free tier

## Error Message

Users will see:
```
Audio error: TTS quota exceeded. Please check your API plan or try again later.
```

## Solutions

### Option 1: Upgrade Gemini API Plan (Recommended)

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Check your current plan and usage
3. Upgrade to a paid plan that includes TTS access
4. Verify your API key has the new quota

### Option 2: Use Alternative TTS Service

If Gemini TTS is not available, you can integrate:
- **Google Cloud Text-to-Speech API** (separate service)
- **ElevenLabs API** (high-quality voices)
- **OpenAI TTS API** (if you have access)

### Option 3: Disable TTS for Free Users

The app already handles quota errors gracefully:
- Text chat continues to work
- Voice button shows error but doesn't crash
- Users can still use all other features

## Current Status

- ✅ Error handling improved
- ✅ User-friendly error messages
- ✅ Graceful degradation (text chat still works)
- ⚠️ TTS requires paid Gemini API plan

## Testing

To test TTS once quota is available:

```bash
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test","voiceName":"Alex"}'
```

Expected response (when quota available):
```json
{
  "audio": "base64-encoded-audio-data",
  "format": "pcm",
  "sampleRate": 24000,
  "voiceUsed": "Alex"
}
```

## Notes

- The app will continue to work normally without TTS
- All other features (chat, character discovery, etc.) are unaffected
- Users can still interact with characters via text
- Voice features are a premium enhancement, not required for core functionality



