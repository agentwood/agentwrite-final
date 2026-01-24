'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock, User, Mic, TrendingUp, AlertTriangle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface VoiceContribution {
    id: string;
    displayName: string;
    status: string;
    qualityScore: number;
    noiseScore: number;
    totalMinutesUsed: number;
    activeCharacterCount: number;
    usageEventCount: number;
    contributor: { id: string; username: string | null; email: string | null };
    gender: string | null;
    age: string | null;
    accent: string | null;
    createdAt: string;
    approvedAt: string | null;
}

export default function AdminVoicesPage() {
    const [voices, setVoices] = useState<VoiceContribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchVoices();
    }, [filter]);

    async function fetchVoices() {
        setLoading(true);
        try {
            const status = filter === 'all' ? '' : filter;
            const response = await fetch(`/api/admin/voices${status ? `?status=${status}` : ''}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            setVoices(data.voices || []);
        } catch (error) {
            console.error('Failed to fetch voices:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: string) {
        setActionLoading(id);
        try {
            const response = await fetch(`/api/voice/${id}/approve`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                setVoices((prev) =>
                    prev.map((v) => (v.id === id ? { ...v, status: 'approved' } : v))
                );
            }
        } catch (error) {
            console.error('Failed to approve:', error);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleReject(id: string) {
        const reason = prompt('Rejection reason:');
        if (!reason) return;

        setActionLoading(id);
        try {
            const response = await fetch(`/api/voice/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ reason }),
            });
            if (response.ok) {
                setVoices((prev) =>
                    prev.map((v) => (v.id === id ? { ...v, status: 'rejected' } : v))
                );
            }
        } catch (error) {
            console.error('Failed to reject:', error);
        } finally {
            setActionLoading(null);
        }
    }

    const pendingCount = voices.filter((v) => v.status === 'pending_review').length;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Voice Contributions</h1>
                        <p className="text-gray-400 mt-1">Manage user-submitted voices</p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                            <AlertTriangle size={18} />
                            {pendingCount} pending review
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['all', 'pending_review', 'approved', 'rejected', 'processing'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {f.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-left text-gray-400 text-sm">
                                <th className="p-4">Voice</th>
                                <th className="p-4">Contributor</th>
                                <th className="p-4">Quality</th>
                                <th className="p-4">Usage</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : voices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No voices found
                                    </td>
                                </tr>
                            ) : (
                                voices.map((voice) => (
                                    <tr key={voice.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <Mic className="text-purple-400" size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{voice.displayName}</p>
                                                    <p className="text-gray-500 text-xs">
                                                        {voice.gender} • {voice.age} • {voice.accent}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-500" />
                                                <span className="text-sm">
                                                    {voice.contributor.username || voice.contributor.email || voice.contributor.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${voice.qualityScore >= 70 ? 'bg-green-400' : voice.qualityScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                                        }`}
                                                />
                                                <span>{voice.qualityScore}/100</span>
                                                <span className="text-gray-500 text-xs">(noise: {voice.noiseScore})</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={14} className="text-gray-500" />
                                                <span>{voice.totalMinutesUsed.toFixed(1)} min</span>
                                                <span className="text-gray-500 text-xs">({voice.activeCharacterCount} chars)</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${voice.status === 'approved'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : voice.status === 'pending_review'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : voice.status === 'rejected'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                    }`}
                                            >
                                                {voice.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {voice.status === 'pending_review' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(voice.id)}
                                                        disabled={actionLoading === voice.id}
                                                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(voice.id)}
                                                        disabled={actionLoading === voice.id}
                                                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
