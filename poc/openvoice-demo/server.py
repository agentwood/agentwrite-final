"""
Minimal FastAPI wrapper for OpenVoice POC
Provides REST API endpoints for voice cloning and synthesis
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import base64
import tempfile
import json
from pathlib import Path

app = FastAPI(title="OpenVoice POC API")

# CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenVoice integration
try:
    from openvoice_integration import get_openvoice, is_openvoice_ready
    openvoice_initialized = is_openvoice_ready()
    if openvoice_initialized:
        openvoice_instance = get_openvoice()
    else:
        openvoice_instance = None
        print("⚠️  OpenVoice not initialized. Set up OpenVoice first (see README.md)")
except ImportError:
    openvoice_initialized = False
    openvoice_instance = None
    print("⚠️  OpenVoice integration module not found. Using placeholder mode.")

class SynthesizeRequest(BaseModel):
    text: str
    reference_audio_base64: Optional[str] = None
    reference_audio_url: Optional[str] = None
    speed: float = 1.0
    tone: Optional[str] = None
    emotion: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    openvoice_ready: bool

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        openvoice_ready=openvoice_initialized
    )

@app.post("/clone")
async def clone_voice(reference_audio: UploadFile = File(...)):
    """
    Clone voice from reference audio file
    Returns voice ID or embedding that can be used for synthesis
    """
    if not openvoice_initialized:
        raise HTTPException(
            status_code=503,
            detail="OpenVoice not initialized. Please set up OpenVoice first."
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
        content = await reference_audio.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        if not openvoice_instance or not openvoice_instance.is_ready():
            raise HTTPException(
                status_code=503,
                detail="OpenVoice not initialized. Please set up OpenVoice first."
            )
        
        # Clone voice
        speaker_embedding = openvoice_instance.clone_voice(tmp_path)
        
        if speaker_embedding is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to clone voice from reference audio"
            )
        
        # Generate voice ID (hash of embedding or store in cache)
        import hashlib
        import pickle
        import base64
        
        # Serialize embedding for storage
        embedding_bytes = pickle.dumps(speaker_embedding)
        voice_id = hashlib.md5(embedding_bytes).hexdigest()
        
        # Store embedding in cache (in production, use Redis or database)
        cache_dir = Path(__file__).parent / "cache"
        cache_dir.mkdir(exist_ok=True)
        cache_path = cache_dir / f"{voice_id}.pkl"
        with open(cache_path, 'wb') as f:
            f.write(embedding_bytes)
        
        return JSONResponse({
            "voice_id": voice_id,
            "message": "Voice cloned successfully"
        })
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@app.post("/synthesize")
async def synthesize(request: SynthesizeRequest):
    """
    Synthesize speech from text using cloned voice
    Returns PCM audio as base64
    """
    if not openvoice_initialized:
        raise HTTPException(
            status_code=503,
            detail="OpenVoice not initialized. Please set up OpenVoice first."
        )
    
    try:
        if not openvoice_instance or not openvoice_instance.is_ready():
            raise HTTPException(
                status_code=503,
                detail="OpenVoice not initialized. Please set up OpenVoice first."
            )
        
        # Get speaker embedding
        speaker_embedding = None
        
        if request.voice_id:
            # Load from cache
            cache_dir = Path(__file__).parent / "cache"
            cache_path = cache_dir / f"{request.voice_id}.pkl"
            if cache_path.exists():
                import pickle
                with open(cache_path, 'rb') as f:
                    speaker_embedding = pickle.load(f)
        
        if speaker_embedding is None and request.reference_audio_base64:
            # Clone from base64 reference audio
            import tempfile
            import base64 as b64
            
            audio_bytes = b64.b64decode(request.reference_audio_base64)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            try:
                speaker_embedding = openvoice_instance.clone_voice(tmp_path)
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
        
        if speaker_embedding is None:
            raise HTTPException(
                status_code=400,
                detail="No valid voice source provided. Use voice_id or reference_audio_base64."
            )
        
        # Synthesize speech
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_output:
            output_path = tmp_output.name
        
        try:
            result_path = openvoice_instance.synthesize(
                text=request.text,
                speaker_embedding=speaker_embedding,
                language='English',
                speed=request.speed or 1.0,
                output_path=output_path
            )
            
            if not result_path or not os.path.exists(result_path):
                raise HTTPException(
                    status_code=500,
                    detail="Synthesis failed"
                )
            
            # Read audio file and convert to base64 PCM
            import soundfile as sf
            import numpy as np
            
            audio_data, sample_rate = sf.read(result_path)
            
            # Convert to PCM16 (Int16)
            if audio_data.dtype != np.int16:
                audio_data = (audio_data * 32767).astype(np.int16)
            
            # Convert to base64
            import base64 as b64
            audio_bytes = audio_data.tobytes()
            audio_base64 = b64.b64encode(audio_bytes).decode('utf-8')
            
            return JSONResponse({
                "audio_base64": audio_base64,
                "sample_rate": int(sample_rate),
                "format": "pcm",
                "duration": len(audio_data) / sample_rate
            })
        finally:
            # Clean up temp files
            for path in [output_path, result_path]:
                if path and os.path.exists(path):
                    try:
                        os.unlink(path)
                    except:
                        pass

@app.post("/batch")
async def synthesize_batch(texts: list[str], voice_id: str):
    """
    Batch synthesize multiple texts with same voice
    """
    if not openvoice_initialized:
        raise HTTPException(
            status_code=503,
            detail="OpenVoice not initialized. Please set up OpenVoice first."
        )
    
    # TODO: Implement batch synthesis
    results = []
    for text in texts:
        # audio = await synthesize(SynthesizeRequest(text=text, reference_audio_base64=voice_id))
        results.append({"text": text, "audio_base64": ""})
    
    return JSONResponse({"results": results})

if __name__ == "__main__":
    import uvicorn
    print("Starting OpenVoice POC API server...")
    print("Note: OpenVoice needs to be set up first. See README.md")
    uvicorn.run(app, host="0.0.0.0", port=8000)

