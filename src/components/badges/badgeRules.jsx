{
  "sections": {
    "IDENTITY": [
      {
        "badge_id": "identity_verified",
        "name": "Verified",
        "icon": "Gold shield with a checkmark",
        "definition": "The account’s identity/trust status has been confirmed (a “trusted/verified” profile marker).",
        "when": "After successful completion of the platform’s verification process.",
        "how": "User passes identity/account verification and has no major flags in the last 90 days.",
        "conditions": {
          "verification_status": "verified",
          "no_major_flags_last_days": 90
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "identity_genesis",
        "name": "Genesis",
        "icon": "“SA” crest with wings",
        "definition": "A founding/early-origin identity marker (signals early access, first-wave membership, or genesis-tier status).",
        "when": "Granted to accounts that joined during the genesis window or hold a genesis credential.",
        "how": "User created their account during the genesis interval or holds a genesis code/token. Admin may also mark an account as genesis.",
        "conditions": {
          "account_created_in_genesis_window": true,
          "has_genesis_token": true,
          "manually_marked_genesis": true
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "identity_soulbound",
        "name": "SoulBound",
        "icon": "Gold padlock on a braided cord",
        "definition": "A non-transferable identity credential tied to the owner (meant to represent “bound to the soul/account,” not tradable).",
        "when": "Assigned for major, permanent status recognitions that should never be sold or transferred.",
        "how": "User completes a key initiation or oath and is granted a permanent soulbound credential.",
        "conditions": {
          "has_completed_soulbound_initiation": true
        },
        "non_transferable": true,
        "requires_manual_approval": true
      },
      {
        "badge_id": "identity_calibrator",
        "name": "Calibrator",
        "icon": "Winged crest with a central diamond",
        "definition": "Signals the user helps calibrate systems/standards—someone trusted to tune accuracy, alignment, or quality baselines.",
        "when": "Given to high-trust users selected as reviewers/curators who help calibrate quality and alignment.",
        "how": "User maintains high reputation and trust, completes calibration tasks with good accuracy, and is approved into a calibrator program.",
        "conditions": {
          "min_rep_score": 400,
          "min_trust_percent": 75,
          "min_calibration_events_completed": 20,
          "min_calibration_accuracy": 0.8
        },
        "non_transferable": true,
        "requires_manual_approval": true
      },
      {
        "badge_id": "identity_freuwane",
        "name": "Freuwäne",
        "icon": "Winged badge with a blue crystal and a star",
        "definition": "A rare/elite identity designation (signals a special attunement tier, refined mastery, or a named lineage/class within the system).",
        "when": "Reserved for exceptional members recognized for deep mastery, lineage, or unique contribution.",
        "how": "User demonstrates long-term service, high integrity, and deep alignment, then is directly granted Freuwäne status by the council.",
        "conditions": {
          "min_rep_score": 700,
          "min_trust_percent": 90,
          "min_active_days_total": 365
        },
        "non_transferable": true,
        "requires_manual_approval": true
      },
      {
        "badge_id": "identity_flamewheel",
        "name": "Flamewheel",
        "icon": "Flame inside a gold ring with wings",
        "definition": "Marks active inner drive and momentum—an “ignited” identity badge for consistent energy, participation, or transformational output.",
        "when": "Earned once a threshold of sustained, high-energy activity is reached.",
        "how": "User maintains an active streak and completes multiple missions within a rolling time window without serious violations.",
        "conditions": {
          "min_active_days_last_60d": 30,
          "min_missions_completed_last_60d": 10,
          "no_major_flags_last_days": 60
        },
        "non_transferable": true,
        "requires_manual_approval": false
      }
    ],
    "MARKETPLACE": [
      {
        "badge_id": "market_market_maker",
        "name": "Market Maker",
        "icon": "Storefront/market stall",
        "definition": "Creates listings and helps the marketplace function (a builder/supplier/liquidity-creator role).",
        "when": "Awarded once the user has contributed a meaningful number of listings and executed some sales.",
        "how": "User activates several listings and completes at least a few marketplace sales.",
        "conditions": {
          "min_active_listings_count": 5,
          "min_total_sales_count": 3
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "market_ggg_earner",
        "name": "GGG Earner",
        "icon": "Stacks of gold coins",
        "definition": "Has earned platform currency/credits (GGG) through activity—proof of productive marketplace participation.",
        "when": "First time the user receives GGG from recognized platform activity.",
        "how": "User completes a paid mission, sells an item/service, or receives a platform reward in GGG (not self-transfer).",
        "conditions": {
          "min_total_ggg_earned_from_activity": 1
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "market_top_seller",
        "name": "Top Seller",
        "icon": "Trophy cup",
        "definition": "Recognized as a high-performing seller (top sales volume, strong ratings, or standout performance in a period).",
        "when": "Granted to sellers performing in the top tier over a recent timeframe.",
        "how": "User reaches a top percentile in sales volume over the last 30 days while maintaining high ratings and low dispute rates.",
        "conditions": {
          "time_window_days": 30,
          "min_sales_volume_window": 1000,
          "max_sales_volume_percentile_window": 0.1,
          "min_avg_buyer_rating_window": 4.5,
          "max_dispute_rate_window": 0.05
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "market_vault_trader",
        "name": "Vault Trader",
        "icon": "Shield with keys and a central lock",
        "definition": "Authorized to trade/handle vault-tier assets with trust requirements (signals compliance + secure handling).",
        "when": "User is whitelisted or approved for vault-tier or high-sensitivity asset operations.",
        "how": "User passes extra compliance checks, holds high reputation and trust, and is manually authorized for vault trading.",
        "conditions": {
          "min_rep_score": 500,
          "min_trust_percent": 85,
          "passed_vault_compliance": true
        },
        "non_transferable": true,
        "requires_manual_approval": true
      }
    ],
    "MISSION": [
      {
        "badge_id": "mission_mentor_of_light",
        "name": "Mentor of Light",
        "icon": "Mountain peak with a red flag",
        "definition": "A guide/teacher role—signals leadership through challenges and proven mentorship milestones.",
        "when": "Granted after the user has successfully mentored others through defined missions.",
        "how": "User completes multiple mentorship missions with high feedback scores, supported by strong reputation and trust.",
        "conditions": {
          "min_mentorship_missions_completed": 5,
          "min_avg_mentorship_feedback_rating": 4.5,
          "min_rep_score": 300,
          "min_trust_percent": 70
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "mission_diplomat",
        "name": "Diplomat",
        "icon": "Two figures, one raising a trophy",
        "definition": "Recognized for negotiation, alliance-building, and conflict resolution (bridging people/sides successfully).",
        "when": "Earned after multiple successful conflict-resolution actions.",
        "how": "User mediates disputes or negotiations with a good success rate and stable reputation.",
        "conditions": {
          "min_mediation_sessions_completed": 5,
          "min_conflict_resolution_success_rate": 0.7,
          "min_rep_score": 250,
          "min_trust_percent": 65
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "mission_steward",
        "name": "Steward",
        "icon": "Handshake holding a globe",
        "definition": "Trusted caretaker role—signals responsibility for community, resources, ethics, or long-term wellbeing.",
        "when": "Awarded to users who hold ongoing responsibility for a community or project.",
        "how": "User is assigned to steward roles, stays active in them for a sustained period, and maintains high reputation and trust.",
        "conditions": {
          "min_steward_roles_assigned": 1,
          "min_days_in_steward_roles": 90,
          "min_rep_score": 350,
          "min_trust_percent": 75
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "mission_healer_support",
        "name": "Healer / Support",
        "icon": "Two figures with a medical cross symbol",
        "definition": "Care/service badge—signals healing support, restoration work, or protective aid to others.",
        "when": "Granted to users with a strong pattern of providing healing or support.",
        "how": "User completes several support missions with excellent feedback and no exploitative behavior.",
        "conditions": {
          "min_support_missions_completed": 5,
          "min_avg_support_feedback_rating": 4.5,
          "no_exploitative_flags": true
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "mission_cultivator_growthkeeper",
        "name": "Cultivator / Growthkeeper",
        "icon": "Tree growing from open hands with laurel framing",
        "definition": "Nurtures growth and sustainability—signals long-term building, community cultivation, or life-supporting stewardship.",
        "when": "Earned by users who grow and sustain communities or projects over time.",
        "how": "User repeatedly contributes to community growth, retention, and ongoing activity.",
        "conditions": {
          "min_community_growth_missions_completed": 5,
          "min_community_retention_rate": 0.6,
          "min_community_active_days": 90
        },
        "non_transferable": true,
        "requires_manual_approval": false
      }
    ],
    "ALIGNMENT": [
      {
        "badge_id": "alignment_light_verified",
        "name": "Light Verified",
        "icon": "Radiant gold star with wing-like rays",
        "definition": "Alignment integrity verified—signals the user’s stance/actions meet “light/alignment” standards.",
        "when": "Awarded after an alignment-focused review of behavior and contributions.",
        "how": "User upholds high reputation and trust with no serious alignment flags for a significant period.",
        "conditions": {
          "min_rep_score": 400,
          "min_trust_percent": 80,
          "no_major_alignment_flags_last_days": 180
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "alignment_grid_aligned",
        "name": "Grid Aligned",
        "icon": "Multicolor heart with a central diamond",
        "definition": "Heart–mind coherence badge—signals resonance with the grid/mission field and emotionally aligned action.",
        "when": "Given to users who consistently participate in grid/mission work with heart coherence.",
        "how": "User completes grid-focused missions and logs heart-coherence practices with good trust metrics.",
        "conditions": {
          "min_grid_missions_completed": 8,
          "min_heart_coherence_sessions_logged": 10,
          "min_trust_percent": 75
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "alignment_144_pathwalker",
        "name": "144 Pathwalker",
        "icon": "Star-shaped sigil with a bright center",
        "definition": "Advanced path commitment badge—signals dedicated “pathwalker” status and ongoing service/alignment progression.",
        "when": "Reserved for advanced initiates on the 144-path.",
        "how": "User completes key 144-path milestones over time while maintaining high reputation, trust, and consistent activity.",
        "conditions": {
          "min_path_144_milestones_completed": 12,
          "min_rep_score": 500,
          "min_trust_percent": 85,
          "min_active_days_total": 270
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "alignment_star_seal",
        "name": "Star Seal",
        "icon": "Pink 8-point star with a gold circular center",
        "definition": "Resonance/attunement seal—signals a signature frequency, activation tier, or specialized alignment mark.",
        "when": "Granted after a specific activation or attunement.",
        "how": "User participates in at least one attunement event and passes its alignment check.",
        "conditions": {
          "min_attunement_events_completed": 1,
          "attunement_status_required": "passed"
        },
        "non_transferable": true,
        "requires_manual_approval": false
      },
      {
        "badge_id": "alignment_sacred_flame",
        "name": "Sacred Flame",
        "icon": "Golden flame in a circular base",
        "definition": "Ignition/transformation badge—signals awakened inner fire, sustained devotion, and consistent forward motion.",
        "when": "Earned when a user shows a long-standing pattern of committed transformation and service.",
        "how": "User completes multiple transformative missions over an extended time with sustained high-level reputation and trust.",
        "conditions": {
          "min_transformative_missions_completed": 12,
          "min_transformative_period_days": 180,
          "min_rep_score": 550,
          "min_trust_percent": 88
        },
        "non_transferable": true,
        "requires_manual_approval": false
      }
    ]
  }
}