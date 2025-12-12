import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Sparkles, Volume2, Volume1, VolumeX,
    ChevronRight, BookOpen, Crown, Zap, Ghost,
    Sun, Layout, Plus, PenTool, Loader2,
    Play, Pause, X, Download, Headphones,
    Coffee, Map, Backpack, Wand2, Settings2, Heart, Star, Compass
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { generateStorySegment, generateMultiSpeakerAudio, generateImage, generateCharacter, detectStoryCharacters } from '../services/geminiService';
import { StorySegment, StoryOption, AudioConfig, AudioCharacter } from '../types';

// --- VISUAL EFFECTS ---
const ParticleField = () => {
    const particles = useRef([...Array(30)].map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.1
    }))).current;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            {particles.map((p, i) => (
                <div 
                    key={i}
                    className="absolute rounded-full bg-amber-200 animate-pulse"
                    style={{
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        opacity: p.opacity,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}
        </div>
    );
};

// --- AUDIO DECODING HELPERS ---
function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePCM(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;
    
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

// --- TYPEWRITER COMPONENT ---
const TypewriterText = ({ text, onComplete, speed = 20 }: { text: string, onComplete?: () => void, speed?: number }) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text]);
    return <>{displayedText}</>;
};

// --- AUDIO STUDIO MODAL ---
const AudioStudio = ({ storyText, onClose }: { storyText: string, onClose: () => void }) => {
    const [step, setStep] = useState<'analyzing' | 'setup' | 'generating' | 'player'>('analyzing');
    
    // Simplified Controls
    const [pacing, setPacing] = useState(50); // 0-100
    const [smoothness, setSmoothness] = useState(80); // 0-100
    const [style, setStyle] = useState<'Cinematic' | 'Audiobook' | 'Radio'>('Cinematic');
    
    // Internal Config
    const [config, setConfig] = useState<AudioConfig>({
        mode: 'multi',
        characters: [],
        mood: 'warm',
        pacing: 'natural'
    });

    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Playback State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1.0);

    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const startTimeRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    // Initial Load - AI Director Analysis
    useEffect(() => {
        const analyze = async () => {
            if (storyText) {
                try {
                    // 1. Detect Characters
                    const { characters } = await detectStoryCharacters(storyText);
                    
                    // 2. Simple Mood Heuristic
                    const lowerText = storyText.toLowerCase();
                    let detectedMood: any = 'warm';
                    if (lowerText.includes('dark') || lowerText.includes('shadow') || lowerText.includes('fear') || lowerText.includes('blood')) detectedMood = 'dark';
                    else if (lowerText.includes('fight') || lowerText.includes('run') || lowerText.includes('fast')) detectedMood = 'exciting';
                    else if (lowerText.includes('sleep') || lowerText.includes('calm') || lowerText.includes('quiet') || lowerText.includes('peace')) detectedMood = 'calm';

                    // 3. Auto-Cast Voices
                    const mapped: AudioCharacter[] = characters.map((c, i) => ({
                        name: c.name,
                        gender: (c.gender as 'male' | 'female' | 'neutral'),
                        voiceId: c.gender === 'female' ? (i % 2 === 0 ? 'Kore' : 'Aoede') : (i % 2 === 0 ? 'Fenrir' : 'Charon')
                    }));

                    setConfig({
                        mode: characters.length > 0 ? 'multi' : 'single',
                        characters: mapped,
                        mood: detectedMood,
                        pacing: 'natural'
                    });
                    
                    // Artificial delay for "AI Thinking" UX
                    setTimeout(() => setStep('setup'), 1200);

                } catch (e) {
                    console.error("Analysis failed", e);
                    setStep('setup');
                }
            }
        };
        analyze();
    }, [storyText]);

    const handleGenerate = async () => {
        setStep('generating');
        try {
            // Map pacing slider to config
            let pacingConfig: 'slow' | 'natural' | 'fast' = 'natural';
            if (pacing < 30) pacingConfig = 'slow';
            if (pacing > 70) pacingConfig = 'fast';
            
            const finalConfig = config.mode === 'single' 
                ? { ...config, pacing: pacingConfig, characters: [{ name: 'Narrator', voiceId: config.characters[0]?.voiceId || 'Kore' }] }
                : { ...config, pacing: pacingConfig };

            const pcmBase64 = await generateMultiSpeakerAudio(storyText, finalConfig as any);
            setAudioUrl(pcmBase64); 
            setStep('player');
        } catch (e) {
            console.error(e);
            setStep('setup');
            alert("Audio generation failed. Please try again.");
        }
    };

    // Update Progress Loop
    const updateProgress = () => {
        if (audioContextRef.current && isPlaying) {
            const now = audioContextRef.current.currentTime;
            const elapsed = now - startTimeRef.current;
            if (elapsed <= duration) {
                setCurrentTime(elapsed);
                animationFrameRef.current = requestAnimationFrame(updateProgress);
            } else {
                setIsPlaying(false);
                setCurrentTime(duration);
            }
        }
    };

    useEffect(() => {
        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying, duration]);

    // Handle Volume Change
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume;
        }
    }, [volume]);

    // Audio Player Logic
    const togglePlay = async () => {
        if (isPlaying) {
            if (sourceRef.current) {
                sourceRef.current.stop();
                sourceRef.current = null;
                pauseTimeRef.current = audioContextRef.current ? audioContextRef.current.currentTime - startTimeRef.current : 0;
            }
            setIsPlaying(false);
        } else {
            if (!audioUrl) return;
            
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            let ctx = audioContextRef.current;
            if(!ctx || ctx.state === 'closed') {
                 ctx = new AudioContextClass({ sampleRate: 24000 });
                 audioContextRef.current = ctx;
            }

            let buffer = audioBuffer;
            if (!buffer) {
                const bytes = decodeBase64(audioUrl);
                buffer = await decodePCM(bytes, ctx);
                setAudioBuffer(buffer);
            }

            if (buffer) {
                setDuration(buffer.duration);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                const gainNode = ctx.createGain();
                gainNode.gain.value = volume;
                gainNodeRef.current = gainNode;
                source.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                if (currentTime >= buffer.duration) {
                     pauseTimeRef.current = 0;
                     setCurrentTime(0);
                }

                const offset = pauseTimeRef.current % buffer.duration;
                source.start(0, offset);
                startTimeRef.current = ctx.currentTime - offset;
                
                sourceRef.current = source;
                setIsPlaying(true);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        pauseTimeRef.current = time;
        if (isPlaying) {
            if (sourceRef.current) sourceRef.current.stop();
            togglePlay(); 
             setIsPlaying(true); 
        }
    };

    const formatTime = (t: number) => {
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch(e) {}
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 text-white flex flex-col animate-fade-in font-sans backdrop-blur-xl">
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-center border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl tracking-wide">AI Director</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Neural Audio Engine</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    
                    {step === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center space-y-6 text-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-2 border-amber-500/10 border-t-amber-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Wand2 size={24} className="text-amber-500 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-white mb-2">Analyzing Scene...</h3>
                                <p className="text-white/40 text-sm">Identifying speakers and emotional context.</p>
                            </div>
                        </div>
                    )}
                    
                    {step === 'setup' && (
                        <div className="animate-fade-in-up space-y-8">
                            
                            {/* AI PROPOSAL */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-24 bg-amber-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                                    <Sparkles size={12} className="text-amber-500" /> Proposed Cast
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {config.characters.length > 0 ? config.characters.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                            <span className="font-bold text-white">{c.name}</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                            <span className="font-bold text-white">Narrator</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CONTROLS */}
                            <div className="space-y-6">
                                {/* Style Selector */}
                                <div className="grid grid-cols-3 gap-3 p-1 bg-white/5 rounded-xl border border-white/5">
                                    {['Cinematic', 'Audiobook', 'Radio'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => setStyle(s as any)}
                                            className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${style === s ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                {/* Sliders */}
                                <div className="space-y-6 bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Pacing</label>
                                            <span className="text-xs text-white/40 font-mono">{pacing}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" value={pacing} onChange={(e) => setPacing(Number(e.target.value))}
                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Stability & Smoothness</label>
                                            <span className="text-xs text-white/40 font-mono">{smoothness}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" value={smoothness} onChange={(e) => setSmoothness(Number(e.target.value))}
                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-amber-50 transition transform hover:-translate-y-1 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                            >
                                <Play size={20} fill="black" /> Generate Audio
                            </button>
                        </div>
                    )}

                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Headphones size={32} className="text-amber-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-serif text-white">Synthesizing...</h3>
                                <p className="text-white/40 text-sm">Directing actors and mastering audio.</p>
                            </div>
                        </div>
                    )}

                    {step === 'player' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-[#130822] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0"></div>
                                
                                <div className="relative z-10 w-40 h-40 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-900 shadow-2xl mb-8 flex items-center justify-center border border-white/10 group">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Volume2 size={64} className="text-white opacity-90 drop-shadow-lg" />
                                </div>

                                <div className="relative z-10 w-full space-y-6">
                                    {/* Scrubber */}
                                    <div className="space-y-2">
                                        <input 
                                            type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                                        />
                                        <div className="flex justify-between text-[10px] font-mono text-white/40">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-center gap-8">
                                        <button onClick={() => setCurrentTime(Math.max(0, currentTime - 5))} className="text-white/50 hover:text-white transition"><div className="text-xs font-bold">-5s</div></button>
                                        <button 
                                            onClick={togglePlay}
                                            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                        >
                                            {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                                        </button>
                                        <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))} className="text-white/50 hover:text-white transition"><div className="text-xs font-bold">+5s</div></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button onClick={() => setStep('setup')} className="flex-1 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-bold text-sm">
                                    Adjust Settings
                                </button>
                                <button className="flex-1 py-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition font-bold text-sm shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2">
                                    <Download size={16} /> Save to Library
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AICreatePage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'landing' | 'wizard'>('landing');
  
  // Theme State
  const [darkMode, setDarkMode] = useState(true);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1); 
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [protagonistName, setProtagonistName] = useState('');
  const [protagonistTrait, setProtagonistTrait] = useState('');
  const [customWorldDescription, setCustomWorldDescription] = useState('');
  
  // Story State
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [historyText, setHistoryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Weaving reality...');
  const [areChoicesVisible, setAreChoicesVisible] = useState(false);
  
  // Audio Studio State
  const [showAudioStudio, setShowAudioStudio] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => { scrollToBottom(); }, [segments, isGenerating, areChoicesVisible]);

  // Updated Genre List per user request
  const GENRES = [
      { id: 'custom', label: 'Create from Scratch', icon: PenTool, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=600&auto=format&fit=crop', desc: 'Design Your Own' },
      { id: 'cozy', label: 'Cozy Escapism', icon: Coffee, image: 'https://images.unsplash.com/photo-1517856497829-3047e3fffae1?q=80&w=600&auto=format&fit=crop', desc: 'Warm & Low-Stakes' },
      { id: 'fantasy', label: 'Immersive Fantasy', icon: Crown, image: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop', desc: 'Dragons & Destiny' },
      { id: 'scifi', label: 'Atmospheric Sci-Fi', icon: Zap, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop', desc: 'High Tech, Low Life' },
      { id: 'drama', label: 'Character Diaries', icon: BookOpen, image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=600&auto=format&fit=crop', desc: 'Emotional Journeys' },
      { id: 'adventure', label: 'Guided Adventures', icon: Map, image: 'https://images.unsplash.com/photo-1502472584811-0a2f2ca84465?q=80&w=600&auto=format&fit=crop', desc: 'Interactive Stories' },
      { id: 'horror', label: 'Comfort Horror', icon: Ghost, image: 'https://images.unsplash.com/photo-1509557965875-b88c8a35e694?q=80&w=600&auto=format&fit=crop', desc: 'Folk & Spooky' },
      { id: 'ya', label: 'Coming of Age', icon: Backpack, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop', desc: 'Young Adult Fiction' },
      { id: 'meditative', label: 'Meditative', icon: Sparkles, image: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?q=80&w=600&auto=format&fit=crop', desc: 'Mind-Expanding' },
  ];

  const handleGenerateIdentity = async () => {
    setIsGenerating(true);
    try {
        const genreLabel = selectedGenre?.id === 'custom' && customWorldDescription 
            ? `Custom Genre: ${customWorldDescription}` 
            : selectedGenre?.label || "General Fiction";
            
        const identity = await generateCharacter(genreLabel);
        setProtagonistName(identity.name);
        setProtagonistTrait(identity.trait);
    } catch(e) {
        console.error(e);
        alert("Could not generate identity.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleStartStory = async () => {
    if (!protagonistName.trim()) return;
    setWizardStep(3);
    setIsGenerating(true);
    setAreChoicesVisible(false);
    
    try {
        const genrePrompt = selectedGenre?.id === 'custom' ? `Custom World: ${customWorldDescription}` : selectedGenre.label;
        const stylePrompt = `Genre/Setting: ${genrePrompt}. Tone: Immersive, Cinematic.`;
        const premise = `The protagonist is ${protagonistName}, who is known for being ${protagonistTrait || 'mysterious'}. Start the story in medias res.`;
        
        const firstSegment = await generateStorySegment("", `START STORY: ${premise}`, stylePrompt);
        setSegments([firstSegment]);
        setHistoryText(firstSegment.content);
        
        generateImage(firstSegment.visualPrompt).then(url => {
             setSegments(prev => prev.map(s => s.id === firstSegment.id ? {...s, imageUrl: url} : s));
        }).catch(console.error);

    } catch (e) {
        alert("Failed to start story.");
        setWizardStep(2);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleChoice = async (choice: StoryOption) => {
    setIsGenerating(true);
    setAreChoicesVisible(false);
    
    try {
        const genrePrompt = selectedGenre?.id === 'custom' ? `Custom World: ${customWorldDescription}` : selectedGenre.label;
        const stylePrompt = `Genre: ${genrePrompt}.`;
        const nextSegment = await generateStorySegment(historyText, choice.text, stylePrompt);
        setSegments(prev => [...prev, nextSegment]);
        setHistoryText(prev => prev + "\n\n" + nextSegment.content);

        generateImage(nextSegment.visualPrompt).then(url => {
             setSegments(prev => prev.map(s => s.id === nextSegment.id ? {...s, imageUrl: url} : s));
        }).catch(console.error);

    } catch (e) {
        alert("Failed to generate next segment.");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- VIEW: LANDING ---
  if (view === 'landing') {
      return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Navigation />
            <div className="min-h-screen bg-[#020305] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans pt-32">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F11] via-[#020305] to-black opacity-90"></div>
                <ParticleField />
            </div>
            
            <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Sparkles size={12} className="animate-pulse" /> The Architect Engine
                </div>
                
                <h1 className="font-serif text-6xl md:text-8xl mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-200 to-stone-500 drop-shadow-2xl">
                    Where Imagination <br/> Meets <span className="italic text-amber-400 font-light">Infinite</span> Reality.
                </h1>
                
                <p className="text-stone-400 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-light">
                    Craft immersive narratives. Weave characters, visualize worlds, and direct full-cast audio dramas.
                </p>
                
                <button 
                    onClick={() => setView('wizard')} 
                    className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg tracking-wide overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                >
                    <span className="relative flex items-center gap-3">
                        Begin Your Odyssey <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
            </div>
            <Footer />
        </div>
      );
  }

  // --- VIEW: GENRE SELECTION ---
  if (wizardStep === 1) {
      return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Navigation />
            <div className="min-h-screen bg-[#050505] p-6 pt-32 text-white font-sans relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] z-0"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center gap-6 mb-12">
                     <button onClick={() => setView('landing')} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white border border-white/5"><ArrowLeft size={20} /></button>
                     <div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-2 text-white">Select a World</h2>
                        <p className="text-white/40 font-light text-lg">Where does your story begin?</p>
                     </div>
                </div>
                
                {/* DENSE GRID LAYOUT */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {GENRES.map(g => (
                        <div key={g.id} onClick={() => { setSelectedGenre(g); setWizardStep(2); }} className="group cursor-pointer relative aspect-[4/5] rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 shadow-2xl hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:-translate-y-1">
                            <img src={g.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-500">
                                <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-black font-bold shadow-lg transition-all duration-300 ${g.id === 'custom' ? 'bg-amber-400 rotate-3' : 'bg-white group-hover:bg-amber-400'}`}>
                                    <g.icon size={16} />
                                </div>
                                <h3 className="font-serif text-lg font-bold leading-tight mb-1 text-white group-hover:text-amber-50">{g.label}</h3>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold group-hover:text-white transition-colors">{g.desc}</p>
                            </div>
                            
                            {/* Hover Border Effect */}
                            <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/50 rounded-xl transition-all duration-300 pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
            <Footer />
        </div>
      );
  }

  // --- VIEW: CHARACTER CREATION ---
  if (wizardStep === 2) {
      return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Navigation />
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative pt-32">
             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/5 via-[#050505] to-[#050505] z-0"></div>
            
            <div className="w-full max-w-lg bg-[#0F0F11] p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setWizardStep(1)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition"><ArrowLeft size={20} /></button>
                    <h2 className="font-serif text-3xl text-white">The Protagonist</h2>
                </div>
                
                {selectedGenre?.id === 'custom' && (
                    <div className="mb-8">
                         <label className="block text-xs font-bold uppercase tracking-widest text-amber-500/80 mb-3">World Premise</label>
                         <textarea 
                            placeholder="Describe your world..." 
                            value={customWorldDescription} 
                            onChange={e => setCustomWorldDescription(e.target.value)} 
                            className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-amber-500 transition h-24 text-sm resize-none placeholder-white/20"
                        />
                    </div>
                )}

                <button 
                    onClick={handleGenerateIdentity}
                    disabled={isGenerating}
                    className="w-full mb-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-3 text-sm font-bold tracking-wide group"
                >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-400 group-hover:scale-125 transition-transform" />}
                    Auto-Generate Identity
                </button>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Name</label>
                        <input type="text" value={protagonistName} onChange={e => setProtagonistName(e.target.value)} className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-amber-500 transition placeholder-white/20" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Core Trait</label>
                        <input type="text" value={protagonistTrait} onChange={e => setProtagonistTrait(e.target.value)} className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-amber-500 transition placeholder-white/20" />
                    </div>
                    <button onClick={handleStartStory} disabled={!protagonistName} className="w-full bg-white text-black font-bold py-5 rounded-xl mt-4 hover:bg-amber-400 hover:scale-[1.02] transition-all shadow-lg text-lg">Initialize Narrative</button>
                </div>
            </div>
            </div>
            <Footer />
        </div>
      );
  }

  // --- VIEW: STORY FEED ---
  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
        <Navigation />
        <div className="h-screen bg-[#020305] text-white flex flex-col font-sans relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 w-full z-40 p-6 flex justify-between items-center bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none">
             <button onClick={() => setView('landing')} className="pointer-events-auto p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 text-white transition"><Layout size={20} /></button>
             <div className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 text-amber-500 shadow-lg">{selectedGenre?.label}</div>
             <button onClick={() => setDarkMode(!darkMode)} className="pointer-events-auto p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 text-white transition"><Sun size={20} /></button>
        </div>

        {/* Content Feed */}
        <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pb-40">
            {segments.map((segment, idx) => (
                <div key={segment.id} className="relative group animate-fade-in mb-1">
                    {/* Visual */}
                    <div className="w-full aspect-[21/9] md:aspect-[2.5/1] relative overflow-hidden bg-zinc-900 border-b border-white/5">
                        {segment.imageUrl ? (
                            <img src={segment.imageUrl} className="w-full h-full object-cover opacity-50 mask-image-gradient" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><Loader2 className="animate-spin" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020305] via-[#020305]/60 to-transparent"></div>
                    </div>
                    
                    {/* Text */}
                    <div className="max-w-4xl mx-auto px-8 -mt-32 relative z-10 pb-16">
                        <div className="font-serif text-xl md:text-2xl leading-relaxed text-stone-200 whitespace-pre-line drop-shadow-md">
                            {idx === segments.length - 1 && !areChoicesVisible ? (
                                <TypewriterText text={segment.content} onComplete={() => setAreChoicesVisible(true)} speed={15} />
                            ) : (
                                segment.content
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            {isGenerating && (
                <div className="py-32 flex flex-col items-center justify-center text-amber-500 animate-pulse">
                    <Sparkles size={32} className="mb-6 opacity-80" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">{loadingMessage}</p>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Choices / Actions */}
        {!isGenerating && areChoicesVisible && segments.length > 0 && (
            <div className="absolute bottom-0 w-full z-50 p-6 bg-gradient-to-t from-black via-black/95 to-transparent pt-32 pb-12">
                <div className="max-w-5xl mx-auto">
                    {/* Audio Studio Trigger */}
                    <div className="flex justify-center mb-10">
                        <button 
                            onClick={() => setShowAudioStudio(true)}
                            className="bg-indigo-600/90 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-3 transition hover:-translate-y-1 backdrop-blur-md"
                        >
                            <Headphones size={16} /> Open Audio Studio
                        </button>
                    </div>

                    {/* Choices */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {segments[segments.length - 1].choices.map((choice, i) => (
                            <button key={i} onClick={() => handleChoice(choice)} className="text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 p-6 rounded-xl transition-all group backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-2 block group-hover:text-amber-400">{choice.type}</span>
                                <span className="text-sm font-medium text-stone-300 group-hover:text-white leading-relaxed">{choice.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* AUDIO STUDIO OVERLAY */}
        {showAudioStudio && (
            <AudioStudio 
                storyText={historyText} 
                onClose={() => setShowAudioStudio(false)} 
            />
        )}
        </div>
        <Footer />
    </div>
  );
};

export default AICreatePage;
