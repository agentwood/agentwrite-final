# Character Update Guide

## Overview

The `update-all-characters.ts` script updates all 75 characters (50 Human + 25 Fantasy) with detailed profiles including:

- **Accurate voice configurations** matching TTS specs
- **Character-appropriate greetings** (not generic "Hello, how are you?")
- **Proper accent profiles** locked via styleHint
- **Age-appropriate voices** (older characters sound older)
- **Gender-matched voices** (female characters use female voices, etc.)
- **Generated images** matching character descriptions

## Running the Script

```bash
cd character-chat
npm run update-all-characters
```

**Expected Duration:** 30-40 minutes (due to rate limits and API calls)

## What the Script Does

1. **Updates existing characters** by matching names (handles nicknames and variations)
2. **Creates new characters** if they don't exist
3. **Generates greetings** using Gemini AI (character-appropriate, not generic)
4. **Generates images** for each character (realistic for humans, anime-style for fantasy)
5. **Parses TTS voice specs** to assign correct voices:
   - Extracts pace, pitch, and voice characteristics
   - Matches gender and age to appropriate voices
   - Locks accent via styleHint

## Voice Configuration

The script intelligently parses TTS specs to assign voices:

- **Female voices:** aoede (mature), kore (warm), pulcherrima (bright/energetic)
- **Male voices:** fenrir (strong), charon (deep/mature), puck (energetic)
- **Age consideration:** Older characters (60+) get lower pitch and slower pace
- **Accent locking:** Full TTS spec stored as styleHint to lock accents

## Character Categories

### Human Characters (50)
- Various professions and personalities
- Realistic accents matching heritage
- Age-appropriate voices
- Character-specific greetings

### Fantasy Characters (25)
- Anime/waifu aesthetic
- Fantasy archetypes (warrior, mage, healer, etc.)
- Appropriate fantasy accents
- Anime-style images

## Troubleshooting

### Rate Limit Errors
- The script handles rate limits automatically
- Images may be skipped if quota is exceeded (uses placeholder)
- Script continues with remaining characters

### Character Not Found
- Script tries multiple name variations
- Creates new character if no match found
- Uses character ID for uniqueness

### Image Generation Failures
- Falls back to placeholder image
- Logs error but continues
- Can regenerate images later with `update-assets` script

## Verification

After running, verify:
1. Check database for updated characters
2. Test voices match character descriptions
3. Verify greetings are character-appropriate
4. Check images are generated correctly

## Notes

- Script includes 8-second delays between characters to avoid rate limits
- All voice configurations are locked to prevent changes during conversation
- Accent profiles are stored in styleHint for consistency
- System prompts include full character details for accurate roleplay




