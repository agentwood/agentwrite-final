import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Video, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const VideoIdeasPage = () => {
    const navigate = useNavigate();
    const [industry, setIndustry] = useState('');
    const [videoType, setVideoType] = useState('');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate AI generation - replace with actual API call
        setTimeout(() => {
            setIdeas([
                "Behind-the-scenes: Show your team creating the product",
                "Customer testimonial: Real user success stories",
                "Tutorial: How to use your product in 60 seconds",
                "Product demo: Key features walkthrough",
                "Brand story: Company mission and values",
            ]);
            setIsGenerating(false);
        }, 2000);
    };

    const industries = ['Technology', 'Fashion', 'Food & Beverage', 'Fitness', 'Education', 'Finance', 'Healthcare', 'Real Estate'];
    const videoTypes = ['Product Demo', 'Tutorial', 'Testimonial', 'Behind Scenes', 'Brand Story', 'Educational', 'Entertainment'];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Video Ideas Generator for Brands - AI Video Marketing Tool | AgentWrite</title>
                <meta name="description" content="Generate unlimited video ideas for brands with AI. Free video idea generator for social media, YouTube, and marketing campaigns. Get creative video concepts instantly." />
                <meta name="keywords" content="video ideas for brands, video idea generator, social media video ideas generator, YouTube video ideas AI, marketing video concepts, video content ideas for business, brand video ideas, AI video ideas generator" />
                <link rel="canonical" href="https://agentwoodai.com/#/video-ideas-generator" />
                
                <meta property="og:title" content="Video Ideas Generator for Brands - AI Video Marketing Tool" />
                <meta property="og:description" content="Generate unlimited video ideas for brands with AI. Free video idea generator for social media and marketing campaigns." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/video-ideas-generator" />
            </Helmet>
            
            <StructuredData
                type="SoftwareApplication"
                data={{
                    name: 'Video Ideas Generator',
                    applicationCategory: 'MarketingApplication',
                    description: 'AI-powered video idea generator for brands and content creators',
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
                            <Lightbulb size={16} className="text-amber-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Free Video Ideas Generator</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            Generate Video Ideas for Brands<br />
                            <span className="text-slate-500">Instantly with AI</span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Never run out of video content ideas. Our AI video idea generator creates unlimited creative concepts for your brand, social media, and marketing campaigns.
                        </p>
                    </div>

                    {/* Generator Tool */}
                    <div className="max-w-4xl mx-auto mb-20">
                        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-lg">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    >
                                        <option value="">Select Industry</option>
                                        {industries.map(ind => (
                                            <option key={ind} value={ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Video Type</label>
                                    <select
                                        value={videoType}
                                        onChange={(e) => setVideoType(e.target.value)}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    >
                                        <option value="">Select Video Type</option>
                                        {videoTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleGenerate}
                                disabled={!industry || !videoType || isGenerating}
                                className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>Generating Ideas...</>
                                ) : (
                                    <>
                                        <Sparkles size={20} /> Generate Video Ideas
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results */}
                        {ideas.length > 0 && (
                            <div className="mt-8 bg-white rounded-3xl p-8 border border-stone-200 shadow-lg">
                                <h2 className="font-serif text-2xl text-slate-900 mb-6">Your Video Ideas</h2>
                                <div className="space-y-4">
                                    {ideas.map((idea, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                                            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-1" />
                                            <p className="text-slate-700 flex-1">{idea}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIdeas([])}
                                    className="mt-6 text-slate-600 hover:text-slate-900 text-sm font-medium"
                                >
                                    Generate More Ideas →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Benefits Section */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-white rounded-2xl p-6 border border-stone-200">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="font-serif text-xl text-slate-900 mb-2">AI-Powered Ideas</h3>
                            <p className="text-slate-600 text-sm">Generate unlimited creative video concepts tailored to your brand and industry.</p>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 border border-stone-200">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                <Video size={24} />
                            </div>
                            <h3 className="font-serif text-xl text-slate-900 mb-2">All Video Types</h3>
                            <p className="text-slate-600 text-sm">Get ideas for tutorials, demos, testimonials, brand stories, and more.</p>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 border border-stone-200">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <Lightbulb size={24} />
                            </div>
                            <h3 className="font-serif text-xl text-slate-900 mb-2">Instant Results</h3>
                            <p className="text-slate-600 text-sm">No more creative blocks. Get video ideas in seconds, not hours.</p>
                        </div>
                    </div>

                    {/* CTA Section */}
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

export default VideoIdeasPage;

