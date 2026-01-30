
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface HealthResult {
    status: 'healthy' | 'down' | 'unknown';
    latency: number;
    message: string;
}

interface FullHealthResponse {
    ok: boolean;
    results: {
        database: HealthResult;
        tts_primary: HealthResult;
        tts_backup: HealthResult;
        gemini: HealthResult;
        timestamp: string;
    };
}

export default function StatusPage() {
    const [health, setHealth] = useState<FullHealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchHealth = async () => {
        try {
            const res = await fetch('/api/health/full');
            const data = await res.json();
            setHealth(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch health');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]';
            case 'down': return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]';
            default: return 'bg-yellow-500';
        }
    };

    const StatusCard = ({ title, result }: { title: string, result?: HealthResult }) => (
        <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between h-40 transition-all hover:bg-[#222]">
            <div className="flex justify-between items-start">
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider">{title}</h3>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(result?.status || 'unknown')} transition-all duration-500`} />
            </div>

            <div className="mt-4">
                <div className="text-2xl font-bold text-white tracking-tight">
                    {result?.status === 'healthy' ? 'Operational' : result?.status === 'down' ? 'Outage' : 'Checking...'}
                </div>
                {result && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-mono">
                        <span>{result.latency}ms</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span>{result.message}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const isAllHealthy = health?.results && Object.values(health.results).every((r: any) => r && r.status === 'healthy');

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Simple Header */}
            <header className="border-b border-white/10 px-6 py-4">
                <Link href="/" className="text-xl font-bold hover:text-gray-300">Agentwood</Link>
            </header>

            <main className="container mx-auto px-4 py-24 max-w-5xl">
                {/* Header Section */}
                <div className="mb-12 border-b border-white/10 pb-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-white">System Status</h1>
                            <p className="text-gray-400 mt-2">Real-time status of Agentwood core infrastructure.</p>
                        </div>
                        {isAllHealthy && (
                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                All Systems Operational
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <StatusCard title="Primary TTS Engine" result={health?.results.tts_primary} />
                    <StatusCard title="Backup TTS (Failover)" result={health?.results.tts_backup} />
                    <StatusCard title="Database Cluster" result={health?.results.database} />
                    <StatusCard title="Gemini Intelligence" result={health?.results.gemini} />
                </div>

                {/* Operations Section */}
                <div className="space-y-8">
                    <h2 className="text-xl font-semibold text-white">Service History</h2>

                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
                        {/* Static Incident for demo */}
                        <div className="p-6 border-b border-white/5 last:border-0 hover:bg-[#222] transition-colors">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-green-500 font-bold text-sm">Resolved</span>
                                <span className="text-gray-500 text-sm">•</span>
                                <span className="text-gray-400 text-sm">Today, {new Date().toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Voice Generation Performance Optimization</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Completed deployment of backup TTS infrastructure (Port 8001). Failover latency reduced to &#60;500ms.
                            </p>
                        </div>

                        <div className="p-6 border-b border-white/5 last:border-0 hover:bg-[#222] transition-colors">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-green-500 font-bold text-sm">Resolved</span>
                                <span className="text-gray-500 text-sm">•</span>
                                <span className="text-gray-400 text-sm">Yesterday</span>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Scheduled Maintenance</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Routine database optimization and index rebuilding. No downtime observed.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
