#!/usr/bin/env bash
set -e

echo "========== F5-TTS WORKER START =========="

echo "[1/7] Validating environment..."
python3 - <<EOF
import torch
if torch.cuda.is_available():
    print("CUDA OK:", torch.cuda.get_device_name(0))
else:
    print("WARNING: CUDA not available (Running on CPU?)")
EOF

# Ensure tmp exists
mkdir -p /tmp

echo "[2/7] Checking model files..."
# Just a soft check, load_model.py is the real test
echo "Assuming models will be downloaded/loaded by Python script..."

echo "[3/7] Loading model into GPU (Sanity Check)..."
# We run this to crash early if model is broken.
# Note: This loads model then EXITS, freeing memory.
# The server will reload it. This is slightly inefficient but proves the environment.
# Ideal: Use a shared memory manager or let server handle it. 
# BUT instructed to follow "load_model.py" step.
# For optimal speed, we can skip this separate process if we trust server.py
# However, let's keep it for now as a robust check.
python3 load_model.py
echo "Model sanity check passed"

# Skip warmup.py as separate process to save time/memory, 
# server.py startup will handle loading.
# If we want true warmup, we should hit the server after it starts.

echo "[5/7] Starting API server..."
python3 server.py &
SERVER_PID=$!

echo "[6/7] Waiting for server to accept connections..."
# Wait for /health
until curl -sf http://localhost:8000/health; do
  echo "Waiting for server..."
  sleep 2
done

echo "Server is UP. Waiting for Model Ready..."
# Wait for /ready
until curl -sf http://localhost:8000/ready; do
  echo "Waiting for model load..."
  sleep 2
done

echo "[7/7] WORKER READY"
# Explicitly create ready file for RunPod if they monitor file existence
touch /tmp/READY

# Keep script running
wait $SERVER_PID
