#!/bin/bash

# Pocket TTS Deployment Script
# Tested on Ubuntu 22.04 LTS
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh

set -e

echo "🚀 Starting Pocket TTS Deployment..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv ffmpeg git curl

# 2. Install uv (Fast Python Package Manager)
if ! command -v uv &> /dev/null; then
    echo "⚡ Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.local/bin/env
fi

# 3. Create Directory
INSTALL_DIR="/opt/pocket-tts"
echo "📂 Creating installation directory at $INSTALL_DIR..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR
cd $INSTALL_DIR

# 4. Install Pocket TTS
echo "💾 Installing Pocket TTS..."
# Create a virtual environment via uv for isolation
uv venv
source .venv/bin/activate
uv pip install pocket-tts

# 5. Create Systemd Service
echo "⚙️ Creating systemd service..."
SERVICE_FILE="/etc/systemd/system/pocket-tts.service"

sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=Pocket TTS Server
After=network.target

[Service]
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$HOME/.local/bin/uv run --directory $INSTALL_DIR pocket-tts serve --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

# 6. Start Service
echo "🟢 Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable pocket-tts
sudo systemctl restart pocket-tts

# 7. Check Status
sleep 5
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "Failed")

if [ "$STATUS" == "200" ]; then
    PUBLIC_IP=$(curl -s ifconfig.me)
    echo ""
    echo "✅ Deployment Successful!"
    echo "------------------------------------------------"
    echo "Server is running at: http://$PUBLIC_IP:8000"
    echo "Health Check: http://$PUBLIC_IP:8000/health"
    echo "------------------------------------------------"
    echo ""
    echo "👉 NEXT STEP: Add this URL to your project environment variables as POCKET_TTS_BACKUP_URL"
else
    echo "❌ Deployment finished but health check failed."
    echo "Check logs with: sudo journalctl -u pocket-tts -f"
fi
