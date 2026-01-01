#!/bin/bash
# Quick Voice Test - Record your own voice for testing
# This will verify Chatterbox voice cloning works before getting real accents

echo "🎙️  Quick Chatterbox Test with Your Voice"
echo "========================================="
echo ""
echo "Let's test Chatterbox voice cloning with YOUR voice first!"
echo "This verifies the system works before collecting accent samples."
echo ""

DEST_DIR="/Users/akeemojuko/Downloads/agentwrite-final/services/chatterbox/reference_audio"
mkdir -p "$DEST_DIR"

echo "Step 1: Record a 10-second sample"
echo ""
echo "I'll record your voice saying anything..."
echo "Tip: Speak clearly and naturally"
echo ""
read -p "Press Enter when ready to record (10 seconds)..."

echo ""
echo "🔴 RECORDING... (speak now for 10 seconds)"
echo ""

# Record 10 seconds using QuickTime Player or sox
if command -v rec &> /dev/null; then
    rec -r 24000 -c 1 "$DEST_DIR/test_voice.wav" trim 0 10
elif command -v ffmpeg &> /dev/null; then
    ffmpeg -f avfoundation -i ":0" -t 10 -ar 24000 -ac 1 "$DEST_DIR/test_voice.wav" 2>/dev/null
else
    echo "Please record 10 seconds using your Mac's Voice Memos app"
    echo "Then drag the file here and press Enter:"
    read audio_file
    
    if [ -f "$audio_file" ]; then
        ffmpeg -i "$audio_file" -ar 24000 -ac 1 -t 10 "$DEST_DIR/test_voice.wav" -y 2>/dev/null
    fi
fi

if [ -f "$DEST_DIR/test_voice.wav" ]; then
    echo ""
    echo "✅ Recording complete!"
    echo ""
    echo "Creating test voices for 3 characters..."
    
    # Copy the same voice to test different characters
    cp "$DEST_DIR/test_voice.wav" "$DEST_DIR/asha.wav"
    cp "$DEST_DIR/test_voice.wav" "$DEST_DIR/viktor.wav"
    cp "$DEST_DIR/test_voice.wav" "$DEST_DIR/eamon.wav"
    
    echo "✅ Created:"
    echo "   - asha.wav (test)"
    echo "   - viktor.wav (test)"  
    echo "   - eamon.wav (test)"
    echo ""
    echo "Step 2: Test Chatterbox voice cloning"
    echo ""
    read -p "Run voice test now? (y/n): " run_test
    
    if [ "$run_test" == "y" ]; then
        cd /Users/akeemojuko/Downloads/agentwrite-final
        ./scripts/test-voices.sh
    else
        echo ""
        echo "Run this when ready:"
        echo "  ./scripts/test-voices.sh"
    fi
    
    echo ""
    echo "Note: These are TEST voices using your voice."
    echo "Replace with real accents later using HuggingFace demos."
else
    echo ""
    echo "❌ Recording failed"
    echo ""
    echo "Alternative: Use macOS text-to-speech"
    echo ""
    read -p "Generate synthetic samples instead? (y/n): " use_synthetic
    
    if [ "$use_synthetic" == "y" ]; then
        # Use macOS 'say' command with different voices
        echo "Generating Asha (Indian accent simulation)..."
        echo "Hello, my name is Asha from Kenya. I work with wildlife conservation." | \
            say -v "Veena" -o "$DEST_DIR/asha_temp.aiff"
        ffmpeg -i "$DEST_DIR/asha_temp.aiff" -ar 24000 -ac 1 "$DEST_DIR/asha.wav" -y 2>/dev/null
        rm "$DEST_DIR/asha_temp.aiff"
        
        echo "Generating Viktor (synthetic)..."
        echo "Hello, I am Viktor from Moscow. I specialize in mathematics." | \
            say -v "Yuri" -o "$DEST_DIR/viktor_temp.aiff"
        ffmpeg -i "$DEST_DIR/viktor_temp.aiff" -ar 24000 -ac 1 "$DEST_DIR/viktor.wav" -y 2>/dev/null
        rm "$DEST_DIR/viktor_temp.aiff"
        
        echo "Generating Eamon (synthetic)..."
        echo "Top of the morning! I'm Eamon from Dublin." | \
            say -v "Moira" -o "$DEST_DIR/eamon_temp.aiff"
        ffmpeg -i "$DEST_DIR/eamon_temp.aiff" -ar 24000 -ac 1 "$DEST_DIR/eamon.wav" -y 2>/dev/null
        rm "$DEST_DIR/eamon_temp.aiff"
        
        echo ""
        echo "✅ Generated 3 synthetic test voices"
        echo ""
        echo "Run: ./scripts/test-voices.sh"
    fi
fi

echo ""
echo "✨ Quick test setup complete!"
echo ""
echo "Next steps:"
echo "  1. Test: ./scripts/test-voices.sh"
echo "  2. If it works, replace with real accents from HuggingFace"
echo "  3. Visit: https://huggingface.co/spaces/resemble-ai/chatterbox_multilingual"
