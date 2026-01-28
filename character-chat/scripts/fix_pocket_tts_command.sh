#!/bin/bash
set -e

# Load environment to ensure 'uv' is found
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "⚙️ Updating Service File with Correct 'serve' Command..."
cat <<EOF > /etc/systemd/system/pocket-tts.service
[Unit]
Description=Pocket TTS Server (Primary)
After=network.target

[Service]
User=root
WorkingDirectory=/opt/pocket-tts-primary
Environment="PATH=/opt/pocket-tts-primary/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/opt/pocket-tts-primary/bin/python -m pocket_tts.main serve --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "🚀 Restarting Service..."
systemctl daemon-reload
systemctl restart pocket-tts

echo "⏳ Waiting for Startup..."
sleep 5
systemctl status pocket-tts --no-pager

echo ""
echo "🔌 Checking Port 8000..."
ss -tlpn | grep 8000 || echo "⚠️  Port 8000 not listening yet (might still be loading models)"

echo ""
echo "✅ Service Updated. Server should be up shortly."
