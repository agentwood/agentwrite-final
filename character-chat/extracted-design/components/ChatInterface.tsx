import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2, Volume2, VolumeX, MoreVertical, RefreshCw } from 'lucide-react';
import { Character, Message, VoiceConfig } from '../types';
import { startChat, sendMessage } from '../services/gemini';
import { speak, stopSpeaking } from '../services/tts';

interface ChatInterfaceProps {
  character: Character;
  onBack: () => void;
  voiceConfig: VoiceConfig;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, onBack, voiceConfig }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    // Initialize chat session
    if (character.systemInstruction && !sessionStarted) {
      startChat(character.systemInstruction);
      setSessionStarted(true);
      
      const greeting = character.greeting || `*${character.name} looks at you.* Hello.`;
      
      // Add initial greeting from character
      setTimeout(() => {
         const greetingMsg: Message = {
            id: 'init',
            role: 'model',
            text: greeting,
            timestamp: Date.now()
         };
         setMessages([greetingMsg]);
         
         if (!isMuted) {
             speak(greeting, voiceConfig);
         }
      }, 500);
    }
  }, [character, sessionStarted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Cleanup speech on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Stop current speech if any
    stopSpeaking();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessage(userMsg.text);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, modelMsg]);
      
      if (!isMuted) {
          speak(responseText, voiceConfig);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
      if (isMuted) {
          setIsMuted(false);
      } else {
          stopSpeaking();
          setIsMuted(true);
      }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
         <div className="flex items-center">
            <button onClick={onBack} className="p-2 mr-3 hover:bg-gray-100 rounded-full transition-colors group">
                <ArrowLeft size={20} className="text-gray-500 group-hover:text-gray-900" />
            </button>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={character.avatarUrl} className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100" alt={character.name} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h2 className="font-bold text-gray-900 text-sm leading-tight">{character.name}</h2>
                    <p className="text-xs text-indigo-500 font-medium">@{character.creator}</p>
                </div>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button 
                onClick={toggleMute}
                className={`p-2.5 rounded-full transition-all ${isMuted ? 'text-gray-400 hover:bg-gray-100' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical size={20} />
            </button>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
         {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
               <img src={character.avatarUrl} className="w-24 h-24 rounded-2xl mb-4 grayscale opacity-50 shadow-lg" />
               <p className="text-gray-500 font-medium">Start a new story with {character.name}</p>
            </div>
         )}
         
         {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden mt-1 shadow-sm">
                  {msg.role === 'model' ? (
                     <img src={character.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">S</div>
                  )}
               </div>
               <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
               }`}>
                  {msg.text}
               </div>
            </div>
         ))}
         {isLoading && (
            <div className="flex gap-4 animate-in fade-in duration-300">
               <div className="w-9 h-9 rounded-xl overflow-hidden mt-1 shadow-sm">
                  <img src={character.avatarUrl} className="w-full h-full object-cover" />
               </div>
               <div className="flex items-center gap-1.5 h-10 px-4 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/90 backdrop-blur-md sticky bottom-0 border-t border-gray-200">
         <div className="max-w-4xl mx-auto relative">
            <input
               type="text"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder={`Message ${character.name}...`}
               className="w-full bg-slate-50 text-gray-900 rounded-2xl py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 border border-slate-200 transition-all placeholder:text-gray-400 shadow-sm"
            />
            <button 
               onClick={handleSend}
               disabled={!inputText.trim() || isLoading}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-200"
            >
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} fill="currentColor" />}
            </button>
         </div>
         <div className="flex justify-center gap-4 mt-3">
             <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-indigo-500 transition-colors">
                 <RefreshCw size={10} />
                 <span>Regenerate last response</span>
             </button>
             <p className="text-center text-[10px] text-gray-300">
                AI can make mistakes. Please verify important info.
             </p>
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;