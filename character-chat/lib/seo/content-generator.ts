/**
 * Content Uniqueness Layer for Programmatic SEO
 * 
 * Generates unique, non-duplicate content for 100k+ pages
 * to avoid thin content and keyword cannibalization.
 */

// ============================================
// CONTENT TEMPLATE VARIATIONS
// ============================================

/**
 * Multiple intro templates for variety
 */
const INTRO_TEMPLATES = [
    (name: string, type: string) =>
        `Discover the world of ${name} with our AI-powered ${type} characters. Immersive conversations await you 24/7.`,
    (name: string, type: string) =>
        `Ready to chat with ${name}? Our ${type} AI offers realistic roleplay and endless story possibilities.`,
    (name: string, type: string) =>
        `Looking for a ${name} experience? Connect with intelligent ${type} AI characters designed for engaging conversations.`,
    (name: string, type: string) =>
        `Step into ${name}'s universe! Our ${type} AI companions bring your favorite characters to life.`,
    (name: string, type: string) =>
        `Explore ${name} like never before. Free ${type} AI chat with memory, personality, and voice options.`,
    (name: string, type: string) =>
        `Welcome to ${name} AI chat! Experience authentic ${type} conversations with our advanced AI characters.`,
    (name: string, type: string) =>
        `Dive into ${name} adventures! Our ${type} AI delivers immersive roleplay anytime you want.`,
    (name: string, type: string) =>
        `Connect with ${name} today. Free ${type} AI that remembers your story and responds naturally.`,
];

/**
 * Multiple CTA templates
 */
const CTA_TEMPLATES = [
    (name: string) => `Start chatting with ${name} now – completely free!`,
    (name: string) => `Begin your ${name} journey today. No signup required.`,
    (name: string) => `Ready to meet ${name}? Jump into conversation instantly.`,
    (name: string) => `Experience ${name} AI chat. Free, unlimited, available 24/7.`,
    (name: string) => `Your ${name} adventure starts here. One click to begin.`,
];

/**
 * Multiple benefit templates
 */
const BENEFIT_TEMPLATES = [
    ['Free unlimited chat', 'Context memory', 'Available 24/7', 'Voice chat option', 'Create custom characters'],
    ['No payment required', 'Remembers your story', 'Anytime access', 'Premium voice features', 'Design your own AI'],
    ['Completely free to use', 'Conversation history', 'Always online', 'Realistic voice modes', 'Customize appearance'],
    ['Zero cost entry', 'Smart memory system', 'Round-the-clock availability', 'Voice interaction', 'Build unique characters'],
];

// ============================================
// UNIQUE CONTENT GENERATION
// ============================================

/**
 * Generate a deterministic index based on string hash
 */
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Get a consistent but varied template for a given page
 */
export function getUniqueIntro(pagePath: string, name: string, type: string): string {
    const index = hashCode(pagePath) % INTRO_TEMPLATES.length;
    return INTRO_TEMPLATES[index](name, type);
}

export function getUniqueCTA(pagePath: string, name: string): string {
    const index = hashCode(pagePath + 'cta') % CTA_TEMPLATES.length;
    return CTA_TEMPLATES[index](name);
}

export function getUniqueBenefits(pagePath: string): string[] {
    const index = hashCode(pagePath + 'benefits') % BENEFIT_TEMPLATES.length;
    return BENEFIT_TEMPLATES[index];
}

// ============================================
// UNIQUE FAQ GENERATION
// ============================================

interface FAQItem {
    question: string;
    answer: string;
}

/**
 * Generate unique FAQs for roleplay pages
 */
export function generateRoleplayFAQs(character: string, scenario: string): FAQItem[] {
    const charName = formatSlug(character);
    const scenarioName = formatSlug(scenario);
    const hash = hashCode(`${character}-${scenario}`);

    const allFaqs: FAQItem[] = [
        {
            question: `What is a ${charName} ${scenarioName} roleplay?`,
            answer: `A ${charName} ${scenarioName} roleplay is an immersive AI chat experience where you interact with a ${charName} character in a ${scenarioName} setting.`,
        },
        {
            question: `How do I start ${scenarioName} roleplay with ${charName}?`,
            answer: `Choose a ${charName} character below, click to start chatting, and set the scene for your ${scenarioName} roleplay.`,
        },
        {
            question: `Is ${charName} roleplay in ${scenarioName} free?`,
            answer: `Yes! Basic roleplay with ${charName} in ${scenarioName} is completely free. Premium voice chat available with subscription.`,
        },
        {
            question: `Can I customize ${charName} for ${scenarioName}?`,
            answer: `Absolutely! Create your own ${charName}-style character optimized for ${scenarioName} scenarios using our character creator.`,
        },
        {
            question: `Does ${charName} AI remember our ${scenarioName} story?`,
            answer: `Yes! Our AI maintains context memory for your ${charName} ${scenarioName} conversations across sessions.`,
        },
        {
            question: `What makes ${charName} ${scenarioName} roleplay special?`,
            answer: `The ${scenarioName} setting creates unique dynamics for ${charName} interactions, offering storylines unavailable elsewhere.`,
        },
    ];

    // Return 3-4 FAQs based on hash to ensure variety
    const startIndex = hash % 3;
    const count = 3 + (hash % 2);
    return allFaqs.slice(startIndex, startIndex + count);
}

/**
 * Generate unique FAQs for character type pages
 */
export function generateTypeFAQs(type: string): FAQItem[] {
    const typeName = formatSlug(type);
    const hash = hashCode(type);

    const allFaqs: FAQItem[] = [
        {
            question: `Can I really chat with a ${typeName}?`,
            answer: `Yes! Agentwood offers AI-powered ${typeName} characters available 24/7 for free conversations.`,
        },
        {
            question: `Is ${typeName} AI chat free?`,
            answer: `Basic chat with ${typeName} characters is completely free. Premium features available with subscription.`,
        },
        {
            question: `How realistic are ${typeName} AI conversations?`,
            answer: `Our ${typeName} AI uses advanced language models for natural, contextual conversations with memory.`,
        },
        {
            question: `Can I create my own ${typeName} character?`,
            answer: `Yes! Design custom ${typeName} characters with unique personalities using our character creator.`,
        },
        {
            question: `Does ${typeName} AI have voice chat?`,
            answer: `Voice chat with ${typeName} AI is available as a premium feature with realistic, generated voices.`,
        },
        {
            question: `What scenarios work best with ${typeName}?`,
            answer: `${typeName} characters excel in roleplay scenarios that match their archetype and personality traits.`,
        },
    ];

    const startIndex = hash % 2;
    const count = 4;
    return allFaqs.slice(startIndex, startIndex + count);
}

// ============================================
// HELPERS
// ============================================

function formatSlug(slug: string): string {
    if (!slug) return 'Character';
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Generate unique SEO description for any page
 */
export function generateUniqueDescription(pagePath: string, context: {
    name: string;
    type: string;
    scenario?: string;
}): string {
    const { name, type, scenario } = context;
    const hash = hashCode(pagePath);

    const templates = [
        `Chat with ${name} AI for free! Experience ${type} roleplay${scenario ? ` in ${scenario}` : ''} with memory and voice options.`,
        `${name} AI chat - unlimited ${type} conversations${scenario ? ` in ${scenario} setting` : ''}. Free, 24/7, no signup.`,
        `Looking for ${name}? Our ${type} AI offers immersive${scenario ? ` ${scenario}` : ''} roleplay. Start chatting now!`,
        `Experience ${name} like never before. Free ${type} AI${scenario ? ` ${scenario}` : ''} chat with context memory.`,
        `${name} awaits! Engage in ${type}${scenario ? ` ${scenario}` : ''} conversations with our intelligent AI characters.`,
    ];

    return templates[hash % templates.length];
}

/**
 * Check if content passes uniqueness threshold
 * Returns true if content is sufficiently unique from comparison
 */
export function checkContentUniqueness(content: string, comparison: string): boolean {
    if (!content || !comparison) return true;

    // Simple word overlap check
    const words1 = new Set(content.toLowerCase().split(/\s+/));
    const words2 = new Set(comparison.toLowerCase().split(/\s+/));

    let overlap = 0;
    words1.forEach(word => {
        if (words2.has(word)) overlap++;
    });

    const overlapRatio = overlap / Math.min(words1.size, words2.size);

    // Content should have less than 70% word overlap
    return overlapRatio < 0.7;
}
