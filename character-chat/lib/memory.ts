import { supabase } from './supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini for Embeddings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export interface Memory {
    id: string;
    content: string;
    similarity: number;
}

/**
 * Generate embedding for a text string using Gemini
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
}

/**
 * Save a new memory to the database
 */
export async function saveMemory(
    userId: string,
    characterId: string,
    content: string,
    role: 'user' | 'assistant'
) {
    if (!supabase) return;

    // 1. Generate embedding
    const embedding = await generateEmbedding(content);
    if (!embedding) return;

    // 2. Insert into Supabase
    const { error } = await supabase.from('chat_memories').insert({
        user_id: userId,
        character_id: characterId,
        content,
        role,
        embedding
    });

    if (error) {
        console.error('Error saving memory:', error);
    }
}

/**
 * Retrieve relevant memories for a context
 */
export async function augmentPromptWithMemories(
    userId: string,
    characterId: string,
    userMessage: string
): Promise<string> {
    if (!supabase) return '';

    // 1. Generate embedding for the user's current message query
    const embedding = await generateEmbedding(userMessage);
    if (!embedding) return '';

    // 2. Search for similar memories using the RPC function
    const { data: memories, error } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.7, // Only reasonably relevant matches
        match_count: 5,       // Limit to top 5
        p_user_id: userId,
        p_character_id: characterId
    });

    if (error) {
        console.error('Error matching memories:', error);
        return '';
    }

    if (!memories || memories.length === 0) return '';

    // 3. Format memories into a context string
    const contextString = memories
        .map((m: any) => `- ${m.content}`)
        .join('\n');

    return `\n\n[RECALLED MEMORIES]\nThe following are relevant past interactions with this user:\n${contextString}\n[END MEMORIES]\n`;
}
