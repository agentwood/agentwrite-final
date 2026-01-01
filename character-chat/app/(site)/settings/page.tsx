'use client';

import React, { useState, useEffect } from 'react';
import {
  User, CreditCard, Settings as SettingsIcon, Volume2, Shield,
  ChevronRight, ExternalLink, Moon, Sun, Monitor, Bell, DollarSign,
  Lock, Edit3, X, Plus, Mail, ChevronDown, CheckCircle, AlertTriangle, HelpCircle,
  RefreshCw, Mic, Video, BadgeDollarSign, Save, ExternalLink as ExternalLinkIcon,
  Sparkles, Globe
} from 'lucide-react';
import Payouts from '@/app/components/Payouts';
import Sidebar from '@/app/components/Sidebar';
import Footer from '@/app/components/Footer';
import SafeImage from '@/app/components/SafeImage';
import { getSubscriptionStatus, type PlanId } from '@/lib/subscription';

type SettingsSection = 'profile' | 'account' | 'preferences' | 'muted' | 'parental' | 'payouts';

const SETTINGS_NAV = [
  { id: 'profile', label: 'Public profile', icon: User },
  { id: 'account', label: 'Account', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  { id: 'muted', label: 'Muted words', icon: Volume2 },
  { id: 'parental', label: 'Parental Insights', icon: Shield },
  { id: 'payouts', label: 'Affiliates & Payouts', icon: DollarSign },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [isPremium, setIsPremium] = useState(false);

  // Muted Words State
  const [mutedWordInput, setMutedWordInput] = useState('');
  const [mutedWords, setMutedWords] = useState<string[]>(['NSFW', 'Spam', 'Politics']);

  // Account/Billing State
  const [cancelStep, setCancelStep] = useState(0); // 0: Closed, 1: Offer, 2: Reason, 3: Warning
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Form States
  const [username, setUsername] = useState('SparklyCamel8370');
  const [displayName, setDisplayName] = useState('SparklyCamel8370');
  const [bio, setBio] = useState('');

  useEffect(() => {
    // Fetch user subscription status
    getSubscriptionStatus(null).then(status => {
      setCurrentPlan(status.planId);
      setIsPremium(status.planId !== 'free');
    });
  }, []);

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // In a real app, this would be an API call
      console.log(`Saved ${section} settings`);
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMutedWord = () => {
    if (mutedWordInput.trim() && !mutedWords.includes(mutedWordInput.trim())) {
      setMutedWords([...mutedWords, mutedWordInput.trim()]);
      setMutedWordInput('');
    }
  };

  const removeMutedWord = (word: string) => {
    setMutedWords(mutedWords.filter(w => w !== word));
  };

  // --- Cancel Flow Modals ---
  const renderCancelModal = () => {
    if (cancelStep === 0) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

          {/* Step 1: Offer */}
          {cancelStep === 1 && (
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">Wait! One time offer <br />before you go</h3>
                <button onClick={() => setCancelStep(0)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-8">
                We value your presence in the Agentwood community. Reconsider with this exclusive offer:
              </p>

              <div className="bg-indigo-50 rounded-2xl p-5 flex items-center gap-4 border border-indigo-100 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                  <DollarSign size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Get 30% off next month</h4>
                  <p className="text-xs text-indigo-700 font-medium mt-1 leading-relaxed">
                    Your price drops from $9.99 to just $6.99 for the next billing cycle!
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    alert("Offer accepted! (Mock)");
                    setCancelStep(0);
                  }}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg"
                >
                  Accept 30% Discount
                </button>
                <button
                  onClick={() => setCancelStep(2)}
                  className="w-full bg-white text-gray-400 py-3 rounded-2xl font-bold text-sm hover:text-red-500 transition-colors"
                >
                  No thanks, continue to cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Reason Survey */}
          {cancelStep === 2 && (
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Tell us why you're leaving</h3>
                <button onClick={() => setCancelStep(0)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Help us improve by sharing your feedback.
              </p>

              <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {[
                  "Too expensive",
                  "Missing features I need",
                  "Found a better alternative",
                  "Don't use it enough",
                  "Technical issues/bugs",
                  "Difficult to navigate",
                  "Other"
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${cancelReason === reason
                      ? 'border-black bg-gray-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cancelReason === reason ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                      {cancelReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm font-medium ${cancelReason === reason ? 'text-gray-900' : 'text-gray-600'}`}>{reason}</span>
                  </button>
                ))}

                {cancelReason === 'Other' && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please share more details..."
                    className="w-full mt-2 p-4 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[100px] bg-gray-50 resize-none"
                  />
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCancelStep(0)}
                  className="flex-1 bg-white border border-gray-200 text-gray-900 py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCancelStep(3)}
                  disabled={!cancelReason}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Warning */}
          {cancelStep === 3 && (
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Are you 100% sure?</h3>
                <button onClick={() => setCancelStep(0)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                If you cancel, you'll lose access to these premium benefits at the end of your billing cycle:
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Sparkles, title: "Unlimited Messages", desc: "No more daily message limits on any character." },
                  { icon: Mic, title: "Premium AI Voices", desc: "Access to high-fidelity ElevenLabs voices." },
                  { icon: RefreshCw, title: "Priority Gen-AI", desc: "Faster response times during peak hours." },
                  { icon: Shield, title: "Ad-free experience", desc: "Clean interface without any distractions." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-50 rounded-[20px] bg-gray-50/30">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-900 shrink-0 border border-gray-100">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    alert("Subscription cancelled (Mock)");
                    setCancelStep(0);
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setCancelStep(0)}
                  className="w-full bg-white text-gray-500 py-3 rounded-2xl font-bold text-sm hover:text-gray-900 transition-colors"
                >
                  Keep my premium benefits
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Public profile</h2>
              <button
                onClick={() => handleSave('profile')}
                disabled={loading}
                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>

            <div className="mb-10 flex items-center gap-6">
              <div className="relative inline-block group cursor-pointer">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-gray-900 overflow-hidden relative">
                    <SafeImage src="" alt="S" className="w-full h-full object-cover opacity-0" />
                    <span className="absolute inset-0 flex items-center justify-center bg-gray-100">S</span>
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-white rounded-full p-2.5 shadow-xl border border-gray-100 group-hover:scale-110 transition-transform">
                  <Edit3 size={16} className="text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl">{displayName}</h3>
                <p className="text-gray-500 text-sm">Update your avatar and personal details</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-gray-200 focus-within:ring-4 focus-within:ring-gray-100 transition-all">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-bold text-lg placeholder-gray-300"
                />
              </div>

              <div className="bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-gray-200 focus-within:ring-4 focus-within:ring-gray-100 transition-all">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-bold text-lg placeholder-gray-300"
                />
              </div>

              <div className="bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus-within:bg-white focus-within:border-gray-200 focus-within:ring-4 focus-within:ring-gray-100 transition-all text-right">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-left">Bio / Tagline</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-medium text-base placeholder-gray-300 resize-none h-32"
                  placeholder="Tell the community about yourself..."
                />
                <span className="text-[10px] font-bold text-gray-400 tabular-nums">{bio.length}/500</span>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Billing</h2>
            <p className="text-gray-500 mb-10 text-lg">Manage your subscription, credits, and security</p>

            <div className="space-y-4">
              {/* Plan Info Card */}
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Plan</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-900 capitalize">{currentPlan}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isPremium ? 'Premium Active' : 'Free User'}
                      </span>
                    </div>
                  </div>
                  <button className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                    Upgrade Plan
                  </button>
                </div>
                <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                  <span className="text-gray-500 font-medium">Next billing cycle starts on Jan 27th, 2026</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    $9.99 / mo <ChevronDown size={14} className="text-gray-400 ml-1" />
                  </div>
                </div>
              </div>

              {/* Credits */}
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Messages remaining</p>
                    <div className="text-3xl font-black text-gray-900">35,554 <span className="text-gray-300 text-xl font-medium">/ 50,000</span></div>
                  </div>
                  <Sparkles className="text-indigo-600 mb-1" size={24} />
                </div>
                <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-50">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[71%] rounded-full shadow-inner"></div>
                </div>
              </div>

              {/* 2FA Banner */}
              <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 shrink-0 border border-rose-100">
                  <Shield size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-rose-900">Protect your account</h4>
                  <p className="text-sm text-rose-700 opacity-80 mt-0.5">
                    Enable Two-Factor Authentication (2FA) for enterprise-grade security.
                  </p>
                </div>
                <button className="whitespace-nowrap px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-2xl text-sm font-bold hover:bg-rose-100 transition-all">
                  Setup 2FA
                </button>
              </div>

              {/* Settings List */}
              <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                {[
                  { title: "Usage alerts at 80%", active: true },
                  { title: "Monthly activity report", active: false },
                  { title: "Automatic credit recharge", active: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-8 py-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <span className="text-gray-700 text-sm font-bold">{item.title}</span>
                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 shadow-sm transition-all ${item.active ? 'left-6.5' : 'left-0.75'}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cancel Subscription */}
              <div className="pt-8 flex justify-center">
                <button
                  onClick={() => setCancelStep(1)}
                  className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  Cancel my Premium Subscription
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {renderCancelModal()}
          </div>
        );

      case 'preferences':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-10">Preferences</h2>

            <div className="space-y-10">
              {/* Language */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Interface Language</label>
                <div className="flex items-center justify-between">
                  <select className="bg-transparent border-none text-gray-900 font-bold text-lg focus:ring-0 p-0 cursor-pointer w-full">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                  </select>
                  <Globe size={20} className="text-gray-300" />
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Color Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'system', icon: Monitor, label: 'System' },
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'dark', icon: Moon, label: 'Dark' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className={`flex flex-col items-center gap-3 py-5 rounded-3xl font-bold transition-all border ${t.id === 'system'
                        ? 'bg-gray-900 text-white border-black shadow-lg scale-105'
                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                        }`}
                    >
                      <t.icon size={22} />
                      <span className="text-xs uppercase tracking-wider">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Appearance */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Chat Style</label>
                <div className="flex bg-gray-50 p-1.5 rounded-[22px] border border-gray-100">
                  {['Default', 'Classic', 'Cinematic'].map((style) => (
                    <button
                      key={style}
                      className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${style === 'Default'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                {[
                  { title: "Enable Typing Effects", icon: Edit3, active: true },
                  { title: "Sound Effects", icon: Volume2, active: true },
                  { title: "Haptic Feedback", icon: Sparkles, active: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-8 py-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                        <item.icon size={18} />
                      </div>
                      <span className="text-gray-700 text-sm font-bold">{item.title}</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 shadow-sm transition-all ${item.active ? 'left-6.5' : 'left-0.75'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'muted':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Muted words</h2>
            <p className="text-gray-500 mb-10 text-lg">Filter out content you'd rather not see</p>

            <div className="bg-gray-50 rounded-[28px] p-2 pl-6 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:border-gray-200 focus-within:ring-4 focus-within:ring-gray-50 transition-all mb-10">
              <Plus size={20} className="text-gray-400" />
              <input
                type="text"
                value={mutedWordInput}
                onChange={(e) => setMutedWordInput(e.target.value)}
                placeholder="Type a word to mute..."
                className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 font-bold py-3"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMutedWord()}
              />
              <button
                onClick={handleAddMutedWord}
                className="bg-black text-white px-8 py-3.5 rounded-[22px] text-sm font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Mute Word
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Active Filters</p>
              <div className="flex flex-wrap gap-3">
                {mutedWords.map((word, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 text-gray-900 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm group hover:border-red-200 hover:bg-rose-50 transition-all">
                    {word}
                    <button onClick={() => removeMutedWord(word)} className="text-gray-300 hover:text-red-500 group-hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {mutedWords.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                <Volume2 size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold">No muted words yet</p>
              </div>
            )}
          </div>
        );

      case 'parental':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Parental insights</h2>
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                <HelpCircle size={16} className="text-indigo-600" />
              </div>
            </div>

            <p className="text-gray-500 mb-12 text-lg leading-relaxed">
              Connect a guardian email to share usage metrics. <span className="text-gray-900 font-bold">They cannot see your private chat content.</span>
            </p>

            <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm text-center">
              <div className="w-20 h-20 bg-indigo-50 border-4 border-white shadow-xl rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8 animate-bounce transition-all duration-1000">
                <Mail size={32} />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-3">Invite a Guardian</h3>
              <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">Enter their email below to send an invitation link to the dashboard.</p>

              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-4 focus-within:bg-white focus-within:border-gray-200 focus-within:ring-4 focus-within:ring-gray-50 transition-all group">
                  <input
                    type="email"
                    placeholder="guardian@email.com"
                    className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-bold text-center placeholder-gray-300"
                  />
                </div>

                <button className="w-full bg-black text-white py-5 rounded-[24px] font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-100 active:scale-[0.98]">
                  Send Invite
                </button>
              </div>

              <p className="mt-8 text-[11px] font-bold text-gray-300 uppercase tracking-widest">Powered by Agentwood Safety Systems</p>
            </div>
          </div>
        );

      case 'payouts':
        return <Payouts username={username} />;

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar Nav */}
      <Sidebar
        recentCharacters={[]}
      />

      <main className="flex-1 lg:pl-60 flex flex-col min-h-screen overflow-hidden">
        {/* Desktop Settings Header */}
        <header className="px-8 py-10 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-bold text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Server Status: Online
            </div>
            <button className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Horizontal Section Selector for Desktop (Left) */}
          <aside className="w-full md:w-80 md:shrink-0 bg-white/30 p-8 border-r border-gray-100 overflow-y-auto">
            <nav className="space-y-1.5">
              {SETTINGS_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={`w-full flex items-center justify-between px-6 py-4.5 rounded-[22px] group transition-all duration-300 ${activeSection === item.id
                    ? 'bg-white text-gray-900 shadow-xl shadow-gray-100/50 border border-gray-100 translate-x-1'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${activeSection === item.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
                      <item.icon size={18} />
                    </div>
                    <span className={`text-sm font-black transition-colors ${activeSection === item.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.label}</span>
                  </div>
                  {activeSection === item.id && <ChevronRight size={16} className="text-indigo-600 animate-in slide-in-from-left-2" />}
                </button>
              ))}
            </nav>

            <div className="mt-12 space-y-4 pt-8 border-t border-gray-100">
              <button className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all font-bold text-sm">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <ExternalLinkIcon size={14} />
                </div>
                Join Discord
              </button>
              <button className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl bg-gray-900 text-white shadow-xl shadow-gray-200 hover:bg-black transition-all font-bold text-sm">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-[10px] font-black">
                  APP
                </div>
                Mobile App
              </button>
            </div>
          </aside>

          {/* Right Scrollable Area */}
          <section className="flex-1 bg-white p-8 md:p-16 overflow-y-auto scroll-smooth">
            {renderContent()}

            {/* Footer within settings content */}
            <div className="mt-32 pt-16 border-t border-gray-50 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Agentwood Digital Systems v2.1.0</p>
              <div className="flex justify-center gap-6">
                <a href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Safety</a>
                <a href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Privacy</a>
                <a href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Terms</a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
