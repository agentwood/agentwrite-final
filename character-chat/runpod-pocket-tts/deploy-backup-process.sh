#!/bin/bash

# Pocket TTS SAME-SERVER Backup Deployment
# Usage: ./deploy-backup-process.sh
# This creates a SECOND service running on Port 8001
# It will INSTALL dependencies if they are missing.

set -e

echo "🚀 Setting up Backup Process (Port 8001)..."

INSTALL_DIR="/opt/pocket-tts"

# CHECK & INSTALL DEPENDENCIES (Standalone Mode)
if [ ! -d "$INSTALL_DIR" ]; then
    echo "⚠️ Primary installation not found. Installing base dependencies..."
    
    # 1. Update System
    echo "📦 Updating system packages..."
    sudo apt-get update
    sudo apt-get install -y python3-pip python3-venv ffmpeg git curl libsndfile1

    # 2. Install uv
    if ! command -v uv &> /dev/null; then
        echo "⚡ Installing uv..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        source $HOME/.local/bin/env
    fi

    # 3. Create Directory
    echo "📂 Creating installation directory at $INSTALL_DIR..."
    sudo mkdir -p $INSTALL_DIR
    sudo chown $USER:$USER $INSTALL_DIR
    
    # 4. Install Pocket TTS
    echo "💾 Installing Pocket TTS..."
    cd $INSTALL_DIR
    uv venv
    source .venv/bin/activate
    uv pip install pocket-tts soundfile
    
    echo "✅ Base installation complete."
else
    echo "✅ Base installation found at $INSTALL_DIR"
fi

SERVICE_FILE="/etc/systemd/system/pocket-tts-backup.service"

echo "⚙️ Creating backup systemd service..."

# Note: We use the SAME installation and venv, just a different port
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=Pocket TTS Backup Backup (Port 8001)
After=network.target

[Service]
User=$USER
WorkingDirectory=$INSTALL_DIR
# Using Port 8001
ExecStart=$HOME/.local/bin/uv run --directory $INSTALL_DIR pocket-tts serve --host 0.0.0.0 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

# Start Service
echo "🟢 Starting backup service..."
sudo systemctl daemon-reload
sudo systemctl enable pocket-tts-backup
sudo systemctl restart pocket-tts-backup

# Check Status
sleep 5
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health || echo "Failed")

if [ "$STATUS" == "200" ]; then
    PUBLIC_IP=$(curl -s ifconfig.me)
    echo ""
    echo "✅ Backup Instance Running!"
    echo "------------------------------------------------"
    echo "Backup URL: http://$PUBLIC_IP:8001"
    echo "------------------------------------------------"
    echo "👉 Add this URL as POCKET_TTS_BACKUP_URL in your app."
else
    echo "❌ Backup service failed to start."
    echo "Check logs: sudo journalctl -u pocket-tts-backup -f"
fi
