#!/bin/bash
set -e

# Load environment to ensure 'uv' is found
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "--- Stopping Service ---"
systemctl stop pocket-tts || true

echo "--- Installing System Dependencies ---"
apt-get update && apt-get install -y libsndfile1

echo "--- Creating Persistent Virtual Environment ---"
rm -rf /opt/pocket-tts-primary
uv venv /opt/pocket-tts-primary
source /opt/pocket-tts-primary/bin/activate

echo "--- Installing Python Dependencies (PocketTTS + SoundFile) ---"
uv pip install pocket-tts soundfile

echo "--- Updating Systemd Service ---"
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

[Install]
WantedBy=multi-user.target
EOF

echo "--- Reloading and Restarting Service ---"
systemctl daemon-reload
systemctl enable pocket-tts
systemctl restart pocket-tts

echo "--- Waiting for Startup ---"
sleep 5
systemctl status pocket-tts --no-pager

echo "✅ Primary Server Repaired Successfully"
