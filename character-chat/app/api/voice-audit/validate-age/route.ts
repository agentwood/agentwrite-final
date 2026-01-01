import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Agent 2: Age Match Validation
 * POST /api/voice-audit/validate-age
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, characterName, description, voiceName } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are Agent 2 - Age Match Validator.

Character: ${characterName}
Description: ${description}
Assigned Voice: ${voiceName}

VOICE AGE CHARACTERISTICS:
Deep/Mature Voices (40+ years): charon, fenrir, orus, rasalgethi
Mid-Range Voices (25-40 years): kore, puck, algenib, algieba, alnilam
Young/Light Voices (15-25 years): aoede, leda, despina, zephyr
Very Young Voices (under 15): puck, kore

TASK:
1. Determine the character's approximate age from description/context
2. Check if voice age characteristics match the character's age
3. Score the match from 0-100

Return ONLY a JSON object:
{
  "score": <number 0-100>,
  "estimatedAge": "<age or age range>",
  "voiceAgeCategory": "<deep/mid/young/very-young>",
  "match": <true/false>,
  "reasoning": "<brief explanation>",
  "agentType": "age"
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
        console.error('Agent 2 validation error:', error);
        return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 500 }
        );
    }
}
