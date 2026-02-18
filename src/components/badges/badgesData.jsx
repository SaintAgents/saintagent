// Badge definitions grouped by section
// Badges can be earned via Quest completion, Challenge milestones, or both (Hybrid)

export const BADGE_SECTIONS = [
  {
    id: 'identity',
    title: 'IDENTITY',
    items: [
      {
        code: 'eternal_flame',
        label: 'Eternal Flame',
        subtitle: 'Living Agent',
        icon_desc: 'Golden flame in a circular base',
        definition: 'Baseline awakening badge—signals a living agent with active inner fire and presence.',
        iconKey: 'flame'
      },
      {
        code: 'verified',
        label: 'Verified',
        icon_desc: 'Gold shield with a checkmark',
        definition: 'The account’s identity/trust status has been confirmed (a trusted/verified profile marker).',
        iconKey: 'shieldCheck'
      },
      {
        code: 'genesis',
        label: 'Genesis',
        icon_desc: '“SA” crest with wings',
        definition: 'A founding/early-origin identity marker (signals early access, first-wave membership, or genesis-tier status).',
        iconKey: 'badgeCheck'
      },
      {
        code: 'soulbound',
        label: 'SoulBound',
        icon_desc: 'Gold padlock on a braided cord',
        definition: 'A non-transferable identity credential tied to the owner (bound to the soul/account, not tradable).',
        iconKey: 'lock'
      },
      {
        code: 'calibrator',
        label: 'Calibrator',
        icon_desc: 'Winged crest with a central diamond',
        definition: 'Signals the user helps calibrate systems/standards—trusted to tune accuracy, alignment, or quality baselines.',
        iconKey: 'diamond'
      },
      {
        code: 'freuwane',
        label: 'Freuwäne',
        icon_desc: 'Winged badge with a blue crystal and a star',
        definition: 'A rare/elite identity designation—signals a special attunement tier or named lineage/class.',
        iconKey: 'diamond'
      },
      {
        code: 'flamewheel',
        label: 'Flamewheel',
        icon_desc: 'Flame inside a gold ring with wings',
        definition: 'Marks active inner drive and momentum—an ignited identity badge for consistent participation and output.',
        iconKey: 'flame'
      },
      {
        code: 'profile_complete',
        label: 'Profile Complete',
        icon_desc: 'Check on a profile card',
        definition: 'Completed onboarding profile setup.',
        iconKey: 'badgeCheck'
      }
    ]
  },
  {
    id: 'marketplace',
    title: 'MARKETPLACE',
    items: [
      {
        code: 'market_maker',
        label: 'Market Maker',
        icon_desc: 'Storefront/market stall',
        definition: 'Creates listings and helps the marketplace function (builder/supplier/liquidity-creator role).',
        iconKey: 'building'
      },
      {
        code: 'ggg_earner',
        label: 'GGG Earner',
        icon_desc: 'Stacks of gold coins',
        definition: 'Has earned platform currency/credits (GGG) via activity—proof of productive participation.',
        iconKey: 'coins'
      },
      {
        code: 'top_seller',
        label: 'Top Seller',
        icon_desc: 'Trophy cup',
        definition: 'Recognized as a high-performing seller (top sales, strong ratings, or standout performance).',
        iconKey: 'trophy'
      },
      {
        code: 'vault_trader',
        label: 'Vault Trader',
        icon_desc: 'Shield with keys and a central lock',
        definition: 'Authorized for vault-tier asset handling with trust requirements (compliance + secure handling).',
        iconKey: 'shield'
      }
    ]
  },
  {
    id: 'mission',
    title: 'MISSION',
    items: [
      {
        code: 'mentor_of_light',
        label: 'Mentor of Light',
        icon_desc: 'Mountain peak with a red flag',
        definition: 'Guide/teacher—signals leadership through challenges and proven mentorship milestones.',
        iconKey: 'flag'
      },
      {
        code: 'diplomat',
        label: 'Diplomat',
        icon_desc: 'Handshake / alliance mark',
        definition: 'Recognized for negotiation, alliance-building, and conflict resolution—bridging people and sides.',
        iconKey: 'handshake'
      },
      {
        code: 'steward',
        label: 'Steward',
        icon_desc: 'Handshake holding a globe',
        definition: 'Trusted caretaker—signals responsibility for community, resources, ethics, and long-term wellbeing.',
        iconKey: 'globe'
      },
      {
        code: 'healer_support',
        label: 'Healer / Support',
        icon_desc: 'Figures with a medical cross symbol',
        definition: 'Care/service—signals healing support, restoration work, or protective aid to others.',
        iconKey: 'heartPulse'
      },
      {
        code: 'cultivator_growthkeeper',
        label: 'Cultivator / Growthkeeper',
        icon_desc: 'Tree growing from open hands with laurel framing',
        definition: 'Nurtures growth and sustainability—long-term building, cultivation, and life-supporting stewardship.',
        iconKey: 'sprout'
      },
      {
        code: 'first_meeting',
        label: 'First Meeting',
        icon_desc: 'Green handshake within circular frame',
        definition: 'Took the first step into connection. Earned by attending or hosting your first meeting on the platform.',
        iconKey: 'handshake',
        rarity: 'common',
        earnMethods: ['quest', 'automatic'],
        questPath: 'Onboarding Quest',
        sacredMeaning: 'Represents initial trust and willingness to engage with the community'
      },
      {
        code: 'audit_expert',
        label: 'Audit Expert',
        icon_desc: 'Document with checkmark and magnifying glass',
        definition: 'Master of verification and quality assurance. Earned by completing 50+ audits with high accuracy.',
        iconKey: 'clipboard',
        rarity: 'rare',
        earnMethods: ['quest', 'challenge'],
        questPath: 'Stewardship Quest line',
        sacredMeaning: 'Represents diligence, attention to detail, and commitment to platform integrity'
      },
      {
        code: 'streak_7',
        label: '7-Day Streak',
        icon_desc: 'Fiery star with wings and the number 7',
        definition: 'Consistency and dedication to daily practice. Earned by logging in and completing activities for 7 consecutive days.',
        iconKey: 'flame',
        rarity: 'common',
        earnMethods: ['quest', 'automatic'],
        questPath: 'Seven Days of Coherence - Alignment Quest',
        sacredMeaning: 'Represents momentum, discipline, and sustained engagement',
        unlocks: ['streak_multipliers']
      },
      {
        code: 'top_mentor',
        label: 'Top Mentor',
        icon_desc: 'Golden chalice with wings and radiating light',
        definition: 'Guide and teacher who uplifts others. Earned by successfully mentoring 10+ members with positive testimonials.',
        iconKey: 'trophy',
        rarity: 'epic',
        earnMethods: ['quest'],
        questPath: "The Mentor's Path - Leadership Quest",
        sacredMeaning: 'Represents wisdom shared, leadership, and service to others growth',
        unlocks: ['mentorship_privileges', 'leadership_circles']
      },
      {
        code: 'ascended_tier',
        label: 'Ascended Tier',
        icon_desc: 'Golden wings embracing a triangle with central gem',
        definition: 'Reached elevated rank status. Earned by achieving Ascended rank (5,000+ RP, Trust Score 60+).',
        iconKey: 'sparkles',
        rarity: 'epic',
        earnMethods: ['quest'],
        questPath: 'The Ascension - Epic Quest',
        sacredMeaning: 'Represents transcendence, elevated consciousness, and proven dedication',
        unlocks: ['advanced_features', 'allocation_access']
      },
      {
        code: 'social_butterfly',
        label: 'Social Butterfly',
        icon_desc: 'Ornate butterfly with cosmic patterns',
        definition: 'Community connector and relationship builder. Earned by making 50+ meaningful connections, 100+ DMs sent, and being active in Global Chat.',
        iconKey: 'users',
        rarity: 'rare',
        earnMethods: ['quest', 'challenge'],
        questPath: 'Social Quest line',
        sacredMeaning: 'Represents transformation through connection, social grace, and network weaving',
        unlocks: ['synchronicity_priority']
      },
      {
        code: 'mission_master',
        label: 'Mission Master',
        icon_desc: 'Compass/orb with laurel wreath and stars',
        definition: 'Completed major platform objectives. Earned by completing 25+ quests across all categories.',
        iconKey: 'target',
        rarity: 'epic',
        earnMethods: ['challenge'],
        questPath: 'Multiple quest chains completed',
        sacredMeaning: 'Represents purpose-driven action, goal achievement, and mastery of the pathway system',
        unlocks: ['legendary_quest_access']
      },
      {
        code: 'trust_anchor',
        label: 'Trust Anchor',
        icon_desc: 'Golden anchor with wreath',
        definition: 'Pillar of reliability and integrity. Earned by maintaining 90+ Trust Score for 90 days with 100+ verified transactions.',
        iconKey: 'shield',
        rarity: 'epic',
        earnMethods: ['quest'],
        questPath: 'Trust Exemplar - Epic Quest',
        sacredMeaning: 'Represents stability, dependability, and foundational trust within the community',
        unlocks: ['stewardship_council', 'allocation_authority', 'dispute_resolution']
      },
      {
        code: 'synchronicity_weaver',
        label: 'Synchronicity Weaver',
        icon_desc: 'Cosmic eye/orb with orbital patterns',
        definition: 'Master of meaningful connections and divine timing. Earned by 20+ perfect synchronicity engine matches and facilitating major collaborative breakthroughs.',
        iconKey: 'sparkles',
        rarity: 'legendary',
        earnMethods: ['quest', 'challenge'],
        questPath: 'Hidden Synchronicity Master Quest',
        sacredMeaning: 'Represents seeing invisible threads, orchestrating serendipity, and operating from flow state',
        unlocks: ['permanent_synchronicity_priority', 'co_creation_fund', 'reality_weaver_status']
      },
      {
        code: 'project_contributor',
        label: 'Project Contributor',
        icon_desc: 'Folder with a star',
        definition: 'Created your first project.',
        iconKey: 'trophy'
      }
    ]
  },
  {
    id: 'alignment',
    title: 'ALIGNMENT',
    items: [
      {
        code: 'light_verified',
        label: 'Light Verified',
        icon_desc: 'Radiant gold star with wing-like rays',
        definition: 'Alignment integrity verified—signals actions meet light/alignment standards.',
        iconKey: 'star'
      },
      {
        code: 'grid_aligned',
        label: 'Grid Aligned',
        icon_desc: 'Multicolor heart with a central diamond',
        definition: 'Heart–mind coherence—resonance with the grid/mission field and emotionally aligned action.',
        iconKey: 'heart'
      },
      {
        code: 'pathwalker_144',
        label: '144 Pathwalker',
        icon_desc: 'Star-shaped sigil with a bright center',
        definition: 'Advanced path commitment—dedicated pathwalker with ongoing service and alignment progression.',
        iconKey: 'sparkles'
      },
      {
        code: 'star_seal',
        label: 'Star Seal',
        icon_desc: 'Pink 8-point star with a gold circular center',
        definition: 'Resonance/attunement seal—signature frequency, activation tier, or specialized alignment mark.',
        iconKey: 'star'
      },
      {
        code: 'sacred_flame',
        label: 'Sacred Flame',
        icon_desc: 'Golden flame in a circular base',
        definition: 'Ignition/transformation—awakened inner fire, sustained devotion, and consistent motion.',
        iconKey: 'flame'
      }
    ]
  },
  {
    id: 'affiliate',
    title: 'AFFILIATE',
    items: [
      {
        code: 'affiliate_bronze',
        label: 'Bronze Affiliate',
        icon_desc: 'Bronze shield with "A" emblem',
        definition: 'Entry-level affiliate status—signals participation in the referral network.',
        iconKey: 'shield'
      },
      {
        code: 'affiliate_silver',
        label: 'Silver Affiliate',
        icon_desc: 'Silver shield with "A" emblem',
        definition: 'Mid-tier affiliate status—signals 5+ paid referrals.',
        iconKey: 'shield'
      },
      {
        code: 'affiliate_gold',
        label: 'Gold Affiliate',
        icon_desc: 'Gold shield with "A" emblem',
        definition: 'Top-tier affiliate status—signals 20+ paid referrals.',
        iconKey: 'shield'
      }
    ]
  },
  {
    id: 'sigils',
    title: 'SIGILS',
    items: [
      // Sigils are mystical/symbolic marks - coming soon
      // These will be special earned insignia separate from achievement badges
    ]
  },
  {
    id: 'trust',
    title: 'TRUST',
    items: [
      {
        code: 'trust_shield',
        label: 'Trust Shield',
        icon_desc: 'Emerald shield with checkmark',
        definition: 'Perfect trust score badge—signals 100% verified trust.',
        iconKey: 'shield'
      }
    ]
  }
];

export const BADGE_INDEX = Object.fromEntries(
  BADGE_SECTIONS.flatMap(s => s.items.map(it => [it.code, { ...it, section: s.id }]))
);

// Quest/Achievement badge images
export const QUEST_BADGE_IMAGES = {
  first_meeting: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2a0b1a50c_Screenshot2026-01-07044449-Picsart-BackgroundRemover.png',
  audit_expert: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/211bccd26_audit-Picsart-BackgroundRemover.png',
  streak_7: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e9af8b0e8_7day.png',
  '7_day_streak': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e9af8b0e8_7day.png',
  '7-day_streak': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e9af8b0e8_7day.png',
  '7day_streak': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e9af8b0e8_7day.png',
  top_mentor: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8cb85d913_Screenshot2026-01-07044531-Picsart-BackgroundRemover.png',
  ascended_tier: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/1df65c199_Screenshot2026-01-07044338-Picsart-BackgroundRemover.png',
  social_butterfly: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/01ebdeddb_Screenshot2026-01-07044414-Picsart-BackgroundRemover.png',
  mission_master: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/459c82828_Screenshot2026-01-07044449-Picsart-BackgroundRemover.png',
  synchronicity_weaver: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/094900082_Screenshot2026-01-07044531-Picsart-BackgroundRemover.png',
  eternal_flame: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/49ae4822c_Screenshot2026-01-07044514-Picsart-BackgroundRemover.png',
  living_agent: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/49ae4822c_Screenshot2026-01-07044514-Picsart-BackgroundRemover.png',
  trust_anchor: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/acd48db09_Goldentrustanchoremblem-Picsart-BackgroundRemover.png',
};

// Badge trigger rules - plain text format (no JSON conditions)
export const BADGE_RULES = {
  verified: {
    badge_id: 'identity_verified',
    name: 'Verified',
    icon: 'Gold shield with a checkmark',
    when: 'After successful completion of the platform’s verification process.',
    how: 'User passes identity/account verification and has no major flags in the last 90 days.',
    non_transferable: true,
    requires_manual_approval: false
  },
  genesis: {
    badge_id: 'identity_genesis',
    name: 'Genesis',
    icon: '“SA” crest with wings',
    when: 'Granted to accounts that joined during the genesis window or hold a genesis credential.',
    how: 'Account in genesis interval, holds a genesis token, or admin-marked as genesis.',
    non_transferable: true,
    requires_manual_approval: false
  },
  soulbound: {
    badge_id: 'identity_soulbound',
    name: 'SoulBound',
    icon: 'Gold padlock on a braided cord',
    when: 'Assigned for major, permanent status recognitions that should never be sold or transferred.',
    how: 'User completes a key initiation or oath and is granted a permanent soulbound credential.',
    non_transferable: true,
    requires_manual_approval: true
  },
  calibrator: {
    badge_id: 'identity_calibrator',
    name: 'Calibrator',
    icon: 'Winged crest with a central diamond',
    when: 'Given to high-trust users selected as reviewers/curators who help calibrate quality and alignment.',
    how: 'High rep (400+) and trust (75%+); completes 20+ calibration tasks with 80%+ accuracy; final manual approval.',
    non_transferable: true,
    requires_manual_approval: true
  },
  freuwane: {
    badge_id: 'identity_freuwane',
    name: 'Freuwäne',
    icon: 'Winged badge with a blue crystal and a star',
    when: 'Reserved for exceptional members recognized for deep mastery, lineage, or unique contribution.',
    how: 'Long-term service (365+ days), high integrity (rep 700+, trust 90%+); council-only grant.',
    non_transferable: true,
    requires_manual_approval: true
  },
  flamewheel: {
    badge_id: 'identity_flamewheel',
    name: 'Flamewheel',
    icon: 'Flame inside a gold ring with wings',
    when: 'Earned once a threshold of sustained, high-energy activity is reached.',
    how: '30+ active days and 10+ missions completed within 60 days with no major violations.',
    non_transferable: true,
    requires_manual_approval: false
  },
  market_maker: {
    badge_id: 'market_market_maker',
    name: 'Market Maker',
    icon: 'Storefront/market stall',
    when: 'Once user contributes multiple listings and executes sales.',
    how: '5+ active listings and 3+ completed sales.',
    non_transferable: true,
    requires_manual_approval: false
  },
  ggg_earner: {
    badge_id: 'market_ggg_earner',
    name: 'GGG Earner',
    icon: 'Stacks of gold coins',
    when: 'First time user receives GGG from recognized activity.',
    how: 'Paid mission, sale, or platform reward (not self-transfer).',
    non_transferable: true,
    requires_manual_approval: false
  },
  top_seller: {
    badge_id: 'market_top_seller',
    name: 'Top Seller',
    icon: 'Trophy cup',
    when: 'Top-tier performance over a recent timeframe.',
    how: 'Top 10% sales volume over 30 days with 4.5+ avg rating and under 5% dispute rate.',
    non_transferable: true,
    requires_manual_approval: false
  },
  vault_trader: {
    badge_id: 'market_vault_trader',
    name: 'Vault Trader',
    icon: 'Shield with keys and a central lock',
    when: 'Whitelisted/approved for vault-tier operations.',
    how: 'Rep 500+, trust 85%+, passes vault compliance check, manually authorized.',
    non_transferable: true,
    requires_manual_approval: true
  },
  mentor_of_light: {
    badge_id: 'mission_mentor_of_light',
    name: 'Mentor of Light',
    icon: 'Mountain peak with a red flag',
    when: 'After successfully mentoring others through defined missions.',
    how: '5+ mentorship missions completed with 4.5+ avg feedback; rep 300+, trust 70%+.',
    non_transferable: true,
    requires_manual_approval: false
  },
  diplomat: {
    badge_id: 'mission_diplomat',
    name: 'Diplomat',
    icon: 'Two figures, one raising a trophy',
    when: 'After multiple successful conflict-resolution actions.',
    how: '5+ mediation sessions with 70%+ success rate; rep 250+, trust 65%+.',
    non_transferable: true,
    requires_manual_approval: false
  },
  steward: {
    badge_id: 'mission_steward',
    name: 'Steward',
    icon: 'Handshake holding a globe',
    when: 'For ongoing responsibility for a community or project.',
    how: '1+ steward role assigned for 90+ days; rep 350+, trust 75%+.',
    non_transferable: true,
    requires_manual_approval: false
  },
  healer_support: {
    badge_id: 'mission_healer_support',
    name: 'Healer / Support',
    icon: 'Two figures with a medical cross symbol',
    when: 'Strong pattern of providing healing or support.',
    how: '5+ support missions completed with 4.5+ avg feedback and no exploitative flags.',
    non_transferable: true,
    requires_manual_approval: false
  },
  cultivator_growthkeeper: {
    badge_id: 'mission_cultivator_growthkeeper',
    name: 'Cultivator / Growthkeeper',
    icon: 'Tree growing from open hands with laurel framing',
    when: 'Users who grow and sustain communities or projects over time.',
    how: '5+ community growth missions, 60%+ retention rate, 90+ active days in community.',
    non_transferable: true,
    requires_manual_approval: false
  },
  light_verified: {
    badge_id: 'alignment_light_verified',
    name: 'Light Verified',
    icon: 'Radiant gold star with wing-like rays',
    when: 'After alignment-focused review of behavior and contributions.',
    how: 'Rep 400+, trust 80%+, no alignment flags for 180 days.',
    non_transferable: true,
    requires_manual_approval: false
  },
  grid_aligned: {
    badge_id: 'alignment_grid_aligned',
    name: 'Grid Aligned',
    icon: 'Multicolor heart with a central diamond',
    when: 'Consistent participation in grid/mission work with heart coherence.',
    how: '8+ grid missions completed, 10+ heart-coherence sessions logged, trust 75%+.',
    non_transferable: true,
    requires_manual_approval: false
  },
  pathwalker_144: {
    badge_id: 'alignment_144_pathwalker',
    name: '144 Pathwalker',
    icon: 'Star-shaped sigil with a bright center',
    when: 'Reserved for advanced initiates on the 144-path.',
    how: '12+ path milestones completed; rep 500+, trust 85%+, 270+ active days.',
    non_transferable: true,
    requires_manual_approval: false
  },
  star_seal: {
    badge_id: 'alignment_star_seal',
    name: 'Star Seal',
    icon: 'Pink 8-point star with a gold circular center',
    when: 'After a specific activation or attunement.',
    how: 'Participates in at least one attunement event and passes its check.',
    non_transferable: true,
    requires_manual_approval: false
  },
  sacred_flame: {
    badge_id: 'alignment_sacred_flame',
    name: 'Sacred Flame',
    icon: 'Golden flame in a circular base',
    when: 'Long-standing pattern of committed transformation and service.',
    how: '12+ transformative missions over 180+ days; rep 550+, trust 88%+.',
    non_transferable: true,
    requires_manual_approval: false
  },
  social_butterfly: {
    badge_id: 'mission_social_butterfly',
    name: 'Social Butterfly',
    icon: 'Ornate butterfly with cosmic patterns',
    when: 'Community connector and relationship builder.',
    how: '50+ meaningful connections (follows/friends), 100+ DMs sent, active participation in Global Chat (20+ messages).',
    non_transferable: true,
    requires_manual_approval: false,
    criteria: {
      min_connections: 50,
      min_dms_sent: 100,
      min_global_chat_messages: 20
    }
  }
};