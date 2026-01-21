"use client";

import React from 'react';
import { useCogneeStatus } from '@/app/hooks/useCogneeStatus';
import { Brain, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CogneeStatus: React.FC = () => {
    const { isAvailable, lastChecked, checkStatus } = useCogneeStatus(30000); // Check every 30s

    if (isAvailable === null) return null; // Initial loading state

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161616] border border-white/5 transition-all hover:bg-[#1f1b19]">
            <Brain size={14} className={isAvailable ? "text-purple-400" : "text-white/20"} />

            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Memory Core
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className={`text-[10px] font-bold ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                        {isAvailable ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            {!isAvailable && (
                <button
                    onClick={checkStatus}
                    className="ml-auto p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                    title="Retry Connection"
                >
                    <RefreshCw size={12} />
                </button>
            )}
        </div>
    );
};
