import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Create AI Character - Build Your Own Custom AI Personality',
    description: 'Create your own unique AI characters with custom personalities, voices, and appearances. Design engaging virtual companions on Agentwood.',
    keywords: [
        'create AI character',
        'custom AI chatbot',
        'build AI personality',
        'character creator',
        'AI companion builder',
        'virtual character creator',
    ],
    url: '/create',
});

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
