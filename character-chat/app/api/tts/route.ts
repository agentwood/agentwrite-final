import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionStatus, getPlanLimits } from '@/lib/subscription';
import { db } from '@/lib/db';
import { runpodChatterboxClient } from '@/lib/audio/runpodChatterboxClient';
import { chatterboxArchetypeClient } from '@/lib/audio/chatterboxArchetypeClient';
import { generateWithChatterbox, CHARACTER_ACCENT_MAP } from '@/lib/audio/chatterboxTTS';

/**
 * TTS Route - RunPod Serverless Chatterbox (Primary)
 * 
 * Priority:
 * 1. RunPod Serverless Chatterbox (pay-per-request, ~$0.00016/sec)
 * 2. Self-hosted Chatterbox (if configured)
 * 3. HuggingFace Chatterbox Gradio (free, rate-limited)
 * 4. ElevenLabs (paid fallback)
 * 
 * COST: ~$5-50/mo depending on usage (scales to zero!)
 */

/**
 * Clean text for TTS by removing roleplay markers, stage directions, and actions
 */
function cleanTextForTTS(text: string): string {
  let cleaned = text;

  // Remove asterisk-wrapped expressions: *smiles*, *laughs nervously*
  cleaned = cleaned.replace(/\*[^*]+\*/g, '');

  // Remove parenthetical expressions: (sighs), (whispers)
  cleaned = cleaned.replace(/\([^)]+\)/g, '');

  // Remove bracket-wrapped expressions: [laughs], [smiling]
  cleaned = cleaned.replace(/\[[^\]]+\]/g, '');

  // Remove tildes: ~actions~
  cleaned = cleaned.replace(/~[^~]+~/g, '');

  // Remove italicized text at the start
  cleaned = cleaned.replace(/^_[^_]+_\s*/g, '');

  // Remove character self-introductions
  cleaned = cleaned.replace(
    /^(?:Hi!?|Hello!?|Hey!?|Oh,? hello!?)?\\s*I(?:'m| am)\\s+[A-Z][A-Za-z]+(?:\\s+[A-Z][A-Za-z]+)?\\s*[.!?]\\s*/gi,
    ''
  );

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  // Fallback if everything was stripped
  if (!cleaned || cleaned.length < 2) {
    return 'Hello!';
  }

  return cleaned;
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;

  try {
    const {
      text,
      personaId,
      characterName,
      category,
      tagline,
      description,
    } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    userId = request.headers.get('x-user-id') || null;

    // Clean the text for TTS
    const cleanedText = cleanTextForTTS(text);
    console.log(`[TTS] Text: "${text.substring(0, 50)}..." → "${cleanedText.substring(0, 50)}..."`);

    // Get character seedId from database
    let seedId: string | null = null;
    if (personaId) {
      const persona = await db.personaTemplate.findUnique({
        where: { id: personaId },
        select: { seedId: true },
      });
      seedId = persona?.seedId || null;
    }

    // Check subscription quota
    const subscriptionStatus = await getSubscriptionStatus(userId);
    const limits = getPlanLimits(subscriptionStatus.planId);

    if (limits.ttsSecondsPerDay > 0) {
      const estimatedSeconds = Math.ceil((text.split(' ').length / 150) * 60);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const quota = userId ? await db.userQuota.findFirst({
        where: {
          userId: userId,
          lastResetDate: { gte: today },
        },
      }) : null;

      const usedSeconds = quota?.ttsSecondsToday || 0;

      if (usedSeconds + estimatedSeconds > limits.ttsSecondsPerDay) {
        return NextResponse.json(
          {
            error: 'Daily TTS limit reached',
            reason: `You've reached your daily TTS limit of ${limits.ttsSecondsPerDay} seconds.`,
            quotaExceeded: true,
            upgradeUrl: '/pricing',
            currentUsage: Math.max(usedSeconds, limits.ttsSecondsPerDay),
            limit: limits.ttsSecondsPerDay,
          },
          { status: 429 }
        );
      }
    }

    const characterProfile = { name: characterName, description, category, tagline };

    // Normalize characterId - map common name variations to seedId
    const CHARACTER_NAME_TO_SEEDID: Record<string, string> = {
      'Dr. Lucien Vale': 'dr_lucien_vale',
      'Dr Lucien Vale': 'dr_lucien_vale',
      'Marge Halloway': 'marge-halloway',
      'Raj': 'raj-corner-store',
      'Doodle Dave': 'doodle-dave',
      'Sunny Sato': 'sunny-sato',
      'Nico': 'nico-awkward',
      'Coach Boone': 'coach-boone',
      'Camille Laurent': 'camille-laurent',
      'Kira NeonFox': 'kira-neonfox',
      'Elena Morales': 'elena-morales',
      'Eloise Durand': 'eloise-durand',
      'Cole Briggs': 'cole-briggs',
      'Oliver Finch': 'oliver-finch',
      'Mina Kwon': 'mina-kwon-innovator',
      'Harold Whitcombe': 'harold-whitcombe',
      'Valentina Russo': 'valentina-russo',
      'Theo Nguyen': 'theo-nguyen',
      'Rhea Stone': 'rhea-stone',
      'Jasper Bloom': 'jasper-bloom',
      'Nora Feld': 'nora-feld',
      'Samir Haddad': 'samir-haddad',
      'Penny Clarke': 'penny-clarke',
      'Victor Hale': 'victor-hale',
      'Rowan Pike': 'rowan-pike',
    };

    // Use seedId if available, otherwise try to map characterName, otherwise use characterName as-is
    const rawCharacterId = seedId || CHARACTER_NAME_TO_SEEDID[characterName] || characterName || 'default';
    // Normalize: lowercase and replace spaces with hyphens for consistency
    const characterId = rawCharacterId.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');

    console.log(`[TTS] Character lookup: seedId=${seedId}, characterName=${characterName}, resolved characterId=${characterId}`);


    // =============================================
    // 20 CANONICAL ARCHETYPES - Audio Profiles
    // (From lib/voices/archetypes.json)
    // =============================================
    const ARCHETYPE_AUDIO_PROFILES: Record<string, {
      pitch: number,
      speed: number,
      exaggeration: number,
      pause_density: number,
      intonation_variance: number,
      emphasis_strength: number
    }> = {
      // === AUTHORITY & POWER ===
      'cold_authority': { pitch: -1.5, speed: 0.9, exaggeration: 0.5, pause_density: 0.6, intonation_variance: 0.3, emphasis_strength: 0.7 },
      'dark_manipulator': { pitch: -2.0, speed: 0.85, exaggeration: 0.5, pause_density: 0.7, intonation_variance: 0.4, emphasis_strength: 0.6 },
      'ruthless_operator': { pitch: -1.5, speed: 0.95, exaggeration: 0.5, pause_density: 0.5, intonation_variance: 0.2, emphasis_strength: 0.6 },

      // === MENTORSHIP & SUPPORT ===
      'warm_mentor': { pitch: 0.0, speed: 1.0, exaggeration: 0.5, pause_density: 0.5, intonation_variance: 0.5, emphasis_strength: 0.5 },
      'gentle_companion': { pitch: 0.5, speed: 0.9, exaggeration: 0.5, pause_density: 0.6, intonation_variance: 0.5, emphasis_strength: 0.3 },

      // === INTELLIGENCE & ANALYSIS ===
      'analytical_observer': { pitch: -0.5, speed: 0.95, exaggeration: 0.5, pause_density: 0.4, intonation_variance: 0.2, emphasis_strength: 0.4 },
      'corporate_strategist': { pitch: -0.5, speed: 1.0, exaggeration: 0.5, pause_density: 0.4, intonation_variance: 0.3, emphasis_strength: 0.5 },
      'ancient_scholar': { pitch: -2.5, speed: 0.8, exaggeration: 0.5, pause_density: 0.7, intonation_variance: 0.3, emphasis_strength: 0.5 },
      'synthetic_intelligence': { pitch: -1.0, speed: 0.95, exaggeration: 0.3, pause_density: 0.4, intonation_variance: 0.1, emphasis_strength: 0.3 },

      // === ENERGY & CHAOS ===
      'playful_trickster': { pitch: 1.0, speed: 1.15, exaggeration: 0.7, pause_density: 0.3, intonation_variance: 0.8, emphasis_strength: 0.7 },
      'energetic_motivator': { pitch: 1.5, speed: 1.2, exaggeration: 0.7, pause_density: 0.2, intonation_variance: 0.7, emphasis_strength: 0.9 },
      'chaotic_genius': { pitch: 0.5, speed: 1.3, exaggeration: 0.7, pause_density: 0.3, intonation_variance: 0.9, emphasis_strength: 0.8 },
      'curious_explorer': { pitch: 0.5, speed: 1.1, exaggeration: 0.6, pause_density: 0.4, intonation_variance: 0.7, emphasis_strength: 0.6 },
      'fanatical_believer': { pitch: 0.5, speed: 1.1, exaggeration: 0.8, pause_density: 0.3, intonation_variance: 0.6, emphasis_strength: 0.9 },

      // === STOICISM & PROTECTION ===
      'stoic_guardian': { pitch: -1.0, speed: 0.9, exaggeration: 0.4, pause_density: 0.5, intonation_variance: 0.2, emphasis_strength: 0.5 },
      'reluctant_hero': { pitch: 0.0, speed: 0.95, exaggeration: 0.5, pause_density: 0.6, intonation_variance: 0.5, emphasis_strength: 0.4 },

      // === DIPLOMACY & PERSUASION ===
      'noble_diplomat': { pitch: 0.0, speed: 0.95, exaggeration: 0.5, pause_density: 0.5, intonation_variance: 0.4, emphasis_strength: 0.4 },
      'visionary_futurist': { pitch: 0.5, speed: 1.1, exaggeration: 0.6, pause_density: 0.4, intonation_variance: 0.6, emphasis_strength: 0.7 },

      // === CYNICISM & HUMOR ===
      'cynical_realist': { pitch: -0.5, speed: 0.95, exaggeration: 0.5, pause_density: 0.5, intonation_variance: 0.3, emphasis_strength: 0.5 },
      'deadpan_humorist': { pitch: 0.0, speed: 0.9, exaggeration: 0.4, pause_density: 0.6, intonation_variance: 0.2, emphasis_strength: 0.3 },
    };

    // Map ALL characters to RunPod Chatterbox profiles (Base or Virtual)
    const CHARACTER_ARCHETYPE_MAP: Record<string, { archetype: string; gender: string }> = {
      // === PLAY & FUN ===
      'big-tom': { archetype: 'warm_mentor', gender: 'male' },
      'doodle-dave': { archetype: 'chaotic_genius', gender: 'male' },          // Manic creator
      'sunny-sato': { archetype: 'energetic_motivator', gender: 'female' },    // Hyper host
      'nico-awkward': { archetype: 'reluctant_hero', gender: 'male' },         // Awkward protagonist
      'mina-kwon': { archetype: 'energetic_motivator', gender: 'female' },
      'boring-history-sleep': { archetype: 'ancient_scholar', gender: 'male' },// Professor Monotone
      'spongebob': { archetype: 'playful_trickster', gender: 'male' },
      'winston-morris': { archetype: 'cynical_realist', gender: 'male' },      // Gruff veteran
      'dj-kira-brooks': { archetype: 'energetic_motivator', gender: 'female' },
      'trap-a-holics': { archetype: 'energetic_motivator', gender: 'male' },
      'hoshi-kim': { archetype: 'energetic_motivator', gender: 'female' },
      'friendly-women': { archetype: 'gentle_companion', gender: 'female' },
      'rei-tanaka': { archetype: 'gentle_companion', gender: 'male' },
      'sarah-wheeler': { archetype: 'warm_mentor', gender: 'female' },

      // === FUN CATEGORY ===
      'dr_lucien_vale': { archetype: 'dark_manipulator', gender: 'male' },     // Villain!
      'alien-zorg': { archetype: 'ruthless_operator', gender: 'male' },        // Alien menace
      'captain-bucky': { archetype: 'energetic_motivator', gender: 'male' },
      'chippy-the-squirrel': { archetype: 'playful_trickster', gender: 'female' },
      'detective-mittens': { archetype: 'analytical_observer', gender: 'male' },
      'disco-dave': { archetype: 'energetic_motivator', gender: 'male' },
      'grill-master-bob': { archetype: 'warm_mentor', gender: 'male' },
      'luna-the-stargazer': { archetype: 'gentle_companion', gender: 'female' }, // Dreamy
      'sir-prance-a-lot': { archetype: 'noble_diplomat', gender: 'male' },
      'time-traveler-tina': { archetype: 'curious_explorer', gender: 'female' },
      'zombie-pete': { archetype: 'deadpan_humorist', gender: 'male' },

      // === HELPER/HELPFUL CATEGORY ===
      'grandpa-joe': { archetype: 'warm_mentor', gender: 'male' },
      'hector-alvarez': { archetype: 'corporate_strategist', gender: 'male' }, // Finance
      'elevenlabs-adam': { archetype: 'warm_mentor', gender: 'male' },
      'professor-david-okafor': { archetype: 'ancient_scholar', gender: 'male' },
      'valentino-estrada': { archetype: 'noble_diplomat', gender: 'male' },
      'yumi-nakamura': { archetype: 'gentle_companion', gender: 'female' },
      'zara-okonkwo': { archetype: 'warm_mentor', gender: 'female' },
      'sofia-vega': { archetype: 'warm_mentor', gender: 'female' },
      'the-elephant': { archetype: 'ancient_scholar', gender: 'male' },
      'sleepless-historian': { archetype: 'ancient_scholar', gender: 'male' },
      'mechanic-tony': { archetype: 'warm_mentor', gender: 'male' },
      'dr-elena-vasquez': { archetype: 'analytical_observer', gender: 'female' },
      'chef-antonio-rossi': { archetype: 'warm_mentor', gender: 'male' },
      'theo-nguyen': { archetype: 'curious_explorer', gender: 'male' },
      'victor-hale': { archetype: 'cold_authority', gender: 'male' },
      'penny-clarke': { archetype: 'energetic_motivator', gender: 'female' },
      'valentina-russo': { archetype: 'cold_authority', gender: 'female' },
      'cole-briggs': { archetype: 'stoic_guardian', gender: 'male' },          // Sergeant
      'jasper-bloom': { archetype: 'ancient_scholar', gender: 'male' },
      'nora-feld': { archetype: 'corporate_strategist', gender: 'female' },
      'samir-haddad': { archetype: 'warm_mentor', gender: 'male' },
      'oliver-finch': { archetype: 'gentle_companion', gender: 'male' },
      'elena-morales': { archetype: 'gentle_companion', gender: 'female' },
      'eloise-durand': { archetype: 'cold_authority', gender: 'female' },
      'rhea-stone': { archetype: 'stoic_guardian', gender: 'female' },
      'harold-whitcombe': { archetype: 'ancient_scholar', gender: 'male' },
      'mina-kwon-innovator': { archetype: 'visionary_futurist', gender: 'female' },
      'rowan-pike': { archetype: 'ancient_scholar', gender: 'male' },
      'maya_chen': { archetype: 'warm_mentor', gender: 'female' },
      'eleanor_ashworth': { archetype: 'cold_authority', gender: 'female' },

      // === RECOMMEND CATEGORY ===
      'camille-beaumont': { archetype: 'gentle_companion', gender: 'female' },
      'marcus_blaze': { archetype: 'energetic_motivator', gender: 'male' },
      'energetic-male': { archetype: 'energetic_motivator', gender: 'male' },
      'fuka-shimizu': { archetype: 'gentle_companion', gender: 'female' },

      // === FICTION & MEDIA ===
      'jack_sterling': { archetype: 'noble_diplomat', gender: 'male' },
      'detective-jun': { archetype: 'analytical_observer', gender: 'male' },
      'taesung-lee': { archetype: 'playful_trickster', gender: 'male' },
      'bernard-quinn': { archetype: 'ancient_scholar', gender: 'male' },

      // === ADVENTURE ===
      'fighter-champion': { archetype: 'stoic_guardian', gender: 'female' },
      'forest-guardian': { archetype: 'stoic_guardian', gender: 'male' },
      'detective-noir': { archetype: 'cynical_realist', gender: 'male' },
      'indigenous-shaman': { archetype: 'ancient_scholar', gender: 'male' },
      'nordic-seafarer': { archetype: 'stoic_guardian', gender: 'male' },
      'war-commander': { archetype: 'ruthless_operator', gender: 'male' },
      'wise-mentor': { archetype: 'ancient_scholar', gender: 'male' },
      'space-explorer': { archetype: 'curious_explorer', gender: 'female' },
      'samurai-warrior': { archetype: 'stoic_guardian', gender: 'male' },
      'gentle-giant': { archetype: 'gentle_companion', gender: 'male' },

      // === FANTASY ===
      'vampire-noble': { archetype: 'dark_manipulator', gender: 'female' },
      'paladin-knight': { archetype: 'stoic_guardian', gender: 'female' },
      'elven-archer': { archetype: 'gentle_companion', gender: 'male' },
      'ancient-dragon-sage': { archetype: 'ancient_scholar', gender: 'male' },
      'demon-lord': { archetype: 'dark_manipulator', gender: 'male' },
      'dark-mage': { archetype: 'dark_manipulator', gender: 'male' },
      'waifu-swordsman': { archetype: 'energetic_motivator', gender: 'female' },

      // === FICTION ===
      'wizard-sage': { archetype: 'ancient_scholar', gender: 'male' },
      'elf-archer': { archetype: 'gentle_companion', gender: 'female' },
      'dragon-rider': { archetype: 'curious_explorer', gender: 'male' },
      'mysterious-stranger': { archetype: 'dark_manipulator', gender: 'female' },
      'sorcerer-wild': { archetype: 'chaotic_genius', gender: 'male' },
      'barbarian-warrior': { archetype: 'ruthless_operator', gender: 'male' },
      'blood-hunter': { archetype: 'ruthless_operator', gender: 'male' },

      // === HORROR ===
      'horror-shadow': { archetype: 'dark_manipulator', gender: 'male' },
      'artificer-inventor': { archetype: 'chaotic_genius', gender: 'female' },
      'cleric-healer': { archetype: 'gentle_companion', gender: 'female' },
      'confident-leader': { archetype: 'cold_authority', gender: 'male' },
      'tsundere-anime-girl': { archetype: 'playful_trickster', gender: 'female' },
      'paladin-holy': { archetype: 'stoic_guardian', gender: 'male' },
      'robot-companion': { archetype: 'synthetic_intelligence', gender: 'male' },
      'yandere-obsessive': { archetype: 'fanatical_believer', gender: 'female' },

      // === ROMANCE ===
      'jinwoo-park': { archetype: 'reluctant_hero', gender: 'male' },
      'rogue-thief': { archetype: 'playful_trickster', gender: 'female' },
      'necromancer-dark': { archetype: 'dark_manipulator', gender: 'male' },
      'shy-introvert': { archetype: 'gentle_companion', gender: 'female' },
      'romantic-partner': { archetype: 'gentle_companion', gender: 'male' },
      'therapy-bot': { archetype: 'gentle_companion', gender: 'male' },

      // === COMEDY ===
      'shaman-spirit': { archetype: 'ancient_scholar', gender: 'female' },
      'medieval-knight': { archetype: 'noble_diplomat', gender: 'female' },
      'feisty-senior-citizen': { archetype: 'cynical_realist', gender: 'female' },
      'angry-karen': { archetype: 'fanatical_believer', gender: 'female' },
      'california-surfer': { archetype: 'playful_trickster', gender: 'female' },
      'nosy-neighbor': { archetype: 'curious_explorer', gender: 'female' },
      'ranger-woods': { archetype: 'stoic_guardian', gender: 'male' },
      'mad-scientist': { archetype: 'chaotic_genius', gender: 'male' },
      'grumpy-old-man': { archetype: 'cynical_realist', gender: 'male' },
      'sassy-best-friend': { archetype: 'playful_trickster', gender: 'female' },
      'druid-nature': { archetype: 'ancient_scholar', gender: 'male' },
      'cyberpunk-hacker': { archetype: 'chaotic_genius', gender: 'male' },
      'grumpy-retired-veteran': { archetype: 'cynical_realist', gender: 'male' },
      'villain-antagonist': { archetype: 'ruthless_operator', gender: 'female' },

      // === EDUCATIONAL ===
      'edmund-blackwell': { archetype: 'ancient_scholar', gender: 'male' },
      'engineer-priya-patel': { archetype: 'analytical_observer', gender: 'female' },
      'ninja-assassin': { archetype: 'ruthless_operator', gender: 'male' },
      'ranger-beast': { archetype: 'stoic_guardian', gender: 'male' },
      'comedic-relief': { archetype: 'playful_trickster', gender: 'female' },
      'ai-tutor': { archetype: 'synthetic_intelligence', gender: 'female' },
      'chef-gordon': { archetype: 'cold_authority', gender: 'male' },
      'pilot-captain-rachel-thompson': { archetype: 'cold_authority', gender: 'female' },
      'scientist-dr-kevin-nguyen': { archetype: 'analytical_observer', gender: 'male' },
      'wise-elder-teacher': { archetype: 'ancient_scholar', gender: 'male' },
      'journalist-alex-kim': { archetype: 'curious_explorer', gender: 'female' },
      'architect-david-martinez': { archetype: 'visionary_futurist', gender: 'female' },
      'bard-storyteller': { archetype: 'playful_trickster', gender: 'male' },
      'monk-spiritual': { archetype: 'ancient_scholar', gender: 'male' },

      // === SUPPORT ===
      'financial-advisor-lisa-wang': { archetype: 'corporate_strategist', gender: 'female' },
      'dere-dere-sweet': { archetype: 'gentle_companion', gender: 'female' },
      'therapist-dr-michael-brooks': { archetype: 'warm_mentor', gender: 'male' },
      'attorney-james-chen': { archetype: 'cold_authority', gender: 'male' },
      'dr-sarah-mitchell': { archetype: 'warm_mentor', gender: 'female' },
      'alchemist-potion': { archetype: 'ancient_scholar', gender: 'male' },
      'warlock-pact': { archetype: 'dark_manipulator', gender: 'male' },
      'military-commander-wendy': { archetype: 'ruthless_operator', gender: 'female' },
      'latinx-community-leader': { archetype: 'warm_mentor', gender: 'female' },

      // === HELPFUL (Anime/Game characters) ===
      'aaliyah': { archetype: 'energetic_motivator', gender: 'female' },
      'asha': { archetype: 'stoic_guardian', gender: 'female' },
      'dex': { archetype: 'cold_authority', gender: 'male' },
      'tomasz': { archetype: 'energetic_motivator', gender: 'male' },
      'rajiv': { archetype: 'warm_mentor', gender: 'male' },
      'eamon': { archetype: 'playful_trickster', gender: 'male' },
      'hinata-moonlight': { archetype: 'gentle_companion', gender: 'female' },
      'levi-steel-wind': { archetype: 'cold_authority', gender: 'male' },
      'erza-titania': { archetype: 'stoic_guardian', gender: 'female' },
      'mikasa-storm': { archetype: 'stoic_guardian', gender: 'female' },
      'ryuk-the-deceiver': { archetype: 'dark_manipulator', gender: 'male' },
      'marjorie': { archetype: 'cynical_realist', gender: 'female' },
      'viktor': { archetype: 'cold_authority', gender: 'male' },

      // === ORIGINAL ===
      'alle-influencer': { archetype: 'energetic_motivator', gender: 'female' },

      // === MISC HELPERS ===
      'academic-speaker-dr-chen': { archetype: 'ancient_scholar', gender: 'male' },
      'adelie-moreau': { archetype: 'gentle_companion', gender: 'female' },
      'alex-hype': { archetype: 'energetic_motivator', gender: 'male' },
      'comfort-teddy-bear': { archetype: 'gentle_companion', gender: 'male' },
      'daily-art-snack': { archetype: 'playful_trickster', gender: 'female' },
      'fitness-coach-marcus': { archetype: 'energetic_motivator', gender: 'male' },
      'homework-helper-emma': { archetype: 'warm_mentor', gender: 'female' },
      'isabella-reyes': { archetype: 'warm_mentor', gender: 'female' },
      'liam-ashford': { archetype: 'warm_mentor', gender: 'male' },
      'mana-hayashi': { archetype: 'gentle_companion', gender: 'female' },
      'marcus-chen': { archetype: 'warm_mentor', gender: 'male' },
      'maya-patel': { archetype: 'warm_mentor', gender: 'female' },
      'plato-philosopher': { archetype: 'ancient_scholar', gender: 'male' },
      'legal-advisor-priya': { archetype: 'corporate_strategist', gender: 'female' },
      'language-learning-sophia': { archetype: 'warm_mentor', gender: 'female' },
      'real-life-sim': { archetype: 'warm_mentor', gender: 'male' },

      // Fallback for any unmapped characters
      'default': { archetype: 'warm_mentor', gender: 'female' }
    };

    // Get the character's archetype config
    const eliteConfig = CHARACTER_ARCHETYPE_MAP[characterId] || CHARACTER_ARCHETYPE_MAP['default'];
    console.log(`[TTS] Using archetype=${eliteConfig.archetype} for ${characterId}`);

    // =============================================
    // PRIORITY 1: Try RunPod Serverless Chatterbox
    // =============================================
    if (runpodChatterboxClient.isConfigured()) {

      // Get audio profile for this archetype (or use defaults)
      const audioProfile = ARCHETYPE_AUDIO_PROFILES[eliteConfig.archetype] || {
        pitch: 0.0, speed: 1.0, exaggeration: 0.5,
        pause_density: 0.5, intonation_variance: 0.5, emphasis_strength: 0.5
      };

      console.log(`[TTS] Using RunPod for ${characterId}: archetype=${eliteConfig.archetype}, gender=${eliteConfig.gender}`);
      console.log(`[TTS]   Audio: pitch=${audioProfile.pitch}, speed=${audioProfile.speed}, exaggeration=${audioProfile.exaggeration}`);

      // Get character-specific accent settings (Legacy fallback)
      const charConfig = CHARACTER_ACCENT_MAP[characterId] || {
        language: 'en',
        accentHint: 'neutral American English'
      };

      const result = await runpodChatterboxClient.synthesize(cleanedText, {
        language: charConfig.language,
        accentHint: charConfig.accentHint,
        archetype: eliteConfig.archetype,  // Direct archetype name (20 canonical)
        gender: eliteConfig.gender,
        exaggeration: audioProfile.exaggeration,
        temperature: 0.8,
        // Audio profile parameters
        pitch: audioProfile.pitch,
        speed: audioProfile.speed,
        pause_density: audioProfile.pause_density,
        intonation_variance: audioProfile.intonation_variance,
        emphasis_strength: audioProfile.emphasis_strength
      });

      if (result) {
        const audioBase64 = result.audio.toString('base64');
        console.log(`[TTS] ✅ RunPod generated ${result.audio.length} bytes`);

        return NextResponse.json({
          audio: audioBase64,
          format: 'wav',
          contentType: result.contentType,
          sampleRate: 24000,
          voiceName: `runpod-chatterbox`,
          engine: 'runpod-serverless',
          archetype: 'chatterbox',
          usingDefaultVoice: false,
        });
      }

      console.warn(`[TTS] RunPod failed, trying fallback...`);
    }

    // =============================================
    // PRIORITY 2: Try Self-Hosted Chatterbox (FREE)
    // =============================================
    const chatterboxAvailable = await chatterboxArchetypeClient.isConfigured();

    if (chatterboxAvailable) {
      console.log(`[TTS] Using Chatterbox (self-hosted) for ${characterId}`);

      const result = await chatterboxArchetypeClient.synthesize(
        cleanedText,
        characterId,
        characterProfile
      );

      if (result) {
        const audioBase64 = Buffer.from(result.audio).toString('base64');
        console.log(`[TTS] ✅ Chatterbox (self-hosted) generated ${result.audio.byteLength} bytes`);

        return NextResponse.json({
          audio: audioBase64,
          format: 'wav',
          contentType: result.contentType,
          sampleRate: 24000,
          voiceName: `chatterbox-${result.archetype}`,
          engine: 'chatterbox-selfhosted',
          archetype: result.archetype,
          usingDefaultVoice: result.archetype === 'default',
        });
      }

      console.warn(`[TTS] Self-hosted Chatterbox failed, trying HuggingFace fallback`);
    }

    // =============================================
    // FALLBACK: HuggingFace Chatterbox Gradio (FREE, rate-limited)
    // =============================================
    console.log(`[TTS] Using Chatterbox (HuggingFace Gradio) for ${characterId}`);

    // Check if we have an accent config for this character
    const hasAccentConfig = CHARACTER_ACCENT_MAP[characterId];

    if (hasAccentConfig) {
      const audioBuffer = await generateWithChatterbox(cleanedText, characterId);

      if (audioBuffer) {
        const audioBase64 = audioBuffer.toString('base64');
        console.log(`[TTS] ✅ Chatterbox (HuggingFace) generated ${audioBuffer.length} bytes`);

        return NextResponse.json({
          audio: audioBase64,
          format: 'wav',
          contentType: 'audio/wav',
          sampleRate: 24000,
          voiceName: `chatterbox-hf-${characterId}`,
          engine: 'chatterbox-huggingface',
          archetype: 'huggingface',
          usingDefaultVoice: false,
        });
      }
    }

    // Try with a default English voice if no specific config
    const defaultConfig = {
      language: 'en',
      accentHint: 'neutral American English'
    };

    // Add temporary mapping for this character
    const tempAccentMap = { ...CHARACTER_ACCENT_MAP, [characterId]: defaultConfig };

    // Create simple HuggingFace request
    try {
      const CHATTERBOX_GRADIO = 'https://resemble-ai-chatterbox.hf.space/call/generate';

      const response = await fetch(CHATTERBOX_GRADIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            cleanedText,
            'en',
            0.5,
            0.3,
            null,
          ]
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const result = await response.json() as any;

        if (result.event_id) {
          const pollUrl = `https://resemble-ai-chatterbox.hf.space/call/generate/${result.event_id}`;
          const pollResponse = await fetch(pollUrl);

          if (pollResponse.ok) {
            const pollResult = await pollResponse.text();
            const lines = pollResult.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                if (data[0]?.url) {
                  const audioResponse = await fetch(data[0].url);
                  if (audioResponse.ok) {
                    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
                    const audioBase64 = audioBuffer.toString('base64');

                    console.log(`[TTS] ✅ Chatterbox (HuggingFace default) generated ${audioBuffer.length} bytes`);

                    return NextResponse.json({
                      audio: audioBase64,
                      format: 'wav',
                      contentType: 'audio/wav',
                      sampleRate: 24000,
                      voiceName: `chatterbox-hf-default`,
                      engine: 'chatterbox-huggingface',
                      archetype: 'default',
                      usingDefaultVoice: true,
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (hfError) {
      console.error('[TTS] HuggingFace Chatterbox failed:', hfError);
    }

    // =============================================
    // ALL FREE OPTIONS FAILED - Try ElevenLabs (paid fallback)
    // =============================================
    console.log(`[TTS] Free options failed, trying ElevenLabs fallback...`);

    try {
      const { elevenLabsArchetypeClient } = await import('@/lib/audio/elevenLabsArchetypeClient');

      if (elevenLabsArchetypeClient.isConfigured()) {
        console.log(`[TTS] Using ElevenLabs (paid fallback) for ${characterId}`);

        const result = await elevenLabsArchetypeClient.synthesize(
          cleanedText,
          characterId,
          characterProfile
        );

        if (result) {
          const audioBase64 = Buffer.from(result.audio).toString('base64');
          console.log(`[TTS] ✅ ElevenLabs generated ${result.audio.byteLength} bytes`);

          return NextResponse.json({
            audio: audioBase64,
            format: 'mp3',
            contentType: result.contentType,
            sampleRate: 44100,
            voiceName: `elevenlabs-${result.archetype}`,
            engine: 'elevenlabs-fallback',
            archetype: result.archetype,
            usingDefaultVoice: result.archetype === 'default',
          });
        }
      }
    } catch (elevenLabsError) {
      console.error('[TTS] ElevenLabs fallback also failed:', elevenLabsError);
    }

    return NextResponse.json(
      {
        error: 'TTS unavailable',
        reason: 'All TTS options failed: Self-hosted Chatterbox not running, HuggingFace rate-limited, ElevenLabs not configured.',
        suggestion: 'Add ELEVENLABS_API_KEY to .env.local or set up self-hosted Chatterbox.'
      },
      { status: 503 }
    );

  } catch (error: any) {
    console.error('[TTS] Error:', error);

    let errorMessage = 'Failed to generate TTS';
    let statusCode = 500;

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      statusCode = 429;
      errorMessage = 'TTS quota exceeded. Please try again later.';

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const quota = userId ? await db.userQuota.findFirst({
        where: {
          userId: userId,
          lastResetDate: { gte: today },
        },
      }) : null;

      const subStatus = await getSubscriptionStatus(userId);
      const limits = getPlanLimits(subStatus.planId);

      return NextResponse.json(
        {
          error: 'TTS quota exceeded',
          quotaExceeded: true,
          reason: errorMessage,
          upgradeUrl: '/pricing',
          currentUsage: quota?.ttsSecondsToday || 0,
          limit: limits.ttsSecondsPerDay || 0,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate TTS',
        details: error.message || errorMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
