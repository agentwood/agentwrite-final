import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Agent 5: Consistency Validation
 * POST /api/voice-audit/validate-consistency
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, voiceName } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are Agent 5 - Consistency Validator.

Assigned Voice: ${voiceName}

VOICE CONSISTENCY RATINGS:
Highly Consistent (stable across contexts): kore, fenrir, charon, puck
Moderately Consistent: aoede, algenib, algieba
Variable (changes with context): leda, zephyr

TASK:
Evaluate if this voice maintains consistency across different:
- Emotional states (happy, sad, angry, neutral)
- Speaking contexts (casual chat, formal, storytelling)
- Dialogue lengths (short responses vs long explanations)

Score from 0-100 for voice consistency and reliability.

Return ONLY a JSON object:
{
  "score": <number 0-100>,
  "consistencyRating": "<high/moderate/variable>",
  "emotionalStability": "<stable/moderate/variable>",
  "contextualStability": "<stable/moderate/variable>",
  "lengthStability": "<stable/moderate/variable>",
  "reasoning": "<brief explanation>",
  "agentType": "consistency"
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
        console.error('Agent 5 validation error:', error);
        return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 500 }
        );
    }
}
