import Link from 'next/link';
import { SearchBox } from '@/app/components/help/SearchBox';
import { Book, User, Settings, ArrowRight, HelpCircle } from 'lucide-react';
import articles from '@/data/help-articles.json';

// Utility to get featured (recent) articles
const featuredArticles = articles.slice(0, 3);

const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Book, desc: 'New to Agentwood? Start here.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'character-creation', label: 'Character Creation', icon: User, desc: 'Guides on archetypes, voices, and advanced definition.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'community', label: 'Community & Safety', icon: HelpCircle, desc: 'Guidelines, safety policy, and user tips.', color: 'text-green-400', bg: 'bg-green-500/10' },
];

export default function HelpPage() {
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    How can we help you?
                </h1>
                <p className="text-white/60 max-w-2xl mx-auto text-lg">
                    Find guides, tutorials, and answers to all your questions about Agentwood.
                </p>
                <div className="flex justify-center">
                    <SearchBox className="w-full" />
                </div>
            </section>

            {/* Categories Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-4`}>
                            <cat.icon className={`w-6 h-6 ${cat.color}`} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{cat.label}</h3>
                        <p className="text-white/50 text-sm mb-4">{cat.desc}</p>
                        <div className="space-y-2">
                            {articles.filter(a => a.category === cat.id).slice(0, 3).map(article => (
                                <Link
                                    key={article.id}
                                    href={`/help/${article.category}/${article.slug}`}
                                    className="flex items-center text-sm text-white/70 hover:text-white group"
                                >
                                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                                    {article.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* Featured/Popular Questions */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredArticles.map(article => (
                        <Link
                            key={article.id}
                            href={`/help/${article.category}/${article.slug}`}
                            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors flex justify-between items-center group"
                        >
                            <div>
                                <h4 className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">{article.title}</h4>
                                <p className="text-xs text-white/50">{article.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
