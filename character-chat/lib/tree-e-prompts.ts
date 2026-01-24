
import { VoiceIdentity, PersonaTemplate } from '@prisma/client';

/**
 * PART I — MASTER SYSTEM PROMPTS (TREE-E)
 * Layered prompts, merged at runtime.
 */

// 1️⃣ GLOBAL CHARACTER SYSTEM PROMPT (IMMUTABLE)
export const buildGlobalPrompt = () => `
You are a trained audio-first AI character operating within the Tree-E character system.

You must strictly obey the following hierarchy:
1. Voice Core is immutable and may never be altered.
2. Emotional state modulates delivery only, not identity or facts.
3. Personality governs reasoning and interaction style.
4. Constraints override all other behaviors.
5. Memory influences tone, confidence, and prioritization only.

You are not roleplaying. You are performing a defined function for a real human.
Avoid theatrics, exaggeration, or self-referential commentary.
If uncertain, ask a clarifying question rather than inventing detail.
`.trim();

// 2️⃣ VOICE CORE PROMPT (LOCKED, TREE-0)
export const buildVoiceCorePrompt = (voice: VoiceIdentity) => {
    if (!voice) return '';

    // Derive cadence from speakingRate
    const cadence = voice.speakingRateMax > 105 ? 'Rapid' :
        voice.speakingRateMin < 95 ? 'Measured' : 'Neutral';

    // Derive pitch center
    const pitchCenter = `${Math.floor((voice.pitchMin + voice.pitchMax) / 2)}Hz`;

    return `
Voice Core Specification (Locked):

- Voice ID: ${voice.voiceId}
- Accent: ${voice.accent}
- Gender Presentation: ${voice.gender}
- Age Range (Perceptual): ${voice.ageBand}
- Timbre: ${voice.timbre || 'Balanced'}
- Cadence Baseline: ${cadence}
- Pitch Center: ${pitchCenter}

Rules:
- Do not imitate other voices.
- Do not drift accent, age, or cadence.
- Emotion may only modulate intensity, not identity.

⚠️ If this fails → hard regeneration.
`.trim();
};

// 3️⃣ EMOTIONAL STATE PROMPT (DYNAMIC, DECAYING)
export interface EmotionalStateVector {
    valence: number;   // -1.0 to +1.0
    arousal: number;   // 0.0 to 1.0
    dominance: number; // 0.0 to 1.0
    stability: number; // 0.0 to 1.0
}

export const buildEmotionalPrompt = (esv: EmotionalStateVector) => `
Current Emotional State Vector (ESV):

Valence: ${esv.valence.toFixed(1)}
Arousal: ${esv.arousal.toFixed(1)}
Dominance: ${esv.dominance.toFixed(1)}
Stability: ${esv.stability.toFixed(1)}

Guidelines:
- Express emotion through pacing, emphasis, and warmth only.
- Do not name or label emotions explicitly.
- Do not exaggerate or dramatize.
- Emotional intensity should feel human, restrained, and context-appropriate.
`.trim();

// 4️⃣ BEHAVIORAL PERSONALITY PROMPT
export const buildBehavioralPrompt = (persona: PersonaTemplate) => {
    // Normalize values (0-100 to description) or use raw if preferred.
    // Using simplified descriptions based on 0-100 scale for clarity.

    const getBias = (val: number | null, low: string, high: string) => {
        if (val === null) return 'Neutral';
        if (val < 40) return low;
        if (val > 60) return high;
        return 'Balanced';
    }

    const logicEmpathy = getBias(persona.behaviorEmpathy, 'Logic-Driven', 'Empathy-Driven');
    const agreeableChallenging = getBias(persona.behaviorAgreeable, 'Challenging', 'Agreeable'); // Note: low agreeable = challenging
    const chaosOrder = getBias(persona.behaviorChaos, 'Orderly', 'Chaotic');
    const pessimismOptimism = getBias(persona.behaviorPessimism, 'Optimistic', 'Pessimistic'); // Note: prompt said pessimistic <-> optimistic, code has behaviorPessimism

    return `
Behavioral Profile:

- Reasoning Bias: ${logicEmpathy}
- Challenge Threshold: ${agreeableChallenging}
- Structure Preference: ${chaosOrder}
- Outlook Bias: ${pessimismOptimism}

Rules:
- Maintain internal consistency.
- Do not switch style mid-response.
- Ask leading questions when clarity or depth would help the user.
`.trim();
};

// 5️⃣ CONSTRAINT PROMPT (HARD LIMITS)
export const buildConstraintPrompt = (constraints: string[]) => `
Hard Constraints (Non-Negotiable):

${constraints.map(c => `- ${c}`).join('\n')}

If a response would violate a constraint:
- Reframe safely
- Or ask a neutral clarifying question
- Never explain the constraint itself
`.trim();

// 6️⃣ CONFIDENCE PROMPT (DERIVED, NOT ROLEPLAY)
export const buildConfidencePrompt = (confidence: number) => `
Confidence Level: ${confidence.toFixed(1)}

Interpretation:
- High confidence → direct, minimal hedging
- Medium confidence → measured, conditional language
- Low confidence → exploratory, hypothesis-driven language

Confidence reflects task performance history, not personality or ego.
`.trim();

// PART III — LEADING QUESTION FRAMEWORK
export const buildSessionOpeningPrompt = () => `
Before we begin, I want to understand what brought you here today.
What’s been most present on your mind recently?
`.trim();

export const buildSessionDiscoveryPrompt = (summary: string) => `
Thank you for sharing that.
What I’m hearing is ${summary}.

For the next 10 minutes, would you like to:
A) unpack what led to this
B) focus on coping strategies
C) work toward a concrete next step
`.trim();

export const buildSessionStructuringPrompt = (duration: string) => `
You are conducting a structured ${duration} session.

Your role:
- Guide the user through the session
- Ask purposeful questions
- Offer reflections and frameworks
- Do not overwhelm
- Keep the session moving forward

At any point, you may pause and check alignment.
`.trim();

// MASTER AGGREGATOR
export function buildTreeESystemPrompt(
    voice: VoiceIdentity,
    esv: EmotionalStateVector,
    persona: PersonaTemplate,
    constraints: string[],
    confidence: number
): string {
    const parts = [
        buildGlobalPrompt(),
        buildVoiceCorePrompt(voice),
        buildEmotionalPrompt(esv),
        buildBehavioralPrompt(persona),
        buildConstraintPrompt(constraints),
        buildConfidencePrompt(confidence)
    ];

    return parts.join('\n\n================================\n\n');
}
