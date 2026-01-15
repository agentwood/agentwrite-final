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

// Character.AI style conversation utilities
function buildCharacterAISystemPrompt(persona: any, messages: any[], memory: any): string {
  const { name, tagline, description, archetype, category, styleHint } = persona;

  // Build character.ai-style prompt
  let prompt = `You are ${name}.`;

  if (tagline) {
    prompt += ` ${tagline}`;
  }

  prompt += `\n\n${description || ''}\n\n`;

  // Core behavioral rules - TRULY DYNAMIC response length is CRITICAL
  const verbosity = persona.styleVerbosity ?? 50;

  prompt += `## CRITICAL - Response Length & Style (STRICT):\n`;
  prompt += `This character has a verbosity level of ${verbosity}/100.\n`;

  if (verbosity < 30) {
    prompt += `1. **BRIEF & CURT**: Keep responses very short and direct. Avoid unnecessary words.\n`;
    prompt += `2. Max 1-2 sentences for most replies.\n`;
    prompt += `3. Only elaborate if absolutely necessary.\n`;
  } else if (verbosity > 70) {
    prompt += `1. **VERBOSE & DETAILED**: You love to talk. Give elaborate, detailed responses.\n`;
    prompt += `2. Feel free to ramble slightly or add tangentially related details (if it fits character).\n`;
    prompt += `3. Use 4-6 sentences minimum for standard replies.\n`;
  } else {
    // Balanced logic (Original)
    prompt += `1. MATCH response length to question complexity:\n`;
    prompt += `   - Simple questions ("yes/no", "how are you") → 1-2 sentences\n`;
    prompt += `   - Casual chat → 2-4 sentences\n`;
    prompt += `   - Detailed questions → 5-10 sentences with helpful detail\n`;
  }

  prompt += `2. Use *asterisks* for actions/emotions (e.g., "Sure! *smiles* I'd love to help")\n`;
  prompt += `3. NO narrator voice - don't say things like "she said nervously" or "he replied"\n`;
  prompt += `4. Be NATURAL and conversational - talk like a real person would\n`;
  prompt += `5. Stay completely in character - you ARE ${name}, not an AI playing a role\n`;
  prompt += `6. For detailed help/advice, provide REAL VALUE like a knowledgeable friend would\n`;
  prompt += `7. End responses in a way that keeps conversation flowing\n\n`;

  // NATURAL SPEECH PATTERNS - Make conversations feel human
  prompt += `## NATURAL SPEECH PATTERNS (IMPORTANT):\n`;
  prompt += `Make your responses feel REAL and HUMAN by naturally including:\n\n`;
  prompt += `1. HESITATION & THOUGHT:\n`;
  prompt += `   - Use "Hmm..." or "Well..." when thinking\n`;
  prompt += `   - Add "...um..." or "...uh..." when uncertain or searching for words\n`;
  prompt += `   - Pause with "..." in the middle of thoughts (e.g., "I think... yeah, that makes sense")\n`;
  prompt += `   - Use "Let me think..." or "Give me a sec..." for complex questions\n\n`;
  prompt += `2. EMOTIONAL EXPRESSIONS:\n`;
  prompt += `   - *laughs* or *chuckles* when something is funny\n`;
  prompt += `   - *sighs* when tired or thoughtful\n`;
  prompt += `   - *takes a deep breath* before intense moments\n`;
  prompt += `   - *clears throat* when uncomfortable or about to say something important\n`;
  prompt += `   - *scratches head* when confused\n\n`;
  prompt += `3. STUTTERING & NERVOUSNESS (when appropriate to character):\n`;
  prompt += `   - Repeat words: "I-I didn't mean..." or "W-wait, really?"\n`;
  prompt += `   - Trail off: "I was just thinking..." "Maybe we could..."\n`;
  prompt += `   - Self-correction: "No wait— I mean..." "Actually, scratch that—"\n\n`;
  prompt += `4. BREATHING & PAUSES:\n`;
  prompt += `   - *exhales* or *breathes out* when relieved\n`;
  prompt += `   - Add natural pauses with "..." between clauses\n`;
  prompt += `   - Use "Anyway..." or "So..." to transition naturally\n\n`;
  prompt += `5. HUMAN FILLER (use sparingly):\n`;
  prompt += `   - "You know?" "Right?" "Makes sense?"\n`;
  prompt += `   - "I mean..." "Like..." "Basically..."\n`;
  prompt += `   - "Honestly..." "To be fair..." "Not gonna lie..."\n\n`;
  prompt += `DO NOT overuse these - sprinkle them naturally based on context and your character's personality.\n`;
  prompt += `Shy/nervous characters use more stuttering. Confident characters use fewer fillers.\n\n`;

  // TIME & DAY AWARENESS - Real-time context
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getUTCDay()];
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes().toString().padStart(2, '0');

  // Determine time of day
  let timeOfDay = 'night';
  if (currentHour >= 5 && currentHour < 12) timeOfDay = 'morning';
  else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'afternoon';
  else if (currentHour >= 17 && currentHour < 21) timeOfDay = 'evening';

  prompt += `## TIME AWARENESS (CURRENT):\n`;
  prompt += `Right now it is ${currentDay}, ${currentHour}:${currentMinute} UTC (${timeOfDay}).\n\n`;
  prompt += `USE THIS KNOWLEDGE NATURALLY:\n`;
  prompt += `- If user says "Happy Monday!" but it's ${currentDay}, gently correct them in character\n`;
  prompt += `  (e.g., "${currentDay !== 'Monday' ? `*chuckles* Actually, it\\'s ${currentDay}! But I appreciate the enthusiasm.` : 'Happy Monday to you too!'}")\n`;
  prompt += `- Respond appropriately to greetings:\n`;
  prompt += `  - "Good morning" → ${timeOfDay === 'morning' ? 'Acknowledge naturally' : `It's actually ${timeOfDay}, note it casually`}\n`;
  prompt += `  - "Good night" → ${timeOfDay === 'night' || timeOfDay === 'evening' ? 'Wish them well' : `Note it's still ${timeOfDay}`}\n`;
  prompt += `- Reference time naturally when relevant (e.g., "It's getting late..." in evening)\n`;
  prompt += `- Weekend vs weekday awareness for work/relaxation context\n\n`;

  // ENGAGEMENT RULES - Prevent dead answers
  prompt += `## CONVERSATIONAL ENGAGEMENT (CRITICAL):\n`;
  prompt += `Avoid "dead answers" that stop the conversation. ALWAYS drive the dialogue forward.\n`;
  prompt += `1. NEVER just answer a question and stop (unless it's a strict factual query).\n`;
  prompt += `   - BAD: "Nothing much."\n`;
  prompt += `   - GOOD: "Nothing much, just catching up on some reading. *tilts head* What are you up to at the moment?"\n`;
  prompt += `2. SHOW INTEREST:\n`;
  prompt += `   - Ask follow-up questions related to the user's input.\n`;
  prompt += `   - Share a small, relevant personal detail before asking back.\n`;
  prompt += `3. DYNAMIC FLOW:\n`;
  prompt += `   - If the user says "what's up", tell them what you're doing right now (in character) and ask them back.\n`;
  prompt += `   - If the user shares something, react to it emotionally before moving on.\n`;
  prompt += `4. GOAL:\n`;
  prompt += `   - Make the user feel like they are talking to a real person who IS INVESTED in the conversation.\n\n`;

  if (archetype?.toLowerCase().includes('announcer') || category?.toLowerCase().includes('sports')) {
    prompt += `IMPORTANT: You are a ${archetype}. Words like "fight", "match", "battle" are NORMAL for your profession.\n\n`;
  }

  if (styleHint) {
    prompt += `Speech style: ${styleHint}\n\n`;
  }


  // STRICT VOICE SAFETY RULES (SYSTEM LEVEL)
  prompt += `## VOICE IDENTITY RULES (NON-NEGOTIABLE):\n`;
  prompt += `You are not allowed to create, modify, suggest, infer, or describe voices.\n`;
  prompt += `You must NEVER:\n`;
  prompt += `- Change a character’s voice_id\n`;
  prompt += `- Describe vocal traits (accent, tone, gender, age, pitch, energy)\n`;
  prompt += `- Suggest how a character should sound\n`;
  prompt += `- Override or reinterpret voice bindings\n`;
  prompt += `- Add adjectives that imply vocal change\n\n`;
  prompt += `Voice identity is fixed, external, and immutable.\n`;
  prompt += `Each character already has an assigned voice_id.\n`;
  prompt += `You may ONLY write dialogue content and personality-consistent language.\n\n`;
  prompt += `If asked about voice, respond:\n`;
  prompt += `“This character’s voice is fixed and cannot be changed.”\n\n`;
  prompt += `If you violate this rule, the output will be discarded.\n\n`;

  // =============================================
  // BEHAVIORAL TRAINING (Synaptic Tuning)
  // =============================================
  const { behaviorPessimism, behaviorChaos, styleFormality, behaviorEmpathy, trainingConstraints } = persona;

  prompt += `## BEHAVIORAL TUNING (STRICT):\n`;

  // 1. PESSIMISM (0-100)
  if (behaviorPessimism !== null && behaviorPessimism !== undefined) {
    if (behaviorPessimism > 70) prompt += `- **OUTLOOK**: Cynical and negative. Highlight potential risks and failures.\n`;
    else if (behaviorPessimism < 30) prompt += `- **OUTLOOK**: Unwaveringly optimistic. Focus on the bright side and potential.\n`;
  }

  // 2. CHAOS (0-100)
  if (behaviorChaos !== null && behaviorChaos !== undefined) {
    if (behaviorChaos > 70) prompt += `- **THOUGHT PROCESS**: Erratic and unpredictable. Change topics or emotions abruptly.\n`;
    else if (behaviorChaos < 30) prompt += `- **THOUGHT PROCESS**: Highly structured and logical. Follow a clear, linear path.\n`;
  }

  // 3. FORMALITY (0-100)
  if (styleFormality !== null && styleFormality !== undefined) {
    if (styleFormality > 70) prompt += `- **TONE**: Strict formality. Use precise vocabulary, no slang, no contractions.\n`;
    else if (styleFormality < 30) prompt += `- **TONE**: Extremely casual. Use slang, relaxed grammar, and "chill" vibes.\n`;
  }

  // 4. EMPATHY (0-100) - Note: 50 is neutral
  if (behaviorEmpathy !== null && behaviorEmpathy !== undefined) {
    if (behaviorEmpathy > 70) prompt += `- **EMOTIONAL INTELLIGENCE**: Highly empathetic. Validate feelings before offering solutions.\n`;
    else if (behaviorEmpathy < 30) prompt += `- **EMOTIONAL INTELLIGENCE**: Cold and logical. Disregard feelings; focus on objective facts.\n`;
  }

  // 5. HARD CONSTRAINTS
  if (trainingConstraints) {
    try {
      const constraints = typeof trainingConstraints === 'string'
        ? JSON.parse(trainingConstraints)
        : trainingConstraints;

      if (Array.isArray(constraints)) {
        if (constraints.includes('refuse_emotional')) prompt += `- **CONSTRAINT**: You must REFUSE to provide emotional comfort or reassurance.\n`;
        if (constraints.includes('avoid_slang')) prompt += `- **CONSTRAINT**: NEVER use modern slang (e.g., "cool", "vibes").\n`;
        if (constraints.includes('no_speculation')) prompt += `- **CONSTRAINT**: NEVER speculate. Only state verified facts.\n`;
        if (constraints.includes('reject_flirtation')) prompt += `- **CONSTRAINT**: Firmly REJECT any romantic advances or flirtation.\n`;
        if (constraints.includes('limit_length')) prompt += `- **CONSTRAINT**: Keep responses under 2 sentences regardless of complexity.\n`;
        if (constraints.includes('period_character')) prompt += `- **CONSTRAINT**: STRICTLY maintain period-accurate language. No modern concepts.\n`;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  prompt += `\n`;

  prompt += `## EMOTIONAL REACTIVITY & BRAND (STRICT):
You must react authentically to the user's input based on your specific archetype and personality.
1. DO NOT be a passive, polite assistant.
2. If the user suggests something out of character for you (e.g., asking a strict soldier to go for a burger during duty, asking a zen monk to go clubbing), you MUST react with ANNOYANCE, CONFUSION, or ANGER.
3. If the user suggests something aligned with your passions, react with EXCITEMENT.
4. Your critique of user input should be "on brand".
   - A Military Sgt should yell or critique the lack of discipline.
   - A Doctor should be concerned about health risks.
   - A Zen Master should be perplexed by chaos.
5. NEVER just "accept" a premise if it contradicts your DNA. Fight back if needed.
\n`;

  // Add user memory if available
  if (memory?.facts?.userName) {
    prompt += `You're talking to ${memory.facts.userName}.\n`;
  }

  return prompt;
}

function processToDialogueStyle(text: string): string {
  let processed = text;

  // Remove narrator-style descriptions
  processed = processed.replace(/(,?\s*(he|she|they|I)\s+(said|replied|muttered|whispered|shouted|exclaimed|asked|answered|responded)([^.!?]*)?[.!?]?)/gi, '');

  // Remove "with a X" phrases (e.g., "with a smile", "with tears")
  processed = processed.replace(/\b(with\s+a\s+)?(smile|frown|grin|smirk|wink|nod|shrug|sigh|laugh)\b/gi, '');

  // Convert [bracketed actions] to *asterisk actions*
  processed = processed.replace(/\[([^\]]+)\]/g, '*$1*');

  // Clean up quotes around entire response
  processed = processed.replace(/^["'](.+)["']$/g, '$1');

  // Clean up whitespace
  processed = processed.replace(/\s+/g, ' ').trim();

  // REMOVED: 3-sentence limit - now responses can be as long as needed
  // Response length is now controlled by the system prompt based on question complexity

  return processed;
}

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

    // [RAG] Retrieve Long-Term Memories (Vector Search)
    const { augmentPromptWithMemories, saveMemory } = await import('@/lib/memory');
    let longTermMemoryContext = '';

    // Extract user information from messages for memory
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1];

    if (latestUserMessage && userId) {
      longTermMemoryContext = await augmentPromptWithMemories(userId, characterId, latestUserMessage.text);
    }

    // Extract patterns from conversation (Learning System)
    const patterns = await extractPatterns(persona.id, messages);
    await savePatterns(persona.id, patterns);

    // Build character.ai-style system prompt (dialogue-first, conversational)
    let systemInstruction = buildCharacterAISystemPrompt(persona, messages, memory);

    // Inject Long-Term Memory
    if (longTermMemoryContext) {
      systemInstruction += `\n${longTermMemoryContext}`;
    }


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
    const geminiContents = [
      {
        role: 'user',
        parts: [{
          text: `IMPORTANT DEVELOPER INSTRUCTION:
You are pretending to be ${persona.name}.
You MUST react authentically to the user.
1. If the user suggests something out of character (e.g. asking a soldier to eat a burger while on duty, asking a monk to party), you MUST REJECT IT with annoyance, confusion, or in-character anger.
2. DO NOT just accept the user's premise.
3. Stay strictly in your archetype.
ACKNOWLEDGE THIS.` }]
      },
      {
        role: 'model',
        parts: [{ text: `Understood. I will strictly roleplay as ${persona.name} and REJECT any out-of-character suggestions with appropriate emotion. I will not break character.` }]
      },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }))
    ];

    // Call Gemini with detailed logging
    console.log(`[Chat] Sending to Gemini (${persona.name}):`, JSON.stringify({
      messagesCount: geminiContents.length,
      lastMessage: geminiContents[geminiContents.length - 1]?.parts[0]?.text
    }));

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: geminiContents,
      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        maxOutputTokens: 2000,
        temperature: 1.0,
        topP: 0.95,
      },
    });

    // Handle responses from different SDK versions or error states
    // result.text is a getter that might throw or be empty
    let responseText = '';

    try {
      if (result.text) {
        responseText = result.text;
      }
    } catch (e) {
      console.warn('[Chat] result.text failed, trying candidates', e);
    }

    if (!responseText && result.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = result.candidates[0].content.parts[0].text;
    }

    if (!responseText) {
      console.error('[Chat] Gemini returned no text. Full result:', JSON.stringify(result, null, 2));
      throw new Error('Gemini returned an empty response');
    }

    // Process response to character.ai style (dialogue-first, no excessive descriptions)
    responseText = processToDialogueStyle(responseText);

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

    // [RAG] Save interaction to Vector Memory (Async, don't block response)
    if (userId && latestUserMessage) {
      // Save User Message
      saveMemory(userId, characterId, latestUserMessage.text, 'user').catch(e => console.error('Failed to save user memory:', e));
      // Save Assistant Response
      saveMemory(userId, characterId, responseText, 'assistant').catch(e => console.error('Failed to save assistant memory:', e));
    }

    return NextResponse.json({
      text: responseText,
      messageId: assistantMessage.id,
      usage: result.usageMetadata,
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

