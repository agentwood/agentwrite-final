#!/bin/bash
set -e

# Load environment
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "🔧 Repairing BACKUP TTS Server (Port 8001)..."

# 1. Start by stopping it
systemctl stop pocket-tts-backup

# 2. Fix Systemd PrivateTmp issue (The likely culprit for 'File not found')
SERVICE_FILE="/etc/systemd/system/pocket-tts-backup.service"

if [ -f "$SERVICE_FILE" ]; then
    echo "⚙️ Updating service configuration..."
    # We search for PrivateTmp in the service file and ensure it is false, or append it
    if grep -q "PrivateTmp" "$SERVICE_FILE"; then
        sed -i 's/PrivateTmp=true/PrivateTmp=false/g' "$SERVICE_FILE"
        sed -i 's/PrivateTmp=yes/PrivateTmp=false/g' "$SERVICE_FILE"
    else
        # Insert it under [Service]
        sed -i '/\[Service\]/a PrivateTmp=false' "$SERVICE_FILE"
    fi
else
    echo "❌ Service file not found at $SERVICE_FILE"
    exit 1
fi

# 3. Ensure /tmp permissions are still correct (just in case)
chmod 1777 /tmp

# 4. Restart
echo "🚀 Restarting Backup Service..."
systemctl daemon-reload
systemctl restart pocket-tts-backup

echo "⏳ Waiting for backup server to initialize..."
sleep 5
systemctl status pocket-tts-backup --no-pager

echo ""
echo "✅ Backup Server Repaired."
