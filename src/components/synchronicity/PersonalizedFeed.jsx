import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart, Sparkles, MoreVertical, UserPlus, UserMinus, 
  Brain, Lightbulb, TrendingUp, Loader2, Hash, Eye,
  Users, Clock, MessageCircle, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_CONFIG = {
  numbers: { label: 'Numbers', icon: Hash, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  dreams: { label: 'Dreams', icon: Eye, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  encounters: { label: 'Encounters', icon: Users, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  signs: { label: 'Signs', icon: Sparkles, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  timing: { label: 'Timing', icon: Clock, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  patterns: { label: 'Patterns', icon: TrendingUp, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  messages: { label: 'Messages', icon: MessageCircle, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  other: { label: 'Other', icon: Flame, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

function SerendipityScore({ score }) {
  const getColor = () => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/20';
    if (score >= 60) return 'text-violet-400 bg-violet-500/20';
    if (score >= 40) return 'text-amber-400 bg-amber-500/20';
    return 'text-slate-400 bg-slate-500/20';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`px-2 py-0.5 rounded-full ${getColor()} text-xs font-medium flex items-center gap-1`}>
            <Sparkles className="w-3 h-3" />
            {score}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-slate-700 border border-slate-200">
          <p className="text-sm">Serendipity Score: AI-calculated meaningfulness based on resonance, symbols, and patterns</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PersonalizedSyncCard({ sync, userId, onLike, onResonate, onFollow, isFollowing, onInterpret }) {
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [interpretation, setInterpretation] = useState(sync.ai_interpretation || null);
  const [isInterpreting, setIsInterpreting] = useState(false);

  const config = CATEGORY_CONFIG[sync.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;
  const hasLiked = sync.liked_by?.includes(userId);
  const hasResonated = sync.resonated_by?.includes(userId);

  const handleInterpret = async () => {
    if (interpretation) {
      setShowInterpretation(!showInterpretation);
      return;
    }
    
    setIsInterpreting(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a meaningful spiritual interpretation for this synchronicity experience:

Category: ${sync.category}
Title: ${sync.title || 'Untitled'}
Description: ${sync.description}
Symbols: ${sync.symbols?.join(', ') || 'None specified'}

Offer guidance on:
1. What this synchronicity might be pointing to
2. Possible messages or meanings
3. Suggested actions or areas to pay attention to

Keep it concise but insightful, spiritually meaningful without being generic.`,
      response_json_schema: {
        type: "object",
        properties: {
          interpretation: { type: "string" },
          key_message: { type: "string" },
          suggested_action: { type: "string" }
        }
      }
    });

    setInterpretation(result);
    setShowInterpretation(true);
    setIsInterpreting(false);
    onInterpret?.(sync.id, result);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-xl border border-violet-500/20 p-4 hover:border-violet-500/40 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10 border border-violet-500/30" data-user-id={sync.user_id}>
          <AvatarImage src={sync.user_avatar} />
          <AvatarFallback className="bg-violet-900/50 text-violet-200 text-sm">
            {sync.user_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">{sync.user_name}</p>
            {isFollowing && (
              <Badge className="bg-violet-500/20 text-violet-300 text-xs">Following</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {sync.created_date ? formatDistanceToNow(new Date(sync.created_date), { addSuffix: true }) : 'Recently'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sync.serendipity_score > 0 && <SerendipityScore score={sync.serendipity_score} />}
          <Badge className={`${config.color} border text-xs`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem 
                onClick={() => onFollow?.(sync.user_id, sync.user_name, sync.user_avatar)}
                className="text-white"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow for insights
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {sync.title && (
        <h3 className="font-semibold text-violet-200 mb-2">{sync.title}</h3>
      )}
      <p className="text-slate-300 text-sm leading-relaxed mb-3">{sync.description}</p>

      {/* Symbols & Theme Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sync.symbols?.map((symbol, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
            {symbol}
          </span>
        ))}
        {sync.theme_tags?.map((tag, i) => (
          <span key={`t-${i}`} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* AI Interpretation */}
      {showInterpretation && interpretation && (
        <div className="mb-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs font-medium text-indigo-300 mb-2 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Interpretation
          </p>
          <p className="text-sm text-white mb-2">{interpretation.interpretation}</p>
          {interpretation.key_message && (
            <div className="flex items-start gap-2 text-xs text-amber-300 mb-1">
              <Lightbulb className="w-3 h-3 mt-0.5" />
              <span>{interpretation.key_message}</span>
            </div>
          )}
          {interpretation.suggested_action && (
            <p className="text-xs text-slate-400 italic mt-2">
              Suggested: {interpretation.suggested_action}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-700/50">
        <button 
          onClick={() => onLike?.(sync)}
          className={`flex items-center gap-1.5 transition-colors ${
            hasLiked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-400' : ''}`} />
          <span className="text-sm">{sync.likes_count || 0}</span>
        </button>
        
        <button 
          onClick={() => onResonate?.(sync)}
          className={`flex items-center gap-1.5 transition-colors ${
            hasResonated ? 'text-violet-400' : 'text-slate-400 hover:text-violet-400'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${hasResonated ? 'fill-violet-400' : ''}`} />
          <span className="text-sm">{sync.resonance_count || 0} resonated</span>
        </button>

        <button 
          onClick={handleInterpret}
          disabled={isInterpreting}
          className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors ml-auto"
        >
          {isInterpreting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          <span className="text-sm">{interpretation ? 'View' : 'Get'} Insight</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function PersonalizedFeed({ userId, profile }) {
  const queryClient = useQueryClient();

  // Get user's interests from their past interactions
  const { data: myInteractions = [] } = useQuery({
    queryKey: ['myInteractions', userId],
    queryFn: async () => {
      const all = await base44.entities.Synchronicity.filter({ status: 'active' }, '-created_date', 200);
      return all.filter(s => 
        s.liked_by?.includes(userId) || 
        s.resonated_by?.includes(userId) ||
        s.user_id === userId
      );
    },
    enabled: !!userId
  });

  // Get followed users
  const { data: following = [] } = useQuery({
    queryKey: ['syncFollowing', userId],
    queryFn: () => base44.entities.SynchronicityFollow.filter({ follower_id: userId }),
    enabled: !!userId
  });

  const followingIds = following.map(f => f.following_id);

  // Get all synchronicities
  const { data: allSyncs = [] } = useQuery({
    queryKey: ['allSynchronicities'],
    queryFn: () => base44.entities.Synchronicity.filter({ status: 'active' }, '-created_date', 100)
  });

  // Calculate personalized relevance score for each sync
  const personalizedFeed = React.useMemo(() => {
    // Extract user's preferred categories and symbols
    const categoryWeights = {};
    const symbolWeights = {};
    
    myInteractions.forEach(sync => {
      categoryWeights[sync.category] = (categoryWeights[sync.category] || 0) + 1;
      sync.symbols?.forEach(s => {
        symbolWeights[s.toLowerCase()] = (symbolWeights[s.toLowerCase()] || 0) + 1;
      });
    });

    return allSyncs
      .map(sync => {
        let relevanceScore = sync.serendipity_score || 50;
        
        // Boost for followed users
        if (followingIds.includes(sync.user_id)) {
          relevanceScore += 30;
        }
        
        // Boost for preferred categories
        if (categoryWeights[sync.category]) {
          relevanceScore += categoryWeights[sync.category] * 5;
        }
        
        // Boost for matching symbols
        sync.symbols?.forEach(s => {
          if (symbolWeights[s.toLowerCase()]) {
            relevanceScore += symbolWeights[s.toLowerCase()] * 3;
          }
        });
        
        // Recency boost
        const hoursSinceCreated = (Date.now() - new Date(sync.created_date).getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreated < 24) relevanceScore += 20;
        else if (hoursSinceCreated < 72) relevanceScore += 10;
        
        // Engagement boost
        relevanceScore += (sync.resonance_count || 0) * 2;
        relevanceScore += (sync.likes_count || 0);

        return { ...sync, relevanceScore: Math.min(100, relevanceScore) };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [allSyncs, myInteractions, followingIds]);

  const likeMutation = useMutation({
    mutationFn: async (sync) => {
      const alreadyLiked = sync.liked_by?.includes(userId);
      const newLikedBy = alreadyLiked 
        ? sync.liked_by.filter(id => id !== userId)
        : [...(sync.liked_by || []), userId];
      
      await base44.entities.Synchronicity.update(sync.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allSynchronicities'] })
  });

  const resonateMutation = useMutation({
    mutationFn: async (sync) => {
      const alreadyResonated = sync.resonated_by?.includes(userId);
      const newResonatedBy = alreadyResonated
        ? sync.resonated_by.filter(id => id !== userId)
        : [...(sync.resonated_by || []), userId];
      
      await base44.entities.Synchronicity.update(sync.id, {
        resonated_by: newResonatedBy,
        resonance_count: newResonatedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allSynchronicities'] })
  });

  const followMutation = useMutation({
    mutationFn: async ({ targetId, targetName, targetAvatar }) => {
      const existing = following.find(f => f.following_id === targetId);
      if (existing) {
        await base44.entities.SynchronicityFollow.delete(existing.id);
      } else {
        await base44.entities.SynchronicityFollow.create({
          follower_id: userId,
          following_id: targetId,
          following_name: targetName,
          following_avatar: targetAvatar
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['syncFollowing'] })
  });

  const interpretMutation = useMutation({
    mutationFn: async ({ syncId, interpretation }) => {
      await base44.entities.Synchronicity.update(syncId, {
        ai_interpretation: interpretation.interpretation
      });
    }
  });

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {personalizedFeed.map(sync => (
          <PersonalizedSyncCard
            key={sync.id}
            sync={sync}
            userId={userId}
            isFollowing={followingIds.includes(sync.user_id)}
            onLike={() => likeMutation.mutate(sync)}
            onResonate={() => resonateMutation.mutate(sync)}
            onFollow={(targetId, targetName, targetAvatar) => 
              followMutation.mutate({ targetId, targetName, targetAvatar })
            }
            onInterpret={(syncId, interpretation) => 
              interpretMutation.mutate({ syncId, interpretation })
            }
          />
        ))}
      </AnimatePresence>
      
      {personalizedFeed.length === 0 && (
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 text-violet-500/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No synchronicities yet</h3>
          <p className="text-slate-400">Be the first to share your experience</p>
        </div>
      )}
    </div>
  );
}