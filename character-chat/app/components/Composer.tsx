'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

