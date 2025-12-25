import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import CharacterProfile from '@/app/components/CharacterProfile';
import StructuredData from '@/app/components/StructuredData';
import { generateCharacterMetadata } from '@/lib/seo/metadata';
import { generateCharacterSchema } from '@/lib/seo/structured-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const persona = await db.personaTemplate.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      tagline: true,
      description: true,
      avatarUrl: true,
      category: true,
      archetype: true,
    },
  });

  if (!persona) {
    return {
      title: 'Character Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // Generate compliant metadata (async now)
  return await generateCharacterMetadata(persona);
}

// Enable ISR - regenerate every 24 hours
export const revalidate = 86400; // 24 hours in seconds

// Generate static params for top characters (for build-time optimization)
// This generates the most popular characters at build time
export async function generateStaticParams() {
  const topCharacters = await db.personaTemplate.findMany({
    select: { id: true },
    where: {
      viewCount: { gt: 10 }, // Only generate top characters at build time
    },
    orderBy: { viewCount: 'desc' },
    take: 10000, // Generate top 10k at build time
  });

  return topCharacters.map((char) => ({
    id: char.id,
  }));
}

export default async function CharacterProfilePage({ params }: PageProps) {
  const { id } = await params;
  
  const persona = await db.personaTemplate.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          conversations: true,
          followers: true,
          views: true,
          saves: true,
          comments: true,
        },
      },
    },
  });

  if (!persona) {
    notFound();
  }

  // Get chat starters from system examples or generate defaults
  const chatStarters = persona.system?.examples?.slice(0, 4).map((ex: any) => ex.user) || [
    `Tell me about yourself, ${persona.name}`,
    `What's your favorite thing to talk about?`,
    `How would you describe your personality?`,
    `What makes you unique?`,
  ];

  // Record view (async, don't block rendering)
  db.personaView.create({
    data: {
      personaId: id,
      userId: undefined,
    },
  }).catch(() => {}); // Silent fail

  // Increment view count (async)
  db.personaTemplate.update({
    where: { id },
    data: { 
      viewCount: { increment: 1 },
    },
  }).catch(() => {}); // Silent fail

  const structuredData = generateCharacterSchema({
    id: persona.id,
    name: persona.name,
    description: persona.description || undefined,
    avatarUrl: persona.avatarUrl || undefined,
  });

  return (
    <>
      <StructuredData data={structuredData} />
      <CharacterProfile
        persona={{
          id: persona.id,
          name: persona.name,
          tagline: persona.tagline,
          description: persona.description,
          avatarUrl: persona.avatarUrl,
          category: persona.category,
          archetype: persona.archetype,
          greeting: persona.greeting,
          creator: persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15),
          interactionCount: persona.interactionCount,
          followerCount: persona.followerCount || 0,
          viewCount: persona.viewCount,
          saveCount: (persona as any).saveCount || 0,
          commentCount: (persona as any).commentCount || 0,
          likes: 0,
          expertise: extractExpertise(persona.system?.persona || ''),
          simplePleasures: extractSimplePleasures(persona.system?.persona || ''),
          chatStarters: chatStarters,
        }}
      />
    </>
  );
}

function extractExpertise(persona: string): string {
  if (persona.includes('commander') || persona.includes('military')) {
    return 'Military leadership, team management, strategic planning';
  }
  if (persona.includes('therapist') || persona.includes('therapy')) {
    return 'Mental health support, counseling, team well-being';
  }
  if (persona.includes('doctor') || persona.includes('medical')) {
    return 'Medical advice, health care, patient support';
  }
  if (persona.includes('teacher') || persona.includes('educator')) {
    return 'Education, teaching, knowledge sharing';
  }
  if (persona.includes('lawyer') || persona.includes('legal')) {
    return 'Legal advice, law, justice';
  }
  return 'Professional expertise in their field';
}

function extractSimplePleasures(persona: string): string {
  if (persona.includes('coffee')) {
    return 'A quiet morning coffee, good conversation, and helping others';
  }
  if (persona.includes('book') || persona.includes('read')) {
    return 'A good book, learning new things, and meaningful connections';
  }
  return 'The small things in life, meaningful conversations, and making a difference';
}
