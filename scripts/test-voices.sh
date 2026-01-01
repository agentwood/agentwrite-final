#!/bin/bash
# Test all Chatterbox voices
# Generates sample audio for each character

set -e

echo "🎙️  Chatterbox Voice Tester"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Chatterbox server is running
echo "Checking Chatterbox server..."
if ! curl -s http://localhost:8002/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Chatterbox server not running!${NC}"
    echo ""
    echo "Start it with:"
    echo "  cd services/chatterbox"
    echo "  source venv/bin/activate"
    echo "  python server.py"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Get available characters
echo "Fetching available characters..."
AVAILABLE=$(curl -s http://localhost:8002/characters | jq -r '.characters[]' 2>/dev/null)

if [ -z "$AVAILABLE" ]; then
    echo -e "${RED}❌ No characters available${NC}"
    echo ""
    echo "Add reference audio files to:"
    echo "  services/chatterbox/reference_audio/"
    exit 1
fi

echo -e "${GREEN}Available characters:${NC}"
echo "$AVAILABLE" | while read char; do echo "  • $char"; done
echo ""

# Test phrases
declare -A TEST_PHRASES=(
    ["asha"]="Hello! My name is Asha. I'm from Kenya and I work as a wildlife conservation guide. How can I help you today?"
    ["eamon"]="Top of the morning to you! I'm Eamon from Dublin. Would you like to hear a good story?"
    ["viktor"]="Greetings. I am Viktor from Moscow. I specialize in advanced mathematics and cryptography."
    ["tomasz"]="Hello, my name is Tomasz. I'm from Warsaw and I work in software development."
    ["rajiv"]="Namaste! I'm Rajiv from Mumbai. I'm a technology entrepreneur and mentor."
)

# Create output directory
OUTPUT_DIR="voice_tests_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "🎬 Generating test audio..."
echo ""

# Test each available character
TESTED=0
FAILED=0

echo "$AVAILABLE" | while read char; do
    if [ -n "$char" ]; then
        echo -n "Testing $char... "
        
        # Get test phrase
        PHRASE="${TEST_PHRASES[$char]}"
        if [ -z "$PHRASE" ]; then
            PHRASE="Hello, this is a test of the $char voice. How does it sound?"
        fi
        
        # Generate audio
        if curl -X POST http://localhost:8002/synthesize \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"$PHRASE\",
                \"character_id\": \"$char\",
                \"emotion\": 0.7
            }" \
            --output "$OUTPUT_DIR/${char}.wav" \
            --silent \
            --max-time 60 2>/dev/null; then
            
            # Check if file was created and has content
            if [ -s "$OUTPUT_DIR/${char}.wav" ]; then
                echo -e "${GREEN}✅${NC}"
                ((TESTED++))
            else
                echo -e "${RED}❌ (empty file)${NC}"
                ((FAILED++))
            fi
        else
            echo -e "${RED}❌ (request failed)${NC}"
            ((FAILED++))
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Test complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Results saved to: $OUTPUT_DIR/"
echo ""

# Show results
for file in "$OUTPUT_DIR"/*.wav; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .wav)
        size=$(du -h "$file" | cut -f1)
        duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file" 2>/dev/null | awk '{printf "%.1fs", $1}')
        echo "  ${GREEN}✅${NC} $filename.wav ($size, $duration)"
    fi
done

echo ""
echo "Commands:"
echo "  • Play all: for f in $OUTPUT_DIR/*.wav; do open \"\$f\"; sleep 3; done"
echo "  • Play one: open $OUTPUT_DIR/asha.wav"
echo ""

# Offer to play automatically
read -p "Play all voices now? (y/n): " play_choice
if [ "$play_choice" == "y" ]; then
    echo ""
    echo "Playing voices (3 seconds each)..."
    for file in "$OUTPUT_DIR"/*.wav; do
        if [ -f "$file" ]; then
            echo "  ▶️  $(basename "$file" .wav)"
            afplay "$file" 2>/dev/null || open "$file"
            sleep 3
        fi
    done
fi

echo ""
echo "Done! 🎉"
