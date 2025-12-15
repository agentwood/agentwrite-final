import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Sparkles, RefreshCw, Copy } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const StoryGeneratorPage = () => {
    const navigate = useNavigate();
    const [story, setStory] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState<string>('');

    const generateStory = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        // Simulate story generation
        setTimeout(() => {
            setStory(`Once upon a time, in a world where ${prompt}, there lived a character who would change everything. The story begins with a mysterious discovery that would set in motion a series of events beyond anyone's imagination.

The protagonist, driven by curiosity and determination, embarks on a journey that will test their limits and reveal hidden truths about themselves and the world around them. Along the way, they encounter allies and adversaries, each with their own motivations and secrets.

As the plot unfolds, the stakes rise higher, and the protagonist must make difficult choices that will determine not only their fate but the fate of those they care about. The climax approaches, bringing with it revelations that will reshape everything they thought they knew.

In the end, the story reaches its resolution, leaving the reader with a sense of completion and perhaps a hint of what might come next.`);
            setIsGenerating(false);
        }, 1500);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(story);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>AI Story Plot Generator - Free Creative Writing Tool | AgentWrite</title>
                <meta name="description" content="Generate creative story plots and ideas with AI. Free story generator tool for writers, novelists, and content creators." />
                <link rel="canonical" href="https://agentwriteai.com/tools/story-generator" />
            </Helmet>
            <StructuredData type="WebPage" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <BookOpen className="text-purple-600" size={32} />
                        </div>
                        <h1 className="font-serif text-5xl text-slate-900 mb-4">AI Story Plot Generator</h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Generate creative story plots, ideas, and narratives with AI. Perfect for writers, novelists, and content creators.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-8">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Story Prompt or Theme</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., a detective solving mysteries in a cyberpunk future"
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-purple-500 focus:outline-none transition resize-none"
                            />
                        </div>

                        <button
                            onClick={generateStory}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> Generating Story...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Generate Story Plot
                                </>
                            )}
                        </button>
                    </div>

                    {story && (
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-2xl text-slate-900">Generated Story</h2>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition text-sm font-medium"
                                >
                                    <Copy size={16} /> Copy
                                </button>
                            </div>
                            <div className="prose max-w-none">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{story}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default StoryGeneratorPage;

