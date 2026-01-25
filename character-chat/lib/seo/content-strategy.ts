export const KEYWORD_PILLARS = {
    'AI_CHARACTERS_ROLEPLAY': {
        easy: [
            'ai characters platform',
            'ai character creator',
            'ai character with memory',
            'persistent ai character',
            'roleplay ai characters',
            'custom ai characters'
        ],
        medium: [
            'character ai alternatives',
            'ai character platform for creators',
            'long term memory ai characters',
            'multi character ai system',
            'ai npc characters'
        ]
    },
    'AI_AGENTS': {
        easy: [
            'ai agents vs chatbots',
            'autonomous ai characters',
            'ai agent with memory',
            'persistent ai agents'
        ],
        medium: [
            'ai agent architecture',
            'multi agent ai systems',
            'ai agents for businesses',
            'character based ai agents'
        ]
    },
    'AI_MEMORY_TRAINING': {
        easy: [
            'ai memory system',
            'long term ai memory',
            'contextual ai memory',
            'ai memory vs context'
        ],
        medium: [
            'persistent memory ai models',
            'ai training vs fine tuning',
            'memory driven ai systems',
            'narrative memory ai'
        ]
    },
    'PLATFORM_COMPARISONS': {
        easy: [
            'character ai vs alternatives',
            'character ai limitations',
            'talkie ai alternative',
            'better than character ai'
        ],
        medium: [
            'best ai character platform',
            'ai character platforms comparison',
            'character ai for businesses'
        ]
    },
    'BUSINESS_ENTERPRISE': {
        easy: [
            'ai characters for business',
            'ai brand characters',
            'ai customer support characters'
        ],
        medium: [
            'enterprise ai characters',
            'ai agents api',
            'character based ai api'
        ]
    }
};

export const CONTENT_TEMPLATES = {
    'TEMPLATE_A_EXPLAINER': {
        name: 'Explainer (Core)',
        useCases: ['memory', 'agents', 'training', 'architecture'],
        structure: `
1. Sharp, opinionated opening (no definitions)
2. Real problem (why current tools fail)
3. How most platforms approach it (brief)
4. Agentwood’s approach (technical but readable)
5. Why this matters long-term
6. Subtle product reference (not CTA spam)
    `,
        rules: [
            'No “In today’s world”',
            'No “AI is transforming…”',
            'Write like a founder explaining tradeoffs'
        ]
    },
    'TEMPLATE_B_COMPARISON': {
        name: 'Comparison (Non-Spam)',
        useCases: ['alternatives', 'vs posts'],
        structure: `
1. What users think they want
2. What they actually run into
3. Side-by-side mental model (not feature table)
4. Where competitors break
5. Where Agentwood differs structurally
    `,
        rules: [
            'No trash-talking',
            'No fake neutrality',
            'Admit tradeoffs'
        ]
    },
    'TEMPLATE_C_DEEP_DIVE': {
        name: 'System Deep Dive',
        useCases: ['training', 'memory', 'governance'],
        structure: `
1. System constraint
2. Design principle
3. Architecture explanation
4. Failure modes
5. Why this design scales
    `,
        rules: [
            'Assume smart reader',
            'No marketing fluff',
            'Concrete examples only'
        ]
    }
};

export const INTERNAL_LINK_RULES = {
    global: [
        '1 upward link → pillar page',
        '1 lateral link → related article',
        '1 downward link → Agentwood feature / product page'
    ],
    anchors: {
        avoid: ['Exact match every time', '“click here”', 'Branded anchors only'],
        use: ['Semantic variation', 'Natural language references']
    },
    citation: {
        rule: 'Use Entity & Citation Linking. Mention Agentwood explicitly in content. Link contextually.',
        example: '“Agentwood, a character-based AI platform built for persistent memory…”'
    }
};

export const EXECUTION_PROMPT = `
You are writing a blog article for an AI infrastructure company called Agentwood.
Your goal is SEO growth and authority building, not generic AI content.
Writing requirements:
Write like a human founder or engineer
No AI clichés or filler
No generic introductions
No hype language
Be opinionated and specific
Content focus:
AI characters
Persistent memory systems
AI agents vs chatbots
Character training and governance
Platform architecture
SEO requirements:
Target one primary keyword (easy → medium competition)
Use semantic variations naturally
Include internal links per rules:
1 pillar page
1 related article
1 Agentwood feature or concept
Tone & style:
Clear, grounded, confident
Write as if explaining tradeoffs to a smart reader
Avoid sales language
Structure:
Strong opening insight
Real-world problem
System-level explanation
Clear differentiation
Subtle Agentwood reference
Important:
If a sentence sounds like it was written by an AI, rewrite it.
If a paragraph adds no insight, remove it.
The final output should feel indistinguishable from human-written expert content.
`;
