---
description: How to start the local Voice/TTS server
---

# How to Start the Local Voice Server

The "High Quality" voice generation relies on a local Python server (F5-TTS or Pocket TTS) running alongside the Next.js app.

## Prerequisites
- Python 3.10+
- CUDA (optional, for GPU acceleration)

## Steps

1.  **Navigate to the voice server directory**:
    The voice server is located in `runpod-f5-tts` (or similar python directory).
    ```bash
    cd runpod-f5-tts
    ```

2.  **Install Dependencies** (First time only):
    ```bash
    pip install -r requirements.txt
    ```

3.  **Start the Server**:
    By default, it runs on port 8000.
    ```bash
    python server.py
    ```
    *Note: If the filename is different (e.g., `app.py` or `start.py`), check the directory contents.*

4.  **Verify**:
    Visit `http://localhost:8000/health` or `http://localhost:8000/docs` to confirm it's running.

## Integration with Next.js
The Next.js app connects to `http://localhost:8000` (defined by `POCKET_TTS_URL` in `.env`).
- If this server is DOWN, the app falls back to Browser TTS (Standard Quality).
- If UP, it uses the high-quality Python model.
