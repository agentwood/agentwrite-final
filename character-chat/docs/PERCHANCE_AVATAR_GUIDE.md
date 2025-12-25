# Perchance Avatar Generation Guide

This guide explains how to generate safe, upper-body (belly-upward) character avatars using Perchance.org AI Anime Generator.

## Overview

- **Total Characters**: 50
- **Gender Distribution**: 31 Male, 19 Female
- **Style**: Upper body shots, bust portraits, from waist up
- **Safety**: All prompts include "safe, non-sexualized, appropriate clothing"

## Step-by-Step Process

### 1. Access Perchance Generator

Visit: https://perchance.org/ai-anime-generator

### 2. Generate Images

For each character:

1. Open `character-chat/data/perchance-prompts.json`
2. Copy the `prompt` for the character you want to generate
3. Paste it into the Perchance generator
4. Click "Generate"
5. Review the image - regenerate if needed
6. Download the image
7. Save it as `[character-id].jpg` (e.g., `grumpy-old-man.jpg`)

### 3. Organize Images

Save all generated images to:
```
character-chat/public/avatars/
```

Example structure:
```
character-chat/public/avatars/
  ├── grumpy-old-man.jpg
  ├── california-surfer.jpg
  ├── wise-mentor.jpg
  └── ...
```

### 4. Update Avatar URLs

After generating all images, run:

```bash
cd character-chat
node scripts/update-avatar-urls.js
```

This script will:
- Scan `/public/avatars/` for generated images
- Update `avatarUrl` fields in `persona-templates.seed.json`
- Set URLs to `/avatars/[character-id].jpg`

### 5. Reseed Database

After updating URLs:

```bash
npm run db:seed
```

## Prompt Guidelines

All prompts follow this structure:
- **Composition**: `anime portrait, [gender], upper body shot, bust, from waist up`
- **Physical Details**: Height, age, hair, features
- **Character Type**: Specific to character (wizard, knight, etc.)
- **Safety Tags**: `safe, non-sexualized, appropriate clothing, professional, clean, wholesome`

## Character List

See `character-chat/data/perchance-prompts.json` for the complete list with:
- Character ID
- Character Name
- Gender
- Detailed Prompt
- Description

## Tips

1. **Regenerate if needed**: Perchance allows multiple generations - regenerate until you get a good match
2. **Focus on upper body**: All prompts specify "from waist up" to ensure safe, appropriate images
3. **Match character description**: The prompts are designed to match the character's physical description
4. **Consistent style**: All images should be anime-style for consistency

## Troubleshooting

### Images not loading
- Ensure images are saved in `/public/avatars/`
- Check file names match character IDs exactly
- Verify Next.js is configured to serve static files from `/public`

### Prompt not generating good results
- Try regenerating with the same prompt
- Slightly modify the prompt if needed (but keep safety tags)
- Ensure "upper body shot" and "from waist up" are included

## Next Steps

After generating all images:
1. Verify all 50 images are generated
2. Run `node scripts/update-avatar-urls.js`
3. Run `npm run db:seed`
4. Test in the application




