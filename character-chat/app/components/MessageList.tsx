'use client';

import VoiceButton from './VoiceButton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: number;
}

interface MessageListProps {
  messages: Message[];
  voiceEnabled?: boolean;
  voiceName?: string;
}

export default function MessageList({ messages, voiceEnabled, voiceName }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="flex items-start gap-2">
              <p className="whitespace-pre-wrap break-words flex-1">{message.text}</p>
              {message.role === 'assistant' && voiceEnabled && voiceName && (
                <VoiceButton text={message.text} voiceName={voiceName} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

