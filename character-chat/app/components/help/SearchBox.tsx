'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import articles from '@/data/help-articles.json';
import { cn } from '@/lib/utils';

export function SearchBox({ className }: { className?: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<typeof articles>([]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);

        if (q.length > 2) {
            const filtered = articles.filter(a =>
                a.title.toLowerCase().includes(q.toLowerCase()) ||
                a.description.toLowerCase().includes(q.toLowerCase()) ||
                a.content.toLowerCase().includes(q.toLowerCase())
            ).slice(0, 5);
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    return (
        <div className={cn("relative max-w-xl", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    placeholder="Search for answers..."
                    value={query}
                    onChange={handleSearch}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
            </div>

            {/* Results Dropdown */}
            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#151515] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {results.map(article => (
                        <Link
                            key={article.id}
                            href={`/help/${article.category}/${article.slug}`}
                            className="block p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            onClick={() => { setQuery(''); setResults([]); }}
                        >
                            <h4 className="text-sm font-semibold text-white">{article.title}</h4>
                            <p className="text-xs text-white/50 truncate">{article.description}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
