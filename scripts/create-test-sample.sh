#!/bin/bash
# Quick test - Create a simple test voice sample

echo "🎙️  Creating Test Voice Sample"
echo "=============================="
echo ""

cd /Users/akeemojuko/Downloads/agentwrite-final/services/chatterbox/reference_audio

echo "For a quick test, we need a 10-second audio sample."
echo ""
echo "Options:"
echo "  1. Use text-to-speech to create a test sample (quick)"
echo "  2. Download from a URL you provide"
echo "  3. Use a file from your computer"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo ""
        echo "Creating synthetic voice sample..."
        
        # Use macOS 'say' command to generate sample
        if command -v say &> /dev/null; then
            echo "Hello, my name is Asha. I am testing the Chatterbox voice system. This is a sample conversation to verify everything works correctly." | \
                say -o temp_asha.aiff
            
            # Convert to WAV
            ffmpeg -i temp_asha.aiff -ar 24000 -ac 1 asha.wav -y 2>/dev/null
            rm temp_asha.aiff
            
            echo "✅ Created asha.wav (synthetic test voice)"
        else
            echo "❌ 'say' command not available"
        fi
        ;;
    2)
        echo ""
        read -p "Enter audio file URL: " url
        
        echo "Downloading..."
        curl -L "$url" -o temp_download 2>/dev/null
        
        # Convert to WAV
        ffmpeg -i temp_download -ss 0 -t 10 -ar 24000 -ac 1 asha.wav -y 2>/dev/null
        rm temp_download
        
        echo "✅ Created asha.wav from download"
        ;;
    3)
        echo ""
        read -p "Enter full path to audio file: " filepath
        
        if [ -f "$filepath" ]; then
            # Convert to WAV
            ffmpeg -i "$filepath" -ss 30 -t 10 -ar 24000 -ac 1 asha.wav -y 2>/dev/null
            echo "✅ Created asha.wav from $filepath"
        else
            echo "❌ File not found: $filepath"
        fi
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

if [ -f "asha.wav" ]; then
    echo ""
    echo "✅ Test sample created!"
    echo ""
    echo "Preview:"
    afplay asha.wav 2>/dev/null || open asha.wav
    
    echo ""
    echo "Next: Run ./scripts/test-voices.sh to verify Chatterbox works"
fi
