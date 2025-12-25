import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Sparkles, RefreshCw, Copy } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const PlotGeneratorPage = () => {
    const navigate = useNavigate();
    const [plot, setPlot] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genre, setGenre] = useState<string>('adventure');
    const [theme, setTheme] = useState<string>('');

    const generatePlot = async () => {
        setIsGenerating(true);
        // Simulate plot generation
        setTimeout(() => {
            const plots = {
                adventure: `Act 1: The Call to Adventure
The protagonist receives an unexpected invitation or discovers a hidden world that challenges their ordinary life. They initially resist but are drawn into the adventure by a compelling reason.

Act 2: The Journey
The protagonist faces trials, meets allies and enemies, and learns crucial skills or information. The stakes escalate as they get closer to their goal.

Act 3: The Climax
The protagonist confronts the main antagonist or challenge in a final showdown. They must use everything they've learned and overcome their greatest weakness.

Resolution: The protagonist returns changed, having grown from their experiences. The world is restored or transformed, and loose ends are tied up.`,
                mystery: `Setup: A crime or puzzle is introduced, and the protagonist is drawn into the investigation. Clues are scattered throughout, some red herrings, some genuine.

Investigation: The protagonist follows leads, interviews suspects, and pieces together evidence. Tension builds as they get closer to the truth.

Revelation: The mystery is solved, revealing the unexpected truth. The protagonist must confront the culprit and bring them to justice.

Resolution: All questions are answered, and the protagonist reflects on what they've learned.`,
                romance: `Meeting: Two characters with contrasting personalities or circumstances meet, often under unlikely circumstances. Initial attraction or conflict sparks.

Development: The relationship deepens through shared experiences, challenges, and moments of connection. External obstacles or internal conflicts test their bond.

Crisis: A misunderstanding, betrayal, or external force threatens to tear them apart. Both must confront their fears and make difficult choices.

Resolution: The couple overcomes obstacles and commits to each other, showing growth and understanding.`,
            };
            
            const selectedPlot = plots[genre as keyof typeof plots] || plots.adventure;
            setPlot(selectedPlot);
            setIsGenerating(false);
        }, 1000);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(plot);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Plot Generator - Free Story Structure Tool | AgentWrite</title>
                <meta name="description" content="Generate story plots and narrative structures for your writing projects. Free plot generator tool for writers and storytellers." />
                <link rel="canonical" href="https://agentwriteai.com/tools/plot-generator" />
            </Helmet>
            <StructuredData type="WebPage" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                            <FileText className="text-emerald-600" size={32} />
                        </div>
                        <h1 className="font-serif text-5xl text-slate-900 mb-4">Plot Generator</h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Generate story plots and narrative structures for your novels, scripts, and creative writing projects.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-8">
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Genre</label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                                >
                                    <option value="adventure">Adventure</option>
                                    <option value="mystery">Mystery</option>
                                    <option value="romance">Romance</option>
                                    <option value="fantasy">Fantasy</option>
                                    <option value="thriller">Thriller</option>
                                    <option value="drama">Drama</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Theme (Optional)</label>
                                <input
                                    type="text"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="e.g., redemption, sacrifice, love"
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <button
                            onClick={generatePlot}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> Generating Plot...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Generate Plot
                                </>
                            )}
                        </button>
                    </div>

                    {plot && (
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-2xl text-slate-900">Generated Plot Structure</h2>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition text-sm font-medium"
                                >
                                    <Copy size={16} /> Copy
                                </button>
                            </div>
                            <div className="prose max-w-none">
                                <pre className="text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">{plot}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlotGeneratorPage;





