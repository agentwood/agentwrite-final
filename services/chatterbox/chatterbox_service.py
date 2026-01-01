"""
Chatterbox TTS Service
Free, open-source TTS with voice cloning capabilities
https://github.com/resemble-ai/chatterbox
"""

import torch
import torchaudio as ta
from pathlib import Path
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class ChatterboxService:
    """
    Wrapper for Chatterbox-Turbo TTS with voice cloning
    
    Features:
    - Voice cloning with 5-10 second reference clips
    - Paralinguistic tags ([laugh], [chuckle], [cough])
    - Emotion exaggeration control
    - Real-time inference (<200ms)
    """
    
    def __init__(self, device: Optional[str] = None):
        """
        Initialize Chatterbox service
        
        Args:
            device: 'cuda', 'cpu', or None (auto-detect)
        """
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        
        self.device = device
        self.model = None
        self.sr = 24000  # Default sample rate
        self.reference_audio_dir = Path(__file__).parent / "reference_audio"
        
        logger.info(f"Initializing Chatterbox on {device}")
        
    def _lazy_load_model(self):
        """Lazy load model on first use"""
        if self.model is None:
            try:
                from chatterbox.tts_turbo import ChatterboxTurboTTS
                
                logger.info("Loading Chatterbox-Turbo model...")
                self.model = ChatterboxTurboTTS.from_pretrained(device=self.device)
                self.sr = self.model.sr
                logger.info(f"Chatterbox loaded successfully (sr={self.sr})")
                
            except ImportError:
                logger.error("chatterbox-tts not installed. Run: pip install chatterbox-tts")
                raise
            except Exception as e:
                logger.error(f"Failed to load Chatterbox model: {e}")
                raise
    
    def is_configured(self) -> bool:
        """Check if Chatterbox is properly configured"""
        try:
            # Check if model can be imported
            from chatterbox.tts_turbo import ChatterboxTurboTTS
            return True
        except ImportError:
            return False
    
    def has_reference_audio(self, character_id: str) -> bool:
        """Check if reference audio exists for character"""
        ref_path = self.reference_audio_dir / f"{character_id}.wav"
        return ref_path.exists()
    
    def synthesize(
        self,
        text: str,
        character_id: str,
        emotion: float = 0.5,
        add_paralinguistic_tags: bool = False
    ) -> Optional[Dict]:
        """
        Generate speech with Chatterbox
        
        Args:
            text: Text to synthesize
            character_id: Character identifier (e.g., 'asha', 'eamon')
            emotion: Emotion exaggeration (0.0 = monotone, 1.0 = dramatic)
            add_paralinguistic_tags: Whether to enhance text with [laugh], [chuckle]
        
        Returns:
            Dict with 'audio' (bytes), 'format' (str), 'sampleRate' (int)
            None if generation fails
        """
        self._lazy_load_model()
        
        ref_path = self.reference_audio_dir / f"{character_id}.wav"
        
        if not ref_path.exists():
            logger.error(f"No reference audio for character: {character_id}")
            logger.info(f"Expected file: {ref_path}")
            return None
        
        try:
            # Enhance text with paralinguistic tags if requested
            if add_paralinguistic_tags:
                text = self._enhance_with_tags(text)
            
            logger.info(f"Generating speech for {character_id} (emotion={emotion})")
            
            # Generate audio
            wav = self.model.generate(
                text,
                audio_prompt_path=str(ref_path),
                emotion_exaggeration=emotion
            )
            
            # Convert to bytes
            import io
            buffer = io.BytesIO()
            ta.save(buffer, wav, self.sr, format='wav')
            audio_bytes = buffer.getvalue()
            
            return {
                'audio': audio_bytes,
                'format': 'wav',
                'sampleRate': self.sr,
                'contentType': 'audio/wav'
            }
            
        except Exception as e:
            logger.error(f"Chatterbox synthesis failed for {character_id}: {e}")
            return None
    
    def _enhance_with_tags(self, text: str) -> str:
        """
        Optionally add paralinguistic tags to text
        This is a simple heuristic - can be made smarter
        """
        # Add occasional laughs/chuckles after exclamations or jokes
        # This is just a demo - real implementation would use NLP
        enhanced = text
        
        if "haha" in text.lower() or "hehe" in text.lower():
            enhanced = enhanced.replace("haha", "[laugh]")
            enhanced = enhanced.replace("hehe", "[chuckle]")
        
        return enhanced
    
    def get_available_characters(self) -> list[str]:
        """Get list of characters with reference audio"""
        if not self.reference_audio_dir.exists():
            return []
        
        wav_files = list(self.reference_audio_dir.glob("*.wav"))
        return [f.stem for f in wav_files]
    
    def voice_clone_demo(self, text: str = "Hello, this is a test of voice cloning."):
        """
        Demo method to test voice cloning with all available characters
        Saves outputs to current directory
        """
        self._lazy_load_model()
        
        characters = self.get_available_characters()
        
        if not characters:
            logger.warning("No reference audio found. Add .wav files to reference_audio/")
            return
        
        logger.info(f"Testing {len(characters)} characters...")
        
        for char_id in characters:
            logger.info(f"Generating demo for {char_id}...")
            result = self.synthesize(text, char_id, emotion=0.6)
            
            if result:
                output_path = f"demo_{char_id}.wav"
                with open(output_path, 'wb') as f:
                    f.write(result['audio'])
                logger.info(f"Saved: {output_path}")
            else:
                logger.error(f"Failed to generate for {char_id}")


# Singleton instance
_service_instance: Optional[ChatterboxService] = None


def get_chatterbox_service() -> ChatterboxService:
    """Get or create Chatterbox service instance"""
    global _service_instance
    
    if _service_instance is None:
        _service_instance = ChatterboxService()
    
    return _service_instance


if __name__ == "__main__":
    # Test the service
    logging.basicConfig(level=logging.INFO)
    
    service = get_chatterbox_service()
    
    if service.is_configured():
        logger.info("✅ Chatterbox is configured")
        logger.info(f"Available characters: {service.get_available_characters()}")
        
        # Run demo if characters available
        if service.get_available_characters():
            service.voice_clone_demo()
    else:
        logger.warning("❌ Chatterbox not configured. Install: pip install chatterbox-tts")
