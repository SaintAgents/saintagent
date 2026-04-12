{
  "sections": {
    "IDENTITY": [
      {
        "badge_id": "identity_verified",
        "name": "Verified",
        "icon": "Gold shield with a checkmark",
        "definition": "The account's identity/trust status has been confirmed.",
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
        "icon": "SA crest with wings",
        "definition": "A founding/early-origin identity marker.",
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
        "definition": "A non-transferable identity credential tied to the owner.",
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
        "definition": "Signals the user helps calibrate systems/standards.",
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
        "name": "Freuwane",
        "icon": "Winged badge with a blue crystal and a star",
        "definition": "A rare/elite identity designation.",
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
        "definition": "Marks active inner drive and momentum.",
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
        "definition": "Creates listings and helps the marketplace function.",
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
        "definition": "Has earned platform currency through activity.",
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
        "definition": "Recognized as a high-performing seller.",
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
        "definition": "Authorized to trade vault-tier assets.",
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
        "definition": "A guide/teacher role.",
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
        "definition": "Recognized for negotiation and conflict resolution.",
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
        "definition": "Trusted caretaker role.",
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
        "definition": "Care/service badge.",
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
        "definition": "Nurtures growth and sustainability.",
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
        "definition": "Alignment integrity verified.",
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
        "definition": "Heart-mind coherence badge.",
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
        "definition": "Advanced path commitment badge.",
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
        "definition": "Resonance/attunement seal.",
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
        "definition": "Ignition/transformation badge.",
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