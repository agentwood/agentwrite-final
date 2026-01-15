from f5_tts.infer.utils_infer import load_checkpoint, load_vocoder, infer_process
import torch
import os
import io
import soundfile as sf

print("Running warmup inference...")

device = "cuda" if torch.cuda.is_available() else "cpu"

try:
    # We must reload/access the model (or assume it's cached/shared if using a specific runner, 
    # but here we are a separate process in the entrypoint script flow.
    # To keep warmup fast, we might strictly rely on the server doing the first inference,
    # OR we load it just to prove inference works.
    # Given the entrypoint flow "python3 load_model.py" then "python3 warmup.py", 
    # these are separate processes. The model needs to be loaded again.
    # However, 'load_model.py' mainly acted as a sanity check.
    # To actually warmup, we need to load and run.
    
    model = load_checkpoint(target_dir=None, checkpoint_name="F5-TTS", device=device, show_progress=False)
    vocoder = load_vocoder(is_local=False)

    # Create dummy ref audio
    dummy_wav_path = "/tmp/warmup_ref.wav"
    # Create a 1-second silence or noise file for reference if needed
    # F5-TTS needs a file.
    sr = 24000
    dummy_audio = torch.zeros(sr * 1).numpy()
    sf.write(dummy_wav_path, dummy_audio, sr)

    print("Synthesizing warmup text...")
    audio_output, sample_rate, _ = infer_process(
        dummy_wav_path,
        "Warmup reference",
        "Warmup generation text",
        model,
        vocoder,
        nfe_step=16, # Fast steps
        speed=1.0,
        device=device
    )
    
    print("Warmup complete. Audio generated.")

except Exception as e:
    print(f"WARMUP FAILED (Non-fatal, but concerning): {e}")
    # We don't exit 1 here necessarily, but it's good to know.
    # Ideally warmup proves the system works.
    exit(0)
