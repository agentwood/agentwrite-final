import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Agent 1: Gender Match Validation
 * POST /api/voice-audit/validate
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, characterName, description, voiceName, category, archetype } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are Agent 1 - Gender Match Validator.

Character: ${characterName}
Description: ${description}
Category: ${category}
Archetype: ${archetype}
Assigned Voice: ${voiceName}

VOICE GENDER CLASSIFICATIONS:
Female Voices: aoede, kore, leda, autonoe, callirrhoe, despina, erinome, pulcherrima, sadachbia, sadaltager, schedar, sulafat, vindemiatrix, zephyr, zubenelgenubi, achird
Male Voices: fenrir, charon, puck, achernar, algenib, algieba, alnilam, enceladus, gacrux, iapetus, orus, rasalgethi, umbriel
Neutral Voices: kore, puck, zephyr

TASK:
1. Determine the character's gender from their name and description
2. Check if the assigned voice matches their gender
3. Score the match from 0-100 (100 = perfect match, 0 = complete mismatch)

Return ONLY a JSON object:
{
  "score": <number 0-100>,
  "characterGender": "<male/female/neutral>",
  "voiceGender": "<male/female/neutral>",
  "match": <true/false>,
  "reasoning": "<brief explanation>",
  "agentType": "gender"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
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
        console.error('Agent 1 validation error:', error);
        return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 500 }
        );
    }
}
