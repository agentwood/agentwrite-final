#!/bin/bash
set -e

# Load environment
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "🎥 Installing FFMPEG (Critical for Audio Processing)..."
apt-get update && apt-get install -y ffmpeg

echo "⚙️ Updating Service Environment (Ensuring Model Cache Writable)..."
# We need to make sure HOME is set so HuggingFace Hub knows where to save the model
cat <<EOF > /etc/systemd/system/pocket-tts.service
[Unit]
Description=Pocket TTS Server (Primary)
After=network.target

[Service]
User=root
WorkingDirectory=/opt/pocket-tts-primary
Environment="PATH=/opt/pocket-tts-primary/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="HOME=/root"
ExecStart=/opt/pocket-tts-primary/bin/python -m pocket_tts.main serve --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "🚀 Restarting Service..."
systemctl daemon-reload
systemctl restart pocket-tts

echo "⏳ Waiting 15 seconds for AI Model to Load..."
sleep 15
systemctl status pocket-tts --no-pager

echo ""
echo "✅ FFMPEG Installed & Service Restarted."
