#!/bin/bash
set -e

# Ensure environment is loaded
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "🛑 STOPPING ALL TTS SERVICES (To free RAM)..."
systemctl stop pocket-tts || true
systemctl stop pocket-tts-backup || true

echo "💾 INSTALLING SYSTEM LIBRARIES..."
apt-get update && apt-get install -y libsndfile1

echo "🧹 CLEANING & REINSTALLING PRIMARY SERVER..."
rm -rf /opt/pocket-tts-primary
uv venv /opt/pocket-tts-primary
source /opt/pocket-tts-primary/bin/activate

echo "📦 INSTALLING PYTHON DEPS (PocketTTS + SoundFile)..."
uv pip install pocket-tts soundfile

echo "⚙️ WRITING ROBUST SERVICE FILE..."
cat <<EOF > /etc/systemd/system/pocket-tts.service
[Unit]
Description=Pocket TTS Server (Primary)
After=network.target

[Service]
User=root
WorkingDirectory=/opt/pocket-tts-primary
Environment="PATH=/opt/pocket-tts-primary/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/opt/pocket-tts-primary/bin/python -m pocket_tts.main --port 8000 --host 0.0.0.0
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "🚀 RESTARTING PRIMARY SERVICE..."
systemctl daemon-reload
systemctl enable pocket-tts
systemctl restart pocket-tts

echo "⏳ WAITING FOR HEALTH CHECK..."
sleep 5
systemctl status pocket-tts --no-pager

echo "✅ DONE. Only Primary Server (Port 8000) is running to save RAM."
