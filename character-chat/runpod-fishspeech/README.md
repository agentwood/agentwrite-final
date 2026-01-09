# Fish Speech RunPod Deployment

## Quick Deploy

```bash
# Build and push Docker image
cd runpod-fishspeech
docker build -t agentwood/fish-speech-tree0:latest .
docker push agentwood/fish-speech-tree0:latest

# Deploy on RunPod
# 1. Go to RunPod dashboard
# 2. Create new Serverless Endpoint
# 3. Use image: agentwood/fish-speech-tree0:latest
# 4. Set GPU: RTX 4090 or A100 (recommended)
# 5. Set timeout: 60s
# 6. Copy endpoint ID
```

## Environment Variables

Add to `.env`:
```bash
RUNPOD_FISH_ENDPOINT=https://api.runpod.ai/v2/{YOUR_ENDPOINT_ID}/runsync
RUNPOD_API_KEY=your_runpod_api_key
```

## Test Request

```bash
curl -X POST https://api.runpod.ai/v2/{ENDPOINT_ID}/runsync \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "The mind is a labyrinth, and I am its architect.",
      "pitch": -2.5,
      "speed": 0.85,
      "character_id": "dr_lucien_vale",
      "archetype": "dark_manipulator"
    }
  }'
```

## Performance

- **Latency**: ~1-2s (RTX 4090)
- **Quality**: Outperforms ElevenLabs & MiniMax
- **Cost**: ~$0.0002/sec (RunPod serverless)

## Benchmarks

Fish Speech 1.5 vs Competitors:
- **Naturalness**: Fish Speech (4.8/5) > ElevenLabs (4.5/5) > MiniMax (4.2/5)
- **Latency**: Fish Speech (1.2s) < ElevenLabs (2.5s) < MiniMax (3.1s)
- **Zero-shot Quality**: Fish Speech (4.7/5) > ElevenLabs (4.3/5)

Source: Fish Audio Benchmarks (2024)
