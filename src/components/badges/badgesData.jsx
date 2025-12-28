// Badge definitions grouped by section
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
  }
];

export const BADGE_INDEX = Object.fromEntries(
  BADGE_SECTIONS.flatMap(s => s.items.map(it => [it.code, { ...it, section: s.id }]))
);