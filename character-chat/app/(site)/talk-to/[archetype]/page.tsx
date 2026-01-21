/**
 * Talk To [Archetype] - Programmatic SEO Page
 * 
 * Long-tail keyword page targeting "talk to [archetype]" searches
 * Examples: /talk-to/yandere, /talk-to/villain, /talk-to/mentor
 */

import { Metadata } from 'next';
import { db } from '@/lib/db';
import {
    generateFAQSchema,
    generateArchetypeFAQs,
    generateCollectionSchema,
    generateBreadcrumbs,
} from '@/lib/seo/structured-data';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

// Pre-defined archetypes for SEO
const ARCHETYPES = [
    'yandere', 'tsundere', 'kuudere', 'dandere', 'himedere', 'kamidere',
    'villain', 'hero', 'mentor', 'rival', 'sidekick', 'anti-hero',
    'knight', 'princess', 'prince', 'queen', 'king', 'emperor',
    'witch', 'wizard', 'mage', 'sorcerer', 'necromancer',
    'vampire', 'werewolf', 'demon', 'angel', 'ghost', 'spirit',
    'dragon', 'elf', 'fairy', 'orc', 'dwarf', 'giant',
    'assassin', 'thief', 'spy', 'hunter', 'warrior', 'samurai',
    'pirate', 'captain', 'admiral', 'general', 'soldier',
    'scientist', 'doctor', 'professor', 'inventor', 'hacker',
    'artist', 'musician', 'writer', 'poet', 'dancer',
    'boss', 'ceo', 'billionaire', 'celebrity', 'influencer',
    'girlfriend', 'boyfriend', 'best-friend', 'soulmate', 'crush',
];

export async function generateStaticParams() {
    return ARCHETYPES.map((archetype) => ({ archetype }));
}

export async function generateMetadata({ params }: { params: Promise<{ archetype: string }> }): Promise<Metadata> {
    const { archetype } = await params;
    const formatted = archetype.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const title = `Talk to a ${formatted} AI Character | Free Roleplay Chat | Agentwood`;
    const description = `Talk to a ${formatted} AI character for free. Experience immersive conversations and roleplay with our AI-powered ${formatted} personalities available 24/7.`;

    return {
        title,
        description,
        keywords: [
            `talk to ${archetype}`, `${archetype} ai`, `${archetype} chat`,
            `${archetype} roleplay`, `${archetype} character`, 'ai chat',
        ],
        openGraph: { title, description, url: `${SITE_URL}/talk-to/${archetype}` },
        alternates: { canonical: `${SITE_URL}/talk-to/${archetype}` },
    };
}

export default async function TalkToPage({ params }: { params: Promise<{ archetype: string }> }) {
    const { archetype } = await params;
    const formatted = archetype.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const characters = await db.personaTemplate.findMany({
        where: {
            OR: [
                { archetype: { contains: archetype.split('-')[0], mode: 'insensitive' } },
                { description: { contains: archetype.replace(/-/g, ' '), mode: 'insensitive' } },
            ],
        },
        select: { id: true, name: true, description: true, avatarUrl: true, archetype: true, viewCount: true },
        orderBy: { viewCount: 'desc' },
        take: 40,
    });

    const faqs = generateArchetypeFAQs(formatted);
    const faqSchema = generateFAQSchema(faqs);
    const breadcrumbs = generateBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Archetypes', url: '/discover' },
        { name: `Talk to ${formatted}`, url: `/talk-to/${archetype}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <nav className="text-sm mb-6 text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">Talk to {formatted}</span>
                </nav>

                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Talk to a {formatted} AI</h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Chat with AI characters who embody the {formatted} archetype. Free, immersive roleplay.
                    </p>
                </header>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">{formatted} Characters</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {characters.map((c) => (
                            <Link key={c.id} href={`/character/${c.id}`}
                                className="group block bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition">
                                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                                    {c.avatarUrl ? (
                                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">{c.name[0]}</div>
                                    )}
                                </div>
                                <h3 className="font-medium truncate">{c.name}</h3>
                                <p className="text-sm text-gray-400 truncate">{c.archetype || 'AI Character'}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">About {formatted} Characters</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="bg-gray-800/50 rounded-xl p-4">
                                <summary className="font-medium cursor-pointer">{faq.question}</summary>
                                <p className="mt-3 text-gray-400">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
