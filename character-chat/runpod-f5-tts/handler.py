import runpod
import torch
import soundfile as sf
import base64
import io
import os
import random
import numpy as np
import uuid

# Import F5-TTS
from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_checkpoint, load_vocoder, infer_process

# ============== GLOBAL STATE ==============
# Load model at import time (BEFORE runpod.serverless.start)
# This ensures the worker is WARM when it receives its first job.
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[F5-TTS] Device: {device}")

print("[F5-TTS] Loading model into memory (this may take 30-60s)...")
model = load_checkpoint(target_dir=None, checkpoint_name="F5-TTS", device=device, show_progress=True)
vocoder = load_vocoder(is_local=False)
print("[F5-TTS] Model loaded successfully! Worker is WARM.")

# ============== HANDLER ==============
def handler(event):
    """
    RunPod Serverless handler function.
    Called for each job in the queue.
    """
    global model, vocoder
    
    input_data = event.get("input", {})
    
    # --- INPUT VALIDATION ---
    text = input_data.get("text")
    if not text:
        return {"error": "No text provided"}

    ref_audio_base64 = input_data.get("ref_audio")
    ref_text = input_data.get("ref_text", "")
    
    # Custom parameters
    seed = input_data.get("seed", -1)  # -1 = Random
    n_steps = input_data.get("steps", 32)
    speed = input_data.get("speed", 1.0)
    
    # --- PREPARE REFERENCE AUDIO ---
    temp_id = str(uuid.uuid4())[:8]
    ref_audio_path = f"/tmp/ref_audio_{temp_id}.mp3"
    
    if ref_audio_base64:
        try:
            audio_data = base64.b64decode(ref_audio_base64)
            with open(ref_audio_path, "wb") as f:
                f.write(audio_data)
            print(f"[F5-TTS] Reference audio: {len(audio_data)} bytes")
        except Exception as e:
            return {"error": f"Invalid reference audio base64: {str(e)}"}
    else:
        return {"error": "Reference audio (ref_audio) is required"}

    # --- SET SEED ---
    if seed != -1:
        torch.manual_seed(seed)
        np.random.seed(seed)
        random.seed(seed)
    
    # --- INFERENCE ---
    try:
        audio_output, sample_rate, _ = infer_process(
            ref_audio_path,
            ref_text,
            text,
            model,
            vocoder,
            nfe_step=n_steps,
            speed=speed,
            device=device
        )
        
        # Cleanup temp file
        if os.path.exists(ref_audio_path):
            os.remove(ref_audio_path)

        # Encode output as base64 WAV
        buffer = io.BytesIO()
        sf.write(buffer, audio_output, sample_rate, format='WAV')
        audio_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            "audio": audio_base64,
            "format": "wav",
            "sample_rate": sample_rate,
            "seed_used": seed,
            "steps_used": n_steps,
            "engine": "f5"
        }
        
    except Exception as e:
        print(f"[F5-TTS] Inference Error: {str(e)}")
        # Cleanup on error
        if os.path.exists(ref_audio_path):
            os.remove(ref_audio_path)
        return {"error": f"Inference failed: {str(e)}"}

# ============== START SERVERLESS ==============
# This MUST be called for RunPod Serverless to work
runpod.serverless.start({"handler": handler})
