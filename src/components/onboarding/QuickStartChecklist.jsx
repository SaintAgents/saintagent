import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Square, CheckCircle2, Info, Trophy, Star, ChevronRight, Zap, Target, MessageSquare, Calendar, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

const ACTIONS = [
  { 
    id: "follow_leaders",
    label: "Follow 5 leaders", 
    reward: 0.03, 
    icon: Users,
    tooltip: "Find inspiring leaders in the community and follow them to see their updates",
    link: "FindCollaborators",
    badge: "Network Builder"
  },
  { 
    id: "send_message",
    label: "Send 1 message", 
    reward: 0.02, 
    icon: MessageSquare,
    tooltip: "Start a conversation with someone - collaboration begins with communication!",
    link: "Messages",
    badge: "Communicator"
  },
  { 
    id: "book_meeting",
    label: "Book 1 meeting", 
    reward: 0.03, 
    icon: Calendar,
    tooltip: "Schedule a meeting to connect in real-time with a collaborator",
    link: "Meetings",
    badge: "Connector"
  },
  { 
    id: "join_mission",
    label: "Join 1 mission", 
    reward: 0.03, 
    icon: Target,
    tooltip: "Find a mission that aligns with your purpose and join the team",
    link: "Missions",
    badge: "Mission Ready"
  },
  { 
    id: "create_offer",
    label: "Create 1 offer", 
    reward: 0.03, 
    icon: Gift,
    tooltip: "Share your skills and services with the community",
    link: "Marketplace",
    badge: "Provider"
  }
];

const MILESTONE_BADGES = [
  { threshold: 1, label: "First Steps", icon: "🌱", color: "bg-green-100 text-green-700" },
  { threshold: 3, label: "Rising Star", icon: "⭐", color: "bg-yellow-100 text-yellow-700" },
  { threshold: 5, label: "Fully Activated", icon: "🏆", color: "bg-violet-100 text-violet-700" }
];

export default function QuickStartChecklist() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: profile } = useQuery({ 
    queryKey: ['userProfile', user?.email], 
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });
  
  // Fetch completion status from various entities
  const { data: follows = [] } = useQuery({
    queryKey: ['myFollows', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user.email }),
    enabled: !!user?.email
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['myMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ from_user_id: user.email }),
    enabled: !!user?.email
  });
  
  const { data: meetings = [] } = useQuery({
    queryKey: ['myMeetings', user?.email],
    queryFn: () => base44.entities.Meeting.filter({ host_id: user.email }),
    enabled: !!user?.email
  });
  
  const { data: missionJoins = [] } = useQuery({
    queryKey: ['myMissionJoins', user?.email],
    queryFn: () => base44.entities.MissionJoinRequest.filter({ user_id: user.email, status: 'approved' }),
    enabled: !!user?.email
  });
  
  const { data: listings = [] } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ owner_id: user.email }),
    enabled: !!user?.email
  });

  // Calculate completion status
  const completionStatus = {
    follow_leaders: follows.length >= 5,
    send_message: messages.length >= 1,
    book_meeting: meetings.length >= 1,
    join_mission: missionJoins.length >= 1,
    create_offer: listings.length >= 1
  };
  
  const completedCount = Object.values(completionStatus).filter(Boolean).length;
  const progressPercent = (completedCount / ACTIONS.length) * 100;
  
  // Active walkthrough state
  const [activeWalkthrough, setActiveWalkthrough] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Check for newly earned badges
  useEffect(() => {
    if (completedCount > 0) {
      const earnedMilestone = MILESTONE_BADGES.find(m => m.threshold === completedCount);
      if (earnedMilestone) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [completedCount]);

  const startWalkthrough = (action) => {
    setActiveWalkthrough(action.id);
    // Navigate to the relevant page
    window.location.href = createPageUrl(action.link);
  };

  const currentMilestone = MILESTONE_BADGES.filter(m => completedCount >= m.threshold).pop();
  const nextMilestone = MILESTONE_BADGES.find(m => completedCount < m.threshold);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && currentMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <span className="text-3xl">{currentMilestone.icon}</span>
                <div>
                  <p className="font-bold">Badge Earned!</p>
                  <p className="text-sm opacity-90">{currentMilestone.label}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Header with Milestone Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-700">Quick Start Progress</span>
            </div>
            <div className="flex items-center gap-2">
              {currentMilestone && (
                <Badge className={`${currentMilestone.color} text-xs`}>
                  {currentMilestone.icon} {currentMilestone.label}
                </Badge>
              )}
              <span className="text-xs font-bold text-violet-600">{completedCount}/{ACTIONS.length}</span>
            </div>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="relative">
            <Progress value={progressPercent} className="h-3" />
            <div className="absolute top-0 left-0 w-full h-3 flex justify-between px-1">
              {MILESTONE_BADGES.map((milestone, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div 
                      className={`w-5 h-5 rounded-full border-2 -mt-1 flex items-center justify-center text-xs cursor-pointer transition-all ${
                        completedCount >= milestone.threshold 
                          ? 'bg-violet-500 border-violet-600 text-white scale-110' 
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                      style={{ marginLeft: `${(milestone.threshold / ACTIONS.length) * 100 - 10}%` }}
                    >
                      {milestone.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{milestone.label}</p>
                    <p className="text-xs text-slate-500">Complete {milestone.threshold} actions</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          
          {/* Next Milestone Teaser */}
          {nextMilestone && (
            <p className="text-xs text-slate-500 text-center">
              {nextMilestone.threshold - completedCount} more to unlock <span className="font-medium text-violet-600">{nextMilestone.icon} {nextMilestone.label}</span>
            </p>
          )}
        </div>

        {/* Total Rewards Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-700">Complete all to earn</p>
              <p className="text-sm font-bold text-emerald-800">+0.14 GGG Total</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < completedCount ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
              />
            ))}
          </div>
        </div>

        {/* Admin/User Buttons */}
        {user?.role === 'admin' ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={(e) => { e.stopPropagation(); window.location.href = createPageUrl('ProjectOnboard'); }}>
              Import Projects (CSV)
            </Button>
            <a href={createPageUrl('Admin')} onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="rounded-lg">
                Admin Dashboard
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700" onClick={(e) => { e.stopPropagation(); window.location.href = createPageUrl('ProjectCreate'); }}>
              Add Project
            </Button>
          </div>
        )}

        {/* Action Items with Tooltips and Walkthroughs */}
        <div className="space-y-2">
          {ACTIONS.map((action, i) => {
            const isCompleted = completionStatus[action.id];
            const ActionIcon = action.icon;
            
            return (
              <div key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={false}
                      animate={isCompleted ? { scale: [1, 1.02, 1] } : {}}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                        isCompleted 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                      onClick={() => !isCompleted && startWalkthrough(action)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-violet-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ActionIcon className="w-4 h-4 text-slate-500 group-hover:text-violet-600" />
                          )}
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>
                            {action.label}
                          </span>
                          {isCompleted && (
                            <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${
                          isCompleted ? 'text-emerald-600' : 'text-emerald-600'
                        }`}>
                          <Sparkles className="w-4 h-4" /> +{action.reward} GGG
                        </div>
                        {!isCompleted && (
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[200px]">
                    <p className="text-sm">{action.tooltip}</p>
                    {!isCompleted && (
                      <p className="text-xs text-violet-600 mt-1">Click to start →</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                
                {/* Read Me hover info after step 4 (Join 1 mission) */}
                {i === 3 && (
                  <div className="flex justify-end mt-2">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200 transition-colors cursor-pointer">
                          <Info className="w-3.5 h-3.5" />
                          📖 READ ME
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 p-4" side="top">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-900">💡 Important Tips!</p>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                            <li>• <strong>Earn GGG!</strong> - Refer friends</li>
                            <li>• <strong>Advanced view</strong> for more to explore and receive rewards</li>
                            <li>• <strong>Submit projects</strong> for funding</li>
                          </ul>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Celebration */}
        {completedCount === ACTIONS.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl p-4 text-center"
          >
            <div className="text-2xl mb-2">🎉</div>
            <p className="font-bold">You're Fully Activated!</p>
            <p className="text-sm opacity-90">You've completed all quick start actions</p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}