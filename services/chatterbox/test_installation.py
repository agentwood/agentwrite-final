#!/usr/bin/env python3
"""
Quick test script for Chatterbox TTS
Tests basic functionality without reference audio
"""

import sys
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from chatterbox_service import get_chatterbox_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    logger.info("="*60)
    logger.info("Chatterbox TTS Installation Test")
    logger.info("="*60)
    
    service = get_chatterbox_service()
    
    # Test 1: Check if module is installed
    if service.is_configured():
        logger.info("✅ Chatterbox module is installed correctly")
    else:
        logger.error("❌ Chatterbox module is NOT installed")
        return 1
    
    # Test 2: Check for reference audio
    available_chars = service.get_available_characters()
    
    if available_chars:
        logger.info(f"✅ Found {len(available_chars)} character(s) with reference audio:")
        for char in available_chars:
            logger.info(f"   - {char}")
    else:
        logger.warning("⚠️  No reference audio found")
        logger.info("   Add .wav files to: services/chatterbox/reference_audio/")
        logger.info("   Example: asha.wav, eamon.wav, viktor.wav")
    
    # Test 3: Model loading (lazy, won't load until first use)
    logger.info("✅ Service initialized (model will load on first synthesis)")
    
    logger.info("="*60)
    logger.info("Installation test completed successfully!")
    logger.info("="*60)
    logger.info("\nNext steps:")
    logger.info("1. Add 10-second .wav reference clips to reference_audio/")
    logger.info("2. Start the server: python server.py")
    logger.info("3. Test synthesis via API: POST http://localhost:8002/synthesize")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
