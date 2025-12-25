'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Sparkles, Mic2, Save, Lock } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import LockedFeature from '@/app/components/LockedFeature';
import { getSubscriptionStatus, type PlanId } from '@/lib/subscription';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
    // Fetch user subscription status
    getSubscriptionStatus(null).then(status => {
      setCurrentPlan(status.planId);
      setIsPremium(status.planId !== 'free');
    });
  }, []);

  const [settings, setSettings] = useState({
    profile: {
      displayName: 'SparklyCamel',
      email: 'user@example.com',
      bio: '',
      username: 'sparklycamel',
    },
    notifications: {
      email: true,
      push: false,
      marketing: false,
    },
    privacy: {
      publicProfile: true,
      showActivity: false,
      allowMessages: true,
    },
    audio: {
      defaultVoice: 'Alex',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      autoPlay: false,
      voiceMode: 'both', // 'voice-first', 'text-first', 'both'
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'audio', label: 'Audio', icon: Mic2 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Settings saved!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
          </div>
          <p className="text-zinc-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-zinc-200 rounded-2xl p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Profile Settings</h2>
                    <button
                      onClick={() => handleSave('profile')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, displayName: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.profile.username}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, username: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={settings.profile.bio}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, bio: e.target.value }
                      })}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Notification Settings</h2>
                    <button
                      onClick={() => handleSave('notifications')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                      <div>
                        <div className="font-medium text-zinc-900">Email Notifications</div>
                        <div className="text-sm text-zinc-500">Receive updates via email</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: e.target.checked }
                        })}
                        className="w-5 h-5 text-indigo-600 rounded" 
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                      <div>
                        <div className="font-medium text-zinc-900">Push Notifications</div>
                        <div className="text-sm text-zinc-500">Get notified in real-time</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: e.target.checked }
                        })}
                        className="w-5 h-5 text-indigo-600 rounded" 
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                      <div>
                        <div className="font-medium text-zinc-900">Marketing Emails</div>
                        <div className="text-sm text-zinc-500">Receive product updates and tips</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.marketing}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, marketing: e.target.checked }
                        })}
                        className="w-5 h-5 text-indigo-600 rounded" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Privacy Settings</h2>
                    <button
                      onClick={() => handleSave('privacy')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                      <div>
                        <div className="font-medium text-zinc-900">Public Profile</div>
                        <div className="text-sm text-zinc-500">Allow others to see your profile</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.publicProfile}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, publicProfile: e.target.checked }
                        })}
                        className="w-5 h-5 text-indigo-600 rounded" 
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                      <div>
                        <div className="font-medium text-zinc-900">Show Activity Status</div>
                        <div className="text-sm text-zinc-500">Let others see when you're online</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.showActivity}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, showActivity: e.target.checked }
                        })}
                        className="w-5 h-5 text-indigo-600 rounded" 
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                      <div>
                        <div className="font-medium text-zinc-900">Allow Messages</div>
                        <div className="text-sm text-zinc-500">Let others send you messages</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.allowMessages}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, allowMessages: e.target.checked }
                        })}
                        className="w-5 h-5 text-indigo-600 rounded" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Audio Settings</h2>
                    <button
                      onClick={() => handleSave('audio')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                  
                  {/* Basic Settings - Always Available */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Voice Mode</label>
                      <select
                        value={settings.audio.voiceMode}
                        onChange={(e) => setSettings({
                          ...settings,
                          audio: { ...settings.audio, voiceMode: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      >
                        <option value="both">Both (Text + Voice)</option>
                        <option value="voice-first">Voice First (Auto-play voice)</option>
                        <option value="text-first">Text First (Show text, optional voice)</option>
                      </select>
                      <p className="text-xs text-zinc-500 mt-1">
                        Choose how characters respond: voice automatically, text only, or both
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Default Voice
                      </label>
                      <select 
                        value={settings.audio.defaultVoice}
                        onChange={(e) => setSettings({
                          ...settings,
                          audio: { ...settings.audio, defaultVoice: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      >
                        <option value="Alex">Alex (Neutral)</option>
                        <option value="James">James (Professional Male)</option>
                        <option value="Michael">Michael (Warm Male)</option>
                        <option value="David">David (Deep Male)</option>
                        <option value="Sarah">Sarah (Professional Female)</option>
                        <option value="Emily">Emily (Warm Female)</option>
                        <option value="Jennifer">Jennifer (Sophisticated Female)</option>
                        <option value="Lisa">Lisa (Gentle Female)</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50">
                    <div>
                      <div className="font-medium text-zinc-900">Auto-play Voice</div>
                      <div className="text-sm text-zinc-500">Automatically play character responses</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.audio.autoPlay}
                      onChange={(e) => setSettings({
                        ...settings,
                        audio: { ...settings.audio, autoPlay: e.target.checked }
                      })}
                      className="w-5 h-5 text-indigo-600 rounded" 
                    />
                  </label>

                  {/* Advanced Settings - Premium Only */}
                  <div className="pt-4 border-t border-zinc-200">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-zinc-900">Advanced Voice Settings</h3>
                      {!isPremium && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>

                    {isPremium ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Voice Speed: {settings.audio.voiceSpeed}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.audio.voiceSpeed}
                            onChange={(e) => setSettings({
                              ...settings,
                              audio: { ...settings.audio, voiceSpeed: parseFloat(e.target.value) }
                            })}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-zinc-500 mt-1">
                            <span>Slow</span>
                            <span>Normal</span>
                            <span>Fast</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Voice Pitch: {settings.audio.voicePitch}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.audio.voicePitch}
                            onChange={(e) => setSettings({
                              ...settings,
                              audio: { ...settings.audio, voicePitch: parseFloat(e.target.value) }
                            })}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-zinc-500 mt-1">
                            <span>Low</span>
                            <span>Normal</span>
                            <span>High</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <LockedFeature
                        featureName="Advanced Voice Settings"
                        planRequired="starter"
                        className="min-h-[200px]"
                      >
                        <div className="space-y-4 p-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                              Voice Speed: 1.0x
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value="1.0"
                              disabled
                              className="w-full opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                              Voice Pitch: 1.0x
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value="1.0"
                              disabled
                              className="w-full opacity-50"
                            />
                          </div>
                        </div>
                      </LockedFeature>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-zinc-900">Billing & Subscription</h2>
                  
                  {/* Current Plan */}
                  <div className={`bg-gradient-to-r ${isPremium ? 'from-indigo-50 to-purple-50 border-indigo-200' : 'from-zinc-50 to-zinc-100 border-zinc-200'} border rounded-2xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-zinc-900 text-lg">
                          {currentPlan === 'free' ? 'Free Plan' : currentPlan === 'starter' ? 'Talkie+ Standard' : 'Talkie+ Pro'}
                        </div>
                        <div className="text-sm text-zinc-600">
                          {currentPlan === 'free' ? 'Free Forever' : currentPlan === 'starter' ? '$9.99/month' : '$24.99/month'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${isPremium ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-700'} text-sm font-medium rounded-full`}>
                        {isPremium ? 'Active' : 'Free'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-zinc-600 mb-4">
                      {currentPlan === 'free' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">Limited chat quota</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">With Ads</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">Limited chat inspirations</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">Limited Edit</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">Limited Recall</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Unlimited chat quota</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Ad-free</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Unlimited chat inspirations</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Unlimited Edit</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Unlimited Recall</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Talkie+ benefits on Talkie App</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {isPremium ? (
                        <>
                          <button className="flex-1 px-4 py-2 bg-white border border-zinc-300 text-zinc-900 rounded-lg font-medium hover:bg-zinc-50 transition-colors">
                            Manage Subscription
                          </button>
                          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/pricing"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-colors text-center"
                        >
                          Upgrade to Premium
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Available Plans */}
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-4">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Free Plan */}
                      <div className="border border-zinc-200 rounded-xl p-4">
                        <div className="font-semibold text-zinc-900 mb-1">Free</div>
                        <div className="text-2xl font-bold text-zinc-900 mb-2">Free<span className="text-sm font-normal text-zinc-600"> Forever</span></div>
                        <p className="text-xs text-zinc-500 mb-4">Start for free, no credit card needed.</p>
                        <ul className="space-y-1 text-xs text-zinc-600 mb-4">
                          <li>• Limited chat quota</li>
                          <li>• With Ads</li>
                          <li>• Limited chat inspirations</li>
                          <li>• Limited Edit</li>
                          <li>• Limited Recall</li>
                        </ul>
                        <button 
                          disabled={currentPlan === 'free'}
                          className={`w-full px-4 py-2 border border-zinc-300 text-zinc-900 rounded-lg font-medium transition-colors text-sm ${
                            currentPlan === 'free' 
                              ? 'bg-zinc-100 cursor-default' 
                              : 'hover:bg-zinc-50'
                          }`}
                        >
                          {currentPlan === 'free' ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>

                      {/* Starter Plan */}
                      <div className="border-2 border-indigo-500 rounded-xl p-4 bg-indigo-50">
                        <div className="font-semibold text-zinc-900 mb-1">Talkie+ Standard</div>
                        <div className="text-2xl font-bold text-zinc-900 mb-2">$9.99<span className="text-sm font-normal text-zinc-600">/month</span></div>
                        <p className="text-xs text-zinc-500 mb-4">Unlock the full capabilities of Talkie!</p>
                        <ul className="space-y-1 text-xs text-zinc-600 mb-4">
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Unlimited chat quota
                          </li>
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Ad-free
                          </li>
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Unlimited chat inspirations
                          </li>
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Unlimited Edit
                          </li>
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Unlimited Recall
                          </li>
                        </ul>
                        <button 
                          disabled={currentPlan === 'starter'}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            currentPlan === 'starter'
                              ? 'bg-indigo-100 text-indigo-700 cursor-default'
                              : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
                          }`}
                        >
                          {currentPlan === 'starter' ? 'Current Plan' : 'Upgrade'}
                        </button>
                      </div>

                      {/* Pro Plan */}
                      <div className="border border-zinc-200 rounded-xl p-4">
                        <div className="font-semibold text-zinc-900 mb-1">Talkie+ Pro</div>
                        <div className="text-2xl font-bold text-zinc-900 mb-2">$24.99<span className="text-sm font-normal text-zinc-600">/month</span></div>
                        <p className="text-xs text-zinc-500 mb-4">Unlock the full capabilities of Talkie!</p>
                        <ul className="space-y-1 text-xs text-zinc-600 mb-4">
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Everything in Standard
                          </li>
                          <li className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            More exciting benefits ahead...
                          </li>
                          <li className="text-zinc-400 text-xs mt-2">Coming Soon</li>
                        </ul>
                        <button className="w-full px-4 py-2 bg-zinc-200 text-zinc-500 rounded-lg font-medium cursor-not-allowed text-sm" disabled>
                          Coming Soon
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-4">Payment Method</h3>
                    <div className="p-4 border border-zinc-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-zinc-900">•••• •••• •••• 4242</div>
                          <div className="text-sm text-zinc-500">Expires 12/25</div>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

