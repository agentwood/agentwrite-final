import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const CharacterNameGeneratorPage = () => {
    const navigate = useNavigate();
    const [names, setNames] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gender, setGender] = useState<'any' | 'male' | 'female'>('any');
    const [genre, setGenre] = useState<string>('fantasy');

    const generateNames = async () => {
        setIsGenerating(true);
        // Simulate name generation
        const sampleNames = {
            fantasy: ['Aeliana Shadowweaver', 'Thorin Ironforge', 'Lyra Moonwhisper', 'Kaelen Starfire', 'Seraphina Nightshade'],
            modern: ['Alex Morgan', 'Jordan Taylor', 'Casey Rivers', 'Riley Chen', 'Morgan Blake'],
            historical: ['Eleanor Blackwood', 'William Ashworth', 'Charlotte Fairfax', 'Henry Blackstone', 'Victoria Sterling'],
        };
        
        setTimeout(() => {
            const genreNames = sampleNames[genre as keyof typeof sampleNames] || sampleNames.fantasy;
            setNames(genreNames);
            setIsGenerating(false);
        }, 500);
    };

    const copyToClipboard = (name: string) => {
        navigator.clipboard.writeText(name);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Character Name Generator - Free AI Tool | AgentWrite</title>
                <meta name="description" content="Generate unique character names for your stories, novels, and creative writing projects. Free AI-powered character name generator." />
                <link rel="canonical" href="https://agentwriteai.com/tools/character-name-generator" />
            </Helmet>
            <StructuredData type="WebPage" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <Sparkles className="text-indigo-600" size={32} />
                        </div>
                        <h1 className="font-serif text-5xl text-slate-900 mb-4">Character Name Generator</h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Generate unique, memorable character names for your stories, novels, and creative writing projects.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-8">
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Genre</label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                                >
                                    <option value="fantasy">Fantasy</option>
                                    <option value="modern">Modern</option>
                                    <option value="historical">Historical</option>
                                    <option value="sci-fi">Sci-Fi</option>
                                    <option value="mystery">Mystery</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as any)}
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                                >
                                    <option value="any">Any</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generateNames}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Generate Names
                                </>
                            )}
                        </button>
                    </div>

                    {names.length > 0 && (
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
                            <h2 className="font-serif text-2xl text-slate-900 mb-6">Generated Names</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {names.map((name, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 hover:border-indigo-300 transition"
                                    >
                                        <span className="font-medium text-slate-900">{name}</span>
                                        <button
                                            onClick={() => copyToClipboard(name)}
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

export default CharacterNameGeneratorPage;




