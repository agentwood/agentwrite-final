import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Agentwood - AI Character Chat Platform',
  description: 'Learn about Agentwood, the platform for chatting with AI characters. Our mission, vision, and commitment to creating the best AI character chat experience.',
  keywords: [
    'about Agentwood',
    'AI character platform',
    'character chat company',
    'our mission',
  ],
  url: '/about',
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

