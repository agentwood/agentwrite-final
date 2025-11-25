import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Clock, Shield, Download, Check, TrendingUp, Video, Headphones, FileText, Activity } from 'lucide-react';
import { CreditTransaction } from '../types';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userCredits, setUserCredits] = useState(0);
  const [maxCredits, setMaxCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [planName, setPlanName] = useState('Hobby');
  
  // Load real data
  useEffect(() => {
      const savedPrefs = localStorage.getItem('agentwrite_user_prefs');
      if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          setUserCredits(parsed.credits || 0);
          setMaxCredits(parsed.maxCredits || 225000);
          setPlanName(parsed.plan || 'Hobby');
          setTransactions(parsed.transactions || []);
      }
  }, []);

  // Calculate Usage Breakdown
  const calculateUsage = (feature: string) => {
      return transactions
        .filter(t => t.feature === feature)
        .reduce((acc, curr) => acc + curr.cost, 0);
  };

  const videoUsage = calculateUsage('Video');
  const audioUsage = calculateUsage('Audio');
  // Simulate text usage as remainder of used credits not accounted for by media, or just random for demo if empty
  const totalUsed = maxCredits - userCredits;
  const textUsage = Math.max(0, totalUsed - (videoUsage + audioUsage));

  const getPercent = (amount: number) => Math.min((amount / maxCredits) * 100, 100);

  const invoices = [
    { id: 'INV-2024-001', date: 'Oct 01, 2024', amount: '$22.00', status: 'Paid' },
    { id: 'INV-2024-002', date: 'Sep 01, 2024', amount: '$22.00', status: 'Paid' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
       <header className="bg-white border-b border-stone-200 px-6 py-4">
         <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
                <ArrowLeft size={18} /> Dashboard
            </button>
            <h1 className="font-serif font-bold text-lg text-slate-900">Account Settings</h1>
            <div className="w-8"></div>
         </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
          
          <div className="grid md:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-white border border-stone-200 font-medium text-slate-900 shadow-sm flex items-center gap-2"><CreditCard size={16} /> Subscription</button>
                  <button className="w-full text-left px-4 py-2 rounded-lg text-slate-500 hover:bg-stone-100 transition flex items-center gap-2"><Shield size={16} /> Security</button>
                  <button className="w-full text-left px-4 py-2 rounded-lg text-slate-500 hover:bg-stone-100 transition flex items-center gap-2"><Activity size={16} /> Activity Log</button>
              </div>

              {/* Content */}
              <div className="md:col-span-2 space-y-8">
                  
                  {/* Current Plan */}
                  <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h3 className="font-serif text-xl text-slate-900 mb-1">{planName} Plan</h3>
                              <p className="text-slate-500 text-sm">Next billing date: Nov 01, 2024</p>
                          </div>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                      </div>
                      
                      {/* Advanced Usage Bar */}
                      <div className="mb-8">
                          <div className="flex justify-between text-sm mb-3">
                              <span className="font-medium text-slate-900 flex items-center gap-2"><TrendingUp size={16} /> Credit Consumption</span>
                              <span className="text-slate-500 font-mono text-xs">{userCredits.toLocaleString()} remaining</span>
                          </div>
                          
                          {/* Multi-color Progress Bar */}
                          <div className="h-4 bg-stone-100 rounded-full overflow-hidden flex mb-3">
                              <div className="h-full bg-rose-500" style={{ width: `${getPercent(videoUsage)}%` }} title="Video"></div>
                              <div className="h-full bg-purple-500" style={{ width: `${getPercent(audioUsage)}%` }} title="Audio"></div>
                              <div className="h-full bg-slate-400" style={{ width: `${getPercent(textUsage)}%` }} title="Text"></div>
                          </div>
                          
                          {/* Legend */}
                          <div className="flex gap-6 text-xs">
                              <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                  <span className="text-slate-600">Video ({videoUsage.toLocaleString()})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                  <span className="text-slate-600">Audio ({audioUsage.toLocaleString()})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                  <span className="text-slate-600">Text/Other ({textUsage.toLocaleString()})</span>
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-3">
                          <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">Upgrade Plan</button>
                          <button className="px-4 py-2 border border-stone-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition">Cancel Subscription</button>
                      </div>
                  </div>
                  
                  {/* Transaction History */}
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                          <h3 className="font-serif text-lg text-slate-900">Transaction History</h3>
                          <span className="text-xs text-slate-400 uppercase tracking-wider">Recent Activity</span>
                      </div>
                      <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                          {transactions.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 text-sm italic">No recent transactions found.</div>
                          ) : (
                              transactions.map((tx, idx) => (
                                <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-stone-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.feature === 'Video' ? 'bg-rose-50 text-rose-600' : tx.feature === 'Audio' ? 'bg-purple-50 text-purple-600' : 'bg-stone-100 text-slate-500'}`}>
                                            {tx.feature === 'Video' ? <Video size={14} /> : tx.feature === 'Audio' ? <Headphones size={14} /> : <FileText size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{tx.details}</p>
                                            <p className="text-xs text-slate-500">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-rose-600 text-xs font-bold font-mono">-{tx.cost.toLocaleString()} CR</span>
                                    </div>
                                </div>
                              ))
                          )}
                      </div>
                  </div>

                  {/* Billing History */}
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
                          <h3 className="font-serif text-lg text-slate-900">Billing History</h3>
                      </div>
                      <div className="divide-y divide-stone-100">
                          {invoices.map(inv => (
                              <div key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition">
                                  <div className="flex items-center gap-4">
                                      <div className="p-2 bg-green-50 text-green-600 rounded-full"><Check size={14} /></div>
                                      <div>
                                          <p className="text-sm font-medium text-slate-900">{inv.amount}</p>
                                          <p className="text-xs text-slate-500">{inv.date}</p>
                                      </div>
                                  </div>
                                  <button className="text-slate-400 hover:text-slate-900 transition">
                                      <Download size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
          </div>
      </main>
    </div>
  );
};

export default ProfilePage;