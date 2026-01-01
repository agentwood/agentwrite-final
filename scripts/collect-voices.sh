#!/bin/bash
# Voice Sample Collection Script
# Helps you quickly find, download, and process voice samples for Chatterbox

set -e

echo "🎙️  Chatterbox Voice Sample Collector"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo "Checking dependencies..."

if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}⚠️  ffmpeg not found. Installing...${NC}"
    brew install ffmpeg
fi

if ! command -v yt-dlp &> /dev/null; then
    echo -e "${YELLOW}⚠️  yt-dlp not found. Installing...${NC}"
    brew install yt-dlp
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Character definitions with suggested search terms
declare -A CHARACTERS=(
    ["asha"]="Kenyan woman English interview wildlife"
    ["eamon"]="Irish man English podcast interview"
    ["viktor"]="Russian man English interview speaker"
    ["tomasz"]="Polish man English interview speaker"
    ["rajiv"]="Indian man English interview tech"
)

declare -A DESCRIPTIONS=(
    ["asha"]="Indian/Kenyan accent, female"
    ["eamon"]="Irish accent, male"
    ["viktor"]="Russian accent, male"
    ["tomasz"]="Polish accent, male"
    ["rajiv"]="Indian accent, male"
)

# Create temp directory
TEMP_DIR="temp_voice_samples"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📥 Voice Sample Collection"
echo ""
echo "For each character, you'll:"
echo "  1. See YouTube search results"
echo "  2. Choose a video"
echo "  3. Script auto-downloads and processes"
echo ""
echo -e "${YELLOW}Tip: Look for clear, single-speaker audio with authentic accents${NC}"
echo ""

# Process each character
for char in asha eamon viktor tomasz rajiv; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}Character: ${char}${NC} (${DESCRIPTIONS[$char]})"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check if sample already exists
    if [ -f "../services/chatterbox/reference_audio/${char}.wav" ]; then
        echo -e "${GREEN}✅ ${char}.wav already exists${NC}"
        read -p "Replace it? (y/n): " replace
        if [ "$replace" != "y" ]; then
            echo "Skipping $char..."
            echo ""
            continue
        fi
    fi
    
    echo "Search query: ${CHARACTERS[$char]}"
    echo ""
    echo "Finding videos..."
    
    # Search and display results
    yt-dlp --get-title --get-id --get-duration "ytsearch5:${CHARACTERS[$char]}" 2>/dev/null | \
        paste - - - | nl | awk '{print $1") "$2" ("$4")"}' || {
        echo -e "${RED}❌ Search failed. Try manual search.${NC}"
        continue
    }
    
    echo ""
    echo "Options:"
    echo "  1-5: Select video number"
    echo "  s: Skip this character"
    echo "  m: Enter YouTube URL manually"
    echo ""
    read -p "Your choice: " choice
    
    VIDEO_URL=""
    
    if [ "$choice" == "s" ]; then
        echo "Skipping $char..."
        echo ""
        continue
    elif [ "$choice" == "m" ]; then
        read -p "Enter YouTube URL: " VIDEO_URL
    elif [[ "$choice" =~ ^[1-5]$ ]]; then
        VIDEO_URL="ytsearch${choice}:${CHARACTERS[$char]}"
    else
        echo -e "${RED}Invalid choice. Skipping...${NC}"
        echo ""
        continue
    fi
    
    echo ""
    echo "Downloading audio..."
    
    # Download audio
    yt-dlp -x --audio-format wav \
        --output "raw_${char}.%(ext)s" \
        --quiet --progress \
        "$VIDEO_URL" || {
        echo -e "${RED}❌ Download failed${NC}"
        continue
    }
    
    echo -e "${GREEN}✅ Downloaded${NC}"
    
    # Show audio info
    echo ""
    echo "Audio info:"
    ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "raw_${char}.wav" | \
        awk '{printf "Duration: %.1f seconds\n", $1}'
    
    # Ask for start time
    echo ""
    echo "Extract 10 seconds starting from which second?"
    echo -e "${YELLOW}Tip: Skip intro music, find clear speech section${NC}"
    read -p "Start time (seconds, e.g., 30): " START_TIME
    
    # Default to 30 if invalid
    if ! [[ "$START_TIME" =~ ^[0-9]+$ ]]; then
        START_TIME=30
    fi
    
    echo ""
    echo "Extracting 10-second clip..."
    
    # Process audio: extract 10 seconds, convert to 24kHz mono
    ffmpeg -i "raw_${char}.wav" \
        -ss "$START_TIME" \
        -t 10 \
        -ar 24000 \
        -ac 1 \
        -acodec pcm_s16le \
        "${char}.wav" \
        -y \
        -loglevel error || {
        echo -e "${RED}❌ Processing failed${NC}"
        continue
    }
    
    # Clean up raw file
    rm "raw_${char}.wav"
    
    echo -e "${GREEN}✅ Created ${char}.wav${NC}"
    
    # Quick preview
    echo ""
    echo "Playing preview..."
    afplay "${char}.wav" 2>/dev/null || open "${char}.wav"
    
    echo ""
    read -p "Keep this sample? (y/n): " keep
    
    if [ "$keep" != "y" ]; then
        echo "Discarding and retrying..."
        rm "${char}.wav"
        # Decrease counter to retry
        ((i--))
        continue
    fi
    
    echo -e "${GREEN}✅ ${char} complete!${NC}"
    echo ""
done

# Copy all samples to Chatterbox directory
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 Installing voice samples..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEST_DIR="../services/chatterbox/reference_audio"
mkdir -p "$DEST_DIR"

INSTALLED_COUNT=0
for char in asha eamon viktor tomasz rajiv; do
    if [ -f "${char}.wav" ]; then
        cp "${char}.wav" "$DEST_DIR/"
        echo -e "${GREEN}✅ Installed ${char}.wav${NC}"
        ((INSTALLED_COUNT++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Voice sample collection complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Installed: $INSTALLED_COUNT / 5 characters"
echo ""

if [ $INSTALLED_COUNT -gt 0 ]; then
    echo "Next steps:"
    echo "  1. Test voices: ./scripts/test-voices.sh"
    echo "  2. Try in app: npm run dev"
    echo ""
    echo -e "${YELLOW}Tip: You can re-run this script to add/replace samples${NC}"
fi

# Cleanup
cd ..
# rm -rf "$TEMP_DIR"  # Keep for debugging

echo ""
echo "Done! 🎉"
