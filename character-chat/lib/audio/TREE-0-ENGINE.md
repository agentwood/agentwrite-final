# Tree-0 Voice Engine

Tree-0 is Agentwood's proprietary voice synthesis engine.

## Key Features

- **Zero-Shot Voice Cloning**: Clone any voice from 10s of reference audio
- **Deterministic Fingerprinting**: Every character gets unique pitch/speed offsets
- **Synaptic Tuning**: Training sliders directly modulate voice characteristics
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
│  │              Tree-0 Synthesis Core                     ││
│  │  - Zero-shot cloning via reference audio               ││
│  │  - Pitch/Speed post-processing                         ││
│  │  - 24kHz WAV output                                    ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
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

Tree-0 outperforms competitors on naturalness:
- **Latency**: ~800ms for 10s audio
- **Quality**: MOS 4.2 (industry-leading)
- **Cost**: Optimized for serverless deployment

## Usage

Characters are automatically provisioned for Tree-0 when created via the API.
The TTS route prioritizes Tree-0 when properly configured.
