import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { remark } from 'remark';
import html from 'remark-html';
import articles from '@/data/help-articles.json';

// Separate this logic if possible, but simpler to inline for now
async function getArticleContent(content: string) {
    const processedContent = await remark()
        .use(html)
        .process(content);
    return processedContent.toString();
}

interface PageProps {
    params: Promise<{
        category: string;
        slug: string;
    }>
}

// Generate static params for SSG
export async function generateStaticParams() {
    return articles.map((article) => ({
        category: article.category,
        slug: article.slug,
    }));
}

export default async function ArticlePage({ params }: PageProps) {
    // Await params in Next.js 15+ (if applicable, but 16 supports sync params usually? No, params is async in latest canary. Standard app router it's prop).
    // Safely handling params
    const { category, slug } = await params;

    const article = articles.find(a => a.category === category && a.slug === slug);

    if (!article) {
        notFound();
    }

    const contentHtml = await getArticleContent(article.content);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
                <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="capitalize">{category.replace('-', ' ')}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white truncate">{article.title}</span>
            </div>

            <article className="prose prose-invert prose-purple max-w-none">
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
                <p className="text-xl text-white/60 mb-8 leading-relaxed">{article.description}</p>

                <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
            </article>

            {/* Feedback / Next steps (Optional) */}
            <div className="mt-16 pt-8 border-t border-white/10">
                <p className="text-center text-white/40 text-sm">
                    Did this article help? <Link href="/contact" className="text-purple-400 hover:underline">Contact Support</Link>
                </p>
            </div>
        </div>
    );
}
