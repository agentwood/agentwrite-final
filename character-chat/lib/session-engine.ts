
import { updateCharacterMemory, getCharacterMemory, UserMemory } from './ml/contextSystem';

export enum SessionPhase {
    OPENING = 'OPENING',
    DISCOVERY = 'DISCOVERY',
    STRUCTURING = 'STRUCTURING',
    ACTIVE = 'ACTIVE',
    REFLECTION = 'REFLECTION'
}

export interface SessionData {
    id: string;
    conversationId: string;
    phase: SessionPhase;
    goal?: string; // The "Summary" or "Goal" extracted
    startTime: number;
    lastInteraction: number;
    metadata?: any;
}

/**
 * Retrieves the active session for the current conversation.
 * If a session exists in memory but matches a different conversation, it returns null (or resets if logic dictates).
 */
export async function getSession(userId: string, personaId: string, conversationId: string): Promise<SessionData | null> {
    const memory = await getCharacterMemory(personaId, userId);
    const session = memory.facts['activeSession'] as SessionData;

    // Check if session belongs to current conversation
    if (session && session.conversationId === conversationId) {
        return session;
    }
    return null;
}

/**
 * Initializes a new session.
 */
export async function initSession(userId: string, personaId: string, conversationId: string): Promise<SessionData> {
    const session: SessionData = {
        id: crypto.randomUUID(),
        conversationId,
        phase: SessionPhase.OPENING,
        startTime: Date.now(),
        lastInteraction: Date.now()
    };

    await updateCharacterMemory(personaId, userId, {
        facts: { activeSession: session }
    });

    return session;
}

/**
 * Updates the session state.
 */
export async function updateSession(userId: string, personaId: string, session: SessionData): Promise<void> {
    session.lastInteraction = Date.now();
    await updateCharacterMemory(personaId, userId, {
        facts: { activeSession: session }
    });
}

/**
 * Logic to determine next phase.
 * a simple heuristic or LLM based decision could go here.
 * For now, we'll let the route handle the transition logic based on user input analysis.
 */
