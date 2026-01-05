// New demo profile avatars - Male (top row) and Female (bottom row)
// Source grid: https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/40a2369ec_Diverseportraitswithwarmsmiles.png
// Using high-quality stock photos as placeholders - replace with actual cropped faces

export const DEMO_AVATARS_MALE = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', // Long brown hair guy
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face', // Asian dark hair
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', // Dreads guy
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', // Blonde guy
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', // Dark wavy guy
];

export const DEMO_AVATARS_FEMALE = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', // Blonde waves
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', // Dark straight
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face', // Curly brown
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', // Brunette
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', // Dark wavy
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