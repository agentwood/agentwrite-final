/**
 * Top 30 Anime Sources (by watch time, last 20 years)
 * Used for fantasy character mapping
 */

export interface AnimeSource {
  name: string;
  wikiBaseUrl: string; // Base URL for character wiki pages
  popularityRank: number;
  genre?: string[];
}

/**
 * Top 30 anime series based on watch time in the last 20 years
 * These are well-known anime with extensive character databases
 */
export const TOP_30_ANIME: AnimeSource[] = [
  { name: 'Naruto', wikiBaseUrl: 'https://naruto.fandom.com/wiki', popularityRank: 1 },
  { name: 'One Piece', wikiBaseUrl: 'https://onepiece.fandom.com/wiki', popularityRank: 2 },
  { name: 'Dragon Ball', wikiBaseUrl: 'https://dragonball.fandom.com/wiki', popularityRank: 3 },
  { name: 'Attack on Titan', wikiBaseUrl: 'https://attackontitan.fandom.com/wiki', popularityRank: 4 },
  { name: 'Demon Slayer', wikiBaseUrl: 'https://kimetsu-no-yaiba.fandom.com/wiki', popularityRank: 5 },
  { name: 'My Hero Academia', wikiBaseUrl: 'https://myheroacademia.fandom.com/wiki', popularityRank: 6 },
  { name: 'Boruto', wikiBaseUrl: 'https://naruto.fandom.com/wiki', popularityRank: 7 },
  { name: 'Jujutsu Kaisen', wikiBaseUrl: 'https://jujutsu-kaisen.fandom.com/wiki', popularityRank: 8 },
  { name: 'Death Note', wikiBaseUrl: 'https://deathnote.fandom.com/wiki', popularityRank: 9 },
  { name: 'Fullmetal Alchemist', wikiBaseUrl: 'https://fma.fandom.com/wiki', popularityRank: 10 },
  { name: 'Hunter x Hunter', wikiBaseUrl: 'https://hunterxhunter.fandom.com/wiki', popularityRank: 11 },
  { name: 'Bleach', wikiBaseUrl: 'https://bleach.fandom.com/wiki', popularityRank: 12 },
  { name: 'One Punch Man', wikiBaseUrl: 'https://onepunchman.fandom.com/wiki', popularityRank: 13 },
  { name: 'Tokyo Ghoul', wikiBaseUrl: 'https://tokyoghoul.fandom.com/wiki', popularityRank: 14 },
  { name: 'Fairy Tail', wikiBaseUrl: 'https://fairytail.fandom.com/wiki', popularityRank: 15 },
  { name: 'Sword Art Online', wikiBaseUrl: 'https://swordartonline.fandom.com/wiki', popularityRank: 16 },
  { name: 'Mob Psycho 100', wikiBaseUrl: 'https://mobpsycho100.fandom.com/wiki', popularityRank: 17 },
  { name: 'Chainsaw Man', wikiBaseUrl: 'https://chainsawman.fandom.com/wiki', popularityRank: 18 },
  { name: 'Spy x Family', wikiBaseUrl: 'https://spy-x-family.fandom.com/wiki', popularityRank: 19 },
  { name: 'Haikyuu!!', wikiBaseUrl: 'https://haikyuu.fandom.com/wiki', popularityRank: 20 },
  { name: 'Re:Zero', wikiBaseUrl: 'https://rezero.fandom.com/wiki', popularityRank: 21 },
  { name: 'Konosuba', wikiBaseUrl: 'https://konosuba.fandom.com/wiki', popularityRank: 22 },
  { name: 'Dr. Stone', wikiBaseUrl: 'https://dr-stone.fandom.com/wiki', popularityRank: 23 },
  { name: 'Black Clover', wikiBaseUrl: 'https://blackclover.fandom.com/wiki', popularityRank: 24 },
  { name: 'Fire Force', wikiBaseUrl: 'https://fireforce.fandom.com/wiki', popularityRank: 25 },
  { name: 'Promised Neverland', wikiBaseUrl: 'https://thepromisedneverland.fandom.com/wiki', popularityRank: 26 },
  { name: 'Vinland Saga', wikiBaseUrl: 'https://vinlandsaga.fandom.com/wiki', popularityRank: 27 },
  { name: 'Mushoku Tensei', wikiBaseUrl: 'https://mushokutensei.fandom.com/wiki', popularityRank: 28 },
  { name: 'That Time I Got Reincarnated as a Slime', wikiBaseUrl: 'https://tensura.fandom.com/wiki', popularityRank: 29 },
  { name: 'Overlord', wikiBaseUrl: 'https://overlordmaruyama.fandom.com/wiki', popularityRank: 30 },
];

/**
 * Get anime source by name (case-insensitive)
 */
export function getAnimeSource(animeName: string): AnimeSource | null {
  const normalizedName = animeName.toLowerCase().trim();
  return TOP_30_ANIME.find(anime => 
    anime.name.toLowerCase().includes(normalizedName) || 
    normalizedName.includes(anime.name.toLowerCase())
  ) || null;
}

/**
 * Get all anime sources matching a keyword
 */
export function searchAnimeSources(keyword: string): AnimeSource[] {
  const normalizedKeyword = keyword.toLowerCase();
  return TOP_30_ANIME.filter(anime => 
    anime.name.toLowerCase().includes(normalizedKeyword) ||
    normalizedKeyword.includes(anime.name.toLowerCase())
  );
}

