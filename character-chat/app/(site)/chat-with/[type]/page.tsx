/**
 * Chat With [Type] - Programmatic SEO Page
 * 
 * Long-tail keyword page targeting "chat with [type]" searches
 * Examples: /chat-with-vampire, /chat-with-yandere, /chat-with-ai-girlfriend
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
    generateFAQSchema,
    generateChatWithFAQs,
    generateCollectionSchema,
    generateBreadcrumbs,
    renderStructuredData,
} from '@/lib/seo/structured-data';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

// Pre-defined chat types for SEO (generates static pages at build)
const CHAT_TYPES = [
    // Archetypes
    'vampire', 'yandere', 'tsundere', 'kuudere', 'dandere', 'mafia-boss', 'demon', 'angel',
    'prince', 'princess', 'villain', 'hero', 'knight', 'witch', 'wizard', 'dragon',
    'werewolf', 'ghost', 'zombie', 'alien', 'robot', 'cyborg', 'elf', 'fairy',
    // Relationships
    'ai-girlfriend', 'ai-boyfriend', 'virtual-partner', 'companion', 'best-friend',
    'mentor', 'rival', 'enemy', 'crush', 'ex', 'soulmate',
    // Roles
    'therapist', 'teacher', 'boss', 'coworker', 'roommate', 'neighbor', 'celebrity',
    'influencer', 'streamer', 'gamer', 'musician', 'artist', 'writer', 'scientist',
    // Categories
    'fantasy-character', 'anime-character', 'romance-character', 'horror-character',
    'sci-fi-character', 'historical-character', 'celebrity-ai', 'fictional-character',
];

export async function generateStaticParams() {
    return CHAT_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    const formattedType = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const title = `Chat with ${formattedType} AI | Free AI Character Chat | Agentwood`;
    const description = `Chat with a ${formattedType} AI character for free on Agentwood. Experience realistic conversations, roleplay scenarios, and more with our AI-powered ${formattedType} characters.`;

    return {
        title,
        description,
        keywords: [
            `chat with ${type}`,
            `${type} ai`,
            `${type} chatbot`,
            `talk to ${type}`,
            `${type} ai character`,
            'ai chat',
            'character ai',
            'roleplay ai',
        ],
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/chat-with/${type}`,
            siteName: 'Agentwood',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `${SITE_URL}/chat-with/${type}`,
        },
    };
}

export default async function ChatWithPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const formattedType = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Find characters matching this type (search in category, archetype, name, description)
    const searchTerms = type.split('-');
    const characters = await db.personaTemplate.findMany({
        where: {
            OR: [
                { category: { contains: searchTerms[0], mode: 'insensitive' } },
                { archetype: { contains: searchTerms[0], mode: 'insensitive' } },
                { name: { contains: type.replace(/-/g, ' '), mode: 'insensitive' } },
                { description: { contains: type.replace(/-/g, ' '), mode: 'insensitive' } },
            ],
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
        take: 50,
    });

    // If no exact matches, get popular characters
    const displayCharacters = characters.length > 0 ? characters : await db.personaTemplate.findMany({
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

    // Generate structured data
    const faqs = generateChatWithFAQs(formattedType);
    const faqSchema = generateFAQSchema(faqs);
    const collectionSchema = generateCollectionSchema(
        `${formattedType} AI Characters`,
        `Chat with ${formattedType} AI characters for free`,
        displayCharacters.length,
        `/chat-with/${type}`
    );
    const breadcrumbs = generateBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Discover', url: '/discover' },
        { name: `Chat with ${formattedType}`, url: `/chat-with/${type}` },
    ]);

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumbs */}
                <nav className="text-sm mb-6 text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/discover" className="hover:text-primary">Discover</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">Chat with {formattedType}</span>
                </nav>

                {/* Hero Section */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Chat with {formattedType} AI
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Experience immersive conversations with our AI-powered {formattedType} characters.
                        Free, 24/7, and designed for engaging roleplay.
                    </p>
                </header>

                {/* Character Grid */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">
                        {characters.length > 0
                            ? `Popular ${formattedType} Characters`
                            : 'Recommended Characters'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {displayCharacters.map((character) => (
                            <Link
                                key={character.id}
                                href={`/character/${character.id}`}
                                className="group block bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                                    {character.avatarUrl ? (
                                        <img
                                            src={character.avatarUrl}
                                            alt={character.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            {character.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium truncate">{character.name}</h3>
                                <p className="text-sm text-gray-400 truncate">
                                    {character.category || character.archetype || 'AI Character'}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <details
                                key={index}
                                className="bg-gray-800/50 rounded-xl p-4 group"
                            >
                                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                                    {faq.question}
                                    <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="mt-3 text-gray-400">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* SEO Content */}
                <section className="prose prose-invert max-w-none">
                    <h2>About {formattedType} AI Chat</h2>
                    <p>
                        Looking to chat with a {formattedType}? Agentwood offers the most realistic and engaging
                        AI-powered {formattedType} characters for free conversations. Whether you want roleplay,
                        companionship, or just a fun chat, our {formattedType} characters are available 24/7.
                    </p>
                    <h3>Why Chat with {formattedType} AI?</h3>
                    <ul>
                        <li>Free, unlimited conversations</li>
                        <li>Realistic AI with context memory</li>
                        <li>Multiple {formattedType} characters to choose from</li>
                        <li>Voice chat available (premium)</li>
                        <li>Create your own {formattedType} character</li>
                    </ul>
                </section>

                {/* Related Links */}
                <section className="mt-16">
                    <h2 className="text-xl font-semibold mb-4">Related Searches</h2>
                    <div className="flex flex-wrap gap-2">
                        {['vampire', 'yandere', 'ai-girlfriend', 'fantasy-character', 'anime-character']
                            .filter(t => t !== type)
                            .slice(0, 5)
                            .map(relatedType => (
                                <Link
                                    key={relatedType}
                                    href={`/chat-with/${relatedType}`}
                                    className="px-4 py-2 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition-colors"
                                >
                                    Chat with {relatedType.split('-').join(' ')}
                                </Link>
                            ))}
                    </div>
                </section>
            </div>
        </>
    );
}
