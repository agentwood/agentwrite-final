import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, PenTool, Video, FileText, Wand2 } from 'lucide-react';

interface Tool {
    name: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    category: string;
}

const relatedTools: Tool[] = [
    {
        name: 'Video Ideas Generator',
        description: 'Generate unlimited video ideas for your brand',
        icon: <Video size={20} />,
        link: '/video-ideas-generator',
        category: 'Video Marketing',
    },
    {
        name: 'AI Create',
        description: 'Interactive story engine with branching narratives',
        icon: <Sparkles size={20} />,
        link: '/create',
        category: 'Story Writing',
    },
    {
        name: 'Brainstorm',
        description: 'AI-powered idea generation for any topic',
        icon: <Wand2 size={20} />,
        link: '/brainstorm',
        category: 'Content Creation',
    },
    {
        name: 'Blog Generator',
        description: 'Create SEO-optimized blog posts automatically',
        icon: <FileText size={20} />,
        link: '/blog',
        category: 'Content Writing',
    },
    {
        name: 'Story Writer',
        description: 'Long-form fiction and novel writing assistant',
        icon: <BookOpen size={20} />,
        link: '/create',
        category: 'Creative Writing',
    },
    {
        name: 'Content Studio',
        description: 'Multi-format content creation dashboard',
        icon: <PenTool size={20} />,
        link: '/dashboard',
        category: 'Content Creation',
    },
];

interface RelatedToolsProps {
    currentCategory?: string;
    maxTools?: number;
}

const RelatedTools: React.FC<RelatedToolsProps> = ({
    currentCategory,
    maxTools = 3,
}) => {
    const navigate = useNavigate();

    // Filter tools by category if provided
    const filteredTools = currentCategory
        ? relatedTools.filter(tool => tool.category === currentCategory)
        : relatedTools;

    // Get random tools or all if less than max
    const displayTools = filteredTools.length <= maxTools
        ? filteredTools
        : filteredTools.sort(() => Math.random() - 0.5).slice(0, maxTools);

    if (displayTools.length === 0) return null;

    return (
        <div className="my-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-indigo-600" size={24} />
                <h3 className="font-serif text-2xl text-slate-900">
                    Related Tools You Might Like
                </h3>
            </div>
            <p className="text-slate-600 mb-6">
                Explore more AgentWrite tools to enhance your content creation workflow.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
                {displayTools.map((tool, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(tool.link)}
                        className="bg-white rounded-xl p-6 border border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition">
                                {tool.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition">
                                    {tool.name}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                    {tool.description}
                                </p>
                                <span className="text-xs text-indigo-600 font-medium">
                                    {tool.category}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2 mx-auto"
                >
                    Explore All Tools
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default RelatedTools;




