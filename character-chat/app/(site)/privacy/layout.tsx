import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Learn how Agentwood collects, uses, and protects your personal information. Read our comprehensive privacy policy for AI character chat services.',
    keywords: [
        'privacy policy',
        'data protection',
        'user privacy',
        'AI chat privacy',
    ],
    url: '/privacy',
});

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
