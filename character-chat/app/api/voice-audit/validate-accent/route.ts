import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Agent 3: Accent/Cultural Match Validation
 * POST /api/voice-audit/validate-accent
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, description, voiceName } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are Agent 3 - Accent/Cultural Match Validator.

Description: ${description}
Assigned Voice: ${voiceName}

VOICE CULTURAL TONES:
Neutral/American: kore, puck, fenrir, charon
European: algenib, algieba, schedar
Asian-Influenced: aoede (can sound pan-Asian)
Global/Ambiguous: zephyr, oru's, leda

TASK:
1. Identify any cultural/regional indicators in the character description
2. Check if the voice has appropriate accent/cultural tone
3. Score the match from 0-100
4. If no cultural indicators are found, assume neutral and score based on voice appropriateness

Return ONLY a JSON object:
{
  "score": <number 0-100>,
  "culturalBackground": "<identified culture or 'neutral'>",
  "voiceCulturalTone": "<voice cultural association>",
  "match": <true/false>,
  "reasoning": "<brief explanation>",
  "agentType": "accent"
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
        validation.voiceName = voiceName;

        return NextResponse.json(validation);
    } catch (error: any) {
        console.error('Agent 3 validation error:', error);
        return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 500 }
        );
    }
}
