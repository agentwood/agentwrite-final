'use client';

import React, { useState, useEffect } from 'react';
import {
    Brain,
    Upload,
    Save,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Database,
    ChevronRight,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SubscriptionModal } from '@/app/components/master/SubscriptionModal';

interface Character {
    id: string;
    name: string;
    avatarUrl: string;
    systemPrompt: string;
}

export default function TrainingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPro, setIsPro] = useState(false); // Gating state

    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    // Synaptic Tuning State
    const [behavioral, setBehavioral] = useState({
        empathyLogic: 50, // 0 = Empathy, 100 = Logic
        agreeableChallenging: 50 // 0 = Agreeable, 100 = Challenging
    });

    const [stylistic, setStylistic] = useState({
        conciseVerbose: 50, // 0 = Concise, 100 = Verbose
        casualFormal: 50 // 0 = Casual, 100 = Formal
    });

    const [constraints, setConstraints] = useState({
        refuseEmotional: false,
        avoidSlang: false,
        noSpeculation: false, // "Never speculate without evidence"
        limitLength: false,
        periodCharacter: false,
        rejectFlirtation: false
    });

    const checkSubscription = async () => {
        try {
            const res = await fetch('/api/user/subscription');
            if (res.ok) {
                const data = await res.json();
                setIsPro(data.status === 'active' || data.status === 'pro'); // Robust check
            } else {
                setIsPro(false);
            }
        } catch (e) {
            console.error("Sub check failed", e);
            setIsPro(false);
        }
    };

    const fetchCharacters = async () => {
        try {
            const res = await fetch('/api/user/characters');
            if (res.ok) {
                const data = await res.json();
                setCharacters(data.created || []);
                if (data.created && data.created.length > 0) setSelectedChar(data.created[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            Promise.all([checkSubscription(), fetchCharacters()]).finally(() => {
                setLoading(false);
            });
        }
    }, [status, router]);

    const handleSave = async () => {
        if (!isPro) {
            setShowSubscriptionModal(true);
            return;
        }

        if (!selectedChar) {
            toast.error('Please select a character first.');
            return;
        }
        setSaving(true);

        try {
            // 1. Strip existing tuning blocks from the prompt to prevent accumulation
            const basePrompt = selectedChar.systemPrompt ? selectedChar.systemPrompt.split('[SYNAPTIC_TUNING]')[0].trim() : '';

            // 2. Construct new tuning block
            const tuningBlock = `
[SYNAPTIC_TUNING]
Behavioral_EmpathyLogic: ${behavioral.empathyLogic}/100
Behavioral_AgreeableChallenging: ${behavioral.agreeableChallenging}/100
Stylistic_ConciseVerbose: ${stylistic.conciseVerbose}/100
Stylistic_CasualFormal: ${stylistic.casualFormal}/100
Constraints_RefuseEmotional: ${constraints.refuseEmotional}
Constraints_AvoidSlang: ${constraints.avoidSlang}
Constraints_NoSpeculation: ${constraints.noSpeculation}
Constraints_LimitLength: ${constraints.limitLength}
Constraints_PeriodCharacter: ${constraints.periodCharacter}
Constraints_RejectFlirtation: ${constraints.rejectFlirtation}
[/SYNAPTIC_TUNING]`;

            const fullPrompt = `${basePrompt}\n\n${tuningBlock}`;

            const res = await fetch(`/api/character/${selectedChar.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: fullPrompt
                })
            });

            if (res.ok) {
                toast.success('Synaptic tuning parameters saved.');
                // Update local state so if they save again, basePrompt calculation is correct
                setSelectedChar({ ...selectedChar, systemPrompt: fullPrompt });
            } else {
                toast.error('Failed to save tuning.');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#0f0f0f] text-white"><Loader2 className="animate-spin" /></div>;

    // Removed the full-screen lock. Now we allow view/edit, but gate the save action.

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 md:pl-72 pt-24 font-sans selection:bg-purple-500/30">
            {/* Pro Badge if not pro */}
            {!isPro && (
                <div className="fixed top-24 right-6 z-40">
                    <button onClick={() => setShowSubscriptionModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                        <Lock size={12} /> Upgrade to Pro
                    </button>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <header className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Secure Environment
                        </div>
                        <h1 className="text-5xl font-serif italic text-white mb-2">Synaptic Tuning</h1>
                        <p className="text-white/40 font-light flex items-center gap-2">
                            Archetype: <span className="text-white font-medium">{selectedChar ? selectedChar.name : 'Select Character'}</span>
                        </p>
                    </div>

                    {/* Character Dropdown / Selector (Simplified) */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-full hover:border-white/30 transition-all">
                            {selectedChar ? (
                                <>
                                    <img src={selectedChar.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                                    <span className="text-sm font-bold">{selectedChar.name}</span>
                                </>
                            ) : (
                                <span className="text-sm text-white/50">Select Character</span>
                            )}
                            <ChevronRight className="w-4 h-4 opacity-50 rotate-90" />
                        </button>
                        {/* Dropdown Content */}
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hidden group-hover:block z-50 shadow-2xl max-h-64 overflow-y-auto">
                            {characters.length > 0 ? characters.map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => setSelectedChar(char)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                >
                                    <img src={char.avatarUrl} className="w-6 h-6 rounded-full object-cover opacity-70" />
                                    <span className="text-sm text-white/70">{char.name}</span>
                                </button>
                            )) : (
                                <div className="px-4 py-3 text-sm text-white/30 text-center italic">No characters found</div>
                            )}
                            <button
                                onClick={() => router.push('/create')}
                                className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white/50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <Plus size={12} /> Create New
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedChar}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
                    >
                        {!isPro && <Lock size={12} className="text-purple-600" />}
                        {saving ? 'Saving...' : 'Save Parameters'}
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Behavioral Training */}
                    <section className="space-y-8 animate-fade-in">
                        <h3 className="text-xl font-serif italic text-white/50 border-b border-white/5 pb-2">Behavioral Training</h3>

                        {/* Empathy vs Logic */}
                        <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                                <span>Empathy</span>
                                <span className="text-white/60">{behavioral.empathyLogic}%</span>
                                <span>Logic</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={behavioral.empathyLogic}
                                onChange={(e) => setBehavioral({ ...behavioral, empathyLogic: parseInt(e.target.value) })}
                                className="w-full appearance-none bg-white/10 h-[2px] rounded-full accent-white cursor-pointer hover:accent-purple-400 transition-colors"
                            />
                        </div>

                        {/* Agreeable vs Challenging */}
                        <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                                <span>Agreeable</span>
                                <span className="text-white/60">{behavioral.agreeableChallenging}%</span>
                                <span>Challenging</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={behavioral.agreeableChallenging}
                                onChange={(e) => setBehavioral({ ...behavioral, agreeableChallenging: parseInt(e.target.value) })}
                                className="w-full appearance-none bg-white/10 h-[2px] rounded-full accent-white cursor-pointer hover:accent-purple-400 transition-colors"
                            />
                        </div>
                    </section>

                    {/* Stylistic Training */}
                    <section className="space-y-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-xl font-serif italic text-white/50 border-b border-white/5 pb-2">Stylistic Training</h3>

                        {/* Concise vs Verbose */}
                        <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                                <span>Concise</span>
                                <span className="text-white/60">{stylistic.conciseVerbose}%</span>
                                <span>Verbose</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={stylistic.conciseVerbose}
                                onChange={(e) => setStylistic({ ...stylistic, conciseVerbose: parseInt(e.target.value) })}
                                className="w-full appearance-none bg-white/10 h-[2px] rounded-full accent-white cursor-pointer hover:accent-blue-400 transition-colors"
                            />
                        </div>

                        {/* Casual vs Formal */}
                        <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                                <span>Casual</span>
                                <span className="text-white/60">{stylistic.casualFormal}%</span>
                                <span>Formal</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={stylistic.casualFormal}
                                onChange={(e) => setStylistic({ ...stylistic, casualFormal: parseInt(e.target.value) })}
                                className="w-full appearance-none bg-white/10 h-[2px] rounded-full accent-white cursor-pointer hover:accent-blue-400 transition-colors"
                            />
                        </div>
                    </section>
                </div>

                {/* Constraint Training */}
                <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-2">
                        <h3 className="text-xl font-serif italic text-white/50">Constraint Training</h3>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">(Hard Limits)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { key: 'refuseEmotional', label: 'Refuse emotional reassurance' },
                            { key: 'avoidSlang', label: 'Avoid modern slang' },
                            { key: 'noSpeculation', label: 'Never speculate without evidence' },
                            { key: 'limitLength', label: 'Limit response length' },
                            { key: 'periodCharacter', label: 'Stay in period character' },
                            { key: 'rejectFlirtation', label: 'Reject flirtation' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setConstraints(c => ({ ...c, [item.key]: !c[item.key as keyof typeof constraints] }))}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${constraints[item.key as keyof typeof constraints]
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[#151515] border-white/5 text-white/60 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${constraints[item.key as keyof typeof constraints] ? 'border-black bg-black text-white' : 'border-white/30'}`}>
                                    {constraints[item.key as keyof typeof constraints] && <CheckCircle2 size={10} />}
                                </div>
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Domain Knowledge */}
                <section className="animate-fade-in pb-20" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-xl font-serif italic text-white/50 border-b border-white/5 pb-2 mb-6">Domain Knowledge</h3>

                    <div className="bg-[#151515] border border-white/5 border-dashed rounded-3xl h-48 flex items-center justify-center flex-col gap-4 group hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Database className="text-white/40 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-white font-bold mb-1">Upload Knowledge Base</h4>
                            <p className="text-white/30 text-xs">PDF, TXT, or JSON. Max 50MB.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Subscription Modal for gating save action */}
            <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
        </div>
    );
}
