import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  Bookmark, 
  X, 
  ChevronDown,
  Sparkles,
  Clock,
  Target,
  Users,
  Brain,
  Shield,
  Star,
  Ban,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchCard({ match, onAction }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(match.user_rating || 0);
  const queryClient = useQueryClient();

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Match.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] })
  });

  const handleRate = (stars) => {
    setRating(stars);
    updateMatchMutation.mutate({ 
      id: match.id, 
      data: { user_rating: stars }
    });
    setTimeout(() => setShowRating(false), 1000);
  };

  const handleBlock = async () => {
    await updateMatchMutation.mutateAsync({ 
      id: match.id, 
      data: { is_blocked: true, status: 'blocked' }
    });
    
    // Also add to blocked list in preferences
    const prefs = await base44.entities.EnginePreference.filter({ user_id: match.user_id });
    if (prefs[0]) {
      const blockedUsers = prefs[0].blocked_users || [];
      if (!blockedUsers.includes(match.target_id)) {
        await base44.entities.EnginePreference.update(prefs[0].id, {
          blocked_users: [...blockedUsers, match.target_id]
        });
      }
    }
    
    onAction?.('block', match);
  };
  
  const scoreColor = match.match_score >= 80 
    ? "text-emerald-600 bg-emerald-50" 
    : match.match_score >= 60 
    ? "text-amber-600 bg-amber-50" 
    : "text-slate-600 bg-slate-50";

  const typeIcons = {
    person: Users,
    offer: Target,
    mission: Sparkles,
    event: Calendar,
    teacher: Brain
  };

  const TypeIcon = typeIcons[match.target_type] || Users;

  const scoreBreakdown = [
    { label: "Intent", value: match.intent_alignment || 0, icon: Target },
    { label: "Skills", value: match.skill_complementarity || 0, icon: Brain },
    { label: "Spiritual", value: match.spiritual_alignment_score || 0, icon: Sparkles },
    { label: "Proximity", value: match.proximity_score || 0, icon: Users },
    { label: "Timing", value: match.timing_readiness || 0, icon: Clock },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-xl border border-slate-200/60 p-4 hover:shadow-lg hover:border-violet-200 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="relative" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const ev = new CustomEvent('openProfile', { detail: { userId: match.target_id }}); document.dispatchEvent(ev); }}>
          <Avatar 
            className="w-12 h-12 ring-2 ring-white shadow-md cursor-pointer hover:ring-violet-300 transition-all" 
            data-user-id={match.target_id}
          >
            <AvatarImage src={match.target_avatar} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium">
              {match.target_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
            <TypeIcon className="w-3 h-3 text-violet-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 
                className="font-semibold text-slate-900 truncate cursor-pointer"
                data-user-id={match.target_id}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); const ev = new CustomEvent('openProfile', { detail: { userId: match.target_id }}); document.dispatchEvent(ev); }}
              >
                {match.target_name}
              </h4>
              <p className="text-sm text-slate-500 truncate">{match.target_subtitle}</p>
            </div>
            <div className={cn(
              "shrink-0 px-2.5 py-1 rounded-full text-sm font-bold",
              scoreColor
            )}>
              {match.match_score}%
            </div>
          </div>

          {match.timing_window && (
            <div className="flex items-center gap-1.5 mt-2">
              <Clock className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs text-violet-600 font-medium">{match.timing_window}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button 
          size="sm" 
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-9"
          onClick={() => onAction?.('message', match)}
        >
          <MessageCircle className="w-4 h-4 mr-1.5" />
          Message
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="flex-1 rounded-lg h-9"
          onClick={() => onAction?.('book', match)}
        >
          <Calendar className="w-4 h-4 mr-1.5" />
          Book
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          className="h-9 w-9 shrink-0"
          onClick={() => setShowRating(!showRating)}
          title="Rate this match"
        >
          <Star className={cn("w-4 h-4", rating > 0 ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          className="h-9 w-9 shrink-0"
          onClick={() => onAction?.('save', match)}
        >
          <Bookmark className="w-4 h-4 text-slate-400" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          className="h-9 w-9 shrink-0 hover:text-rose-600"
          onClick={handleBlock}
          title="Block this user"
        >
          <Ban className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      {/* Rating Interface */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">Rate this match quality:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star className={cn(
                      "w-6 h-6",
                      star <= rating 
                        ? "text-amber-500 fill-amber-500" 
                        : "text-slate-300"
                    )} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  {rating >= 4 ? "Great match! 🎉" : rating >= 3 ? "Good match" : "Not quite right"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 hover:text-violet-600 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Why this match?
        <ChevronDown className={cn(
          "w-3.5 h-3.5 transition-transform",
          showExplanation && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
              {match.ai_reasoning && (
                <div className="p-3 bg-violet-50 rounded-lg">
                  <p className="text-xs font-medium text-violet-900 mb-1">AI Analysis</p>
                  <p className="text-xs text-violet-700">{match.ai_reasoning}</p>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2">
                {scoreBreakdown.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="flex justify-center mb-1">
                      <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{item.value}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                  </div>
                ))}
              </div>

              {match.shared_values?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Shared Values</p>
                  <div className="flex flex-wrap gap-1">
                    {match.shared_values.slice(0, 3).map((value, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {match.spiritual_synergies?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Spiritual Synergies</p>
                  <div className="flex flex-wrap gap-1">
                    {match.spiritual_synergies.slice(0, 3).map((syn, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        ✨ {syn}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {match.conversation_starters?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Conversation Starters</p>
                  <div className="space-y-1">
                    {match.conversation_starters.slice(0, 2).map((starter, i) => (
                      <p key={i} className="text-xs text-slate-600 pl-2 border-l-2 border-violet-200">
                        {starter}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 flex-1"
                  onClick={() => handleRate(5)}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  More like this
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 flex-1"
                  onClick={() => handleRate(2)}
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Less like this
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}