# Tree-0 Voice Engine — Architecture Overview

## Current State Summary

**Tree-0** is Agentwood's proprietary voice synthesis cluster. The current implementation uses a **hybrid architecture** with two tiers:

| Tier | Engine | Status | Latency | Quality | Use Case |
|------|--------|--------|---------|---------|----------|
| **Primary** | F5-TTS (RunPod) | ✅ Deployed | ~1-2s | MOS 4.2 | Zero-shot voice cloning |
| **Secondary** | Supertonic (WASM) | 🚧 In Progress | ~200ms | MOS 3.8 | Featured character presets |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TREE-0 VOICE CLUSTER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐   │
│  │   TTS Router    │    │              VOICE SEED POOL                 │   │
│  │   (ttsRouter.ts)│───▶│  29 Elite Voice Seeds (public/voices/seeds)  │   │
│  └────────┬────────┘    │  Each seed: name, filePath, gender, tone,    │   │
│           │             │  energy, accent, referenceText               │   │
│           ▼             └──────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐                               │
│  │          ROUTING DECISION               │                               │
│  │  if (clientSupportsSupertonic &&        │                               │
│  │      voiceSeed.isSupertonicCompatible)  │                               │
│  │      → SUPERTONIC (local WASM)          │                               │
│  │  else                                   │                               │
│  │      → F5-TTS (server)                  │                               │
│  └────────────┬────────────────────────────┘                               │
│               │                                                            │
│      ┌───────┴───────┐                                                     │
│      ▼               ▼                                                     │
│  ┌────────────┐  ┌────────────────────────────────────────────────────┐   │
│  │ SUPERTONIC │  │                    F5-TTS                          │   │
│  │   (WASM)   │  │               (RunPod GPU)                         │   │
│  │            │  ├────────────────────────────────────────────────────┤   │
│  │ Status:    │  │  • Dockerfile: runpod-f5-tts/Dockerfile            │   │
│  │ 🚧 Partial │  │  • Handler: runpod-f5-tts/handler.py               │   │
│  │            │  │  • Client: lib/audio/runpodF5Client.ts             │   │
│  │ Missing:   │  │                                                    │   │
│  │ - ONNX     │  │  Zero-Shot Cloning Pipeline:                       │   │
│  │   models   │  │  1. Load VoiceSeed.filePath (reference audio)      │   │
│  │ - Voice    │  │  2. Upload to Pod if not cached                    │   │
│  │   presets  │  │  3. Run F5-TTS inference (32 steps, speed mod)     │   │
│  │            │  │  4. Return 24kHz WAV as Base64                     │   │
│  └────────────┘  └────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What's Working Today

### F5-TTS (The "Teacher")
- **Zero-shot voice cloning** from ~10s of reference audio
- **29 Elite Voice Seeds** stored in `public/voices/seeds/`
- Each character is linked to a `VoiceSeed` record in the database
- Reference text stored per seed to prevent "double-talk" artifacts
- Dynamic speed modulation based on `voiceSeed.energy` field
- RunPod serverless deployment with auto-scaling

### Voice Pool System
- Strict voice-first architecture: Voices are immutable, characters derive from them
- Each `PersonaTemplate` has a `voiceSeedId` linking to a canonical voice
- No random voice fallbacks — hard fail if seed is missing

---

## What's Incomplete

### 1. Supertonic Client-Side (WASM)
**File:** `lib/audio/supertonicGenerator.ts`

The WASM generator is scaffolded but **throws an error** because:
- No ONNX models are deployed to `public/models/supertonic/`
- The synthesis pipeline (text → encoder → duration → vocoder) is not implemented
- Voice style presets (`/models/supertonic/voice_styles/*.json`) don't exist

### 2. Supertonic Server-Side (RunPod)
**File:** `runpod-f5-tts/handler.py` (lines 56-64)

The handler has a placeholder that returns an error:
```python
if engine == "supertonic":
    return {"error": "Supertonic server-side inference not yet fully implemented"}
```

### 3. `isSupertonicCompatible` Field
The router checks `voiceSeed.isSupertonicCompatible` but this field doesn't exist in the Prisma schema.

---

## What Needs to Be Done for "Game-Changing"

### Option A: Full Supertonic Integration (Fast, Client-Side)
1. **Download Supertonic models** from HuggingFace (~130MB total)
2. **Deploy to CDN** or `public/models/supertonic/`
3. **Implement ONNX pipeline** in `supertonicGenerator.ts`
4. **Create voice presets** for each of the 29 voice seeds
5. Add `isSupertonicCompatible` to schema and seed it

### Option B: Upgrade F5-TTS (Best Quality)
1. **Add voice caching** on the Pod level (upload once, reuse)
2. **Reduce inference steps** from 32 → 16 for speed (trade-off)
3. **Add Supertonic-on-Pod** as hybrid (ONNX GPU inference)
4. **Streaming audio** via WebSocket for perceived latency reduction

### Option C: Integrate Cartesia Sonic (Premium, Fastest)
1. **Sign up** for Cartesia API
2. **Create client** similar to `elevenLabsClient.ts`
3. **Add to Router** as a third tier for premium users
4. **Latency:** 100-200ms TTFB (best in class)

---

## Environment Variables Required

```bash
# F5-TTS (Currently Active)
RUNPOD_API_KEY=your_runpod_api_key
RUNPOD_F5_ENDPOINT_ID=your_serverless_endpoint_id
# OR
RUNPOD_F5_POD_ID=your_pod_id  # For direct pod mode

# Supertonic (Future)
SUPERTONIC_MODEL_URL=https://cdn.example.com/models/supertonic/
```

---

## Quick Test Command

```bash
# Test TTS endpoint locally
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "characterId": "<character_id_from_db>"}'
```
