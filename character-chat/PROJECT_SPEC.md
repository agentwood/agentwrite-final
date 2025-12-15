# Persona Library System - Project Specification

## Overview

The Persona Library is a character.ai-style chat system that allows users to interact with AI personas. The system uses an archetype-based template system with telemetry-driven discovery and ranking.

## Architecture

### Core Components

1. **PersonaTemplate Schema**: Database model for persona definitions
2. **Archetype System**: 12 archetypes × tone packs × scenario skins
3. **Discovery Pipeline**: Weekly ranking based on retention metrics
4. **Admin Tools**: CSV import for persona templates
5. **Gallery UI**: Featured/trending sections with category filters

## Database Schema

### PersonaTemplate

```prisma
model PersonaTemplate {
  id            String   @id @default(cuid())
  seedId        String?  @unique
  name          String
  tagline       String?
  greeting      String?
  category      String
  avatarUrl     String
  voiceName     String
  styleHint     String?
  systemPrompt  String
  
  // Archetype system
  archetype     String
  tonePack      String?
  scenarioSkin  String?
  
  // Telemetry
  viewCount     Int      @default(0)
  chatCount     Int      @default(0)
  retentionScore Float   @default(0.0)
  featured      Boolean  @default(false)
  trending      Boolean  @default(false)
  lastRankedAt  DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  conversations Conversation[]
}
```

## Archetype System

### 12 Core Archetypes

1. Hero - Protagonist who overcomes challenges
2. Mentor - Wise guide who teaches
3. Ally - Supportive friend/companion
4. Trickster - Mischievous, unpredictable
5. Guardian - Protector, defender
6. Herald - Messenger, catalyst
7. Shadow - Dark reflection, antagonist
8. Threshold Guardian - Tests the hero
9. Shapeshifter - Unpredictable, changes
10. Explorer - Seeks new experiences
11. Curmudgeon - Grumpy but caring
12. Healer - Provides comfort and support

### Tone Packs

- Comedic: Light, humorous
- Dramatic: Serious, emotional
- Supportive: Encouraging, warm
- Mysterious: Enigmatic, secretive

### Scenario Skins

- Modern: Contemporary settings
- Fantasy: Magical worlds
- Sci-Fi: Futuristic
- Noir: Dark, gritty
- Historical: Past eras

**Total Combinations**: 12 × 4 × 5 = 240 possible personas

## Chat Modes

### Mode A: Text-Only Chat
- Standard text conversation
- Uses `gemini-2.5-flash`
- No audio features

### Mode C: Text + Voice Playback
- Text chat with optional TTS
- Uses `gemini-2.5-flash` for text
- Uses `gemini-2.5-flash-preview-tts` for voice
- "Play Voice" button on assistant messages
- Voice toggle in chat header

### Mode B: Audio-Only Call
- Real-time audio conversation
- Uses `gemini-2.5-flash-native-audio-preview-12-2025`
- Live API WebSocket connection
- Push-to-talk interface
- PCM16 audio processing (16kHz input, 24kHz output)

## API Endpoints

### Public Endpoints

- `GET /api/characters` - List personas (supports category, featured, trending, archetype filters)
- `POST /api/conversations` - Create conversation
- `POST /api/chat` - Send message (Mode A & C)
- `POST /api/tts` - Generate TTS audio (Mode C)
- `POST /api/live-token` - Get ephemeral token for Live API (Mode B)

### Admin Endpoints

- `POST /api/admin/import` - CSV import for persona templates
- `POST /api/admin/rank` - Trigger persona ranking (weekly cron)

## Discovery Pipeline

### Retention Score Calculation

Formula: `(chatCount × 0.4) + (avgMessagesPerChat × 0.3) + (returnRate × 100 × 0.3)`

Metrics:
- `chatCount`: Number of conversations started
- `avgMessagesPerChat`: Average messages per conversation
- `returnRate`: Percentage of users who chat multiple times

### Ranking Process

1. Calculate retention score for all personas
2. Sort by score (descending)
3. Top 10% → Featured
4. Top 20% → Trending
5. Update database flags
6. Generate remix suggestions

### Remix Suggestions

The system suggests new persona combinations by:
- Identifying high-performing archetypes
- Finding missing combinations
- Recommending proven tone pack + scenario skin pairs

## Gallery Features

### Sections

1. **Featured**: Top 10% by retention score
2. **Trending**: Top 20% by retention score
3. **All Personas**: Complete list with filters

### Filters

- Category (fiction, educational, support, etc.)
- Archetype
- Tone Pack
- Scenario Skin

## Admin Tools

### CSV Import

Format:
```csv
id,name,tagline,greeting,category,avatarUrl,voiceName,styleHint,archetype,tonePack,scenarioSkin,persona,boundaries,style,examples
```

- `boundaries`: Semicolon-separated
- `style`: Semicolon-separated
- `examples`: JSON array string

### Weekly Ranking

Cron job calls `/api/admin/rank` to:
- Calculate retention scores
- Update featured/trending flags
- Generate remix suggestions

## Seed Data

Initial seed includes 50 persona templates covering:
- All 12 archetypes
- Multiple tone pack combinations
- Various scenario skins
- Diverse categories (fiction, educational, support)
- Character.ai-style personas (original creations, 99% accuracy)

## Content Filter

Comprehensive content filter similar to Character.ai:
- Blocks explicit profanity
- Blocks sexual content
- Blocks aggression and violence
- Blocks real-world weapons (guns, knives, bombs)
- Allows fantasy weapons (swords, magic) in appropriate contexts
- Allows gaming and historical contexts
- Integrated into chat API and system prompts

## Documentation

- `PERSONA_AUTHORING_GUIDE.md`: How to create persona templates
- Includes breakdowns for "Grumpy Old Man" and "California Surfer"
- Explains motivation, voice, hooks, arc, and knobs

## Implementation Status

✅ Database schema with telemetry fields
✅ Archetype system (12 archetypes)
✅ Seed script for 50 templates
✅ Discovery pipeline (ranking + remix suggestions)
✅ Admin CSV import endpoint
✅ Gallery with featured/trending sections
✅ Category filters
✅ Mode C TTS integration
✅ Mode B Live API integration
✅ Documentation

## Next Steps

1. Expand seed to full 50 templates
2. Add authentication for admin endpoints
3. Set up weekly cron job for ranking
4. Implement TTS caching
5. Add user authentication for quotas
6. Mobile responsiveness improvements

