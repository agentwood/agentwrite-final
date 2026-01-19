import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Safety Center - Safe AI Chat Guidelines & Reporting',
    description: 'Your safety is our priority. Learn about Agentwood safety measures, content moderation, and how to report issues on our AI character chat platform.',
    keywords: [
        'AI safety',
        'chat safety',
        'content moderation',
        'report issues',
        'safe AI chat',
    ],
    url: '/safety',
});

export default function SafetyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
