#!/usr/bin/env python3
"""
Voice-to-Character Matcher
Analyzes voice samples and matches them to character profiles
"""

import os
import json
from pathlib import Path
import subprocess

def analyze_voice_characteristics(audio_file):
    """
    Analyze voice characteristics using ffprobe/ffmpeg
    Returns: pitch, tempo, gender estimate, language/accent markers
    """
    try:
        # Use ffprobe to analyze audio
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", 
             "-show_format", "-show_streams", str(audio_file)],
            capture_output=True,
            text=True
        )
        
        metadata = json.loads(result.stdout)
        
        # Extract basic characteristics from filename
        filename = audio_file.stem
        parts = filename.split("_")
        
        char = {
            "file": audio_file.name,
            "model": parts[1] if len(parts) > 1 else "unknown",
            "language": parts[2] if len(parts) > 2 else "en",
            "variation": "_".join(parts[3:]) if len(parts) > 3 else "default",
        }
        
        # Estimate gender/age from model naming conventions
        if "female" in filename.lower() or "_f_" in filename:
            char["gender"] = "female"
        elif "male" in filename.lower() or "_m_" in filename:
            char["gender"] = "male"
        else:
            char["gender"] = "neutral"
        
        return char
        
    except Exception as e:
        print(f"Error analyzing {audio_file}: {e}")
        return None


def load_character_profiles(db_path="../character-chat/prisma/dev.db"):
    """Load character profiles from database"""
    # For now, return sample characters - will connect to DB later
    return [
        {"seedId": "asha", "name": "Asha", "accent": "indian", "gender": "female", "age": "adult"},
        {"seedId": "eamon", "name": "Eamon", "accent": "irish", "gender": "male", "age": "adult"},
        {"seedId": "viktor", "name": "Viktor", "accent": "russian", "gender": "male", "age": "adult"},
        {"seedId": "tomasz", "name": "Tomasz", "accent": "polish", "gender": "male", "age": "adult"},
        {"seedId": "rajiv", "name": "Rajiv", "accent": "indian", "gender": "male", "age": "adult"},
    ]


def match_voices_to_characters(voice_dir="voice_library", output_file="voice_matches.json"):
    """Match downloaded voices to character profiles"""
    
    voice_path = Path(voice_dir)
    
    if not voice_path.exists():
        print(f"❌ Voice library not found: {voice_path}")
        print("   Run: python build_voice_library.py first")
        return
    
    print("🎭 Voice-to-Character Matcher")
    print("=" * 60)
    
    # Get all voice samples
    voices = list(voice_path.glob("*.wav"))
    if not voices:
        voices = list(voice_path.glob("*.mp3"))
    
    print(f"Found {len(voices)} voice samples")
    
    # Load character profiles
    characters = load_character_profiles()
    print(f"Found {len(characters)} characters")
    print()
    
    # Analyze all voices
    print("Analyzing voices...")
    voice_data = []
    for voice in voices[:50]:  # Limit for speed
        char = analyze_voice_characteristics(voice)
        if char:
            voice_data.append(char)
            print(f"  ✓ {voice.name}")
    
    print()
    
    # Match voices to characters
    print("Matching voices to characters...")
    matches = {}
    
    # Simple matching based on language/accent
    accent_map = {
        "indian": ["hi", "hindi", "india"],
        "irish": ["ga", "irish", "ireland"],
        "russian": ["ru", "russian", "russia"],
        "polish": ["pl", "polish", "poland"],
        "kenyan": ["sw", "swahili", "kenya"],
    }
    
    for character in characters:
        char_accent = character.get("accent", "").lower()
        char_gender = character.get("gender", "").lower()
        
        # Find matching voices
        candidates = []
        for voice in voice_data:
            score = 0
            
            # Check accent/language match
            if char_accent in accent_map:
                for marker in accent_map[char_accent]:
                    if marker in voice["language"].lower():
                        score += 10
            
            # Check gender match
            if char_gender == voice.get("gender", ""):
                score += 5
            
            # Prefer chatterbox/xtts (higher quality)
            if voice["model"] in ["chatterbox", "xtts"]:
                score += 3
            
            if score > 0:
                candidates.append({
                    "file": voice["file"],
                    "score": score,
                    "model": voice["model"],
                    "language": voice["language"],
                })
        
        # Sort by score
        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Take top 5 matches
        matches[character["seedId"]] = {
            "character": character["name"],
            "top_matches": candidates[:5],
            "total_candidates": len(candidates),
        }
        
        if candidates:
            print(f"  ✓ {character['name']:10s}: {len(candidates)} matches (best: {candidates[0]['file']})")
        else:
            print(f"  ⚠ {character['name']:10s}: No matches found")
    
    # Save matches
    with open(output_file, "w") as f:
        json.dump(matches, f, indent=2)
    
    print()
    print("=" * 60)
    print(f"✨ Matching complete!")
    print(f"📋 Results saved: {output_file}")
    print()
    print("Next steps:")
    print("  1. Review matches: cat voice_matches.json")
    print("  2. Listen to top matches")
    print("  3. Copy best matches to services/chatterbox/reference_audio/")
    
    return matches


if __name__ == "__main__":
    match_voices_to_characters()
