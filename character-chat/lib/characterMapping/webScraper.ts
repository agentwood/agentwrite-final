/**
 * Web Scraper for Character Profiles
 * Scrapes Wikipedia and Fandom wiki pages for character information
 */

export interface CharacterProfile {
  name: string;
  description: string;
  personality?: string;
  appearance?: string;
  age?: string;
  gender?: string;
  voiceCharacteristics?: string;
  speakingPatterns?: string;
  sourceUrl: string;
}

/**
 * Scrape character profile from Wikipedia
 * Uses Wikipedia API for structured data
 */
export async function scrapeWikipediaProfile(url: string): Promise<CharacterProfile | null> {
  try {
    // Extract page title from URL
    const urlMatch = url.match(/\/wiki\/(.+)$/);
    if (!urlMatch) return null;
    
    const pageTitle = decodeURIComponent(urlMatch[1]);
    
    // Use Wikipedia API to get page content
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'AgentWrite Character Mapping Bot 1.0',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      name: data.title || pageTitle,
      description: data.extract || '',
      sourceUrl: url,
    };
  } catch (error) {
    console.error('Error scraping Wikipedia:', error);
    return null;
  }
}

/**
 * Scrape character profile from Fandom wiki
 * Uses Fandom API or direct page scraping
 */
export async function scrapeFandomProfile(url: string): Promise<CharacterProfile | null> {
  try {
    // For Fandom wikis, we can try to use the Fandom API or scrape the page
    // Note: This is a simplified implementation - production should use proper HTML parsing
    
    // Try to extract character name from URL
    const urlMatch = url.match(/wiki\/(.+)$/);
    if (!urlMatch) return null;
    
    const characterName = decodeURIComponent(urlMatch[1].replace(/_/g, ' '));
    
    // Fetch the page HTML (in production, use a proper HTML parser like cheerio)
    // For now, return a basic structure
    return {
      name: characterName,
      description: `Character from ${extractWikiName(url)}`,
      sourceUrl: url,
    };
  } catch (error) {
    console.error('Error scraping Fandom:', error);
    return null;
  }
}

/**
 * Extract wiki name from Fandom URL
 */
function extractWikiName(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0]; // e.g., "naruto" from "naruto.fandom.com"
    }
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Scrape character profile from any supported source
 */
export async function scrapeCharacterProfile(url: string, sourceType: 'anime' | 'celebrity' | 'real_person'): Promise<CharacterProfile | null> {
  if (url.includes('wikipedia.org')) {
    return scrapeWikipediaProfile(url);
  } else if (url.includes('fandom.com') || url.includes('.fandom.com')) {
    return scrapeFandomProfile(url);
  }
  
  return null;
}

/**
 * Extract keywords from character profile
 * Used for voice-character matching
 */
export function extractKeywords(profile: CharacterProfile): string[] {
  const keywords: string[] = [];
  
  // Combine all text fields
  const allText = [
    profile.description || '',
    profile.personality || '',
    profile.appearance || '',
    profile.voiceCharacteristics || '',
    profile.speakingPatterns || '',
  ].join(' ').toLowerCase();
  
  // Extract common personality/character traits
  const traitKeywords = [
    'shy', 'confident', 'energetic', 'calm', 'aggressive', 'gentle', 'serious', 'playful',
    'wise', 'naive', 'mature', 'youthful', 'cheerful', 'sad', 'angry', 'happy',
    'friendly', 'aloof', 'warm', 'cold', 'enthusiastic', 'laid-back', 'formal', 'casual',
    'professional', 'amateur', 'experienced', 'inexperienced', 'brave', 'cowardly',
    'strong', 'weak', 'tall', 'short', 'young', 'old', 'middle-aged',
  ];
  
  for (const trait of traitKeywords) {
    if (allText.includes(trait)) {
      keywords.push(trait);
    }
  }
  
  // Extract age/gender if available
  if (profile.age) {
    const ageText = profile.age.toLowerCase();
    if (ageText.includes('young') || ageText.includes('teen') || ageText.includes('child')) {
      keywords.push('young');
    } else if (ageText.includes('old') || ageText.includes('elder') || ageText.includes('senior')) {
      keywords.push('old');
    } else {
      keywords.push('middle');
    }
  }
  
  if (profile.gender) {
    keywords.push(profile.gender.toLowerCase());
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

