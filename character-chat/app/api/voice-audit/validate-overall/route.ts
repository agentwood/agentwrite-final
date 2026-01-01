import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Agent 4: Overall Fit Validation
 * POST /api/voice-audit/validate-overall
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, characterName, description, voiceName, category, archetype } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are Agent 4 - Overall Fit Validator.

Character: ${characterName}
Description: ${description}
Category: ${category}
Archetype: ${archetype}
Assigned Voice: ${voiceName}

TASK:
Provide a holistic assessment of how well this voice fits the character overall.
Consider:
- Personality match (does voice energy match character personality?)
- Role appropriateness (does voice fit their role/profession?)
- User expectations (would users expect this voice for this character?)
- Emotional range (can voice convey character's emotional depth?)

Score from 0-100 for Overall Fit.

Return ONLY a JSON object:
{
  "score": <number 0-100>,
  "personalityMatch": "<good/fair/poor>",
  "roleAppropriateness": "<good/fair/poor>",
  "userExpectation": "<meets/neutral/misses>",
  "emotionalRange": "<good/fair/poor>",
  "reasoning": "<comprehensive explanation>",
  "agentType": "overall"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from AI response');
        }

        const validation = JSON.parse(jsonMatch[0]);
        validation.characterId = characterId;
        validation.characterName = characterName;
        validation.voiceName = voiceName;

        return NextResponse.json(validation);
    } catch (error: any) {
        console.error('Agent 4 validation error:', error);
        return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 500 }
        );
    }
}
