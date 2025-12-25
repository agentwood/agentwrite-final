# OpenVoice Migration Guide

## Overview

This document describes the migration from Gemini TTS to OpenVoice for character voice synthesis. OpenVoice provides zero-shot voice cloning, allowing unique voices for each character.

## Architecture

```
Next.js App → /api/tts → OpenVoice Client → OpenVoice Server → PCM Audio
                                    ↓ (fallback)
                              Gemini TTS API
```

## Migration Steps

### 1. Prerequisites

- OpenVoice server deployed and accessible
- Reference audio generated for all characters
- Environment variable `USE_OPENVOICE=true` set

### 2. Generate Base Reference Audio

Generate 3-6 second reference audio samples for all characters:

```bash
cd character-chat
npx tsx scripts/generate-base-voices.ts
```

This uses Gemini TTS one final time to create reference audio, then stores it in the database.

### 3. Deploy OpenVoice Server

See [OpenVoice Deployment Guide](./OPENVOICE_DEPLOYMENT.md) for detailed deployment instructions.

Quick start:
```bash
cd services/openvoice
docker-compose up -d
```

### 4. Test Migration

Test OpenVoice integration with sample characters:

```bash
cd character-chat
npx tsx scripts/test-openvoice-migration.ts
```

### 5. Enable OpenVoice

Set environment variable:
```env
USE_OPENVOICE=true
OPENVOICE_API_URL=http://your-openvoice-server.com
```

### 6. Monitor and Verify

- Check logs for OpenVoice usage
- Monitor error rates
- Verify audio quality
- Test with multiple characters

## Feature Flag

The migration uses a feature flag `USE_OPENVOICE`:

- `USE_OPENVOICE=false` (default): Uses Gemini TTS
- `USE_OPENVOICE=true`: Uses OpenVoice with Gemini TTS fallback

## Fallback Behavior

If OpenVoice fails, the system automatically falls back to Gemini TTS:

1. OpenVoice health check fails
2. OpenVoice synthesis fails
3. Character has no reference audio
4. Network/timeout errors

## Database Schema

New fields added to `PersonaTemplate`:

- `referenceAudioUrl`: URL to reference audio file
- `referenceAudioBase64`: Base64 encoded reference audio
- `openVoiceVoiceId`: Cached OpenVoice voice ID

## Voice Parameter Mapping

Existing voice parameters are mapped to OpenVoice equivalents:

- `speed` → `speed` (0.5 - 2.0)
- `pitch` → `speed` adjustment (higher pitch = slightly faster)
- `styleHint` → `tone` and `emotion`
- Accent info in `styleHint` → `accent`

## Rollback Plan

If issues occur:

1. Set `USE_OPENVOICE=false` in environment
2. System automatically uses Gemini TTS
3. No code changes needed
4. Monitor error rates and switch back when ready

## Performance Considerations

- **Latency**: OpenVoice may have higher latency than Gemini TTS
- **Caching**: Voice IDs are cached to reduce cloning overhead
- **Batch Processing**: Use batch endpoint for multiple texts

## Troubleshooting

### OpenVoice not working

1. Check server health: `curl http://your-server/health`
2. Verify `USE_OPENVOICE=true` is set
3. Check reference audio exists in database
4. Review server logs

### Fallback to Gemini TTS

- Normal behavior if OpenVoice unavailable
- Check OpenVoice server status
- Verify network connectivity
- Review error logs

### Audio quality issues

- Verify reference audio quality (3-6 seconds, clear)
- Check voice parameter mapping
- Test with different reference texts

## Next Steps

After successful migration:

1. Monitor performance and quality
2. Optimize voice parameter mappings
3. Consider removing Gemini TTS dependency (optional)
4. Update documentation




