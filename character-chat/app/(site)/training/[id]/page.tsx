'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Upload, Database, Plus, Lock } from 'lucide-react';
import { getSubscriptionStatus } from '@/lib/subscription';

interface TrainingConfig {
    id: string;
    name: string;
    archetype: string;
    avatarUrl: string;
    behaviorEmpathy: number;
    behaviorAgreeable: number;
    behaviorChaos: number;
    behaviorPessimism: number;
    styleVerbosity: number;
    styleFormality: number;
    trainingConstraints: string[];
    personalityTags: string[];
    trainingStatus: string;
}

const CONSTRAINTS = [
    { id: 'refuse_emotional', label: 'Refuse emotional reassurance' },
    { id: 'avoid_slang', label: 'Avoid modern slang' },
    { id: 'no_speculation', label: 'Never speculate without evidence' },
    { id: 'limit_length', label: 'Limit response length' },
    { id: 'period_character', label: 'Stay in period character' },
    { id: 'reject_flirtation', label: 'Reject flirtation' },
];

const PERSONALITY_TAGS = [
    'Stoic', 'Playful', 'Dark', 'Optimistic', 'Sarcastic', 'Polite', 'Mysterious', 'Energetic'
];

function TrainingSlider({
    leftLabel,
    rightLabel,
    value,
    onChange,
}: {
    leftLabel: string;
    rightLabel: string;
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider font-medium">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing"
                />
            </div>
        </div>
    );
}

export default function SynapticTuningPage() {
    const params = useParams();
    const router = useRouter();
    const characterId = params.id as string;

    const [config, setConfig] = useState<TrainingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // Slider states
    const [empathy, setEmpathy] = useState(50);
    const [agreeable, setAgreeable] = useState(50);
    const [chaos, setChaos] = useState(50);
    const [pessimism, setPessimism] = useState(50);
    const [verbosity, setVerbosity] = useState(50);
    const [formality, setFormality] = useState(50);
    const [constraints, setConstraints] = useState<string[]>([]);
    const [personalityTags, setPersonalityTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    // Check PRO subscription
    useEffect(() => {
        getSubscriptionStatus(null).then(status => {
            setIsPro(status.planId === 'pro' || status.planId === 'enterprise');
            setCheckingAccess(false);
        });
    }, []);

    useEffect(() => {
        if (!isPro && !checkingAccess) return;

        fetch(`/api/training/${characterId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConfig(data.config);
                    setEmpathy(data.config.behaviorEmpathy ?? 50);
                    setAgreeable(data.config.behaviorAgreeable ?? 50);
                    setChaos(data.config.behaviorChaos ?? 50);
                    setPessimism(data.config.behaviorPessimism ?? 50);
                    setVerbosity(data.config.styleVerbosity ?? 50);
                    setFormality(data.config.styleFormality ?? 50);
                    setConstraints(data.config.trainingConstraints || []);
                    setPersonalityTags(data.config.personalityTags || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [characterId, isPro, checkingAccess]);

    const toggleConstraint = (id: string) => {
        setConstraints(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const togglePersonalityTag = (tag: string) => {
        setPersonalityTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const addCustomTag = () => {
        if (customTag.trim() && !personalityTags.includes(customTag.trim())) {
            setPersonalityTags(prev => [...prev, customTag.trim()]);
            setCustomTag('');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await fetch(`/api/training/${characterId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                behaviorEmpathy: empathy,
                behaviorAgreeable: agreeable,
                behaviorChaos: chaos,
                behaviorPessimism: pessimism,
                styleVerbosity: verbosity,
                styleFormality: formality,
                trainingConstraints: constraints,
                personalityTags: personalityTags,
            }),
        });
        setSaving(false);
    };

    if (checkingAccess || loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // PRO-only gate
    if (!isPro) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Lock size={40} className="text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-serif italic text-white">Training & Data</h1>
                    <p className="text-white/50">
                        Character training is a PRO-exclusive feature. Upgrade to customize your characters' personalities, behaviors, and constraints.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Upgrade to PRO
                    </Link>
                    <Link href="/home" className="block text-white/40 text-sm hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-lg">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/training" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-white/60" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-serif italic text-[#c4a574]">Training & Data</h1>
                            <div className="flex items-center gap-2 text-xs text-[#b8956c]">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                SECURE ENVIRONMENT
                            </div>
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex gap-2">
                        <div className="w-8 h-1 bg-white/20 rounded-full" />
                        <div className="w-8 h-1 bg-white rounded-full" />
                        <div className="w-8 h-1 bg-white/20 rounded-full" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Training Panels - Two Columns */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {/* Behavioral Training */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-serif italic text-[#c4a574]">Behavioral Training</h3>
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-8">
                            <TrainingSlider
                                leftLabel="EMPATHY"
                                rightLabel="LOGIC"
                                value={empathy}
                                onChange={setEmpathy}
                            />
                            <TrainingSlider
                                leftLabel="AGREEABLE"
                                rightLabel="CHALLENGING"
                                value={agreeable}
                                onChange={setAgreeable}
                            />
                            <TrainingSlider
                                leftLabel="CHAOS"
                                rightLabel="ORDER"
                                value={chaos}
                                onChange={setChaos}
                            />
                            <TrainingSlider
                                leftLabel="PESSIMISM"
                                rightLabel="OPTIMISM"
                                value={pessimism}
                                onChange={setPessimism}
                            />
                        </div>
                    </div>

                    {/* Stylistic Training + Personality Matrix */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-serif italic text-[#c4a574]">Stylistic Training</h3>
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-8">
                            <TrainingSlider
                                leftLabel="CONCISE"
                                rightLabel="VERBOSE"
                                value={verbosity}
                                onChange={setVerbosity}
                            />
                            <TrainingSlider
                                leftLabel="CASUAL"
                                rightLabel="FORMAL"
                                value={formality}
                                onChange={setFormality}
                            />
                        </div>

                        {/* Personality Matrix */}
                        <h3 className="text-lg font-serif italic text-[#c4a574] mt-8">Personality Matrix</h3>
                        <div className="flex flex-wrap gap-2">
                            {PERSONALITY_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => togglePersonalityTag(tag)}
                                    className={`px-4 py-2 rounded-full text-sm border transition-all ${personalityTags.includes(tag)
                                            ? 'bg-white/10 border-white/30 text-white'
                                            : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                                        }`}
                                >
                                    <span className="mr-1.5 opacity-50">◇</span>
                                    {tag}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    const tag = prompt('Enter custom personality tag:');
                                    if (tag && tag.trim()) {
                                        setPersonalityTags(prev => [...prev, tag.trim()]);
                                    }
                                }}
                                className="px-4 py-2 rounded-full text-sm border border-dashed border-white/20 text-white/40 hover:border-white/30 hover:text-white/60 transition-all flex items-center gap-1"
                            >
                                <Plus size={14} />
                                Add Custom
                            </button>
                        </div>
                    </div>
                </div>

                {/* Constraint Training */}
                <div className="mb-10">
                    <h3 className="text-lg font-serif italic text-[#c4a574] mb-1">
                        Constraint Training{' '}
                        <span className="text-red-400 font-sans text-xs">(Hard Limits)</span>
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                        {CONSTRAINTS.map((constraint) => (
                            <button
                                key={constraint.id}
                                onClick={() => toggleConstraint(constraint.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${constraints.includes(constraint.id)
                                        ? 'bg-white/5 border-white/20'
                                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${constraints.includes(constraint.id)
                                            ? 'bg-white border-white'
                                            : 'border-white/30'
                                        }`}
                                >
                                    {constraints.includes(constraint.id) && (
                                        <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm text-white/70">{constraint.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Domain Knowledge */}
                <div className="mb-10">
                    <h3 className="text-lg font-serif italic text-[#c4a574] mb-4">Domain Knowledge</h3>
                    <div className="bg-white/[0.02] border border-white/10 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Database size={24} className="text-white/40" />
                        </div>
                        <p className="text-white font-medium mb-1">Upload Knowledge Base</p>
                        <p className="text-xs text-white/40">PDF, TXT, or JSON. Max 50MB.</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.push(`/training/${characterId}/simulate`)}
                        className="px-8 py-3 border border-white/20 rounded-full text-sm font-semibold hover:bg-white/5 transition-colors"
                    >
                        INITIATE SIMULATION
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </main>
        </div>
    );
}
