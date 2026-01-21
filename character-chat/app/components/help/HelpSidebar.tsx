'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, User, Settings, HelpCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import articles from '@/data/help-articles.json';

// Group articles by category
const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'character-creation', label: 'Character Creation', icon: User },
    { id: 'community', label: 'Community & Safety', icon: HelpCircle },
    { id: 'faq', label: 'FAQ', icon: FileText },
];

export function HelpSidebar() {
    const pathname = usePathname();

    return (
        <nav className="w-64 flex-shrink-0 border-r border-white/10 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:block">
            <div className="p-4 space-y-8">
                {categories.map((category) => {
                    const categoryArticles = articles.filter(a => a.category === category.id);
                    if (categoryArticles.length === 0) return null;

                    const Icon = category.icon;

                    return (
                        <div key={category.id}>
                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white/80">
                                <Icon className="w-4 h-4" />
                                <span>{category.label}</span>
                            </div>
                            <ul className="space-y-1">
                                {categoryArticles.map((article) => {
                                    const href = `/help/${article.category}/${article.slug}`;
                                    const isActive = pathname === href;

                                    return (
                                        <li key={article.id}>
                                            <Link
                                                href={href}
                                                className={cn(
                                                    "block px-3 py-2 text-sm rounded-lg transition-colors",
                                                    isActive
                                                        ? "bg-purple-500/10 text-purple-400 font-medium"
                                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {article.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
