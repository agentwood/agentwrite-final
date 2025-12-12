import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { stripeService } from '../services/stripeService';

const DiagnosticsPage = () => {
    const { user } = useAuth();

    const envVars = {
        'VITE_STRIPE_PUBLISHABLE_KEY': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        'VITE_STRIPE_PRICE_STARTER_MONTHLY': import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY,
        'VITE_STRIPE_PRICE_STARTER_YEARLY': import.meta.env.VITE_STRIPE_PRICE_STARTER_YEARLY,
        'VITE_STRIPE_PRICE_PRO_MONTHLY': import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
        'VITE_STRIPE_PRICE_PRO_YEARLY': import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY,
        'VITE_STRIPE_PRICE_UNLIMITED_MONTHLY': import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_MONTHLY,
        'VITE_STRIPE_PRICE_UNLIMITED_YEARLY': import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_YEARLY,
        'VITE_STRIPE_PRICE_LTD': import.meta.env.VITE_STRIPE_PRICE_LTD,
    };

    const testPriceIds = {
        'Starter Monthly': stripeService.getPriceId('starter', 'monthly'),
        'Starter Yearly': stripeService.getPriceId('starter', 'yearly'),
        'Pro Monthly': stripeService.getPriceId('pro', 'monthly'),
        'Pro Yearly': stripeService.getPriceId('pro', 'yearly'),
        'Unlimited Monthly': stripeService.getPriceId('unlimited', 'monthly'),
        'Unlimited Yearly': stripeService.getPriceId('unlimited', 'yearly'),
        'LTD': stripeService.getPriceId('ltd', 'yearly'),
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Navigation />
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold mb-6">Stripe Diagnostics</h1>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
                    <div className="bg-gray-50 p-4 rounded">
                        <p><strong>Logged In:</strong> {user ? '✅ Yes' : '❌ No'}</p>
                        {user && <p><strong>Email:</strong> {user.email}</p>}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                    <div className="space-y-2">
                        {Object.entries(envVars).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <span className="font-mono text-sm flex-1">{key}:</span>
                                {value ? (
                                    <span className="text-green-600">✅ Set ({value.substring(0, 20)}...)</span>
                                ) : (
                                    <span className="text-red-600 font-bold">❌ MISSING</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Price ID Resolution</h2>
                    <div className="space-y-2">
                        {Object.entries(testPriceIds).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <span className="font-mono text-sm flex-1">{key}:</span>
                                {value ? (
                                    <span className="text-green-600">✅ {value}</span>
                                ) : (
                                    <span className="text-red-600 font-bold">❌ EMPTY</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <h3 className="font-bold mb-2">How to Fix Missing Variables:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to Stripe Dashboard → Products</li>
                        <li>Copy each Price ID (starts with price_...)</li>
                        <li>Go to Netlify → Site Settings → Environment Variables</li>
                        <li>Add each missing VITE_STRIPE_PRICE_* variable</li>
                        <li>Trigger a new deploy (Clear cache & deploy)</li>
                    </ol>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DiagnosticsPage;
