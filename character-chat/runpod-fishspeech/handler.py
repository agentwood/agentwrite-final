"""
Fish Speech 1.5 Handler for RunPod Serverless
Tree-0 Voice Engine - Premium TTS
Benchmarks: Outperforms ElevenLabs & MiniMax on naturalness
"""

import runpod
import torch
import torchaudio
import io
import base64
import os
from pathlib import Path

# Import Fish Speech (will be installed in Docker)
try:
    from fish_speech.models.text_to_semantic import TextToSemantic
    from fish_speech.models.vqgan import VQGAN
    import fish_speech
except ImportError:
    print("⚠️ Fish Speech not installed. Installing...")
    os.system("pip install fish-speech-1.5")
    from fish_speech.models.text_to_semantic import TextToSemantic
    from fish_speech.models.vqgan import VQGAN

# Global model load (cached across requests)
print("[Fish Speech] Loading models...")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[Fish Speech] Using device: {device}")

# Load models
text_to_semantic = TextToSemantic.from_pretrained(
    "fishaudio/fish-speech-1.5",
    device=device
)
vqgan = VQGAN.from_pretrained(
    "fishaudio/fish-speech-1.5-vqgan",
    device=device
)

print("[Fish Speech] Models loaded successfully ✅")


def decode_audio(base64_str: str):
    """Decode base64 audio to tensor"""
    audio_bytes = base64.b64decode(base64_str)
    audio, sr = torchaudio.load(io.BytesIO(audio_bytes))
    # Resample to 24000 if needed
    if sr != 24000:
        resampler = torchaudio.transforms.Resample(sr, 24000)
        audio = resampler(audio)
    return audio.to(device)


def apply_pitch_shift(audio: torch.Tensor, semitones: float, sr: int = 24000):
    """Apply pitch shift using resampling (tape speed effect)"""
    if semitones == 0:
        return audio
    
    pitch_ratio = 2 ** (semitones / 12.0)
    effective_sr = int(sr * pitch_ratio)
    
    resampler = torchaudio.transforms.Resample(effective_sr, sr)
    return resampler(audio)


def apply_speed_change(audio: torch.Tensor, speed: float, sr: int = 24000):
    """Apply speed change via time stretching"""
    if speed == 1.0:
        return audio
    
    # Simple resampling for speed (Sox-style)
    target_sr = int(sr / speed)
    resampler_down = torchaudio.transforms.Resample(sr, target_sr)
    resampler_up = torchaudio.transforms.Resample(target_sr, sr)
    
    return resampler_up(resampler_down(audio))


def handler(event):
    """
    RunPod handler for Fish Speech synthesis
    
    Expected input:
    {
      "text": "Hello world",
      "reference_audio": "base64_encoded_audio",  # Optional (10s max)
      "pitch": 0.0,         # Semitones (-3 to +3)
      "speed": 1.0,         # Multiplier (0.7 to 1.5)
      "character_id": "dr_lucien_vale",
      "archetype": "dark_manipulator"
    }
    """
    try:
        input_data = event.get("input", {})
        
        # Extract parameters
        text = input_data.get("text", "Hello!")
        reference_audio_b64 = input_data.get("reference_audio")
        pitch_offset = float(input_data.get("pitch", 0.0))
        speech_rate = float(input_data.get("speed", 1.0))
        character_id = input_data.get("character_id", "unknown")
        archetype = input_data.get("archetype", "neutral")
        
        # Limit text length
        if len(text) > 500:
            text = text[:500]
        
        print(f"\n[Fish Speech] Synthesizing for {character_id}")
        print(f"  Archetype: {archetype}")
        print(f"  Text: '{text[:60]}...'")
        print(f"  Params: pitch={pitch_offset:.2f}, speed={speech_rate:.2f}")
        
        # === ZERO-SHOT SYNTHESIS ===
        reference_audio = None
        
        if reference_audio_b64:
            try:
                reference_audio = decode_audio(reference_audio_b64)
                print(f"  Reference audio loaded: {reference_audio.shape}")
            except Exception as e:
                print(f"  ⚠️ Reference audio decode failed: {e}")
                reference_audio = None
        
        # Generate semantic tokens from text
        with torch.no_grad():
            semantic_tokens = text_to_semantic.generate(
                text=text,
                reference_audio=reference_audio,
                max_new_tokens=1024,
                temperature=0.7,
                top_p=0.9
            )
            
            # Decode to audio waveform
            audio = vqgan.decode(semantic_tokens)
        
        # === POST-PROCESSING ===
        # Apply pitch shift
        if pitch_offset != 0.0:
            audio = apply_pitch_shift(audio, pitch_offset)
            print(f"  ✓ Applied pitch shift: {pitch_offset:.2f} semitones")
        
        # Apply speed change
        if speech_rate != 1.0:
            audio = apply_speed_change(audio, speech_rate)
            print(f"  ✓ Applied speed change: {speech_rate:.2f}x")
        
        # === EXPORT ===
        # Ensure correct shape (C, T)
        if audio.dim() == 1:
            audio = audio.unsqueeze(0)
        
        # Normalize
        audio = audio / audio.abs().max() * 0.95
        
        # Save to buffer
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio.cpu(), 24000, format="wav")
        audio_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        audio_length = audio.shape[-1] / 24000  # seconds
        print(f"  ✅ Generated {audio_length:.2f}s of audio")
        
        return {
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": 24000,
            "duration": audio_length,
            "character_id": character_id,
            "engine": "fish-speech-1.5"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }


# Start RunPod serverless worker
if __name__ == "__main__":
    print("\n🐟 Fish Speech 1.5 - Tree-0 Engine")
    print("=" * 50)
    runpod.serverless.start({"handler": handler})
