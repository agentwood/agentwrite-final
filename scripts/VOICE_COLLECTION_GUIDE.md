# Voice Collection Quick Start Guide

Two automated scripts to finish Chatterbox setup in **30 minutes**.

---

## Scripts Created

### 1. `collect-voices.sh` - Automated Voice Collection

**What it does:**
- Searches YouTube for each character
- Shows you top 5 results
- Downloads your chosen video
- Extracts 10-second clip
- Converts to correct format (24kHz, mono WAV)
- Lets you preview before saving
- Copies to Chatterbox directory

**Usage:**
```bash
cd /Users/akeemojuko/Downloads/agentwrite-final
./scripts/collect-voices.sh
```

**Interactive flow:**
```
Character: asha (Indian/Kenyan accent, female)
───────────────────────────────────────────────
Finding videos...

1) Kenyan Wildlife Guide Interview (15:30)
2) African Conservation Stories (22:45)
3) Indian English Accent Examples (8:15)

Your choice: 2

Downloading...
✅ Downloaded

Extract 10 seconds starting from which second?
Tip: Skip intro music, find clear speech section
Start time (seconds): 120

Extracting 10-second clip...
✅ Created asha.wav

Playing preview...
[Audio plays]

Keep this sample? (y/n): y
✅ asha complete!
```

### 2. `test-voices.sh` - Voice Testing

**What it does:**
- Checks Chatterbox server status
- Lists available characters
- Generates test audio for each
- Saves to timestamped folder
- Optionally plays all samples

**Usage:**
```bash
./scripts/test-voices.sh
```

**Output:**
```
🎙️  Chatterbox Voice Tester
==========================

✅ Server is running

Available characters:
  • asha
  • eamon
  • viktor

🎬 Generating test audio...

Testing asha... ✅
Testing eamon... ✅
Testing viktor... ✅

✨ Test complete!

Results saved to: voice_tests_20251228_175900/
  ✅ asha.wav (245KB, 8.2s)
  ✅ eamon.wav (238KB, 8.0s)
  ✅ viktor.wav (241KB, 8.1s)

Play all voices now? (y/n):
```

---

## Quick Start (30 Minutes)

### Step 1: Collect Voices (20 minutes)

```bash
cd /Users/akeemojuko/Downloads/agentwrite-final
./scripts/collect-voices.sh
```

**Tips:**
- Look for clear, single-speaker audio
- Choose videos with authentic accents
- Skip intro/music, find dialogue sections
- Preview before keeping
- You can retry if quality is poor

**Recommended start times:**
- Interviews: 60-120 seconds (after intro)
- Podcasts: 30-60 seconds (skip intro music)
- Talks: 30-90 seconds (skip intro/applause)

### Step 2: Test Voices (5 minutes)

```bash
./scripts/test-voices.sh
```

This generates test audio for all collected characters.

### Step 3: Verify in App (5 minutes)

```bash
# App should already be running
# Visit: http://localhost:3000

# 1. Chat with Asha
# 2. Click "Play" on her response
# 3. Verify accent sounds authentic
# 4. Repeat for other characters
```

---

## Manual Alternative

If YouTube search doesn't work well:

### Find Videos Manually

```bash
# Open YouTube in browser
https://youtube.com/results?search_query=kenyan+woman+english+interview

# Copy video URL
# Example: https://youtube.com/watch?v=abc123

# Download manually
yt-dlp -x --audio-format wav "https://youtube.com/watch?v=abc123"

# Process
ffmpeg -i "downloaded.wav" -ss 90 -t 10 -ar 24000 -ac 1 asha.wav

# Copy to Chatterbox
cp asha.wav services/chatterbox/reference_audio/
```

---

## Recommended Sources

### Asha (Kenyan/Indian female)
- Search: "Kenyan woman interview conservation"
- Alternative: "Indian female English speaker"

### Eamon (Irish male)
- Search: "Irish man podcast interview"
- Alternative: "Irish accent English speaker"

### Viktor (Russian male)
- Search: "Russian man English interview"
- Alternative: "Russian accent English speaker tech"

### Tomasz (Polish male)
- Search: "Polish man English interview"
- Alternative: "Polish accent English speaker"

### Rajiv (Indian male)
- Search: "Indian man tech interview English"
- Alternative: "Indian English speaker entrepreneur"

---

## Quality Checklist

Before keeping a sample:

- [ ] **Clear audio** - No background noise/music
- [ ] **Single speaker** - Not multiple overlapping voices
- [ ] **Natural tone** - Conversational, not shouting
- [ ] **Good accent** - Authentic, not exaggerated
- [ ] **10+ seconds** - Enough content
- [ ] **Good quality** - Not phone recording or heavily compressed

---

## Troubleshooting

### YouTube download fails
```bash
# Update yt-dlp
brew upgrade yt-dlp

# Try different video
# Or download manually from browser
```

### Audio sounds distorted
```bash
# Check source quality
ffprobe reference_audio/asha.wav

# Should show:
# - Sample rate: 24000 Hz ✅
# - Channels: 1 (mono) ✅
# - Duration: ~10 seconds ✅
```

### Chatterbox server not found
```bash
# Start the server
cd services/chatterbox
source venv/bin/activate
python server.py

# Should see:
# INFO: Uvicorn running on http://0.0.0.0:8002
```

### Voice sounds robotic
```bash
# Try different reference audio with:
# - More natural speech
# - Less background noise
# - Better accent clarity

# Or adjust emotion parameter (in test-voices.sh)
# Change "emotion": 0.7 to 0.8 or 0.9
```

---

## Time Estimates

| Task | With Script | Manual |
|------|-------------|--------|
| Find videos | 5 min (auto search) | 10 min |
| Download | 5 min (automated) | 10 min |
| Extract clips | 5 min (automated) | 15 min |
| Test & verify | 10 min | 15 min |
| **TOTAL** | **~25 min** | **~50 min** |

---

## Next Steps After Collection

1. **Test in app** - Chat with each character
2. **Compare quality** - Listen vs. original ElevenLabs (if available)
3. **Adjust emotion** - Tweak if voices sound too flat/dramatic
4. **Remove ElevenLabs** - Delete API key from environment
5. **Monitor costs** - Confirm $0/month 🎉

---

## Commands Summary

```bash
# Collect voices (interactive)
./scripts/collect-voices.sh

# Test all voices
./scripts/test-voices.sh

# Check server health
curl http://localhost:8002/health

# List available characters
curl http://localhost:8002/characters

# Test single character
curl -X POST http://localhost:8002/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!", "character_id": "asha", "emotion": 0.7}' \
  --output test.wav
```

---

Ready to collect voices! Run `./scripts/collect-voices.sh` to start. 🎙️
