#!/bin/bash
source /opt/pocket-tts-primary/bin/activate
export MAIN_PY=$(python -c "import pocket_tts.main as m; print(m.__file__)")
echo "Reading: $MAIN_PY"
cat "$MAIN_PY"
