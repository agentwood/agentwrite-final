import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';
import { db } from '@/lib/db';
import {
  buildTreeESystemPrompt,
  buildSessionOpeningPrompt,
  buildSessionDiscoveryPrompt,
  buildSessionStructuringPrompt,
  EmotionalStateVector
} from '@/lib/tree-e-prompts';
import { evaluateResponse } from '@/lib/rag-testing';
import { getSession, initSession, updateSession, SessionPhase, SessionData } from '@/lib/session-engine';
import { filterContent, shouldBlockResponse } from '@/lib/contentFilter';
import {
  getCharacterMemory,
  updateCharacterMemory,
  extractPatterns,
  savePatterns,
} from '@/lib/ml/contextSystem';
import { getSubscriptionStatus, getPlanLimits } from '@/lib/subscription';

// [Tree-E Refactor] Old methods removed.


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
    console.log(`[Chat] Looking up persona by ID: ${characterId}`);
    console.log(`[Chat] DATABASE_URL:`, process.env.DATABASE_URL);

    // Debug: List first 5 personas to verify db connection
    const allPersonas = await db.personaTemplate.findMany({
      take: 5,
      select: { id: true, name: true },
    });
    console.log(`[Chat] First 5 personas in DB:`, allPersonas);

    const persona = await db.personaTemplate.findUnique({
      where: { id: characterId },
    });

    console.log(`[Chat] Persona lookup result:`, persona ? { id: persona.id, name: persona.name } : 'NOT FOUND');

    if (!persona) {
      console.error(`[Chat] Persona not found for ID: ${characterId}`);
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

    // Get user ID from request
    const userId = request.headers.get('x-user-id') || undefined;

    // Check quota - use proper UTC midnight for 24h reset
    const subscriptionStatus = await getSubscriptionStatus(userId);
    const limits = getPlanLimits(subscriptionStatus.planId);

    if (limits.messagesPerDay > 0) {
      // Get UTC midnight for today (proper 24h UTC-based window)
      const now = new Date();
      const utcMidnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0, 0
      ));

      const messageCount = await db.message.count({
        where: {
          conversation: {
            userId: userId || null,
          },
          role: 'user',
          createdAt: {
            gte: utcMidnight,
          },
        },
      });

      if (messageCount >= limits.messagesPerDay) {
        return NextResponse.json(
          {
            error: 'Daily message limit reached',
            reason: `You've reached your daily limit of ${limits.messagesPerDay} messages. Upgrade to unlock more messages.`,
            quotaExceeded: true,
            upgradeUrl: '/pricing',
            resetsAt: new Date(utcMidnight.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // Track character engagement (every chat interaction is logged)
    if (userId) {
      // Ensure user exists in DB to satisfy foreign key constraints
      const userExists = await db.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        console.log(`[Chat] Creating auto-registered user for ID: ${userId}`);
        try {
          // Use timestamp + random to ensure unique username
          const uniqueUsername = `user_${userId.substring(0, 6)}_${Date.now().toString(36)}`;
          await db.user.create({
            data: {
              id: userId,
              username: uniqueUsername,
              subscriptionTier: 'free',
            }
          });
        } catch (createError: any) {
          // Handle race condition - user may have been created by another request
          if (createError.code === 'P2002') {
            console.log(`[Chat] User already exists (race condition), continuing...`);
          } else {
            throw createError;
          }
        }
      }

      await db.userCharacterEngagement.upsert({
        where: {
          userId_personaId: { userId, personaId: characterId }
        },
        create: {
          userId,
          personaId: characterId,
          messagesSent: 1,
          lastChatAt: new Date(),
        },
        update: {
          messagesSent: { increment: 1 },
          lastChatAt: new Date(),
        },
      });
    }

    // Increment chat count
    await db.personaTemplate.update({
      where: { id: characterId },
      data: { chatCount: { increment: 1 } },
    });

    // Get character memory (Short-term) and learned patterns
    const memory = await getCharacterMemory(persona.id, userId);

    // Extract user messages once for use later (including Cognee memory save)
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1];

    // [COGNEE] Retrieve Long-Term Memories via Knowledge Graph (Graph RAG)
    // This replaces Vector RAG with deterministic graph-based retrieval
    let longTermMemoryContext = '';
    try {
      const { augmentPromptWithCogneeMemories } = await import('@/lib/cogneeClient');

      if (latestUserMessage && userId) {
        longTermMemoryContext = await augmentPromptWithCogneeMemories(userId, characterId, latestUserMessage.text);
      }
    } catch (e) {
      console.warn('[Chat] Cognee memory system unavailable or failed, continuing without long-term memory:', e);
    }

    // Extract patterns from conversation (Learning System)
    const patterns = await extractPatterns(persona.id, messages);
    await savePatterns(persona.id, patterns);

    // [TREE-E] Session Management
    let session: SessionData | null = null;
    if (userId) {
      session = await getSession(userId, persona.id, conversationId);
      if (!session) {
        session = await initSession(userId, persona.id, conversationId);
      }
    }

    // [TREE-E] Determine Session Phase Instructions
    let sessionPromptAdditions = '';
    if (session) {
      if (session.phase === SessionPhase.OPENING) {
        sessionPromptAdditions = buildSessionOpeningPrompt();
        // Transition logic: If user has sent > 1 message, move to discovery
        const userMsgCount = messages.filter((m: any) => m.role === 'user').length;
        if (userMsgCount >= 1) {
          session.phase = SessionPhase.DISCOVERY;
          await updateSession(userId!, persona.id, session);
        }
      } else if (session.phase === SessionPhase.DISCOVERY) {
        sessionPromptAdditions = `\n(Session Phase: DISCOVERY)\nGOAL: Unpack the user's situation. Ask purposeful questions to understand their needs.\n`;
        // Simple transition heuristic: If > 3 messages, offer structure
        const userMsgCount = messages.filter((m: any) => m.role === 'user').length;
        if (userMsgCount > 3) {
          session.phase = SessionPhase.STRUCTURING;
          await updateSession(userId!, persona.id, session);
        }
      } else if (session.phase === SessionPhase.STRUCTURING) {
        sessionPromptAdditions = buildSessionStructuringPrompt('10-minute');
        session.phase = SessionPhase.ACTIVE; // Move to active after proposing
        await updateSession(userId!, persona.id, session);
      } else if (session.phase === SessionPhase.ACTIVE) {
        sessionPromptAdditions = `\n(Session Phase: ACTIVE WORK)\nGOAL: Guide the user through the exercise or topic. Keep it moving forward.\n`;
      }
    }

    // [TREE-E] Build Master System Prompt
    // Parse emotional state from memory or default
    let emotionalState: EmotionalStateVector = { valence: 0.1, arousal: 0.5, dominance: 0.5, stability: 0.8 };
    try {
      if (memory.emotionalState) {
        emotionalState = typeof memory.emotionalState === 'string' ? JSON.parse(memory.emotionalState) : memory.emotionalState;
      }
    } catch (e) {
      console.warn('Failed to parse emotional state', e);
    }

    // Get constraints (parse JSON string if needed)
    let constraints: string[] = [];
    if (persona.trainingConstraints) {
      try {
        const parsed = typeof persona.trainingConstraints === 'string' ? JSON.parse(persona.trainingConstraints) : persona.trainingConstraints;
        if (Array.isArray(parsed)) constraints = parsed;
      } catch (e) { }
    }

    let systemInstruction = buildTreeESystemPrompt(
      (persona as any).voiceIdentity,
      emotionalState,
      persona,
      constraints,
      memory.confidenceScore || 0.5
    );

    if (sessionPromptAdditions) {
      systemInstruction += `\n\n=== SESSION CONTEXT ===\n${sessionPromptAdditions}`;
    }

    if (longTermMemoryContext) {
      systemInstruction += `\n\n=== LONG TERM MEMORY ===\n${longTermMemoryContext}`;
    }

    // [TREE-E] Conversation Loop & RAG Test
    const ai = getGeminiClient();

    // Convert messages to Gemini format
    const geminiContents = [
      {
        role: 'user',
        parts: [{
          text: `SYSTEM INSTRUCTION: You are ${persona.name}. Stay in character. Respond to the user.`
        }]
      },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }))
    ];

    let responseText = '';
    let attempts = 0;
    const MAX_ATTEMPTS = 2;
    let validResponse = false;
    let usageMetadata: any = undefined;

    while (!validResponse && attempts < MAX_ATTEMPTS) {
      attempts++;
      console.log(`[Chat] Generation Attempt ${attempts}/${MAX_ATTEMPTS}`);

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: geminiContents,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          maxOutputTokens: 1000,
          temperature: 0.9 + (attempts * 0.1),
        },
      });

      usageMetadata = result.usageMetadata || usageMetadata;

      // Extract text safely
      let currentText = '';
      try {
        const resAny = result as any;
        if (typeof resAny.text === 'string') {
          currentText = resAny.text;
        } else if (typeof resAny.text === 'function') {
          currentText = resAny.text();
        } else if (resAny.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          currentText = resAny.response.candidates[0].content.parts[0].text;
        } else if (resAny.candidates?.[0]?.content?.parts?.[0]?.text) {
          currentText = resAny.candidates[0].content.parts[0].text;
        }
      } catch (e) {
        console.error('Error extracting text from Gemini response', e);
      }

      if (!currentText) {
        console.warn('[Chat] Empty response from Gemini');
        continue; // Retry
      }

      // Clean up text
      currentText = currentText.trim()
        .replace(/^["'](.+)["']$/g, '$1') // remove wrapping quotes
        .replace(/\[([^\]]+)\]/g, '*$1*'); // format actions

      // [TREE-E] RAG Testing
      const evalResult = await evaluateResponse(currentText, persona.name, constraints);

      if (evalResult.valid) {
        validResponse = true;
        responseText = currentText;
      } else {
        console.warn(`[Chat] RAG Eval Failed: ${evalResult.reason}. Retrying...`);
      }
    }

    if (!responseText) {
      throw new Error('Failed to generate valid response after retries.');
    }

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

    // Ensure conversation exists before saving message
    await db.conversation.upsert({
      where: { id: conversationId },
      create: {
        id: conversationId,
        personaId: characterId,
        userId: userId,
      },
      update: {
        updatedAt: new Date(),
      },
    });

    // Save assistant message to database
    const assistantMessage = await db.message.create({
      data: {
        conversationId,
        role: 'assistant',
        text: responseText,
      },
    });

    // [COGNEE] Save interaction to Knowledge Graph (Async, don't block response)
    if (userId && latestUserMessage) {
      try {
        const { saveCogneeMemory } = await import('@/lib/cogneeClient');
        // Save User Message to Cognee Graph
        saveCogneeMemory(userId, characterId, latestUserMessage.text, 'user').catch(e => console.error('[Cognee] Failed to save user memory:', e));
        // Save Assistant Response to Cognee Graph
        saveCogneeMemory(userId, characterId, responseText, 'assistant').catch(e => console.error('[Cognee] Failed to save assistant memory:', e));
      } catch (e) {
        console.warn('[Chat] Cognee save failed (module load or execution):', e);
      }
    }

    return NextResponse.json({
      text: responseText,
      messageId: assistantMessage.id,
      usage: usageMetadata,
      filtered: blockCheck.blocked,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error in chat route:', error);

    // Check for specific Gemini API Key error
    if (error.message?.includes('API_KEY')) {
      console.error('CRITICAL: GEMINI_API_KEY is missing or invalid.');
    }

    // Log detailed error info if available
    if (error.response) {
      console.error('API Response Error:', JSON.stringify(error.response, null, 2));
    }

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error.message || 'Unknown error code',
        code: error.status || 500
      },
      { status: 500 }
    );
  }
}

