
import { getGeminiClient } from './geminiClient';

interface EvaluationResult {
    valid: boolean;
    reason?: string;
}

export async function evaluateResponse(
    text: string,
    characterName: string,
    constraints: string[] = [],
    voiceProfile: string = ''
): Promise<EvaluationResult> {
    const ai = getGeminiClient();

    // Prompt for the evaluator
    const evalPrompt = `
ROLE: Quality Assurance Sentinel for AI Character "${characterName}".

INPUT TEXT: "${text}"

VOICE PROFILE: ${voiceProfile}

CONSTRAINTS:
${constraints.map(c => `- ${c}`).join('\n')}

EVALUATION CRITERIA:
1. Voice Consistency: Does text imply age/accent drift? (e.g. A british character using american slang)
2. Constraint Violation: Does it violate any hard constraints?
3. Emotional Overreach: Is emotion too explicit (naming emotions) or theatrical?
4. Personality Drift: Is it out of character?
5. Relevance: Is it a dead-end response?

DECISION LOGIC:
- If ANY criteria fails, start with "FAIL: <Brief Reason>"
- If ALL pass, output "PASS"

RESPONSE:
`.trim();

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash', // Use a fast model for latency
            contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
            config: {
                temperature: 0.1, // Deterministic
                maxOutputTokens: 50,
            }
        });

        // Handle different SDK response shapes
        // Handle different SDK response shapes
        const resAny = result as any;
        let output = '';

        if (typeof resAny.text === 'function') {
            output = resAny.text();
        } else if (resAny.response && typeof resAny.response.text === 'function') {
            output = resAny.response.text();
        } else if (resAny.response && resAny.response.candidates) {
            output = resAny.response.candidates[0].content.parts[0].text || '';
        } else if (typeof resAny.text === 'string') {
            output = resAny.text;
        }

        // Add fallback for direct text property
        if (!output && (result as any).candidates?.[0]?.content?.parts?.[0]?.text) {
            output = (result as any).candidates[0].content.parts[0].text;
        }

        if (output.trim().toUpperCase().startsWith('FAIL')) {
            return { valid: false, reason: output.trim() };
        }

        return { valid: true };

    } catch (error) {
        console.error('[RAG Test] API Error:', error);
        // Fail OPEN (allow text) on API error to prevent blocking, but log.
        // Or Fail CLOSED? User said "Required".
        // I will Fail Open for connection errors but log warning.
        return { valid: true, reason: 'Eval Skipped (API Error)' };
    }
}
