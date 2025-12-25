"""
Generate POC Report
Creates a comprehensive report of POC testing results
"""

import json
import time
from pathlib import Path
from typing import Dict, List

def generate_poc_report():
    """Generate POC report from test results"""
    
    print("=" * 60)
    print("OpenVoice POC Report Generator")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    output_dir = base_dir / "output"
    
    # Collect results from various test outputs
    results = {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "poc_status": "in_progress",
        "tests": {}
    }
    
    # Check for reference audio generation results
    ref_audio_summary = base_dir / "sample-reference-audio" / "generation-summary.json"
    if ref_audio_summary.exists():
        with open(ref_audio_summary, 'r') as f:
            ref_data = json.load(f)
            results["tests"]["reference_audio_generation"] = {
                "status": "complete" if ref_data.get("successful", 0) > 0 else "failed",
                "total": ref_data.get("total", 0),
                "successful": ref_data.get("successful", 0),
                "failed": ref_data.get("failed", 0)
            }
    
    # Check for voice cloning test results
    clone_results = output_dir / "clone_test_results.json"
    if clone_results.exists():
        with open(clone_results, 'r') as f:
            clone_data = json.load(f)
            results["tests"]["voice_cloning"] = clone_data
    
    # Check for synthesis test results
    synthesis_results = output_dir / "synthesis_test_results.json"
    if synthesis_results.exists():
        with open(synthesis_results, 'r') as f:
            synth_data = json.load(f)
            results["tests"]["synthesis"] = synth_data
    
    # Check for quality comparison results
    quality_results = output_dir / "quality-comparison" / "comparison_results.json"
    if quality_results.exists():
        with open(quality_results, 'r') as f:
            quality_data = json.load(f)
            results["tests"]["quality_comparison"] = quality_data
    
    # Determine overall POC status
    all_tests_passed = all(
        test.get("status") == "complete" or test.get("success", False)
        for test in results["tests"].values()
        if isinstance(test, dict)
    )
    
    results["poc_status"] = "success" if all_tests_passed else "in_progress"
    
    # Generate recommendations
    recommendations = []
    
    if results["tests"].get("reference_audio_generation", {}).get("successful", 0) == 0:
        recommendations.append("Generate reference audio for test characters first")
    
    if not results["tests"].get("voice_cloning", {}).get("success", False):
        recommendations.append("Set up OpenVoice and test voice cloning")
    
    if not results["tests"].get("synthesis", {}).get("success", False):
        recommendations.append("Test synthesis with cloned voices")
    
    if not results["tests"].get("quality_comparison"):
        recommendations.append("Run quality comparison between OpenVoice and Gemini TTS")
    
    results["recommendations"] = recommendations
    
    # Go/No-Go decision
    if results["poc_status"] == "success":
        results["decision"] = "GO - Proceed with full migration"
        results["confidence"] = "high"
    else:
        results["decision"] = "NO-GO - Complete POC testing first"
        results["confidence"] = "low"
    
    # Save report
    report_path = output_dir / "poc_report.json"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 60)
    print("POC Report Summary")
    print("=" * 60)
    print(f"Status: {results['poc_status'].upper()}")
    print(f"Decision: {results['decision']}")
    print(f"Confidence: {results['confidence']}")
    
    print("\nTest Results:")
    for test_name, test_data in results["tests"].items():
        if isinstance(test_data, dict):
            status = test_data.get("status") or ("✅" if test_data.get("success") else "❌")
            print(f"  {test_name}: {status}")
    
    if recommendations:
        print("\nRecommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
    
    print(f"\nFull report saved to: {report_path}")
    
    return results

if __name__ == "__main__":
    generate_poc_report()



