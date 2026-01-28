import React, { useState, useRef, useEffect } from 'react';
import {
    Mic, Upload, PenTool, Radio, Wand2, Star, Play,
    Square, Check, ChevronRight, ArrowLeft, Loader2
} from 'lucide-react';

const CreateVoiceView: React.FC = () => {
    const [view, setView] = useState<'menu' | 'wizard'>('menu');
    const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [voiceName, setVoiceName] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Step 3 processing simulation
    const [processingProgress, setProcessingProgress] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Menu Data
    const menuOptions = [
        {
            title: 'Voice Design',
            desc: 'Design an entirely new voice from a text prompt.',
            icon: <PenTool size={20} />,
            meta: 'Less than a minute',
            locked: false
        },
        {
            title: 'Instant Voice Clone',
            desc: 'Clone your voice with only 10 seconds of audio.',
            icon: <Mic size={20} />,
            meta: '2 minutes',
            locked: false,
            action: () => setView('wizard')
        },
        {
            title: 'Professional Voice Clone',
            desc: 'Create the most realistic digital replica of your voice. Requires at least 30 minutes of clean audio.',
            icon: <Star size={20} />,
            meta: '5 minutes',
            locked: true
        },
        {
            title: 'Voice Remixing (alpha)',
            desc: 'Transform existing voices with text prompts to create new voices.',
            icon: <Wand2 size={20} />,
            meta: 'Less than a minute',
            locked: true,
            isNew: true
        }
    ];

    const tags = ['Deep', 'Soft', 'Energetic', 'Raspy', 'Calm', 'Authoritative', 'Whispery'];

    // Recording State
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                chunksRef.current = [];
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(100); // chunk every 100ms
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (e) {
            console.error("Microphone access denied:", e);
            alert("Please allow microphone access to record.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleNext = async () => {
        if (wizardStep === 2) {
            // Processing & Upload Step
            setWizardStep(3);

            try {
                if (!audioBlob) throw new Error("No audio recorded");

                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                formData.append('displayName', voiceName);
                formData.append('description', selectedTags.join(', '));
                formData.append('consent', 'true'); // Implicit for now in this wizard

                // Simulate upload progress
                const progressInterval = setInterval(() => {
                    setProcessingProgress(prev => Math.min(prev + 10, 90));
                }, 500);

                const res = await fetch('/api/voice/upload', {
                    method: 'POST',
                    body: formData
                });

                clearInterval(progressInterval);
                setProcessingProgress(100);

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Upload failed");
                }

                // Success!
            } catch (e: any) {
                console.error(e);
                alert(`Failed to create voice: ${e.message}`);
                setWizardStep(2); // Go back
            }
        } else {
            setWizardStep(prev => prev + 1 as any);
        }
    };

    const handlePlayAudio = () => {
        if (!audioBlob) return;
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white p-8 md:p-12 animate-fade-in font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    {view === 'wizard' && (
                        <button onClick={() => setView('menu')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-xs uppercase font-bold tracking-widest">
                            <ArrowLeft size={14} /> Back to Options
                        </button>
                    )}
                    <h1 className="text-5xl font-serif italic text-white mb-2">Create a Voice</h1>
                    <p className="text-white/40 font-sans tracking-wide">Design unique voices for your characters.</p>
                </div>

                {view === 'menu' ? (
                    <div className="space-y-4">
                        {menuOptions.map((opt, i) => (
                            <div
                                key={i}
                                onClick={!opt.locked ? opt.action : undefined}
                                className={`p-6 rounded-2xl border border-white/5 bg-[#161616] flex items-start gap-6 group transition-all relative overflow-hidden ${!opt.locked ? 'hover:bg-[#1f1b19] hover:border-white/10 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors border border-white/5">
                                    {opt.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-xl font-bold text-white">{opt.title}</h3>
                                        {opt.isNew && <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded-sm uppercase tracking-widest">New</span>}
                                        {opt.locked && <span className="text-[10px] font-bold bg-white/5 text-white/40 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-white/5">Locked</span>}
                                    </div>
                                    <p className="text-white/40 text-sm mb-4">{opt.desc}</p>
                                    <span className="text-[10px] font-bold bg-white/5 text-white/40 px-2 py-1 rounded-md uppercase tracking-widest">{opt.meta}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Wizard View */
                    <div className="grid grid-cols-[200px_1fr] gap-12">
                        {/* Steps Sidebar */}
                        <div className="space-y-8 border-r border-white/5 pr-8 h-fit">
                            {['Upload Audio', 'Voice Metadata', 'Processing'].map((step, i) => (
                                <div key={i} className={`flex items-center gap-3 ${wizardStep === i + 1 ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`w-2 h-2 rounded-full ${wizardStep === i + 1 ? 'bg-white' : 'bg-white/20'}`}></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">{step}</span>
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {wizardStep === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-[#161616] border border-white/5 p-4 rounded-xl">
                                            <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Mic size={14} /> Quiet Environment</h4>
                                            <p className="text-white/40 text-xs">Ensure minimal background noise for best quality.</p>
                                        </div>
                                        <div className="bg-[#161616] border border-white/5 p-4 rounded-xl">
                                            <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Radio size={14} /> Natural Speech</h4>
                                            <p className="text-white/40 text-xs">Speak naturally as you would in conversation.</p>
                                        </div>
                                    </div>

                                    <div className="h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-[#161616] relative transition-colors hover:border-white/20">
                                        {!isRecording && !audioBlob ? (
                                            <>
                                                <button
                                                    onClick={handleStartRecording}
                                                    className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 hover:scale-110 transition-transform"
                                                >
                                                    <Mic size={24} />
                                                </button>
                                                <p className="text-white font-bold">Click to Record</p>
                                                <p className="text-white/40 text-xs mt-2">or drag and drop audio file</p>
                                            </>
                                        ) : isRecording ? (
                                            <>
                                                <div className="flex gap-1 items-end h-16 mb-8">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div key={i} className="w-2 bg-red-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 40 + 20}px`, animationDelay: `${i * 0.1}s` }}></div>
                                                    ))}
                                                </div>
                                                <div className="text-red-500 font-mono text-xl mb-4">00:{recordingTime.toString().padStart(2, '0')}</div>
                                                <button
                                                    onClick={handleStopRecording}
                                                    className="px-6 py-2 bg-white/10 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/20"
                                                >
                                                    Stop Recording
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                                                    <Check size={24} />
                                                </div>
                                                <p className="text-white font-bold">Audio Captured</p>
                                                <div className="flex gap-4 mt-6">
                                                    <button onClick={() => setAudioBlob(null)} className="text-xs text-white/40 underline">Retry</button>
                                                    <button onClick={handlePlayAudio} className="flex items-center gap-2 text-xs text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"><Play size={10} /> Play</button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <div className={`w-3 h-3 rounded-full border border-white/20 ${audioBlob && recordingTime > 10 ? 'bg-green-500 border-green-500' : ''}`}></div>
                                        10 seconds of audio required
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Voice Name <span className="text-red-500">*</span></label>
                                        <input
                                            value={voiceName}
                                            onChange={(e) => setVoiceName(e.target.value)}
                                            className="w-full bg-[#161616] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30 transition-colors"
                                            placeholder="e.g. My Narrator Voice"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Characteristics</label>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedTags.includes(tag) ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'}`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                                    {processingProgress < 100 ? (
                                        <>
                                            <div className="w-24 h-24 relative mb-8">
                                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                    <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                                    <path className="text-purple-500 transition-all duration-300" strokeDasharray={`${processingProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center font-bold font-mono">{processingProgress}%</div>
                                            </div>
                                            <h3 className="text-2xl font-serif italic text-white mb-2">Cloning Voice...</h3>
                                            <p className="text-white/40 text-sm">Analyzing acoustic patterns and generating model.</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                                <Check size={32} />
                                            </div>
                                            <h3 className="text-3xl font-serif italic text-white mb-2">Voice Created!</h3>
                                            <p className="text-white/40 text-sm mb-8">"Velvet Deep" is now ready to use.</p>
                                            <div className="flex gap-4">
                                                <button onClick={() => setView('menu')} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20">Return to Studio</button>
                                                <button className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/90">View Analytics</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Footer Nav */}
                            {wizardStep < 3 && (
                                <div className="mt-12 flex justify-end">
                                    <button
                                        onClick={handleNext}
                                        disabled={wizardStep === 1 && !audioBlob}
                                        className="px-8 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:pr-6"
                                    >
                                        {wizardStep === 2 ? 'Create Voice' : 'Next'} <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateVoiceView;
