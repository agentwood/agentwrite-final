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
        
        # New "Elite" parameters
        archetype = input_data.get("archetype")
        gender = input_data.get("gender", "unknown")
        character_id = input_data.get("character_id", "unknown")
        
        # Legacy parameters (fallback)
        language = input_data.get("language", "en")
        accent_hint = input_data.get("accent_hint", "")
        exaggeration = input_data.get("exaggeration", 0.5)
        temperature = input_data.get("temperature", 0.8)
        
        if len(text) > 500: text = text[:500]
        
        print(f"Synthesizing for {character_id} ({archetype}/{gender}): '{text[:30]}...'")
        
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
