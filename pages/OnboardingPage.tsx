import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Feather, BookOpen, PenTool, Coffee, Users } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import Navigation from '../components/Navigation';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('habit');
  const [genre, setGenre] = useState<string[]>([]);
  const [enableCommunity, setEnableCommunity] = useState(true);

  // Fetch user details from Supabase if logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Google Auth typically provides full_name in metadata
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
          if (fullName) {
            setName(fullName);
          } else if (user.email) {
             // Fallback to email prefix
             setName(user.email.split('@')[0]);
          }
        }
      }
    };
    
    // Also check local storage for existing non-auth prefs
    const savedPrefs = localStorage.getItem('agentwrite_user_prefs');
    if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.name && !name) setName(parsed.name);
    }

    loadUserData();
  }, []);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Finish onboarding
      const prefs = { name, goal, genre, community: enableCommunity };
      // Merge with existing if needed
      const existing = localStorage.getItem('agentwrite_user_prefs');
      const base = existing ? JSON.parse(existing) : {};
      
      localStorage.setItem('agentwrite_user_prefs', JSON.stringify({ ...base, ...prefs }));
      navigate('/dashboard');
    }
  };

  const toggleGenre = (g: string) => {
    if (genre.includes(g)) {
      setGenre(genre.filter(i => i !== g));
    } else {
      setGenre([...genre, g]);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />
      
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-12 px-6">
        <div className="w-full max-w-2xl">
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-12 justify-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 w-16 rounded-full transition-colors ${step >= i ? 'bg-slate-900' : 'bg-stone-200'}`}></div>
            ))}
          </div>

          <div className="bg-white p-10 md:p-16 rounded-3xl border border-stone-200 shadow-xl shadow-stone-100 text-center animate-fade-in-up">
            
            {/* Step 1: Introduction */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-200">
                  <Feather size={32} />
                </div>
                <h1 className="font-serif text-4xl text-slate-900 mb-4">Welcome to AgentWrite.</h1>
                <p className="text-slate-500 text-lg mb-10 font-light">Let's personalize your studio. What should we call you?</p>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full max-w-sm mx-auto border-b-2 border-stone-200 p-4 text-center text-3xl font-serif focus:border-slate-900 outline-none bg-transparent placeholder-stone-200 text-slate-900 transition-colors"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="animate-fade-in">
                 <h1 className="font-serif text-3xl text-slate-900 mb-4">What brings you here, {name.split(' ')[0]}?</h1>
                 <p className="text-slate-500 mb-10 font-light">Select your primary focus.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <button 
                      onClick={() => setGoal('novel')}
                      className={`p-6 rounded-xl border transition-all group ${goal === 'novel' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-stone-200 hover:border-slate-300 hover:bg-stone-50'}`}
                    >
                        <BookOpen size={24} className={`mb-4 transition-colors ${goal === 'novel' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <h3 className="font-bold text-slate-900">Finish a Novel</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">I have a manuscript in progress and deadlines to meet.</p>
                    </button>

                    <button 
                      onClick={() => setGoal('habit')}
                      className={`p-6 rounded-xl border transition-all group ${goal === 'habit' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-stone-200 hover:border-slate-300 hover:bg-stone-50'}`}
                    >
                        <Coffee size={24} className={`mb-4 transition-colors ${goal === 'habit' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <h3 className="font-bold text-slate-900">Build a Habit</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">I want to write daily and improve my consistency.</p>
                    </button>

                    <button 
                      onClick={() => setGoal('content')}
                      className={`p-6 rounded-xl border transition-all group ${goal === 'content' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-stone-200 hover:border-slate-300 hover:bg-stone-50'}`}
                    >
                        <PenTool size={24} className={`mb-4 transition-colors ${goal === 'content' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <h3 className="font-bold text-slate-900">Create Content</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Blogs, scripts, and newsletters for my audience.</p>
                    </button>
                 </div>
              </div>
            )}

            {/* Step 3: Genres */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h1 className="font-serif text-3xl text-slate-900 mb-4">Favorite Genres?</h1>
                 <p className="text-slate-500 mb-10 font-light">We'll tune the AI to match the style and tropes you love.</p>
                 
                 <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                    {['Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Non-Fiction', 'Horror', 'Poetry'].map(g => (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={`px-6 py-3 rounded-full border text-sm font-medium transition-all ${genre.includes(g) ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-stone-200 text-slate-600 hover:border-slate-400 hover:bg-stone-50'}`}
                        >
                            {g} {genre.includes(g) && <Check size={14} className="inline ml-1" />}
                        </button>
                    ))}
                 </div>
              </div>
            )}

            {/* Step 4: Community Opt-In */}
            {step === 4 && (
              <div className="animate-fade-in">
                 <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={32} />
                 </div>
                 <h1 className="font-serif text-3xl text-slate-900 mb-4">Join the Critique Circle?</h1>
                 <p className="text-slate-500 mb-8 font-light max-w-md mx-auto">
                   Opt-in to share your work with other writers and receive feedback. You can toggle this off anytime in settings.
                 </p>
                 
                 <div className="flex flex-col items-center gap-4">
                    <button 
                      onClick={() => setEnableCommunity(true)}
                      className={`w-full max-w-sm p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${enableCommunity ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-stone-200 hover:border-slate-300'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${enableCommunity ? 'border-white' : 'border-slate-300'}`}>
                            {enableCommunity && <div className="w-3 h-3 bg-white rounded-full"></div>}
                        </div>
                        <div>
                            <span className="font-bold block text-sm">Yes, enable community features</span>
                            <span className={`text-xs block ${enableCommunity ? 'text-slate-300' : 'text-slate-400'}`}>Access the public feed and peer reviews.</span>
                        </div>
                    </button>

                    <button 
                      onClick={() => setEnableCommunity(false)}
                      className={`w-full max-w-sm p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${!enableCommunity ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-stone-200 hover:border-slate-300'}`}
                    >
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!enableCommunity ? 'border-white' : 'border-slate-300'}`}>
                            {!enableCommunity && <div className="w-3 h-3 bg-white rounded-full"></div>}
                        </div>
                        <div>
                            <span className="font-bold block text-sm">No, keep my workspace private</span>
                            <span className={`text-xs block ${!enableCommunity ? 'text-slate-300' : 'text-slate-400'}`}>Focus mode only. No social features.</span>
                        </div>
                    </button>
                 </div>
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleNext}
                disabled={step === 1 && !name}
                className="bg-slate-900 text-white px-10 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 duration-300"
              >
                {step === 4 ? 'Enter Studio' : 'Continue'} <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;