import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Heart, XCircle, Pause, DollarSign, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const CancelPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [showRetentionOffer, setShowRetentionOffer] = useState(false);

    const reasons = [
        { id: 'expensive', label: '💸 Too expensive', icon: DollarSign },
        { id: 'not-using', label: '⏱️ Not using it enough', icon: Pause },
        { id: 'missing-features', label: '🔧 Missing features I need', icon: AlertCircle },
        { id: 'alternative', label: '🔄 Found a better alternative', icon: XCircle },
        { id: 'other', label: '📝 Other reason', icon: AlertCircle }
    ];

    const handleReasonSelect = (reasonId: string) => {
        setSelectedReason(reasonId);
        setShowRetentionOffer(true);
    };

    const handlePauseSubscription = () => {
        // Logic to pause subscription for 3 months
        alert('Subscription paused for 3 months. You can reactivate anytime!');
        navigate('/dashboard');
    };

    const handleDowngrade = () => {
        navigate('/pricing');
    };

    const handleExtendTrial = () => {
        alert('Great! We have extended your trial by 1 month. We would love to hear what features you need!');
        navigate('/dashboard');
    };

    const handleFinalCancel = () => {
        // Logic to actually cancel subscription
        alert('We are sorry to see you go! Your subscription has been cancelled.');
        navigate('/');
    };

    const getRetentionOffer = () => {
        switch (selectedReason) {
            case 'expensive':
                return {
                    title: '💰 We hear you! Let\'s find a solution',
                    description: 'Money shouldn\'t stop you from creating amazing content.',
                    options: [
                        {
                            icon: <Pause className="text-blue-600" size={24} />,
                            title: 'Pause for 3 Months',
                            description: 'Take a break and come back when you\'re ready. No charges during pause.',
                            action: handlePauseSubscription,
                            buttonText: 'Pause My Subscription'
                        },
                        {
                            icon: <DollarSign className="text-green-600" size={24} />,
                            title: 'Downgrade to Starter',
                            description: 'Just $7/month. Keep your projects, use fewer credits.',
                            action: handleDowngrade,
                            buttonText: 'See Starter Plan'
                        }
                    ]
                };

            case 'not-using':
                return {
                    title: '⏱️ Life gets busy, we get it',
                    description: 'Let\'s help you stay on track without losing your subscription.',
                    options: [
                        {
                            icon: <Pause className="text-blue-600" size={24} />,
                            title: 'Pause for 3 Months',
                            description: 'No charges. Your projects stay safe. Resume anytime.',
                            action: handlePauseSubscription,
                            buttonText: 'Pause My Subscription'
                        },
                        {
                            icon: <Heart className="text-pink-600" size={24} />,
                            title: 'Monthly Writing Reminders',
                            description: 'We will send you motivational tips and prompts to keep you writing.',
                            action: () => {
                                alert('You will receive monthly writing reminders!');
                                navigate('/dashboard');
                            },
                            buttonText: 'Keep My Account Active'
                        }
                    ]
                };

            case 'missing-features':
                return {
                    title: '🔧 We want to build what you need!',
                    description: 'Your feedback shapes our roadmap. Let\'s make this work for you.',
                    options: [
                        {
                            icon: <Zap className="text-amber-600" size={24} />,
                            title: 'Free 1-Month Extension',
                            description: 'Tell us what you need, and we will give you an extra month while we consider it.',
                            action: handleExtendTrial,
                            buttonText: 'Get Free Month'
                        },
                        {
                            icon: <Heart className="text-purple-600" size={24} />,
                            title: 'Early Access Program',
                            description: 'Get beta access to new features before anyone else.',
                            action: () => {
                                alert('You are now in our Early Access program!');
                                navigate('/dashboard');
                            },
                            buttonText: 'Join Early Access'
                        }
                    ]
                };

            case 'alternative':
                return {
                    title: '🤔 What did they have that we don\'t?',
                    description: 'We\'d love to hear what made you switch.',
                    options: [
                        {
                            icon: <DollarSign className="text-green-600" size={24} />,
                            title: 'Price Match Guarantee',
                            description: 'Show us their pricing and we\'ll match it or beat it.',
                            action: () => {
                                alert('Contact support@agentwood.xyz with their pricing and we will match it!');
                                navigate('/dashboard');
                            },
                            buttonText: 'Contact Support'
                        },
                        {
                            icon: <Heart className="text-red-600" size={24} />,
                            title: 'Tell Us What They Do Better',
                            description: 'Your feedback = free month + our eternal gratitude.',
                            action: () => {
                                alert('Thank you! Check your email for the feedback form.');
                                navigate('/dashboard');
                            },
                            buttonText: 'Share Feedback'
                        }
                    ]
                };

            default:
                return null;
        }
    };

    const retentionOffer = showRetentionOffer ? getRetentionOffer() : null;

    return (
        <div className="min-h-screen bg-stone-50">
            <Navigation />
            <Navigation />

            <div className="max-w-3xl mx-auto px-4 py-24">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                        <Heart className="text-red-600" size={40} />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
                        We're sorry to see you go 😢
                    </h1>
                    <p className="text-xl text-slate-600">
                        Before you leave, can you tell us why? Your feedback helps us improve.
                    </p>
                </div>

                {/* Reason Selection */}
                {!showRetentionOffer && (
                    <div className="space-y-4 mb-8">
                        {reasons.map((reason) => {
                            const Icon = reason.icon;
                            return (
                                <button
                                    key={reason.id}
                                    onClick={() => handleReasonSelect(reason.id)}
                                    className="w-full text-left p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-purple-100 transition">
                                            <Icon size={24} className="text-slate-600 group-hover:text-purple-600" />
                                        </div>
                                        <span className="text-lg font-medium text-slate-900">{reason.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Other Reason Input */}
                {selectedReason === 'other' && !showRetentionOffer && (
                    <div className="mb-8">
                        <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            placeholder="Please tell us more..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none min-h-[120px]"
                        />
                        <button
                            onClick={() => setShowRetentionOffer(true)}
                            className="mt-4 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                        >
                            Submit Feedback
                        </button>
                    </div>
                )}

                {/* Retention Offers */}
                {retentionOffer && (
                    <div className="space-y-6 mb-8">
                        <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                {retentionOffer.title}
                            </h2>
                            <p className="text-slate-600">{retentionOffer.description}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {retentionOffer.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="mb-6">
                                        <div className="mb-4">{option.icon}</div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">{option.description}</p>
                                    </div>
                                    <button
                                        onClick={option.action}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105"
                                    >
                                        {option.buttonText}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Final Cancellation */}
                {showRetentionOffer && (
                    <div className="text-center pt-8 border-t-2 border-gray-200">
                        <p className="text-sm text-slate-500 mb-4">
                            None of these work for you?
                        </p>
                        <button
                            onClick={handleFinalCancel}
                            className="text-red-600 hover:text-red-700 font-medium text-sm underline"
                        >
                            I still want to cancel my subscription
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CancelPage;
