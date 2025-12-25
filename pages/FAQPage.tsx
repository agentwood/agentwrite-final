import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const FAQ_CATEGORIES = ['All', 'Getting Started', 'Features', 'Pricing', 'Technical', 'Account'];

const FAQ_ITEMS: FAQItem[] = [
    {
        id: '1',
        question: 'What is AgentWrite?',
        answer: 'AgentWrite is an AI-powered creative suite that helps writers, content creators, and marketers turn ideas into finished content. It includes tools for generating video ideas, creating scripts, writing blog posts, and producing multimedia content like audiobooks and video trailers.',
        category: 'Getting Started',
    },
    {
        id: '2',
        question: 'How does the video idea generator work?',
        answer: 'Our AI video idea generator analyzes your industry, target audience, and video type to create unlimited creative video concepts. Simply select your industry and video type, and our AI generates tailored ideas that match your brand and marketing goals.',
        category: 'Features',
    },
    {
        id: '3',
        question: 'Can I use AgentWrite for free?',
        answer: 'Yes! AgentWrite offers a free trial with 15,000 credits. You can try all features including video idea generation, script writing, and content creation. No credit card required.',
        category: 'Pricing',
    },
    {
        id: '4',
        question: 'What makes AgentWrite different from other AI writing tools?',
        answer: 'AgentWrite is specifically designed for video marketing and content creation. Unlike generic AI writing tools, we offer specialized features like video script generation, video idea creation, and multimedia content production. We\'re also 40-50% cheaper than competitors like Jasper and Copy.ai.',
        category: 'Features',
    },
    {
        id: '5',
        question: 'How do credits work?',
        answer: 'Credits are used for AI operations like generating content, creating scripts, and producing videos. Different operations consume different amounts of credits. You can purchase additional credits or upgrade to a higher plan for more credits.',
        category: 'Pricing',
    },
    {
        id: '6',
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your subscription will remain active until the end of your current billing period.',
        category: 'Account',
    },
    {
        id: '7',
        question: 'Does AgentWrite support team collaboration?',
        answer: 'Yes! Our Business plan includes team collaboration features. You can invite team members, assign roles, collaborate on projects in real-time, and manage multiple clients from one dashboard. Perfect for content agencies and marketing teams.',
        category: 'Features',
    },
    {
        id: '8',
        question: 'What file formats can I export?',
        answer: 'You can export your content in multiple formats including PDF, DOCX, TXT, and Markdown. Video scripts can be exported in various formats suitable for production teams.',
        category: 'Technical',
    },
    {
        id: '9',
        question: 'Is my content private and secure?',
        answer: 'Absolutely. We use enterprise-grade security with SOC 2 compliance. Your content is encrypted and stored securely. We never share your content with third parties or use it to train our AI models.',
        category: 'Technical',
    },
    {
        id: '10',
        question: 'How do I get started?',
        answer: 'Getting started is easy! Simply sign up for a free account (no credit card required), and you\'ll get 15,000 credits to try all features. You can start generating video ideas, creating scripts, or writing content immediately.',
        category: 'Getting Started',
    },
    {
        id: '11',
        question: 'Can I use AgentWrite for commercial purposes?',
        answer: 'Yes! All plans allow commercial use. You can use AgentWrite to create content for clients, publish content, and use it for any commercial purpose. The content you create belongs to you.',
        category: 'Account',
    },
    {
        id: '12',
        question: 'What AI models does AgentWrite use?',
        answer: 'AgentWrite uses Google\'s Gemini AI models, including the latest Gemini 2.0 Flash and specialized models for different content types. We continuously update to use the best available AI models.',
        category: 'Technical',
    },
    {
        id: '13',
        question: 'How accurate is the AI-generated content?',
        answer: 'Our AI generates high-quality content, but we always recommend reviewing and editing the output to match your brand voice and ensure accuracy. The AI is a powerful assistant that helps you create content faster, but human oversight ensures the best results.',
        category: 'Features',
    },
    {
        id: '14',
        question: 'Do you offer refunds?',
        answer: 'We offer a 14-day money-back guarantee. If you\'re not satisfied with AgentWrite, contact us within 14 days of your purchase for a full refund.',
        category: 'Pricing',
    },
    {
        id: '15',
        question: 'Can I integrate AgentWrite with other tools?',
        answer: 'Currently, AgentWrite works as a standalone platform. We\'re working on API access and integrations with popular tools like WordPress, Notion, and Google Docs. Stay tuned for updates!',
        category: 'Technical',
    },
];

const FAQPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const filteredItems = FAQ_ITEMS.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleItem = (id: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>FAQ - Frequently Asked Questions | AgentWrite</title>
                <meta name="description" content="Find answers to common questions about AgentWrite. Learn about features, pricing, technical details, and how to get started with our AI content creation tools." />
                <meta name="keywords" content="AgentWrite FAQ, help, support, questions, video marketing tools FAQ, AI content creation FAQ" />
                <link rel="canonical" href="https://agentwoodai.com/#/faq" />
                
                <meta property="og:title" content="FAQ - Frequently Asked Questions | AgentWrite" />
                <meta property="og:description" content="Find answers to common questions about AgentWrite and our AI content creation tools." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/faq" />
            </Helmet>
            
            <StructuredData
                type="FAQPage"
                data={{
                    mainEntity: FAQ_ITEMS.map(item => ({
                        '@type': 'Question',
                        name: item.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: item.answer,
                        },
                    })),
                }}
            />
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 shadow-sm">
                            <HelpCircle size={16} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Help Center</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-6xl font-medium text-slate-900 mb-6 leading-tight">
                            Frequently Asked Questions
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Find answers to common questions about AgentWrite. Can't find what you're looking for? Contact our support team.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {FAQ_CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                                        selectedCategory === category
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-600 border border-stone-200 hover:border-slate-900'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-4 mb-12">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleItem(item.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-stone-50 transition"
                                >
                                    <h3 className="font-medium text-slate-900 pr-4 flex-1">
                                        {item.question}
                                    </h3>
                                    {openItems.has(item.id) ? (
                                        <ChevronUp size={20} className="text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openItems.has(item.id) && (
                                    <div className="px-6 pb-5 pt-0 border-t border-stone-100">
                                        <p className="text-slate-600 leading-relaxed pt-4">
                                            {item.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-500 text-lg">No questions found. Try a different search or category.</p>
                        </div>
                    )}

                    {/* Contact Support CTA */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                        <h2 className="font-serif text-3xl mb-4">Still Have Questions?</h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                            Our support team is here to help. Reach out and we'll get back to you as soon as possible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:support@agentwood.xyz"
                                className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium hover:bg-slate-100 transition"
                            >
                                Email Support
                            </a>
                            <a
                                href="https://discord.com/invite/agentwood"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 rounded-lg border-2 border-white text-white font-medium hover:bg-white hover:text-slate-900 transition"
                            >
                                Join Discord
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FAQPage;





