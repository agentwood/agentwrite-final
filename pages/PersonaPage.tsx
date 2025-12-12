
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, Video, Sparkles, UploadCloud, FileAudio, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { summarizeLecture, generateCheatsheet } from '../services/geminiService';

interface PersonaPageProps {
  type: 'students' | 'creators';
}

const PersonaPage: React.FC<PersonaPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const isStudent = type === 'students';
  
  // -- Student Demo State --
  const [demoStep, setDemoStep] = useState(1); // 1: Upload, 2: Process, 3: Result
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [cheatsheetUrl, setCheatsheetUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleProcessLecture = async () => {
    if (!audioFile) return;
    setIsProcessing(true);
    setDemoStep(2);

    try {
        // 1. Read file to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioFile);
        
        reader.onloadend = async () => {
             const base64data = reader.result as string;
             const base64Content = base64data.split(',')[1];
             const mimeType = audioFile.type || 'audio/mp3';

             // 2. Summarize
             const summaryText = await summarizeLecture(base64Content, mimeType, "");
             setSummary(summaryText);

             const imageUrl = await generateCheatsheet(summaryText);
             setCheatsheetUrl(imageUrl);
             
             setIsProcessing(false);
             setDemoStep(3);
        };
    } catch (e) {
        console.error("Demo failed", e);
        alert("Could not process lecture. Please try a shorter audio clip.");
        setDemoStep(1);
        setIsProcessing(false);
    }
  };

  const content = {
    title: isStudent ? 'Ace Every Assignment.' : 'Script 10x Faster.',
    subtitle: isStudent 
      ? 'The AI writing partner that helps you brainstorm essays, structure papers, and turn lectures into visual study guides.' 
      : 'Turn a rough idea into a polished video script, blog post, or newsletter in minutes, not hours.',
    icon: isStudent ? <GraduationCap size={40} /> : <Video size={40} />,
    heroImage: isStudent 
      ? 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000' 
      : 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=1000',
    features: isStudent 
      ? ['Lecture to Cheatsheet', 'Essay Structuring', 'Citation Helper', 'Grammar Polish'] 
      : ['Viral Hook Generator', 'YouTube Script Format', 'SEO Optimization', 'Tone Matching'],
    cta: isStudent ? 'Start Studying Smarter' : 'Start Creating'
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm mb-8">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      For {isStudent ? 'Students' : 'Creators'}
                   </span>
                </div>
                
                <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                   {content.title}
                </h1>
                
                <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                   {content.subtitle}
                </p>
                
                <div className="space-y-4 mb-10">
                   {content.features.map((feat, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                           <CheckCircle2 size={20} className="text-slate-900" />
                           <span className="text-slate-700 font-medium">{feat}</span>
                       </div>
                   ))}
                </div>

                <button 
                    onClick={() => navigate('/signup')}
                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2 group"
                >
                    {content.cta} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Right Image / Demo */}
            <div className="order-1 lg:order-2 relative">
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full"></div>
                
                {isStudent ? (
                    // STUDENT INTERACTIVE DEMO (Light Mode)
                    <div className="relative bg-white border border-stone-200 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
                        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Instant Study Guide</h3>
                                <p className="text-xs text-slate-500">Audio Lecture → Visual Cheatsheet</p>
                            </div>
                        </div>

                        {/* STEP 1: UPLOAD */}
                        {demoStep === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-stone-50 hover:border-slate-300 transition cursor-pointer group"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 group-hover:text-slate-900 mb-1">
                                        {audioFile ? audioFile.name : "Drop lecture recording here"}
                                    </p>
                                    <p className="text-xs text-slate-400">MP3, WAV, or M4A (Max 5MB)</p>
                                </div>

                                <button 
                                    onClick={handleProcessLecture}
                                    disabled={!audioFile}
                                    className="w-full bg-slate-900 disabled:bg-stone-200 disabled:text-stone-400 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    Generate Cheatsheet <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: PROCESSING */}
                        {demoStep === 2 && (
                            <div className="py-12 text-center animate-fade-in">
                                <div className="relative w-16 h-16 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
                                    <Sparkles size={20} className="absolute inset-0 m-auto text-slate-900 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Analyzing Lecture...</h3>
                                <div className="space-y-2 max-w-[200px] mx-auto">
                                    <p className={`text-xs transition-colors ${summary ? 'text-green-600 font-medium' : 'text-slate-400'}`}>1. Transcribing Audio...</p>
                                    <p className={`text-xs transition-colors ${summary ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>2. Generating Visuals...</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: RESULT */}
                        {demoStep === 3 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="relative aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden border border-stone-200 group">
                                    {cheatsheetUrl ? (
                                        <img src={cheatsheetUrl} alt="Generated Cheatsheet" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a href={cheatsheetUrl || '#'} download="cheatsheet.png" className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                            <Download size={14} /> Download
                                        </a>
                                    </div>
                                </div>
                                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 max-h-32 overflow-y-auto">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <FileAudio size={12} /> Transcript Summary
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                                        {summary}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setDemoStep(1); setAudioFile(null); setSummary(''); setCheatsheetUrl(null); }}
                                    className="w-full border border-stone-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 py-2 rounded-lg text-sm transition"
                                >
                                    Try Another
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // CREATOR DEFAULT HERO IMAGE (Light Mode)
                    <div className="relative bg-white border border-stone-200 rounded-2xl p-2 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                       <img 
                         src={content.heroImage} 
                         alt="Hero" 
                         className="rounded-xl w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-500"
                       />
                       
                       <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-6 rounded-xl shadow-xl max-w-xs border border-stone-200">
                          <div className="flex items-center gap-3 mb-3">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Sparkles size={18} /></div>
                             <div className="text-sm font-bold">AI Analysis</div>
                          </div>
                          <div className="space-y-2">
                             <div className="h-2 bg-stone-100 rounded w-full"></div>
                             <div className="h-2 bg-stone-100 rounded w-2/3"></div>
                          </div>
                       </div>
                    </div>
                )}
            </div>

        </div>
      </main>
      
      {/* Social Proof Strip */}
      <div className="border-t border-stone-200 py-12 bg-white">
         <div className="max-w-7xl mx-auto px-6 flex justify-center gap-12 opacity-30 grayscale">
             {/* Fake Logos for vibe */}
             <span className="text-2xl font-serif font-bold text-slate-900">WIRED</span>
             <span className="text-2xl font-serif font-bold text-slate-900">TheVerge</span>
             <span className="text-2xl font-serif font-bold text-slate-900">TechCrunch</span>
             <span className="text-2xl font-serif font-bold text-slate-900">Medium</span>
         </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PersonaPage;
