import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSystemPrompt } from '@/lib/prompts';
import { indexCharacterPage } from '@/lib/seo/google-indexing';

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
        voiceReady: true, // Fish Speech v1.5 ready
      },
    });

    // 🎯 Automatically trigger voice audit via n8n
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/voice-audit-trigger';
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: persona.id,
          characterName: persona.name,
          description: persona.description || persona.tagline || '',
          voiceName: persona.voiceName,
          category: persona.category,
          archetype: persona.archetype || 'general',
        }),
      });
      console.log(`✅ Voice audit triggered for: ${persona.name}`);
    } catch (auditError) {
      // Don't fail character creation if audit fails
      console.error('Voice audit trigger failed (non-critical):', auditError);
    }

    // 🚀 Automatically trigger Google Indexing
    try {
      await indexCharacterPage(persona.id);
      console.log(`✅ Google Indexing triggered for: ${persona.id}`);
    } catch (indexError) {
      console.error('Google Indexing trigger failed (non-critical):', indexError);
    }

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

