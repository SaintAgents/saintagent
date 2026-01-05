// New demo profile avatars - Male (top row) and Female (bottom row)
// Source grid: https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/40a2369ec_Diverseportraitswithwarmsmiles.png
// Using high-quality stock photos as placeholders - replace with actual cropped faces

export const DEMO_AVATARS_MALE = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/126c9910a_Screenshot2026-01-05044632.png', // Long brown hair guy
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/74ffcbd77_Screenshot2026-01-05044648.png', // Asian dark hair
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/00d0f05a9_Screenshot2026-01-05044704.png', // Dreads guy
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/0bfc64ea2_Screenshot2026-01-05044728.png', // Blonde guy
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/278596fe2_Screenshot2026-01-05044741.png', // Dark wavy guy
];

export const DEMO_AVATARS_FEMALE = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/241a3258b_Screenshot2026-01-05044754.png', // Curly brown woman
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/05bc0653e_Screenshot2026-01-05044810.png', // Dark straight woman
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/b75f5b0dd_Screenshot2026-01-05044826.png', // Brunette with earrings
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/536ed7042_Screenshot2026-01-05044844.png', // Dark wavy woman
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/67391be16_Screenshot2026-01-05044903.png', // Blonde waves woman
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