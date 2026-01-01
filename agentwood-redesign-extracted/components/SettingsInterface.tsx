import React, { useState } from 'react';
import { 
  User, CreditCard, Settings as SettingsIcon, Volume2, Shield, 
  ChevronRight, ExternalLink, Moon, Sun, Monitor, Bell, DollarSign,
  Lock, Edit3, X, Plus, Mail, ChevronDown, CheckCircle, AlertTriangle, HelpCircle,
  RefreshCw, Mic, Video, BadgeDollarSign
} from 'lucide-react';
import { Payouts } from '../pages/Payouts';

type SettingsSection = 'profile' | 'account' | 'preferences' | 'muted' | 'parental' | 'payouts';

const SETTINGS_NAV = [
  { id: 'profile', label: 'Public profile', icon: User },
  { id: 'account', label: 'Account', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  { id: 'muted', label: 'Muted words', icon: Volume2 },
  { id: 'parental', label: 'Parental Insights', icon: Shield },
  { id: 'payouts', label: 'Affiliates & Payouts', icon: DollarSign },
];

export const SettingsInterface: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [mutedWordInput, setMutedWordInput] = useState('');
  const [mutedWords, setMutedWords] = useState<string[]>([]);

  // Account/Billing State
  const [cancelStep, setCancelStep] = useState(0); // 0: Closed, 1: Offer, 2: Reason, 3: Warning
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Form States
  const [username, setUsername] = useState('SparklyCamel8370');
  const [displayName, setDisplayName] = useState('SparklyCamel8370');
  const [bio, setBio] = useState('');

  const handleAddMutedWord = () => {
    if (mutedWordInput.trim()) {
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
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
                
                {/* Step 1: Offer */}
                {cancelStep === 1 && (
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">One time offer before you go!</h3>
                            <button onClick={() => setCancelStep(0)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Before you go, we'd love for you to reconsider with this offer.
                        </p>
                        
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 mb-6">
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Get 30% off your next month</h4>
                                <p className="text-sm text-gray-500 leading-tight mt-1">
                                    That reduces your price from $5/month to just $3.50/month next month!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCancelStep(0)}
                                className="flex-1 bg-white border border-gray-200 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Accept offer
                            </button>
                            <button 
                                onClick={() => setCancelStep(2)}
                                className="flex-1 bg-white border border-transparent text-gray-500 py-3 rounded-xl font-bold text-sm hover:text-red-600 transition-colors"
                            >
                                Cancel Subscription
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Reason Survey */}
                {cancelStep === 2 && (
                    <div className="p-6">
                         <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900 pr-8">Finally, let us know why you're cancelling</h3>
                            <button onClick={() => setCancelStep(0)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            This will help us serve you better in the future.
                        </p>
                        
                        <div className="space-y-3 mb-6">
                            {[
                                "Missing language support", 
                                "I found a better alternative",
                                "Price too high",
                                "Low usage",
                                "Switching to a different plan",
                                "Difficult to use",
                                "Poor customer support",
                                "Product/service didn't meet my needs"
                            ].map((reason) => (
                                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cancelReason === reason ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                                        {cancelReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <input 
                                        type="radio" 
                                        name="cancelReason" 
                                        className="hidden" 
                                        checked={cancelReason === reason} 
                                        onChange={() => setCancelReason(reason)} 
                                    />
                                    <span className="text-gray-700 text-sm group-hover:text-black">{reason}</span>
                                </label>
                            ))}
                            
                            <textarea 
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Your reason..."
                                className="w-full mt-2 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[80px] resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCancelStep(0)}
                                className="flex-1 bg-white border border-gray-200 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                I changed my mind
                            </button>
                            <button 
                                onClick={() => setCancelStep(3)}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Warning */}
                {cancelStep === 3 && (
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900">Are you sure you want to cancel?</h3>
                            <button onClick={() => setCancelStep(0)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Your access to these features will be lost at the end of the billing period.
                        </p>

                        <div className="space-y-3 mb-8">
                            {[
                                { icon: RefreshCw, title: "Unused credit roll over", desc: "You have 35,554 credits remaining." },
                                { icon: Mic, title: "Instant voice clones", desc: "Clone your voice with as little as one minute of audio" },
                                { icon: Video, title: "Access to Dubbing editor", desc: "For precise editing and more control." },
                                { icon: BadgeDollarSign, title: "Commercial license", desc: "To use your content for commercial use" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
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

                         <div className="flex gap-3">
                            <button 
                                onClick={() => setCancelStep(0)}
                                className="flex-1 bg-white border border-gray-200 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Take me back
                            </button>
                            <button 
                                onClick={() => {
                                    alert("Subscription cancelled (Mock)");
                                    setCancelStep(0);
                                }}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                            >
                                Proceed
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
          <div className="animate-fade-in max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900 mb-8">Public profile</h2>
            
            <div className="mb-8">
               <div className="relative inline-block group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-pink-300 flex items-center justify-center text-3xl font-bold text-gray-800 border-4 border-white shadow-sm">
                    S
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100 group-hover:bg-gray-50 transition-colors">
                    <Edit3 size={14} className="text-gray-600" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 group focus-within:ring-2 focus-within:ring-gray-300 transition-all">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-medium placeholder-gray-400"
                />
                <div className="text-right text-[10px] text-gray-400 mt-1">{username.length}/20</div>
              </div>

              <div className="bg-gray-100 rounded-2xl px-4 py-3 group focus-within:ring-2 focus-within:ring-gray-300 transition-all">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-medium placeholder-gray-400"
                />
                <div className="text-right text-[10px] text-gray-400 mt-1">{displayName.length}/20</div>
              </div>

              <div className="bg-gray-100 rounded-2xl px-4 py-3 group focus-within:ring-2 focus-within:ring-gray-300 transition-all">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-medium placeholder-gray-400 resize-none h-24"
                  placeholder="Add a short tagline..."
                />
                <div className="text-right text-[10px] text-gray-400 mt-1">{bio.length}/500</div>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="animate-fade-in max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900 mb-2">Billing</h2>
            <p className="text-gray-500 mb-8">You can manage your billing information and subscription here</p>

            <div className="space-y-4">
                {/* Plan Info Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                             <span className="text-gray-900 font-medium">You're on the</span>
                             <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-semibold text-gray-800">Starter</span>
                             <span className="text-gray-900 font-medium">plan.</span>
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                            Upgrade your plan
                        </button>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">Next payment on 27th Jan 2026</span>
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                            $6 <ChevronDown size={14} className="text-gray-400"/>
                        </div>
                    </div>
                </div>

                {/* Credits */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-900 font-medium">Credits remaining</span>
                        <span className="text-gray-900 font-bold text-sm">35,554 / 36,887</span>
                     </div>
                     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[96%] rounded-full"></div>
                     </div>
                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                         <span className="text-gray-900 font-medium">Plan cost</span>
                         <span className="text-gray-900 font-bold">$5</span>
                     </div>
                </div>

                 {/* Usage Billing Toggle */}
                 <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
                     <span className="text-gray-900 font-medium">Enable usage based billing</span>
                     <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform"></div>
                     </div>
                 </div>

                 {/* 2FA Banner */}
                 <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     <AlertTriangle size={20} className="text-gray-900 shrink-0 mt-0.5 sm:mt-0" />
                     <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                            We recommend setting two factor authentication to prevent abuse of the account funds.
                        </p>
                     </div>
                     <button className="whitespace-nowrap px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                        Set up 2FA
                     </button>
                 </div>

                 {/* Notifications */}
                 <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {[
                        "Enable Credit usage notification",
                        "Enable Total Voice usage notification",
                        "Enable Professional Voice Clone usage notification",
                        "Enable Voice Edits usage notification"
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
                            <span className="text-gray-900 text-sm font-medium">{item}</span>
                            <div className="flex items-center gap-3">
                                <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-500">80 %</div>
                                <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
                 
                 {/* Cancel Subscription */}
                 <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
                     <span className="text-gray-900 font-medium">Cancel subscription</span>
                     <button 
                        onClick={() => setCancelStep(1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                        Cancel subscription
                     </button>
                 </div>
            </div>
            
            {/* Render Modal if active */}
            {renderCancelModal()}
          </div>
        );

      case 'preferences':
        return (
           <div className="animate-fade-in max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900 mb-8">Preferences</h2>

            <div className="space-y-8">
               {/* Language */}
               <div className="bg-gray-100 rounded-2xl p-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Language</label>
                  <select className="w-full bg-transparent border-none text-gray-900 font-medium focus:ring-0 p-0 cursor-pointer">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                  </select>
               </div>

               {/* Theme */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="flex gap-3">
                     <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-medium shadow-md">
                        <Monitor size={18} /> System
                     </button>
                     <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-medium transition-colors">
                        <Sun size={18} /> Light
                     </button>
                     <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-medium transition-colors">
                        <Moon size={18} /> Dark
                     </button>
                  </div>
               </div>

               {/* Chat Style */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Chat Style</label>
                  <div className="flex gap-3">
                     <button className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-medium shadow-md">
                        Default
                     </button>
                     <button className="flex-1 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-medium transition-colors">
                        Classic
                     </button>
                     <button className="flex-1 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-medium transition-colors">
                        Dense
                     </button>
                  </div>
               </div>

                {/* Sound Effects */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sound Effects</label>
                  <div className="flex gap-3">
                     <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-medium shadow-md">
                        <Volume2 size={18} /> On
                     </button>
                     <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-medium transition-colors">
                         Off
                     </button>
                  </div>
               </div>
            </div>
           </div>
        );

      case 'muted':
        return (
          <div className="animate-fade-in max-w-2xl">
            <h2 className="text-3xl font-medium text-gray-900 mb-2">Muted words</h2>
            <p className="text-gray-500 mb-8">Add a single word at a time you'd prefer not to encounter in your conversations</p>
            
            <div className="bg-gray-100 rounded-2xl p-2 pl-4 flex items-center gap-2 mb-6 focus-within:ring-2 focus-within:ring-gray-300 transition-all">
                <input 
                    type="text" 
                    value={mutedWordInput}
                    onChange={(e) => setMutedWordInput(e.target.value)}
                    placeholder="New word"
                    className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMutedWord()}
                />
                <button 
                    onClick={handleAddMutedWord}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                    Add
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {mutedWords.map((word, idx) => (
                    <span key={idx} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                        {word}
                        <button onClick={() => removeMutedWord(word)} className="hover:text-black">
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
          </div>
        );

      case 'parental':
        return (
          <div className="animate-fade-in max-w-2xl">
             <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-medium text-gray-900">Parental insights</h2>
                <div className="bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600">i</div>
             </div>
             
             <p className="text-gray-500 mb-8">
                Enter your parent's email to share your AI journey - they'll get weekly stats about your activity (your chat content will stay private)
             </p>

             <div className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 group focus-within:ring-2 focus-within:ring-gray-300 transition-all">
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-medium placeholder-gray-400"
                />
              </div>

              <button className="w-full bg-gray-900 text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg">
                Invite
              </button>
          </div>
        );

      case 'payouts':
        return <Payouts />;
        
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-white md:bg-[#f9fafb]">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 md:shrink-0 bg-[#f9fafb] p-6 md:border-r border-gray-100 overflow-y-auto">
         <nav className="space-y-1">
            {SETTINGS_NAV.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SettingsSection)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        activeSection === item.id
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <span className="capitalize">{item.label}</span>
                </button>
            ))}
         </nav>

         <div className="mt-8 space-y-2 pt-8 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-100 text-indigo-700 text-sm font-bold hover:bg-indigo-200 transition-colors">
               <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px]">
                  <ExternalLink size={10} />
               </div>
               Join community
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-300 transition-colors">
               <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-[8px] font-mono">
                  APP
               </div>
               Get the app
            </button>
         </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white p-6 md:p-12 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};