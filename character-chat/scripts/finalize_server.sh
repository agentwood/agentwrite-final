#!/bin/bash
set -e

# Load environment
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "🔧 applying FINAL SYSTEM FIXES..."

# 1. Install missing audio libraries (MP3 support for soundfile)
echo "📦 Installing libsndfile and audio codecs..."
sudo apt-get update
sudo apt-get install -y libsndfile1 libsndfile1-dev ffmpeg

# 2. Fix Systemd PrivateTmp issue (The likely culprit for 'File not found')
echo "⚙️ Disabling PrivateTmp in Systemd..."
# We search for PrivateTmp in the service file and ensure it is false, or append it
if grep -q "PrivateTmp" /etc/systemd/system/pocket-tts.service; then
    sed -i 's/PrivateTmp=true/PrivateTmp=false/g' /etc/systemd/system/pocket-tts.service
    sed -i 's/PrivateTmp=yes/PrivateTmp=false/g' /etc/systemd/system/pocket-tts.service
else
    # Insert it under [Service]
    sed -i '/\[Service\]/a PrivateTmp=false' /etc/systemd/system/pocket-tts.service
fi

# 3. Ensure /tmp permissions are correct
echo "🔒 Fixing /tmp permissions..."
chmod 1777 /tmp

# 4. Restart everything
echo "🚀 Restarting Service..."
systemctl daemon-reload
systemctl restart pocket-tts

echo "⏳ Waiting for server to initialize..."
sleep 10
systemctl status pocket-tts --no-pager

echo ""
echo "✅ Server Finalized."
