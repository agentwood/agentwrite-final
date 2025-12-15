import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import CallUI from '@/app/components/CallUI';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CallPage({ params }: PageProps) {
  const { id } = await params;
  
  const persona = await db.personaTemplate.findUnique({
    where: { id },
  });

  if (!persona) {
    notFound();
  }

  return (
    <CallUI
      persona={{
        id: persona.id,
        name: persona.name,
        avatarUrl: persona.avatarUrl,
        systemPrompt: persona.systemPrompt,
        voiceName: persona.voiceName,
      }}
    />
  );
}

