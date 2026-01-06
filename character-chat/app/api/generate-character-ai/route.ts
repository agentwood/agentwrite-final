import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Available Fish Audio voices for suggestion
const AVAILABLE_VOICES = {
    female: ['Samantha', 'Aria', 'Nova', 'Luna', 'Victoria', 'Grace', 'Melody'],
    male: ['Alex', 'Marcus', 'Leo', 'Ethan', 'Victor', 'James', 'Rafael'],
    neutral: ['Quinn', 'Morgan', 'Avery', 'Riley']
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, name, description, gender } = body;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let prompt = '';
        let responseSchema: Record<string, unknown> = {};

        switch (type) {
            case 'expand_persona':
                prompt = `You are an expert character designer for an immersive AI companion app.
        
The user wants to create a character with the following basic info:
Name: ${name || 'Unnamed'}
Gender: ${gender || 'Not specified'}
Basic Description: ${description || 'No description provided'}

Generate a rich, detailed persona prompt that includes:
1. Personality traits (5-7 specific traits)
2. Speaking style and mannerisms
3. Background/backstory elements
4. How they interact with users
5. Example dialogue patterns

Return ONLY a JSON object:
{
  "persona": "<detailed persona prompt, 200-400 words>",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "speakingStyle": "<brief description of how they speak>"
}`;
                break;

            case 'suggest_tagline':
                prompt = `Generate a catchy, memorable tagline for an AI character.

Character Name: ${name}
Description: ${description}
Gender: ${gender}

The tagline should be:
- 5-10 words max
- Intriguing and inviting
- Capture their essence

Return ONLY a JSON object:
{
  "tagline": "<the tagline>",
  "alternatives": ["alt1", "alt2", "alt3"]
}`;
                break;

            case 'suggest_voice':
                prompt = `You are matching an AI character to a voice.

Character Name: ${name}
Description: ${description}
Gender: ${gender}

Available voices by gender:
- Female: ${AVAILABLE_VOICES.female.join(', ')}
- Male: ${AVAILABLE_VOICES.male.join(', ')}
- Neutral: ${AVAILABLE_VOICES.neutral.join(', ')}

Based on the character's personality and gender, suggest the most fitting voice.

Return ONLY a JSON object:
{
  "suggestedVoice": "<voice name>",
  "reasoning": "<why this voice fits>",
  "alternatives": ["alt1", "alt2"]
}`;
                break;

            case 'suggest_greeting':
                prompt = `Generate an opening greeting message for an AI character.

Character Name: ${name}
Description: ${description}
Gender: ${gender}

The greeting should:
- Be in-character
- Be warm and inviting
- Set the tone for interaction
- Be 1-3 sentences

Return ONLY a JSON object:
{
  "greeting": "<the greeting message>",
  "alternatives": ["alt1", "alt2"]
}`;
                break;

            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from AI response');
        }

        const generatedContent = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            type,
            ...generatedContent
        });
    } catch (error: any) {
        console.error('AI character generation error:', error);
        return NextResponse.json(
            { error: 'Generation failed', details: error.message },
            { status: 500 }
        );
    }
}
