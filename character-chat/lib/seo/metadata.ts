import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';
const SITE_NAME = 'Agentwood';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export interface SEOParams {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  canonical?: string;
}

/**
 * Generate comprehensive SEO metadata for Next.js pages
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  canonical,
}: SEOParams): Metadata {
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Chat with AI Characters | Character.ai Alternative`;

  const defaultDescription = 'Chat with thousands of AI characters, create your own, and discover unique personalities. Free AI character chat platform similar to Character.ai.';
  const metaDescription = description || defaultDescription;

  const keywordsString = keywords.length > 0 
    ? keywords.join(', ')
    : 'AI characters, character chat, character.ai alternative, AI waifu, fantasy characters, AI chatbot, virtual characters, AI companion, chat with AI, character creator, AI roleplay';

  const canonicalUrl = canonical || url || SITE_URL;
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: keywordsString,
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    publisher: SITE_NAME,
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      url: url || canonicalUrl,
      title: fullTitle,
      description: metaDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
      creator: '@agentwood',
      site: '@agentwood',
    },
    metadataBase: new URL(SITE_URL),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

/**
 * Generate character-specific SEO metadata (with compliance checks)
 */
export async function generateCharacterMetadata(character: {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  category?: string | null;
  archetype?: string | null;
}) {
  // Import compliance checks
  const { generateCompliantContent, checkGoogleCompliance } = await import('./compliance/google-compliance');
  const { ensureContentUniqueness } = await import('./compliance/content-uniqueness');

  // Generate compliant, unique content
  const compliant = await generateCompliantContent({
    id: character.id,
    name: character.name,
    tagline: character.tagline,
    description: character.description,
    category: character.category,
    archetype: character.archetype,
  });

  // Ensure uniqueness
  const unique = await ensureContentUniqueness({
    title: compliant.title,
    description: compliant.description,
    characterId: character.id,
  });

  // Final compliance check
  const finalCheck = await checkGoogleCompliance({
    title: unique.title,
    description: unique.description,
    url: `/character/${character.id}`,
    characterId: character.id,
    category: character.category || undefined,
    archetype: character.archetype || undefined,
  });

  // If still not compliant, use fallback (but log warning)
  if (!finalCheck.passed) {
    console.warn(`Character ${character.id} metadata compliance score: ${finalCheck.score}`, finalCheck.issues);
  }

  const title = unique.title;
  const description = unique.description.substring(0, 157) + (unique.description.length > 157 ? '...' : '');

  // Generate natural keywords (not stuffed)
  const keywords = [
    character.name,
    'AI character',
    character.category || '',
    'chatbot',
  ].filter(Boolean).slice(0, 5); // Limit to 5 keywords to avoid stuffing

  const image = character.avatarUrl || DEFAULT_IMAGE;
  const url = `${SITE_URL}/character/${character.id}`;

  return generateMetadata({
    title,
    description,
    keywords,
    image,
    url,
    type: 'profile',
    canonical: url,
  });
}

/**
 * Generate category/archetype page metadata
 */
export function generateCategoryMetadata(category: string, type: 'category' | 'archetype' = 'category') {
  const title = `${category.charAt(0).toUpperCase() + category.slice(1)} AI Characters`;
  const description = `Discover and chat with ${category} AI characters. Browse our collection of unique virtual personalities and start conversations.`;
  
  const keywords = [
    `${category} AI characters`,
    `${category} chatbot`,
    'AI character chat',
    'virtual characters',
    'character.ai alternative',
  ];

  const url = `${SITE_URL}/discover${type === 'category' ? `?category=${category}` : `?archetype=${category}`}`;

  return generateMetadata({
    title,
    description,
    keywords,
    url,
    canonical: url,
  });
}

