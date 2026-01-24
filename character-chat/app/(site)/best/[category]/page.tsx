/**
 * Best [Category] Characters - Programmatic SEO Page
 * 
 * Listicle page targeting "best [category] ai characters" searches
 */

import { Metadata } from 'next';
import { db } from '@/lib/db';
import {
    generateFAQSchema,
    generateCategoryFAQs,
    generateCollectionSchema,
    generateBreadcrumbs,
    generateCharacterListSchema,
} from '@/lib/seo/structured-data';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

// Pre-defined categories
const CATEGORIES = [
    'fantasy', 'romance', 'anime', 'horror', 'sci-fi', 'action', 'drama',
    'comedy', 'mystery', 'thriller', 'adventure', 'supernatural', 'slice-of-life',
    'historical', 'modern', 'futuristic', 'dystopian', 'utopian',
    'nsfw', 'sfw', 'wholesome', 'dark', 'fluffy', 'angst',
    'male', 'female', 'non-binary', 'genderfluid',
];

export async function generateStaticParams() {
    return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const formatted = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const title = `Best ${formatted} AI Characters to Chat With | Top ${formatted} Characters | Agentwood`;
    const description = `Discover the best ${formatted} AI characters on Agentwood. Chat with top-rated ${formatted} personalities for free roleplay, companionship, and immersive conversations.`;

    return {
        title,
        description,
        keywords: [
            `best ${category} ai characters`, `top ${category} characters`,
            `${category} ai chat`, `${category} roleplay`, 'character ai',
        ],
        openGraph: { title, description, url: `${SITE_URL}/best/${category}` },
        alternates: { canonical: `${SITE_URL}/best/${category}` },
    };
}

export default async function BestCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const formatted = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Get top characters in this category
    const characters = await db.personaTemplate.findMany({
        where: {
            OR: [
                { category: { contains: category.split('-')[0], mode: 'insensitive' } },
                { description: { contains: category.replace(/-/g, ' '), mode: 'insensitive' } },
            ],
        },
        select: {
            id: true, name: true, description: true, avatarUrl: true,
            category: true, archetype: true, viewCount: true, interactionCount: true,
        },
        orderBy: [{ interactionCount: 'desc' }, { viewCount: 'desc' }],
        take: 25,
    });

    const faqs = generateCategoryFAQs(formatted, characters.length);
    const faqSchema = generateFAQSchema(faqs);
    const collectionSchema = generateCollectionSchema(
        `Best ${formatted} AI Characters`,
        `Top-rated ${formatted} characters for AI chat`,
        characters.length,
        `/best/${category}`
    );
    const breadcrumbs = generateBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Categories', url: '/discover' },
        { name: `Best ${formatted}`, url: `/best/${category}` },
    ]);
    const listSchema = generateCharacterListSchema(
        characters.map(c => ({
            id: c.id,
            name: c.name,
            url: `/character/${c.id}`,
            description: c.description || undefined,
            image: c.avatarUrl || undefined,
        }))
    );

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <nav className="text-sm mb-6 text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/discover" className="hover:text-primary">Categories</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">Best {formatted}</span>
                </nav>

                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Best {formatted} AI Characters
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Top-rated {formatted} characters ranked by community votes and engagement.
                        Chat with the best for free!
                    </p>
                </header>

                {/* Ranked List */}
                <section className="mb-16">
                    <div className="space-y-4">
                        {characters.map((c, index) => (
                            <Link key={c.id} href={`/character/${c.id}`}
                                className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition group">
                                <div className="text-2xl font-bold text-gray-500 w-8">#{index + 1}</div>
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                    {c.avatarUrl ? (
                                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">{c.name[0]}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-semibold text-lg group-hover:text-primary transition">{c.name}</h2>
                                    <p className="text-sm text-gray-400 truncate">{c.description || c.archetype || 'AI Character'}</p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <div>💬 {c.interactionCount || 0}</div>
                                    <div>👁️ {c.viewCount || 0}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">FAQs about {formatted} Characters</h2>
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
