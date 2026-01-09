'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Send, Info } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface TrainingConfig {
    name: string;
    archetype: string;
    trainingConstraints: string[];
}

const CONSTRAINT_LABELS: Record<string, string> = {
    refuse_emotional: 'Refuse Comfort',
    avoid_slang: 'No Slang',
    no_speculation: 'Evidence Only',
    limit_length: 'Brief',
    period_character: 'Period',
    reject_flirtation: 'No Flirt',
};

const GUIDED_SESSIONS = [
    '"Correct this flawed argument"',
    '"Explain this concept coldly"',
];

export default function SimulationPage() {
    const params = useParams();
    const characterId = params.id as string;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [config, setConfig] = useState<TrainingConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetch(`/api/training/${characterId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConfig(data.config);
                    // Initial AI greeting
                    setMessages([{
                        role: 'assistant',
                        content: 'Systems online. My neural pathways are malleable. How shall I be shaped today?'
                    }]);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [characterId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setSending(true);

        try {
            const res = await fetch(`/api/training/${characterId}/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await res.json();
            if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            }
        } catch (error) {
            console.error('Simulation error:', error);
        }
        setSending(false);
    };

    const handleLockModel = async () => {
        await fetch(`/api/training/${characterId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trainingStatus: 'trained' }),
        });
        alert('Model locked and saved!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-lg">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/training/${characterId}`} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
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
                        <div className="w-8 h-1 bg-white/20 rounded-full" />
                        <div className="w-8 h-1 bg-white rounded-full" />
                    </div>
                </div>
            </header>

            {/* Main Content - Split Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel - Live Parameters */}
                <aside className="w-80 border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
                    {/* Live Parameters Card */}
                    <div className="bg-[#1a1512] border border-[#3d3528] rounded-2xl p-5">
                        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Live Parameters</h3>

                        {/* Archetype */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                                <Info size={12} />
                                ARCHETYPE
                            </div>
                            <p className="text-lg font-medium">{config?.archetype || 'Political Mastermind'}</p>
                        </div>

                        {/* Active Constraints */}
                        <div>
                            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                                <Info size={12} />
                                ACTIVE CONSTRAINTS
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(config?.trainingConstraints || []).map(c => (
                                    <span
                                        key={c}
                                        className="px-2 py-1 text-xs bg-red-900/30 text-red-400 border border-red-800/50 rounded"
                                    >
                                        {CONSTRAINT_LABELS[c] || c}
                                    </span>
                                ))}
                                {(!config?.trainingConstraints || config.trainingConstraints.length === 0) && (
                                    <span className="text-xs text-white/30">No constraints active</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guided Sessions */}
                    <div>
                        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Guided Sessions</h3>
                        <div className="space-y-2">
                            {GUIDED_SESSIONS.map((session, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(session.replace(/"/g, ''))}
                                    className="flex items-center gap-2 w-full text-left text-sm text-green-400 hover:text-green-300 transition-colors"
                                >
                                    <span className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center text-[10px]">✓</span>
                                    {session}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save & Lock Button */}
                    <button
                        onClick={handleLockModel}
                        className="mt-auto w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        SAVE & LOCK MODEL
                    </button>
                </aside>

                {/* Right Panel - Simulation Chat */}
                <div className="flex-1 flex flex-col">
                    {/* Simulation Mode Header */}
                    <div className="px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs text-white/40 uppercase tracking-wider">Simulation Mode</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`${msg.role === 'assistant'
                                        ? 'bg-white/5 border border-white/10'
                                        : 'bg-transparent'
                                    } rounded-xl p-4 max-w-2xl ${msg.role === 'user' ? 'ml-auto' : ''}`}
                            >
                                <p className="text-sm text-white/80 leading-relaxed font-mono">
                                    {msg.content}
                                </p>
                            </div>
                        ))}
                        {sending && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-2xl">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100" />
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Test your constraints..."
                                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending || !input.trim()}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
                            >
                                <Send size={18} className="text-white/60" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
