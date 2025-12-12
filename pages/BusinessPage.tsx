import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Users, Shield, Zap, BarChart3, Headphones } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const BusinessPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Invite team members, assign roles, and collaborate on projects in real-time. Perfect for content teams, agencies, and publishing houses.'
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'SOC 2 compliant with advanced security features, SSO, and dedicated account management for peace of mind.'
        },
        {
            icon: Zap,
            title: 'Custom AI Models',
            description: 'Train custom AI models on your brand voice and style guidelines. Maintain consistency across all content.'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Track team usage, content performance, and ROI with detailed analytics and reporting dashboards.'
        },
        {
            icon: Headphones,
            title: 'Priority Support',
            description: '24/7 priority support with dedicated account managers and custom onboarding for your team.'
        }
    ];

    const useCases = [
        {
            title: 'Content Agencies',
            description: 'Scale content production 10x with AI-powered writing tools. Manage multiple clients and projects from one dashboard.'
        },
        {
            title: 'Publishing Houses',
            description: 'Streamline manuscript development from outline to final draft. Collaborate with authors and editors seamlessly.'
        },
        {
            title: 'Marketing Teams',
            description: 'Generate blog posts, social media content, and marketing copy at scale while maintaining brand voice.'
        },
        {
            title: 'Educational Institutions',
            description: 'Help students and faculty create better content with AI assistance. Institutional licensing available.'
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans flex flex-col">
            <Helmet>
                <title>Business Plans - AI Video Marketing Tools for Teams | AgentWrite</title>
                <meta name="description" content="Enterprise AI video marketing tools and content creation software for teams. Team collaboration, custom AI models, and priority support. Start free trial." />
                <meta name="keywords" content="AI video marketing tools for business, enterprise content creation software, team video marketing tools, business video content generator" />
                <link rel="canonical" href="https://agentwoodai.com/#/business" />
            </Helmet>
            <Navigation />
            
            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 shadow-sm">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">For Teams & Organizations</span>
                        </div>
                        
                        <h1 className="font-serif text-6xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            Write at scale.<br />
                            <span className="text-slate-500">Together.</span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            AgentWrite Business helps teams create better content faster. With collaboration tools, enterprise security, and custom AI models tailored to your brand.
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
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="font-serif text-2xl text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
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
                        <h2 className="font-serif text-4xl mb-4">Ready to scale your content?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join teams from leading agencies, publishers, and enterprises who trust AgentWrite.
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-100 transition shadow-xl"
                        >
                            Start Free Trial
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

export default BusinessPage;

