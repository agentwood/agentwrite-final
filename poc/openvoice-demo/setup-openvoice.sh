#!/bin/bash
# Setup script for OpenVoice POC
# This script helps set up OpenVoice for local testing

set -e

echo "=========================================="
echo "OpenVoice POC Setup"
echo "=========================================="

# Check if OpenVoice is already cloned
if [ ! -d "OpenVoice" ]; then
    echo "Cloning OpenVoice repository..."
    git clone https://github.com/myshell-ai/OpenVoice.git
else
    echo "OpenVoice repository already exists"
fi

cd OpenVoice

echo ""
echo "Setting up OpenVoice..."
echo "See OpenVoice README for detailed setup instructions:"
echo "https://github.com/myshell-ai/OpenVoice"

echo ""
echo "Key steps:"
echo "1. Install dependencies (see requirements.txt)"
echo "2. Download model checkpoints"
echo "3. Set up environment variables"

echo ""
echo "After setup, update server.py and test scripts with actual OpenVoice imports"

cd ..

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Follow OpenVoice setup instructions"
echo "2. Download model checkpoints to ./checkpoints/"
echo "3. Run: python test-clone.py"
echo "4. Run: python test-synthesize.py"

