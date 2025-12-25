"""
OpenVoice Integration Module
Provides actual OpenVoice functionality once models are set up
"""

import os
import sys
from pathlib import Path
from typing import Optional, Tuple
import numpy as np

# OpenVoice imports (will work once OpenVoice is installed)
try:
    import torch
    import torchaudio
    from openvoice import se_extractor
    from openvoice.api import BaseSpeakerTTS, ToneColorConverter
    OPENVOICE_AVAILABLE = True
except ImportError:
    OPENVOICE_AVAILABLE = False
    print("⚠️  OpenVoice not installed. Install with: pip install openvoice")
    print("   See: https://github.com/myshell-ai/OpenVoice")

class OpenVoiceIntegration:
    """Wrapper for OpenVoice functionality"""
    
    def __init__(self, checkpoint_dir: Optional[str] = None):
        """
        Initialize OpenVoice
        
        Args:
            checkpoint_dir: Path to OpenVoice checkpoint directory
        """
        self.checkpoint_dir = checkpoint_dir or os.getenv(
            'OPENVOICE_CHECKPOINT_DIR',
            str(Path(__file__).parent / 'checkpoints')
        )
        self.initialized = False
        self.se_extractor = None
        self.tts_model = None
        self.tone_converter = None
        
        if OPENVOICE_AVAILABLE:
            self._initialize()
    
    def _initialize(self):
        """Initialize OpenVoice models"""
        try:
            checkpoint_dir = Path(self.checkpoint_dir)
            
            if not checkpoint_dir.exists():
                print(f"⚠️  Checkpoint directory not found: {checkpoint_dir}")
                print("   Download checkpoints from: https://github.com/myshell-ai/OpenVoice")
                return
            
            # Initialize speaker extractor
            self.se_extractor = se_extractor
            
            # Initialize TTS model
            # Note: Actual initialization depends on OpenVoice version
            # This is a template - adjust based on OpenVoice API
            try:
                self.tts_model = BaseSpeakerTTS(
                    checkpoint_path=str(checkpoint_dir / 'checkpoint_base.pth'),
                    config_path=str(checkpoint_dir / 'config.json')
                )
            except Exception as e:
                print(f"⚠️  TTS model initialization failed: {e}")
                print("   Check checkpoint paths and OpenVoice version")
                return
            
            # Initialize tone converter
            try:
                self.tone_converter = ToneColorConverter(
                    checkpoint_path=str(checkpoint_dir / 'checkpoint_converter.pth'),
                    config_path=str(checkpoint_dir / 'config.json')
                )
            except Exception as e:
                print(f"⚠️  Tone converter initialization failed: {e}")
                print("   Check checkpoint paths and OpenVoice version")
                return
            
            self.initialized = True
            print("✅ OpenVoice initialized successfully")
            
        except Exception as e:
            print(f"❌ OpenVoice initialization error: {e}")
            self.initialized = False
    
    def is_ready(self) -> bool:
        """Check if OpenVoice is ready to use"""
        return OPENVOICE_AVAILABLE and self.initialized
    
    def clone_voice(self, reference_audio_path: str) -> Optional[np.ndarray]:
        """
        Extract speaker embedding from reference audio
        
        Args:
            reference_audio_path: Path to reference audio file (3-6 seconds)
        
        Returns:
            Speaker embedding (numpy array) or None if failed
        """
        if not self.is_ready():
            return None
        
        try:
            # Extract speaker embedding
            speaker_embedding = self.se_extractor.get_se(
                reference_audio_path,
                self.tone_converter,
                vad=True  # Voice activity detection
            )
            return speaker_embedding
        except Exception as e:
            print(f"❌ Voice cloning failed: {e}")
            return None
    
    def synthesize(
        self,
        text: str,
        speaker_embedding: np.ndarray,
        language: str = 'English',
        speed: float = 1.0,
        output_path: Optional[str] = None
    ) -> Optional[str]:
        """
        Synthesize speech from text using cloned voice
        
        Args:
            text: Text to synthesize
            speaker_embedding: Speaker embedding from clone_voice()
            language: Language code (default: 'English')
            speed: Speech speed (0.5 - 2.0)
            output_path: Path to save output audio (optional)
        
        Returns:
            Path to generated audio file or None if failed
        """
        if not self.is_ready():
            return None
        
        try:
            # Generate base TTS
            src_path = self.tts_model.tts(
                text=text,
                language=language,
                speed=speed
            )
            
            # Apply voice cloning
            if output_path is None:
                output_path = str(Path(__file__).parent / 'output' / f'synthesis_{hash(text)}.wav')
            
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            self.tone_converter.convert(
                audio_src_path=src_path,
                src_se=speaker_embedding,
                tgt_path=output_path
            )
            
            return output_path
        except Exception as e:
            print(f"❌ Synthesis failed: {e}")
            return None

# Global instance
_openvoice_instance: Optional[OpenVoiceIntegration] = None

def get_openvoice() -> OpenVoiceIntegration:
    """Get or create OpenVoice instance"""
    global _openvoice_instance
    if _openvoice_instance is None:
        _openvoice_instance = OpenVoiceIntegration()
    return _openvoice_instance

def is_openvoice_ready() -> bool:
    """Check if OpenVoice is ready"""
    return get_openvoice().is_ready()

