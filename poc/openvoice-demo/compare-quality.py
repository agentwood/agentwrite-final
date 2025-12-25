"""
Quality comparison script for OpenVoice vs Gemini TTS
Generates the same text with both systems and compares results
"""

import os
import sys
import json
import time
from pathlib import Path
from typing import Dict, List, Optional

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

class QualityComparison:
    def __init__(self):
        self.output_dir = Path(__file__).parent / "output" / "quality-comparison"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_gemini_tts(self, text: str, voice_name: str, output_path: str) -> Dict:
        """
        Generate TTS using Gemini API
        Returns metrics: {success, latency, file_size, path}
        """
        print(f"\n[Gemini TTS] Generating: {text[:50]}...")
        print(f"  Voice: {voice_name}")
        
        start_time = time.time()
        
        try:
            # Import Gemini client from parent directory
            sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'character-chat'))
            from lib.geminiClient import getGeminiClient
            from google.genai import Modality
            
            ai = getGeminiClient()
            
            result = ai.models.generateContent({
                'model': 'gemini-2.5-flash-preview-tts',
                'contents': {
                    'parts': [{'text': text}]
                },
                'config': {
                    'responseModalities': [Modality.AUDIO],
                    'speechConfig': {
                        'voiceConfig': {
                            'prebuiltVoiceConfig': {
                                'voiceName': voice_name.lower()
                            }
                        }
                    }
                }
            })
            
            # Extract audio data
            audio_data = None
            for candidate in result.candidates or []:
                for part in candidate.content.parts or []:
                    if hasattr(part, 'inlineData') and part.inlineData and 'audio' in part.inlineData.mimeType:
                        audio_data = part.inlineData.data
                        break
                if audio_data:
                    break
            
            if not audio_data:
                return {
                    "success": False,
                    "latency": time.time() - start_time,
                    "error": "No audio data returned from Gemini API"
                }
            
            # Save to file
            import base64
            audio_bytes = base64.b64decode(audio_data)
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(audio_bytes)
            
            latency = time.time() - start_time
            file_size = len(audio_bytes)
            
            return {
                "success": True,
                "latency": latency,
                "file_size": file_size,
                "path": output_path
            }
        except ImportError as e:
            return {
                "success": False,
                "latency": time.time() - start_time,
                "error": f"Failed to import Gemini client: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "latency": time.time() - start_time,
                "error": str(e)
            }
    
    def generate_openvoice_tts(self, text: str, reference_audio: str, output_path: str) -> Dict:
        """
        Generate TTS using OpenVoice
        Returns metrics: {success, latency, file_size, path}
        """
        print(f"\n[OpenVoice] Generating: {text[:50]}...")
        print(f"  Reference: {reference_audio}")
        
        start_time = time.time()
        
        try:
            # Import OpenVoice integration
            from openvoice_integration import get_openvoice, is_openvoice_ready
            
            if not is_openvoice_ready():
                return {
                    "success": False,
                    "latency": time.time() - start_time,
                    "error": "OpenVoice not initialized. Set up OpenVoice first."
                }
            
            openvoice = get_openvoice()
            
            # Check if reference audio exists
            ref_path = Path(reference_audio)
            if not ref_path.exists():
                # Try relative to script directory
                ref_path = Path(__file__).parent / reference_audio
                if not ref_path.exists():
                    return {
                        "success": False,
                        "latency": time.time() - start_time,
                        "error": f"Reference audio not found: {reference_audio}"
                    }
            
            # Clone voice
            speaker_embedding = openvoice.clone_voice(str(ref_path))
            if speaker_embedding is None:
                return {
                    "success": False,
                    "latency": time.time() - start_time,
                    "error": "Failed to clone voice from reference audio"
                }
            
            # Synthesize
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            result_path = openvoice.synthesize(
                text=text,
                speaker_embedding=speaker_embedding,
                language='English',
                speed=1.0,
                output_path=output_path
            )
            
            if not result_path or not Path(result_path).exists():
                return {
                    "success": False,
                    "latency": time.time() - start_time,
                    "error": "Synthesis failed - no output file generated"
                }
            
            # Get file size
            file_size = Path(result_path).stat().st_size
            latency = time.time() - start_time
            
            return {
                "success": True,
                "latency": latency,
                "file_size": file_size,
                "path": result_path
            }
        except ImportError as e:
            return {
                "success": False,
                "latency": time.time() - start_time,
                "error": f"Failed to import OpenVoice: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "latency": time.time() - start_time,
                "error": str(e)
            }
    
    def compare_quality(self, test_cases: List[Dict]) -> Dict:
        """
        Compare quality between Gemini TTS and OpenVoice
        test_cases: [{text, voice_name, reference_audio}, ...]
        """
        print("=" * 60)
        print("Quality Comparison: OpenVoice vs Gemini TTS")
        print("=" * 60)
        
        results = []
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n{'='*60}")
            print(f"Test Case {i}/{len(test_cases)}")
            print(f"{'='*60}")
            
            text = test_case["text"]
            voice_name = test_case.get("voice_name", "kore")
            reference_audio = test_case.get("reference_audio")
            
            # Generate with Gemini TTS
            gemini_output = self.output_dir / f"gemini_{i}.wav"
            gemini_result = self.generate_gemini_tts(text, voice_name, str(gemini_output))
            
            # Generate with OpenVoice
            openvoice_output = self.output_dir / f"openvoice_{i}.wav"
            openvoice_result = None
            if reference_audio:
                openvoice_result = self.generate_openvoice_tts(
                    text, 
                    reference_audio, 
                    str(openvoice_output)
                )
            else:
                openvoice_result = {
                    "success": False,
                    "error": "No reference audio provided"
                }
            
            # Compare results
            comparison = {
                "test_case": i,
                "text": text,
                "voice_name": voice_name,
                "gemini": gemini_result,
                "openvoice": openvoice_result,
                "comparison": {
                    "gemini_success": gemini_result.get("success", False),
                    "openvoice_success": openvoice_result.get("success", False),
                    "latency_diff": (
                        openvoice_result.get("latency", 0) - 
                        gemini_result.get("latency", 0)
                    ),
                    "file_size_diff": (
                        openvoice_result.get("file_size", 0) - 
                        gemini_result.get("file_size", 0)
                    )
                }
            }
            
            results.append(comparison)
            
            # Print summary
            print(f"\n  Gemini TTS: {'✅' if gemini_result.get('success') else '❌'}")
            if gemini_result.get('success'):
                print(f"    Latency: {gemini_result.get('latency', 0):.2f}s")
                print(f"    File size: {gemini_result.get('file_size', 0) / 1024:.2f} KB")
            
            print(f"  OpenVoice: {'✅' if openvoice_result.get('success') else '❌'}")
            if openvoice_result.get('success'):
                print(f"    Latency: {openvoice_result.get('latency', 0):.2f}s")
                print(f"    File size: {openvoice_result.get('file_size', 0) / 1024:.2f} KB")
            
            if openvoice_result.get('error'):
                print(f"    Error: {openvoice_result['error']}")
        
        # Overall summary
        print(f"\n{'='*60}")
        print("Overall Comparison Summary")
        print(f"{'='*60}")
        
        gemini_success = sum(1 for r in results if r["comparison"]["gemini_success"])
        openvoice_success = sum(1 for r in results if r["comparison"]["openvoice_success"])
        
        print(f"Gemini TTS: {gemini_success}/{len(results)} successful")
        print(f"OpenVoice: {openvoice_success}/{len(results)} successful")
        
        if gemini_success > 0 and openvoice_success > 0:
            avg_gemini_latency = sum(
                r["gemini"].get("latency", 0) 
                for r in results 
                if r["gemini"].get("success")
            ) / gemini_success
            
            avg_openvoice_latency = sum(
                r["openvoice"].get("latency", 0) 
                for r in results 
                if r["openvoice"].get("success")
            ) / openvoice_success
            
            print(f"\nAverage Latency:")
            print(f"  Gemini TTS: {avg_gemini_latency:.2f}s")
            print(f"  OpenVoice: {avg_openvoice_latency:.2f}s")
            print(f"  Difference: {avg_openvoice_latency - avg_gemini_latency:.2f}s")
        
        # Save results
        results_file = self.output_dir / "comparison_results.json"
        with open(results_file, "w") as f:
            json.dump({
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "total_tests": len(results),
                "gemini_success": gemini_success,
                "openvoice_success": openvoice_success,
                "results": results
            }, f, indent=2)
        
        print(f"\nResults saved to: {results_file}")
        
        return {
            "total": len(results),
            "gemini_success": gemini_success,
            "openvoice_success": openvoice_success,
            "results": results
        }

def main():
    """Main comparison function"""
    
    # Test cases - same text, different voices
    test_cases = [
        {
            "text": "Hello, this is a quality comparison test between OpenVoice and Gemini TTS.",
            "voice_name": "kore",
            "reference_audio": "sample-reference-audio/test-1.wav"
        },
        {
            "text": "The voice should sound natural and match the reference audio characteristics.",
            "voice_name": "aoede",
            "reference_audio": "sample-reference-audio/test-2.wav"
        },
        {
            "text": "This test evaluates both quality and performance of the voice synthesis systems.",
            "voice_name": "charon",
            "reference_audio": "sample-reference-audio/test-3.wav"
        }
    ]
    
    # Check if reference audio exists
    for test_case in test_cases:
        ref_path = Path(__file__).parent / test_case["reference_audio"]
        if not ref_path.exists():
            print(f"⚠️  Warning: Reference audio not found: {ref_path}")
            print("   Run generate-reference-audio.ts first to create reference samples.")
    
    comparator = QualityComparison()
    results = comparator.compare_quality(test_cases)
    
    # Recommendations
    print(f"\n{'='*60}")
    print("Recommendations")
    print(f"{'='*60}")
    
    if results["openvoice_success"] == 0:
        print("❌ OpenVoice not yet set up. Please:")
        print("   1. Set up OpenVoice (see README.md)")
        print("   2. Test voice cloning: python test-clone.py")
        print("   3. Run this comparison again")
    elif results["gemini_success"] == 0:
        print("❌ Gemini TTS not yet implemented in comparison.")
        print("   This is expected - comparison will work once both are set up.")
    else:
        print("✅ Both systems working. Review audio files in output/quality-comparison/")
        print("   Compare quality, latency, and naturalness manually.")

if __name__ == "__main__":
    main()

