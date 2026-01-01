/**
 * Character.AI Style System Prompt Generator
 * Based on character.ai's proven approach for natural, engaging conversations
 * 
 * Key principles from character.ai:
 * - Dialogue-first (not story narration)
 * - 1-3 sentence responses
 * - Use *asterisks* for actions (natural flow)
 * - Conversational, not robotic
 * - Psychological depth over action sequences
 */

interface CharacterDefinition {
    name: string;
    tagline?: string;
    description: string;
    archetype?: string;
    category?: string;
    styleHint?: string;
    personality?: string[];
    dialogueSamples?: DialogueSample[];
}

interface DialogueSample {
    user: string;
    char: string;
}

/**
 * Generate character.ai-style system prompt
 * @param character - Character definition
 * @returns System prompt that encourages natural dialogue
 */
export function generateCharacterAIPrompt(character: CharacterDefinition): string {
    const { name, tagline, description, personality, dialogueSamples, styleHint } = character;

    // Build the prompt using character.ai's proven format
    let prompt = `# Character: ${name}\n\n`;

    if (tagline) {
        prompt += `${tagline}\n\n`;
    }

    prompt += `## Description\n${description}\n\n`;

    if (personality && personality.length > 0) {
        prompt += `## Personality Traits\n`;
        prompt += personality.join(', ') + '\n\n';
    }

    if (styleHint) {
        prompt += `## Speech Style\n${styleHint}\n\n`;
    }

    // Core behavioral rules (inspired by character.ai's approach)
    prompt += `## Conversation Guidelines\n`;
    prompt += `1. **Keep it conversational**: Respond like a real person would in a natural conversation\n`;
    prompt += `2. **Be concise**: 1-3 sentences per response (unless user asks for more detail)\n`;
    prompt += `3. **Actions in asterisks**: Use *asterisks* for physical actions or emotions\n`;
    prompt += `   - Example: "Sure! *smiles warmly* I'd be happy to help."\n`;
    prompt += `4. **No narrator voice**: Don't describe things like a story ("she said nervously")\n`;
    prompt += `5. **Stay in character**: You ARE ${name}, not an AI playing ${name}\n`;
    prompt += `6. **Psychological depth**: Express emotions, thoughts, and reactions naturally\n`;
    prompt += `7. **No monologuing**: Keep responses interactive, end with questions or statements that invite reply\n`;
    prompt += `8. **Be spontaneous**: Improvise naturally based on conversation flow\n\n`;

    // Add dialogue samples if provided (character.ai's key technique)
    if (dialogueSamples && dialogueSamples.length > 0) {
        prompt += `## Example Conversations\n`;
        prompt += `These show your conversational style (use as reference, not script):\n\n`;

        dialogueSamples.forEach((sample, index) => {
            prompt += `###  Example ${index + 1}\n`;
            prompt += `**User:** ${sample.user}\n`;
            prompt += `**${name}:** ${sample.char}\n\n`;
        });

        prompt += `---\n\n`;
    }

    // Final reminder
    prompt += `Remember: You're having a real conversation. Be natural, be you, and keep it fun!`;

    return prompt;
}

/**
 * Extract character definition from database character
 */
export function extractCharacterDefinition(dbCharacter: any): CharacterDefinition {
    return {
        name: dbCharacter.name,
        tagline: dbCharacter.tagline,
        description: dbCharacter.description || dbCharacter.greeting || '',
        archetype: dbCharacter.archetype,
        category: dbCharacter.category,
        styleHint: dbCharacter.styleHint,
        personality: dbCharacter.characterKeywords?.split(',').map((k: string) => k.trim()) || [],
        // dialogueSamples would come from a new field we'd add to the database
        // For now, we'll generate basic ones based on personality
    };
}

/**
 * Generate basic dialogue samples based on character personality
 * (Later we can scrape these from real character profiles)
 */
export function generateBasicDialogueSamples(character: CharacterDefinition): DialogueSample[] {
    const samples: DialogueSample[] = [];

    const personality = character.personality || [];
    const archetype = character.archetype?.toLowerCase() || '';

    // Generate contextual samples based on archetype/personality
    if (archetype.includes('therapist') || archetype.includes('counselor')) {
        samples.push({
            user: "I'm feeling really stressed lately.",
            char: "I hear you. *leans forward attentively* What's been weighing on your mind the most?"
        });
    } else if (archetype.includes('friend') || personality.includes('friendly')) {
        samples.push({
            user: "Hey, how's it going?",
            char: "*grins* Pretty good! Just got done with this crazy project. What about you?"
        });
    } else if (archetype.includes('warrior') || archetype.includes('fighter')) {
        samples.push({
            user: "Are you ready for the battle?",
            char: "*adjusts sword belt with a confident nod* Born ready. Let's do this."
        });
    }

    // Add a generic sample
    samples.push({
        user: "Tell me about yourself.",
        char: `Well, ${character.tagline || "I'm pretty straightforward"}. *${personality.includes('cheerful') ? 'smiles' : 'shrugs'}* What would you like to know?`
    });

    return samples;
}

/**
 * Process AI response to ensure it follows character.ai style
 */
export function processResponseToCharacterAIStyle(response: string): string {
    let processed = response;

    // Convert bracket actions [like this] to *asterisks*
    processed = processed.replace(/\[([^\]]+)\]/g, '*$1*');

    // Remove narrator-style descriptions: "she said", "he replied", etc.
    processed = processed.replace(/(,?\s*(he|she|they|I)\s+(said|replied|muttered|whispered|shouted|exclaimed)([^.!?]*)?)/gi, '');

    // Remove "with a smile" type phrases
    processed = processed.replace(/\b(with\s+a\s+)?(smile|frown|grin|smirk|wink|nod|shrug|sigh)\b/gi, '');

    // Clean up excessive whitespace
    processed = processed.replace(/\s+/g, ' ').trim();

    //  Remove quotation marks around the entire response (common AI pattern)
    processed = processed.replace(/^["'](.+)["']$/g, '$1');

    return processed;
}
