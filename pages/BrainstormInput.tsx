
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, Loader2, Layout, History, Clock, Trash2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { CATEGORIES } from '../constants';
import ProTip from '../components/ProTip';
import { BrainstormRequest, BrainstormHistoryItem } from '../types';
import { generateBrainstormIdeas } from '../services/geminiService';

const BrainstormInput = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const categoryId = pathname.split('/').pop();
  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [examples, setExamples] = useState<string[]>(['', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // History State
  const [history, setHistory] = useState<BrainstormHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('agentwrite_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (req: BrainstormRequest) => {
    const newItem: BrainstormHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      categoryLabel: category.label,
      request: req
    };

    // Prepend new item, keep max 10
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('agentwrite_history', JSON.stringify(updated));
  };

  const loadFromHistory = (item: BrainstormHistoryItem) => {
    setPrompt(item.request.prompt);
    setContext(item.request.context);
    setExamples(item.request.examples.length > 0 ? item.request.examples : ['', '']);
  };
  
  const clearHistory = () => {
      if(confirm('Clear all recent prompts?')) {
          setHistory([]);
          localStorage.removeItem('agentwrite_history');
      }
  };

  const handleAddExample = () => {
    setExamples([...examples, '']);
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const request: BrainstormRequest = {
        category: category.label,
        prompt,
        context,
        examples: examples.filter(e => e.trim() !== '')
      };
      
      // Save to local storage
      saveToHistory(request);

      const response = await generateBrainstormIdeas(request);
      navigate('/results', { state: { response, category: category.label, request } });
    } catch (e) {
      alert("Failed to generate ideas. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 md:py-12 px-4 bg-stone-50">
      <Navigation />
        {/* Navigation Header */}
        <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
            <button 
                onClick={() => navigate('/brainstorm')} 
                className="text-slate-500 hover:text-slate-900 transition flex items-center gap-2 text-sm font-medium bg-white px-3 py-2 rounded border border-stone-200 shadow-sm"
            >
                <ArrowLeft size={18} /> Back to Categories
            </button>
            
            <button 
                onClick={() => navigate('/dashboard')} 
                className="text-slate-700 hover:text-slate-900 text-sm font-bold flex items-center gap-2 bg-white px-4 py-2 rounded border border-stone-200 shadow-sm hover:shadow-md transition"
             >
                <Layout size={16} /> Dashboard
            </button>
        </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left Sidebar: Tips & History */}
        <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
            <ProTip />

            <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-slate-900 flex items-center gap-2 text-sm">
                        <History size={16} className="text-slate-400" /> Recent Prompts
                    </h3>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="text-slate-400 hover:text-rose-500 transition">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No recent history</p>
                ) : (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="p-3 rounded bg-stone-50 border border-stone-100 hover:border-amber-200 hover:bg-amber-50 cursor-pointer transition group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-600">{item.categoryLabel}</span>
                                    <span className="text-[10px] text-slate-300"><Clock size={10} className="inline mr-1"/>{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-700 line-clamp-2 font-medium leading-relaxed">
                                    "{item.request.prompt}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Main Content: Form */}
        <div className="flex-1 w-full bg-white p-6 md:p-10 rounded-xl border border-stone-200 shadow-sm order-1 lg:order-2">
          <div className="mb-8 border-b border-stone-100 pb-6">
            <h1 className="font-serif text-3xl text-slate-900 mb-2">Input Parameters</h1>
            <p className="text-slate-500 text-sm font-light">Configure the model for {category.label.toLowerCase()} generation.</p>
          </div>

          <div className="space-y-8">
            <div className="group relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Primary Query
              </label>
              <div className="relative">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={category.placeholder}
                    className="w-full p-4 rounded border border-stone-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-lg text-slate-800 placeholder-slate-300 bg-stone-50"
                    autoFocus
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Context
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Provide background information..."
                  className="w-full p-3 rounded border border-stone-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all h-40 resize-none text-slate-700 text-sm bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Stylistic Examples
                </label>
                <div className="space-y-3">
                  {examples.map((ex, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={ex}
                      onChange={(e) => handleExampleChange(idx, e.target.value)}
                      placeholder={idx === 0 ? "Example 1..." : "Example 2..."}
                      className="w-full p-2.5 rounded border border-stone-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm text-slate-700 bg-stone-50"
                    />
                  ))}
                  <button 
                    onClick={handleAddExample}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <Plus size={12} />
                    Add Example
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className={`
                    px-8 py-4 rounded-lg font-medium text-white text-sm shadow-sm flex items-center gap-2
                    transition-all
                    ${!prompt.trim() || isGenerating ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 transform hover:-translate-y-0.5'}
                `}
              >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" size={16} /> Processing...
                    </>
                ) : (
                    <>
                        Generate Ideas <Sparkles size={16} />
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrainstormInput;
