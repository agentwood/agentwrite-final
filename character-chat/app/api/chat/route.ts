import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';
import { db } from '@/lib/db';
import { buildSystemInstruction } from '@/lib/prompts';
import { filterContent, shouldBlockResponse } from '@/lib/contentFilter';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, characterId, messages } = await request.json();

    if (!conversationId || !characterId || !messages) {
      return NextResponse.json(
        { error: 'conversationId, characterId, and messages are required' },
        { status: 400 }
      );
    }

    // Filter user's latest message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const filterResult = filterContent(lastMessage.text, true);
      if (!filterResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Content not allowed',
            reason: filterResult.reason,
            filtered: true
          },
          { status: 400 }
        );
      }
    }

    // Fetch persona
    const persona = await db.personaTemplate.findUnique({
      where: { id: characterId },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Increment chat count
    await db.personaTemplate.update({
      where: { id: characterId },
      data: { chatCount: { increment: 1 } },
    });

    // Check quota (simplified - you can add user-based quotas later)
    // For now, we'll skip quota checks

    // Use the system prompt directly (it's already built in the seed script)
    const systemInstruction = persona.systemPrompt || `You are ${persona.name}. Stay in character.`;

    // Convert messages to Gemini format
    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Call Gemini
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiContents,
      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        maxOutputTokens: 600,
        temperature: 0.9,
      },
    });

    let responseText = result.text || '';

    // Filter AI response
    const blockCheck = shouldBlockResponse(responseText);
    if (blockCheck.blocked) {
      responseText = blockCheck.alternative || "I'm sorry, I can't discuss that topic. Is there something else you'd like to talk about?";
    }

    // Save assistant message to database
    const assistantMessage = await db.message.create({
      data: {
        conversationId,
        role: 'assistant',
        text: responseText,
      },
    });

    return NextResponse.json({
      text: responseText,
      messageId: assistantMessage.id,
      usage: result.usageMetadata,
      filtered: blockCheck.blocked,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

