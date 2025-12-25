import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGeminiClient } from '@/lib/geminiClient';
import { getAuthHeaders } from '@/lib/auth';

/**
 * Create a story from a conversation
 * Generates a readable story based on the chat interaction
 */
export async function POST(request: NextRequest) {
  try {
    const { conversationId, title } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Fetch conversation and messages
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        persona: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages in conversation' },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages = conversation.messages.map(m => ({
      role: m.role,
      text: m.text,
    }));

    const persona = conversation.persona;

    // Generate story using Gemini
    const ai = getGeminiClient();
    
    const storyPrompt = `You are a creative storyteller. Based on the following conversation between a user and ${persona.name} (${persona.tagline || persona.description || 'a character'}), create an engaging, readable story.

The story should:
- Be written in third person narrative style
- Capture the essence and personality of ${persona.name}
- Be engaging and well-written
- Flow naturally from the conversation
- Be appropriate for all audiences
- Be 500-1000 words long

Conversation:
${messages.map((m, i) => `${m.role === 'user' ? 'User' : persona.name}: ${m.text}`).join('\n\n')}

Create a compelling story based on this conversation:`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ text: storyPrompt }],
      config: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 2000,
      },
    });

    const storyText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate story';

    // Save story to database (create Story model if needed, or use a simple storage)
    // For now, return the story directly
    // TODO: Create Story model and save

    return NextResponse.json({
      success: true,
      story: {
        id: `story-${Date.now()}`,
        title: title || `A Story with ${persona.name}`,
        content: storyText,
        characterName: persona.name,
        characterId: persona.id,
        conversationId: conversationId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create story',
        details: error.message 
      },
      { status: 500 }
    );
  }
}



