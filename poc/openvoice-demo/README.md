# OpenVoice POC Demo

This directory contains the proof-of-concept setup for testing OpenVoice before full migration.

## Overview

This POC validates OpenVoice technology with demos before committing to full migration. It tests:
- Voice cloning quality
- Synthesis speed/latency  
- Audio format compatibility
- Integration with Next.js app

## Quick Start

### 1. Generate Test Reference Audio

First, generate 3-6 second reference audio samples for test characters using Gemini TTS:

```bash
cd character-chat
npx tsx ../poc/openvoice-demo/generate-reference-audio.ts
```

This creates reference audio files in `sample-reference-audio/` for 5 test characters.

### 2. Set Up OpenVoice

**Option A: Using Docker (Recommended)**
```bash
cd poc/openvoice-demo
docker-compose up -d
```

**Option B: Manual Setup**
```bash
cd poc/openvoice-demo
bash setup-openvoice.sh
# Follow OpenVoice GitHub instructions:
# https://github.com/myshell-ai/OpenVoice
```

### 3. Test Voice Cloning

```bash
cd poc/openvoice-demo
python test-clone.py
```

### 4. Test Synthesis

```bash
cd poc/openvoice-demo
python test-synthesize.py
```

### 5. Test API Integration

**Start FastAPI server:**
```bash
cd poc/openvoice-demo
python server.py
```

**Test from Next.js:**
```bash
# Health check
curl http://localhost:8000/health

# Or use the test endpoint
curl http://localhost:3000/api/poc/openvoice-test
```

### 6. Quality Comparison

Compare OpenVoice vs Gemini TTS:
```bash
cd poc/openvoice-demo
python compare-quality.py
```

## File Structure

```
poc/openvoice-demo/
├── Dockerfile                 # OpenVoice container setup
├── docker-compose.yml         # Local development setup
├── requirements.txt          # Python dependencies
├── server.py                 # FastAPI REST API wrapper
├── test-clone.py             # Voice cloning test script
├── test-synthesize.py        # Synthesis test script
├── compare-quality.py        # Quality comparison script
├── generate-reference-audio.ts  # Generate test reference audio
├── setup-openvoice.sh        # Setup helper script
├── sample-reference-audio/   # Test reference audio files
│   ├── test-1.wav
│   ├── test-2.wav
│   └── ...
└── output/                   # Generated test audio outputs
    └── quality-comparison/   # Comparison results
```

## Test Characters

The POC uses 5 test characters with different voice characteristics:

1. **Test Character 1** - Male, Professional (voice: kore)
2. **Test Character 2** - Female, Friendly (voice: aoede)
3. **Test Character 3** - Male, Energetic (voice: charon)
4. **Test Character 4** - Female, Calm (voice: pulcherrima)
5. **Test Character 5** - Male, Authoritative (voice: rasalgethi)

## API Endpoints

### FastAPI Server (localhost:8000)

- `GET /health` - Health check
- `POST /clone` - Clone voice from reference audio
- `POST /synthesize` - Generate speech with cloned voice
- `POST /batch` - Batch synthesis

### Next.js Test Endpoint

- `GET /api/poc/openvoice-test` - Test OpenVoice connection
- `POST /api/poc/openvoice-test` - Test synthesis

## Environment Variables

```env
# POC Phase
OPENVOICE_LOCAL_URL=http://localhost:8000

# Production Phase (after POC)
OPENVOICE_API_URL=https://your-openvoice-server.com
```

## Next Steps

After POC validation:

1. ✅ **If POC successful** → Proceed to Phase 1 (Full Migration)
   - Set up OpenVoice on cloud
   - Generate base voices for all 75 characters
   - Integrate with production API

2. ❌ **If issues found** → Evaluate alternatives
   - Consider Coqui TTS/XTTS
   - Review quality/performance trade-offs
   - Adjust implementation plan

## Troubleshooting

**OpenVoice not initializing:**
- Check that model checkpoints are downloaded to `./checkpoints/`
- Verify Python dependencies are installed
- See OpenVoice GitHub for setup: https://github.com/myshell-ai/OpenVoice

**Reference audio not found:**
- Run `generate-reference-audio.ts` first
- Check `sample-reference-audio/` directory exists

**API connection errors:**
- Ensure FastAPI server is running: `python server.py`
- Check `OPENVOICE_LOCAL_URL` environment variable
- Verify CORS settings in `server.py`

