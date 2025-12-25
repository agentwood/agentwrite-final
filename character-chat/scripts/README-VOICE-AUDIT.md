# 5-Agent Voice Audit System

This system audits character voices using 5 AI agents to ensure optimal voice-character matching.

## Overview

The audit system:
1. Selects 30 diverse characters from the database
2. Generates 5 test dialogues per character
3. Generates TTS samples for all character-voice combinations (30 voices × 30 characters × 5 dialogues = 4,500 samples)
4. Runs 5-agent evaluations (gender, age, accent, overall, consistency)
5. Ranks and assigns optimal voices (one character per voice)
6. Updates database with results
7. Generates comprehensive audit report

## Usage

### Run Full Audit

```bash
cd character-chat
npx tsx scripts/voice-audit-system.ts
```

### Run Individual Phases

```bash
# Phase 1: Select characters
npx tsx scripts/extract-character-data.ts

# Phase 2: Generate dialogues
npx tsx scripts/generate-test-dialogues.ts

# Phase 3: Generate TTS samples
npx tsx scripts/generate-tts-samples.ts

# Phase 4: Run evaluations
npx tsx scripts/score-and-rank.ts

# Phase 5: Apply results
npx tsx scripts/apply-audit-results.ts

# Phase 6: Generate report
npx tsx scripts/generate-audit-report.ts
```

## Requirements

- `GEMINI_API_KEY` environment variable must be set
- Database must be accessible (Prisma configured)
- Sufficient API quota for ~9,000 Gemini API calls (4,500 TTS + 4,500 evaluations)

## Output Files

- `scripts/selected-characters.json` - Selected 30 characters
- `scripts/test-dialogues.json` - Generated test dialogues
- `scripts/tts-samples.json` - TTS audio samples (base64)
- `scripts/voice-evaluations.json` - All evaluation results
- `scripts/audit-results.json` - Final rankings and assignments
- `docs/voice-audit-report.md` - Comprehensive audit report

## Progress Tracking

The system saves progress after each phase. If interrupted, you can resume by running the script again - it will skip completed phases.

## Estimated Time

- Full audit: 2-4 hours (depending on API rate limits)
- Each phase can take 20-60 minutes

## 5-Agent Evaluation Criteria

1. **Gender Match** (20%): Does voice gender match character gender?
2. **Age Match** (20%): Do voice age characteristics match character age?
3. **Accent Match** (20%): Does voice accent match character's cultural background?
4. **Overall Fit** (20%): Holistic assessment of voice-character match
5. **Consistency** (20%): Does voice remain consistent across dialogue contexts?

Final score is weighted average of all 5 criteria.



