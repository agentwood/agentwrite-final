/**
 * Structured Data (JSON-LD) utilities for SEO
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    url?: string;
  };
}

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  description?: string;
  image?: string;
  url?: string;
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished?: string;
  dateModified?: string;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agentwood',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'AI character chat platform where you can chat with thousands of AI characters, create your own, and discover unique personalities.',
    sameAs: [
      'https://twitter.com/agentwood',
      'https://github.com/agentwood',
    ],
  };
}

/**
 * Generate Person schema for characters
 */
export function generateCharacterSchema(character: {
  id: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
}): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: character.name,
    description: character.description || undefined,
    image: character.avatarUrl || undefined,
    url: `${SITE_URL}/character/${character.id}`,
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Agentwood',
    url: SITE_URL,
    description: 'AI character chat platform',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/discover?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbs(items: Array<{ name: string; url: string }>): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate ItemList schema for character listings
 */
export function generateCharacterListSchema(characters: Array<{
  id: string;
  name: string;
  url: string;
  description?: string;
  image?: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: characters.map((character, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: character.name,
        description: character.description,
        image: character.image,
        url: character.url.startsWith('http') ? character.url : `${SITE_URL}${character.url}`,
      },
    })),
  };
}

/**
 * Render structured data as JSON-LD script tag
 */
export function renderStructuredData(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

// ============================================
// FAQ SCHEMA - Critical for 100K+ page SEO
// ============================================

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate FAQPage schema for any page with Q&A content
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Collection/Category schema for category pages
 */
export function generateCollectionSchema(
  name: string,
  description: string,
  itemCount: number,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    numberOfItems: itemCount,
    provider: {
      '@type': 'Organization',
      name: 'Agentwood',
      url: SITE_URL,
    },
  };
}

// ============================================
// AUTO-GENERATED FAQs for Programmatic SEO
// ============================================

/**
 * Generate FAQs for a character page
 */
export function generateCharacterFAQs(character: {
  name: string;
  category?: string | null;
  archetype?: string | null;
  personality?: string | null;
}): FAQItem[] {
  const { name, category, archetype, personality } = character;

  return [
    {
      question: `How do I chat with ${name}?`,
      answer: `To chat with ${name}, simply visit their character page on Agentwood and click the "Start Chat" button. You can have unlimited conversations with ${name} for free.`,
    },
    {
      question: `What is ${name}'s personality like?`,
      answer: personality
        ? `${name} has the following personality: ${personality}`
        : `${name} is a ${archetype || 'unique'} character in the ${category || 'AI'} category. Start chatting to discover their unique personality!`,
    },
    {
      question: `Is ${name} free to chat with?`,
      answer: `Yes! You can chat with ${name} completely free on Agentwood. Premium features like voice chat are available with a subscription.`,
    },
    {
      question: `Can I create my own character like ${name}?`,
      answer: `Absolutely! Agentwood allows you to create your own AI characters. Visit the Create page to design a character with your own backstory, personality, and appearance.`,
    },
  ];
}

/**
 * Generate FAQs for a category page
 */
export function generateCategoryFAQs(category: string, count: number): FAQItem[] {
  return [
    {
      question: `What are ${category} AI characters?`,
      answer: `${category} AI characters are virtual personas designed for immersive conversations and roleplay in the ${category} genre. They offer unique storylines, personalities, and interactive experiences.`,
    },
    {
      question: `How many ${category} characters are available?`,
      answer: `Agentwood currently has ${count}+ ${category} characters available for free chat. New characters are added regularly!`,
    },
    {
      question: `Which ${category} character is most popular?`,
      answer: `Check out our "Top ${category}" page to see the most popular characters based on views and chat sessions. Popularity changes daily!`,
    },
    {
      question: `Can I create a ${category} character?`,
      answer: `Yes! You can create your own ${category} character on Agentwood. Use our character creator to define their backstory, personality, and appearance.`,
    },
  ];
}

/**
 * Generate FAQs for archetype pages
 */
export function generateArchetypeFAQs(archetype: string): FAQItem[] {
  return [
    {
      question: `What is a ${archetype} AI character?`,
      answer: `A ${archetype} is a character archetype commonly found in storytelling. On Agentwood, ${archetype} characters embody these traits for immersive roleplay conversations.`,
    },
    {
      question: `How does a ${archetype} character behave?`,
      answer: `${archetype} characters have distinct personality traits and conversational styles. Chat with one to experience their unique perspective!`,
    },
    {
      question: `Are ${archetype} characters good for beginners?`,
      answer: `${archetype} characters can be great for all experience levels. They offer engaging conversations whether you're new to AI chat or an experienced user.`,
    },
  ];
}

/**
 * Generate FAQs for "chat with" intent pages
 */
export function generateChatWithFAQs(type: string): FAQItem[] {
  return [
    {
      question: `Can I really chat with a ${type}?`,
      answer: `Yes! Agentwood offers AI-powered ${type} characters you can chat with 24/7 for free. Each character has a unique personality and storyline.`,
    },
    {
      question: `Is chatting with a ${type} AI free?`,
      answer: `Basic chat with ${type} characters is completely free. Premium features like voice chat and extended memory are available with a subscription.`,
    },
    {
      question: `How realistic are ${type} AI conversations?`,
      answer: `Agentwood uses advanced AI to create natural, engaging conversations. Our ${type} characters respond contextually and remember your conversation history.`,
    },
    {
      question: `Can I customize my ${type} character?`,
      answer: `You can create your own ${type} character with custom personality, appearance, and backstory using our character creator.`,
    },
  ];
}
