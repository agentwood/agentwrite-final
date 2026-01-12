import runpod
import torch
import soundfile as sf
import base64
import io
import os
import random
import numpy as np
import threading
import time

# Import F5-TTS
from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_checkpoint, load_vocoder, infer_process

# Import Idle Handler
import idle_handler

# START IDLE CHECKER BACKGROUND THREAD
def idle_checker_loop():
    while True:
        idle_handler.check_idle()
        time.sleep(60) # Check every minute

threading.Thread(target=idle_checker_loop, daemon=True).start()

# GLOBAL STATE (Loaded once on cold start)
model = None
vocoder = None
# supertonic_session = None # Placeholder for ONNX session
device = "cuda" if torch.cuda.is_available() else "cpu"

def init_model():
    global model, vocoder
    print(f"Loading F5-TTS model on {device}...")
    
    # Load F5-TTS (using default checkpoint name)
    model = load_checkpoint(target_dir=None, checkpoint_name="F5-TTS", device=device, show_progress=False)
    vocoder = load_vocoder(is_local=False)
    
    print("Model loaded successfully!")

def handler(event):
    global model, vocoder
    
    # Reset idle timer
    idle_handler.update_activity()
    
    if model is None:
        init_model()

    input_data = event.get("input", {})
    
    engine = input_data.get("engine", "f5") # Default to F5
    
    # --- SUPERTONIC HANDLER (Placeholder/Fusion) ---
    if engine == "supertonic":
        # In a real fusion, we would run ONNX inference here using onnxruntime
        # For now, we'll log it and perhaps fallback or return a special response
        print("Supertonic Engine Requested")
        text = input_data.get("text")
        # TODO: Implement actual ONNX inference here
        # return run_supertonic_inference(text, ...)
        return {"error": "Supertonic server-side inference not yet fully implemented"}

    # --- INPUT VALIDATION ---
    text = input_data.get("text")
    if not text:
        return {"error": "No text provided"}

    ref_audio_base64 = input_data.get("ref_audio")
    ref_text = input_data.get("ref_text", "") # Optional reference text
    
    # Custom Integers & Floats
    seed = input_data.get("seed", -1) # -1 = Random
    n_steps = input_data.get("steps", 32) # Default 32 steps (balance speed/quality)
    speed = input_data.get("speed", 1.0)
    
    # --- PREPARE REFERENCE AUDIO ---
    # F5-TTS needs a reference audio file path usually. We'll write the base64 to /tmp
    ref_audio_path = "/tmp/ref_audio.wav"
    
    if ref_audio_base64:
        try:
            audio_data = base64.b64decode(ref_audio_base64)
            with open(ref_audio_path, "wb") as f:
                f.write(audio_data)
        except Exception as e:
            return {"error": f"Invalid reference audio base64: {str(e)}"}
    else:
        # Fallback? F5-TTS needs reference. 
        return {"error": "Reference audio (ref_audio) is required for Zero-Shot Cloning"}

    # --- SET SEED (THE "CUSTOM INTEGER") ---
    if seed != -1:
        torch.manual_seed(seed)
        np.random.seed(seed)
        random.seed(seed)
    
    # --- INFERENCE ---
    try:
        # infer_process returns -> (sample_rate, numpy_audio_array, spectogram)
        audio_output, sample_rate, _ = infer_process(
            ref_audio_path,
            ref_text,
            text,
            model,
            vocoder,
            nfe_step=n_steps, # Number of Flow Steps
            speed=speed,
            device=device
        )
        
        # --- ENCODE OUTPUT ---
        # Convert numpy array to wav bytes
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
        print(f"Inference Error: {str(e)}")
        return {"error": f"Inference failed: {str(e)}"}

# Register the handler
runpod.serverless.start({"handler": handler})
