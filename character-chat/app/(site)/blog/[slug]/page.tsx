import { getPostData, getAllPostSlugs } from '@/lib/blog/service';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { generateBlogMetadata } from '@/lib/seo/metadata';
import BlogEngagement from '@/app/components/BlogEngagement';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getPostData(resolvedParams.slug);

    if (!post) {
        return {};
    }

    return generateBlogMetadata(post);
}

export async function generateStaticParams() {
    const slugs = await getAllPostSlugs();
    return slugs.map(slug => ({ slug }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const postData = await getPostData(resolvedParams.slug);

    if (!postData) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0c0f16] text-white">
            <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-12 transition-colors"
                >
                    ← Back to Blog
                </Link>

                <article className="animate-fade-in">
                    <header className="mb-12">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {postData.tags.map(tag => (
                                <span key={tag} className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                            {postData.title}
                        </h1>
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                                {postData.author.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-white">{postData.author}</span>
                                <span className="text-sm">
                                    {new Date(postData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="relative h-[400px] w-full mb-12 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <img
                            src={postData.image}
                            alt={postData.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div
                        className="prose prose-invert prose-purple max-w-none prose-lg
              prose-headings:font-black prose-headings:tracking-tight
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:italic
              prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-blockquote:border-purple-500
              prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
                        dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                    />
                </article>

                {/* Likes and Comments */}
                <BlogEngagement slug={resolvedParams.slug} />

                <div className="mt-24 pt-12 border-t border-white/10">
                    <h3 className="text-2xl font-bold mb-8">Share this article</h3>
                    <div className="flex gap-4">
                        <button className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors border border-white/5">
                            Twitter
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors border border-white/5">
                            LinkedIn
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors border border-white/5">
                            Copy Link
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

