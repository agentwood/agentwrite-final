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
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            checkSubscription();
            fetchCharacters();
        }
    }, [status]);

    const checkSubscription = async () => {
        // Mock check or real API check
        try {
            // Ideally we check real subscription status here
            // For now, let's assume if they can access they might be pro, or we fetch
            const res = await fetch('/api/user/subscription');
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'pro') setIsPro(true);
                else setIsPro(false);
            } else {
                // Fallback for demo: Check local storage or default false
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
                // Select first character by default if available
                if (data.created && data.created.length > 0) setSelectedChar(data.created[0]);
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
            // Construct a tuning block
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
[/SYNAPTIC_TUNING]
            `;

            const res = await fetch(`/api/character/${selectedChar.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: selectedChar.systemPrompt + tuningBlock
                })
            });

            if (res.ok) {
                toast.success('Synaptic tuning parameters saved.');
            } else {
                toast.error('Failed to save tuning.');
            }
        } catch (error) {
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#0f0f0f] text-white"><Loader2 className="animate-spin" /></div>;

    if (!isPro) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0f0f] text-white p-6 md:ml-64 relative overflow-hidden">
                {/* Visual Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f0f] to-[#0f0f0f]" />

                <div className="relative z-10 max-w-md text-center space-y-6 bg-[#1a1a1a] p-10 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20 text-purple-400">
                        <Lock size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif italic mb-2">Pro Feature Locked</h2>
                        <p className="text-white/40">
                            Synaptic Tuning and advanced character analytics are available exclusively for <span className="text-white font-bold">Agentwood Pro</span> members.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/plus')}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-purple-500/20"
                    >
                        Upgrade to Agentwood Pro
                    </button>
                    <p className="text-xs text-white/20">Cancel anytime. 14-day money-back guarantee.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 md:pl-72 pt-24 font-sans selection:bg-purple-500/30">
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
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hidden group-hover:block z-50 shadow-2xl">
                            {characters.map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => setSelectedChar(char)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                >
                                    <img src={char.avatarUrl} className="w-6 h-6 rounded-full object-cover opacity-70" />
                                    <span className="text-sm text-white/70">{char.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedChar}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        {saving ? 'Initiating...' : 'Initiate Simulation'}
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
        </div>
    );
}
