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
# Clone repo (or upload deploy.sh)
git clone https://github.com/agentwood/agentwrite-final.git
cd agentwrite-final/character-chat/runpod-pocket-tts

# Run automated deployment
chmod +x deploy.sh
./deploy.sh
```

3. Set up systemd service for auto-restart

## Same-Server Backup (Redundancy)
To run a **second instance** on the same server (e.g., Port 8001) to protect against process crashes:

```bash
chmod +x deploy-backup-process.sh
./deploy-backup-process.sh
```

Then add `POCKET_TTS_BACKUP_URL=http://your-server-ip:8001` to `.env`.

## Environment Variable

Add to your `.env`:
```
POCKET_TTS_URL=http://your-server-ip:8000
POCKET_TTS_BACKUP_URL=http://your-server-ip:8001
```
