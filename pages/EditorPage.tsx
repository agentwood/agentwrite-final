
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, MessageSquare, Sparkles, Home, Download, Film, Headphones, ChevronDown, FileText, CheckCircle, Loader2, Save, Mic, Square } from 'lucide-react';
import { continueStory, summarizeLecture } from '../services/geminiService';

const EditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectTitle = id === 'tutorial' ? 'The Midnight Library' : 'Untitled Draft';
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Auto-save State
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const contentRef = useRef('');

  useEffect(() => {
    const savedContent = localStorage.getItem(`agentwrite_project_${id}`);
    if (savedContent) {
        setContent(savedContent);
        contentRef.current = savedContent;
        setLastSaved(new Date()); 
    }
  }, [id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
        handleAutoSave();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [id]);

  const handleAutoSave = () => {
      setIsSaving(true);
      setTimeout(() => {
          localStorage.setItem(`agentwrite_project_${id}`, contentRef.current);
          setLastSaved(new Date());
          setIsSaving(false);
      }, 800);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setContent(newText);
      contentRef.current = newText;
  };

  const handleAIComplete = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
        const newTextFragment = await continueStory(contentRef.current, projectTitle);
        if (newTextFragment) {
            const updatedContent = contentRef.current + (contentRef.current.endsWith(' ') ? '' : ' ') + newTextFragment;
            setContent(updatedContent);
            contentRef.current = updatedContent;
            handleAutoSave();
        }
    } catch (e) {
        console.error("AI generation failed", e);
        alert("Could not generate text. Please check your connection and try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- RECORDING LOGIC ---

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Robust MIME type selection for cross-browser compatibility (Safari vs Chrome)
        let options = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
        }
        
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            // Use the recorder's actual mime type to ensure the Blob matches the data
            const blobType = mediaRecorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
            await handleAudioProcessing(audioBlob);
            
            // Stop all tracks to release mic
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleAudioProcessing = async (audioBlob: Blob) => {
    setIsGenerating(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            // Extract content and mime type
            const base64Content = base64data.split(',')[1];
            const mimeType = base64data.split(';')[0].split(':')[1];

            const summary = await summarizeLecture(base64Content, mimeType, contentRef.current);
            
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newBlock = `\n\n## Lecture Summary (${timestamp})\n${summary}\n\n`;
            const updatedContent = contentRef.current + newBlock;
            
            setContent(updatedContent);
            contentRef.current = updatedContent;
            handleAutoSave();
            setIsGenerating(false);
        };
    } catch (e) {
        console.error("Audio processing failed", e);
        alert("Failed to process audio recording.");
        setIsGenerating(false);
    }
  };

  // -----------------------

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${projectTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    setShowExportMenu(false);
  };

  const handleAdaptation = (type: 'Audio' | 'Video') => {
    handleAutoSave();
    navigate('/dashboard', { 
      state: { 
        action: 'open_media', 
        project: { id, title: projectTitle, words: content.split(' ').length || 0, excerpt: content.slice(0, 500) }, 
        mediaType: type
      } 
    });
  };

  const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden font-sans">
      {/* Minimalist Toolbar */}
      <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded hover:bg-stone-100 text-slate-500 hover:text-slate-900 transition text-sm font-medium"
                title="Return to Dashboard"
            >
                <Home size={18} />
            </button>
            
            <div className="h-6 w-px bg-stone-200 mx-1 md:mx-2 flex-shrink-0"></div>

            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h1 className="font-serif text-lg text-slate-900 font-bold leading-none truncate">{projectTitle}</h1>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    {isSaving ? (
                        <>
                            <Loader2 size={10} className="animate-spin text-amber-600" />
                            <span className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">Saving...</span>
                        </>
                    ) : (
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1 whitespace-nowrap">
                            {lastSaved ? `Last saved ${formatTime(lastSaved)}` : 'Unsaved changes'}
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
            <button 
                onClick={handleAutoSave}
                disabled={isSaving}
                className="hidden md:flex items-center gap-1 text-slate-400 hover:text-slate-900 transition mr-2"
                title="Save Now"
            >
                <Save size={16} />
            </button>

            <div className="hidden md:flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200 mr-2">
                <button 
                    onClick={() => handleAdaptation('Audio')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:text-purple-700 transition flex items-center gap-2"
                    title="Create Audiobook"
                >
                    <Headphones size={14} /> Adapt Audio
                </button>
                <div className="w-px h-4 bg-stone-200"></div>
                <button 
                    onClick={() => handleAdaptation('Video')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:text-rose-700 transition flex items-center gap-2"
                    title="Create Video Trailer"
                >
                    <Film size={14} /> Adapt Video
                </button>
            </div>

            <button 
                onClick={() => navigate('/brainstorm')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition shadow-sm"
            >
                <Sparkles size={14} /> Brainstorm
            </button>

            <div className="relative">
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition shadow-sm shadow-slate-200"
                >
                    <span className="hidden md:inline">Finish & Export</span>
                    <CheckCircle size={16} className="md:hidden" />
                    <ChevronDown size={14} />
                </button>
                
                {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-100 py-1 z-50 animate-fade-in-up">
                        <div className="px-4 py-2 border-b border-stone-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">Export Options</div>
                        <button 
                            onClick={handleExport}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-stone-50 flex items-center gap-3"
                        >
                            <FileText size={16} className="text-slate-500" /> Download Text (.txt)
                        </button>
                        <div className="md:hidden border-t border-stone-50 my-1"></div>
                        <button 
                             onClick={() => handleAdaptation('Audio')}
                             className="w-full text-left px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-3"
                        >
                            <Headphones size={16} /> Send to Audio Studio
                        </button>
                         <button 
                             onClick={() => handleAdaptation('Video')}
                             className="w-full text-left px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-3"
                        >
                            <Film size={16} /> Create Video Trailer
                        </button>
                         <div className="md:hidden border-t border-stone-50 my-1"></div>
                         <button 
                             onClick={() => navigate('/brainstorm')}
                             className="md:hidden w-full text-left px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-3"
                        >
                            <Sparkles size={16} /> Open Brainstorm
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        <div className="w-72 bg-stone-50 border-r border-stone-200 hidden lg:flex flex-col pt-6">
            <div className="px-6 mb-4 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outline</span>
                <button onClick={() => navigate('/profile')} className="text-slate-400 hover:text-slate-900" title="Settings"><Settings size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                <button className="w-full bg-white border border-stone-200 rounded-lg text-slate-900 px-4 py-3 text-sm font-medium text-left shadow-sm">
                    1. The Beginning
                </button>
                <button className="w-full text-slate-500 hover:bg-stone-100 hover:text-slate-900 px-4 py-3 text-sm font-medium text-left rounded-lg transition">
                    2. The Incident
                </button>
                <button className="w-full text-slate-500 hover:bg-stone-100 hover:text-slate-900 px-4 py-3 text-sm font-medium text-left rounded-lg transition">
                    3. Resolution
                </button>
            </div>
        </div>

        <div className="flex-1 bg-white overflow-y-auto relative">
            <div className="max-w-3xl mx-auto py-8 md:py-16 px-4 md:px-12 min-h-full bg-white">
                <input 
                    type="text" 
                    className="w-full font-serif text-3xl md:text-5xl text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent mb-6 md:mb-8 font-bold"
                    defaultValue={projectTitle}
                    readOnly 
                />
                <textarea 
                    className="w-full h-[calc(100vh-250px)] resize-none outline-none text-base md:text-lg text-slate-700 font-serif leading-relaxed md:leading-loose placeholder-slate-300 bg-transparent pb-32"
                    placeholder="It was a dark and stormy night..."
                    autoFocus
                    value={content}
                    onChange={handleContentChange}
                ></textarea>
            </div>
        </div>

        <div className="absolute bottom-8 right-6 md:right-8 flex flex-col gap-4">
             {/* Recording Button */}
             <button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isGenerating && !isRecording}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all tooltip group relative border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-slate-600 border-stone-200 hover:text-slate-900 hover:border-slate-300'}`} 
                title={isRecording ? "Stop Recording" : "Record Lecture"}
             >
                {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={22} />}
                
                {!isRecording && !isGenerating && <span className="hidden md:block absolute right-full mr-4 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Record Lecture</span>}
             </button>

             <button 
                onClick={handleAIComplete}
                disabled={isGenerating || isRecording}
                className={`w-12 h-12 md:w-14 md:h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-slate-800 hover:scale-105 transition-all tooltip group relative ${isGenerating ? 'opacity-80' : ''}`} 
                title="AI Assist"
             >
                {isGenerating ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
                
                {!isGenerating && <span className="hidden md:block absolute right-full mr-4 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">AI Auto-Complete</span>}
             </button>
        </div>
      </div>
      
      <div className="h-8 bg-stone-50 border-t border-stone-200 flex items-center justify-between px-4 md:px-6 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-2 md:gap-4">
            <span>Ln {content.split('\n').length}</span>
            <span className="hidden md:inline">Col {content.length}</span>
            {isRecording && <span className="text-red-500 animate-pulse font-bold">● RECORDING</span>}
        </div>
        <div className="flex items-center gap-4">
            <span className="hidden md:inline hover:text-slate-900 cursor-pointer">Focus Mode</span>
            <span className="text-slate-900">{content.trim().split(/\s+/).filter(Boolean).length} Words</span>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
