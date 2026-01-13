import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Target, 
  Users, 
  Calendar, 
  MessageCircle, 
  Star, 
  Coins, 
  Gift,
  Clock,
  CheckCircle,
  Sparkles,
  Download,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CATEGORY_ICONS = {
  profile: Target,
  social: Users,
  meetings: Calendar,
  missions: Target,
  marketplace: Coins,
  learning: Star
};

const CATEGORY_COLORS = {
  profile: 'bg-blue-100 text-blue-700 border-blue-200',
  social: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  meetings: 'bg-violet-100 text-violet-700 border-violet-200',
  missions: 'bg-amber-100 text-amber-700 border-amber-200',
  marketplace: 'bg-rose-100 text-rose-700 border-rose-200',
  learning: 'bg-cyan-100 text-cyan-700 border-cyan-200'
};

export default function ChallengeCard({ challenge, onClaim, compact = false }) {
  const queryClient = useQueryClient();
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [userNotes, setUserNotes] = React.useState(challenge.user_notes || '');
  const Icon = CATEGORY_ICONS[challenge.category] || Target;
  const progress = Math.min(100, (challenge.current_count / challenge.target_count) * 100);
  const isComplete = challenge.current_count >= challenge.target_count;
  const canClaim = isComplete && challenge.status !== 'claimed';
  
  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Challenge.update(challenge.id, { user_notes: userNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setNotesOpen(false);
    }
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Challenge.update(challenge.id, { 
        status: 'claimed',
        completed_at: new Date().toISOString()
      });
      // Award points
      if (challenge.reward_points > 0) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
        if (profiles[0]) {
          await base44.entities.UserProfile.update(profiles[0].id, {
            engagement_points: (profiles[0].engagement_points || 0) + challenge.reward_points
          });
        }
      }
      // Award GGG
      if (challenge.reward_ggg > 0) {
        const user = await base44.auth.me();
        await base44.entities.GGGTransaction.create({
          user_id: user.email,
          source_type: 'reward',
          delta: challenge.reward_ggg,
          reason_code: 'challenge_completed',
          description: `Completed: ${challenge.title}`
        });
      }
      // Award badge
      if (challenge.reward_badge) {
        const user = await base44.auth.me();
        await base44.entities.Badge.create({
          user_id: user.email,
          code: challenge.reward_badge,
          status: 'active'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      onClaim?.(challenge);
    }
  });

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl border bg-white",
        isComplete ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"
      )}>
        <div className={cn("p-2 rounded-lg", CATEGORY_COLORS[challenge.category])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{challenge.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-slate-500">{challenge.current_count}/{challenge.target_count}</span>
          </div>
        </div>
        {canClaim ? (
          <Button 
            size="sm" 
            className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
          >
            <Gift className="w-3 h-3 mr-1" />
            Claim
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs bg-slate-800 text-white border-slate-600">
            +{challenge.reward_points} pts
          </Badge>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border bg-white",
        isComplete ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", CATEGORY_COLORS[challenge.category])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{challenge.title}</h4>
            <p className="text-sm text-slate-500">{challenge.description}</p>
          </div>
        </div>
        {challenge.challenge_type === 'ai_suggested' && (
          <Badge className="bg-violet-100 text-violet-700 gap-1">
            <Sparkles className="w-3 h-3" />
            AI Pick
          </Badge>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">Progress</span>
          <span className="font-medium text-slate-900">{challenge.current_count}/{challenge.target_count}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {challenge.reward_points > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 font-medium">+{challenge.reward_points}</span>
            </div>
          )}
          {challenge.reward_ggg > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700 font-medium">+{challenge.reward_ggg} GGG</span>
            </div>
          )}
          {challenge.expires_at && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(challenge.expires_at), { addSuffix: true })}
            </div>
          )}
        </div>

        {canClaim ? (
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 gap-1"
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
          >
            <Gift className="w-4 h-4" />
            Claim Reward
          </Button>
        ) : isComplete ? (
          <Badge className="bg-emerald-100 text-emerald-700 gap-1">
            <CheckCircle className="w-3 h-3" />
            Claimed
          </Badge>
        ) : null}
      </div>

      {challenge.ai_reasoning && (
        <div className="mt-3 p-2 rounded-lg bg-violet-50 border border-violet-100">
          <p className="text-xs text-violet-700">
            <Sparkles className="w-3 h-3 inline mr-1" />
            {challenge.ai_reasoning}
          </p>
        </div>
      )}

      {/* Download & Notes Section */}
      {(challenge.download_url || challenge.image_url) && (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
          {challenge.image_url && (
            <img 
              src={challenge.image_url} 
              alt={challenge.title}
              className="w-full rounded-lg mb-2"
            />
          )}
          <div className="flex items-center gap-2">
            {challenge.download_url && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                asChild
              >
                <a href={challenge.download_url} download>
                  <Download className="w-4 h-4" />
                  Download Sigil
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setNotesOpen(true)}
            >
              <Edit className="w-4 h-4" />
              {challenge.user_notes ? 'Edit Notes' : 'Add Impressions'}
            </Button>
          </div>
          {challenge.user_notes && (
            <div className="text-xs text-slate-600 bg-white p-2 rounded border">
              <p className="font-medium mb-1">Your Notes:</p>
              <p className="italic">{challenge.user_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes Modal */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Impressions & Experiences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Share your experiences with the {challenge.title}. What insights, dreams, or synchronicities did you notice?
            </p>
            <Textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Describe your impressions, experiences, or insights..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotesOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => saveNotesMutation.mutate()}
                disabled={saveNotesMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}