#!/bin/bash
set -e
source /opt/pocket-tts-primary/bin/activate

echo "📊 Checking System Memory..."
free -h

echo ""
echo "🐍 Attempting to Load Model via Python (Standalone)..."
python -c "
import sys
try:
    print('--> Importing pocket_tts...')
    from pocket_tts.models.tts_model import TTSModel
    print('--> Attempting to load TTSModel()...')
    model = TTSModel()
    print('✅ Model loaded successfully!')
except Exception as e:
    print(f'❌ Model Loading Failed: {e}')
    import traceback
    traceback.print_exc()
"

echo ""
echo "🔍 Checking for existing models in cache..."
ls -R /root/.cache/huggingface/hub || echo "No HuggingFace cache found."
