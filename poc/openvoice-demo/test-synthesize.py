"""
Test script for OpenVoice synthesis
Tests text-to-speech synthesis with cloned voices
"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

def test_synthesis(text: str, voice_id: str, output_path: str = "output/test_synthesis.wav"):
    """
    Test text-to-speech synthesis with cloned voice
    
    Args:
        text: Text to synthesize
        voice_id: Voice ID or path to reference audio
        output_path: Path to save output audio
    
    Returns:
        Path to generated audio file
    """
    print(f"Testing synthesis with voice: {voice_id}")
    print(f"Text: {text}")
    print(f"Output: {output_path}")
    
    # Create output directory
    output_dir = Path(output_path).parent
    output_dir.mkdir(exist_ok=True)
    
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
        print("See test-clone.py for setup instructions")
        print("="*50)
        return None
    
    # Get OpenVoice instance
    openvoice = get_openvoice()
    
    # voice_id can be a path to reference audio or a saved embedding
    # For POC, we'll treat it as a reference audio path
    if os.path.exists(voice_id):
        # Load speaker embedding from reference audio
        speaker_embedding = openvoice.clone_voice(voice_id)
        if speaker_embedding is None:
            print(f"❌ Failed to load voice from: {voice_id}")
            return None
    else:
        print(f"❌ Voice ID/path not found: {voice_id}")
        print("   Provide path to reference audio file")
        return None
    
    try:
        # Generate speech
        result_path = openvoice.synthesize(
            text=text,
            speaker_embedding=speaker_embedding,
            language='English',
            speed=1.0,
            output_path=output_path
        )
        
        if result_path:
            print(f"✅ Synthesis complete: {result_path}")
            return result_path
        else:
            print("❌ Synthesis failed")
            return None
        
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def test_multiple_texts(voice_id: str, texts: list[str]):
    """
    Test synthesis with multiple texts (batch test)
    """
    print(f"\nTesting batch synthesis with {len(texts)} texts")
    
    results = []
    for i, text in enumerate(texts):
        output_path = f"output/batch_test_{i+1}.wav"
        result = test_synthesis(text, voice_id, output_path)
        results.append({
            "text": text,
            "output": result,
            "success": result is not None
        })
    
    # Summary
    successful = sum(1 for r in results if r["success"])
    print(f"\n{'='*50}")
    print(f"Batch Test Results: {successful}/{len(texts)} successful")
    print(f"{'='*50}")
    
    return results

def main():
    """Main test function"""
    print("="*50)
    print("OpenVoice Synthesis Test")
    print("="*50)
    
    # Test texts
    test_texts = [
        "Hello, this is a test of OpenVoice synthesis.",
        "The voice should sound natural and match the reference audio.",
        "This is a longer sentence to test how well the voice handles extended speech.",
    ]
    
    # Test with placeholder voice ID
    voice_id = "placeholder_voice_id"
    
    # Single synthesis test
    print("\n1. Single Synthesis Test")
    print("-" * 50)
    result = test_synthesis(
        test_texts[0],
        voice_id,
        "output/single_test.wav"
    )
    
    # Batch synthesis test
    print("\n2. Batch Synthesis Test")
    print("-" * 50)
    batch_results = test_multiple_texts(voice_id, test_texts)
    
    # Save results
    results_file = Path(__file__).parent / "output" / "synthesis_test_results.json"
    with open(results_file, "w") as f:
        json.dump({
            "single_test": {"success": result is not None, "output": str(result) if result else None},
            "batch_test": batch_results
        }, f, indent=2)
    
    print(f"\nResults saved to: {results_file}")

if __name__ == "__main__":
    main()

