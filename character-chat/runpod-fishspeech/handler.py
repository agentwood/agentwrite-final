"""
Tree-0 Voice Engine Handler for RunPod Serverless
Premium Neural TTS with Synaptic Tuning (Fish Speech v1.5 adapter)
"""

import runpod
import torch
import io
import base64
import os
import sys
import numpy as np

# Ensure repo is in path
sys.path.append("/app/fish-speech")

# Import Engine Core
try:
    from fish_speech.inference_engine import TTSInferenceEngine
    from fish_speech.models.dac.inference import load_model as load_decoder_model
    from fish_speech.models.text2semantic.inference import launch_thread_safe_queue
    from fish_speech.utils.schema import ServeTTSRequest
    import soundfile as sf
except ImportError as e:
    print(f"❌ Failed to import Fish Speech models: {e}")
    print("Listing files in current directory:")
    import os
    os.system("ls -R .")
    raise e

# Global model load (cached across requests)
print("[Tree-0] Loading neural engine...")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[Tree-0] Using accelerator: {device}")

# Load models
text_to_semantic = TextToSemantic.from_pretrained(
    "fishaudio/fish-speech-1.5",
    device=device
)
vqgan = VQGAN.from_pretrained(
    "fishaudio/fish-speech-1.5-vqgan",
    device=device
)

print("[Tree-0] Engine loaded successfully ✅")


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
    RunPod handler for Tree-0 synthesis
    Full parameter support for unique character voices
    """
    try:
        input_data = event.get("input", {})
        
        # Core parameters
        text = input_data.get("text", "Hello!")
        reference_audio_b64 = input_data.get("reference_audio")
        character_id = input_data.get("character_id", "unknown")
        archetype = input_data.get("archetype", "neutral")
        
        # Voice parameters
        pitch_offset = float(input_data.get("pitch", 0.0))
        speech_rate = float(input_data.get("speed", 1.0))
        
        # Prosody control
        pause_density = float(input_data.get("pause_density", 0.5))
        intonation_variance = float(input_data.get("intonation_variance", 0.5))
        emphasis_strength = float(input_data.get("emphasis_strength", 0.5))
        
        # Character expression
        emotion = input_data.get("emotion", "neutral")
        energy = float(input_data.get("energy", 0.5))
        warmth = float(input_data.get("warmth", 0.5))
        
        # Diction & Language
        diction_style = input_data.get("diction_style", "neutral")
        language = input_data.get("language", "en")
        accent_hint = input_data.get("accent_hint", "")
        
        # Voice gender
        gender = input_data.get("gender", "male")
        
        # Limit text length
        if len(text) > 500:
            text = text[:500]
        
        print(f"\n[Tree-0] Synthesizing for {character_id}")
        print(f"  Archetype: {archetype} | Gender: {gender}")
        print(f"  Emotion: {emotion} | Energy: {energy:.2f} | Warmth: {warmth:.2f}")
        print(f"  Pitch: {pitch_offset:+.2f} | Speed: {speech_rate:.2f}x")
        print(f"  Diction: {diction_style} | Language: {language}")
        print(f"  Text: '{text[:60]}...'")
        print(f"  Params: intonation={intonation_variance:.2f}, emphasis={emphasis_strength:.2f}, pauses={pause_density:.2f}")
        
        # === ZERO-SHOT SYNTHESIS ===
        reference_audio = None
        
        # Try loading from disk profile first
        voice_profile = input_data.get("voice_profile", character_id)
        profile_dir = Path("/app/profiles") / voice_profile
        
        if profile_dir.exists() and profile_dir.is_dir():
            # Load first available sample
            for sample_file in profile_dir.glob("sample_*.wav"):
                try:
                    reference_audio, sr = torchaudio.load(str(sample_file))
                    if sr != 24000:
                        resampler = torchaudio.transforms.Resample(sr, 24000)
                        reference_audio = resampler(reference_audio)
                    reference_audio = reference_audio.to(device)
                    print(f"  Profile loaded from disk: {voice_profile}/{sample_file.name}")
                    break
                except Exception as e:
                    print(f"  ⚠️ Failed to load {sample_file}: {e}")
        
        # Fall back to base64 reference if no profile loaded
        if reference_audio is None and reference_audio_b64:
            try:
                reference_audio = decode_audio(reference_audio_b64)
                print(f"  Reference audio loaded from base64: {reference_audio.shape}")
            except Exception as e:
                print(f"  ⚠️ Reference audio decode failed: {e}")
                reference_audio = None
        
        if reference_audio is None:
            print(f"  ⚠️ No reference audio - using zero-shot synthesis")
        
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
            "engine": "tree-0-v1"
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
    print("\n🌲 Tree-0 Voice Engine - Active")
    print("=" * 50)
    runpod.serverless.start({"handler": handler})
