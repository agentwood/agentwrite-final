'use client';

import AgeGate from './AgeGate';
import ChatWindow from './ChatWindow';

interface Persona {
  id: string;
  name: string;
  avatarUrl: string;
  greeting?: string | null;
  voiceName: string;
  styleHint?: string | null;
  tagline?: string | null;
  description?: string | null;
  category: string;
  archetype?: string | null;
  followerCount?: number;
  viewCount?: number;
  interactionCount?: number;
  saveCount?: number;
  commentCount?: number;
}

interface ChatPageClientProps {
  persona: Persona;
  conversationId: string;
}

export default function ChatPageClient({ persona, conversationId }: ChatPageClientProps) {
  return (
    <AgeGate>
      <ChatWindow
        persona={persona}
        conversationId={conversationId}
      />
    </AgeGate>
  );
}



