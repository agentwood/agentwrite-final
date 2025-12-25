"""
Test script for OpenVoice voice cloning
Tests basic voice cloning functionality with sample reference audio
"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

def test_voice_clone(reference_audio_path: str, test_text: str = "Hello, this is a test of voice cloning."):
    """
    Test voice cloning from reference audio
    
    Args:
        reference_audio_path: Path to reference audio file (3-6 seconds)
        test_text: Text to synthesize with cloned voice
    
    Returns:
        Path to generated audio file
    """
    print(f"Testing voice cloning with: {reference_audio_path}")
    print(f"Test text: {test_text}")
    
    # Check if reference audio exists
    if not os.path.exists(reference_audio_path):
        print(f"ERROR: Reference audio not found: {reference_audio_path}")
        return None
    
    # Import OpenVoice integration
    try:
        from openvoice_integration import get_openvoice, is_openvoice_ready
    except ImportError:
        print("\n" + "="*50)
        print("OpenVoice Integration Module Not Found")
        print("="*50)
        print("Make sure openvoice_integration.py is in the same directory")
        return None
    
    # Check if OpenVoice is ready
    if not is_openvoice_ready():
        print("\n" + "="*50)
        print("OpenVoice Setup Required:")
        print("="*50)
        print("1. Install OpenVoice:")
        print("   pip install openvoice")
        print("   Or: git clone https://github.com/myshell-ai/OpenVoice.git")
        print("2. Download model checkpoints to ./checkpoints/")
        print("3. Set OPENVOICE_CHECKPOINT_DIR environment variable if needed")
        print("="*50)
        return None
    
    # Get OpenVoice instance
    openvoice = get_openvoice()
    
    try:
        # Extract speaker embedding
        print("Extracting speaker embedding...")
        speaker_embedding = openvoice.clone_voice(reference_audio_path)
        
        if speaker_embedding is None:
            print("❌ Failed to extract speaker embedding")
            return None
        
        print("✅ Speaker embedding extracted")
        
        # Generate speech with cloned voice
        print("Generating speech with cloned voice...")
        output_path = str(Path(__file__).parent / "output" / "test_clone_output.wav")
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        result_path = openvoice.synthesize(
            text=test_text,
            speaker_embedding=speaker_embedding,
            language='English',
            speed=1.0,
            output_path=output_path
        )
        
        if result_path:
            print(f"✅ Speech generated: {result_path}")
            return result_path
        else:
            print("❌ Speech generation failed")
            return None
        
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def main():
    """Main test function"""
    print("="*50)
    print("OpenVoice Voice Cloning Test")
    print("="*50)
    
    # Create output directory
    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    
    # Test with sample reference audio
    sample_dir = Path(__file__).parent / "sample-reference-audio"
    sample_dir.mkdir(exist_ok=True)
    
    # Look for sample files
    sample_files = list(sample_dir.glob("*.wav")) + list(sample_dir.glob("*.mp3"))
    
    if not sample_files:
        print(f"\nNo sample reference audio found in: {sample_dir}")
        print("Please add reference audio files (3-6 seconds) to test with.")
        print("You can generate them using: npm run poc:generate-reference-audio")
        return
    
    # Test with first sample
    test_file = sample_files[0]
    print(f"\nUsing sample: {test_file.name}")
    
    result = test_voice_clone(
        str(test_file),
        "This is a test of OpenVoice voice cloning. The voice should match the reference audio."
    )
    
    if result:
        print(f"\n✅ Success! Output saved to: {result}")
    else:
        print("\n⚠️  Test incomplete - OpenVoice setup required")

if __name__ == "__main__":
    main()

