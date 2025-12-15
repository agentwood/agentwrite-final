import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ChatWindow from '@/app/components/ChatWindow';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  
  const persona = await db.personaTemplate.findUnique({
    where: { id },
  });

  if (!persona) {
    notFound();
  }

  // Create or get conversation (simplified - in production, use user auth)
  let conversation = await db.conversation.findFirst({
    where: { personaId: id },
    orderBy: { createdAt: 'desc' },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        personaId: id,
        userId: null, // In production, use actual user ID
      },
    });
  }

  return (
    <ChatWindow
      persona={{
        id: persona.id,
        name: persona.name,
        avatarUrl: persona.avatarUrl,
        greeting: persona.greeting,
        voiceName: persona.voiceName,
      }}
      conversationId={conversation.id}
    />
  );
}

