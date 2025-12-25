
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Agent, Message, SavedChat } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatWindowProps {
  agent: Agent;
  onBack: () => void;
  onSave: (chat: SavedChat) => void;
  initialMessages?: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ agent: initialAgent, onBack, onSave, initialMessages }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(initialAgent.traits.voiceName);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = { id: modelMsgId, role: 'model', content: '', timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);

    try {
      let accumulatedResponse = '';
      const stream = geminiService.streamChat(initialAgent.systemPrompt, [...messages, userMsg], userMsg.content);
      for await (const chunk of stream) {
        accumulatedResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: accumulatedResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden fade-in">
      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col relative bg-zinc-50/50">
        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-12 pb-32 px-4 md:px-0">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Header Profile Info */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6">
                <img src={initialAgent.avatar} alt={initialAgent.name} className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-2">{initialAgent.name}</h1>
              <p className="text-sm text-zinc-500 max-w-md font-medium px-6">
                {initialAgent.description}
              </p>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-3">
                By {initialAgent.author}
              </p>
            </div>

            {/* Messages */}
            <div className="space-y-8">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <img src={initialAgent.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                      <span className="text-xs font-bold text-zinc-900">{initialAgent.name}</span>
                      <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-500 text-[9px] font-black rounded uppercase">c.ai</span>
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-[15px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-transparent text-zinc-900' 
                      : 'bg-zinc-100 text-zinc-800'
                  }`}>
                    {msg.content}
                  </div>

                  {msg.role === 'model' && (
                    <div className="flex items-center gap-3 mt-3 ml-2 text-zinc-400">
                      <button className="p-1 hover:text-zinc-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      </button>
                      <button className="p-1 hover:text-zinc-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                      </button>
                      <button className="p-1 hover:text-zinc-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5 10h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-2 mb-2 ml-1">
                      <img src={initialAgent.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                      <span className="text-xs font-bold text-zinc-900">{initialAgent.name}</span>
                    </div>
                    <div className="bg-zinc-100 px-6 py-4 rounded-[1.5rem] flex gap-1">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Floating Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl flex items-center gap-4">
             <div className="flex-1 relative group">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Message ${initialAgent.name}...`}
                  className="w-full pl-6 pr-24 py-5 bg-zinc-100 border border-zinc-200 rounded-full text-[15px] font-medium placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button onClick={() => handleSend()} className={`p-2.5 rounded-full transition-all ${inputValue.trim() ? 'bg-zinc-900 text-white' : 'text-zinc-300'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
                  </button>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
               <button className="p-4 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-full hover:bg-zinc-200 transition-all shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
               </button>
               <button className="p-4 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-full hover:bg-zinc-200 transition-all shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </button>
             </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium mt-4">
             This is A.I. and not a real person. Treat everything it says as fiction.
          </p>
        </div>
      </div>

      {/* Right Sidebar Panel */}
      <aside className="w-[320px] h-full bg-white border-l border-zinc-100 flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
          
          {/* Top Panel Identity */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 shadow-lg">
               <img src={initialAgent.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">{initialAgent.name}</h2>
            <p className="text-[11px] text-zinc-400 font-bold mb-4">By {initialAgent.author}</p>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               {initialAgent.chats} interactions
            </div>

            <div className="flex gap-4 mt-8">
              <button className="p-2.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              </button>
              <div className="flex bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2 gap-3">
                 <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                    429
                 </button>
                 <div className="w-[1px] h-4 bg-zinc-200 self-center"></div>
                 <button className="text-zinc-400 hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5 10h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5"></path></svg>
                 </button>
              </div>
              <button className="p-2.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-red-500 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              </button>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all text-left">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-200/50 flex items-center justify-center text-zinc-500">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                 </div>
                 <span className="text-sm font-bold text-zinc-900">New chat</span>
               </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                 </div>
                 <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Voice</span>
               </div>
               <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 flex items-center gap-1">
                 {selectedVoice}
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
               </span>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">History</span>
               </div>
               <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                 </div>
                 <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Customize</span>
               </div>
               <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                 </div>
                 <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Pinned</span>
               </div>
               <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                 </div>
                 <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Style</span>
               </div>
               <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 flex items-center gap-1">
                 PipSqueak
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
               </span>
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-zinc-100 flex items-center gap-3">
          <button onClick={onBack} className="flex-1 py-4 px-6 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-[0.98]">
             Back to Discover
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ChatWindow;
