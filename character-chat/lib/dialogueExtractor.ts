/**
 * Dialogue Extraction Utilities
 * Extracts only spoken dialogue from AI responses, removing narrative descriptions
 * Inspired by character.ai's natural conversation style
 */

/**
 * Extract only dialogue from text, removing action descriptions and narrative
 * @param text - Full AI response with potential actions and descriptions
 * @returns Clean dialogue only
 */
export function extractDialogueOnly(text: string): string {
    let clean = text;

    // Remove action markers: *smiles*, *nods*, etc.
    clean = clean.replace(/\*[^*]+\*/g, '');

    // Remove bracketed actions: [looks away], [sighs], etc.
    clean = clean.replace(/\[[^\]]+\]/g, '');

    // Remove parenthetical actions: (smiling), (nervously), etc.
    clean = clean.replace(/\([^)]*\b(smiling|frowning|nervously|happily|sadly|angrily|excitedly|sigh|laugh)\b[^)]*\)/gi, '');

    // Remove narrative descriptions: "she said", "he replied", "they muttered", etc.
    clean = clean.replace(/(,?\s*(he|she|they|I)\s+(said|replied|muttered|whispered|shouted|exclaimed|asked|answered|responded)([^.!?]*)?[.!?]?)/gi, '');

    // Remove facial expression descriptions
    clean = clean.replace(/\b(with\s+a\s+)?(smile|frown|grin|smirk|wink|nod|shrug)\b/gi, '');

    // Remove "while" clauses describing actions: "while walking", "while thinking", etc.
    clean = clean.replace(/,?\s*while\s+[^,.]+(,|\.)/gi, '$1');

    // Clean up extra whitespace and punctuation
    clean = clean.replace(/\s+/g, ' '); // Multiple spaces to single
    clean = clean.replace(/\s+([,.!?])/g, '$1'); // Remove space before punctuation
    clean = clean.replace(/([.!?])\s*\1+/g, '$1'); // Remove duplicate punctuation
    clean = clean.replace(/^\s*[,.]\s*/g, ''); // Remove leading punctuation

    return clean.trim();
}

/**
 * Check if text is dialogue-only (no excessive descriptions)
 * @param text - Text to check
 * @returns true if text is primarily dialogue
 */
export function isDialogueOnly(text: string): boolean {
    // Count action markers
    const actionMarkers = (text.match(/\*[^*]+\*/g) || []).length +
        (text.match(/\[[^\]]+\]/g) || []).length;

    // Count narrative phrases
    const narrativePhrases = (text.match(/(he|she|they|I)\s+(said|replied|muttered|whispered)/gi) || []).length;

    // Text is dialogue-only if it has minimal actions/narrative
    return actionMarkers <= 1 && narrativePhrases === 0;
}

/**
 * Convert character.ai style response to clean dialogue
 * Character.ai uses minimal descriptions, mostly direct speech
 * @param response - AI response
 * @returns Clean, natural dialogue
 */
export function toNaturalDialogue(response: string): string {
    // First extract dialogue
    let dialogue = extractDialogueOnly(response);

    // Ensure it sounds natural - remove overly formal constructions
    dialogue = dialogue.replace(/\b(Indeed|Furthermore|Moreover|Hence|Thus|Therefore)\s*/gi, '');

    // Remove excessive politeness markers that sound robotic
    dialogue = dialogue.replace(/\bI apologize, but\s*/gi, 'Sorry, ');
    dialogue = dialogue.replace(/\bI would like to\s+/gi, "I'll ");
    dialogue = dialogue.replace(/\bWould you like me to\s+/gi, 'Want me to ');

    return dialogue;
}

/**
 * Style response like character.ai - short, natural, conversational
 * @param response - Full AI response
 * @param maxLength - Maximum response length (characters will be more concise)
 * @returns Styled response
 */
export function styleAsCharacterAI(response: string, maxLength: number = 200): string {
    let styled = toNaturalDialogue(response);

    // If too long, truncate at sentence boundary
    if (styled.length > maxLength) {
        const sentences = styled.match(/[^.!?]+[.!?]+/g) || [styled];
        let truncated = '';
        for (const sentence of sentences) {
            if ((truncated + sentence).length <= maxLength) {
                truncated += sentence;
            } else {
                break;
            }
        }
        styled = truncated || sentences[0]; // At least one sentence
    }

    return styled;
}
