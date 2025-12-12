import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Zap, TrendingUp, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const ContentMarketingAIPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: FileText,
            title: 'Automated Blog Writing',
            description: 'Generate SEO-optimized blog posts, articles, and long-form content in minutes. Maintain your brand voice while scaling production.',
        },
        {
            icon: Zap,
            title: 'Social Media Content',
            description: 'Create engaging social media posts, captions, and threads. Generate content for Twitter, LinkedIn, Instagram, and more.',
        },
        {
            icon: TrendingUp,
            title: 'Content Strategy',
            description: 'Plan your content calendar, generate topic ideas, and create comprehensive content strategies with AI assistance.',
        },
        {
            icon: BarChart3,
            title: 'SEO Optimization',
            description: 'Automatically optimize content for search engines. Generate meta descriptions, titles, and keyword-rich content.',
        },
    ];

    const useCases = [
        {
            title: 'Content Agencies',
            description: 'Scale content production 10x. Generate blog posts, social media content, and marketing copy for multiple clients simultaneously.',
        },
        {
            title: 'Marketing Teams',
            description: 'Create consistent, on-brand content across all channels. Generate email campaigns, landing pages, and ad copy.',
        },
        {
            title: 'Solo Creators',
            description: 'Maintain a consistent publishing schedule without burning out. Generate ideas, outlines, and full articles with AI.',
        },
        {
            title: 'E-commerce Brands',
            description: 'Create product descriptions, blog content, and marketing materials at scale. Maintain brand voice across all content.',
        },
    ];

    const comparisons = [
        { tool: 'Jasper', price: '$49/mo', credits: 'Limited', ourPrice: '$7/mo', ourCredits: '15,000' },
        { tool: 'Copy.ai', price: '$49/mo', credits: 'Limited', ourPrice: '$7/mo', ourCredits: '15,000' },
        { tool: 'Writesonic', price: '$19/mo', credits: '10,000', ourPrice: '$7/mo', ourCredits: '15,000' },
    ];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>AI Content Marketing Tools - Automated Content Creation Software | AgentWrite</title>
                <meta name="description" content="Best AI content marketing tools for automated content creation. Generate blog posts, social media content, and marketing copy at scale. 40% cheaper than competitors." />
                <meta name="keywords" content="AI content marketing tools, automated content creation software, AI content marketing assistant, content automation, AI blog writing, social media content generator, marketing copy AI" />
                <link rel="canonical" href="https://agentwoodai.com/#/content-marketing-ai" />
                
                <meta property="og:title" content="AI Content Marketing Tools - Automated Content Creation Software" />
                <meta property="og:description" content="Generate blog posts, social media content, and marketing copy at scale with AI. 40% cheaper than competitors." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/content-marketing-ai" />
            </Helmet>
            
            <StructuredData
                type="SoftwareApplication"
                data={{
                    name: 'AI Content Marketing Tools',
                    applicationCategory: 'MarketingApplication',
                    description: 'Automated content creation software for blogs, social media, and marketing copy',
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
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">AI Content Marketing Platform</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            AI Content Marketing Tools<br />
                            <span className="text-slate-500">That Actually Work</span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Automate your entire content marketing workflow. Generate blog posts, social media content, and marketing copy at scale. 40% cheaper than Jasper, Copy.ai, and Writesonic.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                            >
                                Start Free Trial
                            </button>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-8 py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-medium text-lg hover:bg-slate-50 transition"
                            >
                                View Pricing
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="font-serif text-xl text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Comparison Table */}
                    <div className="mb-20">
                        <h2 className="font-serif text-4xl text-slate-900 text-center mb-12">Compare AI Content Marketing Tools</h2>
                        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Tool</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Price</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Credits</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Best For</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {comparisons.map((comp, idx) => (
                                        <tr key={idx} className="hover:bg-stone-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{comp.tool}</td>
                                            <td className="px-6 py-4 text-slate-600">{comp.price}</td>
                                            <td className="px-6 py-4 text-slate-600">{comp.credits}</td>
                                            <td className="px-6 py-4 text-slate-600">Basic content creation</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-amber-50 border-t-2 border-amber-500">
                                        <td className="px-6 py-4 font-bold text-slate-900">AgentWrite</td>
                                        <td className="px-6 py-4 font-bold text-amber-600">{comparisons[0].ourPrice}</td>
                                        <td className="px-6 py-4 font-bold text-amber-600">{comparisons[0].ourCredits}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">Complete content marketing suite</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className="mb-20">
                        <h2 className="font-serif text-4xl text-slate-900 text-center mb-12">Perfect for</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {useCases.map((useCase, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-6 border border-stone-200 flex items-start gap-4">
                                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-2">{useCase.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{useCase.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                        <h2 className="font-serif text-4xl mb-4">Ready to Scale Your Content Marketing?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of marketers using AgentWrite to create better content faster. Start your free trial today.
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

export default ContentMarketingAIPage;

