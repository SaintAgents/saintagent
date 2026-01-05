// New demo profile avatars - Male (top row) and Female (bottom row)
// Source: https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/40a2369ec_Diverseportraitswithwarmsmiles.png

export const DEMO_AVATARS_MALE = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_m1_longhair_brown.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_m2_asian_dark.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_m3_dreads.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_m4_blonde.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_m5_dark_wavy.jpg',
];

export const DEMO_AVATARS_FEMALE = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_f1_blonde_waves.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_f2_dark_straight.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_f3_curly_brown.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_f4_brunette.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/demo_f5_dark_wavy.jpg',
];

export const DEMO_AVATARS_ALL = [...DEMO_AVATARS_MALE, ...DEMO_AVATARS_FEMALE];

// Get a unique avatar by index, no duplicates
let usedAvatarIndices = { male: new Set(), female: new Set() };

export function getUniqueMaleAvatar() {
  for (let i = 0; i < DEMO_AVATARS_MALE.length; i++) {
    if (!usedAvatarIndices.male.has(i)) {
      usedAvatarIndices.male.add(i);
      return DEMO_AVATARS_MALE[i];
    }
  }
  // If all used, reset and start over
  usedAvatarIndices.male.clear();
  usedAvatarIndices.male.add(0);
  return DEMO_AVATARS_MALE[0];
}

export function getUniqueFemaleAvatar() {
  for (let i = 0; i < DEMO_AVATARS_FEMALE.length; i++) {
    if (!usedAvatarIndices.female.has(i)) {
      usedAvatarIndices.female.add(i);
      return DEMO_AVATARS_FEMALE[i];
    }
  }
  // If all used, reset and start over
  usedAvatarIndices.female.clear();
  usedAvatarIndices.female.add(0);
  return DEMO_AVATARS_FEMALE[0];
}

export function resetAvatarTracking() {
  usedAvatarIndices = { male: new Set(), female: new Set() };
}

// Get avatar by explicit index (for deterministic assignment)
export function getMaleAvatarByIndex(index) {
  return DEMO_AVATARS_MALE[index % DEMO_AVATARS_MALE.length];
}

export function getFemaleAvatarByIndex(index) {
  return DEMO_AVATARS_FEMALE[index % DEMO_AVATARS_FEMALE.length];
}