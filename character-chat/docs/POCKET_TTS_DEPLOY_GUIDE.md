# Pocket TTS Production Deployment Guide

You have successfully migrated the codebase to use Pocket TTS!
The code is now on GitHub (`main` branch).

However, **Pocket TTS is a separate server** that needs to run alongside your Next.js app (which runs on Netlify). Netlify cannot run the Pocket TTS server because it requires persistent long-running processes (and model weights), which Serverless Functions don't support.

## 🚀 Step 1: Deploy Pocket TTS Server

You need a generic cheap CPU server (VPS).
**Recommendation:** DigitalOcean Droplet (Regular Intel/AMD, 2GB RAM) - ~$12/month.

### Option A: Manual Setup (DigitalOcean/AWS/Hetzner)

1.  **Create a Server:** Ubuntu 22.04 or later.
2.  **SSH into the server.**
3.  **Run the following setup script:**

```bash
# 1. Install dependencies
sudo apt update && sudo apt install -y python3-pip ffmpeg git

# 2. Install UV (fast python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# 3. Authenticate with HuggingFace (for voice cloning model)
# You will need your HF Token: https://huggingface.co/settings/tokens
uvx hf auth login

# 4. Install & Run Pocket TTS
# We use 'nohup' to keep it running after you disconnect
nohup uvx pocket-tts serve --host 0.0.0.0 --port 8000 > pocket_tts.log 2>&1 &
```

4.  **Verify it works:**
    Visit `http://YOUR_SERVER_IP:8000/health` -> Should return `{"status":"healthy"}`

### Option B: Railway / Render (Easier, slightly more expensive)

1.  **Create a new Service** from a Docker Image.
2.  Use a simple `python:3.11` base and start command: `uvx pocket-tts serve --host 0.0.0.0 --port $PORT`
3.  Add Environment Variable: `HF_TOKEN` (if supported for auth, otherwise you might need a custom Dockerfile to handle the verify step).
    *Note: Option A is safer for the HuggingFace auth step since it's interactive.*

---

## 🔗 Step 2: Connect Netlify to Pocket TTS

Once your server is running (e.g., at `http://123.45.67.89:8000`):

1.  Go to **Netlify Dashboard** > **Site Settings** > **Environment Variables**.
2.  Add/Edit `POCKET_TTS_URL`.
3.  Set Value: `http://123.45.67.89:8000` (Your actual server IP/URL).
4.  **Redeploy** the site (Trigger deploy) to pick up the new variable.

## ✅ Step 3: Verify

Go to your production URL, chat with a character, and click the Voice icon. It should request from your new Pocket TTS server and play the audio!
