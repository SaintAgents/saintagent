// XP Task Definitions — each task awards XP when completed
export const XP_TASKS = [
  { id: 'upload_avatar', label: 'Upload Avatar', xp: 10, icon: 'Camera', check: (p) => !!p.avatar_url },
  { id: 'upload_gallery', label: 'Upload Gallery Photo', xp: 15, icon: 'Image', check: (p) => (p.gallery_images?.length || 0) > 0 },
  { id: 'write_bio', label: 'Write a Bio', xp: 10, icon: 'FileText', check: (p) => !!p.bio && p.bio.length > 10 },
  { id: 'set_location', label: 'Set Location', xp: 5, icon: 'MapPin', check: (p) => !!p.location },
  { id: 'add_skills', label: 'Add Skills', xp: 10, icon: 'Sparkles', check: (p) => (p.skills?.length || 0) >= 1 },
  { id: 'set_intentions', label: 'Set Intentions', xp: 10, icon: 'Target', check: (p) => (p.intentions?.length || 0) >= 1 },
  { id: 'add_social_links', label: 'Add Social Links', xp: 10, icon: 'Link', check: (p) => {
    const links = p.social_links || {};
    return Object.values(links).filter(Boolean).length >= 1;
  }},
  { id: 'upload_hero', label: 'Upload Hero Image', xp: 15, icon: 'Image', check: (p) => !!p.hero_image_url },
  { id: 'set_mystical', label: 'Set Mystical Profile', xp: 10, icon: 'Sparkles', check: (p) => !!p.astrological_sign || !!p.mystical_identifier },
];

// Tasks that depend on external data (counts passed separately)
export const XP_SOCIAL_TASKS = [
  { id: 'first_testimonial', label: 'Receive a Testimonial', xp: 20, icon: 'Star', countKey: 'testimonials' },
  { id: 'first_listing', label: 'Create a Listing', xp: 20, icon: 'ShoppingBag', countKey: 'listings' },
  { id: 'first_follower', label: 'Get a Follower', xp: 15, icon: 'UserPlus', countKey: 'followers' },
  { id: 'five_followers', label: 'Reach 5 Followers', xp: 25, icon: 'Users', countKey: 'followers', threshold: 5 },
  { id: 'first_booking', label: 'Book a Call', xp: 20, icon: 'Calendar', countKey: 'bookings' },
];

// Levels — XP thresholds and titles
export const XP_LEVELS = [
  { level: 1, title: 'Newcomer', xpRequired: 0 },
  { level: 2, title: 'Explorer', xpRequired: 25 },
  { level: 3, title: 'Contributor', xpRequired: 60 },
  { level: 4, title: 'Connector', xpRequired: 100 },
  { level: 5, title: 'Trailblazer', xpRequired: 150 },
  { level: 6, title: 'Luminary', xpRequired: 215 },
];

// Badge unlocks per level
export const LEVEL_BADGES = {
  2: { emoji: '🌱', label: 'Explorer' },
  3: { emoji: '⭐', label: 'Contributor' },
  4: { emoji: '🔗', label: 'Connector' },
  5: { emoji: '🔥', label: 'Trailblazer' },
  6: { emoji: '👑', label: 'Luminary' },
};

// Calculate total XP from profile + social counts
export function calculateXP(profile, socialCounts = {}) {
  let totalXP = 0;
  const completed = [];

  for (const task of XP_TASKS) {
    if (task.check(profile)) {
      totalXP += task.xp;
      completed.push(task.id);
    }
  }

  for (const task of XP_SOCIAL_TASKS) {
    const count = socialCounts[task.countKey] || 0;
    const threshold = task.threshold || 1;
    if (count >= threshold) {
      totalXP += task.xp;
      completed.push(task.id);
    }
  }

  return { totalXP, completed };
}

export function getLevel(xp) {
  let current = XP_LEVELS[0];
  for (const level of XP_LEVELS) {
    if (xp >= level.xpRequired) current = level;
    else break;
  }
  const nextIdx = XP_LEVELS.findIndex(l => l.level === current.level) + 1;
  const next = XP_LEVELS[nextIdx] || null;
  const progressToNext = next
    ? ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100
    : 100;
  return { ...current, next, progressToNext: Math.min(100, Math.max(0, progressToNext)) };
}

export function getUnlockedBadges(level) {
  return Object.entries(LEVEL_BADGES)
    .filter(([lvl]) => Number(lvl) <= level)
    .map(([lvl, badge]) => ({ level: Number(lvl), ...badge }));
}