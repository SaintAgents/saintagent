import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, CheckCircle2, Trash2, ArrowUpCircle } from 'lucide-react';

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700',
  uncommon: 'bg-green-100 text-green-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-violet-100 text-violet-700',
  legendary: 'bg-amber-100 text-amber-700',
  mythic: 'bg-rose-100 text-rose-700',
};

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  claimed: 'bg-slate-100 text-slate-500',
  expired: 'bg-red-100 text-red-700',
};

export default function QuestManagementCard({ quest, profile }) {
  const queryClient = useQueryClient();
  const progress = quest.target_count > 0 ? Math.min(100, Math.round((quest.current_count / quest.target_count) * 100)) : 0;
  const milestones = quest.gamification_data?.milestones || [];

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const newCount = Math.min((quest.current_count || 0) + 1, quest.target_count);
      const newProgress = Math.round((newCount / quest.target_count) * 100);
      const isComplete = newCount >= quest.target_count;

      // Check milestone payouts
      let gggToAward = 0;
      const updatedMilestones = milestones.map(m => {
        if (newProgress >= m.percent && !m.paid && m.ggg_payout > 0) {
          gggToAward += m.ggg_payout;
          return { ...m, paid: true };
        }
        return m;
      });

      const updateData = {
        current_count: newCount,
        status: isComplete ? 'completed' : 'active',
        gamification_data: {
          ...quest.gamification_data,
          progress_percentage: newProgress,
          milestones: updatedMilestones,
          milestone_reached: updatedMilestones.some(m => m.paid),
        },
      };
      if (isComplete) {
        updateData.completed_at = new Date().toISOString();
        gggToAward += (quest.reward_ggg || 0);
      }

      await base44.entities.Quest.update(quest.id, updateData);

      // Award GGG if any milestone/completion payouts
      if (gggToAward > 0 && quest.user_id) {
        await base44.entities.GGGTransaction.create({
          user_id: quest.user_id,
          delta: gggToAward,
          source_type: 'reward',
          source_id: quest.id,
          reason_code: isComplete ? 'quest_completed' : 'quest_milestone',
          description: isComplete
            ? `Quest completed: ${quest.title} (+${gggToAward} GGG)`
            : `Quest milestone: ${quest.title} (+${gggToAward} GGG)`,
        });
        // Update profile balance
        if (profile?.id) {
          await base44.entities.UserProfile.update(profile.id, {
            ggg_balance: (profile.ggg_balance || 0) + gggToAward,
          });
        }
      }

      // Award RP on completion
      if (isComplete && quest.reward_rp && profile?.id) {
        await base44.entities.UserProfile.update(profile.id, {
          rp_points: (profile.rp_points || 0) + quest.reward_rp,
        });
        await base44.entities.ReputationEvent.create({
          user_id: quest.user_id,
          delta: quest.reward_rp,
          reason_code: 'quest_completed',
          source_type: 'mission',
          source_id: quest.id,
          description: `Quest completed: ${quest.title}`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      queryClient.invalidateQueries({ queryKey: ['managedQuests'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Quest.delete(quest.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      queryClient.invalidateQueries({ queryKey: ['managedQuests'] });
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm truncate">{quest.title}</h3>
              <Badge className={RARITY_COLORS[quest.rarity] || RARITY_COLORS.common} variant="secondary">
                {quest.rarity}
              </Badge>
              <Badge className={STATUS_COLORS[quest.status] || STATUS_COLORS.active} variant="secondary">
                {quest.status}
              </Badge>
            </div>
            {quest.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{quest.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 shrink-0" onClick={() => deleteMutation.mutate()}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{quest.current_count || 0} / {quest.target_count}</span>
            <span>{progress}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" />
            {/* Milestone markers */}
            {milestones.map((m, i) => (
              <div
                key={i}
                className="absolute top-0 h-3 w-0.5"
                style={{ left: `${m.percent}%`, backgroundColor: m.paid ? '#10b981' : '#94a3b8' }}
                title={`${m.percent}%: ${m.ggg_payout} GGG ${m.paid ? '(paid)' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Milestone Status */}
        {milestones.length > 0 && milestones.some(m => m.ggg_payout > 0) && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {milestones.filter(m => m.ggg_payout > 0).map((m, i) => (
              <span key={i} className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded ${m.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {m.paid ? <CheckCircle2 className="w-2.5 h-2.5" /> : null}
                {m.percent}%: {m.ggg_payout} GGG
              </span>
            ))}
          </div>
        )}

        {/* Rewards & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            {quest.reward_ggg > 0 && (
              <span className="flex items-center gap-1 text-amber-700">
                <Coins className="w-3 h-3" /> {quest.reward_ggg} GGG
              </span>
            )}
            {quest.reward_rp > 0 && (
              <span className="flex items-center gap-1 text-violet-700">
                <Trophy className="w-3 h-3" /> {quest.reward_rp} RP
              </span>
            )}
          </div>
          {quest.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => incrementMutation.mutate()}
              disabled={incrementMutation.isPending}
            >
              <ArrowUpCircle className="w-3 h-3" />
              +1 Progress
            </Button>
          )}
          {quest.status === 'completed' && (
            <Badge className="bg-emerald-100 text-emerald-700 gap-1">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}