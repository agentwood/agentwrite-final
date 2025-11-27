import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Rocket, X } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [writingGoal, setWritingGoal] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  const goals = [
    { id: 'novel', label: '📖 Write a novel', description: 'Long-form fiction writing' },
    { id: 'marketing', label: '🎯 Create marketing content', description: 'Ads, emails, social media' },
    { id: 'academic', label: '🎓 Academic/Technical writing', description: 'Research papers, documentation' },
    { id: 'blog', label: '✍️ Blog posts & articles', description: 'Content creation' }
  ];

  const handleGoalSelect = (goalId: string) => {
    setWritingGoal(goalId);
  };

  const handleContinue = () => {
    if (step === 1 && writingGoal) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleFinish = () => {
    // Save preferences to local storage
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('writing_goal', writingGoal);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-12 bg-amber-500' : s < step ? 'w-8 bg-green-500' : 'w-8 bg-gray-600'
                }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          {/* Step 1: Welcome & Goal Setting */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                  <Sparkles className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                  Welcome to AgentWrite!
                </h1>
                <p className="text-slate-600">
                  Let's personalize your experience. What's your writing goal?
                </p>
              </div>

              <div className="grid gap-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal.id)}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${writingGoal === goal.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-900 mb-1">
                          {goal.label}
                        </div>
                        <div className="text-sm text-slate-600">{goal.description}</div>
                      </div>
                      {writingGoal === goal.id && (
                        <div className="p-1 bg-purple-500 rounded-full">
                          <Check className="text-white" size={16} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={handleSkip}
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!writingGoal}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${writingGoal
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Quick Win */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
                  <Rocket className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                  Create your first project
                </h1>
                <p className="text-slate-600">
                  Let's get you started with a quick demo. What would you like to write about?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder={
                      writingGoal === 'novel'
                        ? 'e.g., The Last Guardian'
                        : writingGoal === 'marketing'
                          ? 'e.g., Q1 Marketing Campaign'
                          : writingGoal === 'academic'
                            ? 'e.g., AI Ethics Research Paper'
                            : 'e.g., 10 Tips for Better Writing'
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2">
                        What happens next?
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <Check size={16} className="text-blue-600 mt-0.5 shrink-0" />
                          <span>We'll create a project based on your goal</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={16} className="text-blue-600 mt-0.5 shrink-0" />
                          <span>AI will generate an outline in seconds</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={16} className="text-blue-600 mt-0.5 shrink-0" />
                          <span>You'll see how easy it is to get started</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={handleSkip}
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                  Skip demo
                </button>
                <button
                  onClick={handleContinue}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all"
                >
                  See the Magic
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Feature Highlights */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="animate-bounce inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                  <Check className="text-white" size={32} strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                  🎉 You're all set!
                </h1>
                <p className="text-slate-600">
                  Here's what you can do with AgentWrite
                </p>
              </div>

              <div className="grid gap-4">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500 rounded-lg shrink-0">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">AI Agent Orchestration</h3>
                      <p className="text-sm text-slate-600">
                        Multiple AI agents work together to plan, write, and refine your content
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                      <Rocket className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Multi-Format Export</h3>
                      <p className="text-sm text-slate-600">
                        Export to PDF, create audiobooks, or generate video content
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-500 rounded-lg shrink-0">
                      <Check className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Real-Time Collaboration</h3>
                      <p className="text-sm text-slate-600">
                        Work with your team in real-time on shared projects
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all transform hover:scale-105"
              >
                Start Writing
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;