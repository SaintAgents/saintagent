import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Coins, Trophy, Target, Sparkles } from 'lucide-react';

const QUEST_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'epic', label: 'Epic' },
  { value: 'pathway', label: 'Pathway' },
  { value: 'cooperative', label: 'Cooperative' },
];

const CATEGORIES = [
  { value: 'social', label: 'Social' },
  { value: 'trust', label: 'Trust' },
  { value: 'ggg', label: 'GGG Economy' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'stewardship', label: 'Stewardship' },
  { value: 'alignment', label: 'Alignment' },
  { value: 'mystical', label: 'Mystical' },
];

const RARITIES = [
  { value: 'common', label: 'Common', color: 'text-slate-600' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-600' },
  { value: 'rare', label: 'Rare', color: 'text-blue-600' },
  { value: 'epic', label: 'Epic', color: 'text-violet-600' },
  { value: 'legendary', label: 'Legendary', color: 'text-amber-600' },
];

const DEFAULT_MILESTONES = [
  { percent: 25, ggg_payout: 0 },
  { percent: 50, ggg_payout: 0 },
  { percent: 75, ggg_payout: 0 },
  { percent: 100, ggg_payout: 0 },
];

export default function QuestCreateModal({ open, onClose, userId }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    quest_type: 'daily',
    category: 'social',
    rarity: 'common',
    target_action: '',
    target_count: 1,
    reward_ggg: 0,
    reward_rp: 0,
    reward_badge: '',
    milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const totalMilestoneGGG = form.milestones.reduce((s, m) => s + (m.ggg_payout || 0), 0);

  const updateMilestone = (idx, field, val) => {
    setForm(prev => {
      const next = [...prev.milestones];
      next[idx] = { ...next[idx], [field]: Number(val) || 0 };
      return { ...prev, milestones: next };
    });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const questData = {
        user_id: userId,
        title: form.title,
        description: form.description,
        quest_type: form.quest_type,
        category: form.category,
        rarity: form.rarity,
        target_action: form.target_action,
        target_count: Number(form.target_count) || 1,
        current_count: 0,
        reward_ggg: Number(form.reward_ggg) || 0,
        reward_rp: Number(form.reward_rp) || 0,
        reward_badge: form.reward_badge || undefined,
        status: 'active',
        started_at: new Date().toISOString(),
        gamification_data: {
          milestone_reached: false,
          progress_percentage: 0,
          milestones: form.milestones.filter(m => m.ggg_payout > 0),
        },
      };
      return base44.entities.Quest.create(questData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      queryClient.invalidateQueries({ queryKey: ['managedQuests'] });
      onClose();
      setForm({
        title: '', description: '', quest_type: 'daily', category: 'social',
        rarity: 'common', target_action: '', target_count: 1,
        reward_ggg: 0, reward_rp: 0, reward_badge: '',
        milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Create New Quest
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Complete 5 meetings this week" className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what needs to be done..." className="mt-1 h-20" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.quest_type} onValueChange={v => set('quest_type', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rarity</Label>
              <Select value={form.rarity} onValueChange={v => set('rarity', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RARITIES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target Action</Label>
              <Input value={form.target_action} onChange={e => set('target_action', e.target.value)} placeholder="e.g. meetings_attended" className="mt-1" />
            </div>
            <div>
              <Label>Target Count</Label>
              <Input type="number" min={1} value={form.target_count} onChange={e => set('target_count', e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Rewards */}
          <div className="border rounded-lg p-3 bg-amber-50/50">
            <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Completion Rewards
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">GGG Reward</Label>
                <Input type="number" min={0} step={0.01} value={form.reward_ggg} onChange={e => set('reward_ggg', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">RP Reward</Label>
                <Input type="number" min={0} value={form.reward_rp} onChange={e => set('reward_rp', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Badge Code</Label>
                <Input value={form.reward_badge} onChange={e => set('reward_badge', e.target.value)} placeholder="Optional" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Milestone Payouts */}
          <div className="border rounded-lg p-3 bg-violet-50/50">
            <p className="text-sm font-semibold text-violet-800 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Milestone Payouts
              <span className="text-xs font-normal text-violet-500 ml-auto">
                Total: {totalMilestoneGGG} GGG across milestones
              </span>
            </p>
            <div className="space-y-2">
              {form.milestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-10">{m.percent}%</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${m.percent}%` }} />
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={m.ggg_payout}
                      onChange={e => updateMilestone(idx, 'ggg_payout', e.target.value)}
                      className="h-7 text-xs"
                      placeholder="GGG"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={!form.title || createMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? 'Creating...' : 'Create Quest'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}