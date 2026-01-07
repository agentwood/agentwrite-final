# RunPod Serverless Chatterbox TTS

This folder contains the RunPod serverless handler for Chatterbox TTS.

## Deploy to RunPod

1. Push this folder to a GitHub repo
2. In RunPod Serverless, select "Import GitHub Repository"
3. Select this repo
4. Deploy

## API Usage

Once deployed, call your endpoint:

```bash
curl -X POST https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/runsync \
  -H "Authorization: Bearer YOUR_RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": {"text": "Hello world!", "exaggeration": 0.5}}'
```
