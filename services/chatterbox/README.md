# Chatterbox TTS Service

Free, open-source TTS with state-of-the-art voice cloning.

**Official Repository:** [resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox)

## Features

- ✅ **Zero Cost** - Fully open-source, runs locally
- ✅ **High Quality** - Outperforms ElevenLabs in blind tests
- ✅ **Voice Cloning** - 5-10 second reference clips
- ✅ **Real-time** - <200ms latency
- ✅ **Multilingual** - 23 languages supported
- ✅ **Paralinguistic Tags** - [laugh], [chuckle], [cough]
- ✅ **Emotion Control** - Adjustable expressiveness

## Installation

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Usage

### 1. Add Reference Audio

Place 10-second WAV files in `reference_audio/`:
- `asha.wav` - Indian accent, female
- `eamon.wav` - Irish accent, male
- `viktor.wav` - Russian accent, male
- `tomasz.wav` - Polish accent, male
- `rajiv.wav` - Indian accent, male

**Audio Requirements:**
- Format: WAV, mono, 24kHz (or 16kHz)
- Duration: 5-10 seconds minimum
- Quality: Clear speech, minimal background noise

### 2. Test the Service

```bash
python chatterbox_service.py
```

### 3. Generate Speech

```python
from chatterbox_service import get_chatterbox_service

service = get_chatterbox_service()

result = service.synthesize(
    text="Hello! How are you today?",
    character_id="asha",
    emotion=0.7  # 0.0 = monotone, 1.0 = dramatic
)

if result:
    with open("output.wav", "wb") as f:
        f.write(result['audio'])
```

## Paralinguistic Tags

Enhance realism with built-in tags:

```python
text = "That's hilarious [laugh]! I can't believe it [chuckle]."

result = service.synthesize(text, "eamon", emotion=0.8)
```

Available tags:
- `[laugh]` - Natural laughter
- `[chuckle]` - Light chuckle
- `[cough]` - Cough sound

## Emotion Control

Adjust expressiveness with `emotion` parameter:

- `0.0` - Monotone, neutral
- `0.5` - Natural conversation (default)
- `0.7` - Expressive, animated
- `1.0` - Dramatic, highly expressive

## Troubleshooting

**Import Error:**
```bash
pip install chatterbox-tts torch torchaudio
```

**CUDA Issues (GPU):**
```bash
# Use CPU instead
service = ChatterboxService(device="cpu")
```

**No Reference Audio:**
Add `.wav` files to `reference_audio/` directory.

## Performance

- **CPU**: ~2-5 seconds per sentence
- **GPU**: <200ms per sentence (real-time)

Recommended: NVIDIA GPU with 4GB+ VRAM for production use.
