'use client';

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
    <>
      <div style={{ position: 'fixed', top: 50, left: 0, zIndex: 9999, background: 'blue', color: 'white', padding: '10px', fontSize: '20px', width: '100%', textAlign: 'center' }}>
        CHAT CLIENT CHECK: IF YOU SEE THIS, CHAT IS UPDATING
      </div>
      <ChatWindow
        persona={persona}
        conversationId={conversationId}
      />
    </>
  );
}




