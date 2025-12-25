# OpenVoice POC Setup Guide

## Quick Setup

### 1. Install OpenVoice

**Option A: From GitHub (Recommended)**
```bash
cd poc/openvoice-demo
git clone https://github.com/myshell-ai/OpenVoice.git
cd OpenVoice
pip install -r requirements.txt
```

**Option B: From PyPI (if available)**
```bash
pip install openvoice
```

### 2. Download Model Checkpoints

Download checkpoints from OpenVoice repository:
```bash
# Check OpenVoice README for latest checkpoint URLs
# Typically includes:
# - checkpoint_base.pth (base TTS model)
# - checkpoint_converter.pth (tone converter)
# - config.json (configuration)

mkdir -p checkpoints
# Download files to ./checkpoints/
```

### 3. Set Environment Variable (Optional)

```bash
export OPENVOICE_CHECKPOINT_DIR=./checkpoints
```

### 4. Test Installation

```bash
python test-clone.py
```

If OpenVoice is properly set up, you should see:
```
✅ OpenVoice initialized successfully
✅ Speaker embedding extracted
✅ Speech generated: output/test_clone_output.wav
```

## Troubleshooting

### OpenVoice not found

**Error**: `ModuleNotFoundError: No module named 'openvoice'`

**Solution**:
1. Install OpenVoice: `pip install openvoice` or clone from GitHub
2. Check Python path includes OpenVoice
3. Verify installation: `python -c "import openvoice; print(openvoice.__version__)"`

### Checkpoints not found

**Error**: `Checkpoint directory not found`

**Solution**:
1. Download checkpoints from OpenVoice GitHub
2. Place in `./checkpoints/` directory
3. Set `OPENVOICE_CHECKPOINT_DIR` environment variable if using different path

### Model initialization fails

**Error**: `TTS model initialization failed`

**Solution**:
1. Verify checkpoint files are complete
2. Check OpenVoice version compatibility
3. Review OpenVoice GitHub issues for similar problems
4. Try re-downloading checkpoints

## Next Steps

Once OpenVoice is set up:

1. **Generate Reference Audio**:
   ```bash
   cd ../../character-chat
   npx tsx ../poc/openvoice-demo/generate-reference-audio.ts
   ```

2. **Test Voice Cloning**:
   ```bash
   cd ../poc/openvoice-demo
   python test-clone.py
   ```

3. **Test Synthesis**:
   ```bash
   python test-synthesize.py
   ```

4. **Start API Server**:
   ```bash
   python server.py
   ```

5. **Test API**:
   ```bash
   curl http://localhost:8000/health
   ```

6. **Run Quality Comparison**:
   ```bash
   python compare-quality.py
   ```

## Resources

- OpenVoice GitHub: https://github.com/myshell-ai/OpenVoice
- OpenVoice Documentation: Check GitHub README
- Model Checkpoints: See OpenVoice repository releases

