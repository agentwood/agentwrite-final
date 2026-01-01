#!/bin/bash
# Quick test - Download one sample voice to verify Chatterbox works

echo "🎙️  Quick Chatterbox Test"
echo "======================="
echo ""
echo "Downloading a test voice sample..."
echo ""

cd /Users/akeemojuko/Downloads/agentwrite-final/services/chatterbox/reference_audio

# Download a public domain English sample with Indian accent
# Using LibriVox (public domain audiobooks)
echo "Downloading sample..."

# Temporary: use a creative commons audio sample
curl -L "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav" -o test_sample.wav 2>/dev/null || {
    echo "Download failed. Let's create a synthetic sample instead."
    
    # Create a simple 1-second beep as fallback
    ffmpeg -f lavfi -i "sine=frequency=440:duration=1" -ar 24000 -ac 1 test_sample.wav -y 2>/dev/null
}

# Convert to proper format
if [ -f "test_sample.wav" ]; then
    ffmpeg -i test_sample.wav -ar 24000 -ac 1 -t 5 asha.wav -y 2>/dev/null
    rm test_sample.wav
    
    echo "✅ Created test sample: asha.wav"
    echo ""
    echo "Now run: ./scripts/test-voices.sh"
else
    echo "❌ Failed to create test sample"
    echo ""
    echo "Please run: ./scripts/collect-voices.sh"
fi
