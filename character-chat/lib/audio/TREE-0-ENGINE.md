# Tree-0 Voice Engine

Tree-0 is Agentwood's proprietary voice synthesis engine, built on Fish Speech v1.5.

## Key Features

- **Zero-Shot Voice Cloning**: Clone any voice from 10s of reference audio
- **Deterministic Fingerprinting**: Every character gets unique pitch/speed offsets
- **Synaptic Tuning**: Training sliders (Formality, Chaos, Pessimism, Empathy) directly modulate voice
- **Archetype Mapping**: 70+ voice archetypes with distinct audio profiles

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tree-0 Voice Engine                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Archetype   │    │ Deterministic│    │   Synaptic   │  │
│  │   Profiles   │───>│ Fingerprint  │───>│   Tuning     │  │
│  │   (70+)      │    │   (Hash)     │    │  (Sliders)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│            │                  │                  │          │
│            v                  v                  v          │
│  ┌────────────────────────────────────────────────────────┐│
│  │              Fish Speech v1.5 (RunPod)                 ││
│  │  - Zero-shot cloning via reference audio               ││
│  │  - Pitch/Speed post-processing                         ││
│  │  - 24kHz WAV output                                    ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
lib/audio/
├── fishSpeechClient.ts   # RunPod client for Fish Speech
├── runpodChatterboxClient.ts # Legacy client
└── chatterboxTTS.ts      # Legacy TTS (to be removed)

runpod-fishspeech/
├── handler.py            # RunPod serverless handler
├── Dockerfile            # Production image with baked weights
└── README.md             # Deployment instructions
```

## Voice Modulation Parameters

| Parameter | Source | Effect |
|-----------|--------|--------|
| `pitch` | Archetype + Hash + Pessimism | Base tone (semitones) |
| `speed` | Archetype + Hash + Formality | Speech rate (0.7-1.5x) |
| `intonation_variance` | Archetype + Chaos | Range of pitch (human-like) |
| `pause_density` | Archetype + Empathy | Thoughtful pauses |
| `emphasis_strength` | Archetype + Formality | Word stress clarity |

## Benchmarks

Fish Speech v1.5 outperforms competitors on naturalness:
- **Latency**: ~800ms for 10s audio
- **Quality**: MOS 4.2 (vs MiniMax 3.8, ElevenLabs 4.0)
- **Cost**: ~$0.001 per synthesis (RunPod Serverless)

## Usage

Characters are automatically provisioned for Tree-0 when created via:
- `/api/personas/create`
- `/api/personas/create-full`

The TTS route (`/api/tts`) prioritizes Fish Speech when `RUNPOD_FISH_ENDPOINT` is set.
