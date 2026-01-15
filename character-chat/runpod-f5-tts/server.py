from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any
import torch
import base64
import io
import uuid
import os
import soundfile as sf
import uvicorn
import numpy as np
import random

# Import F5-TTS
from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_checkpoint, load_vocoder, infer_process

app = FastAPI()

# --- GLOBAL STATE ---
model = None
vocoder = None
device = "cuda" if torch.cuda.is_available() else "cpu"

# --- PYDANTIC MODELS ---
class InputPayload(BaseModel):
    text: str
    ref_audio: Optional[str] = None # Base64
    ref_text: Optional[str] = ""
    seed: Optional[int] = -1
    steps: Optional[int] = 32
    speed: Optional[float] = 1.0
    engine: Optional[str] = "f5"

class RunRequest(BaseModel):
    input: InputPayload

# --- LIFECYCLE ---
@app.on_event("startup")
async def startup_event():
    global model, vocoder
    print(f"[SERVER] Loading F5-TTS model on {device}...")
    try:
        model = load_checkpoint(target_dir=None, checkpoint_name="F5-TTS", device=device, show_progress=False)
        vocoder = load_vocoder(is_local=False)
        print("[SERVER] Model loaded successfully!")
        
        # Signal readiness to entrypoint script
        with open("/tmp/READY", "w") as f:
            f.write("OK")
    except Exception as e:
        print(f"[SERVER] CRITICAL FAILURE loading model: {e}")
        # We don't exit here, but /ready will fail

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    if model is not None and vocoder is not None:
        return {"ready": True}
    raise HTTPException(status_code=503, detail="Model not loaded")

@app.post("/run")
async def run(request: RunRequest):
    global model, vocoder
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    input_data = request.input
    
    if not input_data.text:
        return {"error": "No text provided"}

    # Reference Audio Handling
    temp_id = str(uuid.uuid4())[:8]
    ref_audio_path = f"/tmp/ref_audio_{temp_id}.mp3"
    
    if input_data.ref_audio:
        try:
            audio_data = base64.b64decode(input_data.ref_audio)
            with open(ref_audio_path, "wb") as f:
                f.write(audio_data)
        except Exception as e:
            return {"error": f"Invalid reference audio base64: {str(e)}"}
    else:
        return {"error": "Reference audio (ref_audio) is required"}

    # Seed
    if input_data.seed != -1:
        torch.manual_seed(input_data.seed)
        np.random.seed(input_data.seed)
        random.seed(input_data.seed)

    # Inference
    try:
        audio_output, sample_rate, _ = infer_process(
            ref_audio_path,
            input_data.ref_text,
            input_data.text,
            model,
            vocoder,
            nfe_step=input_data.steps,
            speed=input_data.speed,
            device=device
        )
        
        # Cleanup
        if os.path.exists(ref_audio_path):
            os.remove(ref_audio_path)

        # Encode
        buffer = io.BytesIO()
        sf.write(buffer, audio_output, sample_rate, format='WAV')
        audio_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            "id": f"job-{temp_id}",
            "status": "COMPLETED", # RunPod serverless expects this format often
            "output": {
                "audio": audio_base64,
                "format": "wav",
                "sample_rate": sample_rate,
                "engine": "f5"
            }
        }
        
    except Exception as e:
        print(f"Inference Error: {str(e)}")
        return {"error": f"Inference failed: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
