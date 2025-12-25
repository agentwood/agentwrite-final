# OpenVoice POC Testing Guide

## ✅ Completed Steps

### 1. Reference Audio Generation - **COMPLETE**
- ✅ Generated 5 test character reference audio files
- ✅ Files saved to: `sample-reference-audio/`
- ✅ All characters successfully generated:
  - `test-1.wav` - Male, Professional (kore) - 396 KB
  - `test-2.wav` - Female, Friendly (aoede) - 383 KB
  - `test-3.wav` - Male, Energetic (charon) - 357 KB
  - `test-4.wav` - Female, Calm (pulcherrima) - 422 KB
  - `test-5.wav` - Male, Authoritative (rasalgethi) - 409 KB

### 2. OpenVoice Repository - **CLONED**
- ✅ Repository cloned to `OpenVoice/`
- ⏳ Installation pending

## ⏳ Next Steps: OpenVoice Installation

### Option A: Quick Test (Recommended for POC)

Since OpenVoice installation can be complex, you can test the **API integration** first using the FastAPI server we created, which will work once OpenVoice is set up.

### Option B: Full Local Installation

#### For macOS (Current System):

1. **Install OpenVoice:**
   ```bash
   cd poc/openvoice-demo/OpenVoice
   pip install -e .
   pip install -r requirements.txt
   ```

2. **Download Checkpoints:**

   **For OpenVoice V1:**
   ```bash
   # Download from: https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_1226.zip
   # Extract to: poc/openvoice-demo/OpenVoice/checkpoints/
   ```

   **For OpenVoice V2 (Recommended):**
   ```bash
   # Download from: https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip
   # Extract to: poc/openvoice-demo/OpenVoice/checkpoints_v2/
   
   # Also install MeloTTS:
   pip install git+https://github.com/myshell-ai/MeloTTS.git
   python -m unidic download
   ```

3. **Set Environment Variable:**
   ```bash
   export OPENVOICE_CHECKPOINT_DIR=/path/to/poc/openvoice-demo/OpenVoice/checkpoints_v2
   ```

## Testing Workflow

Once OpenVoice is installed:

### Step 1: Test Voice Cloning
```bash
cd poc/openvoice-demo
python3 test-clone.py
```

### Step 2: Test Synthesis
```bash
python3 test-synthesize.py
```

### Step 3: Start API Server
```bash
python3 server.py
```

### Step 4: Test API Integration
```bash
# Health check
curl http://localhost:8000/health

# Or test from Next.js
curl http://localhost:3000/api/poc/openvoice-test
```

### Step 5: Quality Comparison
```bash
python3 compare-quality.py
```

### Step 6: Generate POC Report
```bash
python3 generate-poc-report.py
```

## Alternative: Use OpenVoice API (If Available)

If OpenVoice offers a hosted API service, you can test the integration without local installation by:

1. Update `OPENVOICE_API_URL` in environment
2. Test API client directly
3. Skip local setup

## Current Status

| Step | Status | Notes |
|------|--------|-------|
| Reference Audio | ✅ Complete | 5 files generated |
| OpenVoice Repo | ✅ Cloned | Ready for installation |
| OpenVoice Install | ⏳ Pending | Requires checkpoints |
| Voice Cloning Test | ⏳ Pending | Needs installation |
| Synthesis Test | ⏳ Pending | Needs installation |
| API Integration | ⏳ Pending | Needs installation |
| Quality Comparison | ⏳ Pending | Needs installation |

## Files Ready for Testing

- ✅ `sample-reference-audio/test-1.wav` through `test-5.wav`
- ✅ `test-clone.py` - Voice cloning test script
- ✅ `test-synthesize.py` - Synthesis test script
- ✅ `compare-quality.py` - Quality comparison script
- ✅ `server.py` - FastAPI server
- ✅ `openvoice_integration.py` - OpenVoice wrapper

## Troubleshooting

**OpenVoice not installing:**
- Check Python version (3.9 recommended)
- Ensure PyTorch is installed
- Check for GPU/CUDA if using GPU acceleration

**Checkpoints not found:**
- Download from official OpenVoice repository
- Verify extraction path matches `checkpoints/` or `checkpoints_v2/`

**Import errors:**
- Ensure `pip install -e .` was run in OpenVoice directory
- Check that all dependencies from `requirements.txt` are installed

## Next Action

**Install OpenVoice following the instructions above, then run:**
```bash
python3 test-clone.py
```


