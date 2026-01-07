import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Heart, Users, Zap, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

function ResonanceRing({ score }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      {/* Background ring */}
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="rgba(251,191,36,0.1)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="url(#resonanceGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="resonanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-amber-300">{score}%</span>
      </div>
    </div>
  );
}

export default function ActiveSynchronicity({ match, currentUserId }) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SynchronicityMatch.update(match.id, {
        user_accepted: true,
        status: match.matched_user_accepted ? 'connected' : 'pending'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicityMatches'] })
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SynchronicityMatch.update(match.id, { status: 'declined' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicityMatches'] })
  });

  if (!match) {
    return (
      <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-amber-400/50" />
          </div>
          <p className="text-amber-400/70 text-sm">No active synchronicity detected</p>
          <p className="text-amber-400/40 text-xs mt-1">The field is scanning for resonant souls...</p>
        </CardContent>
      </Card>
    );
  }

  const connectionTypeLabels = {
    collaboration: 'Collaboration Potential',
    mentorship: 'Mentorship Potential',
    sacred_union: 'Sacred Union',
    stewardship: 'Stewardship Alliance',
    co_creation: 'Co-Creation Opportunity'
  };

  return (
    <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
          <CardTitle className="text-base flex items-center gap-2 text-amber-100">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Active Synchronicity
            <Sparkles className="w-4 h-4 text-amber-400" />
          </CardTitle>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
        </div>
        <p className="text-center text-xs text-amber-300/70 mt-1">
          ✦ A Sacred Connection Detected! ✦
        </p>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex items-center justify-center gap-6">
          {/* Left User */}
          <div className="text-center">
            <Avatar className="w-16 h-16 border-2 border-amber-600/50 mx-auto shadow-lg shadow-amber-500/20">
              <AvatarImage src={match.factors?.userAvatar} />
              <AvatarFallback className="bg-amber-900/50 text-amber-200">You</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-amber-100 mt-2">You</p>
          </div>

          {/* Resonance Ring */}
          <div className="flex flex-col items-center">
            <ResonanceRing score={match.resonance_score} />
          </div>

          {/* Right User */}
          <div className="text-center">
            <Avatar 
              className="w-16 h-16 border-2 border-amber-600/50 mx-auto shadow-lg shadow-amber-500/20 cursor-pointer"
              data-user-id={match.matched_user_id}
            >
              <AvatarImage src={match.matched_user_avatar} />
              <AvatarFallback className="bg-amber-900/50 text-amber-200">
                {match.matched_user_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-amber-100 mt-2">{match.matched_user_name}</p>
            <p className="text-[10px] text-amber-400/60">{match.matched_user_title || 'Soul Seeker'}</p>
          </div>
        </div>

        {/* Connection Details */}
        <div className="mt-4 flex justify-center gap-6 text-center">
          {match.shared_quests?.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400">Shared Quest Alignment</p>
              <p className="text-[10px] text-amber-400/50">{match.shared_quests.length} quests in common</p>
            </div>
          )}
          <div>
            <p className="text-xs text-violet-400">{connectionTypeLabels[match.connection_type] || 'Divine Connection'}</p>
            <p className="text-[10px] text-amber-400/50">Resonance detected</p>
          </div>
        </div>

        {/* Action Buttons */}
        {match.status === 'revealed' && !match.user_accepted && (
          <div className="flex gap-3 mt-6 justify-center">
            <Button
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              variant="outline"
              className="border-amber-800 text-amber-400/70 hover:bg-amber-900/30 hover:text-amber-300"
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
            <Button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-medium shadow-lg shadow-amber-500/30"
            >
              <Heart className="w-4 h-4 mr-1" />
              {acceptMutation.isPending ? 'Accepting...' : 'Receive Synchronicity'}
            </Button>
          </div>
        )}

        {match.user_accepted && !match.matched_user_accepted && (
          <div className="text-center mt-4">
            <p className="text-sm text-amber-300/70">Awaiting their acceptance...</p>
            <p className="text-xs text-amber-400/40 mt-1">The field is aligning your connection</p>
          </div>
        )}

        {match.status === 'connected' && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Connected!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}