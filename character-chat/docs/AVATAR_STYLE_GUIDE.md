# Avatar Style Guide

## Overview

Agentwood uses two distinct avatar styles based on character type:

1. **Minimalist Cartoon Style** (Template Style) - For human/realistic characters
2. **Waifu Anime Style** - For fantasy characters

## Style Guidelines

### Minimalist Cartoon Style (Human Characters)

**When to use:**
- Real-world, human characters
- Characters set in modern/contemporary settings
- Characters that are meant to be "the person next door"
- User-created human characters

**Characteristics:**
- Clean, simple lines
- Limited color palette (soft pastels: blues, purples, pinks, beiges)
- Minimalist aesthetic
- Rounded square frame
- Chest-up portrait style
- Similar to the template image provided

**Implementation:**
- Uses Dicebear's "avataaars" style
- Generated via `getMinimalistCartoonAvatar()` function
- Consistent seed-based generation for same character

**Example characters:**
- Grumpy Old Man
- California Surfer
- Sassy Best Friend
- Chef Gordon
- AI Tutor
- Therapy Bot

### Waifu Anime Style (Fantasy Characters)

**When to use:**
- Fantasy characters
- Characters with magical/supernatural elements
- Characters in fantasy settings
- Anime-style characters
- All non-human/realistic characters

**Characteristics:**
- High-quality waifu anime aesthetic
- Similar to Talkie AI style
- Detailed anime art style
- Colorful and stylized

**Implementation:**
- Uses `thiswaifudoesnotexist.net` service
- Generated via `getWaifuAnimeAvatar()` function
- Consistent seed-based generation

**Example characters:**
- Wise Mentor
- Detective Noir
- Space Explorer
- Medieval Knight
- Vampire Noble
- All fantasy archetypes

## Usage in Code

### Import the avatar generator:

```typescript
import { generateAvatar, isHumanCharacter } from '@/lib/avatarGenerator';
```

### Generate avatar for a character:

```typescript
// Automatic detection
const avatarUrl = generateAvatar({
  characterId: 'my-character-id',
  characterName: 'My Character',
  isFantasy: false, // or true
  isHuman: true,   // or false
});

// Or use explicit functions
import { getMinimalistCartoonAvatar, getWaifuAnimeAvatar } from '@/lib/avatarGenerator';

const humanAvatar = getMinimalistCartoonAvatar('character-id');
const fantasyAvatar = getWaifuAnimeAvatar('character-id');
```

### Check character type:

```typescript
import { isHumanCharacter } from '@/lib/avatarGenerator';

if (isHumanCharacter(characterId)) {
  // Use minimalist cartoon style
} else {
  // Use waifu anime style
}
```

## Template Style Reference

The minimalist cartoon template style should match these characteristics:

- **Aesthetic**: Clean, simple, minimalist
- **Colors**: Limited palette (black lines, white/light colors, deep indigo blue background)
- **Style**: Cartoon illustration, chest-up portrait
- **Frame**: Rounded square
- **Lines**: Simple black lines defining features
- **Shading**: Minimal or no shading
- **Expression**: Can show various emotions but maintains simplicity

This style is used as the default template for:
- Character creation UI
- Human character avatars
- User-generated characters (unless explicitly fantasy)

## Updating Avatars

To update all avatars in the seed file:

```bash
cd character-chat
node scripts/update-avatars-cartoon.js
```

This will:
- Update human characters to minimalist cartoon style
- Update fantasy characters to waifu anime style
- Maintain consistency across all characters

## Best Practices

1. **Consistency**: Always use the same style for the same character type
2. **Seed-based**: Use character ID as seed for consistent generation
3. **User Creation**: Default to minimalist cartoon for user-created characters
4. **Fantasy Detection**: Automatically detect fantasy characters based on category/archetype
5. **Template Matching**: Ensure human characters match the template aesthetic



