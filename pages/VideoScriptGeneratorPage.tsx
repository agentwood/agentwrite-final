import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Sparkles, Play, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const VideoScriptGeneratorPage = () => {
    const navigate = useNavigate();
    const [scriptType, setScriptType] = useState('');
    const [topic, setTopic] = useState('');
    const [generatedScript, setGeneratedScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const scriptTypes = [
        'Product Demo',
        'Tutorial',
        'Testimonial',
        'Brand Story',
        'Social Media Ad',
        'YouTube Video',
        'Explainer Video',
        'Promotional Video',
    ];

    const handleGenerate = async () => {
        if (!scriptType || !topic) return;
        setIsGenerating(true);
        // Simulate AI generation - replace with actual API call
        setTimeout(() => {
            setGeneratedScript(`[SCENE 1: OPENING]
[Visual: Dynamic shot of ${topic}]
[Narrator]: "Have you ever wondered about ${topic}? Today, we're diving deep into everything you need to know."

[SCENE 2: MAIN CONTENT]
[Visual: Product/service demonstration]
[Narrator]: "Here's what makes ${topic} special..."

[SCENE 3: CALL TO ACTION]
[Visual: Clear CTA screen]
[Narrator]: "Ready to get started? [Your CTA here]"

[END]`);
            setIsGenerating(false);
        }, 2000);
    };

    const features = [
        {
            icon: FileText,
            title: 'Multiple Formats',
            description: 'Generate scripts for YouTube, social media, ads, tutorials, and more. Choose the format that fits your needs.',
        },
        {
            icon: Sparkles,
            title: 'AI-Powered',
            description: 'Our AI understands video structure, pacing, and engagement. Create scripts that keep viewers watching.',
        },
        {
            icon: Play,
            title: 'Video-Ready',
            description: 'Scripts include scene descriptions, visual cues, and timing. Ready to shoot immediately.',
        },
    ];

    const examples = [
        {
            type: 'Product Demo',
            script: '[Opening hook] → [Problem statement] → [Product introduction] → [Key features] → [Social proof] → [CTA]',
        },
        {
            type: 'Tutorial',
            script: '[Introduction] → [Step 1 with visuals] → [Step 2 with visuals] → [Step 3 with visuals] → [Summary] → [CTA]',
        },
        {
            type: 'Brand Story',
            script: '[Emotional hook] → [Origin story] → [Values and mission] → [Impact] → [Call to action]',
        },
    ];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Video Script Generator AI - Create Video Scripts Instantly | AgentWrite</title>
                <meta name="description" content="Free AI video script generator. Create professional video scripts for YouTube, social media, ads, and tutorials in minutes. No credit card required." />
                <meta name="keywords" content="video script generator AI, AI video script writer, automated video script writing, YouTube script generator, social media video script, video script AI tool" />
                <link rel="canonical" href="https://agentwoodai.com/#/video-script-generator" />
                
                <meta property="og:title" content="Video Script Generator AI - Create Video Scripts Instantly" />
                <meta property="og:description" content="Generate professional video scripts for YouTube, social media, and marketing campaigns with AI." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/video-script-generator" />
            </Helmet>
            
            <StructuredData
                type="SoftwareApplication"
                data={{
                    name: 'Video Script Generator AI',
                    applicationCategory: 'ContentCreationApplication',
                    description: 'AI-powered video script generator for YouTube, social media, and marketing videos',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                }}
            />
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 shadow-sm">
                            <FileText size={16} className="text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Free Video Script Generator</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            Video Script Generator AI<br />
                            <span className="text-slate-500">Create Scripts in Minutes</span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Generate professional video scripts for YouTube, social media, ads, and tutorials. Our AI understands video structure and creates engaging scripts that keep viewers watching.
                        </p>
                    </div>

                    {/* Generator Tool */}
                    <div className="max-w-4xl mx-auto mb-20">
                        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-lg">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Script Type</label>
                                    <select
                                        value={scriptType}
                                        onChange={(e) => setScriptType(e.target.value)}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    >
                                        <option value="">Select Script Type</option>
                                        {scriptTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Topic/Product</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g., New fitness app, Product launch"
                                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleGenerate}
                                disabled={!scriptType || !topic || isGenerating}
                                className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>Generating Script...</>
                                ) : (
                                    <>
                                        <Sparkles size={20} /> Generate Video Script
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Generated Script */}
                        {generatedScript && (
                            <div className="mt-8 bg-white rounded-3xl p-8 border border-stone-200 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-serif text-2xl text-slate-900">Your Video Script</h2>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedScript);
                                            alert('Script copied to clipboard!');
                                        }}
                                        className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                                    >
                                        Copy Script
                                    </button>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                                    <pre className="whitespace-pre-wrap text-slate-700 font-mono text-sm leading-relaxed">
                                        {generatedScript}
                                    </pre>
                                </div>
                                <button
                                    onClick={() => setGeneratedScript('')}
                                    className="mt-4 text-slate-600 hover:text-slate-900 text-sm font-medium"
                                >
                                    Generate New Script →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="font-serif text-xl text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Examples */}
                    <div className="mb-20">
                        <h2 className="font-serif text-4xl text-slate-900 text-center mb-12">Script Templates</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {examples.map((example, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-6 border border-stone-200">
                                    <h3 className="font-bold text-slate-900 mb-3">{example.type}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed font-mono">{example.script}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                        <h2 className="font-serif text-4xl mb-4">Ready to Create Amazing Videos?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Use AgentWrite to generate video scripts, create content, and automate your entire video marketing workflow.
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-100 transition shadow-xl flex items-center gap-2 mx-auto"
                        >
                            Start Free Trial <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VideoScriptGeneratorPage;




