import runpod
import base64
import io
import os
import json
import random
import torch
import torchaudio

# Global state
model = None
VOICE_PROFILES = {}
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILES_DIR = os.path.join(BASE_DIR, "profiles")

def load_json(path):
    with open(path, "r") as f:
        return json.load(f)

def load_all_profiles():
    """Load all archetype anchor profiles from disk"""
    profiles = {}
    if not os.path.exists(PROFILES_DIR):
        print(f"Warning: Profiles directory not found at {PROFILES_DIR}")
        return profiles
        
    for root, _, files in os.walk(PROFILES_DIR):
        if "profile.json" in files:
            try:
                profile = load_json(os.path.join(root, "profile.json"))
                pid = os.path.basename(root)
                profiles[pid] = profile
            except Exception as e:
                print(f"Error loading profile {root}: {e}")
    return profiles

VOICE_PROFILES = load_all_profiles()
print(f"Loaded {len(VOICE_PROFILES)} voice anchor profiles.")

def pick_anchor(archetype_name, target_gender='unknown'):
    # Map 'M'/'F' to 'male'/'female'
    if target_gender.lower() in ['m', 'male']: target_gender = 'male'
    if target_gender.lower() in ['f', 'female']: target_gender = 'female'

    candidates = []
    
    # First pass: try to find exact match (archetype + gender)
    for pid, profile in VOICE_PROFILES.items():
        if profile.get("base_archetype") != archetype_name:
            continue
            
        # Determine profile gender
        p_gender = profile.get("gender", "").lower()
        if not p_gender:
            # Fallback: infer from ID
            if "male" in pid and "female" not in pid: p_gender = "male"
            elif "female" in pid: p_gender = "female"
            
        if p_gender == target_gender:
            candidates.append((os.path.join(PROFILES_DIR, pid), profile))

    # Second pass: if no gender match, fallback to just archetype (but log warning)
    if not candidates:
        print(f"Warning: No gender-matched anchor for {archetype_name}/{target_gender}. Fallback to any.")
        for pid, profile in VOICE_PROFILES.items():
            if profile.get("base_archetype") == archetype_name:
                candidates.append((os.path.join(PROFILES_DIR, pid), profile))

    if not candidates:
        return None, None

    return random.choice(candidates)

def load_model():
    """Load Chatterbox TTS model (cached between requests)"""
    global model
    if model is None:
        print("Loading Chatterbox TTS model...")
        from chatterbox import ChatterboxTTS
        # Initialize with CUDA if available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = ChatterboxTTS.from_pretrained(device=device)
        print(f"Model loaded successfully on {device}!")
    return model

def handler(event):
    try:
        input_data = event.get("input", {})
        text = input_data.get("text", "Hello!")
        
        # === ARCHETYPE PARAMETERS ===
        archetype = input_data.get("archetype")
        gender = input_data.get("gender", "unknown")
        character_id = input_data.get("character_id", "unknown")
        
        # === AUDIO PROFILE PARAMETERS (from 20-archetype system) ===
        pitch_offset = float(input_data.get("pitch", 0.0))        # Semitones (-3 to +3)
        speech_rate = float(input_data.get("speed", 1.0))         # 0.75 to 1.3
        pause_density = float(input_data.get("pause_density", 0.5))    # 0.0 to 1.0
        intonation_variance = float(input_data.get("intonation_variance", 0.5))  # 0.0 to 1.0
        emphasis_strength = float(input_data.get("emphasis_strength", 0.5))  # 0.0 to 1.0
        
        # === GENERATION PARAMETERS ===
        exaggeration = float(input_data.get("exaggeration", 0.5))
        temperature = float(input_data.get("temperature", 0.8))
        
        # === LEGACY PARAMETERS (fallback) ===
        language = input_data.get("language", "en")
        accent_hint = input_data.get("accent_hint", "")
        
        if len(text) > 500: text = text[:500]
        
        print(f"Synthesizing for {character_id} ({archetype}/{gender})")
        print(f"  Audio Profile: pitch={pitch_offset}, rate={speech_rate}, pauses={pause_density}, intonation={intonation_variance}")
        print(f"  Text: '{text[:40]}...'")
        
        tts = load_model()
        
        # Try to use Elite Archetype System
        audio_prompt_path = None
        if archetype:
            anchor_path, profile = pick_anchor(archetype, gender)
            if anchor_path:
                ref_file = os.path.join(anchor_path, "reference.wav")
                if os.path.exists(ref_file):
                    audio_prompt_path = ref_file
                    print(f"Using Elite Anchor: {os.path.basename(anchor_path)}")
        
        # Generate
        with torch.no_grad():
            if audio_prompt_path:
                # Elite Mode: Clone from reference
                print(f"Generating with reference audio: {audio_prompt_path}")
                audio = tts.generate(
                    text,
                    audio_prompt_path=audio_prompt_path,
                    exaggeration=exaggeration,
                    temperature=temperature
                )
            else:
                # Legacy Mode: Zero-shot with language/accent
                print(f"Generating with legacy mode (lang={language})")
                audio = tts.generate(
                    text,
                    language=language,
                    accent_hint=accent_hint,
                    exaggeration=exaggeration,
                    temperature=temperature
                )
        
        # Convert to WAV bytes
        buffer = io.BytesIO()
        # Ensure audio is CPU tensor and correct shape
        if isinstance(audio, torch.Tensor):
            audio = audio.cpu()
        
        # =============================================
        # AUDIO POST-PROCESSING (20-Archetype System)
        # =============================================
        # Apply pitch + speed modifications
        # We use "Tape Speed" effect: pitch shift also changes speed proportionally
        # This is natural and computationally efficient
        
        if pitch_offset != 0.0 or speech_rate != 1.0:
            import torchaudio.transforms as T
            
            # Combined effect: pitch_offset as semitones, speech_rate as multiplier
            # For simplicity, we'll apply them sequentially
            
            # 1. Pitch Shift (via resampling - "tape speed" effect)
            if pitch_offset != 0.0:
                # ratio > 1.0 -> Higher pitch, faster
                # ratio < 1.0 -> Lower pitch, slower
                pitch_ratio = 2 ** (pitch_offset / 12.0)
                
                # To shift pitch UP: pretend audio was recorded at higher rate, resample to 24000
                # To shift pitch DOWN: pretend audio was recorded at lower rate, resample to 24000
                effective_orig_freq = int(24000 * pitch_ratio)
                resampler = T.Resample(orig_freq=effective_orig_freq, new_freq=24000)
                audio = resampler(audio)
                print(f"  Applied pitch shift: {pitch_offset} semitones (ratio={pitch_ratio:.3f})")
            
            # 2. Speed Change (via additional resampling)
            # This is independent of pitch (we've already corrected for it above)
            if speech_rate != 1.0:
                # speed > 1.0 -> Faster playback
                # We resample to effectively stretch/compress the audio
                effective_speed_freq = int(24000 / speech_rate)
                speed_resampler = T.Resample(orig_freq=24000, new_freq=effective_speed_freq)
                audio = speed_resampler(audio)
                # Then resample back to 24000 for consistent output
                final_resampler = T.Resample(orig_freq=effective_speed_freq, new_freq=24000)
                audio = final_resampler(audio)
                print(f"  Applied speed change: {speech_rate}x")
        
        # Note: pause_density, intonation_variance, emphasis_strength
        # These require more complex DSP (silence insertion, F0 modification, dynamics)
        # For now, they are logged but not applied (future enhancement)
        if pause_density != 0.5 or intonation_variance != 0.5 or emphasis_strength != 0.5:
            print(f"  Note: pause_density={pause_density}, intonation={intonation_variance}, emphasis={emphasis_strength} (logged only)")

        # =============================================

        # torchaudio.save expects (C, T)
        if audio.dim() == 1:
            audio = audio.unsqueeze(0)
            
        torchaudio.save(buffer, audio, 24000, format="wav")
        buffer.seek(0)
        
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "sample_rate": 24000,
            "format": "wav",
            "used_anchor": os.path.basename(audio_prompt_path) if audio_prompt_path else "legacy"
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        # Return error structure RunPod expects
        return {"error": str(e)}

runpod.serverless.start({"handler": handler})
