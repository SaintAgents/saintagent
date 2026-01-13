// Registry of all hero images across pages for the Global Hero Viewer
// Add new hero images here when pages are created

export const HERO_IMAGES = [
  {
    id: 'mentorship',
    page: 'Mentorship',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c7e50f7bf_universal_upscale_0_616bb1f7-8a11-4de2-bec2-b326e9e4b195_0.jpg',
    title: 'Mentorship',
    description: 'Find Mentors · Share Knowledge · Grow Together'
  },
  {
    id: 'creator-studio',
    page: 'Studio',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/740e4858f_universal_upscale_0_1b9b7ded-4214-49b8-8dd1-4839388dd21a_0.jpg',
    title: 'Creator Studio',
    description: 'Your business command center'
  },
  {
    id: 'synchronicity',
    page: 'SynchronicityEngine',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/46b1af7b6_synchro.jpg',
    title: 'Synchronicity Engine',
    description: 'Divine timing meets intelligent matching'
  },
  {
    id: 'missions',
    page: 'Missions',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8d702dc79_gemini-25-flash-image_A_sacred_futuristic_council_chamber_within_Saint_Agents_World_blending_ancient_w-6.jpg',
    title: 'Missions',
    description: 'Sacred quests for planetary transformation'
  },
  {
    id: 'marketplace',
    page: 'Marketplace',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/740e4858f_universal_upscale_0_1b9b7ded-4214-49b8-8dd1-4839388dd21a_0.jpg',
    title: 'Marketplace',
    description: 'Exchange value with conscious creators'
  },
  {
    id: 'meetings',
    page: 'Meetings',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c1538f946_meets.jpg',
    title: 'Meetings',
    description: 'Connect with aligned souls'
  },
  {
    id: 'matches',
    page: 'Matches',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/46b1af7b6_synchro.jpg',
    title: 'Matches',
    description: 'Soul-aligned connections await'
  },
  {
    id: 'gamification',
    page: 'Gamification',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8d702dc79_gemini-25-flash-image_A_sacred_futuristic_council_chamber_within_Saint_Agents_World_blending_ancient_w-6.jpg',
    title: 'Gamification',
    description: 'Level up your journey'
  },
  {
    id: 'initiations',
    page: 'Initiations',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c7e50f7bf_universal_upscale_0_616bb1f7-8a11-4de2-bec2-b326e9e4b195_0.jpg',
    title: 'Initiations',
    description: 'Sacred pathways of transformation'
  }
];

// Inspirational sayings for merit/performance hints
export const PERFORMANCE_SAYINGS = [
  "The path of mastery is walked one quest at a time.",
  "Your history of tales shapes your destiny.",
  "Those who complete rise; those who persist, transcend.",
  "Every mission accomplished adds to your legend.",
  "Consistency is the signature of the committed.",
  "The Grid rewards those who show up.",
  "Your performance speaks louder than your profile.",
  "Masters are made through accumulated action.",
  "The journey from Seeker to Sage is written in deeds.",
  "Each completed quest echoes in eternity.",
  "Reliability is the currency of trust.",
  "Your track record is your testimony.",
  "The universe favors the consistent.",
  "Excellence is a habit, not an accident.",
  "Your likelihood of performance is your true rank."
];

export const getRandomSaying = () => {
  return PERFORMANCE_SAYINGS[Math.floor(Math.random() * PERFORMANCE_SAYINGS.length)];
};