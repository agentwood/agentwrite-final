
import sys
import os

print("Testing imports...")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"Sys path: {sys.path}")

try:
    import fish_speech
    print(f"✅ fish_speech imported from: {fish_speech.__file__}")
except ImportError as e:
    print(f"❌ Failed to import fish_speech: {e}")
    sys.exit(1)

try:
    from fish_speech.inference_engine import TTSInferenceEngine
    from fish_speech.models.dac.inference import load_model as load_decoder_model
    from fish_speech.models.text2semantic.inference import launch_thread_safe_queue
    from fish_speech.utils.schema import ServeTTSRequest
    print("✅ Models and Engine imported successfully")
except ImportError as e:
    print(f"❌ Failed to import modules: {e}")
    # Inspect fish_speech directory
    if hasattr(fish_speech, '__file__') and fish_speech.__file__:
        fs_dir = os.path.dirname(fish_speech.__file__)
        print(f"Listing {fs_dir}:")
        os.system(f"ls -R {fs_dir}")
    else:
        print("fish_speech has no __file__, listing site-packages and /app/fish-speech:")
        os.system("ls -R /app/fish-speech")
        import site
        for sp in site.getsitepackages():
            print(f"Listing {sp}:")
            os.system(f"ls {sp}")
    sys.exit(1)
