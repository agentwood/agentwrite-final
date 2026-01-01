#!/usr/bin/env python3
"""
HuggingFace Voice Library Builder
Downloads 300+ voice samples from various TTS platforms
"""

import os
import requests
import json
from pathlib import Path
import time

# HuggingFace Inference API endpoints
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")  # Optional, for rate limits
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"} if HF_API_TOKEN else {}

# TTS Models on HuggingFace
TTS_MODELS = {
    "chatterbox": "resemble-ai/chatterbox-multilingual",
    "xtts": "coqui/XTTS-v2",
    "bark": "suno/bark",
    "styletts": "yl4579/StyleTTS2",
    "parler": "parler-tts/parler_tts_mini_v0.1",
}

# Sample texts for generation (short to save time)
SAMPLE_TEXTS = [
    "Hello, how are you doing today?",
    "Welcome to our platform.",
    "Thank you for your time.",
    "I'm here to help you.",
    "Let me assist you with that.",
]

# Voice configurations for different models
VOICE_CONFIGS = {
    "chatterbox": {
        "languages": ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"],
        "emotions": [0.3, 0.5, 0.7, 0.9],  # emotion exaggeration levels
    },
    "xtts": {
        "languages": ["en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", 
                      "cs", "ar", "zh-cn", "ja", "hu", "ko", "hi"],
    },
    "bark": {
        "speakers": [f"v2/{lang}_speaker_{i}" 
                     for lang in ["en", "de", "es", "fr", "hi", "it", "ja", "ko", "pl", "pt", "ru", "tr", "zh"]
                     for i in range(10)],  # 10 speakers per language
    },
}


def download_voice_sample(model_name, config, output_path):
    """Download a single voice sample using HuggingFace Inference API"""
    
    api_url = f"https://api-inference.huggingface.co/models/{TTS_MODELS[model_name]}"
    
    try:
        # Prepare payload based on model type
        if model_name == "chatterbox":
            payload = {
                "inputs": config["text"],
                "parameters": {
                    "language": config.get("language", "en"),
                    "emotion": config.get("emotion", 0.5),
                }
            }
        elif model_name == "xtts":
            payload = {
                "inputs": config["text"],
                "parameters": {
                    "language": config.get("language", "en"),
                }
            }
        elif model_name == "bark":
            payload = {
                "inputs": config["text"],
                "parameters": {
                    "preset": config.get("speaker", "v2/en_speaker_0"),
                }
            }
        else:
            payload = {"inputs": config["text"]}
        
        print(f"Requesting {model_name}: {config.get('id', 'unknown')}...")
        
        response = requests.post(
            api_url,
            headers=HEADERS,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            # Save audio
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"  ✅ Saved: {output_path.name}")
            return True
        else:
            print(f"  ❌ Failed ({response.status_code}): {response.text[:100]}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error: {str(e)[:100]}")
        return False


def build_voice_library(output_dir="voice_library", target_count=300):
    """Build a library of voice samples from multiple TTS platforms"""
    
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    print(f"🎙️  Building Voice Library")
    print(f"Target: {target_count} samples")
    print(f"Output: {output_path.absolute()}")
    print("=" * 60)
    
    downloaded = 0
    failed = 0
    sample_id = 0
    
    # Strategy: Generate samples from different models with variations
    samples_per_model = target_count // len(TTS_MODELS)
    
    print(f"\n📊 Plan: ~{samples_per_model} samples per model")
    print()
    
    # 1. Chatterbox samples (multilingual with emotion variations)
    if downloaded < target_count:
        print(f"[1/3] Generating Chatterbox samples...")
        for lang in VOICE_CONFIGS["chatterbox"]["languages"]:
            for emotion in VOICE_CONFIGS["chatterbox"]["emotions"]:
                for text_idx, text in enumerate(SAMPLE_TEXTS):
                    if downloaded >= target_count:
                        break
                    
                    config = {
                        "id": f"chatterbox_{lang}_e{int(emotion*10)}_{text_idx}",
                        "text": text,
                        "language": lang,
                        "emotion": emotion,
                    }
                    
                    output_file = output_path / f"{sample_id:04d}_chatterbox_{lang}_e{int(emotion*10)}.wav"
                    
                    if download_voice_sample("chatterbox", config, output_file):
                        downloaded += 1
                    else:
                        failed += 1
                    
                    sample_id += 1
                    time.sleep(0.5)  # Rate limiting
    
    # 2. XTTS samples (multilingual)
    if downloaded < target_count:
        print(f"\n[2/3] Generating XTTS samples...")
        for lang in VOICE_CONFIGS["xtts"]["languages"]:
            for text_idx, text in enumerate(SAMPLE_TEXTS[:3]):  # Fewer samples
                if downloaded >= target_count:
                    break
                
                config = {
                    "id": f"xtts_{lang}_{text_idx}",
                    "text": text,
                    "language": lang,
                }
                
                output_file = output_path / f"{sample_id:04d}_xtts_{lang}.wav"
                
                if download_voice_sample("xtts", config, output_file):
                    downloaded += 1
                else:
                    failed += 1
                
                sample_id += 1
                time.sleep(0.5)
    
    # 3. Bark samples (many speakers)
    if downloaded < target_count:
        print(f"\n[3/3] Generating Bark samples...")
        for speaker in VOICE_CONFIGS["bark"]["speakers"][:100]:  # Limit to 100
            if downloaded >= target_count:
                break
            
            text = SAMPLE_TEXTS[downloaded % len(SAMPLE_TEXTS)]
            
            config = {
                "id": f"bark_{speaker.replace('/', '_')}",
                "text": text,
                "speaker": speaker,
            }
            
            speaker_safe = speaker.replace("/", "_")
            output_file = output_path / f"{sample_id:04d}_bark_{speaker_safe}.wav"
            
            if download_voice_sample("bark", config, output_file):
                downloaded += 1
            else:
                failed += 1
            
            sample_id += 1
            time.sleep(0.5)
    
    # Summary
    print()
    print("=" * 60)
    print(f"✨ Voice Library Complete!")
    print(f"✅ Downloaded: {downloaded}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Location: {output_path.absolute()}")
    print("=" * 60)
    
    # Create metadata file
    metadata = {
        "total_samples": downloaded,
        "failed": failed,
        "models": list(TTS_MODELS.keys()),
        "directory": str(output_path.absolute()),
    }
    
    with open(output_path / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n📋 Metadata saved: {output_path / 'metadata.json'}")
    print("\nNext steps:")
    print("  1. Listen to samples: open voice_library/")
    print("  2. Match to characters: python match_voices_to_characters.py")
    
    return downloaded


if __name__ == "__main__":
    import sys
    
    target = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    
    print("⚠️  NOTE: This will make ~300 API requests to HuggingFace")
    print("   It may take 10-30 minutes depending on rate limits")
    print()
    
    response = input("Continue? (y/n): ")
    if response.lower() == "y":
        build_voice_library(target_count=target)
    else:
        print("Cancelled.")
