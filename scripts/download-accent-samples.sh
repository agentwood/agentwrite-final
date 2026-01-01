#!/bin/bash
# Download Voice Samples from Public Sources
# Uses GMU Speech Accent Archive and other free resources

set -e

echo "🎙️  Downloading Accent Voice Samples"
echo "===================================="
echo ""

DEST_DIR="/Users/akeemojuko/Downloads/agentwrite-final/services/chatterbox/reference_audio"
TEMP_DIR="/Users/akeemojuko/Downloads/agentwrite-final/temp_downloads"

mkdir -p "$DEST_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "Source: George Mason University Speech Accent Archive"
echo "Free, downloadable samples with various accents"
echo ""

# GMU Speech Accent Archive has standardized recordings
# Format: accent.gmu.edu/browse_language.php?function=detail&speakerid=XXXX

echo "Downloading samples..."
echo ""

# Indian accent (female) - Sample ID examples
echo "1. Downloading Indian accent (female)..."
# Hindi speaker from India
curl -L "https://accent.gmu.edu/soundtracks/84.mp3" -o indian_female_1.mp3 2>/dev/null || \
curl -L "https://accent.gmu.edu/soundtracks/200.mp3" -o indian_female_1.mp3 2>/dev/null || \
echo "  ⚠️  Manual download needed"

# Irish accent (male)
echo "2. Downloading Irish accent (male)..."
curl -L "https://accent.gmu.edu/soundtracks/52.mp3" -o irish_male_1.mp3 2>/dev/null || \
echo "  ⚠️  Manual download needed"

# Russian accent (male)
echo "3. Downloading Russian accent (male)..."
curl -L "https://accent.gmu.edu/soundtracks/98.mp3" -o russian_male_1.mp3 2>/dev/null || \
echo "  ⚠️  Manual download needed"

# Polish accent (male)
echo "4. Downloading Polish accent (male)..."
curl -L "https://accent.gmu.edu/soundtracks/145.mp3" -o polish_male_1.mp3 2>/dev/null || \
echo "  ⚠️  Manual download needed"

echo ""
echo "Processing audio files..."
echo ""

# Process each downloaded file
for file in *.mp3; do
    if [ -f "$file" ]; then
        base=$(basename "$file" .mp3)
        
        # Determine character name based on file
        case $base in
            indian_female*)
                char="asha"
                ;;
            irish_male*)
                char="eamon"
                ;;
            russian_male*)
                char="viktor"
                ;;
            polish_male*)
                char="tomasz"
                ;;
            *)
                char="$base"
                ;;
        esac
        
        echo "Processing $file → ${char}.wav"
        
        # Extract 10 seconds, convert to proper format
        ffmpeg -i "$file" -ss 5 -t 10 -ar 24000 -ac 1 "${char}.wav" -y 2>/dev/null || {
            echo "  ❌ Failed to process $file"
            continue
        }
        
        # Copy to chatterbox directory
        if [ -f "${char}.wav" ]; then
            cp "${char}.wav" "$DEST_DIR/"
            echo "  ✅ Installed ${char}.wav"
        fi
    fi
done

echo ""
echo "Manual options if automatic download failed:"
echo ""
echo "📍 George Mason Speech Accent Archive:"
echo "   Visit: https://accent.gmu.edu/"
echo "   1. Click 'browse and search'"
echo "   2. Filter by native language (e.g., Hindi, Russian, Polish)"
echo "   3. Click speaker ID to hear sample"
echo "   4. Download MP3"
echo ""
echo "📍 Alternative: Use browser to download"
echo "   I'll open the archive in your browser..."
echo ""

read -p "Open GMU Speech Accent Archive in browser? (y/n): " open_browser
if [ "$open_browser" == "y" ]; then
    open "https://accent.gmu.edu/browse_language.php?function=find&language=hindi"
fi

echo ""
echo "✨ Sample collection complete!"
echo ""
echo "Installed samples:"
ls -lh "$DEST_DIR"/*.wav 2>/dev/null || echo "No samples installed yet"
echo ""
echo "Next: ./scripts/test-voices.sh"
