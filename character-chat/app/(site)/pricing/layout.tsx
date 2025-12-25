import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Pricing Plans - Affordable AI Character Chat',
  description: 'Choose the perfect plan for chatting with AI characters. Free plan available with unlimited messages. Upgrade for more features, voice chat, and premium characters.',
  keywords: [
    'AI character pricing',
    'character chat plans',
    'AI chatbot pricing',
    'free AI chat',
    'premium characters',
    'voice chat pricing',
  ],
  url: '/pricing',
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


