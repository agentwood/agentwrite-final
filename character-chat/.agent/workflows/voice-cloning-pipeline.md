---
description: Master workflow for creating unique character voices using ElevenLabs samples cloned to Fish Audio
---

# Voice Cloning Pipeline

> [!CAUTION]
> **MANDATORY RULE**: All voice downloads MUST capture transcript + full metadata.
> Never download audio without the corresponding transcript text.

## Prerequisites
- `ELEVENLABS_API_KEY` - For downloading voice samples
- `FISH_AUDIO_API_KEY` - For creating voice clones (if using Fish Audio)

---

## Step 1: Download ElevenLabs Samples (With Metadata)

This script downloads audio AND captures all metadata including the transcript:

```bash
// turbo
ELEVENLABS_API_KEY=your_key npx tsx scripts/download-elevenlabs-voices.ts
```

**Output**: 
- `public/voices/elevenlabs/*.mp3` - Audio files
- `lib/audio/voiceMetadata.json` - Full metadata including transcripts

**MANDATORY DATA CAPTURED**:
- Voice ID
- Voice Name  
- Sample Transcript (REQUIRED)
- Description
- Labels/Tags
- Accent
- Gender
- Age
- Use Case

---

## Step 2: Clone to Fish Audio (Optional)

If using Fish Audio instead of F5-TTS:

```bash
// turbo
FISH_AUDIO_API_KEY=your_key npx tsx scripts/clone-to-fish-audio.ts
```

---

## Step 3: Seed Database

Update VoiceSeed records with all metadata:

```bash
// turbo
npx tsx scripts/seed-voice-metadata.ts
```

---

## Verification Checklist
- [ ] Each voice has audio file
- [ ] Each voice has transcript in database
- [ ] Each voice has metadata (accent, gender, age)
- [ ] Test 5 characters for unique voices
