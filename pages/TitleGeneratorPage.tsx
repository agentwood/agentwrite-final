import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Book, Sparkles, RefreshCw, Copy } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const TitleGeneratorPage = () => {
    const navigate = useNavigate();
    const [titles, setTitles] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genre, setGenre] = useState<string>('fiction');
    const [keywords, setKeywords] = useState<string>('');

    const generateTitles = async () => {
        setIsGenerating(true);
        // Simulate title generation
        const sampleTitles = {
            fiction: ['The Last Echo', 'Shadows of Tomorrow', 'Whispers in the Dark', 'The Forgotten Path', 'Echoes of Yesterday'],
            mystery: ['The Hidden Truth', 'Secrets Unveiled', 'The Missing Piece', 'Behind Closed Doors', 'The Final Clue'],
            romance: ['Hearts Entwined', 'Love\'s Promise', 'Forever Yours', 'The Heart\'s Desire', 'Bound by Love'],
            fantasy: ['Realm of Shadows', 'The Crystal Prophecy', 'Dragons\' Legacy', 'The Enchanted Quest', 'Magic\'s Awakening'],
        };
        
        setTimeout(() => {
            const genreTitles = sampleTitles[genre as keyof typeof sampleTitles] || sampleTitles.fiction;
            const generated = keywords 
                ? genreTitles.map(title => `${keywords}: ${title}`)
                : genreTitles;
            setTitles(generated);
            setIsGenerating(false);
        }, 500);
    };

    const copyToClipboard = (title: string) => {
        navigator.clipboard.writeText(title);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Book Title Generator - Free AI Tool | AgentWrite</title>
                <meta name="description" content="Generate creative book titles for your novels, stories, and writing projects. Free AI-powered title generator tool." />
                <link rel="canonical" href="https://agentwriteai.com/tools/title-generator" />
            </Helmet>
            <StructuredData type="WebPage" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                            <Book className="text-amber-600" size={32} />
                        </div>
                        <h1 className="font-serif text-5xl text-slate-900 mb-4">Book Title Generator</h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Generate creative, compelling book titles for your novels, stories, and writing projects.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-8">
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Genre</label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-500 focus:outline-none transition"
                                >
                                    <option value="fiction">Fiction</option>
                                    <option value="mystery">Mystery</option>
                                    <option value="romance">Romance</option>
                                    <option value="fantasy">Fantasy</option>
                                    <option value="sci-fi">Sci-Fi</option>
                                    <option value="thriller">Thriller</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Keywords (Optional)</label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., love, adventure, mystery"
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-500 focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <button
                            onClick={generateTitles}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Generate Titles
                                </>
                            )}
                        </button>
                    </div>

                    {titles.length > 0 && (
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
                            <h2 className="font-serif text-2xl text-slate-900 mb-6">Generated Titles</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {titles.map((title, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 hover:border-amber-300 transition"
                                    >
                                        <span className="font-medium text-slate-900">{title}</span>
                                        <button
                                            onClick={() => copyToClipboard(title)}
                                            className="p-2 hover:bg-stone-200 rounded-lg transition"
                                            title="Copy to clipboard"
                                        >
                                            <Copy size={16} className="text-slate-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TitleGeneratorPage;




