
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Bell, LogOut, Mail, Lock, CheckCircle2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../services/supabaseClient';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'preferences'>('account');
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  });

  useEffect(() => {
    // Load user data (Mock or Real)
    const savedPrefs = localStorage.getItem('agentwrite_user_prefs');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      setUser(parsed);
      setName(parsed.name || 'Writer');
      setEmail(parsed.email || 'writer@example.com');
    }
  }, []);

  const handleSave = () => {
    if (user) {
      const updated = { ...user, name, email };
      localStorage.setItem('agentwrite_user_prefs', JSON.stringify(updated));
      setUser(updated);
      setIsEditing(false);
      
      // Show success message
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('agentwrite_user_prefs');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      <Navigation />
      
      <main className="pt-24 pb-10 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-stone-200 rounded-full transition">
                <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="font-serif text-3xl text-slate-900">Settings</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition ${activeTab === 'account' ? 'bg-white text-slate-900 shadow-sm border border-stone-200' : 'text-slate-500 hover:bg-stone-100'}`}
                >
                    <User size={18} /> Account
                </button>
                <button 
                    onClick={() => setActiveTab('subscription')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition ${activeTab === 'subscription' ? 'bg-white text-slate-900 shadow-sm border border-stone-200' : 'text-slate-500 hover:bg-stone-100'}`}
                >
                    <CreditCard size={18} /> Subscription
                </button>
                <button 
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition ${activeTab === 'preferences' ? 'bg-white text-slate-900 shadow-sm border border-stone-200' : 'text-slate-500 hover:bg-stone-100'}`}
                >
                    <Bell size={18} /> Preferences
                </button>
                
                <div className="pt-8 border-t border-stone-200 mt-8">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition"
                    >
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                
                {/* ACCOUNT TAB */}
                {activeTab === 'account' && (
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 animate-fade-in relative">
                        {showSaveSuccess && (
                            <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-fade-in-down border border-green-100">
                                <CheckCircle2 size={14} /> Changes Saved
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-slate-900">Personal Information</h2>
                                <p className="text-slate-500 text-sm">Manage your profile details.</p>
                            </div>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Edit</button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                    <button onClick={handleSave} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Save</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-3 rounded-lg border border-stone-200 bg-stone-50 disabled:text-slate-500 focus:bg-white focus:border-slate-900 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-3 pl-10 rounded-lg border border-stone-200 bg-stone-50 disabled:text-slate-500 focus:bg-white focus:border-slate-900 outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-stone-100">
                             <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Security</h2>
                             <button className="flex items-center gap-2 text-sm text-slate-700 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition">
                                 <Lock size={16} /> Change Password
                             </button>
                        </div>
                    </div>
                )}

                {/* SUBSCRIPTION TAB */}
                {activeTab === 'subscription' && (
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 animate-fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-slate-900">Current Plan</h2>
                                <p className="text-slate-500 text-sm">Manage your billing and credits.</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Active</span>
                        </div>

                        <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-slate-900 text-lg">{user?.plan || 'Hobby'} Plan</span>
                                <span className="text-slate-900 font-serif text-xl">$14<span className="text-sm text-slate-500 font-sans">/mo</span></span>
                            </div>
                            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mb-2">
                                <div className="bg-slate-900 h-full rounded-full" style={{ width: '35%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{(user?.credits || 0).toLocaleString()} Credits Used</span>
                                <span>{(user?.maxCredits || 225000).toLocaleString()} Total</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => navigate('/pricing')} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">Upgrade Plan</button>
                            <button className="px-6 py-3 border border-stone-200 text-slate-600 rounded-lg font-medium hover:bg-stone-50 transition">Billing Portal</button>
                        </div>
                    </div>
                )}

                 {/* PREFERENCES TAB */}
                 {activeTab === 'preferences' && (
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 animate-fade-in">
                        <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Notifications</h2>
                        <p className="text-slate-500 text-sm mb-8">Control how we contact you.</p>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-slate-900">Email Notifications</div>
                                    <div className="text-xs text-slate-500">Receive weekly summaries and tips.</div>
                                </div>
                                <button 
                                    onClick={() => setNotifications({...notifications, email: !notifications.email})}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-indigo-600' : 'bg-stone-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.email ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-slate-900">Marketing Emails</div>
                                    <div className="text-xs text-slate-500">Updates about new features and promos.</div>
                                </div>
                                <button 
                                    onClick={() => setNotifications({...notifications, marketing: !notifications.marketing})}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.marketing ? 'bg-indigo-600' : 'bg-stone-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.marketing ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                 )}

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
