'use client';

import React from 'react';
import Header from '@/app/components/Header';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white">
            <Header />
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/5 rounded-full">
                        <Bell className="w-6 h-6 text-dipsea-accent" />
                    </div>
                    <h1 className="text-3xl font-serif italic">Notifications</h1>
                </div>

                <div className="space-y-4">
                    {/* Placeholder for notifications */}
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center py-16">
                        <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white/40 mb-2">No new notifications</h3>
                        <p className="text-sm text-white/30">We'll let you know when something important happens in the woods.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
