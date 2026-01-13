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
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/Universal_Upscale_0_05c3eacd-7e22-4174-bb11-c3eddd65426d_0.png',
    title: 'Synchronicity Engine',
    description: 'Divine timing meets intelligent matching'
  },
  {
    id: 'missions',
    page: 'Missions',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/d68ea91cc_universal_upscale_0_05c3eacd-7e22-4174-bb11-c3eddd65426d_0.png',
    title: 'Missions',
    description: 'Sacred quests for planetary transformation'
  },
  {
    id: 'marketplace',
    page: 'Marketplace',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/Universal_Upscale_0_05c3eacd-7e22-4174-bb11-c3eddd65426d_0.png',
    title: 'Marketplace',
    description: 'Exchange value with conscious creators'
  },
  {
    id: 'meetings',
    page: 'Meetings',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/Universal_Upscale_0_a26f5d21-e9d3-4b9a-8c17-0b9e7f8c3d2e_0.png',
    title: 'Meetings',
    description: 'Connect with aligned souls'
  },
  {
    id: 'matches',
    page: 'Matches',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/Universal_Upscale_0_b37f6e32-f0e4-5c0b-9d28-1c0f8g9d4e3f_0.png',
    title: 'Matches',
    description: 'Soul-aligned connections await'
  },
  {
    id: 'gamification',
    page: 'Gamification',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/Universal_Upscale_0_c48f7f43-g1f5-6d1c-0e39-2d1g9h0e5f4g_0.png',
    title: 'Gamification',
    description: 'Level up your journey'
  },
  {
    id: 'initiations',
    page: 'Initiations',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/Universal_Upscale_0_d59f8g54-h2g6-7e2d-1f40-3e2h0i1f6g5h_0.png',
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