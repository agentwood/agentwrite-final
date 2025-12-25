import React from 'react';
import { Check, X, Star, Zap, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Competitor {
    name: string;
    strengths: string[];
    weaknesses: string[];
    price: string;
    bestFor: string;
}

interface CompetitorComparisonProps {
    competitors?: Competitor[];
    highlightAgentWrite?: boolean;
}

const defaultCompetitors: Competitor[] = [
    {
        name: 'Sudowrite',
        strengths: ['Novel writing', 'Long-form fiction', 'Story continuation'],
        weaknesses: ['No blog posts', 'No marketing content', 'Limited formats', 'Expensive'],
        price: '$19/month',
        bestFor: 'Novel writers only',
    },
    {
        name: 'Talefy',
        strengths: ['Interactive stories', 'Game-like experience', 'Engaging format'],
        weaknesses: ['No long-form content', 'No blog posts', 'Limited to interactive', 'No marketing tools'],
        price: 'Free (limited)',
        bestFor: 'Interactive fiction only',
    },
    {
        name: 'Dipsea',
        strengths: ['Audio stories', 'Immersive experience', 'Mobile app'],
        weaknesses: ['No writing tools', 'Audio only', 'No content creation', 'Limited use cases'],
        price: '$8.99/month',
        bestFor: 'Audio content consumers',
    },
    {
        name: 'AgentWrite',
        strengths: ['Multi-format content', 'Blog posts & articles', 'Marketing copy', 'Stories & fiction', 'Affordable'],
        weaknesses: [],
        price: 'From $7/month',
        bestFor: 'Content creators & writers',
    },
];

const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({
    competitors = defaultCompetitors,
    highlightAgentWrite = true,
}) => {
    const navigate = useNavigate();

    return (
        <div className="my-12 bg-gradient-to-br from-slate-50 to-stone-50 rounded-2xl p-8 border border-stone-200">
            <div className="text-center mb-8">
                <h3 className="font-serif text-3xl text-slate-900 mb-3">
                    How AgentWrite Compares
                </h3>
                <p className="text-slate-600">
                    See how we stack up against the competition
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-stone-300">
                            <th className="text-left p-4 font-bold text-slate-900">Feature</th>
                            {competitors.map(competitor => (
                                <th
                                    key={competitor.name}
                                    className={`text-center p-4 font-bold ${
                                        competitor.name === 'AgentWrite' && highlightAgentWrite
                                            ? 'bg-amber-50 text-amber-900'
                                            : 'text-slate-700'
                                    }`}
                                >
                                    {competitor.name}
                                    {competitor.name === 'AgentWrite' && (
                                        <span className="ml-2 text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-full">
                                            Best Value
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-stone-200">
                            <td className="p-4 font-medium text-slate-700">Blog Posts & Articles</td>
                            {competitors.map(competitor => (
                                <td key={competitor.name} className="text-center p-4">
                                    {competitor.strengths.includes('Blog posts & articles') ||
                                    competitor.name === 'AgentWrite' ? (
                                        <Check className="mx-auto text-green-600" size={20} />
                                    ) : (
                                        <X className="mx-auto text-red-400" size={20} />
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr className="border-b border-stone-200 bg-stone-50/50">
                            <td className="p-4 font-medium text-slate-700">Long-Form Fiction</td>
                            {competitors.map(competitor => (
                                <td key={competitor.name} className="text-center p-4">
                                    {competitor.strengths.includes('Long-form fiction') ||
                                    competitor.strengths.includes('Novel writing') ||
                                    competitor.name === 'AgentWrite' ? (
                                        <Check className="mx-auto text-green-600" size={20} />
                                    ) : (
                                        <X className="mx-auto text-red-400" size={20} />
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr className="border-b border-stone-200">
                            <td className="p-4 font-medium text-slate-700">Marketing Content</td>
                            {competitors.map(competitor => (
                                <td key={competitor.name} className="text-center p-4">
                                    {competitor.strengths.includes('Marketing copy') ||
                                    competitor.name === 'AgentWrite' ? (
                                        <Check className="mx-auto text-green-600" size={20} />
                                    ) : (
                                        <X className="mx-auto text-red-400" size={20} />
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr className="border-b border-stone-200 bg-stone-50/50">
                            <td className="p-4 font-medium text-slate-700">Interactive Stories</td>
                            {competitors.map(competitor => (
                                <td key={competitor.name} className="text-center p-4">
                                    {competitor.strengths.includes('Interactive stories') ||
                                    competitor.name === 'AgentWrite' ? (
                                        <Check className="mx-auto text-green-600" size={20} />
                                    ) : (
                                        <X className="mx-auto text-red-400" size={20} />
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr className="border-b border-stone-200">
                            <td className="p-4 font-medium text-slate-700">Multi-Format Content</td>
                            {competitors.map(competitor => (
                                <td key={competitor.name} className="text-center p-4">
                                    {competitor.strengths.includes('Multi-format content') ||
                                    competitor.name === 'AgentWrite' ? (
                                        <Check className="mx-auto text-green-600" size={20} />
                                    ) : (
                                        <X className="mx-auto text-red-400" size={20} />
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr className="border-b-2 border-stone-300 bg-amber-50/30">
                            <td className="p-4 font-bold text-slate-900">Price</td>
                            {competitors.map(competitor => (
                                <td
                                    key={competitor.name}
                                    className={`text-center p-4 font-bold ${
                                        competitor.name === 'AgentWrite'
                                            ? 'text-amber-900'
                                            : 'text-slate-700'
                                    }`}
                                >
                                    {competitor.price}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white text-center">
                <h4 className="font-serif text-xl mb-2">Ready to Try AgentWrite?</h4>
                <p className="text-slate-300 mb-4">
                    Get all these features in one platform. Start your free trial today.
                </p>
                <button
                    onClick={() => navigate('/signup')}
                    className="bg-white text-slate-900 px-8 py-3 rounded-lg font-bold hover:bg-amber-50 transition flex items-center gap-2 mx-auto"
                >
                    <Zap size={18} />
                    Start Free Trial
                </button>
            </div>
        </div>
    );
};

export default CompetitorComparison;




