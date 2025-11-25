
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Sparkles, Layout } from 'lucide-react';
import { BrainstormResponse, BrainstormRequest } from '../types';

const BrainstormResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { response, category } = location.state as { response: BrainstormResponse; category: string; request: BrainstormRequest } || {};
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!response) {
        navigate('/brainstorm');
    }
  }, [response, navigate]);

  if (!response) return null;

  const handleCopy = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
       <div className="max-w-4xl mx-auto">
         {/* Navigation Header */}
         <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => navigate(-1)} 
                className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 text-sm bg-white px-3 py-2 rounded border border-stone-200 shadow-sm transition"
            >
                <ArrowLeft size={18} /> Back to Parameters
            </button>

            <div className="flex items-center gap-4">
                <div className="bg-white border border-stone-200 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {category}
                </div>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="text-slate-700 hover:text-slate-900 text-sm font-bold flex items-center gap-2 bg-white px-4 py-2 rounded border border-stone-200 shadow-sm hover:shadow-md transition"
                >
                    <Layout size={16} /> Dashboard
                </button>
            </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-slate-50 p-8 border-b border-stone-200">
                <h2 className="font-serif text-2xl text-slate-900 flex items-center gap-3">
                    <Sparkles size={20} className="text-amber-600" /> 
                    Generated Concepts
                </h2>
            </div>
            <div className="divide-y divide-stone-100">
                {response.ideas.map((idea, idx) => (
                    <div key={idx} className="p-8 hover:bg-stone-50 transition flex gap-6 group">
                        <div className="flex-shrink-0 w-6 h-6 bg-stone-200 text-slate-500 rounded flex items-center justify-center font-mono text-xs">
                            {idx + 1}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-serif font-bold text-slate-900 mb-2 text-lg">{idea.title}</h3>
                            <p className="text-slate-600 leading-relaxed font-light">{idea.description}</p>
                        </div>
                        <button 
                            onClick={() => handleCopy(`${idea.title}: ${idea.description}`, idx)}
                            className="self-start text-slate-300 hover:text-slate-900 transition opacity-0 group-hover:opacity-100"
                            title="Copy to clipboard"
                        >
                            {copiedIndex === idx ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-8 bg-stone-50 flex justify-center border-t border-stone-200">
                <button 
                    onClick={() => navigate(-1)}
                    className="text-slate-900 font-medium hover:bg-white border border-transparent hover:border-stone-200 hover:shadow-sm px-6 py-3 rounded transition flex items-center gap-2 text-sm"
                >
                    <RefreshCw size={16} /> Regenerate
                </button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default BrainstormResults;
