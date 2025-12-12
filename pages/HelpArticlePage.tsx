import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Home } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StructuredData from '../components/StructuredData';

// Help article content (in a real app, this would come from a CMS or database)
const helpArticles: Record<string, {
    title: string;
    category: string;
    content: string;
    related: string[];
}> = {
    'getting-started-first-story': {
        title: 'How to create your first story',
        category: 'Getting Started',
        content: `
# How to Create Your First Story

Welcome to AgentWrite! This guide will walk you through creating your first story using our AI-powered writing tools.

## Step 1: Navigate to AI Create

Click on "AI Create" in the navigation menu or go to the dashboard. This is where you'll build interactive stories.

## Step 2: Choose Your Story Type

Select whether you want to create:
- An interactive story (choose-your-own-adventure style)
- A traditional narrative
- A blog post or article

## Step 3: Set Up Your Story

Enter your story concept, genre, and any specific requirements. The AI will help you build from there.

## Step 4: Start Writing

Use the AI Create interface to generate scenes, characters, and plot points. You can edit and refine as you go.

## Next Steps

- Learn about the [Studio editor](/help/writing-tools-studio)
- Explore [Brainstorm Engine](/help/writing-tools-brainstorm)
- Check out [AI features](/help/ai-features-create)
        `,
        related: ['writing-tools-studio', 'ai-features-create', 'getting-started-ai-create']
    },
    'account-credits': {
        title: 'Understanding credits and usage',
        category: 'Account & Billing',
        content: `
# Understanding Credits and Usage

Credits are the currency that powers AgentWrite's AI features. Here's everything you need to know.

## What Are Credits?

Credits are used when you:
- Generate text with AI
- Create outlines
- Generate images
- Create audio content
- Use Brainstorm Engine

## Credit Costs

Different features use different amounts of credits:
- Text generation: ~100-500 credits per request
- Outlines: ~200-800 credits
- Images: ~1000 credits
- Audio: ~2000 credits

## Managing Your Credits

- View your balance in the dashboard
- Upgrade your plan for more credits
- Credits reset monthly on your billing date

## Need More Credits?

Upgrade to a higher plan or purchase additional credits in your account settings.
        `,
        related: ['account-upgrade', 'account-billing']
    },
    'ai-features-create': {
        title: 'How AI Create works',
        category: 'AI Features',
        content: `
# How AI Create Works

AI Create is AgentWrite's interactive story generation tool. Here's how it works.

## The Process

1. **Concept Input**: You provide a story concept, genre, and style
2. **AI Generation**: Our AI generates scenes, characters, and plot points
3. **Interactive Choices**: You make choices that shape the story
4. **Refinement**: Edit and refine the generated content

## Key Features

- **Scene Generation**: Create scenes instantly
- **Character Development**: AI helps develop characters
- **Plot Branching**: Create multiple story paths
- **Media Generation**: Add images and audio

## Tips for Best Results

- Be specific with your prompts
- Use the refine feature to improve output
- Experiment with different genres
- Save your work frequently
        `,
        related: ['ai-features-prompts', 'ai-features-media']
    },
    'writing-tools-export': {
        title: 'Exporting your work',
        category: 'Writing Tools',
        content: `
# Exporting Your Work

Learn how to export your stories and content from AgentWrite.

## Export Formats

You can export your work in multiple formats:
- **PDF**: For printing or sharing
- **DOCX**: For Microsoft Word
- **TXT**: Plain text format
- **Markdown**: For web publishing

## How to Export

1. Open your project in the Studio
2. Click the "Export" button in the toolbar
3. Choose your desired format
4. Download your file

## Export Options

- Include formatting
- Export with images
- Include metadata
- Custom page settings (PDF only)
        `,
        related: ['writing-tools-studio']
    }
};

const HelpArticlePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    
    const article = slug ? helpArticles[slug] : null;

    if (!article) {
        return (
            <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
                <Navigation />
                <main className="pt-32 pb-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-serif text-4xl text-slate-900 mb-4">Article Not Found</h1>
                        <p className="text-slate-600 mb-8">The help article you're looking for doesn't exist.</p>
                        <button
                            onClick={() => navigate('/help')}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                            Back to Help Center
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>{article.title} - AgentWrite Help</title>
                <meta name="description" content={`${article.title} - ${article.category} guide for AgentWrite`} />
                <link rel="canonical" href={`https://help.agentwriteai.com/${slug}`} />
            </Helmet>
            <StructuredData type="Article" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                        <button onClick={() => navigate('/help')} className="hover:text-slate-900 transition">
                            Help
                        </button>
                        <span>/</span>
                        <span>{article.category}</span>
                        <span>/</span>
                        <span className="text-slate-900">{article.title}</span>
                    </nav>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/help')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Help Center</span>
                    </button>

                    {/* Article Header */}
                    <div className="mb-8">
                        <span className="text-xs font-medium text-indigo-600 mb-2 block">{article.category}</span>
                        <h1 className="font-serif text-4xl text-slate-900 mb-4">{article.title}</h1>
                    </div>

                    {/* Article Content */}
                    <article className="prose prose-slate max-w-none bg-white rounded-xl border border-stone-200 p-8 mb-12">
                        <div 
                            className="markdown-content text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                                __html: article.content
                                    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-serif text-slate-900 mb-4 mt-8">$1</h1>')
                                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-serif text-slate-900 mb-3 mt-6">$1</h2>')
                                    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 mb-2 mt-4">$1</h3>')
                                    .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                    .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-2">$1</li>')
                                    .replace(/\n/g, '<br />')
                            }} 
                        />
                    </article>

                    {/* Related Articles */}
                    {article.related.length > 0 && (
                        <div className="border-t border-stone-200 pt-8">
                            <h2 className="font-serif text-2xl text-slate-900 mb-6">Related Articles</h2>
                            <div className="space-y-3">
                                {article.related.map((relatedSlug, index) => {
                                    const related = helpArticles[relatedSlug];
                                    if (!related) return null;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => navigate(`/help/${relatedSlug}`)}
                                            className="w-full text-left p-4 bg-white rounded-lg border border-stone-200 hover:border-indigo-300 hover:shadow transition-all"
                                        >
                                            <span className="text-xs font-medium text-indigo-600 mb-1 block">{related.category}</span>
                                            <h3 className="font-bold text-slate-900">{related.title}</h3>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Help Footer */}
                    <div className="mt-12 p-6 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                        <p className="text-slate-600 mb-4">Was this article helpful?</p>
                        <div className="flex justify-center gap-4">
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Yes, thanks!
                            </button>
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Not really
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HelpArticlePage;

