import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSystemPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const characterData = await request.json();

    // Validate required fields
    if (!characterData.id || !characterData.name || !characterData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, description' },
        { status: 400 }
      );
    }

    // Check if character already exists
    const existing = await db.personaTemplate.findUnique({
      where: { id: characterData.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Character with this ID already exists' },
        { status: 409 }
      );
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      characterData.system.persona,
      characterData.system.boundaries,
      characterData.system.style,
      characterData.system.examples,
      characterData.name
    );

    // Create character
    const persona = await db.personaTemplate.create({
      data: {
        id: characterData.id,
        seedId: characterData.id,
        name: characterData.name,
        tagline: characterData.tagline,
        description: characterData.description,
        greeting: characterData.greeting,
        category: characterData.category,
        avatarUrl: characterData.avatarUrl,
        voiceName: characterData.voiceName,
        styleHint: characterData.voice?.styleHint || null,
        systemPrompt: systemPrompt,
        archetype: characterData.archetype,
        tonePack: characterData.tonePack || 'conversational',
        scenarioSkin: characterData.scenarioSkin || 'modern',
      },
    });

    return NextResponse.json({
      success: true,
      persona: {
        id: persona.id,
        name: persona.name,
      },
    });
  } catch (error: any) {
    console.error('Error creating persona:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create character' },
      { status: 500 }
    );
  }
}

