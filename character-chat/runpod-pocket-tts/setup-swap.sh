#!/bin/bash

# Swap Setup Script
# Adds 4GB of Swap Memory to handle heavy workloads (like dual TTS models)
# usage: ./setup-swap.sh

set -e

if [ -f /swapfile ]; then
    echo "⚠️  /swapfile already exists. Skipping..."
    free -h
    exit 0
fi

echo "📦 Allocating 4GB Swap File..."
sudo fallocate -l 4G /swapfile

echo "🔒 Setting permissions..."
sudo chmod 600 /swapfile

echo "🛠️  Formatting as swap..."
sudo mkswap /swapfile

echo "🟢 Enabling swap..."
sudo swapon /swapfile

echo "💾 Making permanent in /etc/fstab..."
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo "✅ Swap setup complete!"
echo "-----------------------------------"
free -h
echo "-----------------------------------"
