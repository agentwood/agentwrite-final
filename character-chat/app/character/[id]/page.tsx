
import { Metadata, ResolvingMetadata } from 'next';
import { db } from '@/lib/db';
import MasterDashboard from '../../components/master/MasterDashboard';
import { getShowcaseCharacters } from '@/lib/master/geminiService';
import { redirect } from 'next/navigation';


type Props = {
    params: Promise<{ id: string }>
};

// SEO Metadata Generator
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    const character = await db.personaTemplate.findUnique({
        where: { id },
        select: { name: true, tagline: true, avatarUrl: true, description: true, archetype: true, category: true }
    });

    if (!character) {
        return {
            title: 'Character Not Found | Agentwood',
        };
    }

    // Aggressive SEO Title Template
    const title = `Chat with ${character.name} (AI Persona) - Free & Unfiltered | Agentwood`;

    // Rich Description
    const baseDesc = character.tagline || character.description || '';
    const cleanDesc = baseDesc.replace(/[\n\r]+/g, ' ').substring(0, 155);
    const description = `Talk to ${character.name} online for free. ${cleanDesc}... The best Character.ai alternative with no filters. Start chatting now!`;

    const imageUrl = character.avatarUrl && character.avatarUrl !== 'pending'
        ? character.avatarUrl
        : 'https://agentwood.xyz/TwitterCardValidator.png';

    return {
        title: title,
        description: description,
        keywords: [
            `chat with ${character.name}`,
            `${character.name} ai`,
            `${character.name} chatbot`,
            character.category || 'ai character',
            'character.ai alternative',
            'no filter ai',
            'nsfw ai chat',
            'free ai chat'
        ],
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `Chat with ${character.name} AI`,
                }
            ],
            url: `https://agentwood.xyz/character/${id}`,
            type: 'profile',
            siteName: 'Agentwood',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [imageUrl],
            creator: '@agentwood',
        },
        alternates: {
            canonical: `https://agentwood.xyz/character/${id}`,
        }
    };
}

export default async function CharacterPage({ params }: Props) {
    const { id } = await params;

    // 1. Fetch the specific character
    const character = await db.personaTemplate.findUnique({
        where: { id },
        include: {
            voiceSeed: true
        }
    });

    if (!character) {
        // If character not found, redirect to home
        redirect('/home');
    }

    // 2. Fetch standard showcase/list characters to populate the background grid
    // We need to fetch *real* characters from DB to match MasterDashboard logic
    // Replicating getShowcaseCharacters logic or calling it if it supports DB now
    // For now, let's fetch top 50 characters so the dashboard isn't empty underneath
    const otherCharacters = await db.personaTemplate.findMany({
        where: {
            voiceReady: true,
            id: { not: id } // Exclude current to avoid dupe
        },
        take: 40,
        orderBy: { viewCount: 'desc' },
        include: {
            voiceSeed: true
        }
    });

    /* 3. Format strictly to CharacterProfile type matching MasterDashboard expectation
     Matching logic from app/(site)/home/page.tsx for consistency */
    const transformCharacter = (p: any) => {
        // Generate consistent random view count if missing
        const seed = p.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const randomViewCount = 200 + (seed % 1600);

        return {
            id: p.id,
            name: p.name,
            handle: p.handle || `@${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            tagline: p.tagline || p.description?.slice(0, 60) + '...' || '',
            description: p.description || '',
            avatarUrl: p.avatarUrl || '/avatars/default.png',
            image: p.avatarUrl, // LandingPage compatibility
            personality: p.personality || '',
            category: p.category || 'Original',

            // Schema has totalChats as String?, interactionCount as Int
            // HomePage uses totalChats parsed as int. Let's do the same for consistency.
            chatCount: typeof p.totalChats === 'number' ? p.totalChats : parseInt(String(p.totalChats || '0')) || 0,

            viewCount: p.viewCount && p.viewCount > 0 ? p.viewCount : randomViewCount,
            rating: 4.8,
            isVerified: true,
            creator: p.creator ? { name: p.creator.name, avatar: p.creator.image } : { name: 'Agentwood', avatar: '/logo.png' },
            socials: { twitter: '', instagram: '' },

            voiceId: p.voiceSeedId || '',
            styleHint: p.styleHint || '',
            greeting: p.greeting || '',

            // Use prompts field (JSON string) not tags
            chatStarters: (() => {
                try {
                    return p.prompts ? JSON.parse(p.prompts) : [
                        "Hello! How can I help you today?",
                        "Tell me more about yourself.",
                        "What are you thinking about?"
                    ];
                } catch (e) {
                    console.error("Failed to parse chat starters for character", p.id);
                    return [
                        "Hello! How can I help you today?",
                        "Tell me more about yourself.",
                        "What are you thinking about?"
                    ];
                }
            })()
        };
    };

    const selectedCharProfile = transformCharacter(character);
    const otherProfiles = otherCharacters.map(transformCharacter);

    // Put selected character FIRST so it's easily found
    const allCharacters = [selectedCharProfile, ...otherProfiles];

    return (
        <MasterDashboard
            initialCharacters={allCharacters}
            initialView="character"
            initialCharacterId={id}
        />
    );
}
