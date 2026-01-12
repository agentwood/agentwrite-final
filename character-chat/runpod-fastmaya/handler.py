"""
FastMaya (Maya-1) RunPod Serverless Handler

Uses the FastMaya TTSEngine for 50x realtime TTS with voice descriptions.
Generates 48kHz audio via integrated AudioSR upsampler.

GPU Requirements:
- 8GB+ VRAM (24GB recommended for longer texts)
- A100/L40S/RTX 4090 for best performance
"""

import runpod
import base64
import io
import numpy as np

# =============================================
# MODEL LOADING
# =============================================

print("[FastMaya] Loading Maya-1 TTS Engine...")

try:
    from Maya1.tts_engine import TTSEngine
    
    # Use 80% of available VRAM, single GPU
    tts_engine = TTSEngine(memory_util=0.8, tp=1)
    print("[FastMaya] TTSEngine loaded successfully!")
except Exception as e:
    print(f"[FastMaya] Failed to load TTSEngine: {e}")
    tts_engine = None

# =============================================
# HANDLER
# =============================================

def handler(job):
    """
    RunPod job handler for FastMaya TTS.
    
    Input:
    {
        "text": "The text to synthesize",
        "voice_description": "Male, middle-aged, Ghanaian accent...",
        "seed": -1  (optional)
    }
    
    Output:
    {
        "audio": "<base64 encoded WAV>",
        "format": "wav",
        "sample_rate": 48000,
        "seed_used": <int>
    }
    """
    
    job_input = job["input"]
    
    text = job_input.get("text", "")
    voice_description = job_input.get("voice_description", "Neutral male voice")
    seed = job_input.get("seed", -1)
    
    if not text:
        return {"error": "No text provided"}
    
    if tts_engine is None:
        return {"error": "TTSEngine not loaded"}
    
    # Set seed for determinism
    import torch
    if seed != -1:
        torch.manual_seed(seed)
        used_seed = seed
    else:
        used_seed = torch.randint(0, 2**32 - 1, (1,)).item()
        torch.manual_seed(used_seed)
    
    print(f"[FastMaya] Generating: '{text[:50]}...' with voice='{voice_description[:30]}...'")
    
    try:
        # Generate audio using FastMaya
        audio = tts_engine.generate(text, voice_description)
        
        # Convert numpy array to WAV bytes
        import scipy.io.wavfile as wavfile
        buffer = io.BytesIO()
        
        # Audio is 48kHz from FastMaya's built-in AudioSR upsampler
        audio_int16 = (audio * 32767).astype(np.int16)
        wavfile.write(buffer, 48000, audio_int16)
        buffer.seek(0)
        
        audio_b64 = base64.b64encode(buffer.read()).decode("utf-8")
        
        print(f"[FastMaya] ✅ Generated {len(audio_int16)} samples (seed={used_seed})")
        
        return {
            "audio": audio_b64,
            "format": "wav",
            "sample_rate": 48000,
            "seed_used": used_seed
        }
        
    except Exception as e:
        print(f"[FastMaya] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


runpod.serverless.start({"handler": handler})
