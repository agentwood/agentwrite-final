# FastMaya RunPod Deployment Guide

Deploy a FastMaya (Maya-1) TTS endpoint on RunPod Serverless.

## Prerequisites
- Docker Hub account (or any container registry)
- RunPod account with API access

## Build & Push Docker Image

```bash
cd runpod-fastmaya

# Build the image
docker build -t yourdockerhub/fastmaya-tts:latest .

# Push to registry
docker push yourdockerhub/fastmaya-tts:latest
```

## Create RunPod Serverless Endpoint

1. Go to [RunPod Serverless](https://www.runpod.io/console/serverless)
2. Click "New Endpoint"
3. Configure:
   - **Container Image:** `yourdockerhub/fastmaya-tts:latest`
   - **GPU Type:** L40S or A100 (24GB+ VRAM recommended)
   - **Max Workers:** 1 (or more for scaling)
   - **Idle Timeout:** 60 seconds (to avoid cold starts)
   - **Flash Boot:** Enable for persistent workers

4. Copy the **Endpoint ID** (e.g., `abc123xyz`)

## Update Environment Variables

Add to your `.env.local`:

```
RUNPOD_F5_ENDPOINT_ID=<your-new-endpoint-id>
```

## Test the Endpoint

```bash
curl -X POST https://api.runpod.ai/v2/<endpoint-id>/runsync \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Welcome to the game, team!",
      "voice_description": "Male, middle-aged, commanding Ghanaian motivational coach with a high-energy, rhythmic, and infectious West African accent."
    }
  }'
```

## Expected Output

```json
{
  "audio": "<base64 WAV>",
  "format": "wav",
  "sample_rate": 48000,
  "seed_used": 12345
}
```
