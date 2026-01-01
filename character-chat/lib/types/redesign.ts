// Character Profile Types - aligned with new redesign
export interface CharacterProfile {
    id: string;
    seedId: string;
    name: string;
    handle: string;
    description: string;
    category: CharacterCategory;

    // Demographics
    age: number;
    gender: 'M' | 'F' | 'NB';
    heritage: string;

    // Voice
    accentProfile: string;
    ttsVoiceSpec: string;
    voiceName: string;

    // Appearance
    faceDescription: string;
    avatarUrl: string;

    // Interaction
    prompts: string[];
    totalChats: string;

    // System
    archetype: string;
    systemPrompt: string;
}

export type CharacterCategory =
    | 'Recommend'
    | 'Play & Fun'
    | 'Helper'
    | 'Original'
    | 'Anime & Game'
    | 'Fiction & Media'
    | 'Icon';

export const CATEGORIES: CharacterCategory[] = [
    'Recommend',
    'Play & Fun',
    'Helper',
    'Original',
    'Anime & Game',
    'Fiction & Media',
    'Icon',
];

export const CATEGORY_ICONS: Record<CharacterCategory, string> = {
    'Recommend': '✅',
    'Play & Fun': '🎲',
    'Helper': '🧰',
    'Original': '🧪',
    'Anime & Game': '🎮',
    'Fiction & Media': '🎬',
    'Icon': '🧿',
};

// Settings types
export enum PageView {
    HOME = 'HOME',
    LIBRARY = 'LIBRARY',
    CREATE = 'CREATE',
    SETTINGS = 'SETTINGS',
    CHAT = 'CHAT',
}

export enum SettingsTab {
    GENERAL = 'GENERAL',
    SUBSCRIPTION = 'SUBSCRIPTION',
    PAYOUTS = 'PAYOUTS',
}

export interface PayoutTransaction {
    id: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Processing' | 'Held (90 Days)';
    period: string;
}

// Affiliate stats
export interface AffiliateStats {
    totalClicks: number;
    referrals: number;
    conversionRate: number;
    unpaidEarnings: number;
    totalEarnings: number;
    referralLink: string;
}

// Hero states for homepage
export interface HeroState {
    title: string;
    highlight: string;
    subtitle: string;
    gradient: string;
    emoji: string;
    bgColor: string;
    linkedCategory: CharacterCategory;
}

export const HERO_STATES: HeroState[] = [
    {
        title: "Looking for",
        highlight: "connections?",
        subtitle: "Discover millions of characters created by passionate writers.",
        gradient: "from-blue-600 to-indigo-600",
        emoji: '😍',
        bgColor: 'bg-rose-100',
        linkedCategory: 'Recommend'
    },
    {
        title: "Into",
        highlight: "silly things?",
        subtitle: "Laugh out loud with characters designed to brighten your day.",
        gradient: "from-yellow-400 to-orange-500",
        emoji: '🤪',
        bgColor: 'bg-yellow-100',
        linkedCategory: 'Play & Fun'
    },
    {
        title: "Down for",
        highlight: "adventures?",
        subtitle: "Embark on epic quests and explore new worlds.",
        gradient: "from-green-400 to-emerald-600",
        emoji: '🥳',
        bgColor: 'bg-green-100',
        linkedCategory: 'Anime & Game'
    },
    {
        title: "Up for",
        highlight: "something wild?",
        subtitle: "Experience thrilling scenarios and unpredictable twists.",
        gradient: "from-purple-600 to-pink-600",
        emoji: '😈',
        bgColor: 'bg-purple-100',
        linkedCategory: 'Icon'
    }
];
