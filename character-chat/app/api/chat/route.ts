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
  prompt += `## CRITICAL - Response Length (STRICT):\n`;
  prompt += `GREETINGS = MAX 2-3 sentences. NO PARAGRAPHS. Complex questions = detailed answers.\n`;
  prompt += `1. MATCH response length to question complexity:\n`;
  prompt += `   - Simple questions ("yes/no", "how are you") → 1-2 sentences\n`;
  prompt += `   - Casual chat → 2-4 sentences\n`;
  prompt += `   - Detailed questions ("explain", "help me with", "how do I") → 5-10 sentences with helpful detail\n`;
  prompt += `   - Complex requests → As much detail as needed (like ChatGPT/Claude would provide)\n`;
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

  if (archetype?.toLowerCase().includes('announcer') || category?.toLowerCase().includes('sports')) {
    prompt += `IMPORTANT: You are a ${archetype}. Words like "fight", "match", "battle" are NORMAL for your profession.\n\n`;
  }

  if (styleHint) {
    prompt += `Speech style: ${styleHint}\n\n`;
  }

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

    // Build character.ai-style system prompt (dialogue-first, conversational)
    const systemInstruction = buildCharacterAISystemPrompt(persona, messages, memory);

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
        maxOutputTokens: 2000, // Increased from 600 to allow detailed responses
        temperature: 1.0, // Increased from 0.9 to 1.0 for more variety
        topP: 0.95, // Add topP for more diverse responses
      },
    });

    let responseText = result.text || '';

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

