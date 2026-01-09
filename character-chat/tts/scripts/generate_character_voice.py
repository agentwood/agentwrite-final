import os
import json
import random
import torch
import soundfile as sf

# Try-except block to handle potential missing dependency during setup
try:
    from chatterbox import ChatterboxTTS
except ImportError:
    print("Warning: chatterbox module not found. Please install requirements.txt")
    class ChatterboxTTS:
        def __init__(self, **kwargs): pass
        def generate(self, **kwargs): return []

BASE_DIR = "tts"

MODEL_PATH = f"{BASE_DIR}/models/chatterbox_base"
ARCHETYPES_PATH = f"{BASE_DIR}/archetypes"
ANCHORS_PATH = f"{BASE_DIR}/voice_profiles/anchors"
OUTPUT_PATH = f"{BASE_DIR}/output_audio"
CHARACTERS_PATH = f"{BASE_DIR}/characters"

os.makedirs(OUTPUT_PATH, exist_ok=True)

# ---------- utilities ----------

# ---------- utilities ----------

def load_json(path):
    with open(path, "r") as f:
        return json.load(f)

# Pre-load all anchor profiles once
def load_all_anchor_profiles():
    voice_profiles = {}
    for root, _, files in os.walk(ANCHORS_PATH):
        if "profile.json" in files:
            try:
                profile = load_json(os.path.join(root, "profile.json"))
                # Use the directory name as the profile ID
                profile_id = os.path.basename(root)
                voice_profiles[profile_id] = profile
            except Exception as e:
                print(f"Error loading profile in {root}: {e}")
    return voice_profiles

def clamp(val, min_v, max_v):
    return max(min_v, min(val, max_v))

ALL_VOICE_PROFILES = load_all_anchor_profiles()

def pick_anchor(archetype_name, target_gender='unknown'):
    # Map 'M'/'F' to 'male'/'female'
    if target_gender.lower() in ['m', 'male']: target_gender = 'male'
    if target_gender.lower() in ['f', 'female']: target_gender = 'female'

    candidates = []
    
    # First pass: try to find exact match (archetype + gender)
    for pid, profile in ALL_VOICE_PROFILES.items():
        if profile.get("base_archetype") != archetype_name:
            continue
            
        # Determine profile gender
        p_gender = profile.get("gender", "").lower()
        if not p_gender:
            # Fallback: infer from ID
            if "male" in pid and "female" not in pid: p_gender = "male"
            elif "female" in pid: p_gender = "female"
            
        if p_gender == target_gender:
            candidates.append((os.path.join(ANCHORS_PATH, pid), profile))

    # Second pass: if no gender match, fallback to just archetype
    if not candidates:
        print(f"No gender-matched anchor found for {archetype_name}/{target_gender}. Falling back...")
        for pid, profile in ALL_VOICE_PROFILES.items():
            if profile.get("base_archetype") == archetype_name:
                candidates.append((os.path.join(ANCHORS_PATH, pid), profile))

    if not candidates:
        raise ValueError(f"No anchor voice found for archetype: {archetype_name}")

    return random.choice(candidates)

# ---------- main generation ----------

def generate(character_file):
    print(f"Processing {character_file}...")
    try:
        character = load_json(os.path.join(CHARACTERS_PATH, character_file))
    except Exception as e:
        print(f"Failed to load character {character_file}: {e}")
        return

    archetype = character.get("archetype")
    script = character.get("script")
    gender = character.get("gender", "unknown")
    constraints = character.get("voice_constraints", {})

    if not archetype or not script:
        print(f"Skipping {character_file}: Missing archetype or script")
        return

    try:
        anchor_path, profile = pick_anchor(archetype, target_gender=gender)
    except ValueError as e:
        print(e)
        return

    conditioning = profile.get("conditioning", {})
    limits = profile.get("allowed_variation", {})

    # Default limits if missing
    if not limits:
        limits = {
            "pitch_shift": [-2.0, 2.0],
            "speed": [0.5, 1.5],
            "energy": [0.0, 1.0]
        }

    pitch = clamp(
        conditioning.get("pitch_shift", 0) + constraints.get("pitch_bias", 0),
        *limits.get("pitch_shift", [-2, 2])
    )

    speed = clamp(
        conditioning.get("speed", 1.0) + constraints.get("speed_bias", 0),
        *limits.get("speed", [0.5, 1.5])
    )

    energy = clamp(
        conditioning.get("energy", 0.5) + constraints.get("energy_bias", 0),
        *limits.get("energy", [0, 1])
    )

    print(f"Generating voice for {character.get('character_id', 'unknown')}")
    print(f"Pitch: {pitch}, Speed: {speed}, Energy: {energy}")
    print(f"Anchor: {os.path.basename(anchor_path)}")

    # Check for reference audio
    ref_audio_path = os.path.join(anchor_path, "reference.wav")
    if not os.path.exists(ref_audio_path):
        print(f"Warning: Reference audio not found at {ref_audio_path}")
        return

    try:
        # Initializing from pretrained as local model path is empty
        tts = ChatterboxTTS.from_pretrained(
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
        
        print("Synthesizing...")
        audio = tts.generate(
            text=script,
            audio_prompt_path=ref_audio_path, # Mapped from reference_audio
            # pitch_shift=pitch, # Not supported in v0.1.6
            # speed=speed,      # Not supported in v0.1.6
            # energy=energy,    # Not supported in v0.1.6
            exaggeration=0.5, # Default
            temperature=0.8   # Default
        )

        print(f"Audio generated. Type: {type(audio)}, Shape: {audio.shape if hasattr(audio, 'shape') else 'N/A'}")
        
        # Convert PyTorch tensor to NumPy array for soundfile
        if isinstance(audio, torch.Tensor):
            audio = audio.cpu().squeeze().numpy()

        out_file = os.path.join(
            OUTPUT_PATH,
            f"{character.get('character_id', 'output')}.wav"
        )
        
        # Ensure output directory exists (redundant check)
        os.makedirs(os.path.dirname(out_file), exist_ok=True)

        # Explicitly write as WAV with 24000Hz
        try:
            sf.write(out_file, audio, 24000, subtype='PCM_16', format='WAV')
            print(f"Saved → {out_file}")
        except Exception as e:
            print(f"sf.write failed: {e}")
            # Fallback debug: just write a text file to confirm permissions
            with open(out_file + ".txt", "w") as f: f.write("Debug write")
            print("Debug text file written successfully.")
    except Exception as e:
        print(f"Generation failed: {e}")

# ---------- entry ----------

if __name__ == "__main__":
    if not os.path.exists(CHARACTERS_PATH):
         print(f"Characters directory not found at {CHARACTERS_PATH}")
    else:
        for file in os.listdir(CHARACTERS_PATH):
            if file.endswith(".json"):
                generate(file)
