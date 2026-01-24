import torch
from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_checkpoint, load_vocoder

print("Loading F5-TTS model...")

# Use the same loading logic as the original handler/repo
# This loads into Global Memory if possible, or checks checkpoints
device = "cuda" if torch.cuda.is_available() else "cpu"

try:
    # F5-TTS helper to load default checkpoint
    model = load_checkpoint("F5-TTS", device=device, show_progress=True)
    vocoder = load_vocoder(is_local=False)
    
    # Force GPU allocation with a dummy tensor
    if device == "cuda":
        dummy = torch.zeros(1).cuda()
        print("Model fully loaded and resident in GPU")
    else:
        print("WARNING: Loading on CPU")
        
except Exception as e:
    print(f"CRITICAL ERROR loading model: {e}")
    exit(1)
