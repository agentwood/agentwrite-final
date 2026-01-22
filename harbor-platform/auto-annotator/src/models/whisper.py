"""
HARBOR Auto-Annotator - Whisper Transcription
"""

import asyncio
from pathlib import Path
from typing import Optional

from ..config import settings
from ..schemas import TranscriptEntry

# Lazy load
_model = None


def get_model():
    """Lazy load Whisper model"""
    global _model
    if _model is None:
        import whisper
        _model = whisper.load_model(settings.WHISPER_MODEL)
        print(f"[Whisper] Loaded model: {settings.WHISPER_MODEL}")
    return _model


class WhisperTranscriber:
    """Whisper speech-to-text transcription"""
    
    def __init__(self):
        self.model = None
    
    async def initialize(self) -> None:
        """Initialize the model"""
        loop = asyncio.get_event_loop()
        self.model = await loop.run_in_executor(None, get_model)
    
    async def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
    ) -> tuple[list[TranscriptEntry], str, str]:
        """
        Transcribe audio file
        Returns: (entries, full_text, detected_language)
        """
        if self.model is None:
            await self.initialize()
        
        # Run transcription in thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.model.transcribe(
                audio_path,
                language=language,
                word_timestamps=True,
                verbose=False,
            )
        )
        
        entries = []
        
        # Extract segments
        for segment in result.get("segments", []):
            entry = TranscriptEntry(
                text=segment["text"].strip(),
                start_ms=int(segment["start"] * 1000),
                end_ms=int(segment["end"] * 1000),
                confidence=segment.get("avg_logprob", 0),
                language=result.get("language"),
            )
            entries.append(entry)
        
        full_text = result.get("text", "").strip()
        detected_language = result.get("language", "en")
        
        return entries, full_text, detected_language
    
    async def transcribe_video(
        self,
        video_path: str,
        language: Optional[str] = None,
    ) -> tuple[list[TranscriptEntry], str, str]:
        """
        Transcribe audio from video file
        Whisper directly supports video files
        """
        return await self.transcribe(video_path, language)
    
    async def detect_language(self, audio_path: str) -> str:
        """Detect language of audio"""
        if self.model is None:
            await self.initialize()
        
        import whisper
        
        # Load audio
        loop = asyncio.get_event_loop()
        audio = await loop.run_in_executor(
            None,
            lambda: whisper.load_audio(audio_path)
        )
        
        # Pad/trim to 30 seconds
        audio = whisper.pad_or_trim(audio)
        
        # Make log-Mel spectrogram
        mel = await loop.run_in_executor(
            None,
            lambda: whisper.log_mel_spectrogram(audio).to(self.model.device)
        )
        
        # Detect language
        _, probs = await loop.run_in_executor(
            None,
            lambda: self.model.detect_language(mel)
        )
        
        detected_language = max(probs, key=probs.get)
        return detected_language
    
    def get_model_info(self) -> dict:
        """Get model information"""
        if self.model is None:
            return {"loaded": False}
        
        return {
            "loaded": True,
            "name": settings.WHISPER_MODEL,
            "device": str(next(self.model.parameters()).device),
        }


# Singleton
whisper_transcriber = WhisperTranscriber()
