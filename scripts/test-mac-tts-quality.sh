#!/bin/bash
# Test Mac TTS Voice Quality
# Generates samples from different Mac voices to assess quality

echo "🎙️  Mac TTS Voice Quality Test"
echo "=============================="
echo ""

OUTPUT_DIR="mac_tts_samples"
mkdir -p "$OUTPUT_DIR"

# Test voices for different accents
declare -A TEST_VOICES=(
    # Indian/Hindi
    ["Veena"]="Hello, my name is Asha from Kenya. I work with wildlife conservation."
    ["Lekha"]="Hello, this is a test of the Indian accent."
    
    # Irish
    ["Moira"]="Top of the morning! I'm Eamon from Dublin."
    
    # Russian
    ["Yuri"]="Greetings. I am Viktor from Moscow."
    ["Milena"]="Hello from Russia."
    
    # Polish  
    ["Zosia"]="Hello, my name is Tomasz from Warsaw."
    
    # Enhanced/Premium English
    ["Samantha (Enhanced)"]="Testing premium voice quality."
    ["Alex"]="Testing standard English voice."
)

echo "Generating voice samples..."
echo ""

for voice in "${!TEST_VOICES[@]}"; do
    text="${TEST_VOICES[$voice]}"
    safe_name=$(echo "$voice" | tr ' ()' '___')
    
    echo "Testing: $voice"
    
    # Generate AIFF
    say -v "$voice" "$text" -o "$OUTPUT_DIR/${safe_name}.aiff" 2>/dev/null
    
    if [ -f "$OUTPUT_DIR/${safe_name}.aiff" ]; then
        # Convert to WAV
        ffmpeg -i "$OUTPUT_DIR/${safe_name}.aiff" \
            -ar 24000 -ac 1 \
            "$OUTPUT_DIR/${safe_name}.wav" \
            -y -loglevel error 2>/dev/null
        
        rm "$OUTPUT_DIR/${safe_name}.aiff"
        
        echo "  ✅ Generated: ${safe_name}.wav"
    else
        echo "  ❌ Failed: $voice not available"
    fi
done

echo ""
echo "✨ Sample generation complete!"
echo ""
echo "📁 Samples saved to: $OUTPUT_DIR/"
echo ""
echo "Listen to samples:"
for wav in "$OUTPUT_DIR"/*.wav; do
    if [ -f "$wav" ]; then
        echo "  - $(basename "$wav")"
    fi
done
echo ""
echo "Play all:"
echo "  open $OUTPUT_DIR/"
echo ""
echo "Quality assessment:"
echo "  - Premium/Enhanced voices: Most natural"
echo "  - Standard voices: Good but more robotic"
echo "  - Accent authenticity: Varies by voice"
