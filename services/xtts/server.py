"""
XTTS v2 Voice Cloning Server
Local voice cloning with accent support - no ElevenLabs restrictions!

Usage:
  cd services/xtts
  source venv/bin/activate
  python server.py

The server will load on first request (lazy loading to speed up startup)
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import base64
import io
import os
import tempfile

# Auto-accept Coqui TOS for non-interactive environments
os.environ["COQUI_TOS_AGREED"] = "1"

app = FastAPI(title="XTTS Voice Cloning API")

# Lazy-load models to speed up startup
tts = None
device = None


def get_tts():
    """Lazy-load TTS model on first request"""
    global tts, device
    if tts is None:
        import torch
        from TTS.api import TTS
        
        # Allow XTTS config classes for PyTorch 2.6+ security features
        try:
            from TTS.tts.configs.xtts_config import XttsConfig
            from TTS.tts.models.xtts import XttsAudioConfig
            torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig])
        except Exception as e:
            print(f"[XTTS] Warning: Could not add safe globals: {e}")
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[XTTS] Loading model on {device}...")
        print("[XTTS] This may take a minute on first load...")
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
        print("[XTTS] Model loaded successfully!")
    return tts


class SynthesizeRequest(BaseModel):
    text: str
    speaker_wav: str  # Base64 encoded audio file (MP3 or WAV, 6-30 seconds)
    language: str = "en"


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": "xtts_v2",
        "device": device or "not_loaded",
        "languages": ["en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh-cn", "ja", "hu", "ko", "hi"]
    }


@app.post("/synthesize")
async def synthesize(request: SynthesizeRequest):
    """Generate speech using voice cloning from reference audio"""
    try:
        # Get TTS model (lazy load on first request)
        model = get_tts()
        
        # Decode speaker audio from base64
        try:
            speaker_wav_bytes = base64.b64decode(request.speaker_wav)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 audio: {str(e)}")
        
        # Detect file type and save with correct extension
        is_mp3 = speaker_wav_bytes[:3] == b'ID3' or speaker_wav_bytes[:2] == b'\xff\xfb'
        extension = ".mp3" if is_mp3 else ".wav"
        
        # Create temp file for reference audio
        speaker_fd, speaker_path = tempfile.mkstemp(suffix=extension)
        output_fd, output_path = tempfile.mkstemp(suffix=".wav")
        
        try:
            # Write reference audio to temp file
            with os.fdopen(speaker_fd, 'wb') as f:
                f.write(speaker_wav_bytes)
            
            print(f"[XTTS] Synthesizing: '{request.text[:50]}...' (ref: {len(speaker_wav_bytes)/1024:.0f}KB {extension})")
            
            # Generate speech
            model.tts_to_file(
                text=request.text,
                speaker_wav=speaker_path,
                language=request.language,
                file_path=output_path
            )
            
            # Read output audio
            with open(output_path, "rb") as f:
                audio_bytes = f.read()
            
            audio_base64 = base64.b64encode(audio_bytes).decode()
            
            print(f"[XTTS] Success! Generated {len(audio_bytes)/1024:.0f}KB audio")
            
            return {
                "audio": audio_base64,
                "format": "wav",
                "sample_rate": 24000
            }
            
        finally:
            # Clean up temp files
            try:
                os.close(output_fd)
            except:
                pass
            try:
                os.unlink(speaker_path)
            except:
                pass
            try:
                os.unlink(output_path)
            except:
                pass
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"[XTTS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("[XTTS] Starting server on http://localhost:8001")
    print("[XTTS] Model will be loaded on first request...")
    uvicorn.run(app, host="0.0.0.0", port=8001)

