import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, Circle, Coins, ArrowRight, Sparkles,
  User, Compass, Users, Target, Share2, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASES = [
  { 
    key: 'phase_1_profile', 
    label: 'Claim Your Identity', 
    desc: 'Set up your SA number & profile',
    icon: User,
    ggg: 0.15,
    action: 'Profile',
    actionLabel: 'Complete Profile'
  },
  { 
    key: 'phase_2_assessments', 
    label: 'Define Your Path', 
    desc: 'Complete spiritual & skills assessments',
    icon: Compass,
    ggg: 0.15,
    action: 'Profile',
    actionLabel: 'Add Assessments'
  },
  { 
    key: 'phase_3_matches', 
    label: 'Discover Alignment', 
    desc: 'View your first AI-powered matches',
    icon: Users,
    ggg: 0.10,
    action: 'Matches',
    actionLabel: 'View Matches'
  },
  { 
    key: 'phase_4_mission', 
    label: 'Join the Mission', 
    desc: 'Join or create your first mission',
    icon: Target,
    ggg: 0.20,
    action: 'Missions',
    actionLabel: 'Browse Missions'
  },
  { 
    key: 'phase_5_introduction', 
    label: 'Make a Connection', 
    desc: 'Send your first message or follow someone',
    icon: Share2,
    ggg: 0.15,
    action: 'Messages',
    actionLabel: 'Start Connecting'
  },
  { 
    key: 'phase_6_ggg', 
    label: 'Earn Your First GGG', 
    desc: 'Complete an action that earns rewards',
    icon: Award,
    ggg: 0.10,
    action: 'Marketplace',
    actionLabel: 'Explore Ways to Earn'
  },
  { 
    key: 'phase_7_synchronicity', 
    label: 'Activate Synchronicity', 
    desc: 'Unlock the Synchronicity Engine',
    icon: Zap,
    ggg: 0.15,
    action: 'CommandDeck',
    actionLabel: 'Go to Command Deck'
  },
];

const TOTAL_GGG = PHASES.reduce((sum, p) => sum + p.ggg, 0);

export default function ActivationChecklist({ compact = false }) {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['activationChecklist', currentUser?.email],
    queryFn: () => base44.entities.ActivationChecklist.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const checklist = checklists[0];

  // Create checklist if doesn't exist
  const createMutation = useMutation({
    mutationFn: () => base44.entities.ActivationChecklist.create({ user_id: currentUser.email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activationChecklist'] })
  });

  React.useEffect(() => {
    if (currentUser?.email && !isLoading && checklists.length === 0) {
      createMutation.mutate();
    }
  }, [currentUser?.email, isLoading, checklists.length]);

  if (isLoading || !checklist) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const completedCount = PHASES.filter(p => checklist[p.key]).length;
  const progress = (completedCount / PHASES.length) * 100;
  const isFullyActivated = checklist.fully_activated;
  const nextPhase = PHASES.find(p => !checklist[p.key]);

  if (isFullyActivated && compact) {
    return null; // Hide when complete in compact mode
  }

  if (isFullyActivated) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Fully Activated!</h3>
            <p className="text-violet-200 text-sm">You've completed all 7 phases</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-violet-100">
          <Coins className="w-4 h-4" />
          <span className="font-semibold">{(checklist.total_ggg_earned || TOTAL_GGG).toFixed(2)} GGG earned</span>
        </div>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Activation</h3>
          </div>
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {completedCount}/7
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mb-3" />
        {nextPhase && (
          <Button 
            size="sm" 
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={() => window.location.href = createPageUrl(nextPhase.action)}
          >
            {nextPhase.label}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            Activation Checklist
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete all phases to unlock full platform access
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-violet-600">{completedCount}/7</div>
          <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
            <Coins className="w-3 h-3 text-amber-500" />
            {TOTAL_GGG.toFixed(2)} GGG available
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-6" />

      <div className="space-y-2">
        <AnimatePresence>
          {PHASES.map((phase, i) => {
            const isComplete = checklist[phase.key];
            const isCurrent = !isComplete && (i === 0 || checklist[PHASES[i-1].key]);
            const Icon = phase.icon;

            return (
              <motion.div
                key={phase.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  isComplete && "bg-emerald-50 dark:bg-emerald-900/20",
                  isCurrent && "bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-500/30",
                  !isComplete && !isCurrent && "bg-slate-50 dark:bg-slate-700/30 opacity-60"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isComplete && "bg-emerald-500 text-white",
                  isCurrent && "bg-violet-500 text-white",
                  !isComplete && !isCurrent && "bg-slate-200 dark:bg-slate-600 text-slate-400"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium",
                      isComplete && "text-emerald-700 dark:text-emerald-300",
                      isCurrent && "text-violet-700 dark:text-violet-300",
                      !isComplete && !isCurrent && "text-slate-500"
                    )}>
                      {phase.label}
                    </span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      <Coins className="w-3 h-3 mr-1 text-amber-500" />
                      {phase.ggg}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{phase.desc}</p>
                </div>

                {isCurrent && (
                  <Button 
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700"
                    onClick={() => window.location.href = createPageUrl(phase.action)}
                  >
                    {phase.actionLabel}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {isComplete && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}