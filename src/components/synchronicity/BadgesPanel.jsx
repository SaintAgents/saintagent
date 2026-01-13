import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Award, ChevronDown, Lock, Crown, Heart, Target, Shield,
  Users, Eye, Zap, Activity, Grid3X3, Key, Compass, Fingerprint,
  UserCheck, Bot, MapPin, Scale, Sparkles, CheckCircle2, Circle, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BADGE_INDEX, QUEST_BADGE_IMAGES } from '@/components/badges/badgesData';

// Soul Resonance Badges (10)
const SOUL_RESONANCE_BADGES = [
  { id: 'core_soul_resonance', name: 'Core Soul Resonance Glyph', icon: Heart, color: 'from-rose-500 to-pink-600', quest: 'Core Sync Path', type: 'Solo – Onboarding Arc', metav: '153', objectives: ['Complete profile: name, avatar, essence statement', 'Post first Daily Field Update with 3+ fields', 'Join or comment in one existing mission/quest thread'], description: 'You\'re "in the field," not just registered.' },
  { id: 'twin_flame_seal', name: 'Twin Flame / Twin Christ Seal', icon: Users, color: 'from-violet-500 to-purple-600', quest: 'Twin Convergence Pact', type: 'Paired – Two accounts', metav: '153', objectives: ['Both agents opt into Twin Convergence request', 'Co-create and complete one shared Service Quest', 'Submit joint reflection on mirroring/complementing', 'Steward reviews and confirms'], description: 'Forged through union and mutual service.' },
  { id: 'oversoul_lineage', name: 'Oversoul Lineage Sigil', icon: Eye, color: 'from-indigo-500 to-blue-600', quest: 'Oversoul Lineage Revelation', type: 'Solo, with Reader/Steward', metav: '33', objectives: ['Participate in an Oversoul Lineage reading', 'Complete Lineage Integration Form', 'Reader/Steward submits lineage summary'], description: 'Your cosmic heritage revealed and integrated.' },
  { id: 'flamewheel_resonance', name: 'Flamewheel Resonance Wheel', icon: Zap, color: 'from-amber-500 to-orange-600', quest: 'Flamewheel Ignition – 30-Day Sprint', type: 'Solo, performance-based', metav: '24', objectives: ['Post Daily Field Updates 24/30 days', 'Complete 10+ service or mission actions', 'No major trust or behavior flags'], description: 'The 12-petal wheel of consistent action ignited.' },
  { id: 'heart_mind_coherence', name: 'Heart–Mind Coherence Seal', icon: Activity, color: 'from-emerald-500 to-teal-600', quest: '7/8 Coherence Track', type: 'Solo + Peer Feedback', metav: '7/8', objectives: ['Complete Heart–Mind Coherence Module (7 sessions)', 'Log 7 coherence reflections', 'Receive 5+ peer endorsements', 'No serious conflict events'], description: 'Balance of 7 (spirit) and 8 (matter) achieved.' },
  { id: 'dimensional_access', name: 'Dimensional Access Sigil', icon: Grid3X3, color: 'from-cyan-500 to-blue-600', quest: 'Stairway Through Dimensions', type: 'Solo, staged modules (3 stages)', metav: '4→22', objectives: ['Stage 1 (4D): Map timeline + complete Timewalker mission', 'Stage 2 (5D): 2+ group coherence quests + log unity choices', 'Stage 3 (6D): Contribute accepted code map to MetaV library'], description: 'Navigate from 4D to 5D to 6D consciousness.' },
  { id: 'synchronicity_key', name: 'Synchronicity Key', icon: Key, color: 'from-yellow-500 to-amber-600', quest: 'Synchronic Steward Missions', type: 'Solo/Team, tagged events', metav: '11', objectives: ['Complete 5+ timing-sensitive quests tagged "Synchronic Success"', '3+ stewards log notes on your synchronicity'], description: 'Divine timing mastery unlocked.' },
  { id: 'metav_harmonic_grid', name: 'MetaV Harmonic Grid', icon: Compass, color: 'from-fuchsia-500 to-pink-600', quest: 'MetaV Gridwalker Path', type: 'Solo/Team, technical/esoteric', metav: '7/11, 153, 432', objectives: ['Join 3+ grid missions involving MetaV numbers', 'Create one accepted artifact using these harmonics', 'Steward confirms non-trivial and useful'], description: 'Walking the sacred number grid.' },
  { id: 'soul_signature_seal', name: 'Soul Signature Seal', icon: Fingerprint, color: 'from-slate-500 to-gray-600', quest: 'Soul Signature Scroll', type: 'Solo, deep profile', metav: '9', objectives: ['Complete full Soul Profile (FPTI+/extended)', 'Pass AI coherence check', 'Pass human steward review'], description: 'Your unique glyph minted and sealed.' },
  { id: 'divine_authority_sigil', name: 'Divine Authority Sigil – 7th Seal Crown', icon: Crown, color: 'from-amber-400 to-yellow-500', quest: '7th Seal Steward Mandate', type: 'Invite-only, Council-based', metav: '7, 22, 33', objectives: ['Reach Guardian/Integrator/Ascended rank', 'Hold multiple verification badges', 'Serve in Steward/Guardian roles', 'Pass Human Audit + Council review'], description: 'The crown of divine authority bestowed.' }
];

// Quest Family Badges (5)
const QUEST_FAMILY_BADGES = [
  { id: 'initiation_quest', name: 'Initiation Quest Badge', icon: Target, color: 'from-slate-600 to-zinc-700', quest: 'Gate of Initiations', type: 'Quest Family', metav: '4', objectives: ['Gate I – Entering the Path: clarify mission & boundaries', 'Gate II – Trial by Shadow: face limiting pattern', 'Gate III – Oath of Alignment: define code of conduct', 'Complete 3+ Initiation quests'], description: 'Crossed the threshold into the path.' },
  { id: 'ascension_quest', name: 'Ascension Quest Badge', icon: Sparkles, color: 'from-violet-600 to-purple-700', quest: 'Spiral of Ascension', type: 'Quest Family', metav: '8/11', objectives: ['Frequency Shift Quest – 7 days higher-band operation', 'Dimensional Upgrade Quest – 4D→5D/6D response', 'Threshold Passage Quest – major transition', 'Complete 3+ Ascension quests with measurable upgrade'], description: 'Ascending the spiral of consciousness.' },
  { id: 'service_quest', name: 'Service Quest Badge', icon: Heart, color: 'from-rose-600 to-pink-700', quest: 'Hands of Service', type: 'Quest Family', metav: '153', objectives: ['Support Mission – support, not lead', 'Care Quest – assist through challenging phase', 'Maintenance Quest – infrastructure stewardship', 'Complete 5+ Service quests with positive feedback'], description: 'Hands extended in service to all.' },
  { id: 'shadow_quest', name: 'Shadow Quest Badge', icon: Eye, color: 'from-gray-700 to-slate-800', quest: 'Shadow Integration Arc', type: 'Quest Family', metav: '7', objectives: ['Shadow Mirror Quest – work through triggered situation', 'Lineage Shadow Quest – explore inherited patterns', 'Relational Shadow Quest – conscious conflict repair', 'Complete 3+ Shadow quests with approved writeups'], description: 'Integrated the shadow into wholeness.' },
  { id: 'timewalker_quest', name: 'Timewalker Quest Badge', icon: Compass, color: 'from-cyan-600 to-teal-700', quest: 'Timewalker Missions', type: 'Quest Family', metav: '60', objectives: ['Timeline Mapping Quest – map major timelines', 'Future-Pacing Quest – create & act on future state', 'Retro-Timeline Quest – reframe past event', 'Complete 3+ Timewalker quests'], description: 'Navigator of time streams and forks.' }
];

// Verification Badges (7)
const VERIFICATION_BADGES = [
  { id: 'digital_proof', name: 'Digital Proof Badge', icon: Shield, color: 'from-blue-600 to-indigo-700', quest: 'Digital Anchor Setup', type: 'Verification', metav: '8', objectives: ['Connect verified email + phone', 'Optionally link wallet & sign verification', 'Complete one Digitally Verified Quest'], description: 'Digital identity anchored and verified.' },
  { id: 'behavioral_authenticity', name: 'Behavioral Authenticity Badge', icon: UserCheck, color: 'from-green-600 to-emerald-700', quest: 'Pattern of Truth', type: 'Verification (60-90 days)', metav: '60', objectives: ['Maintain active participation for 60-90 days', 'Avoid major behavior flags', 'AI pattern analysis returns low-bot score'], description: 'Authentic patterns of truth demonstrated.' },
  { id: 'peer_witness', name: 'Peer Witness / Steward Verification', icon: Users, color: 'from-purple-600 to-violet-700', quest: 'Witnessed in the Field', type: 'Verification', metav: '3', objectives: ['Complete 3+ missions with Stewards/Guardians', 'Receive 3+ endorsements with witness notes', 'No credible counter-claim disputes'], description: 'Witnessed and vouched for by peers.' },
  { id: 'ai_coherence', name: 'AI Coherence Check Badge', icon: Bot, color: 'from-cyan-600 to-blue-700', quest: 'Coherent Field Check', type: 'Verification', metav: '22', objectives: ['Have 30+ contributions over time', 'Pass AI coherence analysis', 'Resolve any flagged contradictions'], description: 'Internal coherence verified by AI analysis.' },
  { id: 'meta_variance_marker', name: 'Meta-Variance Marker Badge', icon: Activity, color: 'from-orange-600 to-red-700', quest: 'Navigator of Variance', type: 'Verification', metav: '11', objectives: ['Participate in high-variance missions', 'Receive 3+ "stabilizer" assessments', 'No pattern of causing destructive variance'], description: 'Stabilizer in chaotic conditions.' },
  { id: 'real_world_validation', name: 'Real-World Validation Badge', icon: MapPin, color: 'from-emerald-600 to-green-700', quest: 'Anchor in the World', type: 'Verification', metav: '8', objectives: ['Complete one real-world mission', 'Provide proof (geo-tag, image, signed doc)', 'Steward validates action and location'], description: 'Actions verified in physical reality.' },
  { id: 'human_audit', name: 'Human Audit / Oversight Badge', icon: Scale, color: 'from-amber-600 to-yellow-700', quest: 'Council Review & Oversight Track', type: 'Verification (Council)', metav: '33', objectives: ['Meet minimum rank + verification requirements', 'Provide dossier: mission history, quest log, conflicts', 'Undergo review session with audit team', 'Address any requested remediations'], description: 'Passed the highest level of human review.' }
];

// Achievement/Quest Badges (from original badgesData)
const ACHIEVEMENT_BADGES = [
  { id: 'first_meeting', code: 'first_meeting', name: 'First Meeting', rarity: 'common', description: 'Took the first step into connection.' },
  { id: 'audit_expert', code: 'audit_expert', name: 'Audit Expert', rarity: 'rare', description: 'Master of verification and quality assurance.' },
  { id: 'streak_7', code: 'streak_7', name: '7-Day Streak', rarity: 'common', description: 'Consistency and dedication to daily practice.' },
  { id: 'top_mentor', code: 'top_mentor', name: 'Top Mentor', rarity: 'epic', description: 'Guide and teacher who uplifts others.' },
  { id: 'ascended_tier', code: 'ascended_tier', name: 'Ascended Tier', rarity: 'epic', description: 'Reached elevated rank status.' },
  { id: 'social_butterfly', code: 'social_butterfly', name: 'Social Butterfly', rarity: 'rare', description: 'Community connector and relationship builder.' },
  { id: 'mission_master', code: 'mission_master', name: 'Mission Master', rarity: 'epic', description: 'Completed major platform objectives.' },
  { id: 'trust_anchor', code: 'trust_anchor', name: 'Trust Anchor', rarity: 'epic', description: 'Pillar of reliability and integrity.' },
  { id: 'synchronicity_weaver', code: 'synchronicity_weaver', name: 'Synchronicity Weaver', rarity: 'legendary', description: 'Master of meaningful connections and divine timing.' },
  { id: 'eternal_flame', code: 'eternal_flame', name: 'Eternal Flame', rarity: 'common', description: 'Baseline awakening badge—signals a living agent.' },
];

const ALL_BADGES = [...SOUL_RESONANCE_BADGES, ...QUEST_FAMILY_BADGES, ...VERIFICATION_BADGES, ...ACHIEVEMENT_BADGES];
// Total hardcoded badges: 10 + 5 + 7 + 10 = 32

// Rarity glow effects
const RARITY_GLOW = {
  common: 'shadow-slate-400/30',
  uncommon: 'shadow-emerald-400/40',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-violet-400/60',
  legendary: 'shadow-amber-400/70',
};

// Rarity color gradients for fallback
const RARITY_COLORS = {
  common: 'from-slate-500 to-slate-400',
  uncommon: 'from-emerald-500 to-green-400',
  rare: 'from-blue-500 to-cyan-400',
  epic: 'from-violet-500 to-purple-400',
  legendary: 'from-amber-400 to-yellow-300',
};

function BadgeIcon({ badge, size = 'md', locked = false }) {
  const code = badge?.badge_code || badge?.code;
  const def = BADGE_INDEX[code] || {};
  const rarity = def.rarity || 'common';
  const imageUrl = QUEST_BADGE_IMAGES[code];
  
  const sizeClasses = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';

  return (
    <motion.div
      whileHover={{ scale: locked ? 1 : 1.1 }}
      className={`relative ${sizeClasses} rounded-full flex items-center justify-center shadow-lg ${RARITY_GLOW[rarity]} ${locked ? 'opacity-30 grayscale' : ''}`}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={def.label || code}
          className="w-full h-full object-contain drop-shadow-lg"
          data-no-filter="true"
        />
      ) : (
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${RARITY_COLORS[rarity]} flex items-center justify-center`}>
          <Award className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
      )}
      {locked && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          <Lock className="w-4 h-4 text-white/70" />
        </div>
      )}
    </motion.div>
  );
}

function AscensionBadgeCard({ badge, isEarned, onSelect }) {
  const Icon = badge.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(badge)}
            className={`
              relative cursor-pointer rounded-xl p-2 border-2 transition-all
              ${isEarned 
                ? 'border-amber-400 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 shadow-lg shadow-amber-500/20' 
                : 'border-amber-900/30 bg-black/30 hover:border-amber-700/50 hover:bg-black/40'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-full bg-gradient-to-br ${badge.color} 
              flex items-center justify-center mx-auto mb-1.5
              ${isEarned ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0d1a0d]' : 'opacity-50'}
            `}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-[10px] text-center font-medium line-clamp-2 ${isEarned ? 'text-amber-200' : 'text-amber-400/50'}`}>
              {badge.name.split(' ').slice(0, 2).join(' ')}
            </p>
            {isEarned && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-900" />
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <span className="text-[8px] bg-slate-800 text-amber-400 px-1 py-0.5 rounded font-mono">
                {badge.metav}
              </span>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-[#1a2f1a] text-amber-100 border border-amber-900/50">
          <p className="font-semibold text-amber-200">{badge.name}</p>
          <p className="text-xs text-amber-300/70">{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function BadgeDetailModal({ badge, onClose }) {
  if (!badge) return null;
  const Icon = badge.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border border-amber-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center shrink-0`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-amber-100">{badge.name}</h3>
            <p className="text-sm text-amber-300/70">{badge.description}</p>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-xl p-4 mb-4 border border-amber-900/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-200">{badge.quest}</span>
          </div>
          <div className="flex gap-2 mb-3">
            <Badge variant="outline" className="text-xs border-amber-700 text-amber-300">{badge.type}</Badge>
            <Badge className="text-xs bg-slate-800 text-amber-400">MetaV: {badge.metav}</Badge>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-amber-200 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Objectives
          </h4>
          <ul className="space-y-2">
            {badge.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-300/80">
                <Circle className="w-3 h-3 mt-1.5 text-amber-600 shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 border-amber-700 text-amber-300 hover:bg-amber-900/20" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            Start Quest
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BadgesPanel({ badges = [] }) {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [activeTab, setActiveTab] = useState('soul');
  
  // Fetch badge definitions from database
  const { data: badgeDefinitions = [] } = useQuery({
    queryKey: ['badgeDefinitions'],
    queryFn: () => base44.entities.BadgeDefinition.filter({ is_active: true }, 'sort_order', 100)
  });
  
  const earnedBadgeCodes = badges.map(b => b.badge_code || b.code);
  const earnedBadgeIds = badges.map(b => b.badge_code || b.code || b.id);
  
  // Total badges = hardcoded (Soul:10 + Quest:5 + Verify:7) = 22 + database definitions
  // But we only count the 22 ascension badges in the main grid, DB badges shown separately
  const totalBadges = SOUL_RESONANCE_BADGES.length + QUEST_FAMILY_BADGES.length + VERIFICATION_BADGES.length; // 22
  
  // Count earned from the 22-badge ascension grid only
  const ascensionBadgeIds = [
    ...SOUL_RESONANCE_BADGES.map(b => b.id),
    ...QUEST_FAMILY_BADGES.map(b => b.id),
    ...VERIFICATION_BADGES.map(b => b.id)
  ];
  const earnedFromGrid = ascensionBadgeIds.filter(code => 
    earnedBadgeIds.includes(code) || earnedBadgeCodes.includes(code)
  ).length;
  const progress = (earnedFromGrid / totalBadges) * 100;
  
  const displayBadges = badges.slice(0, 5);

  return (
    <>
      <Card className="bg-[#050505] border-[rgba(0,255,136,0.3)] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-[#00ff88]">
              <div className="p-1.5 rounded-lg bg-[rgba(0,255,136,0.2)]">
                <Crown className="w-4 h-4 text-[#00ff88]" />
                </div>
                Soul Resonance Path • Quest Families • Verification Tracks
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-[rgba(0,255,136,0.7)] hover:text-[#00ff88] h-auto py-1"
              onClick={() => setViewAllOpen(true)}
            >
              View All <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {/* Badge Preview Grid */}
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {displayBadges.length > 0 ? (
              displayBadges.map((badge, i) => (
                <BadgeIcon key={badge.id || i} badge={badge} size="sm" />
              ))
            ) : (
              // Show locked placeholders from the badge grid
              SOUL_RESONANCE_BADGES.slice(0, 5).map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center opacity-30">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                );
              })
            )}
          </div>

          {/* Progress */}
          <div className="border-t border-[rgba(0,255,136,0.2)] pt-3">
            <div className="flex justify-between text-xs text-[rgba(0,255,136,0.7)] mb-1">
              <span>Ascension Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-[rgba(0,255,136,0.2)]" />
            <p className="text-center text-sm text-[#00ff88] mt-2">
              <span className="font-bold">{earnedFromGrid}</span>
              <span className="text-[rgba(0,255,136,0.5)]"> / {totalBadges} COLLECTED</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* View All Dialog - 22-Badge Ascension Grid */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-amber-100">{totalBadges}-Badge Ascension Grid</DialogTitle>
                <p className="text-xs text-amber-400/70">Soul Resonance • Quest Families • Verification Tracks</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-amber-400/70 mb-1">
                <span>Progress</span>
                <span>{earnedFromGrid}/{totalBadges} ({Math.round(progress)}%)</span>
              </div>
              <Progress value={progress} className="h-2 bg-amber-900/30" />
            </div>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4 bg-black/30 border border-amber-900/30">
              <TabsTrigger value="soul" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Heart className="w-3 h-3 mr-1" />
                Soul (10)
              </TabsTrigger>
              <TabsTrigger value="family" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Target className="w-3 h-3 mr-1" />
                Quests (5)
              </TabsTrigger>
              <TabsTrigger value="verification" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Shield className="w-3 h-3 mr-1" />
                Verify (7)
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-200 text-amber-400/70">
                <Award className="w-3 h-3 mr-1" />
                DB ({badgeDefinitions.length})
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-80 mt-4">
              <TabsContent value="soul" className="mt-0">
                <p className="text-xs text-amber-300/70 mb-3">Core badges representing your soul's resonance and spiritual development.</p>
                <div className="grid grid-cols-5 gap-2">
                  {SOUL_RESONANCE_BADGES.map((badge) => (
                    <AscensionBadgeCard
                      key={badge.id}
                      badge={badge}
                      isEarned={earnedBadgeIds.includes(badge.id)}
                      onSelect={setSelectedBadge}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="family" className="mt-0">
                <p className="text-xs text-amber-300/70 mb-3">Badges earned by completing families of related quests.</p>
                <div className="grid grid-cols-5 gap-2">
                  {QUEST_FAMILY_BADGES.map((badge) => (
                    <AscensionBadgeCard
                      key={badge.id}
                      badge={badge}
                      isEarned={earnedBadgeIds.includes(badge.id)}
                      onSelect={setSelectedBadge}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="verification" className="mt-0">
                <p className="text-xs text-amber-300/70 mb-3">Trust and authentication badges verifying your identity and behavior.</p>
                <div className="grid grid-cols-4 gap-2">
                  {VERIFICATION_BADGES.map((badge) => (
                    <AscensionBadgeCard
                      key={badge.id}
                      badge={badge}
                      isEarned={earnedBadgeIds.includes(badge.id)}
                      onSelect={setSelectedBadge}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-0">
                <p className="text-xs text-amber-300/70 mb-3">Achievement badges from the database including identity, achievement, and other categories.</p>
                <div className="grid grid-cols-5 gap-2">
                  {/* Show database badge definitions */}
                  {badgeDefinitions.map((badge) => {
                    const isEarned = earnedBadgeIds.includes(badge.badge_code) || earnedBadgeCodes.includes(badge.badge_code);
                    const imageUrl = badge.icon_url || QUEST_BADGE_IMAGES[badge.badge_code];
                    return (
                      <TooltipProvider key={badge.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                              className={`
                                relative cursor-pointer rounded-xl p-2 border-2 transition-all
                                ${isEarned 
                                  ? 'border-amber-400 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 shadow-lg shadow-amber-500/20' 
                                  : 'border-amber-900/30 bg-black/30 hover:border-amber-700/50 hover:bg-black/40'}
                              `}
                            >
                              <div className={`w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center ${isEarned ? '' : 'opacity-50 grayscale'}`}>
                                {imageUrl ? (
                                  <img src={imageUrl} alt={badge.badge_name} className="w-full h-full object-contain" data-no-filter="true" />
                                ) : (
                                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${RARITY_COLORS[badge.rarity] || RARITY_COLORS.common} flex items-center justify-center`}>
                                    <Award className="w-5 h-5 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className={`text-[10px] text-center font-medium line-clamp-2 ${isEarned ? 'text-amber-200' : 'text-amber-400/50'}`}>
                                {badge.badge_name}
                              </p>
                              {isEarned && (
                                <div className="absolute -top-1 -right-1">
                                  <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-900" />
                                </div>
                              )}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                <span className={`text-[8px] px-1 py-0.5 rounded capitalize ${
                                  badge.rarity === 'legendary' ? 'bg-amber-500/30 text-amber-300' :
                                  badge.rarity === 'epic' ? 'bg-violet-500/30 text-violet-300' :
                                  badge.rarity === 'rare' ? 'bg-blue-500/30 text-blue-300' :
                                  badge.rarity === 'uncommon' ? 'bg-emerald-500/30 text-emerald-300' :
                                  'bg-slate-500/30 text-slate-300'
                                }`}>
                                  {badge.rarity}
                                </span>
                              </div>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs bg-[#1a2f1a] text-amber-100 border border-amber-900/50">
                            <p className="font-semibold text-amber-200">{badge.badge_name}</p>
                            <p className="text-xs text-amber-300/70">{badge.description}</p>
                            {badge.ggg_reward > 0 && (
                              <p className="text-xs text-emerald-400 mt-1">+{badge.ggg_reward} GGG</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
    </>
  );
}