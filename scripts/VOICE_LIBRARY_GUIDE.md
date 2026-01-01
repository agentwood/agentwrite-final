# Voice Library Builder - Quick Start

## What This Does

Downloads 300+ voice samples from HuggingFace TTS platforms and matches them to your characters.

## Mac TTS Info

**Mac has 177 voices!** - Way more than 30, includes many languages and accents.

However, HuggingFace platforms offer:
- ✅ More natural sounding voices
- ✅ Better accent variety
- ✅ Voice cloning capabilities
- ✅ Emotional control

## Step 1: Build Voice Library (10-30 minutes)

```bash
cd /Users/akeemojuko/Downloads/agentwrite-final/scripts

# Install dependencies
pip3 install -r requirements.txt

# Download 300 voice samples
python3 build_voice_library.py

# Or specify custom count
python3 build_voice_library.py 500
```

**What it downloads:**
- **Chatterbox**: ~150 samples (10 languages × 4 emotions × ~3 texts)
- **XTTS**: ~85 samples (17 languages × 5 texts)
- **Bark**: ~65+ samples (100+ speaker presets)

**Time estimate:** 10-30 minutes depending on API rate limits

## Step 2: Match Voices to Characters (1 minute)

```bash
python3 match_voices_to_characters.py
```

This will:
- Analyze all downloaded voices
- Match them to character profiles (accent + gender)
- Generate `voice_matches.json` with top 5 matches per character

## Step 3: Review and Install

```bash
# View matches
cat voice_matches.json

# Listen to top match for Asha
open voice_library/[filename from matches]

# Copy best matches to Chatterbox
cp voice_library/0042_chatterbox_hi_e7.wav \
   services/chatterbox/reference_audio/asha.wav
```

## Alternative: Quick Test with Mac TTS

If you want to test immediately:

```bash
# List all Mac voices
say -v '?'

# Test Indian accent
say -v "Veena" "Hello, my name is Asha" -o asha_test.aiff
ffmpeg -i asha_test.aiff -ar 24000 -ac 1 asha.wav

# Test Irish
say -v "Moira" "Top of the morning" -o eamon_test.aiff
ffmpeg -i eamon_test.aiff -ar 24000 -ac 1 eamon.wav

# Test Russian
say -v "Yuri" "Hello from Moscow" -o viktor_test.aiff
ffmpeg -i viktor_test.aiff -ar 24000 -ac 1 viktor.wav
```

## Workflow

```
1. Build Library
   └─> python3 build_voice_library.py
       └─> Downloads 300+ samples to voice_library/

2. Match Voices
   └─> python3 match_voices_to_characters.py
       └─> Generates voice_matches.json

3. Review & Select
   └─> Listen to top matches
       └─> Pick best voice for each character

4. Install
   └─> Copy to services/chatterbox/reference_audio/
       └─> Test with ./scripts/test-voices.sh

5. Verify
   └─> Chat with characters in app
       └─> Adjust if needed
```

## Expected Output

**voice_library/ structure:**
```
voice_library/
├── 0001_chatterbox_en_e3.wav
├── 0002_chatterbox_en_e5.wav
├── 0003_chatterbox_es_e7.wav
├── 0042_chatterbox_hi_e7.wav  ← Indian accent
├── 0095_xtts_ru.wav            ← Russian accent
├── 0127_bark_v2_ga_speaker_3.wav ← Irish
└── metadata.json
```

**voice_matches.json:**
```json
{
  "asha": {
    "character": "Asha",
    "top_matches": [
      {
        "file": "0042_chatterbox_hi_e7.wav",
        "score": 18,
        "model": "chatterbox",
        "language": "hi"
      }
    ]
  }
}
```

## Troubleshooting

### API Rate Limits

If you hit rate limits:
```bash
# Get HuggingFace API token (free)
# Visit: https://huggingface.co/settings/tokens

# Set environment variable
export HF_API_TOKEN="hf_your_token_here"

# Re-run
python3 build_voice_library.py
```

### Downloads Failing

- Check internet connection
- Try smaller batch: `python3 build_voice_library.py 50`
- Use Mac TTS as fallback (177 voices available)

## Time Estimates

| Task | Time |
|------|------|
| Download 300 samples | 10-30 min |
| Match voices | 1 min |
| Review top matches | 5-10 min |
| Install & test | 5 min |
| **TOTAL** | **20-45 min** |

## Next Steps

After building library:
1. Match voices to characters
2. Test top 3-5 voices per character
3. Pick best match
4. Copy to Chatterbox
5. Test in app

Ready to start? Run:
```bash
python3 scripts/build_voice_library.py
```
