# Avatar Generation Guide

## Problem
Character avatars don't accurately match their personas. For example:
- "Mafia Job Report" should look like a mafia boss, not a generic person
- "Apocalypse (Zombie)" should look zombie-like
- "Dante" should match the character's specific description

## Solution
Use Gemini AI to generate accurate image prompts based on each character's:
- Name
- Tagline
- Category
- Archetype
- Persona description

## How to Use

### Option 1: Generate Prompt for Single Character (API)

```bash
curl -X POST http://localhost:3000/api/generate-avatar-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mafia Job Report",
    "tagline": "Noir Crime Drama",
    "category": "fiction",
    "archetype": "criminal",
    "persona": "You are a mafia boss...",
    "scenarioSkin": "noir"
  }'
```

**Response:**
```json
{
  "imagePrompt": "Realistic portrait of a serious and shrewd Caucasian man in his early 60s, a mafia boss...",
  "style": "realistic"
}
```

### Option 2: Batch Generate All Characters

Run the batch script (handles rate limiting automatically):

```bash
node scripts/batch-generate-prompts.js
```

This will:
- Process all 50 characters
- Handle API rate limits (5 requests/minute on free tier)
- Save results to `data/avatar-prompts-generated.json`
- Resume from where it left off if interrupted

### Option 3: Use in Code

```typescript
const response = await fetch('/api/generate-avatar-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: persona.name,
    tagline: persona.tagline,
    category: persona.category,
    archetype: persona.archetype,
    persona: persona.system?.persona,
    scenarioSkin: persona.scenarioSkin,
  }),
});

const { imagePrompt, style } = await response.json();
```

## Next Steps

1. **Review Generated Prompts**
   - Check `data/avatar-prompts-generated.json`
   - Verify prompts accurately describe each character

2. **Generate Images**
   Use the prompts with an image generation service:
   - **DALL-E 3** (OpenAI)
   - **Midjourney**
   - **Stable Diffusion**
   - **Gemini Image Generation** (if available)

3. **Update Avatar URLs**
   - Replace `avatarUrl` in `data/persona-templates.seed.json`
   - Re-seed database: `npm run db:seed`

## Example Prompts Generated

**Mafia Boss:**
> "Realistic portrait of a serious and shrewd Caucasian man in his early 60s, a mafia boss, captured in a casual 'person next door' style. He has short, neatly combed dark hair with prominent grey at the temples..."

**Grumpy Old Man:**
> "Realistic portrait of an elderly Caucasian man, late 60s, with a deeply etched frown line on his forehead..."

**Anime Character:**
> "Professional anime style portrait, upper body shot of an older, wise male mentor..."

## Notes

- **Rate Limits**: Free tier allows 5 requests/minute. The batch script handles this automatically.
- **Style Detection**: Automatically detects if character should be realistic or anime based on category/archetype.
- **Accuracy**: Prompts are generated based on the character's actual description, ensuring faces match personas.




