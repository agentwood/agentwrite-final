'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function Composer({ onSend, disabled, placeholder = "Type your message..." }: ComposerProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-zinc-50 text-zinc-900 rounded-2xl py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:bg-white focus:border-zinc-900 border border-zinc-200 transition-all placeholder:text-zinc-400 shadow-sm"
      />
      <button 
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-zinc-900 text-white rounded-xl disabled:opacity-50 disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-md shadow-zinc-900/20"
      >
        {disabled ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} fill="currentColor" />}
      </button>
    </>
  );
}
