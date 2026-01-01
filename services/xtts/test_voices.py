#!/usr/bin/env python3
"""
Test XTTS voice cloning with accent samples
"""

import requests
import base64
import os
import sys

XTTS_URL = "http://localhost:8001"
SAMPLES_DIR = "/Users/akeemojuko/Downloads/agentwrite-final/character-chat/public/voice-samples"

def test_synthesize(character_name, test_text):
    """Test synthesizing speech with a character's voice sample"""
    sample_file = os.path.join(SAMPLES_DIR, f"{character_name}-reference.mp3")
    
    if not os.path.exists(sample_file):
        print(f"❌ Sample not found: {sample_file}")
        return False
    
    # Load sample and encode to base64
    with open(sample_file, "rb") as f:
        sample_bytes = f.read()
    sample_b64 = base64.b64encode(sample_bytes).decode()
    
    print(f"📢 Testing {character_name} with {len(sample_bytes)/1024:.0f}KB sample...")
    print(f"   Text: \"{test_text}\"")
    
    try:
        response = requests.post(
            f"{XTTS_URL}/synthesize",
            json={
                "text": test_text,
                "speaker_wav": sample_b64,
                "language": "en"
            },
            timeout=120  # First request loads model, may take a while
        )
        
        if response.ok:
            result = response.json()
            audio_b64 = result.get("audio", "")
            audio_bytes = base64.b64decode(audio_b64)
            
            # Save output for manual verification
            output_file = f"/tmp/{character_name}_xtts_test.wav"
            with open(output_file, "wb") as f:
                f.write(audio_bytes)
            
            print(f"✅ Success! Generated {len(audio_bytes)/1024:.0f}KB audio")
            print(f"   Saved to: {output_file}")
            print(f"   To play: afplay {output_file}")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    characters = {
        "asha": "Hello! I am so grateful to share my story with you today. Growing up in Kenya was wonderful.",
        "eamon": "Och aye, let me tell ye a wee story about Scotland! It's a bonnie place indeed.",
        "viktor": "Good evening. I will explain matter in logical and precise way. This is important."
    }
    
    # Test just one if specified
    if len(sys.argv) > 1:
        char = sys.argv[1]
        if char in characters:
            characters = {char: characters[char]}
        else:
            print(f"Unknown character: {char}")
            sys.exit(1)
    
    print("="*60)
    print("XTTS Voice Cloning Test")
    print("="*60)
    
    success_count = 0
    for char, text in characters.items():
        print()
        if test_synthesize(char, text):
            success_count += 1
        print()
    
    print("="*60)
    print(f"Results: {success_count}/{len(characters)} successful")
    print("="*60)
