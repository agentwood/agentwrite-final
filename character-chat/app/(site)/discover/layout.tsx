import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Discover AI Characters - Browse Thousands of Virtual Personalities',
  description: 'Discover and chat with thousands of AI characters. Browse by category, search by name, or explore trending characters. Find your perfect AI companion today.',
  keywords: [
    'discover AI characters',
    'browse characters',
    'AI character search',
    'character categories',
    'trending characters',
    'popular AI characters',
  ],
  url: '/discover',
});

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


