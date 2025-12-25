# OpenVoice Production Server

Production FastAPI server for OpenVoice voice cloning and text-to-speech synthesis.

## Setup

### 1. Prerequisites

- Docker and Docker Compose
- OpenVoice model checkpoints (download from [OpenVoice GitHub](https://github.com/myshell-ai/OpenVoice))
- Python 3.10+ (for local development)

### 2. Download Model Checkpoints

Place OpenVoice model checkpoints in `./checkpoints/` directory:

```bash
mkdir -p checkpoints
# Download models from OpenVoice repository
# See: https://github.com/myshell-ai/OpenVoice
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run with Docker

```bash
docker-compose up -d
```

### 5. Verify

```bash
curl http://localhost:8000/health
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "openvoice_ready": true,
  "version": "1.0.0"
}
```

### `POST /clone`

Clone voice from reference audio.

**Request:**
- `reference_audio`: Audio file (WAV, MP3) - 3-6 seconds

**Response:**
```json
{
  "voice_id": "abc123...",
  "message": "Voice cloned successfully"
}
```

### `POST /synthesize`

Synthesize speech from text.

**Request:**
```json
{
  "text": "Hello, this is a test.",
  "voice_id": "abc123...",
  "speed": 1.0,
  "tone": "professional",
  "emotion": "neutral"
}
```

**Response:**
```json
{
  "audio_base64": "base64_encoded_pcm_audio",
  "sample_rate": 24000,
  "format": "pcm",
  "duration": 2.5
}
```

### `POST /batch`

Batch synthesize multiple texts.

**Request:**
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"],
  "voice_id": "abc123...",
  "speed": 1.0
}
```

## Cloud Deployment

### AWS ECS

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Deploy to ECS cluster

### GCP Cloud Run

```bash
gcloud run deploy openvoice \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name openvoice \
  --image myregistry.azurecr.io/openvoice:latest \
  --dns-name-label openvoice \
  --ports 8000
```

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

## Monitoring

- Health checks: `/health` endpoint
- Logs: Check `./logs/` directory or Docker logs
- Metrics: Add Prometheus/metrics endpoint if needed

## Troubleshooting

**OpenVoice not initializing:**
- Check that model checkpoints are in `./checkpoints/`
- Verify OpenVoice repository is properly set up
- Check server logs for initialization errors

**CORS errors:**
- Update `ALLOWED_ORIGINS` in `.env`
- Ensure Next.js app URL is included

**Audio generation fails:**
- Verify reference audio format (WAV, MP3)
- Check audio duration (3-6 seconds recommended)
- Review server logs for detailed errors



