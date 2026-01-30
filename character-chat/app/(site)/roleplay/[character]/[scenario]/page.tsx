/**
 * Roleplay [Character] [Scenario] - Combination Pages
 * 
 * Generates pages for character × scenario combinations
 * Examples: /roleplay/vampire/coffee-shop, /roleplay/yandere/school
 */

import { Metadata } from 'next';
import { db } from '@/lib/db';
import { generateFAQSchema, generateBreadcrumbs } from '@/lib/seo/structured-data';
import Link from 'next/link';
import characterData from '@/data/seo/character-names.json';

// ISR Configuration for 100k+ page scale
export const revalidate = 86400; // Regenerate every 24 hours
export const dynamicParams = true; // Generate pages on-demand

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

// Top archetypes for combinations
const TOP_CHARACTERS = [
    ...characterData.archetypes.slice(0, 30),
    'vampire', 'demon', 'angel', 'mafia-boss', 'ceo',
    'yandere', 'tsundere', 'kuudere', 'prince', 'princess',
];

const SCENARIOS = characterData.scenarios;

export async function generateStaticParams() {
    const params: { character: string; scenario: string }[] = [];

    // Limit to just the first character for build time to avoid DB connection limits
    // The rest will be generated on demand via ISR (dynamicParams = true)
    TOP_CHARACTERS.slice(0, 1).forEach(character => {
        SCENARIOS.forEach(scenario => {
            params.push({ character, scenario });
        });
    });

    return params;
}

function formatName(slug: string): string {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: { params: Promise<{ character: string; scenario: string }> }): Promise<Metadata> {
    const { character, scenario } = await params;
    const charName = formatName(character);
    const scenarioName = formatName(scenario);

    const title = `${charName} ${scenarioName} Roleplay | AI Chat Scenario | Agentwood`;
    const description = `Roleplay with a ${charName} AI in a ${scenarioName} setting. Free immersive AI chat with realistic scenarios, context memory, and 24/7 availability.`;

    return {
        title,
        description,
        keywords: [
            `${character} ${scenario} roleplay`, `${character} ai ${scenario}`,
            `${scenario} roleplay ai`, `${charName} ${scenarioName}`,
            'ai roleplay', 'character ai roleplay', 'free roleplay chat',
        ],
        openGraph: { title, description, url: `${SITE_URL}/roleplay/${character}/${scenario}` },
        alternates: { canonical: `${SITE_URL}/roleplay/${character}/${scenario}` },
    };
}

export default async function RoleplayScenarioPage({ params }: { params: Promise<{ character: string; scenario: string }> }) {
    const { character, scenario } = await params;
    const charName = formatName(character);
    const scenarioName = formatName(scenario);

    // Find matching characters
    const characters = await db.personaTemplate.findMany({
        where: {
            OR: [
                { archetype: { contains: character.split('-')[0], mode: 'insensitive' } },
                { description: { contains: character.replace(/-/g, ' '), mode: 'insensitive' } },
                { description: { contains: scenario.replace(/-/g, ' '), mode: 'insensitive' } },
            ],
        },
        select: { id: true, name: true, description: true, avatarUrl: true, archetype: true, viewCount: true },
        orderBy: { viewCount: 'desc' },
        take: 24,
    });

    const faqs = [
        {
            question: `What is a ${charName} ${scenarioName} roleplay?`,
            answer: `A ${charName} ${scenarioName} roleplay is an immersive AI chat experience where you interact with a ${charName} character in a ${scenarioName} setting. The AI responds contextually to create an engaging story.`,
        },
        {
            question: `How do I start a ${scenarioName} roleplay?`,
            answer: `Simply choose a ${charName} character below that fits the ${scenarioName} scenario you want. Click to start chatting and set the scene for your roleplay.`,
        },
        {
            question: `Is ${charName} roleplay free?`,
            answer: `Yes! Basic roleplay with ${charName} characters is completely free on Agentwood. Premium features like voice chat are available with a subscription.`,
        },
    ];

    const faqSchema = generateFAQSchema(faqs);
    const breadcrumbs = generateBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Roleplay', url: '/discover' },
        { name: charName, url: `/chat-with/${character}` },
        { name: scenarioName, url: `/roleplay/${character}/${scenario}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <nav className="text-sm mb-6 text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/discover" className="hover:text-primary">Roleplay</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/chat-with/${character}`} className="hover:text-primary">{charName}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">{scenarioName}</span>
                </nav>

                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {charName} {scenarioName} Roleplay
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Immerse yourself in a {scenarioName.toLowerCase()} setting with a {charName.toLowerCase()} AI character.
                        Free, unlimited roleplay with context memory.
                    </p>
                </header>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">Characters for {scenarioName} Roleplay</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {characters.map((c) => (
                            <Link key={c.id} href={`/character/${c.id}`}
                                className="group block bg-gray-800/50 rounded-xl p-3 hover:bg-gray-700/50 transition">
                                <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-700">
                                    {c.avatarUrl ? (
                                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">{c.name[0]}</div>
                                    )}
                                </div>
                                <h3 className="font-medium text-sm truncate">{c.name}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Scenario Description */}
                <section className="mb-16 prose prose-invert max-w-none">
                    <h2>{scenarioName} Roleplay Setting</h2>
                    <p>
                        The {scenarioName.toLowerCase()} setting provides the perfect backdrop for your {charName.toLowerCase()} roleplay.
                        Whether you're looking for romance, drama, or adventure, this scenario offers endless possibilities
                        for immersive storytelling with your AI companion.
                    </p>
                </section>

                {/* FAQs */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">FAQ</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-gray-800/50 rounded-xl p-4">
                                <summary className="font-medium cursor-pointer">{faq.question}</summary>
                                <p className="mt-3 text-gray-400">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Related Scenarios */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">More {charName} Scenarios</h2>
                    <div className="flex flex-wrap gap-2">
                        {SCENARIOS.filter(s => s !== scenario).slice(0, 10).map(s => (
                            <Link key={s} href={`/roleplay/${character}/${s}`}
                                className="px-4 py-2 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition">
                                {formatName(s)}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
