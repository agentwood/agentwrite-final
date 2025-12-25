# OpenVoice Server - Quick Start

## Start the Server

### Option 1: Using the start script (recommended)
```bash
cd services/openvoice
./start-server.sh
```

### Option 2: Using Docker Compose
```bash
cd services/openvoice
docker-compose up -d
```

### Option 3: Manual Python
```bash
cd services/openvoice
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

## Verify Server is Running

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "openvoice_ready": true,
  "version": "1.0.0"
}
```

## Configure Next.js App

Add to `character-chat/.env`:
```bash
# OpenVoice is now the PRIMARY TTS engine (enabled by default)
# Set to 'false' to disable and use Gemini TTS only
USE_OPENVOICE=true

# OpenVoice server URL (defaults to http://localhost:8000)
OPENVOICE_API_URL=http://localhost:8000
```

## Notes

- OpenVoice server runs on port 8000 by default
- The Next.js app will automatically use OpenVoice for all TTS requests
- If OpenVoice is unavailable, it will fall back to Gemini TTS
- Reference audio is automatically generated for personas if missing


