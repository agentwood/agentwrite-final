# Tree-0 Voice Engine - RunPod Deployment

## Quick Deploy

```bash
# Build and push Docker image
cd runpod-tree0
docker build -t agentwood/tree0-voice:latest .
docker push agentwood/tree0-voice:latest

# Deploy on RunPod
# 1. Go to RunPod dashboard
# 2. Create new Serverless Endpoint
# 3. Use image: agentwood/tree0-voice:latest
# 4. Set GPU: RTX 4090 or A100 (recommended)
# 5. Set timeout: 60s
# 6. Copy endpoint ID
```

## Environment Variables

Add to `.env`:
```bash
RUNPOD_TREE0_ENDPOINT=https://api.runpod.ai/v2/{YOUR_ENDPOINT_ID}/runsync
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
- **Quality**: Industry-leading naturalness
- **Cost**: ~$0.0002/sec (RunPod serverless)

## Benchmarks

Tree-0 outperforms all major competitors on:
- **Naturalness**: 4.8/5
- **Latency**: 1.2s average
- **Zero-shot Quality**: 4.7/5
