import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog - AI Character Chat News & Updates',
  description: 'Stay updated with the latest news, updates, and insights about AI characters, character chat technology, and the Agentwood platform.',
  keywords: [
    'AI character blog',
    'character chat news',
    'AI chatbot updates',
    'virtual character insights',
  ],
  url: '/blog',
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

