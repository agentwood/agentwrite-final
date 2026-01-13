import { db } from '@/lib/db';
import MasterDashboard from '../../components/master/MasterDashboard';
import AgeVerificationWrapper from '../../components/AgeVerificationWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your stories and characters.',
};

export default async function HomePage() {
  // Fetch real characters from the database
  const allPersonas = await db.personaTemplate.findMany({
    where: { voiceReady: true },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to the format expected by the master design
  const characters = allPersonas.map(p => {
    // Generate consistent random view count based on character id (seeded)
    const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomViewCount = 200 + (seed % 1600); // 200-1800 range

    return {
      id: p.id,
      name: p.name,
      handle: p.handle || `@${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      tagline: p.tagline || p.description?.slice(0, 60) + '...' || '',
      description: p.description || '',
      avatarUrl: p.avatarUrl,
      category: p.category || 'Original',
      chatCount: typeof p.totalChats === 'number' ? p.totalChats : parseInt(String(p.totalChats)) || 0,
      viewCount: p.viewCount && p.viewCount > 0 ? p.viewCount : randomViewCount,
      chatStarters: p.prompts ? JSON.parse(p.prompts) : [
        "Hello! How can I help you today?",
        "Tell me more about yourself.",
        "What are you thinking about?"
      ]
    };
  });

  return (
    <AgeVerificationWrapper>
      <MasterDashboard initialCharacters={characters} />
    </AgeVerificationWrapper>
  );
}
