import Link from 'next/link';
import { Search, Star, Sparkles, MessageCircle, Zap, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SafeImage from '../../components/SafeImage';
import AgeVerificationWrapper from '../../components/AgeVerificationWrapper';
import { db } from '@/lib/db';
import { CATEGORIES, CATEGORY_ICONS, HERO_STATES } from '@/lib/types/redesign';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  // Fetch only characters with unique cloned voices
  const allPersonas = await db.personaTemplate.findMany({
    where: { voiceReady: true },
    orderBy: { createdAt: 'desc' },
  });

  // Group by category
  const charactersByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = allPersonas.filter(p => p.category === cat);
    return acc;
  }, {} as Record<string, typeof allPersonas>);

  // Get recommended (featured or first from Recommend category)
  const recommendedCharacters = charactersByCategory['Recommend'] || allPersonas.slice(0, 5);

  // Transform to frontend format
  const characters = allPersonas.map(p => ({
    id: p.id,
    seedId: p.seedId || p.id,
    name: p.name,
    handle: p.handle || `@${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    description: p.description || p.tagline || '',
    category: p.category,
    avatarUrl: p.avatarUrl,
    totalChats: p.totalChats || `${Math.floor(Math.random() * 500)}k`,
    prompts: p.prompts ? JSON.parse(p.prompts) : [],
    tags: p.archetype ? [p.archetype] : [],
  }));

  // Get featured sections - using actual Helper characters with voices
  // Starters: Characters great for quick conversations
  const starterSeedIds = ['spongebob', 'alex-hype', 'yumi-nakamura', 'winston-morris'];
  const starters = allPersonas.filter(p => starterSeedIds.includes(p.seedId || ''));

  // Assistants: Helper characters for tasks (life coach, language tutors, trainer, etc.)
  const assistantSeedIds = ['sofia-vega', 'adelie-moreau', 'valentino-estrada', 'hector-alvarez', 'mana-hayashi', 'liam-ashford'];
  const assistants = allPersonas.filter(p => assistantSeedIds.includes(p.seedId || ''));

  return (
    <AgeVerificationWrapper>
      <HomePageClient
        characters={characters}
        categories={CATEGORIES}
        heroStates={HERO_STATES}
        starters={starters.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatarUrl,
          count: p.totalChats || '0',
          prompts: p.prompts ? JSON.parse(p.prompts) : [],
        }))}
        assistants={assistants.map(p => ({
          id: p.id,
          name: p.name,
          desc: p.description || p.tagline || '',
          img: p.avatarUrl,
          icon: p.archetype || 'Sparkles',
        }))}
      />
    </AgeVerificationWrapper>
  );
}
