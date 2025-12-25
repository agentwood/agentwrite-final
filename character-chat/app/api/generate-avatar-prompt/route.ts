import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';

/**
 * Generate an accurate image prompt for a character avatar using Gemini
 * POST /api/generate-avatar-prompt
 * Body: { name, tagline, category, archetype, persona }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tagline, category, archetype, persona, scenarioSkin } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Character name is required' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Determine if character should be realistic or anime
    const isAnime = category === 'fiction' && 
                    (archetype?.toLowerCase().includes('anime') || 
                     name.toLowerCase().includes('anime') ||
                     scenarioSkin === 'fantasy');

    const prompt = `You are an expert at creating detailed, accurate image prompts for character portraits.

Character Details:
- Name: ${name}
- Tagline: ${tagline || 'N/A'}
- Category: ${category || 'fiction'}
- Archetype: ${archetype || 'N/A'}
- Persona: ${persona || 'N/A'}

Generate a detailed image prompt for this character's portrait/avatar. The prompt must:
1. Accurately match the character's name and description (e.g., "Grumpy Old Man" should look like an old grumpy man, "Mafia" should look like a mafia member, "Zombie" should look zombie-like, "Dante" should match the character's description)
2. Style: ${isAnime ? 'Anime/waifu style, stylized, colorful' : 'Realistic portrait, casual "person next door" style, natural lighting'}
3. Format: Professional headshot/portrait, upper body or close-up face
4. Expression: Match the character's personality (grumpy = frowning, mafia = serious/intimidating, zombie = undead appearance, etc.)
5. Age and appearance: Match what the character name/description implies
6. Clothing/style: Match the character's archetype and persona

Return ONLY the image prompt text (no markdown, no explanations). Make it specific and detailed.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const imagePrompt = result.text?.trim();

    if (!imagePrompt) {
      return NextResponse.json(
        { error: 'Failed to generate image prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagePrompt,
      style: isAnime ? 'anime' : 'realistic',
    });
  } catch (error: any) {
    console.error('Error generating avatar prompt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image prompt' },
      { status: 500 }
    );
  }
}



