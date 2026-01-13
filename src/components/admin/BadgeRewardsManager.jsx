import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, Plus, Edit, Trash2, Zap, Coins, Search,
  Sparkles, Shield, Target, CheckCircle, Star
} from "lucide-react";
import { GGG_TO_USD, formatGGGSmart } from '@/components/earnings/gggMatrix';

// Default GGG rewards by rarity
const RARITY_DEFAULTS = {
  common: 0.01,
  uncommon: 0.025,
  rare: 0.05,
  epic: 0.1,
  legendary: 0.25
};

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700 border-slate-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300'
};

const CATEGORY_CONFIG = {
  soul_resonance: { label: 'Soul Resonance', icon: Sparkles, color: 'text-violet-500' },
  quest_type: { label: 'Quest Type', icon: Target, color: 'text-emerald-500' },
  verification: { label: 'Verification', icon: Shield, color: 'text-blue-500' },
  identity: { label: 'Identity', icon: Star, color: 'text-amber-500' },
  marketplace: { label: 'Marketplace', icon: Coins, color: 'text-green-500' },
  mission: { label: 'Mission', icon: Target, color: 'text-rose-500' },
  alignment: { label: 'Alignment', icon: CheckCircle, color: 'text-cyan-500' },
  achievement: { label: 'Achievement', icon: Award, color: 'text-orange-500' },
  streak: { label: 'Streak', icon: Zap, color: 'text-yellow-500' },
  social: { label: 'Social', icon: Star, color: 'text-pink-500' },
  agent: { label: 'Agent', icon: Shield, color: 'text-indigo-500' },
  security: { label: 'Security', icon: Shield, color: 'text-red-500' }
};

// Default badge definitions for seeding
const DEFAULT_BADGES = [
  // Soul Resonance Badges (11)
  { badge_code: 'core_soul_resonance', badge_name: 'Core Soul Resonance Glyph', category: 'soul_resonance', rarity: 'uncommon', ggg_reward: 0.025, description: 'Complete profile and first Daily Field Update', quest_type: 'solo' },
  { badge_code: 'twin_flame_seal', badge_name: 'Twin Flame / Twin Christ Seal', category: 'soul_resonance', rarity: 'epic', ggg_reward: 0.1, description: 'Complete Twin Convergence Pact with another agent', quest_type: 'paired' },
  { badge_code: 'oversoul_lineage', badge_name: 'Oversoul Lineage Sigil', category: 'soul_resonance', rarity: 'rare', ggg_reward: 0.05, description: 'Complete Oversoul Lineage reading and integration', quest_type: 'solo' },
  { badge_code: 'flamewheel_resonance', badge_name: 'Flamewheel Resonance Wheel', category: 'soul_resonance', rarity: 'rare', ggg_reward: 0.05, description: '30-day sprint: 24+ Daily Updates and 10+ service actions', quest_type: 'solo' },
  { badge_code: 'heart_mind_coherence', badge_name: 'Heart-Mind Coherence Seal', category: 'soul_resonance', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 7/8 Coherence Track with peer endorsements', quest_type: 'solo' },
  { badge_code: 'dimensional_access', badge_name: 'Dimensional Access Sigil', category: 'soul_resonance', rarity: 'epic', ggg_reward: 0.1, description: 'Complete 4D→5D→6D dimensional questline', quest_type: 'solo' },
  { badge_code: 'synchronicity_key', badge_name: 'Synchronicity Key', category: 'soul_resonance', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 5+ timing-sensitive quests with recognition', quest_type: 'solo' },
  { badge_code: 'metav_harmonic_grid', badge_name: 'MetaV Harmonic Grid', category: 'soul_resonance', rarity: 'epic', ggg_reward: 0.1, description: 'Participate in grid missions and create accepted artifact', quest_type: 'solo' },
  { badge_code: 'soul_signature', badge_name: 'Soul Signature Seal', category: 'soul_resonance', rarity: 'legendary', ggg_reward: 0.25, description: 'Complete full Soul Profile with AI and human review', quest_type: 'solo' },
  { badge_code: 'divine_authority', badge_name: 'Divine Authority Sigil - 7th Seal Crown', category: 'soul_resonance', rarity: 'legendary', ggg_reward: 0.5, description: 'Council appointment as Guardian/Steward', quest_type: 'solo' },
  { badge_code: 'akashic_record', badge_name: 'Akashic Record Keeper', category: 'soul_resonance', rarity: 'epic', ggg_reward: 0.1, description: 'Access and document insights from the Akashic Records', quest_type: 'solo' },
  
  // Quest Type Badges (10)
  { badge_code: 'initiation_quest', badge_name: 'Initiation Quest Badge', category: 'quest_type', rarity: 'uncommon', ggg_reward: 0.025, description: 'Complete 3+ Initiation quests', quest_type: 'solo' },
  { badge_code: 'ascension_quest', badge_name: 'Ascension Quest Badge', category: 'quest_type', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 3+ Ascension quests with measurable upgrade', quest_type: 'solo' },
  { badge_code: 'service_quest', badge_name: 'Service Quest Badge', category: 'quest_type', rarity: 'uncommon', ggg_reward: 0.025, description: 'Complete 5+ Service quests with positive feedback', quest_type: 'solo' },
  { badge_code: 'shadow_quest', badge_name: 'Shadow Quest Badge', category: 'quest_type', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 3+ Shadow Integration quests', quest_type: 'solo' },
  { badge_code: 'timewalker_quest', badge_name: 'Timewalker Quest Badge', category: 'quest_type', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 3+ Timewalker missions', quest_type: 'solo' },
  { badge_code: 'healing_quest', badge_name: 'Healing Quest Badge', category: 'quest_type', rarity: 'uncommon', ggg_reward: 0.025, description: 'Complete 3+ Healing quests with verified outcomes', quest_type: 'solo' },
  { badge_code: 'creation_quest', badge_name: 'Creation Quest Badge', category: 'quest_type', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 3+ Creation quests with published artifacts', quest_type: 'solo' },
  { badge_code: 'unity_quest', badge_name: 'Unity Quest Badge', category: 'quest_type', rarity: 'epic', ggg_reward: 0.1, description: 'Complete 3+ Unity quests with team success', quest_type: 'team' },
  { badge_code: 'guardian_quest', badge_name: 'Guardian Quest Badge', category: 'quest_type', rarity: 'rare', ggg_reward: 0.05, description: 'Complete 3+ Guardian protection quests', quest_type: 'solo' },
  { badge_code: 'mastery_quest', badge_name: 'Mastery Quest Badge', category: 'quest_type', rarity: 'legendary', ggg_reward: 0.25, description: 'Complete all quest types and master one specialty', quest_type: 'solo' },
  
  // Verification Badges (8)
  { badge_code: 'digital_proof', badge_name: 'Digital Proof Badge', category: 'verification', rarity: 'common', ggg_reward: 0.01, description: 'Verify email, phone, and optional wallet', quest_type: 'solo' },
  { badge_code: 'behavioral_authenticity', badge_name: 'Behavioral Authenticity Badge', category: 'verification', rarity: 'uncommon', ggg_reward: 0.025, description: '60-90 days active with clean record and AI scan', quest_type: 'solo' },
  { badge_code: 'peer_witness', badge_name: 'Peer Witness / Steward Verification', category: 'verification', rarity: 'uncommon', ggg_reward: 0.025, description: '3+ endorsements from Stewards/Guardians', quest_type: 'solo' },
  { badge_code: 'ai_coherence', badge_name: 'AI Coherence Check Badge', category: 'verification', rarity: 'uncommon', ggg_reward: 0.025, description: 'Pass AI coherence analysis on 30+ contributions', quest_type: 'solo' },
  { badge_code: 'meta_variance', badge_name: 'Meta-Variance Marker Badge', category: 'verification', rarity: 'rare', ggg_reward: 0.05, description: 'Navigate high-variance missions as stabilizer', quest_type: 'solo' },
  { badge_code: 'real_world_validation', badge_name: 'Real-World Validation Badge', category: 'verification', rarity: 'rare', ggg_reward: 0.05, description: 'Complete verified real-world mission with proof', quest_type: 'solo' },
  { badge_code: 'human_audit', badge_name: 'Human Audit / Oversight Badge', category: 'verification', rarity: 'epic', ggg_reward: 0.1, description: 'Pass formal Human Audit and Council review', quest_type: 'solo' },
  { badge_code: 'identity_verified', badge_name: 'Identity Verified Badge', category: 'verification', rarity: 'rare', ggg_reward: 0.05, description: 'Complete full identity verification process', quest_type: 'solo' },
  
  // Achievement Badges (10)
  { badge_code: 'first_meeting', badge_name: 'First Meeting', category: 'achievement', rarity: 'common', ggg_reward: 0.01, description: 'Complete your first meeting with another agent' },
  { badge_code: 'streak_7', badge_name: '7-Day Streak', category: 'achievement', rarity: 'common', ggg_reward: 0.01, description: 'Log in 7 consecutive days' },
  { badge_code: 'streak_30', badge_name: '30-Day Streak', category: 'achievement', rarity: 'uncommon', ggg_reward: 0.025, description: 'Log in 30 consecutive days' },
  { badge_code: 'first_listing', badge_name: 'First Listing', category: 'achievement', rarity: 'common', ggg_reward: 0.01, description: 'Create your first marketplace listing' },
  { badge_code: 'first_sale', badge_name: 'First Sale', category: 'achievement', rarity: 'uncommon', ggg_reward: 0.025, description: 'Complete your first sale' },
  { badge_code: 'mission_leader', badge_name: 'Mission Leader', category: 'achievement', rarity: 'rare', ggg_reward: 0.05, description: 'Lead a mission to completion' },
  { badge_code: 'community_builder', badge_name: 'Community Builder', category: 'achievement', rarity: 'rare', ggg_reward: 0.05, description: 'Refer 5+ new members who complete onboarding' },
  { badge_code: 'top_contributor', badge_name: 'Top Contributor', category: 'achievement', rarity: 'epic', ggg_reward: 0.1, description: 'Reach top 10% in monthly contributions' },
  { badge_code: 'mentor', badge_name: 'Mentor Badge', category: 'achievement', rarity: 'rare', ggg_reward: 0.05, description: 'Successfully mentor 3+ agents' },
  { badge_code: 'early_adopter', badge_name: 'Early Adopter', category: 'achievement', rarity: 'legendary', ggg_reward: 0.25, description: 'Join during beta period (before 2/22/26)' }
];

function BadgeDefinitionCard({ badge, onEdit, onDelete }) {
  const rarityClass = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
  const categoryConfig = CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.achievement;
  const CategoryIcon = categoryConfig.icon;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {badge.icon_url ? (
            <img src={badge.icon_url} alt={badge.badge_name} className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className={`p-3 rounded-lg bg-violet-100`}>
              <CategoryIcon className={`w-6 h-6 ${categoryConfig.color}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{badge.badge_name}</h3>
              <Badge className={`${rarityClass} text-xs capitalize`}>
                {badge.rarity}
              </Badge>
              {!badge.is_active && (
                <Badge variant="outline" className="text-xs">Inactive</Badge>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{badge.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-mono font-semibold text-amber-600">
                  {formatGGGSmart(badge.ggg_reward)} GGG
                </span>
              </div>
              <span className="text-emerald-600 text-xs">
                ≈ ${(badge.ggg_reward * GGG_TO_USD).toFixed(2)}
              </span>
              {badge.quest_type && badge.quest_type !== 'none' && (
                <Badge variant="outline" className="text-xs capitalize">
                  {badge.quest_type}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(badge)}>
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(badge.id)}>
              <Trash2 className="w-4 h-4 text-rose-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeEditDialog({ badge, open, onClose, onSave }) {
  const [formData, setFormData] = useState(badge || {
    badge_code: '',
    badge_name: '',
    category: 'achievement',
    rarity: 'common',
    ggg_reward: 0.01,
    description: '',
    icon_url: '',
    quest_type: 'none',
    is_active: true
  });
  
  const handleRarityChange = (rarity) => {
    setFormData({ 
      ...formData, 
      rarity,
      ggg_reward: RARITY_DEFAULTS[rarity] || 0.01
    });
  };
  
  const handleSave = () => {
    onSave(formData);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{badge?.id ? 'Edit Badge' : 'Create Badge'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Badge Code</Label>
              <Input
                value={formData.badge_code}
                onChange={(e) => setFormData({ ...formData, badge_code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="unique_badge_code"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label>Badge Name</Label>
              <Input
                value={formData.badge_name}
                onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                placeholder="Display Name"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rarity</Label>
              <Select value={formData.rarity} onValueChange={handleRarityChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(RARITY_DEFAULTS).map((rarity) => (
                    <SelectItem key={rarity} value={rarity} className="capitalize">
                      {rarity} ({formatGGGSmart(RARITY_DEFAULTS[rarity])} GGG default)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GGG Reward</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.ggg_reward}
                onChange={(e) => setFormData({ ...formData, ggg_reward: parseFloat(e.target.value) || 0 })}
                className="mt-1 font-mono"
              />
              <p className="text-xs text-emerald-600 mt-1">
                ≈ ${(formData.ggg_reward * GGG_TO_USD).toFixed(2)} USD
              </p>
            </div>
            <div>
              <Label>Quest Type</Label>
              <Select value={formData.quest_type || 'none'} onValueChange={(v) => setFormData({ ...formData, quest_type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Quest</SelectItem>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="paired">Paired</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="How to earn this badge..."
              className="mt-1"
              rows={2}
            />
          </div>
          
          <div>
            <Label>Icon URL (Badge/Sigil Image)</Label>
            <Input
              value={formData.icon_url || ''}
              onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">Upload image to Supabase storage first, then paste URL here</p>
            <a 
              href="https://qtrypzzcjebvfcihiynt.supabase.co/project/default/storage/buckets/base44-prod" 
              target="_blank"
              className="text-xs text-violet-600 hover:underline"
            >
              → Open Supabase Storage
            </a>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.badge_code || !formData.badge_name}>
                {badge?.id ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BadgeRewardsManager() {
  const [editingBadge, setEditingBadge] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [badgeSigilTab, setBadgeSigilTab] = useState('badges');
  const queryClient = useQueryClient();
  
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badgeDefinitions'],
    queryFn: () => base44.entities.BadgeDefinition.list()
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BadgeDefinition.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeDefinitions'] })
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BadgeDefinition.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeDefinitions'] })
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BadgeDefinition.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeDefinitions'] })
  });
  
  const seedMutation = useMutation({
    mutationFn: async () => {
      // Delete existing badges
      const existing = await base44.entities.BadgeDefinition.list();
      for (const b of existing) {
        await base44.entities.BadgeDefinition.delete(b.id);
      }
      // Create all default badges
      for (const badge of DEFAULT_BADGES) {
        await base44.entities.BadgeDefinition.create({
          ...badge,
          is_active: true,
          sort_order: DEFAULT_BADGES.indexOf(badge)
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeDefinitions'] })
  });
  
  const handleSave = (data) => {
    if (data.id) {
      const { id, ...updateData } = data;
      updateMutation.mutate({ id, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleDelete = (id) => {
    if (confirm('Delete this badge definition?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setDialogOpen(true);
  };
  
  const handleCreate = () => {
    setEditingBadge(null);
    setDialogOpen(true);
  };
  
  // Group by category
  const badgesByCategory = filteredBadgesFinal.reduce((acc, badge) => {
    const cat = badge.category || 'achievement';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(badge);
    return acc;
  }, {});
  
  // Stats
  const totalGGG = badges.reduce((sum, b) => sum + (b.ggg_reward || 0), 0);
  const badgeCounts = {
    total: badges.length,
    soul_resonance: badges.filter(b => b.category === 'soul_resonance').length,
    quest_type: badges.filter(b => b.category === 'quest_type').length,
    verification: badges.filter(b => b.category === 'verification').length,
    achievement: badges.filter(b => b.category === 'achievement').length
  };
  
  // Filter by badge/sigil type
  const badgeCategories = ['soul_resonance', 'quest_type', 'verification', 'achievement', 'streak', 'social', 'marketplace', 'mission', 'alignment'];
  const sigilCategories = ['agent', 'security', 'identity'];
  
  const categoriesToShow = badgeSigilTab === 'badges' ? badgeCategories : sigilCategories;
  const filteredByType = badges.filter(b => 
    categoriesToShow.includes(b.category)
  );
  
  const filteredBadgesFinal = filteredByType.filter(b => {
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.badge_name?.toLowerCase().includes(q) || 
             b.badge_code?.toLowerCase().includes(q) ||
             b.description?.toLowerCase().includes(q);
    }
    return true;
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Badge & Sigil GGG Rewards</h2>
          <p className="text-slate-500 mt-1">Configure GGG rewards for badge and sigil acquisition</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => seedMutation.mutate()}
            variant="outline"
            className="gap-2"
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Seed All Badges
          </Button>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" />
            New Badge
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-violet-600">{badgeCounts.total}</div>
            <div className="text-sm text-slate-500">Total Badges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{formatGGGSmart(totalGGG)}</div>
            <div className="text-sm text-slate-500">Total GGG Pool</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">${(totalGGG * GGG_TO_USD).toFixed(2)}</div>
            <div className="text-sm text-slate-500">USD Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{badgeCounts.soul_resonance}</div>
            <div className="text-sm text-slate-500">Soul Resonance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-rose-600">{badgeCounts.verification}</div>
            <div className="text-sm text-slate-500">Verification</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Badge/Sigil Tabs */}
      <Tabs value={badgeSigilTab} onValueChange={setBadgeSigilTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="sigils">Sigils</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search badges..."
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG)
              .filter(([key]) => categoriesToShow.includes(key))
              .map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Badge List by Category */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : Object.keys(badgesByCategory).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No badge definitions found</p>
            <Button onClick={() => seedMutation.mutate()} variant="outline">
              Seed Default Badges
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={Object.keys(badgesByCategory)[0]} className="space-y-4">
          <TabsList className="flex-wrap">
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.achievement;
              return (
                <TabsTrigger key={category} value={category} className="gap-2">
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                  {config.label} ({categoryBadges.length})
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
            <TabsContent key={category} value={category} className="space-y-3">
              {categoryBadges
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map(badge => (
                  <BadgeDefinitionCard
                    key={badge.id}
                    badge={badge}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Edit Dialog */}
      <BadgeEditDialog
        badge={editingBadge}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingBadge(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}