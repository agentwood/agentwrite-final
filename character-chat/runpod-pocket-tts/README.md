# Pocket TTS Deployment

## Quick Start (Local)

```bash
pip install pocket-tts
pocket-tts serve
```

Then visit http://localhost:8000

## Docker Deployment

```bash
# Build
docker build -t pocket-tts-server .

# Run
docker run -p 8000:8000 pocket-tts-server
```

## Production Deployment (DigitalOcean)

1. Create Droplet (2GB RAM, $12/mo)
2. SSH in and run:
```bash
apt update && apt install -y python3-pip
pip install pocket-tts
pocket-tts serve --host 0.0.0.0 --port 8000
```

3. Set up systemd service for auto-restart

## Environment Variable

Add to your `.env`:
```
POCKET_TTS_URL=http://your-server-ip:8000
```
