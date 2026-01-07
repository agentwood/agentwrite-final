"""
RunPod Serverless Handler for Chatterbox TTS

This handler receives text input and returns base64-encoded audio.
"""

import runpod
import base64
import io
import torch
import torchaudio

# Global model instance (loaded once, reused across requests)
model = None

def load_model():
    """Load Chatterbox TTS model (cached between requests)"""
    global model
    if model is None:
        print("Loading Chatterbox TTS model...")
        from chatterbox import ChatterboxTTS
        model = ChatterboxTTS()
        print("Model loaded successfully!")
    return model

def handler(event):
    """
    RunPod serverless handler for TTS synthesis
    
    Input:
        text: str - Text to synthesize (max 300 chars)
        exaggeration: float - Emotion exaggeration (0.25-2.0, default 0.5)
        temperature: float - Sampling temperature (0.05-5.0, default 0.8)
        
    Output:
        audio_base64: str - Base64 encoded WAV audio
        sample_rate: int - Audio sample rate (24000)
    """
    try:
        # Get input parameters
        input_data = event.get("input", {})
        text = input_data.get("text", "Hello!")
        exaggeration = input_data.get("exaggeration", 0.5)
        temperature = input_data.get("temperature", 0.8)
        
        # Validate text length
        if len(text) > 300:
            text = text[:300]
        
        print(f"Synthesizing: '{text[:50]}...' (exag={exaggeration}, temp={temperature})")
        
        # Load model
        tts = load_model()
        
        # Generate audio
        with torch.no_grad():
            audio = tts.generate(
                text,
                exaggeration=exaggeration,
                temperature=temperature
            )
        
        # Convert to WAV bytes
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio.unsqueeze(0).cpu(), 24000, format="wav")
        buffer.seek(0)
        
        # Encode as base64
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        print(f"Generated {len(audio_base64)} bytes of base64 audio")
        
        return {
            "audio_base64": audio_base64,
            "sample_rate": 24000,
            "format": "wav",
            "text_length": len(text)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}

# Start the serverless handler
runpod.serverless.start({"handler": handler})
