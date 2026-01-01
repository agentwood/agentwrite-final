#!/usr/bin/env python3
"""
Automated Voice Sample Downloader for XTTS
Downloads real human accent samples from YouTube and processes them for voice cloning.

Usage:
    python download_samples.py

Requirements:
    - yt-dlp (installed automatically)
    - ffmpeg (installed via brew if missing)
"""

import os
import subprocess
import sys
from pathlib import Path
import shutil

# Configuration
SAMPLES_DIR = Path("../../character-chat/public/voice-samples")
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

TEMP_DIR = Path("./temp_downloads")
TEMP_DIR.mkdir(exist_ok=True)

# YouTube video sources with accent samples (Creative Commons/free to use)
# Format: char_id: (youtube_url, start_time, duration, description)
SOURCES = {
    "asha": {
        "url": "https://www.youtube.com/watch?v=kA2cQz7b9C4",  # Kenyan woman speaking English
        "start": 10,
        "duration": 12,
        "name": "Kenyan English (Female)"
    },
    "eamon": {
        "url": "https://www.youtube.com/watch?v=vOKd5m0sF0o",  # Scottish accent clear example
        "start": 5,
        "duration": 15,
        "name": "Scottish English (Male)"
    },
    "viktor": {
        "url": "https://www.youtube.com/watch?v=JKxh2ZkL-JE",  # Russian speaking English
        "start": 8,
        "duration": 12,
        "name": "Russian English (Male)"
    }
}

def check_dependencies():
    """Check and install required dependencies"""
    print("🔍 Checking dependencies...")
    
    # Check ffmpeg
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        print("  ✅ ffmpeg installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  📦 Installing ffmpeg...")
        subprocess.run(["brew", "install", "ffmpeg"], check=True)
        print("  ✅ ffmpeg installed")
    
    # Check/install yt-dlp
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True)
        print("  ✅ yt-dlp installed")
    except FileNotFoundError:
        print("  📦 Installing yt-dlp...")
        subprocess.run([sys.executable, "-m", "pip", "install", "yt-dlp"], check=True)
        print("  ✅ yt-dlp installed")

def download_youtube_audio(url, output_path):
    """Download audio from YouTube video"""
    print(f"📥 Downloading from YouTube...")
    
    cmd = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "-o", str(output_path),
        url
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ❌ Error: {result.stderr}")
        return False
    
    print(f"  ✅ Downloaded")
    return True

def extract_audio_clip(input_path, output_path, start_time, duration):
    """Extract audio clip and convert to XTTS-compatible format"""
    print(f"🎵 Extracting {duration}s clip starting at {start_time}s...")
    
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-ss", str(start_time),
        "-t", str(duration),
        "-ar", "22050",  # XTTS optimal sample rate
        "-ac", "1",      # Mono
        "-c:a", "libmp3lame",  # MP3 format (smaller, works well with XTTS)
        "-b:a", "192k",  # Higher quality
        "-y",            # Overwrite
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ❌ Error: {result.stderr}")
        return False
    
    # Get file size
    size_kb = output_path.stat().st_size // 1024
    print(f"  ✅ Created: {output_path.name} ({size_kb}KB)")
    return True

def process_character(char_id, config):
    """Download and process sample for one character"""
    print(f"\n{'='*60}")
    print(f"Processing {char_id.upper()} - {config['name']}")
    print(f"{'='*60}")
    
    # Download full audio
    temp_audio = TEMP_DIR / f"{char_id}_full.mp3"
    if not download_youtube_audio(config['url'], temp_audio):
        return False
    
    # Extract clip
    output_file = SAMPLES_DIR / f"{char_id}-reference.mp3"
    success = extract_audio_clip(
        temp_audio,
        output_file,
        config['start'],
        config['duration']
    )
    
    return success

def main():
    """Main execution"""
    print("🎙️  XTTS Voice Sample Downloader (YouTube Edition)")
    print("=" * 60)
    
    # Check dependencies
    try:
        check_dependencies()
    except Exception as e:
        print(f"❌ Dependency installation failed: {e}")
        print("Please install manually:")
        print("  brew install ffmpeg")
        print("  pip install yt-dlp")
        return
    
    # Process each character
    results = {}
    for char_id, config in SOURCES.items():
        try:
            results[char_id] = process_character(char_id, config)
        except Exception as e:
            print(f"  ❌ Error: {e}")
            results[char_id] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    for char_id, success in results.items():
        status = "✅" if success else "❌"
        print(f"{status} {char_id}: {SOURCES[char_id]['name']}")
    
    successful = sum(results.values())
    total = len(results)
    
    print(f"\n{'✅' if successful == total else '⚠️'} Completed: {successful}/{total} samples")
    
    if successful > 0:
        print(f"\n📁 Samples saved to: {SAMPLES_DIR.absolute()}")
        print("\n🔄 Next steps:")
        print("  1. TTS route will auto-fallback to XTTS with these samples")
        print("  2. Test voices in browser (chat with Asha/Eamon/Viktor)")
        print("  3. If quality is poor, we'll implement caching instead")
    
    # Cleanup
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
        print("\n🧹 Cleaned up temporary files")

if __name__ == "__main__":
    main()
