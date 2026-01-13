import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
  ThumbsDown,
  CheckCircle,
  GraduationCap,
  HelpCircle } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MiniProfile from '@/components/profile/MiniProfile';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { getMaleAvatarByIndex, getFemaleAvatarByIndex } from '@/components/demoAvatars';

export default function MatchCard({ match, onAction, onAskAI }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState([]);
  const [rating, setRating] = useState(match.user_rating || 0);
  const queryClient = useQueryClient();

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Match.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] })
  });

  const handleRate = async (stars) => {
    setRating(stars);
    updateMatchMutation.mutate({ id: match.id, data: { user_rating: stars } });
    setTimeout(() => setShowRating(false), 800);
    // Nudge the engine to refine with feedback
    try {
      await base44.functions.invoke('computeMatches', {});
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } catch (_) {}
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

  const scoreColor = match.match_score >= 80 ?
  "text-emerald-600 bg-emerald-50" :
  match.match_score >= 60 ?
  "text-amber-600 bg-amber-50" :
  "text-slate-600 bg-slate-50";

  const typeIcons = {
    person: Users,
    offer: Target,
    mission: Sparkles,
    event: Calendar,
    teacher: Brain
  };

  const TypeIcon = typeIcons[match.target_type] || Users;

  // Fetch target profile for rank/trust data - always call hook unconditionally
  const { data: targetProfiles = [] } = useQuery({
    queryKey: ['matchTargetProfile', match.target_id || 'none'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: match.target_id }),
    enabled: !!match.target_id && match.target_type === 'person'
  });
  const targetProfile = targetProfiles?.[0];

  // Get avatar - use match avatar, profile avatar, or demo avatar fallback
  const getDemoAvatar = () => {
    // First check if match has an avatar
    if (match.target_avatar) return match.target_avatar;
    // Check profile avatar
    if (targetProfile?.avatar_url) return targetProfile.avatar_url;
    // Fallback to demo avatar based on name
    const name = (match.target_name || '').toLowerCase();
    const id = (match.target_id || '').toLowerCase();
    // Map demo names/IDs to avatars
    const maleNames = ['jonah', 'kai', 'ethan', 'rafael', 'theo', 'marcus', 'david'];
    const femaleNames = ['lena', 'isla', 'mara', 'priya', 'sofia', 'aurora', 'maya', 'sarah', 'elena'];
    const maleIdx = maleNames.findIndex(n => name.includes(n) || id.includes(n));
    const femaleIdx = femaleNames.findIndex(n => name.includes(n) || id.includes(n));
    if (maleIdx >= 0) return getMaleAvatarByIndex(maleIdx);
    if (femaleIdx >= 0) return getFemaleAvatarByIndex(femaleIdx);
    return null;
  };

  const resolvedAvatar = getDemoAvatar();
  
  // For demo profiles without real trust/rp data, assign defaults for visual testing
  const isDemo = (match.target_id || '').includes('demo_') || (match.target_id || '').includes('@example');
  const effectiveTrustScore = targetProfile?.trust_score ?? (isDemo ? 75 : 0);
  const effectiveRpRankCode = targetProfile?.rp_rank_code ?? (isDemo ? 'adept' : 'seeker');
  const effectiveRpPoints = targetProfile?.rp_points ?? (isDemo ? 350 : 0);
  const effectiveLeaderTier = targetProfile?.leader_tier ?? (isDemo && Math.random() > 0.5 ? 'verified144k' : 'none');

  const navigateTo = (type, id) => {
    if (type === 'mission') {
      window.location.href = createPageUrl('MissionDetail?id=' + id);
    } else if (type === 'event') {
      window.location.href = createPageUrl('EventDetail?id=' + id);
    } else {
      const ev = new CustomEvent('openProfile', { detail: { userId: id } });
      document.dispatchEvent(ev);
    }
  };

  const getCardOptions = () => {
    const opts = [];
    if (match?.target_type && match?.target_id) {
      opts.push({ type: match.target_type, id: match.target_id, name: match.target_name });
    }
    if (Array.isArray(match?.linked_targets)) {
      match.linked_targets.forEach((t) => {
        if (t?.type && t?.id) opts.push({ type: t.type, id: t.id, name: t.name });
      });
    }
    if (match?.related_event_id) {
      opts.push({ type: 'event', id: match.related_event_id, name: match.related_event_name });
    }
    if (match?.related_mission_id) {
      opts.push({ type: 'mission', id: match.related_mission_id, name: match.related_mission_name });
    }
    const seen = new Set();
    return opts.filter((o) => {
      const key = o.type + ':' + o.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const handleCardClick = (e) => {
    const interactive = e.target.closest('button, [role="button"], a, input, textarea, select');
    if (interactive) return;
    const opts = getCardOptions();
    if (opts.length <= 1) {
      const o = opts[0] || { type: match.target_type, id: match.target_id };
      navigateTo(o.type, o.id);
    } else {
      setChoiceOptions(opts);
      setShowChoice(true);
    }
  };

  const handleNavigateTarget = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (match.target_type === 'mission') {
      window.location.href = createPageUrl('MissionDetail?id=' + match.target_id);
    } else if (match.target_type === 'event') {
      window.location.href = createPageUrl('EventDetail?id=' + match.target_id);
    } else {
      const ev = new CustomEvent('openProfile', { detail: { userId: match.target_id } });
      document.dispatchEvent(ev);
    }
  };

  const scoreBreakdown = [
  { label: "Intent", value: match.intent_alignment || 0, icon: Target },
  { label: "Skills", value: match.skill_complementarity || 0, icon: Brain },
  { label: "Spiritual", value: match.spiritual_alignment_score || 0, icon: Sparkles },
  { label: "Proximity", value: match.proximity_score || 0, icon: Users },
  { label: "Timing", value: match.timing_readiness || 0, icon: Clock }];


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/60 dark:border-slate-700 p-3 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-600 transition-all duration-300 h-fit [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:hover:shadow-[0_0_12px_#00ff00]">

      <div className="flex items-center gap-3">
        <div className="relative shrink-0" onClick={handleNavigateTarget}>
          {match.target_type === 'person' ? (
            <div className="relative">
              <RankedAvatar
                src={resolvedAvatar}
                name={match.target_name}
                size={44}
                userId={match.target_id}
                rpRankCode={effectiveRpRankCode}
                rpPoints={effectiveRpPoints}
                leaderTier={effectiveLeaderTier}
                status={targetProfile?.status || 'online'}
                className="cursor-pointer hover:scale-105 transition-transform [data-theme='hacker']_&:drop-shadow-[0_0_8px_#00ff00]"
              />
              {/* Trust sigil overlay */}
              {effectiveTrustScore >= 70 && (
                <div className="absolute -top-0.5 -right-0.5 p-0.5 bg-emerald-500 rounded-full shadow-sm [data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_6px_#00ff00]" title="High Trust">
                  <Shield className="w-2.5 h-2.5 text-white [data-theme='hacker']_&:text-[#00ff00]" />
                </div>
              )}
            </div>
          ) : (
            <>
              <Avatar className="w-11 h-11 ring-2 ring-white shadow-md cursor-pointer hover:ring-violet-300 transition-all dark:ring-slate-700 [data-theme='hacker']_&:ring-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_8px_#00ff00]">
                <AvatarImage src={resolvedAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium [data-theme='hacker']_&:from-[#001a00] [data-theme='hacker']_&:to-[#003300] [data-theme='hacker']_&:text-[#00ff00]">
                  {match.target_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm dark:bg-slate-800 [data-theme='hacker']_&:bg-black [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00]">
                <TypeIcon className="w-3 h-3 text-violet-500 [data-theme='hacker']_&:text-[#00ff00]" />
              </div>
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4
                  className="font-semibold text-slate-900 dark:text-white [data-theme='hacker']_&:text-[#00ff00] truncate cursor-pointer text-sm"
                  onClick={handleNavigateTarget}>
                  {match.target_name}
                </h4>
                {/* Verified badge for 144K leaders */}
                {effectiveLeaderTier === 'verified144k' && (
                  <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 [data-theme='hacker']_&:text-[#00ff00]" title="Verified 144K Leader" />
                )}
                <div className={cn(
                  "shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ml-auto",
                  scoreColor
                )}>
                  {match.match_score}%
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00cc00] truncate">{match.target_subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <Button
          size="sm"
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-8 text-xs px-2"
          onClick={() => onAction?.('message', match)}>
          <MessageCircle className="w-3.5 h-3.5 mr-1" />
          Message
        </Button>
        <Button
          size="sm"
          variant="outline" 
          className="flex-1 h-8 text-xs px-2 rounded-lg"
          onClick={() => onAction?.('book', match)}>
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Book
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={() => setShowRating(!showRating)}
          title="Rate this match">
          <Star className={cn("w-3.5 h-3.5", rating > 0 ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 hover:text-rose-600"
          onClick={handleBlock}
          title="Block this user">
          <Ban className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>

      {/* Rating Interface */}
      <AnimatePresence>
        {showRating &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden">

            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">Rate this match quality:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) =>
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="hover:scale-110 transition-transform">

                    <Star className={cn(
                  "w-6 h-6",
                  star <= rating ?
                  "text-amber-500 fill-amber-500" :
                  "text-slate-300"
                )} />
                  </button>
              )}
              </div>
              {rating > 0 &&
            <p className="text-xs text-slate-500 mt-2">
                  {rating >= 4 ? "Great match! 🎉" : rating >= 3 ? "Good match" : "Not quite right"}
                </p>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 hover:text-violet-600 transition-colors">
        <Sparkles className="w-3 h-3" />
        Why this match?
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform",
          showExplanation && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {showExplanation &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden">

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
              {match.ai_reasoning &&
            <div className="p-3 bg-violet-50 rounded-lg">
                  <p className="text-xs font-medium text-violet-900 mb-1">AI Analysis</p>
                  <p className="text-xs text-violet-700">{match.ai_reasoning}</p>
                </div>
            }

              <div className="grid grid-cols-5 gap-2">
                {scoreBreakdown.map((item, i) =>
              <div key={i} className="text-center">
                    <div className="flex justify-center mb-1">
                      <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{item.value}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                  </div>
              )}
              </div>

              {match.shared_values?.length > 0 &&
            <div>
                  <p className="text-xs text-slate-500 mb-1">Shared Values</p>
                  <div className="flex flex-wrap gap-1">
                    {match.shared_values.slice(0, 3).map((value, i) =>
                <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {value}
                      </Badge>
                )}
                  </div>
                </div>
            }

              {match.spiritual_synergies?.length > 0 &&
            <div>
                  <p className="text-xs text-slate-500 mb-1">Spiritual Synergies</p>
                  <div className="flex flex-wrap gap-1">
                    {match.spiritual_synergies.slice(0, 3).map((syn, i) =>
                <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        ✨ {syn}
                      </Badge>
                )}
                  </div>
                </div>
            }

              {match.conversation_starters?.length > 0 &&
            <div>
                  <p className="text-xs text-slate-500 mb-1.5">Conversation Starters</p>
                  <div className="space-y-1">
                    {match.conversation_starters.slice(0, 2).map((starter, i) =>
                <p key={i} className="text-xs text-slate-600 pl-2 border-l-2 border-violet-200">
                        {starter}
                      </p>
                )}
                  </div>
                </div>
            }

              <div className="flex gap-2 pt-2">
                <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 flex-1"
                onClick={() => handleRate(5)}>

                  <ThumbsUp className="w-3 h-3 mr-1" />
                  More like this
                </Button>
                <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 flex-1"
                onClick={() => handleRate(2)}>

                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Less like this
                </Button>
                {onAskAI && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 flex-1 text-violet-600"
                    onClick={(e) => { e.stopPropagation(); onAskAI(match); }}>
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Ask AI
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <Dialog open={showChoice} onOpenChange={setShowChoice}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Open</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {choiceOptions.map((opt, idx) => {
              const Icon = typeIcons[opt.type] || Users;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setShowChoice(false);
                    navigateTo(opt.type, opt.id);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-slate-50 text-left">

                  <Icon className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-slate-700">{opt.name || opt.type}</span>
                </button>);

            })}
          </div>
        </DialogContent>
      </Dialog>
      </motion.div>);

}