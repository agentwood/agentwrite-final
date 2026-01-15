# Tree-0 v2: Voice-First Architecture (Pocket TTS)

## Overview
Tree-0 v2 is a "Voice-First" architecture where character identity is derived from an immutable **Voice Seed**. We have migrated from F5-TTS (GPU-heavy) to **Pocket TTS** (CPU-native) to achieve 10x cost reduction and <200ms latency while maintaining high-quality zero-shot voice cloning.

## Core Components

### 1. The Voice Seed (Source of Truth)
- **Model:** `VoiceSeed` (Postgres)
- **Asset:** A clean, 24kHz mono WAV file (3-10 seconds) stored in `/public/voices/seeds/`.
- **Identity:** Features like `pitch`, `speed`, `tone`, and `accent` are metadata, but the audio file *is* the identity.

### 2. The Engine: Pocket TTS
- **Type:** Local/Remote HTTP Service
- **Model:** `kyutai/pocket-tts` (HuggingFace)
- **Hardware:** Runs on standard CPU (2GB RAM min). No GPU required.
- **Protocol:**
  - **Input:** Text + Reference Audio (WAV file) + Speed parameters.
  - **Output:** 24kHz PCM WAV.
  - **Latency:** ~200ms (Real-time).

### 3. Voice Cloning Strategy (Zero-Shot)
Instead of training a model for each character (which is slow and expensive), we use **Zero-Shot Cloning**.
- We send the specific `VoiceSeed.filePath` (e.g., `SpongeBob.wav`) with *every* request.
- Pocket TTS conditions the generation on this audio file instantly.
- **Result:** Infinite character variations without model retraining.

## Fallback Strategy (Resiliency)
If the Pocket TTS server is unreachable (or crashes):
1.  **Circuit Breaker:** The client detects the failure.
2.  **Fallback Engine:** **Fish Audio** (API).
3.  **Resolution:** `voiceRegistry.ts` maps the `VoiceSeed.name` to a pre-defined Fish Audio Model ID.
4.  **User Experience:** Seamless degradation. The voice might sound slightly different, but the chat continues.

## Dynamic Response Logic
Characters are now "Self-Aware" of their speaking style:
- **Style Verbosity (0-100):** stored in `PersonaTemplate`.
- **Chat Logic:**
  - **< 30:** Curt, brief answers (1-2 sentences).
  - **> 70:** Verbose, rambling answers (4-6+ sentences).
  - **Default:** Balanced conversation.
- **Time Awareness:** Characters know the real-time UTC day/hour.

## Deployment Architecture
- **Frontend/API:** Next.js on Netlify (Serverless).
- **Database:** Supabase (Postgres).
- **Voice Server:** Pocket TTS on DigitalOcean (VPS, Docker/Python).
- **Communication:** `POCKET_TTS_URL` via environment variable.
