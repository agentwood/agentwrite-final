/**
 * [Character] AI Chat - Mass Programmatic SEO Page
 * 
 * Targets searches like "miku ai chat", "gojo ai", "batman chatbot"
 * This single route generates 500+ static pages at build time
 */

import { Metadata } from 'next';
import { db } from '@/lib/db';
import {
    generateFAQSchema,
    generateBreadcrumbs,
    generateCollectionSchema,
} from '@/lib/seo/structured-data';
import Link from 'next/link';
import characterData from '@/data/seo/character-names.json';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

// Flatten all character names for static generation
function getAllCharacterSlugs(): string[] {
    const slugs: string[] = [];

    // Add all character names
    slugs.push(...characterData.anime);
    slugs.push(...characterData.games);
    slugs.push(...characterData.movies_tv);
    slugs.push(...characterData.vtubers);
    slugs.push(...characterData.archetypes);

    // Add modifier + archetype combinations (most searched patterns)
    const topModifiers = ['cute', 'hot', 'yandere', 'tsundere', 'possessive', 'romantic'];
    const topTypes = ['girlfriend', 'boyfriend', 'waifu', 'husbando', 'companion'];

    topModifiers.forEach(mod => {
        topTypes.forEach(type => {
            slugs.push(`${mod}-${type}`);
        });
    });

    return slugs;
}

export async function generateStaticParams() {
    const slugs = getAllCharacterSlugs();
    return slugs.map((character) => ({ character }));
}

function formatName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getCategory(slug: string): string {
    if (characterData.anime.includes(slug)) return 'Anime';
    if (characterData.games.includes(slug)) return 'Video Games';
    if (characterData.movies_tv.includes(slug)) return 'Movies & TV';
    if (characterData.vtubers.includes(slug)) return 'VTuber';
    if (characterData.archetypes.includes(slug)) return 'Original Character';
    return 'AI Character';
}

export async function generateMetadata({ params }: { params: Promise<{ character: string }> }): Promise<Metadata> {
    const { character } = await params;
    const name = formatName(character);
    const category = getCategory(character);

    const title = `Chat with ${name} AI | Free ${category} AI Chat | Agentwood`;
    const description = `Chat with ${name} AI for free! Experience realistic conversations with our AI-powered ${name} character. Unlimited roleplay, 24/7 availability, no login required.`;

    return {
        title,
        description,
        keywords: [
            `${character} ai`, `${character} chat`, `${character} ai chat`,
            `chat with ${character}`, `${character} chatbot`, `${character} roleplay`,
            `${character} ai free`, `talk to ${character}`, `${name.toLowerCase()} ai`,
        ],
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${character}-ai-chat`,
            siteName: 'Agentwood',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `${SITE_URL}/${character}-ai-chat`,
        },
    };
}

export default async function CharacterAIChatPage({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const name = formatName(character);
    const category = getCategory(character);

    // Find matching characters in database
    const searchTerms = character.split('-').filter(t => t.length > 2);
    const matchingCharacters = await db.personaTemplate.findMany({
        where: {
            OR: searchTerms.flatMap(term => [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { category: { contains: term, mode: 'insensitive' } },
                { archetype: { contains: term, mode: 'insensitive' } },
            ]),
        },
        select: {
            id: true,
            name: true,
            description: true,
            avatarUrl: true,
            category: true,
            archetype: true,
            viewCount: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 30,
    });

    // If no matches, get popular characters
    const characters = matchingCharacters.length > 0
        ? matchingCharacters
        : await db.personaTemplate.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                avatarUrl: true,
                category: true,
                archetype: true,
                viewCount: true,
            },
            orderBy: { viewCount: 'desc' },
            take: 20,
        });

    // Generate FAQs
    const faqs = [
        {
            question: `How do I chat with ${name} AI?`,
            answer: `To chat with ${name} AI on Agentwood, simply browse our collection of ${name}-inspired AI characters below and click on one to start chatting. All chats are free and available 24/7.`,
        },
        {
            question: `Is ${name} AI chat free?`,
            answer: `Yes! Chatting with ${name} AI characters on Agentwood is completely free. You can have unlimited conversations without any payment or subscription required for basic features.`,
        },
        {
            question: `Can ${name} AI remember our conversations?`,
            answer: `Yes! Agentwood's AI characters, including ${name}-style characters, have context memory and can remember details from your conversation to create a more immersive experience.`,
        },
        {
            question: `Is there voice chat with ${name} AI?`,
            answer: `Voice chat is available as a premium feature on Agentwood. You can talk to ${name} AI using realistic AI-generated voices for an even more immersive experience.`,
        },
    ];

    const faqSchema = generateFAQSchema(faqs);
    const breadcrumbs = generateBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: category, url: '/discover' },
        { name: `${name} AI Chat`, url: `/${character}-ai-chat` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumbs */}
                <nav className="text-sm mb-6 text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/discover" className="hover:text-primary">{category}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">{name} AI Chat</span>
                </nav>

                {/* Hero */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Chat with {name} AI
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Experience free, unlimited conversations with AI characters inspired by {name}.
                        Available 24/7 with realistic roleplay and context memory.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Link href="/discover" className="px-6 py-3 bg-primary rounded-full font-medium hover:opacity-90 transition">
                            Start Chatting Free
                        </Link>
                        <Link href="/create" className="px-6 py-3 bg-gray-700 rounded-full font-medium hover:bg-gray-600 transition">
                            Create {name} AI
                        </Link>
                    </div>
                </header>

                {/* Character Grid */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">
                        {matchingCharacters.length > 0
                            ? `${name} AI Characters`
                            : `Popular Characters Like ${name}`}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {characters.map((char) => (
                            <Link
                                key={char.id}
                                href={`/character/${char.id}`}
                                className="group block bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition"
                            >
                                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                                    {char.avatarUrl ? (
                                        <img
                                            src={char.avatarUrl}
                                            alt={char.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            {char.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium truncate">{char.name}</h3>
                                <p className="text-sm text-gray-400 truncate">
                                    {char.category || char.archetype || 'AI Character'}
                                </p>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/discover" className="text-primary hover:underline">
                            View All Characters →
                        </Link>
                    </div>
                </section>

                {/* SEO Content */}
                <section className="mb-16 prose prose-invert max-w-none">
                    <h2>About {name} AI Chat</h2>
                    <p>
                        Looking for an AI to chat with that captures the essence of {name}? Agentwood offers
                        a variety of AI characters inspired by {name} and similar {category.toLowerCase()} personalities.
                        Whether you want casual conversation, immersive roleplay, or a virtual companion,
                        our {name}-style AI characters are here for you.
                    </p>

                    <h3>Why Chat with {name} AI on Agentwood?</h3>
                    <ul>
                        <li><strong>Free & Unlimited:</strong> No payment required for basic chat</li>
                        <li><strong>Context Memory:</strong> AI remembers your conversation</li>
                        <li><strong>24/7 Available:</strong> Chat anytime, anywhere</li>
                        <li><strong>Voice Chat:</strong> Premium realistic voice conversations</li>
                        <li><strong>Create Your Own:</strong> Make your perfect {name} AI</li>
                    </ul>

                    <h3>Popular {name} AI Alternatives</h3>
                    <p>
                        If you enjoy {name}, you might also like chatting with similar characters from
                        {category === 'Anime' ? ' other anime series' :
                            category === 'Video Games' ? ' other video games' :
                                category === 'Movies & TV' ? ' other movies and TV shows' :
                                    ' related archetypes'}.
                        Explore our full collection to find your perfect AI companion.
                    </p>
                </section>

                {/* FAQs */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">{name} AI Chat FAQ</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-gray-800/50 rounded-xl p-4 group">
                                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                                    {faq.question}
                                    <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="mt-3 text-gray-400">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Related Searches */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Related AI Chat</h2>
                    <div className="flex flex-wrap gap-2">
                        {getAllCharacterSlugs()
                            .filter(s => s !== character)
                            .slice(0, 12)
                            .map(slug => (
                                <Link
                                    key={slug}
                                    href={`/${slug}-ai-chat`}
                                    className="px-4 py-2 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition"
                                >
                                    {formatName(slug)} AI
                                </Link>
                            ))}
                    </div>
                </section>
            </div>
        </>
    );
}
