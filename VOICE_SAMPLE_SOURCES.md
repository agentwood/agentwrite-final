# Voice Sample Sources - Direct Download Links

Based on research, here are the best sources for character voice samples:

## George Mason Speech Accent Archive
**Best source for authentic accent samples**
Website: https://accent.gmu.edu

### How to Download:
1. Visit https://accent.gmu.edu/browse_language.php
2. Select native language (Hindi, Russian, Polish, etc.)
3. Click on speaker
4. Click "play" button to listen
5. Right-click audio player → "Save audio as..." to download MP3

### Characters Needed:

**Asha (Indian/Kenyan female)**
- Browse by: Hindi or Swahili
- Filter: Female speakers
- URL pattern: https://accent.gmu.edu/browse_language.php?function=detail&speakerid=XXXX

**Eamon (Irish male)**
- Browse by: Irish (Gaelic)
- Filter: Male speakers

**Viktor (Russian male)**
- Browse by: Russian
- Filter: Male speakers

**Tomasz (Polish male)**
- Browse by: Polish
- Filter: Male speakers

**Rajiv (Indian male)**
- Browse by: Hindi
- Filter: Male speakers

---

## Chatterbox TTS Demo Samples
**Pre-generated high-quality samples**
Website: https://resemble-ai.github.io/chatterbox_demopage/

These are already generated samples showing Chatterbox quality, but they may not match specific accents.

---

## Alternative: ElevenLabs Voice Library
**Can generate one-time samples for free**

1. Sign up for free tier: https://elevenlabs.io
2. Go to Voice Library
3. Search for accent voices:
   - Search "Indian female"
   - Search "Irish male"
   - etc.
4. Generate 10-second sample
5. Download MP3
6. Use as Chatterbox reference (one-time cost, free forever after)

---

## Automated Script Option

I can create a script that:
1. Opens Speech Accent Archive
2. Filters by language/gender
3. Shows you top matches
4. Downloads your selection
5. Processes to correct format
6. Installs to Chatterbox

Would you like me to create this?

---

## Manual Download Process

```bash
# After downloading samples from Speech Accent Archive:

cd /Users/akeemojuko/Downloads

# Process each file
for file in hindi_female.mp3 russian_male.mp3 polish_male.mp3 irish_male.mp3; do
    # Extract character name from filename
    if [[ $file == "hindi_female"* ]]; then char="asha"; fi
    if [[ $file == "russian"* ]]; then char="viktor"; fi
    if [[ $file == "polish"* ]]; then char="tomasz"; fi
    if [[ $file == "irish"* ]]; then char="eamon"; fi
    
    # Convert to proper format (24kHz mono WAV, 10 seconds)
    ffmpeg -i "$file" -ss 5 -t 10 -ar 24000 -ac 1 "${char}.wav" -y
    
    # Copy to Chatterbox
    cp "${char}.wav" /Users/akeemojuko/Downloads/agentwrite-final/services/chatterbox/reference_audio/
done

# Test
cd /Users/akeemojuko/Downloads/agentwrite-final
./scripts/test-voices.sh
```

---

## Recommended Approach

**For best results:**
1. Use George Mason Speech Accent Archive (free, authentic accents)
2. Browser → Find samples → Download MP3s
3. Process with script above
4. Test with Chatterbox

**Time: ~15 minutes to find and download all 5 samples**

Let me know if you want me to:
1. Create an automated browser script to help find samples
2. Get specific direct download URLs
3. Just move forward with design/profile updates (collect voices later)
