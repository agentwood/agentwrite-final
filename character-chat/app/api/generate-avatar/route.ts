import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';

export async function POST(request: NextRequest) {
  try {
    const { characterName, description, category, isRealistic } = await request.json();

    if (!characterName || !description) {
      return NextResponse.json(
        { error: 'characterName and description are required' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Build image prompt based on character type
    let imagePrompt = '';
    
    if (isRealistic) {
      // Realistic human face
      imagePrompt = `Generate a realistic, professional portrait photo of ${characterName}. ${description}. 
      The image should be a headshot or upper body shot, professional quality, natural lighting, 
      suitable for a profile picture. Focus on the face and upper torso. No background distractions.`;
    } else if (category === 'fantasy' || category === 'fiction' || category === 'adventure' || category === 'horror') {
      // Waifu anime style
      imagePrompt = `Generate an anime-style waifu character image of ${characterName}. ${description}. 
      The image should be in anime/manga style, upper body shot, vibrant colors, 
      suitable for a character avatar. Focus on the character's appearance and personality.`;
    } else {
      // Generic cartoon style (minimalist)
      imagePrompt = `Generate a minimalist cartoon-style avatar of ${characterName}. ${description}. 
      The image should be simple, clean, flat design, suitable for a profile picture. 
      Upper body shot, minimal details, modern cartoon style.`;
    }

    // Generate image using Gemini
    // Note: Gemini image generation uses the text-to-image capability
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Experimental model supports image generation
      contents: [{
        parts: [{ text: imagePrompt }]
      }],
      config: {
        responseMimeType: 'image/png', // Request image output
      },
    });

    // Extract image data
    const imageData = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('image')
    )?.inlineData?.data;

    if (!imageData) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: imageData, // Base64 encoded image
      mimeType: 'image/png',
    });
  } catch (error: any) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate avatar' },
      { status: 500 }
    );
  }
}

