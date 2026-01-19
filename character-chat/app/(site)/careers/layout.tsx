import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Careers at Agentwood - Join Our AI Innovation Team',
    description: 'Join the Agentwood team and help shape the future of AI character interactions. Explore career opportunities in AI, engineering, and design.',
    keywords: [
        'AI jobs',
        'Agentwood careers',
        'tech jobs',
        'AI company jobs',
        'startup careers',
    ],
    url: '/careers',
});

export default function CareersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
