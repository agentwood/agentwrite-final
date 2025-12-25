import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';
import { db } from '@/lib/db';
import { buildSystemInstruction } from '@/lib/prompts';
import { filterContent, shouldBlockResponse } from '@/lib/contentFilter';
import {
  getCharacterMemory,
  updateCharacterMemory,
  extractPatterns,
  savePatterns,
  buildEnhancedSystemPrompt,
} from '@/lib/ml/contextSystem';
import { getSubscriptionStatus, getPlanLimits } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, characterId, messages } = await request.json();

    if (!conversationId || !characterId || !messages) {
      return NextResponse.json(
        { error: 'conversationId, characterId, and messages are required' },
        { status: 400 }
      );
    }

    // Fetch persona for context-aware filtering and other operations
    const persona = await db.personaTemplate.findUnique({
      where: { id: characterId },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Filter user's latest message - Enhanced context-aware filtering
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const characterMetadata = {
        category: persona.category,
        archetype: persona.archetype,
        name: persona.name,
      };
      const filterResult = filterContent(lastMessage.text, true, characterMetadata);
      if (!filterResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Content not allowed',
            reason: filterResult.reason || 'Your message contains inappropriate content. Please keep conversations appropriate and respectful.',
            filtered: true
          },
          { status: 400 }
        );
      }
    }
    
    // Also filter AI responses before sending
    // This will be checked after generation

    // Get user ID from request (for now, use a placeholder - implement auth later)
    const userId = request.headers.get('x-user-id') || undefined;

    // Check quota
    const subscriptionStatus = await getSubscriptionStatus(userId);
    const limits = getPlanLimits(subscriptionStatus.planId);
    
    if (limits.messagesPerDay > 0) {
      // Check daily message count for free users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const messageCount = await db.message.count({
        where: {
          conversation: {
            userId: userId || null,
          },
          role: 'user',
          createdAt: {
            gte: today,
          },
        },
      });

      if (messageCount >= limits.messagesPerDay) {
        return NextResponse.json(
          { 
            error: 'Daily message limit reached',
            reason: `You've reached your daily limit of ${limits.messagesPerDay} messages. Upgrade to unlock unlimited messages.`,
            quotaExceeded: true,
            upgradeUrl: '/pricing',
          },
          { status: 429 }
        );
      }
    }

    // Increment chat count
    await db.personaTemplate.update({
      where: { id: characterId },
      data: { chatCount: { increment: 1 } },
    });

    // Get character memory and learned patterns
    const memory = await getCharacterMemory(persona.id, userId);

    // Extract patterns from conversation
    const patterns = await extractPatterns(persona.id, messages);
    await savePatterns(persona.id, patterns);

    // Build enhanced system prompt with learned context
    const basePrompt = persona.systemPrompt || `You are ${persona.name}. Stay in character.`;
    const systemInstruction = await buildEnhancedSystemPrompt(
      persona.id,
      basePrompt,
      userId,
      memory
    );

    // Extract user information from messages for memory
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1];
    
    // Simple fact extraction (can be enhanced with NLP)
    if (latestUserMessage && userId) {
      const text = latestUserMessage.text.toLowerCase();
      
      // Extract name if mentioned
      const nameMatch = text.match(/my name is (\w+)|i'm (\w+)|call me (\w+)/i);
      if (nameMatch) {
        const name = nameMatch[1] || nameMatch[2] || nameMatch[3];
        await updateCharacterMemory(persona.id, userId, {
          facts: { userName: name },
        });
      }

      // Extract preferences
      if (text.includes('like') || text.includes('love') || text.includes('prefer')) {
        const preferences: Record<string, any> = {};
        // Simple preference extraction
        if (text.includes('short') || text.includes('brief')) {
          preferences.responseLength = 'short';
        }
        if (text.includes('detailed') || text.includes('long')) {
          preferences.responseLength = 'detailed';
        }
        
        if (Object.keys(preferences).length > 0) {
          await updateCharacterMemory(persona.id, userId, { preferences });
        }
      }
    }

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
        temperature: 1.0, // Increased from 0.9 to 1.0 for more variety
        topP: 0.95, // Add topP for more diverse responses
      },
    });

    let responseText = result.text || '';

    // Filter AI response (context-aware)
    const characterMetadata = {
      category: persona.category,
      archetype: persona.archetype,
      name: persona.name,
    };
    const blockCheck = shouldBlockResponse(responseText, characterMetadata);
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

