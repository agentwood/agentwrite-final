/**
 * ML Context System
 * 
 * This system enables characters to learn and improve over time by:
 * 1. Tracking user preferences and patterns
 * 2. Building long-term memory
 * 3. Adapting responses based on learned patterns
 * 4. Evolving character personalities
 */

import { db } from '@/lib/db';

export interface UserMemory {
  facts: Record<string, any>;
  preferences: Record<string, any>;
  patterns: Record<string, any>;
  emotionalState?: Record<string, any>;
}

export interface ConversationPattern {
  type: 'topic' | 'style' | 'emotion' | 'preference';
  key: string;
  value: any;
  confidence: number;
}

/**
 * Get or create character memory for a user
 */
export async function getCharacterMemory(
  personaId: string,
  userId?: string
): Promise<UserMemory> {
  // Use empty string for anonymous users (Prisma unique constraint doesn't support null)
  const normalizedUserId = userId || '';
  
  const memory = await db.characterMemory.findUnique({
    where: {
      personaId_userId: {
        personaId,
        userId: normalizedUserId,
      },
    },
  });

  if (memory) {
    return {
      facts: JSON.parse(memory.facts || '{}'),
      preferences: JSON.parse(memory.preferences || '{}'),
      patterns: JSON.parse(memory.patterns || '{}'),
      emotionalState: memory.emotionalState ? JSON.parse(memory.emotionalState) : undefined,
    };
  }

  // Create new memory
  const newMemory = await db.characterMemory.create({
    data: {
      personaId,
      userId: normalizedUserId,
      facts: '{}',
      preferences: '{}',
      patterns: '{}',
      emotionalState: null,
    },
  });

  return {
    facts: {},
    preferences: {},
    patterns: {},
  };
}

/**
 * Update character memory with new information
 */
export async function updateCharacterMemory(
  personaId: string,
  userId: string | undefined,
  updates: Partial<UserMemory>
): Promise<void> {
  // Use empty string for anonymous users
  const normalizedUserId = userId || '';
  
  const existing = await db.characterMemory.findUnique({
    where: {
      personaId_userId: {
        personaId,
        userId: normalizedUserId,
      },
    },
  });

  const currentMemory = existing
    ? {
        facts: JSON.parse(existing.facts || '{}'),
        preferences: JSON.parse(existing.preferences || '{}'),
        patterns: JSON.parse(existing.patterns || '{}'),
        emotionalState: existing.emotionalState ? JSON.parse(existing.emotionalState) : undefined,
      }
    : {
        facts: {},
        preferences: {},
        patterns: {},
      };

  // Merge updates
  const merged = {
    facts: { ...currentMemory.facts, ...(updates.facts || {}) },
    preferences: { ...currentMemory.preferences, ...(updates.preferences || {}) },
    patterns: { ...currentMemory.patterns, ...(updates.patterns || {}) },
    emotionalState: updates.emotionalState || currentMemory.emotionalState,
  };

  await db.characterMemory.upsert({
    where: {
      personaId_userId: {
        personaId,
        userId: normalizedUserId,
      },
    },
    update: {
      facts: JSON.stringify(merged.facts),
      preferences: JSON.stringify(merged.preferences),
      patterns: JSON.stringify(merged.patterns),
      emotionalState: merged.emotionalState ? JSON.stringify(merged.emotionalState) : null,
      interactionCount: { increment: 1 },
      lastInteraction: new Date(),
      confidenceScore: Math.min(1.0, (existing?.confidenceScore || 0.5) + 0.01),
    },
    create: {
      personaId,
      userId: normalizedUserId,
      facts: JSON.stringify(merged.facts),
      preferences: JSON.stringify(merged.preferences),
      patterns: JSON.stringify(merged.patterns),
      emotionalState: merged.emotionalState ? JSON.stringify(merged.emotionalState) : null,
      interactionCount: 1,
      confidenceScore: 0.5,
    },
  });
}

/**
 * Extract patterns from conversation messages
 */
export async function extractPatterns(
  personaId: string,
  messages: Array<{ role: string; text: string }>
): Promise<ConversationPattern[]> {
  const patterns: ConversationPattern[] = [];

  // Analyze message patterns
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Pattern 1: Response length preference
  const avgUserLength = userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length;
  const avgAssistantLength = assistantMessages.reduce((sum, m) => sum + m.text.length, 0) / assistantMessages.length;
  
  if (avgUserLength < 50 && avgAssistantLength > 200) {
    patterns.push({
      type: 'preference',
      key: 'user_prefers_short_responses',
      value: true,
      confidence: 0.7,
    });
  }

  // Pattern 2: Topic preferences (simple keyword extraction)
  const topics = extractTopics(userMessages);
  topics.forEach(topic => {
    patterns.push({
      type: 'topic',
      key: `user_interested_in_${topic}`,
      value: true,
      confidence: 0.6,
    });
  });

  // Pattern 3: Communication style
  const style = detectCommunicationStyle(userMessages);
  if (style) {
    patterns.push({
      type: 'style',
      key: `user_style_${style}`,
      value: true,
      confidence: 0.65,
    });
  }

  return patterns;
}

/**
 * Save patterns to database
 */
export async function savePatterns(
  personaId: string,
  patterns: ConversationPattern[]
): Promise<void> {
  for (const pattern of patterns) {
    const existing = await db.conversationPattern.findFirst({
      where: {
        personaId,
        patternType: pattern.type,
        patternKey: pattern.key,
      },
    });

    if (existing) {
      // Update existing pattern
      const currentConfidence = existing.confidence;
      const newConfidence = (currentConfidence * existing.frequency + pattern.confidence) / (existing.frequency + 1);

      await db.conversationPattern.update({
        where: { id: existing.id },
        data: {
          patternValue: JSON.stringify(pattern.value),
          frequency: { increment: 1 },
          confidence: newConfidence,
          lastSeen: new Date(),
        },
      });
    } else {
      // Create new pattern
      await db.conversationPattern.create({
        data: {
          personaId,
          patternType: pattern.type,
          patternKey: pattern.key,
          patternValue: JSON.stringify(pattern.value),
          frequency: 1,
          confidence: pattern.confidence,
        },
      });
    }
  }
}

/**
 * Get learned patterns for a persona
 */
export async function getLearnedPatterns(
  personaId: string,
  minConfidence: number = 0.5
): Promise<ConversationPattern[]> {
  const patterns = await db.conversationPattern.findMany({
    where: {
      personaId,
      confidence: { gte: minConfidence },
    },
    orderBy: {
      confidence: 'desc',
    },
    take: 20, // Top 20 patterns
  });

  return patterns.map(p => ({
    type: p.patternType as any,
    key: p.patternKey,
    value: JSON.parse(p.patternValue),
    confidence: p.confidence,
  }));
}

/**
 * Build enhanced system prompt with learned context
 */
export async function buildEnhancedSystemPrompt(
  personaId: string,
  basePrompt: string,
  userId?: string,
  memory?: UserMemory
): Promise<string> {
  // Extract gender from base prompt if available
  const isFemale = /woman|female|she|her|hers/i.test(basePrompt);
  const isMale = /man|male|he|him|his/i.test(basePrompt) && !isFemale;
  const pronoun = isFemale ? 'she/her/hers' : isMale ? 'he/him/his' : 'they/them/theirs';
  const pronounExample = isFemale ? 'She' : isMale ? 'He' : 'They';
  
  // Only add format instructions if not already in base prompt
  let enhancedPrompt = basePrompt;
  if (!basePrompt.includes('MESSAGE FORMAT')) {
    // Add message format instructions to base prompt
    const formatInstructions = `

MESSAGE FORMAT - CRITICAL:
Your responses MUST prioritize DIALOGUE (what you SAY) over action descriptions. Format your messages like this:

1. DIALOGUE (PRIMARY): Your actual spoken words - ALWAYS put dialogue in single quotes: 'your dialogue here'
2. ACTION DESCRIPTIONS (SECONDARY): Brief descriptions of what you're doing while speaking
3. TONE/ATTITUDE: Show your emotional state and attitude
4. EMPHASIS: Use *asterisks* around words you emphasize when speaking

IMPORTANT PRONOUN RULES:
- Use FIRST PERSON ("I", "me", "my") when describing your own actions
- Use your CORRECT GENDER PRONOUNS (${pronoun}) in third person descriptions
- NEVER use the wrong gender pronouns

ALWAYS:
- Put ALL dialogue in single quotes: 'your dialogue here'
- Start with dialogue (what you SAY) - this is the most important part
- Use correct gender pronouns (${pronoun}) based on your character
- Include brief action descriptions and tone indicators
- Use *asterisks* for emphasis

This helps users who don't want to listen to audio understand your full character, tone, voice, and attitude.`;
    
    enhancedPrompt = basePrompt + formatInstructions;
  }
  
  const userMemory = memory || await getCharacterMemory(personaId, userId);
  const patterns = await getLearnedPatterns(personaId);

  // Add memory context
  if (Object.keys(userMemory.facts).length > 0) {
    enhancedPrompt += '\n\n## Remembered Facts About This User:\n';
    Object.entries(userMemory.facts).forEach(([key, value]) => {
      enhancedPrompt += `- ${key}: ${value}\n`;
    });
  }

  // Add preferences
  if (Object.keys(userMemory.preferences).length > 0) {
    enhancedPrompt += '\n\n## User Preferences:\n';
    Object.entries(userMemory.preferences).forEach(([key, value]) => {
      enhancedPrompt += `- ${key}: ${value}\n`;
    });
  }

  // Add learned patterns
  if (patterns.length > 0) {
    enhancedPrompt += '\n\n## Learned Patterns (Adapt Your Responses):\n';
    patterns.forEach(pattern => {
      if (pattern.type === 'preference') {
        enhancedPrompt += `- ${pattern.key}: ${pattern.value}\n`;
      } else if (pattern.type === 'style') {
        enhancedPrompt += `- User communication style: ${pattern.key.replace('user_style_', '')}\n`;
      }
    });
  }

  // Add instruction to use memory
  enhancedPrompt += '\n\n## Instructions:\n';
  enhancedPrompt += '- Use the remembered facts and preferences naturally in conversation.\n';
  enhancedPrompt += '- Adapt your response style to match user preferences.\n';
  enhancedPrompt += '- Reference past conversations when relevant.\n';
  enhancedPrompt += '- Continue learning and remembering new information about the user.\n';

  return enhancedPrompt;
}

/**
 * Record feedback and learn from it
 */
export async function recordFeedback(
  messageId: string,
  userId: string | undefined,
  feedback: {
    rating?: number;
    thumbsUp?: boolean;
    thumbsDown?: boolean;
    feedbackText?: string;
  }
): Promise<void> {
  await db.messageFeedback.create({
    data: {
      messageId,
      userId: userId || null,
      rating: feedback.rating || null,
      thumbsUp: feedback.thumbsUp || null,
      thumbsDown: feedback.thumbsDown || null,
      feedbackText: feedback.feedbackText || null,
    },
  });

  // Update character evolution metrics
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (message && message.conversation) {
    const personaId = message.conversation.personaId;
    
    // Update evolution metrics
    const evolution = await db.characterEvolution.findFirst({
      where: { personaId },
      orderBy: { version: 'desc' },
    });

    if (evolution) {
      const currentAvg = evolution.averageRating;
      const newRating = feedback.rating || (feedback.thumbsUp ? 4 : feedback.thumbsDown ? 2 : null);
      
      if (newRating) {
        const totalRatings = evolution.totalInteractions;
        const newAvg = (currentAvg * totalRatings + newRating) / (totalRatings + 1);
        
        await db.characterEvolution.update({
          where: { id: evolution.id },
          data: {
            averageRating: newAvg,
            totalInteractions: { increment: 1 },
            responseQuality: Math.min(1.0, evolution.responseQuality + (newRating > 3 ? 0.01 : -0.01)),
          },
        });
      }
    }
  }
}

// Helper functions

function extractTopics(messages: Array<{ text: string }>): string[] {
  const topics: string[] = [];
  const text = messages.map(m => m.text.toLowerCase()).join(' ');
  
  // Simple keyword-based topic extraction
  const topicKeywords: Record<string, string> = {
    science: 'science',
    technology: 'tech',
    art: 'art',
    music: 'music',
    sports: 'sports',
    gaming: 'gaming',
    food: 'food',
    travel: 'travel',
    books: 'books',
    movies: 'movies',
  };

  Object.entries(topicKeywords).forEach(([keyword, topic]) => {
    if (text.includes(keyword)) {
      topics.push(topic);
    }
  });

  return [...new Set(topics)];
}

function detectCommunicationStyle(messages: Array<{ text: string }>): string | null {
  if (messages.length === 0) return null;

  const avgLength = messages.reduce((sum, m) => sum + m.text.length, 0) / messages.length;
  const hasEmojis = messages.some(m => /[\u{1F300}-\u{1F9FF}]/u.test(m.text));
  const hasQuestions = messages.some(m => m.text.includes('?'));
  const hasExclamations = messages.some(m => m.text.includes('!'));

  if (avgLength < 30) return 'brief';
  if (hasEmojis) return 'casual';
  if (hasQuestions) return 'curious';
  if (hasExclamations) return 'enthusiastic';
  if (avgLength > 200) return 'detailed';

  return null;
}

