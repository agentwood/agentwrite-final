/**
 * Cognee Memory Client
 * 
 * TypeScript client for the Cognee Memory Service (Graph RAG).
 * This replaces the previous Vector RAG implementation with a Knowledge Graph
 * approach for more deterministic and relationship-aware memory retrieval.
 * 
 * Architecture:
 * Next.js App → HTTP → Cognee Service (Python/FastAPI) → Knowledge Graph
 */

// Configuration
const COGNEE_SERVICE_URL = process.env.COGNEE_SERVICE_URL || 'http://localhost:8001';

export interface CogneeMemoryResult {
    content: string;
    score: number;
    metadata?: Record<string, any>;
}

export interface CogneeSearchResponse {
    results: CogneeMemoryResult[];
    context_prompt: string;
}

/**
 * Check if Cognee service is available
 */
export async function isCogneeAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${COGNEE_SERVICE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Save a memory to Cognee's knowledge graph.
 * 
 * This extracts entities and relationships from the content
 * and stores them in a graph database for deterministic retrieval.
 */
export async function saveCogneeMemory(
    userId: string,
    characterId: string,
    content: string,
    role: 'user' | 'assistant'
): Promise<void> {
    try {
        const response = await fetch(`${COGNEE_SERVICE_URL}/memory/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                character_id: characterId,
                content,
                role,
            }),
        });

        if (!response.ok) {
            throw new Error(`Cognee save failed: ${response.status}`);
        }
    } catch (error) {
        // Log but don't throw - memory saving should not block chat
        console.error('[Cognee] Failed to save memory:', error);
    }
}

/**
 * Search Cognee's knowledge graph for relevant memories.
 * 
 * Unlike vector search which finds "similar" text, Cognee's graph search
 * finds information that is *connected* to the query through explicit
 * relationships (e.g., "User mentioned their brother" → "Brother's name is X").
 * 
 * Returns a pre-formatted context string ready for LLM prompt injection.
 */
export async function searchCogneeMemory(
    userId: string,
    characterId: string,
    query: string,
    limit: number = 5
): Promise<string> {
    try {
        const response = await fetch(`${COGNEE_SERVICE_URL}/memory/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                character_id: characterId,
                query,
                limit,
            }),
        });

        if (!response.ok) {
            throw new Error(`Cognee search failed: ${response.status}`);
        }

        const data: CogneeSearchResponse = await response.json();
        return data.context_prompt;
    } catch (error) {
        console.error('[Cognee] Failed to search memory:', error);
        return ''; // Return empty context on error
    }
}

/**
 * Augment a prompt with Cognee memory context.
 * 
 * This is the main entry point for chat routes - it searches for relevant
 * memories and returns a formatted context block to inject into the system prompt.
 */
export async function augmentPromptWithCogneeMemories(
    userId: string,
    characterId: string,
    userMessage: string
): Promise<string> {
    // Check if Cognee is available first
    const available = await isCogneeAvailable();
    if (!available) {
        console.warn('[Cognee] Service not available, skipping memory augmentation');
        return '';
    }

    return searchCogneeMemory(userId, characterId, userMessage);
}

/**
 * Clear all memories for a user-character pair.
 * Use with caution - this is irreversible.
 */
export async function pruneCogneeMemory(
    userId: string,
    characterId: string
): Promise<void> {
    try {
        const response = await fetch(
            `${COGNEE_SERVICE_URL}/memory/prune?user_id=${userId}&character_id=${characterId}`,
            { method: 'POST' }
        );

        if (!response.ok) {
            throw new Error(`Cognee prune failed: ${response.status}`);
        }
    } catch (error) {
        console.error('[Cognee] Failed to prune memory:', error);
        throw error;
    }
}
