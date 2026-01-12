'use client';

import React, { useState, useEffect } from 'react';
import {
    Brain,
    Upload,
    Save,
    FileText,
    MessageSquare,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Book
} from 'lucide-react';
import { toast } from 'sonner';

interface Character {
    id: string;
    name: string;
    avatarUrl: string;
    systemPrompt: string;
}

export default function TrainingPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Training Data State
    const [knowledgeBase, setKnowledgeBase] = useState('');
    const [exampleDialogue, setExampleDialogue] = useState('');
    const [activeTab, setActiveTab] = useState<'knowledge' | 'dialogue'>('knowledge');

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const res = await fetch('/api/user/characters', {
                headers: { 'x-user-id': localStorage.getItem('agentwood_user_id') || '' }
            });
            if (res.ok) {
                const data = await res.json();
                setCharacters(data.created || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedChar) return;
        setSaving(true);

        try {
            // We append this training data to the system prompt or a dedicated memory field
            // For this implementation, we'll append to systemPrompt in a structured way
            const trainingBlock = `
\n\n[KNOWLEDGE_BASE]
${knowledgeBase}
[/KNOWLEDGE_BASE]

[EXAMPLE_DIALOGUE]
${exampleDialogue}
[/EXAMPLE_DIALOGUE]
        `;

            const res = await fetch(`/api/character/${selectedChar.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: selectedChar.systemPrompt + trainingBlock
                })
            });

            if (res.ok) {
                toast.success('Training data saved successfully!');
                setKnowledgeBase('');
                setExampleDialogue('');
            } else {
                toast.error('Failed to save training data');
            }
        } catch (error) {
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 pl-64 pt-20">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-serif italic mb-2 flex items-center gap-3">
                        <Brain className="text-purple-500" />
                        Character Training
                    </h1>
                    <p className="text-white/40">Upload knowledge and example dialogues to make your characters smarter.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Character Selector */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 h-fit">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 px-2">Select Character</h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {characters.map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => setSelectedChar(char)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${selectedChar?.id === char.id
                                        ? 'bg-purple-900/20 border-purple-500/50'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <img src={char.avatarUrl} alt={char.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="text-left overflow-hidden">
                                        <div className="font-bold truncate">{char.name}</div>
                                        <div className="text-[10px] text-white/40 truncate">Click to train</div>
                                    </div>
                                </button>
                            ))}

                            {characters.length === 0 && (
                                <div className="text-center py-8 opacity-40 text-sm">
                                    No created characters found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Training Area */}
                    <div className="md:col-span-2 space-y-6">
                        {!selectedChar ? (
                            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 h-96 flex flex-col items-center justify-center text-white/20">
                                <Brain size={48} className="mb-4 opacity-50" />
                                <p>Select a character to begin training</p>
                            </div>
                        ) : (
                            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                {/* Tabs */}
                                <div className="flex border-b border-white/5">
                                    <button
                                        onClick={() => setActiveTab('knowledge')}
                                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'knowledge' ? 'bg-white/5 text-purple-400 border-b-2 border-purple-500' : 'text-white/40 hover:text-white'
                                            }`}
                                    >
                                        <Book className="w-4 h-4" />
                                        Knowledge Base
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('dialogue')}
                                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'dialogue' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-500' : 'text-white/40 hover:text-white'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Example Dialogue
                                    </button>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'knowledge' && (
                                        <div className="space-y-4">
                                            <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 text-xs text-purple-200">
                                                <h4 className="font-bold flex items-center gap-2 mb-1"><AlertCircle className="w-3 h-3" /> Instructions</h4>
                                                Paste wikis, lore, backstories, or fact sheets here. The character will use this as long-term memory.
                                            </div>
                                            <textarea
                                                value={knowledgeBase}
                                                onChange={(e) => setKnowledgeBase(e.target.value)}
                                                placeholder="e.g. The character was born in 1895 in a small village called..."
                                                className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 resize-none font-mono"
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'dialogue' && (
                                        <div className="space-y-4">
                                            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 text-xs text-blue-200">
                                                <h4 className="font-bold flex items-center gap-2 mb-1"><AlertCircle className="w-3 h-3" /> Instructions</h4>
                                                Provide examples of how the character speaks. Use "User:" and "Char:" format.
                                            </div>
                                            <textarea
                                                value={exampleDialogue}
                                                onChange={(e) => setExampleDialogue(e.target.value)}
                                                placeholder={`User: Hello!\nChar: *grunts* What do you want?\nUser: Just saying hi.\nChar: I don't have time for pleasantries.`}
                                                className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 resize-none font-mono"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || (!knowledgeBase && !exampleDialogue)}
                                            className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                        >
                                            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                            <span>Save Training Data</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
