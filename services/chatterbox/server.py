"""
FastAPI server for Chatterbox TTS
Exposes REST API for voice synthesis
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from chatterbox_service import get_chatterbox_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chatterbox TTS API")

# Initialize service
service = get_chatterbox_service()


class SynthesizeRequest(BaseModel):
    text: str
    character_id: str
    emotion: float = 0.5
    add_paralinguistic_tags: bool = False


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "configured": service.is_configured(),
        "available_characters": service.get_available_characters()
    }


@app.post("/synthesize")
async def synthesize(request: SynthesizeRequest):
    """
    Generate speech from text
    
    Args:
        text: Text to synthesize
        character_id: Character voice to use
        emotion: Emotion level (0.0-1.0)
        add_paralinguistic_tags: Enable auto-tagging
    
    Returns:
        WAV audio file
    """
    if not service.has_reference_audio(request.character_id):
        raise HTTPException(
            status_code=404,
            detail=f"No reference audio for character: {request.character_id}"
        )
    
    logger.info(f"Synthesizing: {request.text[:50]}... (character={request.character_id})")
    
    result = service.synthesize(
        text=request.text,
        character_id=request.character_id,
        emotion=request.emotion,
        add_paralinguistic_tags=request.add_paralinguistic_tags
    )
    
    if result is None:
        raise HTTPException(
            status_code=500,
            detail="Speech synthesis failed"
        )
    
    return Response(
        content=result['audio'],
        media_type=result['contentType'],
        headers={
            'X-Sample-Rate': str(result['sampleRate']),
            'X-Audio-Format': result['format']
        }
    )


@app.get("/characters")
async def list_characters():
    """Get list of available characters"""
    characters = service.get_available_characters()
    
    return {
        "characters": characters,
        "count": len(characters)
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Chatterbox TTS server...")
    logger.info(f"Available characters: {service.get_available_characters()}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        log_level="info"
    )
