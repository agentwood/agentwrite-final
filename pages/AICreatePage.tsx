
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Sparkles, Play, Volume2, Video, BookOpen,
    Loader2, Save, Share2, Mic, RefreshCw, ChevronRight,
    Ghost, Heart, Rocket, Search, Sword, Theater, PenTool, Image as ImageIcon, Pause, Square
} from 'lucide-react';
import { generateStorySegment, generateSpeech, generateVideo, generateImage } from '../services/geminiService';
import { StorySegment, StoryOption } from '../types';
import Navigation from '../components/Navigation';

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
    // Gemini TTS returns mono (1 channel) by default
    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;

    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert Int16 to Float32 [-1.0, 1.0]
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const AICreatePage = () => {
    const navigate = useNavigate();

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1); // 1: Genre, 2: Tone, 3: Premise, 4: Active
    const [genre, setGenre] = useState('');
    const [tone, setTone] = useState('');
    const [premise, setPremise] = useState('');

    // Story State
    const [segments, setSegments] = useState<StorySegment[]>([]);
    const [historyText, setHistoryText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);

    // Media State for Active Segment
    const [activeMedia, setActiveMedia] = useState<{ audio?: string, video?: string, image?: string }>({});
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [segments]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => stopAudio();
    }, []);

    // --- AUDIO PLAYER CONTROL ---
    const stopAudio = () => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch (e) { }
            audioSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsPlayingAudio(false);
    };

    const playAudio = async (base64PCM: string) => {
        stopAudio(); // Stop any existing
        setIsPlayingAudio(true);

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            const bytes = decodeBase64(base64PCM);
            const buffer = await decodePCM(bytes, ctx);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            source.onended = () => setIsPlayingAudio(false);

            source.start(0);
            audioSourceRef.current = source;
        } catch (e) {
            console.error("Failed to play PCM audio", e);
            setIsPlayingAudio(false);
            alert("Audio playback failed.");
        }
    };

    // --- WIZARD DATA ---
    const GENRES = [
        { id: 'mystery', label: 'Mystery Thriller', icon: Search, color: 'bg-indigo-50 text-indigo-600', desc: 'Suspense, clues, and twists.' },
        { id: 'fantasy', label: 'High Fantasy', icon: Sword, color: 'bg-amber-50 text-amber-600', desc: 'Magic, dragons, and quests.' },
        { id: 'romance', label: 'Modern Romance', icon: Heart, color: 'bg-rose-50 text-rose-600', desc: 'Love, heartbreak, and passion.' },
        { id: 'scifi', label: 'Hard Sci-Fi', icon: Rocket, color: 'bg-cyan-50 text-cyan-600', desc: 'Space, tech, and the future.' },
        { id: 'horror', label: 'Cosmic Horror', icon: Ghost, color: 'bg-slate-800 text-slate-200', desc: 'Fear, shadows, and the unknown.' },
        { id: 'drama', label: 'Period Drama', icon: Theater, color: 'bg-purple-50 text-purple-600', desc: 'History, society, and intrigue.' },
        { id: 'custom', label: 'Start from Scratch', icon: PenTool, color: 'bg-stone-100 text-stone-600', desc: 'No presets. You define the rules.' },
    ];

    const TONES = [
        { id: 'dark', label: 'Dark & Gritty', desc: 'Serious, visceral, realistic.' },
        { id: 'witty', label: 'Witty & Sarcastic', desc: 'Humorous, sharp, banter-heavy.' },
        { id: 'wholesome', label: 'Wholesome', desc: 'Cozy, optimistic, lighthearted.' },
        { id: 'epic', label: 'Epic & Grand', desc: 'Cinematic, sweeping, intense.' },
        { id: 'surreal', label: 'Surreal', desc: 'Dreamlike, weird, abstract.' },
    ];

    const triggerAutoImage = async (segment: StorySegment) => {
        setIsGeneratingMedia(true);
        try {
            const imageUrl = await generateImage(segment.visualPrompt);
            setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, imageUrl } : s));

            // If this is the active segment, update activeMedia too
            setActiveMedia(prev => {
                // Only update if we aren't showing something else (like video)
                if (!prev.video) {
                    return { ...prev, image: imageUrl };
                }
                return prev;
            });
        } catch (e) {
            console.error("Auto image generation failed", e);
        } finally {
            setIsGeneratingMedia(false);
        }
    };

    const handleStartStory = async () => {
        if (!premise.trim()) return;
        setWizardStep(4);
        setIsGenerating(true);

        try {
            // Combine Genre and Tone for the AI
            const stylePrompt = `${genre} (Tone: ${tone})`;
            const firstSegment = await generateStorySegment("", `Start a story based on this premise: ${premise}`, stylePrompt);
            setSegments([firstSegment]);
            setHistoryText(firstSegment.content);

            // Auto-generate image for the first segment
            triggerAutoImage(firstSegment);
        } catch (e) {
            alert("Failed to start story engine. Please try again.");
            setWizardStep(3); // Go back
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChoice = async (choice: StoryOption) => {
        setIsGenerating(true);
        setActiveMedia({});
        stopAudio();

        try {
            const stylePrompt = `${genre} (Tone: ${tone})`;
            const nextSegment = await generateStorySegment(historyText, choice.text, stylePrompt);
            setSegments(prev => [...prev, nextSegment]);
            setHistoryText(prev => prev + "\n\n" + nextSegment.content);

            // Auto-generate image for the new segment
            triggerAutoImage(nextSegment);
        } catch (e) {
            alert("Failed to generate next segment.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAudio = async (segment: StorySegment) => {
        // If audio already exists, just play it
        if (segment.audioUrl) {
            setActiveMedia(prev => ({ ...prev, audio: segment.audioUrl }));
            playAudio(segment.audioUrl);
            return;
        }

        setIsGeneratingMedia(true);
        try {
            // Returns raw base64 PCM
            const audioPCM = await generateSpeech(segment.content);
            const updated = segments.map(s => s.id === segment.id ? { ...s, audioUrl: audioPCM } : s);
            setSegments(updated);

            setActiveMedia(prev => ({ ...prev, audio: audioPCM }));
            playAudio(audioPCM);
        } catch (e) {
            alert("Failed to generate audio.");
        } finally {
            setIsGeneratingMedia(false);
        }
    };

    const handleGenerateImage = async (segment: StorySegment) => {
        setIsGeneratingMedia(true);
        try {
            const imageUrl = await generateImage(segment.visualPrompt);
            const updated = segments.map(s => s.id === segment.id ? { ...s, imageUrl } : s);
            setSegments(updated);
            setActiveMedia(prev => ({ ...prev, image: imageUrl, video: undefined })); // Clear video if showing image
        } catch (e) {
            console.error(e);
            alert("Image generation failed.");
        } finally {
            setIsGeneratingMedia(false);
        }
    };

    const handleGenerateVideo = async (segment: StorySegment) => {
        setIsGeneratingMedia(true);
        stopAudio();
        try {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) await (window as any).aistudio.openSelectKey();
            }

            const videoUrl = await generateVideo(segment.visualPrompt, '16:9', '720p');
            const updated = segments.map(s => s.id === segment.id ? { ...s, videoUrl } : s);
            setSegments(updated);
            setActiveMedia(prev => ({ ...prev, video: videoUrl, image: undefined }));

        } catch (e) {
            console.error(e);
            alert("Video generation failed. Check API key.");
        } finally {
            setIsGeneratingMedia(false);
        }
    };

    // --------------------------------------------------------------------------
    // RENDER: ONBOARDING WIZARD (Step 1-3)
    // --------------------------------------------------------------------------
    if (wizardStep < 4) {
        import Navigation from '../components/Navigation';

        // ... imports

        const AICreatePage = () => {
            // ... existing code

            // --------------------------------------------------------------------------
            // RENDER: ONBOARDING WIZARD (Step 1-3)
            // --------------------------------------------------------------------------
            if (wizardStep < 4) {
                return (
                    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
                        <Navigation />
                        {/* Nav */}
                        <div className="p-6 flex justify-between items-center pt-24">
                            <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-medium transition">
                                <ArrowLeft size={18} /> <span className="hidden md:inline">Back to Dashboard</span>
                            </button>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(step => (
                                    <div key={step} className={`h-1.5 w-8 rounded-full transition-colors ${wizardStep >= step ? 'bg-slate-900' : 'bg-stone-200'}`}></div>
                                ))}
                            </div>
                            <div className="w-4 md:w-20"></div> {/* Spacer */}
                        </div>

                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="max-w-4xl w-full animate-fade-in-up">

                                {/* STEP 1: GENRE */}
                                {wizardStep === 1 && (
                                    <div className="text-center">
                                        <h1 className="font-serif text-3xl md:text-5xl text-slate-900 mb-4">Pick a Genre</h1>
                                        <p className="text-slate-500 text-base md:text-lg mb-8 md:mb-12">What kind of world are we building today?</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
                                            {GENRES.map((g) => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => { setGenre(g.label); setWizardStep(2); }}
                                                    className="bg-white p-6 rounded-2xl border-2 border-stone-100 hover:border-slate-900 hover:shadow-xl transition-all group text-left relative overflow-hidden"
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${g.color}`}>
                                                        <g.icon size={24} />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:translate-x-1 transition-transform">{g.label}</h3>
                                                    <p className="text-xs text-slate-400 font-medium">{g.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: TONE */}
                                {wizardStep === 2 && (
                                    <div className="text-center">
                                        <h1 className="font-serif text-3xl md:text-5xl text-slate-900 mb-4">Set the Tone</h1>
                                        <p className="text-slate-500 text-base md:text-lg mb-8 md:mb-12">How should the narration feel?</p>

                                        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
                                            {TONES.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => { setTone(t.label); setWizardStep(3); }}
                                                    className="px-6 py-3 md:px-8 md:py-4 bg-white rounded-full border-2 border-stone-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-lg transition-all text-slate-600 font-medium text-sm md:text-lg"
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setWizardStep(1)} className="mt-12 text-slate-400 hover:text-slate-600 text-sm font-medium">Back to Genre</button>
                                    </div>
                                )}

                                {/* STEP 3: PREMISE */}
                                {wizardStep === 3 && (
                                    <div className="text-center max-w-xl mx-auto">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-6">
                                            {genre} • {tone}
                                        </div>
                                        <h1 className="font-serif text-3xl md:text-5xl text-slate-900 mb-4">The Hook</h1>
                                        <p className="text-slate-500 text-base md:text-lg mb-8 md:mb-10">Describe the starting situation or main character.</p>

                                        <div className="relative mb-8">
                                            <textarea
                                                value={premise}
                                                onChange={(e) => setPremise(e.target.value)}
                                                placeholder="e.g., A retired detective finds a mysterious key in his mailbox that opens a door to 1955."
                                                className="w-full bg-white border-2 border-stone-200 rounded-2xl p-6 text-lg md:text-xl text-slate-800 outline-none focus:border-slate-900 transition-all h-48 resize-none placeholder-slate-300 shadow-sm"
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            onClick={handleStartStory}
                                            disabled={!premise.trim() || isGenerating}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" /> : <>Start Adventure <Rocket size={20} /></>}
                                        </button>
                                        <button onClick={() => setWizardStep(2)} className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium">Back to Tone</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            // --------------------------------------------------------------------------
            // RENDER: ACTIVE STORY ENGINE (Step 4)
            // --------------------------------------------------------------------------
            const activeSegment = segments[segments.length - 1];

            // Logic to determine what visual to show in the preview window
            const visualToDisplay = activeMedia.video || activeMedia.image || activeSegment?.videoUrl || activeSegment?.imageUrl;
            const isVideo = (activeMedia.video || activeSegment?.videoUrl) && !activeMedia.image && !(activeSegment?.imageUrl && activeMedia.image === activeSegment.imageUrl);

            return (
                <div className="h-screen bg-stone-50 flex flex-col font-sans overflow-hidden">
                    {/* Header */}
                    <header className="h-14 md:h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-stone-100 rounded-lg text-slate-500 transition">
                                <ArrowLeft size={18} />
                            </button>
                            <h1 className="font-serif font-bold text-slate-900 truncate max-w-[150px] md:max-w-xs text-sm md:text-base">{premise}</h1>
                            <span className="px-2 py-1 bg-stone-100 text-slate-500 text-xs rounded border border-stone-200 hidden md:inline-block whitespace-nowrap">{genre}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mr-2 hidden md:inline-block">
                                {segments.length} Scenes
                            </span>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded text-xs md:text-sm font-medium hover:bg-slate-800 transition whitespace-nowrap">
                                <Save size={14} /> <span className="hidden sm:inline">Save</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                        {/* Left: Story Stream (Top on mobile) */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white max-w-3xl mx-auto w-full shadow-sm scroll-smooth order-1 lg:order-1">
                            <div className="space-y-12 pb-32">
                                {segments.map((seg, idx) => (
                                    <div key={seg.id} className={`transition-opacity duration-500 ${idx === segments.length - 1 ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SCENE {idx + 1}</span>

                                            {/* Media Indicators for past segments */}
                                            <div className="flex gap-2">
                                                {seg.audioUrl && (
                                                    <button
                                                        onClick={() => { setActiveMedia({ audio: seg.audioUrl }); playAudio(seg.audioUrl!); }}
                                                        className="p-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition" title="Play Audio"
                                                    >
                                                        <Volume2 size={14} />
                                                    </button>
                                                )}
                                                {seg.videoUrl && (
                                                    <button
                                                        onClick={() => setActiveMedia({ video: seg.videoUrl, image: undefined })}
                                                        className="p-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition" title="Play Video"
                                                    >
                                                        <Video size={14} />
                                                    </button>
                                                )}
                                                {seg.imageUrl && (
                                                    <button
                                                        onClick={() => setActiveMedia({ image: seg.imageUrl, video: undefined })}
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition" title="View Image"
                                                    >
                                                        <ImageIcon size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="font-serif text-base md:text-xl leading-relaxed md:leading-loose text-slate-800 whitespace-pre-line">
                                            {seg.content}
                                        </p>
                                    </div>
                                ))}

                                {isGenerating && (
                                    <div className="flex flex-col items-center py-12 animate-pulse">
                                        <Sparkles className="text-indigo-400 mb-4 animate-bounce" size={24} />
                                        <div className="h-2 bg-indigo-50 rounded w-3/4 mb-3"></div>
                                        <div className="h-2 bg-indigo-50 rounded w-5/6 mb-3"></div>
                                        <div className="h-2 bg-indigo-50 rounded w-2/3"></div>
                                        <span className="text-xs text-indigo-400 mt-4 uppercase tracking-widest font-bold">Weaving Narrative...</span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Right: Active Director Panel (Bottom on mobile) */}
                        <div className="w-full lg:w-96 bg-stone-50 border-t lg:border-t-0 lg:border-l flex-col flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-xl order-2 lg:order-2 flex max-h-[50vh] lg:max-h-none">

                            {/* Media Preview Area */}
                            <div className="h-40 md:h-56 bg-slate-900 relative flex items-center justify-center overflow-hidden group flex-shrink-0">
                                {visualToDisplay ? (
                                    isVideo && activeMedia.video !== undefined ? (
                                        <video
                                            src={activeMedia.video || activeSegment?.videoUrl}
                                            controls
                                            className="w-full h-full object-cover"
                                            autoPlay
                                        />
                                    ) : (
                                        <img
                                            src={activeMedia.image || activeSegment?.imageUrl}
                                            className="w-full h-full object-cover animate-fade-in"
                                            alt="Scene illustration"
                                        />
                                    )
                                ) : (
                                    <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center bg-slate-900/50">
                                        {isGeneratingMedia ? (
                                            <div className="flex flex-col items-center gap-3 animate-pulse">
                                                <Loader2 className="animate-spin text-white" size={24} />
                                                <span className="text-xs text-slate-300 font-medium">Visualizing Scene...</span>
                                            </div>
                                        ) : (
                                            activeSegment?.visualPrompt ? (
                                                <div className="max-w-[80%]">
                                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">
                                                        <Sparkles size={10} /> Visual Context
                                                    </div>
                                                    <p className="text-slate-400 text-xs italic leading-relaxed text-center line-clamp-3 md:line-clamp-none">"{activeSegment.visualPrompt}"</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-slate-800 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Video size={20} />
                                                    </div>
                                                    <p className="text-slate-500 text-xs font-medium">No visual generated.</p>
                                                </>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* Audio Player Overlay */}
                                {isPlayingAudio && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-20">
                                        <button
                                            onClick={stopAudio}
                                            className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-slate-800 transition"
                                        >
                                            <Pause size={12} fill="currentColor" />
                                        </button>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[10px] font-bold text-slate-900 truncate">Narrating Scene...</div>
                                            <div className="w-full bg-stone-200 h-1 rounded-full mt-1">
                                                <div className="w-full bg-indigo-600 h-full rounded-full animate-pulse origin-left"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex-1 p-4 md:p-6 overflow-y-auto">

                                <div className="mb-6 md:mb-8">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2">
                                        Media Lab
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                                        <button
                                            onClick={() => handleGenerateAudio(activeSegment)}
                                            disabled={isGeneratingMedia || isPlayingAudio}
                                            className={`flex flex-col items-center justify-center p-3 md:p-4 bg-white border rounded-xl hover:shadow-md transition disabled:opacity-50 group ${activeSegment?.audioUrl ? 'border-purple-200 bg-purple-50' : 'border-stone-200'}`}
                                        >
                                            <Volume2 size={18} className={`mb-1 md:mb-2 transition-colors ${activeSegment?.audioUrl ? 'text-purple-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSegment?.audioUrl ? 'text-purple-700' : 'text-slate-700'}`}>
                                                {activeSegment?.audioUrl ? 'Replay' : 'Narrate'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleGenerateImage(activeSegment)}
                                            disabled={isGeneratingMedia || !!activeSegment?.imageUrl}
                                            className={`flex flex-col items-center justify-center p-3 md:p-4 bg-white border rounded-xl hover:shadow-md transition disabled:opacity-50 group ${activeSegment?.imageUrl ? 'border-emerald-200 bg-emerald-50' : 'border-stone-200'}`}
                                        >
                                            <ImageIcon size={18} className={`mb-1 md:mb-2 transition-colors ${activeSegment?.imageUrl ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSegment?.imageUrl ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                {activeSegment?.imageUrl ? 'Done' : 'Illustrate'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleGenerateVideo(activeSegment)}
                                            disabled={isGeneratingMedia || !!activeSegment?.videoUrl}
                                            className={`flex flex-col items-center justify-center p-3 md:p-4 bg-white border rounded-xl hover:shadow-md transition disabled:opacity-50 group ${activeSegment?.videoUrl ? 'border-rose-200 bg-rose-50' : 'border-stone-200'}`}
                                        >
                                            {isGeneratingMedia ? <Loader2 size={18} className="animate-spin text-rose-600 mb-1 md:mb-2" /> : <Video size={18} className={`mb-1 md:mb-2 transition-colors ${activeSegment?.videoUrl ? 'text-rose-600' : 'text-slate-400 group-hover:text-rose-600'}`} />}
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSegment?.videoUrl ? 'text-rose-700' : 'text-slate-700'}`}>
                                                {activeSegment?.videoUrl ? 'Done' : 'Motion'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-stone-200 pt-4 md:pt-6">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4">
                                        What happens next?
                                    </h3>

                                    <div className="space-y-2 md:space-y-3">
                                        {activeSegment?.choices.map((choice, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleChoice(choice)}
                                                disabled={isGenerating}
                                                className="w-full text-left p-3 md:p-4 bg-white border border-stone-200 rounded-xl hover:border-slate-900 hover:bg-slate-50 hover:shadow-md transition group relative overflow-hidden"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-slate-900 transition-colors"></div>
                                                <div className="flex justify-between items-center mb-1 pl-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{choice.label}</span>
                                                </div>
                                                <div className="text-sm font-medium text-slate-800 leading-snug pl-2">
                                                    {choice.text}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            );
        };

        export default AICreatePage;
