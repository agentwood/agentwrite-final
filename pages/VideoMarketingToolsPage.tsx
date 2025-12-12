import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Video, Zap, BarChart3, CheckCircle2, ArrowRight, Play, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const VideoMarketingToolsPage = () => {
    const navigate = useNavigate();

    const tools = [
        {
            icon: Video,
            title: 'Video Idea Generator',
            description: 'Generate unlimited creative video concepts for your brand. Never run out of content ideas.',
            link: '/video-ideas-generator',
        },
        {
            icon: Zap,
            title: 'Video Script Generator',
            description: 'Create professional video scripts for YouTube, social media, and marketing campaigns.',
            link: '/video-script-generator',
        },
        {
            icon: Play,
            title: 'Video Content Creator',
            description: 'Generate complete video content from scripts. AI-powered video production.',
            link: '/create',
        },
        {
            icon: BarChart3,
            title: 'Video Analytics',
            description: 'Track video performance, engagement, and ROI. Optimize your video marketing strategy.',
            link: '/dashboard',
        },
    ];

    const benefits = [
        {
            title: 'Save Time',
            description: 'Generate video ideas and scripts in minutes instead of hours. Focus on production, not planning.',
        },
        {
            title: 'Scale Production',
            description: 'Create unlimited video content without proportional increases in time and resources.',
        },
        {
            title: 'Improve Quality',
            description: 'AI-powered tools ensure consistent quality and brand voice across all video content.',
        },
        {
            title: 'Reduce Costs',
            description: 'Eliminate the need for expensive scriptwriters and content strategists. Do it all with AI.',
        },
    ];

    const comparisons = [
        {
            feature: 'Video Idea Generation',
            competitors: 'Limited or manual',
            agentwrite: 'Unlimited AI-generated ideas',
        },
        {
            feature: 'Video Script Writing',
            competitors: 'Basic templates',
            agentwrite: 'Custom AI scripts for any format',
        },
        {
            feature: 'Video Production',
            competitors: 'Not included',
            agentwrite: 'AI video generation included',
        },
        {
            feature: 'Pricing',
            competitors: '$49-99/month',
            agentwrite: 'From $7/month',
        },
    ];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>AI Video Marketing Tools - Complete Video Marketing Platform | AgentWrite</title>
                <meta name="description" content="Best AI video marketing tools for brands. Generate video ideas, create scripts, and produce videos with AI. Complete video marketing platform. Start free trial." />
                <meta name="keywords" content="AI video marketing tools, video marketing automation, video content creation AI, brand video generator, video marketing platform, automated video marketing" />
                <link rel="canonical" href="https://agentwoodai.com/#/video-marketing-tools" />
                
                <meta property="og:title" content="AI Video Marketing Tools - Complete Video Marketing Platform" />
                <meta property="og:description" content="Generate video ideas, create scripts, and produce videos with AI. The complete video marketing solution." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/video-marketing-tools" />
            </Helmet>
            
            <StructuredData
                type="SoftwareApplication"
                data={{
                    name: 'AI Video Marketing Tools',
                    applicationCategory: 'MarketingApplication',
                    description: 'Complete AI-powered video marketing platform with idea generation, script writing, and video production',
                    offers: {
                        '@type': 'Offer',
                        price: '7',
                        priceCurrency: 'USD',
                    },
                }}
            />
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 shadow-sm">
                            <Video size={16} className="text-purple-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Complete Video Marketing Suite</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            AI Video Marketing Tools<br />
                            <span className="text-slate-500">That Actually Work</span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            The only platform that combines video idea generation, script writing, and AI video production. Everything you need for video marketing in one place.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                            >
                                Start Free Trial
                            </button>
                            <button
                                onClick={() => navigate('/video-ideas-generator')}
                                className="px-8 py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-medium text-lg hover:bg-slate-50 transition"
                            >
                                Try Video Ideas Generator
                            </button>
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {tools.map((tool, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(tool.link)}
                                className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition">
                                    <tool.icon size={24} />
                                </div>
                                <h3 className="font-serif text-xl text-slate-900 mb-2 group-hover:text-purple-600 transition">
                                    {tool.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    {tool.description}
                                </p>
                                <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                                    Try it <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Benefits */}
                    <div className="mb-20">
                        <h2 className="font-serif text-4xl text-slate-900 text-center mb-12">Why Choose AgentWrite?</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-6 border border-stone-200">
                                    <CheckCircle2 className="text-green-600 mb-3" size={24} />
                                    <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="mb-20">
                        <h2 className="font-serif text-4xl text-slate-900 text-center mb-12">AgentWrite vs Competitors</h2>
                        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Feature</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Competitors</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">AgentWrite</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {comparisons.map((comp, idx) => (
                                        <tr key={idx} className="hover:bg-stone-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{comp.feature}</td>
                                            <td className="px-6 py-4 text-slate-600">{comp.competitors}</td>
                                            <td className="px-6 py-4 font-bold text-green-600">{comp.agentwrite}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                        <h2 className="font-serif text-4xl mb-4">Ready to Transform Your Video Marketing?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of brands using AgentWrite to create better video content faster. Start your free trial today.
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-100 transition shadow-xl flex items-center gap-2 mx-auto"
                        >
                            Start Free Trial <ArrowRight size={20} />
                        </button>
                        <p className="text-sm text-slate-400 mt-4">
                            No credit card required • 14-day free trial • Cancel anytime
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VideoMarketingToolsPage;

