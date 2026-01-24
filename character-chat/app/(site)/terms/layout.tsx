import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Terms of Service - User Agreement & Guidelines',
    description: 'Read the Agentwood Terms of Service. Understand the user agreement, acceptable use policies, and guidelines for our AI character chat platform.',
    keywords: [
        'terms of service',
        'user agreement',
        'AI chat terms',
        'platform guidelines',
    ],
    url: '/terms',
});

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
