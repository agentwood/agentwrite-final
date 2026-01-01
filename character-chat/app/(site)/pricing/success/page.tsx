'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

function SuccessContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate verification
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const planDetails: Record<string, { name: string; features: string[] }> = {
        pro: {
            name: 'Pro',
            features: [
                'Unlimited text chat',
                '1,000 voice replies/month',
                '200 min audio calls/month',
                'Create 50 characters',
                'Priority queue',
            ],
        },
        lifetime: {
            name: 'Lifetime',
            features: [
                'Everything in Pro',
                '3,000 voice replies/month',
                '600 min audio calls/month',
                'Create 250 characters',
                'Founder perks',
            ],
        },
    };

    const details = planDetails[plan] || planDetails.pro;

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />

            <main className="flex-1 flex items-center justify-center py-16">
                <div className="max-w-md mx-auto px-4 text-center">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-zinc-400">Activating your subscription...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                                <PartyPopper className="w-10 h-10 text-white" />
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Welcome to {details.name}!
                                </h1>
                                <p className="text-zinc-400">
                                    Your subscription is now active
                                </p>
                            </div>

                            {/* Features */}
                            <div className="bg-zinc-900 rounded-2xl p-6 text-left">
                                <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-4">
                                    You now have access to:
                                </h2>
                                <ul className="space-y-3">
                                    {details.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <span className="text-white">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="space-y-3">
                                <Link
                                    href="/home"
                                    className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Start Chatting
                                </Link>
                                <Link
                                    href="/settings"
                                    className="block w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
                                >
                                    Manage Subscription
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function PricingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
