# Chatterbox TTS Server Setup Guide

This guide explains how to set up a self-hosted Chatterbox TTS server for the Agentwood voice system.

## Why Chatterbox?

| Provider | Monthly Cost (300 users × 10 msgs/day) |
|----------|----------------------------------------|
| ElevenLabs | ~$2,000-2,500/mo |
| **Chatterbox (self-hosted)** | **~$50-100/mo (GPU server)** |

## Requirements

- **GPU Server**: NVIDIA GPU with 8GB+ VRAM (RTX 3070 or better)
- **RAM**: 16GB minimum
- **Storage**: 10GB for model + reference audio
- **Docker**: With NVIDIA Container Toolkit

## Cloud GPU Options

| Provider | Cost | Notes |
|----------|------|-------|
| [RunPod](https://runpod.io) | ~$0.20-0.50/hr | On-demand GPUs |
| [Vast.ai](https://vast.ai) | ~$0.10-0.30/hr | Cheapest option |
| [Lambda Labs](https://lambdalabs.com) | ~$0.50/hr | Reliable |
| [AWS g4dn.xlarge](https://aws.amazon.com) | ~$0.52/hr | Enterprise |

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Pull the Chatterbox server image
docker pull ghcr.io/resemble-ai/chatterbox-server:latest

# Create reference audio directory
mkdir -p ./reference_audio

# Run with GPU support
docker run -d \
  --name chatterbox-tts \
  --gpus all \
  -p 8002:8002 \
  -v $(pwd)/reference_audio:/app/reference_audio \
  -e PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512 \
  ghcr.io/resemble-ai/chatterbox-server:latest
```

### Option 2: Manual Installation

```bash
# Clone the repo
git clone https://github.com/resemble-ai/chatterbox.git
cd chatterbox

# Install dependencies
pip install -r requirements.txt

# Start server
python -m chatterbox.server --host 0.0.0.0 --port 8002
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Chatterbox server URL (change to your GPU server IP)
CHATTERBOX_API_URL=http://localhost:8002

# Fallback: ElevenLabs (optional, for when Chatterbox is down)
ELEVENLABS_API_KEY=your_key_here
```

### Reference Audio

Each character needs a 5-10 second voice sample in the `reference_audio/` directory:

```
reference_audio/
├── dr_lucien_vale.wav      # Villain voice sample
├── maya_chen.wav           # Warm mentor sample
├── marcus_blaze.wav        # Energetic coach sample
└── eleanor_ashworth.wav    # British professor sample
```

**Tips for reference audio:**
- Use clear, high-quality recordings (44.1kHz, 16-bit)
- Remove background noise
- Include varied emotional range
- Duration: 5-15 seconds optimal

## API Endpoints

The Chatterbox server exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/synthesize` | POST | Generate speech |
| `/characters` | GET | List available characters |

### Example Request

```bash
curl -X POST http://localhost:8002/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Everything is proceeding exactly as planned.",
    "character_id": "dr_lucien_vale",
    "emotion": 0.35
  }'
```

## Verification

1. Check server health:
```bash
curl http://localhost:8002/health
# Expected: {"status": "ok", "configured": true}
```

2. Test synthesis:
```bash
curl http://localhost:8002/characters
# Expected: {"characters": ["dr_lucien_vale", ...]}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CUDA out of memory | Reduce batch size or use smaller model |
| Slow generation | Upgrade GPU or use Chatterbox Turbo model |
| No audio output | Check reference audio format (WAV, 16-bit) |
| Server unreachable | Verify firewall allows port 8002 |
