/**
 * Celebrity Sources for Character Mapping
 * Top 10 celebrities/known people per profession
 * Used for real human character mapping
 */

export interface CelebritySource {
  name: string;
  profession: string;
  wikipediaUrl?: string;
  description?: string;
  popularityRank: number;
}

/**
 * Top 10 celebrities/known people per profession
 * Prioritizes people with extensive online information
 */
export const CELEBRITY_SOURCES_BY_PROFESSION: Record<string, CelebritySource[]> = {
  therapist: [
    { name: 'Dr. Phil McGraw', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Phil_McGraw', popularityRank: 1 },
    { name: 'Dr. Drew Pinsky', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Drew_Pinsky', popularityRank: 2 },
    { name: 'Esther Perel', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Esther_Perel', popularityRank: 3 },
    { name: 'Brené Brown', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Brené_Brown', popularityRank: 4 },
    { name: 'Dr. Gabor Maté', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Gabor_Maté', popularityRank: 5 },
    { name: 'Dr. Jordan Peterson', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Jordan_Peterson', popularityRank: 6 },
    { name: 'Dr. Mark Goulston', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mark_Goulston', popularityRank: 7 },
    { name: 'Dr. Ramani Durvasula', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ramani_Durvasula', popularityRank: 8 },
    { name: 'Dr. Nicole LePera', profession: 'therapist', popularityRank: 9 },
    { name: 'Dr. Rick Hanson', profession: 'therapist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Rick_Hanson', popularityRank: 10 },
  ],
  doctor: [
    { name: 'Dr. Sanjay Gupta', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Sanjay_Gupta', popularityRank: 1 },
    { name: 'Dr. Mehmet Oz', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mehmet_Oz', popularityRank: 2 },
    { name: 'Dr. Anthony Fauci', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Anthony_Fauci', popularityRank: 3 },
    { name: 'Dr. Drew Pinsky', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Drew_Pinsky', popularityRank: 4 },
    { name: 'Dr. Deepak Chopra', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Deepak_Chopra', popularityRank: 5 },
    { name: 'Dr. Michael Greger', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Michael_Greger', popularityRank: 6 },
    { name: 'Dr. Mark Hyman', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mark_Hyman', popularityRank: 7 },
    { name: 'Dr. Andrew Weil', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Andrew_Weil', popularityRank: 8 },
    { name: 'Dr. David Agus', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/David_Agus', popularityRank: 9 },
    { name: 'Dr. Atul Gawande', profession: 'doctor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Atul_Gawande', popularityRank: 10 },
  ],
  teacher: [
    { name: 'Jaime Escalante', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Jaime_Escalante', popularityRank: 1 },
    { name: 'Erin Gruwell', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Erin_Gruwell', popularityRank: 2 },
    { name: 'Rafe Esquith', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Rafe_Esquith', popularityRank: 3 },
    { name: 'Marva Collins', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Marva_Collins', popularityRank: 4 },
    { name: 'Dedé Ranahan', profession: 'teacher', popularityRank: 5 },
    { name: 'Ron Clark', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ron_Clark_(teacher)', popularityRank: 6 },
    { name: 'Michelle Rhee', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Michelle_Rhee', popularityRank: 7 },
    { name: 'Salman Khan', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Sal_Khan', popularityRank: 8 },
    { name: 'Bill Nye', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Bill_Nye', popularityRank: 9 },
    { name: 'Ken Robinson', profession: 'teacher', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ken_Robinson_(educationalist)', popularityRank: 10 },
  ],
  lawyer: [
    { name: 'Ruth Bader Ginsburg', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ruth_Bader_Ginsburg', popularityRank: 1 },
    { name: 'Alan Dershowitz', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Alan_Dershowitz', popularityRank: 2 },
    { name: 'Johnny Cochran', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Johnnie_Cochran', popularityRank: 3 },
    { name: 'Gloria Allred', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Gloria_Allred', popularityRank: 4 },
    { name: 'Mark Geragos', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mark_Geragos', popularityRank: 5 },
    { name: 'Jose Baez', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Jose_Baez', popularityRank: 6 },
    { name: 'Lisa Bloom', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Lisa_Bloom', popularityRank: 7 },
    { name: 'David Boies', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/David_Boies', popularityRank: 8 },
    { name: 'Robert Shapiro', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Robert_Shapiro', popularityRank: 9 },
    { name: 'Nancy Grace', profession: 'lawyer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Nancy_Grace', popularityRank: 10 },
  ],
  // Add more professions as needed
};

/**
 * Get celebrities for a profession
 */
export function getCelebritiesForProfession(profession: string): CelebritySource[] {
  const normalizedProfession = profession.toLowerCase().trim();
  return CELEBRITY_SOURCES_BY_PROFESSION[normalizedProfession] || [];
}

/**
 * Search celebrities across all professions
 */
export function searchCelebrities(keyword: string): CelebritySource[] {
  const normalizedKeyword = keyword.toLowerCase();
  const results: CelebritySource[] = [];
  
  for (const celebrities of Object.values(CELEBRITY_SOURCES_BY_PROFESSION)) {
    for (const celebrity of celebrities) {
      if (celebrity.name.toLowerCase().includes(normalizedKeyword) ||
          celebrity.profession.toLowerCase().includes(normalizedKeyword)) {
        results.push(celebrity);
      }
    }
  }
  
  return results.sort((a, b) => a.popularityRank - b.popularityRank);
}


