#!/bin/bash
set -e
# Load env
source /root/.local/bin/env || export PATH=$PATH:/root/.local/bin

echo "🔌 ACTIVATING VIRTUAL ENVIRONMENT..."
source /opt/pocket-tts-primary/bin/activate

echo "🔍 LOCATING main.py..."
# Use full path just in case, though activate should handle it
MAIN_PY_PATH=$(python -c "import pocket_tts.main as m; print(m.__file__)")
echo "Found at: $MAIN_PY_PATH"

echo ""
echo "📜 DUMPING SOURCE CODE (First 150 lines)..."
# read the file
head -n 150 "$MAIN_PY_PATH"

echo ""
echo "📋 COMBING LOGS FOR INITIALIZATION ERRORS..."
# Look for anything related to "Loading", "Error", "Exception" in the specific service logs since it started
journalctl -u pocket-tts -n 100 --no-pager

echo ""
echo "📦 CHECKING INSTALLED PACKAGE INFO..."
uv pip show pocket-tts
