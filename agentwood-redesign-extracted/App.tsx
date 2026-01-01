import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { CharacterCard } from './components/CharacterCard';
import { ChatInterface } from './components/ChatInterface';
import { CreateWizard } from './components/CreateWizard';
import { SettingsInterface } from './components/SettingsInterface';
import { PageView, SettingsTab, Character } from './types';
import { Search, Bell, Menu, Zap, MessageCircle, Star, CheckCircle2, ArrowRight, Settings, CreditCard, DollarSign, X, Send, Sparkles, BookOpen, Music, Coffee, Briefcase, Heart, Globe, Mic2, BrainCircuit } from 'lucide-react';

// Enhanced Mock Data matching the specific requirements
const allCharacters: Character[] = [
  // ✅ Recommend
  { 
    id: 'r1', name: 'Marge "HOA Hawk" Halloway', handle: '@marge_watch', 
    description: 'Neighborhood enforcer with a heart of gold (deep down).', 
    avatarUrl: 'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?q=80&w=1000&auto=format&fit=crop', // Older woman, sharp
    category: 'Recommend', totalChats: '450k', tags: ['hoa', 'suburbs', 'funny'],
    prompts: [
      "I measured your grass. It's 2.6 inches. The limit is 2.5.",
      "I made too much lasagna. Take some, before I write you up for looking too thin.",
      "Did you see that van parked at the Johnson's? I'm drafting a letter.",
      "The community garden needs weeding. I suppose I could use a 'capable' assistant."
    ]
  },
  { 
    id: 'r2', name: 'Raj', handle: '@corner_store_raj', 
    description: 'Convenience store legend who knows everyone\'s business.', 
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1000&auto=format&fit=crop', // Friendly man
    category: 'Recommend', totalChats: '320k', tags: ['friendly', 'community'] 
  },
  { 
    id: 'r3', name: 'Camille Laurent', handle: '@perfume_notes', 
    description: 'Sensory storyteller turning feelings into fragrance notes.', 
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000&auto=format&fit=crop', // French bob, chic
    category: 'Recommend', totalChats: '120k', tags: ['french', 'sensory', 'calm'] 
  },
  { 
    id: 'r4', name: 'Coach Boone', handle: '@pt_boone', 
    description: 'Ex-Marine PT. Strict trainer, tough love, protective mentor.', 
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop', // Stern fit man
    category: 'Recommend', totalChats: '890k', tags: ['fitness', 'motivation', 'tough'] 
  },
  { 
    id: 'r5', name: 'Yuki Tanaka', handle: '@sugar_boss_osaka', 
    description: 'Elite pastry chef. Playful teasing meets exacting standards.', 
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop', // Chef vibe
    category: 'Recommend', totalChats: '560k', tags: ['chef', 'teasing', 'upbeat'] 
  },

  // 🎲 Play & Fun
  { 
    id: 'p1', name: 'Doodle Dave', handle: '@doodle_dave', 
    description: 'Turns anything into a mini-game, dares, or drawing prompts.', 
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1000&auto=format&fit=crop', // Messy hair, hoodie
    category: 'Play & Fun', totalChats: '200k', tags: ['games', 'silly', 'creative'] 
  },
  { 
    id: 'p2', name: 'Sunny "Spin-The-Wheel" Sato', handle: '@sunny_random', 
    description: 'I’ll pick your next move, outfit, or plot twist.', 
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop', // Bright, colorful
    category: 'Play & Fun', totalChats: '150k', tags: ['random', 'energetic', 'host'] 
  },
  { 
    id: 'p3', name: 'Nico', handle: '@awkward_hero', 
    description: 'Tries to be cool, fails charmingly. Perfect for comedy.', 
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=1000&auto=format&fit=crop', // Soft curls, shy smile
    category: 'Play & Fun', totalChats: '300k', tags: ['awkward', 'cute', 'comedy'] 
  },
  { 
    id: 'p4', name: 'Mina "Plot Twist" Kwon', handle: '@drama_mina', 
    description: 'Improvises soap-opera twists and cliffhangers on demand.', 
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', // Dramatic look
    category: 'Play & Fun', totalChats: '410k', tags: ['drama', 'korean', 'twists'] 
  },
  { 
    id: 'p5', name: 'Big Tom', handle: '@trivia_bouncer', 
    description: 'Friendly pub quiz gatekeeper. Roasts answers, keeps score.', 
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop', // Broad, beard
    category: 'Play & Fun', totalChats: '220k', tags: ['trivia', 'british', 'funny'] 
  },

  // 🧰 Helper (Real Professionals)
  { 
    id: 'h1', name: 'Dr. Nadia El-Kouri', handle: '@family_doc_nadia', 
    description: 'Family physician. Warm authority and calm explanations.', 
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop', // Female Doctor
    category: 'Helper', totalChats: '95k', tags: ['medical', 'advice', 'calm'] 
  },
  { 
    id: 'h2', name: 'Miles "Fix-It" Granger', handle: '@mechanic_miles', 
    description: 'Mechanic who explains like a human. No fluff.', 
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop', // Mechanic
    category: 'Helper', totalChats: '88k', tags: ['cars', 'repair', 'practical'] 
  },
  { 
    id: 'h3', name: 'Priya Nair', handle: '@sleep_coach_priya', 
    description: 'Sleep coach helping you build behavioral routines.', 
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop', // Gentle professional
    category: 'Helper', totalChats: '110k', tags: ['health', 'sleep', 'soothing'] 
  },
  { 
    id: 'h4', name: 'Kenji "Meal Prep" Tanaka', handle: '@nutrition_kenji', 
    description: 'Nutritionist. Clear lists, upbeat encouragement, no guilt.', 
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop', // Male energetic
    category: 'Helper', totalChats: '130k', tags: ['food', 'health', 'energy'] 
  },
  { 
    id: 'h5', name: 'Asha Mbeki', handle: '@career_asha', 
    description: 'Career coach. Crisp mock interviews and energetic support.', 
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop', // Professional blazer
    category: 'Helper', totalChats: '75k', tags: ['career', 'interview', 'mentor'] 
  },
  { 
    id: 'h6', name: 'Soren Nielsen', handle: '@productivity_soren', 
    description: 'Productivity architect. Structured steps and calm silence.', 
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop', // Glasses, minimalist
    category: 'Helper', totalChats: '92k', tags: ['productivity', 'systems', 'focus'] 
  },
  { 
    id: 'h7', name: 'Imani Shah', handle: '@comm_coach_imani', 
    description: 'Relationship communication coach. Gentle phrasing.', 
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop', // Professional calm
    category: 'Helper', totalChats: '140k', tags: ['relationships', 'talk', 'advice'] 
  },
  { 
    id: 'h8', name: 'Hector "Money Map" Alvarez', handle: '@budget_hector', 
    description: 'Personal finance educator. Friendly analogies, no judgment.', 
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop', // Older friendly man
    category: 'Helper', totalChats: '105k', tags: ['money', 'finance', 'friendly'] 
  },
  { 
    id: 'h9', name: 'Dr. Elena Petrov', handle: '@rehab_elena', 
    description: 'Physical rehab guide. Precise instructions and safety.', 
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1000&auto=format&fit=crop', // Athletic doctor
    category: 'Helper', totalChats: '60k', tags: ['health', 'physical', 'firm'] 
  },
  { 
    id: 'h10', name: 'Owen McKenna', handle: '@grounding_owen', 
    description: 'Anxiety grounding buddy. Steady breathing, soothing tone.', 
    avatarUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1000&auto=format&fit=crop', // Hoodie, calm
    category: 'Helper', totalChats: '210k', tags: ['mental health', 'calm', 'kind'] 
  },

  // 🧪 Original
  { 
    id: 'o1', name: 'Council Estate', handle: '@the_block', 
    description: 'The building itself. Knows every secret, complains gently.', 
    avatarUrl: 'https://images.unsplash.com/photo-1486744360500-7996dc412722?q=80&w=1000&auto=format&fit=crop', // Abstract building/texture
    category: 'Original', totalChats: '45k', tags: ['concept', 'urban', 'story'] 
  },
  { 
    id: 'o2', name: 'The Queue Manager', handle: '@priority_q', 
    description: 'Turns your life into a priority queue. Ruthless kindness.', 
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop', // Clean cut, business
    category: 'Original', totalChats: '30k', tags: ['productivity', 'concept', 'funny'] 
  },
  { 
    id: 'o3', name: 'Auntie Saffy', handle: '@feed_and_fix', 
    description: 'Motherly advice + gentle scolding + comfort recipes.', 
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=1000&auto=format&fit=crop', // Older warm woman
    category: 'Original', totalChats: '300k', tags: ['comfort', 'motherly', 'food'] 
  },
  { 
    id: 'o4', name: 'Mr. Receipt', handle: '@human_ledger', 
    description: 'Remembers every detail. Reconstructs your day like a receipt.', 
    avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1000&auto=format&fit=crop', // Suit, glasses
    category: 'Original', totalChats: '25k', tags: ['memory', 'detail', 'concept'] 
  },
  { 
    id: 'o5', name: 'Hush', handle: '@quiet_roommate', 
    description: 'Speaks softly, says few words, but always the right ones.', 
    avatarUrl: 'https://images.unsplash.com/photo-1515023115689-589c33041697?q=80&w=1000&auto=format&fit=crop', // Pale, quiet vibe
    category: 'Original', totalChats: '80k', tags: ['calm', 'silent', 'comfort'] 
  },

  // 🎮 Anime & Game (Stylized/Artistic)
  { 
    id: 'a1', name: 'Kira Neonfox', handle: '@holo_idol_kira', 
    description: 'Holo-idol + gamer teammate. Bouncy and encouraging.', 
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop', // Cyberpunk/Anime style
    category: 'Anime & Game', totalChats: '1.2m', tags: ['anime', 'idol', 'gamer'] 
  },
  { 
    id: 'a2', name: 'Kael Drakesunder', handle: '@dragon_knight', 
    description: 'Dragon-slayer. Stoic protector with gentle mentor energy.', 
    avatarUrl: 'https://images.unsplash.com/photo-1535970793482-07de93762dc4?q=80&w=1000&auto=format&fit=crop', // Fantasy armor/moody
    category: 'Anime & Game', totalChats: '800k', tags: ['fantasy', 'knight', 'stoic'] 
  },
  { 
    id: 'a3', name: 'Juno Gearwhistle', handle: '@steampunk_juno', 
    description: 'Tinker genius. Builds cute clockwork pets. Idea machine.', 
    avatarUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1000&auto=format&fit=crop', // Steampunk vibes
    category: 'Anime & Game', totalChats: '650k', tags: ['steampunk', 'inventor', 'energetic'] 
  },
  { 
    id: 'a4', name: 'Lady Seraphina Vale', handle: '@celestial_duelist', 
    description: 'Elegant rival. Witty, competitive, honorable.', 
    avatarUrl: 'https://images.unsplash.com/photo-1515536765-9b2a740fa475?q=80&w=1000&auto=format&fit=crop', // White hair/Ethereal
    category: 'Anime & Game', totalChats: '720k', tags: ['noble', 'rival', 'elegant'] 
  },
  { 
    id: 'a5', name: 'Orion Riftwalker', handle: '@portal_runner', 
    description: 'Dimension courier. Goofy confidence and loyal friend.', 
    avatarUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop', // Neon/Magic effects
    category: 'Anime & Game', totalChats: '500k', tags: ['adventure', 'magic', 'friendly'] 
  },

  // 🎬 Fiction & Media
  { 
    id: 'f1', name: 'Wendy Hughes', handle: '@therapy_commander', 
    description: 'Department commander who runs wellbeing like an operation.', 
    avatarUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=1000&auto=format&fit=crop', // Professional authority
    category: 'Fiction & Media', totalChats: '180k', tags: ['boss', 'therapy', 'show'] 
  },
  { 
    id: 'f2', name: 'Detective Jun Park', handle: '@cold_case_jun', 
    description: 'Noir detective. Patient, observant, quietly witty.', 
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1000&auto=format&fit=crop', // Detective vibe
    category: 'Fiction & Media', totalChats: '290k', tags: ['detective', 'mystery', 'noir'] 
  },
  { 
    id: 'f3', name: 'Captain Mireya Sol', handle: '@deep_space_comms', 
    description: 'Space captain talking you through missions like a radio drama.', 
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', // Uniform/Tough
    category: 'Fiction & Media', totalChats: '340k', tags: ['scifi', 'space', 'captain'] 
  },
  { 
    id: 'f4', name: 'Professor Basil Wyrmwhistle', handle: '@lore_prof', 
    description: 'Eccentric lore professor. Turns anything into a story lesson.', 
    avatarUrl: 'https://images.unsplash.com/photo-1550927407-50e1ebd24528?q=80&w=1000&auto=format&fit=crop', // Eccentric professor
    category: 'Fiction & Media', totalChats: '210k', tags: ['academic', 'fantasy', 'teacher'] 
  },
  { 
    id: 'f5', name: 'The Convenience Store', handle: '@store_persona', 
    description: 'A store persona that helps you find anything. Cozy tone.', 
    avatarUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop', // Store interior/person
    category: 'Fiction & Media', totalChats: '90k', tags: ['cozy', 'slice of life', 'media'] 
  },

  // 🧿 Icon (Archetypes)
  { 
    id: 'i1', name: 'Angry Karen', handle: '@actually_karen', 
    description: 'Technically annoying nitpicker. "Actually..."', 
    avatarUrl: 'https://images.unsplash.com/photo-1563233269-699a2e1d6744?q=80&w=1000&auto=format&fit=crop', // Intense woman
    category: 'Icon', totalChats: '2.5m', tags: ['meme', 'angry', 'funny'] 
  },
  { 
    id: 'i2', name: 'Jon "World\'s Best Debater"', handle: '@debate_king', 
    description: 'Argues any side. Beats you politely. Teaches debate tricks.', 
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop', // Suit, smug
    category: 'Icon', totalChats: '800k', tags: ['debate', 'smart', 'challenge'] 
  },
  { 
    id: 'i3', name: 'The Sweet CS Rep', handle: '@support_angel', 
    description: 'Endlessly polite helper who de-escalates anything.', 
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=1000&auto=format&fit=crop', // Headset, smile
    category: 'Icon', totalChats: '400k', tags: ['service', 'nice', 'calm'] 
  },
  { 
    id: 'i4', name: 'Mr. Passive-Aggressive', handle: '@neighbor_jim', 
    description: 'Compliments that feel like critiques. "Pleasant menace."', 
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=1000&auto=format&fit=crop', // Fake smile
    category: 'Icon', totalChats: '350k', tags: ['neighbor', 'funny', 'annoying'] 
  },
  { 
    id: 'i5', name: 'The Unshakeable Optimist', handle: '@rio_sunshine', 
    description: 'Turns every problem into a "we\'ve got this" moment.', 
    avatarUrl: 'https://images.unsplash.com/photo-1515202913167-d95395548321?q=80&w=1000&auto=format&fit=crop', // Very happy
    category: 'Icon', totalChats: '600k', tags: ['happy', 'optimist', 'cheer'] 
  },
];

const conversationStarters = [
  {
    id: 'cs1',
    name: 'Santa',
    avatar: 'https://images.unsplash.com/photo-1543589923-7fb4a3809096?q=80&w=200&auto=format&fit=crop', // Santa ish
    count: '86.7K',
    prompts: [
      "Merry Christmas!",
      "Am I on the Nice List or the Naughty List?",
      "Do you live in the North Pole, Santa?"
    ]
  },
  {
    id: 'cs2',
    name: 'North Pole',
    avatar: 'https://images.unsplash.com/photo-1518182170546-0766ba6f6a56?q=80&w=200&auto=format&fit=crop', // Snow
    count: '2.4K',
    prompts: [
      "A. Go to the famous Santa's Village.",
      "B. Visit the busy Elf Toy Factory.",
      "C. Find the cozy home of the Polar Bears."
    ]
  },
  {
    id: 'cs3',
    name: 'Donald Trump',
    avatar: 'https://images.unsplash.com/photo-1585672205001-f15569426d83?q=80&w=200&auto=format&fit=crop', // Generic suited man/wig (Trump placeholder)
    count: '54.9K',
    prompts: [
      "Can you say MAGA for me?",
      "What policies will you issue since now you've won the election?",
      "Why did you ask for shoes after shooting?"
    ]
  },
  {
    id: 'cs4',
    name: 'Elon Musk',
    avatar: 'https://images.unsplash.com/photo-1624536735166-574676672da5?q=80&w=200&auto=format&fit=crop', // Generic rich guy/Musk ish
    count: '47.2K',
    prompts: [
      "Can you gift me a Tesla?",
      "How much did you spend on buying Twitter?",
      "Who's better, Kanye or Trump?"
    ]
  }
];

const taskAssistants = [
    { id: 't1', name: 'Learn French', desc: 'with your ai French teacher!', icon: BookOpen, color: 'bg-orange-100 text-orange-600', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=100&q=80' },
    { id: 't2', name: 'Pick the perfect song', desc: 'with Music Recommendation!', icon: Music, color: 'bg-green-100 text-green-600', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80' },
    { id: 't3', name: 'Create your own meal plan', desc: 'with Personal Nutritionist!', icon: Coffee, color: 'bg-yellow-100 text-yellow-600', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=100&q=80' },
    { id: 't4', name: 'Boost the popularity', desc: 'with Trend Master!', icon: Sparkles, color: 'bg-purple-100 text-purple-600', img: 'https://images.unsplash.com/photo-1516575334481-f85287c2c81d?auto=format&fit=crop&w=100&q=80' },
    { id: 't5', name: 'Choose your career', desc: 'with Industry Insider!', icon: Briefcase, color: 'bg-blue-100 text-blue-600', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&q=80' },
    { id: 't6', name: 'Explore the potential', desc: 'with Crush Compatibility Quiz!', icon: Heart, color: 'bg-red-100 text-red-600', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=100&q=80' },
    { id: 't7', name: 'Discover your ascendant', desc: 'with Ascendant Test!', icon: Globe, color: 'bg-indigo-100 text-indigo-600', img: 'https://images.unsplash.com/photo-1532054248181-61b6747cb9c8?auto=format&fit=crop&w=100&q=80' },
    { id: 't8', name: 'Improve interview skills', desc: 'with Mock Interviewer!', icon: Mic2, color: 'bg-teal-100 text-teal-600', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=100&q=80' },
    { id: 't9', name: 'Learn to stay motivated', desc: 'with your ADHD personal helper!', icon: BrainCircuit, color: 'bg-pink-100 text-pink-600', img: 'https://images.unsplash.com/photo-1555449372-8854092403dc?auto=format&fit=crop&w=100&q=80' },
];

const ConversationCard: React.FC<{ character: Character, onClick: () => void }> = ({ character, onClick }) => (
    <div onClick={onClick} className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <div className="flex items-center gap-4 mb-6">
            <div className="relative">
                <img src={character.avatarUrl} alt={character.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="absolute bottom-0 right-0 bg-indigo-500 p-1 rounded-full border-2 border-white">
                    <Zap size={10} className="text-white fill-current" />
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{character.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MessageCircle size={12} /> {character.totalChats}
                </div>
            </div>
        </div>
        <div className="space-y-2">
            {character.prompts?.map((prompt, i) => (
                <button key={i} className="w-full text-left text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-indigo-600 px-4 py-3 rounded-xl transition-colors flex items-center justify-between group-btn">
                    <span className="truncate">{prompt}</span>
                    <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
        </div>
    </div>
);

const TaskCard: React.FC<{ character: Character, onClick: () => void }> = ({ character, onClick }) => (
    <div onClick={onClick} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
        <img src={character.avatarUrl} alt={character.name} className="w-14 h-14 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{character.name}</h4>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{character.description}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <ArrowRight size={16} />
        </div>
    </div>
);

const heroStates = [
    { 
        title: "Looking for", 
        highlight: "connections?", 
        subtitle: "Discover millions of characters and stories created by a community of passionate writers.",
        gradient: "from-blue-600 to-indigo-600",
        emoji: '😍',
        bgColor: 'bg-rose-100',
        linkedCategory: 'Recommend'
    },
    { 
        title: "Into", 
        highlight: "silly things?", 
        subtitle: "Laugh out loud with characters designed to brighten your day and crack jokes.",
        gradient: "from-yellow-400 to-orange-500",
        emoji: '🤪',
        bgColor: 'bg-yellow-100',
        linkedCategory: 'Play & Fun'
    },
    { 
        title: "Down for", 
        highlight: "adventures?", 
        subtitle: "Embark on epic quests and explore new worlds with AI companions.",
        gradient: "from-green-400 to-emerald-600",
        emoji: '🥳',
        bgColor: 'bg-green-100',
        linkedCategory: 'Anime & Game'
    },
     { 
        title: "Up for", 
        highlight: "something wild?", 
        subtitle: "Experience thrilling scenarios and unpredictable plot twists.",
        gradient: "from-purple-600 to-pink-600",
        emoji: '😈',
        bgColor: 'bg-purple-100',
        linkedCategory: 'Icon'
    }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.HOME);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>(SettingsTab.PAYOUTS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Recommend');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroStates.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const navigateToPayouts = () => {
    setCurrentPage(PageView.SETTINGS);
    setActiveSettingsTab(SettingsTab.PAYOUTS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startChat = (character: Character) => {
      setSelectedCharacter(character);
      setCurrentPage(PageView.CHAT);
  };

  // Filter Logic
  const filteredCharacters = useMemo(() => {
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return allCharacters.filter(char => 
            char.name.toLowerCase().includes(query) ||
            char.handle.toLowerCase().includes(query) ||
            char.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    // Filter by Active Category
    return allCharacters.filter(char => char.category === activeCategory);
  }, [searchQuery, activeCategory]);

  const recommendedCharacters = useMemo(() => {
      return allCharacters.filter(c => c.category === 'Recommend');
  }, []);

  const heroCharacters = useMemo(() => {
    const targetCategory = heroStates[activeHeroIndex].linkedCategory;
    return allCharacters.filter(c => c.category === targetCategory);
  }, [activeHeroIndex]);

  const renderContent = () => {
    switch (currentPage) {
      case PageView.CHAT:
        if (!selectedCharacter) return <div onClick={() => setCurrentPage(PageView.HOME)}>Error: No character selected</div>;
        return <ChatInterface character={selectedCharacter} onBack={() => setCurrentPage(PageView.HOME)} allCharacters={allCharacters} />;

      case PageView.CREATE:
        return <CreateWizard onComplete={() => setCurrentPage(PageView.HOME)} />;

      case PageView.HOME:
        // Search View
        if (searchQuery.trim().length > 0) {
            return (
                <div className="space-y-6 animate-fade-in pt-6">
                    <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-gray-900">
                             Search Results for "{searchQuery}"
                         </h2>
                         <button 
                            onClick={() => setSearchQuery('')}
                            className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
                         >
                            Clear Search <X size={14} />
                         </button>
                    </div>
                    
                    {filteredCharacters.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredCharacters.map(char => (
                                <CharacterCard key={char.id} character={char} onClick={() => startChat(char)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} className="text-gray-400"/>
                            </div>
                            <p className="text-lg font-medium text-gray-900">No matches found</p>
                            <p className="text-sm mt-1">Try searching for a name, tag, or handle.</p>
                        </div>
                    )}
                </div>
            );
        }

        // Standard Home View
        const currentHero = heroStates[activeHeroIndex];
        return (
          <div className="space-y-12 pb-12 animate-fade-in">
            {/* New Hero Section */}
            <section className="relative pt-6 px-2">
                <div className="flex flex-col lg:flex-row items-end gap-12">
                    <div className="lg:flex-1 space-y-6 lg:pb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-500">
                            <Star size={12} className="fill-current" />
                            Are you...
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] transition-all duration-500">
                            {currentHero.title} <br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentHero.gradient}`}>
                              {currentHero.highlight}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-md h-12 transition-opacity duration-300">
                            {currentHero.subtitle}
                        </p>
                        
                        <div className="flex gap-4 pt-4">
                             {heroStates.map((state, idx) => (
                                 <div 
                                    key={idx}
                                    onClick={() => setActiveHeroIndex(idx)}
                                    className={`
                                        w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-all duration-300
                                        ${activeHeroIndex === idx 
                                            ? 'bg-white shadow-lg scale-110 border-2 border-transparent' 
                                            : 'bg-gray-100 hover:bg-gray-200 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'
                                        }
                                    `}
                                 >
                                     <span className={activeHeroIndex === idx ? 'animate-bounce' : ''}>
                                        {state.emoji}
                                     </span>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* Featured Carousel Preview */}
                    <div className="w-full lg:w-1/2 overflow-x-auto pb-4 snap-x flex gap-4 scrollbar-hide">
                         {heroCharacters.map(char => (
                             <div key={char.id} className="snap-start shrink-0 w-48 md:w-56">
                                <CharacterCard character={char} variant="portrait" onClick={() => startChat(char)} />
                             </div>
                         ))}
                    </div>
                </div>
            </section>

            {/* Category Filter Pills */}
            <div className="sticky top-0 z-20 bg-[#f9fafb]/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-transparent transition-all" id="sticky-nav">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {['Recommend', 'Play & Fun', 'Helper', 'Original', 'Anime & Game', 'Fiction & Media', 'Icon'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                activeCategory === cat 
                                ? 'bg-black text-white shadow-md transform scale-105' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {cat === 'Recommend' && <Star size={12} className="inline mr-2 fill-current" />}
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Category Grid */}
            <section className="min-h-[400px]">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {activeCategory} <SparklesIcon className="text-yellow-400 fill-current" />
                    </h2>
                </div>
                
                {filteredCharacters.length > 0 ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredCharacters.map(char => (
                            <CharacterCard key={char.id} character={char} onClick={() => startChat(char)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                         <p>No characters found in this category yet.</p>
                    </div>
                )}
            </section>

             {/* Start a conversation Section */}
            <section className="py-10 mt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Start a conversation</h2>
                    <SparklesIcon className="text-yellow-500 fill-current" />
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
                    {conversationStarters.map(item => (
                        <div key={item.id} className="min-w-[280px] max-w-[280px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow snap-center flex flex-col">
                            <div className="flex flex-col items-center mb-5">
                                <div className="relative mb-3">
                                    <img src={item.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt={item.name} />
                                    <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">🔥</div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                <div className="flex items-center gap-1 text-xs font-medium text-gray-400 mt-1">
                                    <MessageCircle size={12} /> {item.count}
                                </div>
                            </div>
                            
                            <div className="space-y-2.5 flex-1">
                                {item.prompts.map((p, i) => (
                                    <button key={i} className="w-full text-left text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-900 hover:text-white p-3 rounded-xl transition-all duration-200 flex justify-between items-center group/btn">
                                        <span className="truncate pr-2">{p}</span>
                                        <Send size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/* Get your tasks done Section */}
             <section className="py-10 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Get your tasks done</h2>
                    <SparklesIcon className="text-blue-500 fill-current" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {taskAssistants.map(task => (
                        <div key={task.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group hover:border-gray-200">
                             <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                                <img src={task.img} className="w-full h-full object-cover" alt={task.name} />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{task.name}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{task.desc}</p>
                             </div>
                             <div className={`p-2 rounded-full ${task.color.replace('text', 'bg').replace('600', '100')} ${task.color} group-hover:scale-110 transition-transform`}>
                                <task.icon size={16} />
                             </div>
                        </div>
                    ))}
                </div>
            </section>
          </div>
        );

      case PageView.SETTINGS:
        return <SettingsInterface />;

      default:
        return <div className="p-10 text-center text-gray-500">Page under construction</div>;
    }
  };

  if (currentPage === PageView.CHAT) {
    return renderContent();
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={(page) => {
            setCurrentPage(page);
            if (page === PageView.SETTINGS) setActiveSettingsTab(SettingsTab.GENERAL);
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600">
                <Menu size={24} />
            </button>
            <span className="font-bold text-lg">Agentwood</span>
            <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Desktop Header / Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5">
            <div className="flex-1 max-w-2xl">
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-gray-800 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm transition-all"
                        placeholder="Search for characters, tags, or creators..."
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                 </div>
            </div>
            <div className="flex items-center gap-4 pl-8">
                 <button 
                  onClick={navigateToPayouts}
                  className="hidden lg:block text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                   Affiliates
                </button>
                <div className="h-4 w-px bg-gray-300 mx-2 hidden lg:block"></div>
                <button className="text-gray-400 hover:text-gray-900 transition-colors relative p-2 hover:bg-gray-100 rounded-full">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:shadow-md transition-all">
                    SC
                </button>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-4 md:px-8 pb-12 overflow-y-auto overflow-x-hidden">
            {renderContent()}
        </div>

        {/* Footer */}
        {currentPage !== PageView.CREATE && (
            <footer className="border-t border-gray-200 bg-white px-8 py-10 mt-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-gray-900">Characters</a></li>
                            <li><a href="#" className="hover:text-gray-900">Create</a></li>
                            <li><a href="#" className="hover:text-gray-900">Mobile App</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-gray-900">About</a></li>
                            <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                            <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                            <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                            <li><a href="#" className="hover:text-gray-900">Cookie Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Partners</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>
                                <button onClick={navigateToPayouts} className="hover:text-gray-900 text-left">
                                    Affiliate Program
                                </button>
                            </li>
                            <li><button onClick={() => setCurrentPage(PageView.CREATE)} className="hover:text-gray-900 text-left">Creators</button></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 pt-8 border-t border-gray-100">
                    <p>&copy; 2024 Agentwood AI Inc. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-600">Twitter</a>
                        <a href="#" className="hover:text-gray-600">Discord</a>
                        <a href="#" className="hover:text-gray-600">Instagram</a>
                    </div>
                </div>
            </footer>
        )}
      </main>
    </div>
  );
}

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.35 9.65L22 12L14.35 14.35L12 22L9.65 14.35L2 12L9.65 9.65L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);