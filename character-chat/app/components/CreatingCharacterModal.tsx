'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Check, AlertCircle, User, Volume2 } from 'lucide-react';

interface CreatingCharacterModalProps {
    isOpen: boolean;
    characterId: string | null;
    characterName: string;
    onComplete: (characterId: string) => void;
    onError: (error: string) => void;
}

interface CreationStatus {
    status: 'pending' | 'generating_avatar' | 'generating_personality' | 'matching_voice' | 'finalizing' | 'ready' | 'failed';
    progress: number;
    message: string;
    error?: string;
}

const STATUS_MESSAGES: Record<string, { message: string; icon: React.ReactNode }> = {
    pending: { message: 'Initializing...', icon: <Loader2 className="animate-spin" size={24} /> },
    creating_voice_core: { message: 'Synthesizing voice identity...', icon: <Volume2 className="animate-pulse" size={24} /> },
    generating_avatar: { message: 'Creating unique avatar...', icon: <Sparkles className="animate-pulse" size={24} /> },
    generating_personality: { message: 'Crafting personality...', icon: <User className="animate-bounce" size={24} /> },
    matching_voice: { message: 'Finding the perfect voice...', icon: <Sparkles className="animate-pulse" size={24} /> },
    finalizing: { message: 'Putting it all together...', icon: <Loader2 className="animate-spin" size={24} /> },
    ready: { message: 'Your character is ready!', icon: <Check size={24} /> },
    failed: { message: 'Something went wrong', icon: <AlertCircle size={24} /> },
};

export default function CreatingCharacterModal({
    isOpen,
    characterId,
    characterName,
    onComplete,
    onError,
}: CreatingCharacterModalProps) {
    const [status, setStatus] = useState<CreationStatus>({
        status: 'pending',
        progress: 0,
        message: 'Initializing...',
    });

    useEffect(() => {
        if (!isOpen || !characterId) return;

        let pollInterval: NodeJS.Timeout;
        let pollCount = 0;
        const maxPolls = 60; // 60 * 2s = 2 minutes max

        const pollStatus = async () => {
            try {
                const response = await fetch(`/api/personas/${characterId}/status`);
                if (!response.ok) throw new Error('Failed to fetch status');

                const data: CreationStatus = await response.json();
                setStatus(data);

                if (data.status === 'ready') {
                    clearInterval(pollInterval);
                    setTimeout(() => onComplete(characterId), 1500);
                } else if (data.status === 'failed') {
                    clearInterval(pollInterval);
                    onError(data.error || 'Character creation failed');
                }

                pollCount++;
                if (pollCount >= maxPolls) {
                    clearInterval(pollInterval);
                    onError('Character creation timed out');
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        };

        // Start polling
        pollStatus();
        pollInterval = setInterval(pollStatus, 2000);

        return () => clearInterval(pollInterval);
    }, [isOpen, characterId, onComplete, onError]);

    if (!isOpen) return null;

    const statusInfo = STATUS_MESSAGES[status.status] || STATUS_MESSAGES.pending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[2rem] p-12 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
                {/* Animated Character Silhouette */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 ${status.status !== 'ready' && status.status !== 'failed' ? 'animate-pulse' : ''}`} />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600/50 to-pink-600/50 flex items-center justify-center">
                        <span className="text-4xl font-black text-white/80">
                            {characterName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Spinning ring */}
                    {status.status !== 'ready' && status.status !== 'failed' && (
                        <div className="absolute -inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                    )}
                </div>

                {/* Character Name */}
                <h2 className="text-2xl font-black text-center mb-2">{characterName}</h2>

                {/* Status Icon and Message */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <span className={status.status === 'ready' ? 'text-green-500' : status.status === 'failed' ? 'text-red-500' : 'text-purple-400'}>
                        {statusInfo.icon}
                    </span>
                    <span className="text-white/60 font-medium">{statusInfo.message}</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                        className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${status.status === 'ready'
                            ? 'bg-green-500'
                            : status.status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                        style={{ width: `${status.progress}%` }}
                    />
                </div>

                {/* Progress Percentage */}
                <p className="text-center text-white/40 text-sm font-medium">
                    {status.status === 'ready'
                        ? 'Complete!'
                        : status.status === 'failed'
                            ? status.error || 'Failed'
                            : `${Math.round(status.progress)}% complete`}
                </p>

                {/* Estimated Time */}
                {status.status !== 'ready' && status.status !== 'failed' && (
                    <p className="text-center text-white/20 text-xs mt-2">
                        This usually takes 15-30 seconds
                    </p>
                )}

                {/* Success Button */}
                {status.status === 'ready' && (
                    <button
                        onClick={() => onComplete(characterId!)}
                        className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Meet {characterName}
                    </button>
                )}

                {/* Error Button */}
                {status.status === 'failed' && (
                    <button
                        onClick={() => onError(status.error || 'Failed')}
                        className="w-full mt-8 bg-red-500/20 text-red-400 py-4 rounded-2xl font-black text-sm hover:bg-red-500/30 transition-all"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
