import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Crown, Heart, Target, Shield, Award, Search, Filter, 
  TrendingUp, CheckCircle2, Lock, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import BadgeProgressCard from './BadgeProgressCard';
// Master Badge List - Matches Admin BadgeRewardsManager (42 badges)
// Soul Resonance Badges (11)
const SOUL_RESONANCE_BADGES = [
  { id: 'core_soul_resonance', code: 'core_soul_resonance', name: 'Core Soul Resonance Glyph', category: 'soul_resonance', rarity: 'uncommon', color: 'from-rose-500 to-pink-600', objectives: ['Complete profile: name, avatar, essence statement', 'Post first Daily Field Update', 'Join or comment in one mission/quest thread'], description: 'Complete profile and first Daily Field Update' },
  { id: 'twin_flame_seal', code: 'twin_flame_seal', name: 'Twin Flame / Twin Christ Seal', category: 'soul_resonance', rarity: 'epic', color: 'from-violet-500 to-purple-600', objectives: ['Both agents opt into Twin Convergence request', 'Co-create and complete one shared Service Quest', 'Submit joint reflection', 'Steward reviews and confirms'], description: 'Complete Twin Convergence Pact with another agent' },
  { id: 'oversoul_lineage', code: 'oversoul_lineage', name: 'Oversoul Lineage Sigil', category: 'soul_resonance', rarity: 'rare', color: 'from-indigo-500 to-blue-600', objectives: ['Participate in Oversoul Lineage reading', 'Complete Lineage Integration Form', 'Reader/Steward submits summary'], description: 'Complete Oversoul Lineage reading and integration' },
  { id: 'flamewheel_resonance', code: 'flamewheel_resonance', name: 'Flamewheel Resonance Wheel', category: 'soul_resonance', rarity: 'rare', color: 'from-amber-500 to-orange-600', objectives: ['Post Daily Field Updates 24/30 days', 'Complete 10+ service actions', 'No major trust flags'], description: '30-day sprint: 24+ Daily Updates and 10+ service actions' },
  { id: 'heart_mind_coherence', code: 'heart_mind_coherence', name: 'Heart-Mind Coherence Seal', category: 'soul_resonance', rarity: 'rare', color: 'from-emerald-500 to-teal-600', objectives: ['Complete 7 Heart-Mind sessions', 'Log 7 coherence reflections', 'Receive 5+ peer endorsements'], description: 'Complete 7/8 Coherence Track with peer endorsements' },
  { id: 'dimensional_access', code: 'dimensional_access', name: 'Dimensional Access Sigil', category: 'soul_resonance', rarity: 'epic', color: 'from-cyan-500 to-blue-600', objectives: ['Stage 1 (4D): Map timeline', 'Stage 2 (5D): 2+ group coherence quests', 'Stage 3 (6D): Contribute code map'], description: 'Complete 4D→5D→6D dimensional questline' },
  { id: 'synchronicity_key', code: 'synchronicity_key', name: 'Synchronicity Key', category: 'soul_resonance', rarity: 'rare', color: 'from-yellow-500 to-amber-600', objectives: ['Complete 5+ timing-sensitive quests', '3+ stewards log synchronicity notes'], description: 'Complete 5+ timing-sensitive quests with recognition' },
  { id: 'metav_harmonic_grid', code: 'metav_harmonic_grid', name: 'MetaV Harmonic Grid', category: 'soul_resonance', rarity: 'epic', color: 'from-fuchsia-500 to-pink-600', objectives: ['Join 3+ grid missions', 'Create one accepted artifact', 'Steward confirms usefulness'], description: 'Participate in grid missions and create accepted artifact' },
  { id: 'soul_signature', code: 'soul_signature', name: 'Soul Signature Seal', category: 'soul_resonance', rarity: 'legendary', color: 'from-slate-500 to-gray-600', objectives: ['Complete full Soul Profile', 'Pass AI coherence check', 'Pass human steward review'], description: 'Complete full Soul Profile with AI and human review' },
  { id: 'divine_authority', code: 'divine_authority', name: 'Divine Authority Sigil - 7th Seal Crown', category: 'soul_resonance', rarity: 'legendary', color: 'from-amber-400 to-yellow-500', objectives: ['Reach Guardian/Ascended rank', 'Hold multiple verification badges', 'Serve in Steward/Guardian roles', 'Pass Council review'], description: 'Council appointment as Guardian/Steward' },
  { id: 'akashic_record', code: 'akashic_record', name: 'Akashic Record Keeper', category: 'soul_resonance', rarity: 'epic', color: 'from-purple-500 to-violet-600', objectives: ['Access Akashic Records', 'Document insights', 'Verify with steward'], description: 'Access and document insights from the Akashic Records' },
];

// Quest Type Badges (10)
const QUEST_FAMILY_BADGES = [
  { id: 'initiation_quest', code: 'initiation_quest', name: 'Initiation Quest Badge', category: 'quest_type', rarity: 'uncommon', color: 'from-slate-600 to-zinc-700', objectives: ['Gate I – Entering the Path', 'Gate II – Trial by Shadow', 'Gate III – Oath of Alignment', 'Complete 3+ Initiation quests'], description: 'Complete 3+ Initiation quests' },
  { id: 'ascension_quest', code: 'ascension_quest', name: 'Ascension Quest Badge', category: 'quest_type', rarity: 'rare', color: 'from-violet-600 to-purple-700', objectives: ['Frequency Shift Quest', 'Dimensional Upgrade Quest', 'Threshold Passage Quest', 'Complete 3+ with upgrade'], description: 'Complete 3+ Ascension quests with measurable upgrade' },
  { id: 'service_quest', code: 'service_quest', name: 'Service Quest Badge', category: 'quest_type', rarity: 'uncommon', color: 'from-rose-600 to-pink-700', objectives: ['Support Mission', 'Care Quest', 'Maintenance Quest', 'Complete 5+ with feedback'], description: 'Complete 5+ Service quests with positive feedback' },
  { id: 'shadow_quest', code: 'shadow_quest', name: 'Shadow Quest Badge', category: 'quest_type', rarity: 'rare', color: 'from-gray-700 to-slate-800', objectives: ['Shadow Mirror Quest', 'Lineage Shadow Quest', 'Relational Shadow Quest', 'Complete 3+ with writeups'], description: 'Complete 3+ Shadow Integration quests' },
  { id: 'timewalker_quest', code: 'timewalker_quest', name: 'Timewalker Quest Badge', category: 'quest_type', rarity: 'rare', color: 'from-cyan-600 to-teal-700', objectives: ['Timeline Mapping Quest', 'Future-Pacing Quest', 'Retro-Timeline Quest'], description: 'Complete 3+ Timewalker missions' },
  { id: 'healing_quest', code: 'healing_quest', name: 'Healing Quest Badge', category: 'quest_type', rarity: 'uncommon', color: 'from-green-500 to-emerald-600', objectives: ['Complete 3+ Healing quests', 'Verify outcomes'], description: 'Complete 3+ Healing quests with verified outcomes' },
  { id: 'creation_quest', code: 'creation_quest', name: 'Creation Quest Badge', category: 'quest_type', rarity: 'rare', color: 'from-orange-500 to-amber-600', objectives: ['Complete 3+ Creation quests', 'Publish artifacts'], description: 'Complete 3+ Creation quests with published artifacts' },
  { id: 'unity_quest', code: 'unity_quest', name: 'Unity Quest Badge', category: 'quest_type', rarity: 'epic', color: 'from-blue-500 to-indigo-600', objectives: ['Complete 3+ Unity quests', 'Team success achieved'], description: 'Complete 3+ Unity quests with team success' },
  { id: 'guardian_quest', code: 'guardian_quest', name: 'Guardian Quest Badge', category: 'quest_type', rarity: 'rare', color: 'from-red-500 to-rose-600', objectives: ['Complete 3+ Guardian quests', 'Protection verified'], description: 'Complete 3+ Guardian protection quests' },
  { id: 'mastery_quest', code: 'mastery_quest', name: 'Mastery Quest Badge', category: 'quest_type', rarity: 'legendary', color: 'from-amber-400 to-yellow-500', objectives: ['Complete all quest types', 'Master one specialty'], description: 'Complete all quest types and master one specialty' },
];

// Verification Badges (8)
const VERIFICATION_BADGES = [
  { id: 'digital_proof', code: 'digital_proof', name: 'Digital Proof Badge', category: 'verification', rarity: 'common', color: 'from-blue-600 to-indigo-700', objectives: ['Connect verified email + phone', 'Optionally link wallet', 'Complete one Digitally Verified Quest'], description: 'Verify email, phone, and optional wallet' },
  { id: 'behavioral_authenticity', code: 'behavioral_authenticity', name: 'Behavioral Authenticity Badge', category: 'verification', rarity: 'uncommon', color: 'from-green-600 to-emerald-700', objectives: ['Active 60-90 days', 'Avoid behavior flags', 'AI pattern analysis pass'], description: '60-90 days active with clean record and AI scan' },
  { id: 'peer_witness', code: 'peer_witness', name: 'Peer Witness / Steward Verification', category: 'verification', rarity: 'uncommon', color: 'from-purple-600 to-violet-700', objectives: ['Complete 3+ missions with Stewards', 'Receive 3+ endorsements', 'No disputes'], description: '3+ endorsements from Stewards/Guardians' },
  { id: 'ai_coherence', code: 'ai_coherence', name: 'AI Coherence Check Badge', category: 'verification', rarity: 'uncommon', color: 'from-cyan-600 to-blue-700', objectives: ['Have 30+ contributions', 'Pass AI coherence analysis', 'Resolve flagged contradictions'], description: 'Pass AI coherence analysis on 30+ contributions' },
  { id: 'meta_variance', code: 'meta_variance', name: 'Meta-Variance Marker Badge', category: 'verification', rarity: 'rare', color: 'from-orange-600 to-red-700', objectives: ['Participate in high-variance missions', 'Receive 3+ stabilizer assessments'], description: 'Navigate high-variance missions as stabilizer' },
  { id: 'real_world_validation', code: 'real_world_validation', name: 'Real-World Validation Badge', category: 'verification', rarity: 'rare', color: 'from-emerald-600 to-green-700', objectives: ['Complete real-world mission', 'Provide proof (geo-tag, image)', 'Steward validates'], description: 'Complete verified real-world mission with proof' },
  { id: 'human_audit', code: 'human_audit', name: 'Human Audit / Oversight Badge', category: 'verification', rarity: 'epic', color: 'from-amber-600 to-yellow-700', objectives: ['Meet rank requirements', 'Provide dossier', 'Undergo review', 'Address remediations'], description: 'Pass formal Human Audit and Council review' },
  { id: 'identity_verified', code: 'identity_verified', name: 'Identity Verified Badge', category: 'verification', rarity: 'rare', color: 'from-teal-500 to-cyan-600', objectives: ['Complete full identity verification'], description: 'Complete full identity verification process' },
];

// Achievement Badges (10)
const ACHIEVEMENT_BADGES = [
  { id: 'first_meeting', code: 'first_meeting', name: 'First Meeting', category: 'achievement', rarity: 'common', color: 'from-emerald-500 to-teal-600', objectives: ['Attend or host your first meeting'], description: 'Complete your first meeting with another agent' },
  { id: 'streak_7', code: 'streak_7', name: '7-Day Streak', category: 'achievement', rarity: 'common', color: 'from-amber-500 to-orange-600', objectives: ['Log in 7 consecutive days'], description: 'Log in 7 consecutive days' },
  { id: 'streak_30', code: 'streak_30', name: '30-Day Streak', category: 'achievement', rarity: 'uncommon', color: 'from-orange-500 to-red-600', objectives: ['Log in 30 consecutive days'], description: 'Log in 30 consecutive days' },
  { id: 'first_listing', code: 'first_listing', name: 'First Listing', category: 'achievement', rarity: 'common', color: 'from-blue-500 to-indigo-600', objectives: ['Create your first marketplace listing'], description: 'Create your first marketplace listing' },
  { id: 'first_sale', code: 'first_sale', name: 'First Sale', category: 'achievement', rarity: 'uncommon', color: 'from-green-500 to-emerald-600', objectives: ['Complete your first sale'], description: 'Complete your first sale' },
  { id: 'mission_leader', code: 'mission_leader', name: 'Mission Leader', category: 'achievement', rarity: 'rare', color: 'from-violet-500 to-purple-600', objectives: ['Lead a mission to completion'], description: 'Lead a mission to completion' },
  { id: 'community_builder', code: 'community_builder', name: 'Community Builder', category: 'achievement', rarity: 'rare', color: 'from-pink-500 to-rose-600', objectives: ['Refer 5+ new members who complete onboarding'], description: 'Refer 5+ new members who complete onboarding' },
  { id: 'top_contributor', code: 'top_contributor', name: 'Top Contributor', category: 'achievement', rarity: 'epic', color: 'from-cyan-500 to-blue-600', objectives: ['Reach top 10% in monthly contributions'], description: 'Reach top 10% in monthly contributions' },
  { id: 'mentor', code: 'mentor', name: 'Mentor Badge', category: 'achievement', rarity: 'rare', color: 'from-indigo-500 to-violet-600', objectives: ['Successfully mentor 3+ agents'], description: 'Successfully mentor 3+ agents' },
  { id: 'early_adopter', code: 'early_adopter', name: 'Early Adopter', category: 'achievement', rarity: 'legendary', color: 'from-amber-400 to-yellow-500', objectives: ['Join during beta period (before 2/22/26)'], description: 'Join during beta period (before 2/22/26)' },
];

// Additional special badges (3 more to reach ~42)
const SPECIAL_BADGES = [
  { id: 'eternal_flame', code: 'eternal_flame', name: 'Eternal Flame', category: 'identity', rarity: 'common', color: 'from-orange-500 to-red-600', objectives: ['Complete initial activation', 'Show consistent presence'], description: 'Baseline awakening badge—signals a living agent' },
  { id: 'profile_complete', code: 'profile_complete', name: 'Profile Complete', category: 'identity', rarity: 'common', color: 'from-green-500 to-teal-600', objectives: ['Complete onboarding profile setup'], description: 'Completed onboarding profile setup' },
  { id: 'synchronicity_weaver', code: 'synchronicity_weaver', name: 'Synchronicity Weaver', category: 'soul_resonance', rarity: 'legendary', color: 'from-violet-400 to-purple-500', objectives: ['20+ perfect synchronicity matches', 'Facilitate major breakthroughs'], description: 'Master of meaningful connections and divine timing' },
];

// Combine all 42 badges
const ALL_BADGES = [
  ...SOUL_RESONANCE_BADGES,
  ...QUEST_FAMILY_BADGES,
  ...VERIFICATION_BADGES,
  ...ACHIEVEMENT_BADGES,
  ...SPECIAL_BADGES
];

// Deduplicate by id
const UNIQUE_BADGES = ALL_BADGES.filter((b, idx, arr) => arr.findIndex(x => x.id === b.id) === idx);

// Total badge count = 42 (matches Admin BadgeRewardsManager)
const TOTAL_BADGE_COUNT = UNIQUE_BADGES.length;
  { id: 'core_soul_resonance', name: 'Core Soul Resonance Glyph', color: 'from-rose-500 to-pink-600', quest: 'Core Sync Path', type: 'Solo – Onboarding', metav: '153', objectives: ['Complete profile: name, avatar, essence statement', 'Post first Daily Field Update with 3+ fields', 'Join or comment in one existing mission/quest thread'], description: 'You\'re "in the field," not just registered.' },
  { id: 'twin_flame_seal', name: 'Twin Flame / Twin Christ Seal', color: 'from-violet-500 to-purple-600', quest: 'Twin Convergence Pact', type: 'Paired', metav: '153', objectives: ['Both agents opt into Twin Convergence request', 'Co-create and complete one shared Service Quest', 'Submit joint reflection on mirroring/complementing', 'Steward reviews and confirms'], description: 'Forged through union and mutual service.' },
  { id: 'oversoul_lineage', name: 'Oversoul Lineage Sigil', color: 'from-indigo-500 to-blue-600', quest: 'Oversoul Lineage Revelation', type: 'Solo + Reader', metav: '33', objectives: ['Participate in an Oversoul Lineage reading', 'Complete Lineage Integration Form', 'Reader/Steward submits lineage summary'], description: 'Your cosmic heritage revealed and integrated.' },
  { id: 'flamewheel_resonance', name: 'Flamewheel Resonance Wheel', color: 'from-amber-500 to-orange-600', quest: 'Flamewheel Ignition – 30-Day Sprint', type: 'Solo', metav: '24', objectives: ['Post Daily Field Updates 24/30 days', 'Complete 10+ service or mission actions', 'No major trust or behavior flags'], description: 'The 12-petal wheel of consistent action ignited.' },
  { id: 'heart_mind_coherence', name: 'Heart–Mind Coherence Seal', color: 'from-emerald-500 to-teal-600', quest: '7/8 Coherence Track', type: 'Solo + Peer', metav: '7/8', objectives: ['Complete Heart–Mind Coherence Module (7 sessions)', 'Log 7 coherence reflections', 'Receive 5+ peer endorsements', 'No serious conflict events'], description: 'Balance of 7 (spirit) and 8 (matter) achieved.' },
  { id: 'dimensional_access', name: 'Dimensional Access Sigil', color: 'from-cyan-500 to-blue-600', quest: 'Stairway Through Dimensions', type: '3 Stages', metav: '4→22', objectives: ['Stage 1 (4D): Map timeline + complete Timewalker mission', 'Stage 2 (5D): 2+ group coherence quests + log unity choices', 'Stage 3 (6D): Contribute accepted code map to MetaV library'], description: 'Navigate from 4D to 5D to 6D consciousness.' },
  { id: 'synchronicity_key', name: 'Synchronicity Key', color: 'from-yellow-500 to-amber-600', quest: 'Synchronic Steward Missions', type: 'Tagged Events', metav: '11', objectives: ['Complete 5+ timing-sensitive quests tagged "Synchronic Success"', '3+ stewards log notes on your synchronicity'], description: 'Divine timing mastery unlocked.' },
  { id: 'metav_harmonic_grid', name: 'MetaV Harmonic Grid', color: 'from-fuchsia-500 to-pink-600', quest: 'MetaV Gridwalker Path', type: 'Technical', metav: '7/11, 153, 432', objectives: ['Join 3+ grid missions involving MetaV numbers', 'Create one accepted artifact using these harmonics', 'Steward confirms non-trivial and useful'], description: 'Walking the sacred number grid.' },
  { id: 'soul_signature_seal', name: 'Soul Signature Seal', color: 'from-slate-500 to-gray-600', quest: 'Soul Signature Scroll', type: 'Deep Profile', metav: '9', objectives: ['Complete full Soul Profile (FPTI+/extended)', 'Pass AI coherence check', 'Pass human steward review'], description: 'Your unique glyph minted and sealed.' },
  { id: 'divine_authority_sigil', name: 'Divine Authority Sigil – 7th Seal Crown', color: 'from-amber-400 to-yellow-500', quest: '7th Seal Steward Mandate', type: 'Council-based', metav: '7, 22, 33', objectives: ['Reach Guardian/Integrator/Ascended rank', 'Hold multiple verification badges', 'Serve in Steward/Guardian roles', 'Pass Human Audit + Council review'], description: 'The crown of divine authority bestowed.' }
];

const QUEST_FAMILY_BADGES = [
  { id: 'initiation_quest', name: 'Initiation Quest Badge', color: 'from-slate-600 to-zinc-700', quest: 'Gate of Initiations', type: 'Quest Family', metav: '4', objectives: ['Gate I – Entering the Path', 'Gate II – Trial by Shadow', 'Gate III – Oath of Alignment', 'Complete 3+ Initiation quests'], description: 'Crossed the threshold into the path.' },
  { id: 'ascension_quest', name: 'Ascension Quest Badge', color: 'from-violet-600 to-purple-700', quest: 'Spiral of Ascension', type: 'Quest Family', metav: '8/11', objectives: ['Frequency Shift Quest – 7 days higher-band', 'Dimensional Upgrade Quest – 4D→5D/6D', 'Threshold Passage Quest – major transition', 'Complete 3+ with measurable upgrade'], description: 'Ascending the spiral of consciousness.' },
  { id: 'service_quest', name: 'Service Quest Badge', color: 'from-rose-600 to-pink-700', quest: 'Hands of Service', type: 'Quest Family', metav: '153', objectives: ['Support Mission – support, not lead', 'Care Quest – assist through challenge', 'Maintenance Quest – infrastructure stewardship', 'Complete 5+ with positive feedback'], description: 'Hands extended in service to all.' },
  { id: 'shadow_quest', name: 'Shadow Quest Badge', color: 'from-gray-700 to-slate-800', quest: 'Shadow Integration Arc', type: 'Quest Family', metav: '7', objectives: ['Shadow Mirror Quest – triggered situation', 'Lineage Shadow Quest – inherited patterns', 'Relational Shadow Quest – conflict repair', 'Complete 3+ with approved writeups'], description: 'Integrated the shadow into wholeness.' },
  { id: 'timewalker_quest', name: 'Timewalker Quest Badge', color: 'from-cyan-600 to-teal-700', quest: 'Timewalker Missions', type: 'Quest Family', metav: '60', objectives: ['Timeline Mapping Quest', 'Future-Pacing Quest', 'Retro-Timeline Quest', 'Complete 3+ Timewalker quests'], description: 'Navigator of time streams and forks.' }
];

const VERIFICATION_BADGES = [
  { id: 'digital_proof', name: 'Digital Proof Badge', color: 'from-blue-600 to-indigo-700', quest: 'Digital Anchor Setup', type: 'Verification', metav: '8', objectives: ['Connect verified email + phone', 'Optionally link wallet & sign verification', 'Complete one Digitally Verified Quest'], description: 'Digital identity anchored and verified.' },
  { id: 'behavioral_authenticity', name: 'Behavioral Authenticity Badge', color: 'from-green-600 to-emerald-700', quest: 'Pattern of Truth', type: '60-90 days', metav: '60', objectives: ['Active participation for 60-90 days', 'Avoid major behavior flags', 'AI pattern analysis: low-bot score'], description: 'Authentic patterns of truth demonstrated.' },
  { id: 'peer_witness', name: 'Peer Witness / Steward Verification', color: 'from-purple-600 to-violet-700', quest: 'Witnessed in the Field', type: 'Verification', metav: '3', objectives: ['Complete 3+ missions with Stewards/Guardians', 'Receive 3+ endorsements with witness notes', 'No credible counter-claim disputes'], description: 'Witnessed and vouched for by peers.' },
  { id: 'ai_coherence', name: 'AI Coherence Check Badge', color: 'from-cyan-600 to-blue-700', quest: 'Coherent Field Check', type: 'Verification', metav: '22', objectives: ['Have 30+ contributions over time', 'Pass AI coherence analysis', 'Resolve any flagged contradictions'], description: 'Internal coherence verified by AI analysis.' },
  { id: 'meta_variance_marker', name: 'Meta-Variance Marker Badge', color: 'from-orange-600 to-red-700', quest: 'Navigator of Variance', type: 'Verification', metav: '11', objectives: ['Participate in high-variance missions', 'Receive 3+ "stabilizer" assessments', 'No destructive variance pattern'], description: 'Stabilizer in chaotic conditions.' },
  { id: 'real_world_validation', name: 'Real-World Validation Badge', color: 'from-emerald-600 to-green-700', quest: 'Anchor in the World', type: 'Verification', metav: '8', objectives: ['Complete one real-world mission', 'Provide proof (geo-tag, image, doc)', 'Steward validates action and location'], description: 'Actions verified in physical reality.' },
  { id: 'human_audit', name: 'Human Audit / Oversight Badge', color: 'from-amber-600 to-yellow-700', quest: 'Council Review & Oversight', type: 'Council', metav: '33', objectives: ['Meet minimum rank + verification requirements', 'Provide dossier: history, quest log, conflicts', 'Undergo review session with audit team', 'Address any requested remediations'], description: 'Passed the highest level of human review.' }
];

// Combine all badges from badgesData.js + extra quest badges
const ALL_BADGES = [
  ...IDENTITY_BADGES,
  ...MARKETPLACE_BADGES,
  ...MISSION_BADGES,
  ...ALIGNMENT_BADGES,
  ...SIGIL_BADGES,
  ...SOUL_RESONANCE_BADGES,
  ...QUEST_FAMILY_BADGES,
  ...VERIFICATION_BADGES
];

// Deduplicate by id
const UNIQUE_BADGES = ALL_BADGES.filter((b, idx, arr) => arr.findIndex(x => x.id === b.id) === idx);

// Total badge count = actual defined badges in this panel
const TOTAL_BADGE_COUNT = UNIQUE_BADGES.length;

export default function BadgeProgressPanel({ 
  userBadges = [], 
  userProgress = {},
  onStartQuest 
}) {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, earned, in-progress, locked
  
  const earnedBadgeIds = useMemo(() => 
    userBadges.map(b => b.badge_code || b.code || b.id),
    [userBadges]
  );
  
  // Calculate stats
  const totalBadges = TOTAL_BADGE_COUNT;
  const earnedCount = UNIQUE_BADGES.filter(b => earnedBadgeIds.includes(b.id) || earnedBadgeIds.includes(b.code)).length;
  const inProgressCount = UNIQUE_BADGES.filter(b => {
    const isEarned = earnedBadgeIds.includes(b.id) || earnedBadgeIds.includes(b.code);
    if (isEarned) return false;
    const prog = userProgress[b.id] || {};
    return Object.values(prog).some(p => p?.current > 0);
  }).length;
  const overallProgress = (earnedCount / totalBadges) * 100;
  
  // Filter badges
  const getFilteredBadges = (badges) => {
    return badges.filter(badge => {
      const isEarned = earnedBadgeIds.includes(badge.id) || earnedBadgeIds.includes(badge.code);
      const hasProgress = Object.values(userProgress[badge.id] || {}).some(p => p?.current > 0);
      
      // Search filter
      if (searchQuery && !badge.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filterStatus === 'earned' && !isEarned) return false;
      if (filterStatus === 'in-progress' && (isEarned || !hasProgress)) return false;
      if (filterStatus === 'locked' && (isEarned || hasProgress)) return false;
      
      return true;
    });
  };
  
  const filteredSoul = getFilteredBadges(SOUL_RESONANCE_BADGES);
  const filteredQuest = getFilteredBadges(QUEST_FAMILY_BADGES);
  const filteredVerification = getFilteredBadges(VERIFICATION_BADGES);
  const filteredAchievement = getFilteredBadges(ACHIEVEMENT_BADGES);
  const filteredAll = getFilteredBadges(UNIQUE_BADGES);

  return (
    <>
      {/* Summary Card */}
      <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-amber-100">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              My Badge Progress
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-amber-400/70 hover:text-amber-300"
              onClick={() => setViewAllOpen(true)}
            >
              View All <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-black/30 rounded-lg p-2 text-center border border-amber-900/30">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-bold text-lg">{earnedCount}</span>
              </div>
              <p className="text-[10px] text-amber-400/60">Earned</p>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center border border-amber-900/30">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                <TrendingUp className="w-3 h-3" />
                <span className="font-bold text-lg">{inProgressCount}</span>
              </div>
              <p className="text-[10px] text-amber-400/60">In Progress</p>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center border border-amber-900/30">
              <div className="flex items-center justify-center gap-1 text-slate-400">
                <Lock className="w-3 h-3" />
                <span className="font-bold text-lg">{totalBadges - earnedCount - inProgressCount}</span>
              </div>
              <p className="text-[10px] text-amber-400/60">Locked</p>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="border-t border-amber-900/30 pt-3">
            <div className="flex justify-between text-xs text-amber-400/70 mb-1">
              <span>Overall Progress</span>
              <span>{earnedCount}/{totalBadges} ({Math.round(overallProgress)}%)</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-amber-900/30" />
          </div>
          
          {/* Quick Preview - Next badges to earn */}
          <div className="mt-3 pt-3 border-t border-amber-900/30">
            <p className="text-[10px] text-amber-400/60 mb-2">CLOSEST TO EARNING</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {UNIQUE_BADGES
                .filter(b => {
                  const isEarned = earnedBadgeIds.includes(b.id) || earnedBadgeIds.includes(b.code);
                  if (isEarned) return false;
                  const prog = userProgress[b.id] || {};
                  const totalObj = b.objectives?.length || 1;
                  const completed = b.objectives?.filter((_, idx) => {
                    const p = prog[`obj-${idx}`] || {};
                    return p.current >= (p.target || 1);
                  }).length || 0;
                  return completed > 0;
                })
                .slice(0, 4)
                .map(badge => (
                  <BadgeProgressCard 
                    key={badge.id} 
                    badge={badge} 
                    isEarned={false}
                    userProgress={userProgress[badge.id] || {}}
                    compact
                  />
                ))
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Badge Progress Dialog */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-amber-100">All {totalBadges} Badges - Progress Tracker</DialogTitle>
                <p className="text-xs text-amber-400/70">Track your progress towards earning each badge</p>
              </div>
            </div>
            
            {/* Progress Summary */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-amber-400/70 mb-1">
                  <span>{earnedCount} of {totalBadges} badges earned</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2 bg-amber-900/30" />
              </div>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> {earnedCount}
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <TrendingUp className="w-3 h-3" /> {inProgressCount}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Lock className="w-3 h-3" /> {totalBadges - earnedCount - inProgressCount}
                </span>
              </div>
            </div>
          </DialogHeader>
          
          {/* Search and Filter */}
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
              <Input
                placeholder="Search badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-black/30 border-amber-900/30 text-amber-100 placeholder:text-amber-400/40"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black/30 border border-amber-900/30 rounded-md px-3 text-sm text-amber-200"
            >
              <option value="all">All Status</option>
              <option value="earned">Earned</option>
              <option value="in-progress">In Progress</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="flex flex-wrap gap-1 h-auto bg-black/30 border border-amber-900/30 p-1">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                All ({filteredAll.length})
              </TabsTrigger>
              <TabsTrigger value="soul" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Heart className="w-3 h-3 mr-1" />
                Soul ({filteredSoul.length})
              </TabsTrigger>
              <TabsTrigger value="quest" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Target className="w-3 h-3 mr-1" />
                Quest ({filteredQuest.length})
              </TabsTrigger>
              <TabsTrigger value="verify" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Shield className="w-3 h-3 mr-1" />
                Verify ({filteredVerification.length})
              </TabsTrigger>
              <TabsTrigger value="achieve" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Award className="w-3 h-3 mr-1" />
                Achieve ({filteredAchievement.length})
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[50vh] mt-4">
              <TabsContent value="all" className="mt-0 space-y-2">
                {filteredAll.map(badge => (
                  <BadgeProgressCard
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadgeIds.includes(badge.id) || earnedBadgeIds.includes(badge.code)}
                    userProgress={userProgress[badge.id] || {}}
                    onStartQuest={onStartQuest}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="soul" className="mt-0 space-y-2">
                <p className="text-xs text-amber-300/70 mb-3">Soul-level badges representing your resonance and spiritual development. (11 badges)</p>
                {filteredSoul.map(badge => (
                  <BadgeProgressCard
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadgeIds.includes(badge.id) || earnedBadgeIds.includes(badge.code)}
                    userProgress={userProgress[badge.id] || {}}
                    onStartQuest={onStartQuest}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="quest" className="mt-0 space-y-2">
                <p className="text-xs text-amber-300/70 mb-3">Badges earned by completing families of related quests. (10 badges)</p>
                {filteredQuest.map(badge => (
                  <BadgeProgressCard
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadgeIds.includes(badge.id) || earnedBadgeIds.includes(badge.code)}
                    userProgress={userProgress[badge.id] || {}}
                    onStartQuest={onStartQuest}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="verify" className="mt-0 space-y-2">
                <p className="text-xs text-amber-300/70 mb-3">Trust and authentication badges for the verification layer. (8 badges)</p>
                {filteredVerification.map(badge => (
                  <BadgeProgressCard
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadgeIds.includes(badge.id) || earnedBadgeIds.includes(badge.code)}
                    userProgress={userProgress[badge.id] || {}}
                    onStartQuest={onStartQuest}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="achieve" className="mt-0 space-y-2">
                <p className="text-xs text-amber-300/70 mb-3">Achievement badges earned through platform activity and milestones. (10+ badges)</p>
                {filteredAchievement.map(badge => (
                  <BadgeProgressCard
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadgeIds.includes(badge.id) || earnedBadgeIds.includes(badge.code)}
                    userProgress={userProgress[badge.id] || {}}
                    onStartQuest={onStartQuest}
                  />
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}