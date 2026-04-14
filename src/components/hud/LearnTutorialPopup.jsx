import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, EyeOff, X, ArrowRight, Coins,
  Users, Share2, Folder, BarChart3, MessageCircle, Globe, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TUTORIALS = [
  {
    id: 'crm_basics',
    title: 'Master Your CRM',
    description: 'Learn to manage contacts, track deals, and build your network pipeline.',
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 border-violet-200',
    page: 'CRM',
    reward: 0.20,
  },
  {
    id: 'share_contacts',
    title: 'Share & Federate Contacts',
    description: 'Discover how to share contacts with teammates and federate your network.',
    icon: Share2,
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
    page: 'CRM',
    reward: 0.20,
  },
  {
    id: 'project_pipeline',
    title: 'Navigate the Project Pipeline',
    description: 'Understand how projects flow from intake through AI evaluation to funding.',
    icon: Folder,
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 border-amber-200',
    page: 'Projects',
    reward: 0.20,
  },
  {
    id: 'marketplace_listing',
    title: 'Create a Marketplace Listing',
    description: 'Offer your skills and services to earn GGG through the marketplace.',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50 border-blue-200',
    page: 'Marketplace',
    reward: 0.20,
  },
  {
    id: 'missions_quests',
    title: 'Join Missions & Quests',
    description: 'Complete missions to earn rewards, rank up, and contribute to the collective.',
    icon: Target,
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 border-rose-200',
    page: 'Missions',
    reward: 0.20,
  },
  {
    id: 'messaging_collab',
    title: 'Messages & Collaboration',
    description: 'Use DMs, group chats, shared docs, and co-watch sessions.',
    icon: MessageCircle,
    color: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50 border-indigo-200',
    page: 'Messages',
    reward: 0.20,
  },
];

const STORAGE_KEY = 'learnPopup_hidden';
const COMPLETED_KEY = 'learnPopup_completed';
const SHOW_TIMESTAMPS_KEY = 'learnPopup_showTimestamps';

const FREQUENCY_COOLDOWNS = {
  every_visit: { maxShows: 999, windowMs: 0 },
  once_per_hour: { maxShows: 1, windowMs: 60 * 60 * 1000 },
  once_per_day: { maxShows: 1, windowMs: 24 * 60 * 60 * 1000 },
  three_per_week: { maxShows: 3, windowMs: 7 * 24 * 60 * 60 * 1000 },
  once_per_week: { maxShows: 1, windowMs: 7 * 24 * 60 * 60 * 1000 },
  three_per_month: { maxShows: 3, windowMs: 30 * 24 * 60 * 60 * 1000 },
  once_per_month: { maxShows: 1, windowMs: 30 * 24 * 60 * 60 * 1000 },
};

function canShowPopup(frequency) {
  const rule = FREQUENCY_COOLDOWNS[frequency] || FREQUENCY_COOLDOWNS.once_per_day;
  if (rule.windowMs === 0) return true;
  try {
    const timestamps = JSON.parse(localStorage.getItem(SHOW_TIMESTAMPS_KEY) || '[]');
    const cutoff = Date.now() - rule.windowMs;
    const recent = timestamps.filter(t => t > cutoff);
    return recent.length < rule.maxShows;
  } catch { return true; }
}

function recordShow() {
  try {
    const timestamps = JSON.parse(localStorage.getItem(SHOW_TIMESTAMPS_KEY) || '[]');
    timestamps.push(Date.now());
    // Keep only last 30 entries
    localStorage.setItem(SHOW_TIMESTAMPS_KEY, JSON.stringify(timestamps.slice(-30)));
  } catch {}
}

export default function LearnTutorialPopup({ profile, onRewardGGG }) {
  const [visible, setVisible] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  // Fetch admin settings
  const { data: settingsRecords } = useQuery({
    queryKey: ['platformSetting', 'learn_popup_config'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'learn_popup_config' }),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const adminConfig = React.useMemo(() => {
    const defaults = { enabled: true, frequency: 'once_per_day', reward_amount: 0.20, delay_seconds: 5, max_tutorials_shown: 3 };
    if (!settingsRecords?.[0]?.value) return defaults;
    try { return { ...defaults, ...JSON.parse(settingsRecords[0].value) }; } catch { return defaults; }
  }, [settingsRecords]);

  useEffect(() => {
    if (!adminConfig.enabled) return;
    const hidden = localStorage.getItem(STORAGE_KEY) === 'true';
    if (hidden) return;
    if (!canShowPopup(adminConfig.frequency)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      recordShow();
    }, (adminConfig.delay_seconds || 5) * 1000);

    return () => clearTimeout(timer);
  }, [adminConfig]);

  // Listen for manual open event from avatar menu
  useEffect(() => {
    const handleOpen = () => setVisible(true);
    document.addEventListener('openLearnPopup', handleOpen);
    return () => document.removeEventListener('openLearnPopup', handleOpen);
  }, []);

  const getCompletedTutorials = () => {
    try {
      return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
    } catch { return []; }
  };

  const completedIds = getCompletedTutorials();
  const rewardAmount = adminConfig.reward_amount;
  const tutorialsWithReward = TUTORIALS.map(t => ({ ...t, reward: rewardAmount }));
  const availableTutorials = tutorialsWithReward.filter(t => !completedIds.includes(t.id));

  const handleHidePermanently = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleStartTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
  };

  const handleCompleteTutorial = async (tutorial) => {
    const completed = getCompletedTutorials();
    if (!completed.includes(tutorial.id)) {
      completed.push(tutorial.id);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));

      // Award GGG
      if (profile?.id && onRewardGGG) {
        onRewardGGG(tutorial.reward, `Completed tutorial: ${tutorial.title}`);
      }
    }
    setSelectedTutorial(null);
    setVisible(false);
  };

  if (!visible || availableTutorials.length === 0 || !adminConfig.enabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 right-3 w-80 z-[9998] rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-bold text-white">Learn & Earn</h3>
                <p className="text-[10px] text-white/80">Complete tutorials for GGG rewards</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleHidePermanently}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Don't show again"
              >
                <EyeOff className="w-4 h-4 text-white/90" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4 text-white/90" />
              </button>
            </div>
          </div>

          {/* Tutorial Detail View */}
          {selectedTutorial ? (
            <TutorialDetail
              tutorial={selectedTutorial}
              onBack={() => setSelectedTutorial(null)}
              onComplete={handleCompleteTutorial}
            />
          ) : (
            /* Tutorial List */
            <div className="p-3 max-h-80 overflow-y-auto space-y-2">
              {availableTutorials.slice(0, adminConfig.max_tutorials_shown).map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleStartTutorial(t)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all hover:shadow-md group",
                      t.bgLight
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", t.color)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-xs">{t.title}</h4>
                          <Badge className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0 h-4 shrink-0">
                            <Coins className="w-2.5 h-2.5 mr-0.5" />
                            {t.reward} GGG
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{t.description}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}

              {availableTutorials.length > adminConfig.max_tutorials_shown && (
                <p className="text-center text-[10px] text-slate-400 pt-1">
                  +{availableTutorials.length - adminConfig.max_tutorials_shown} more tutorials available
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TutorialDetail({ tutorial, onBack, onComplete }) {
  const [step, setStep] = useState(0);
  const Icon = tutorial.icon;

  const steps = getTutorialSteps(tutorial.id);

  const isLastStep = step === steps.length - 1;

  return (
    <div className="p-4 space-y-3">
      {/* Tutorial header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-xs">
          ← Back
        </button>
        <div className="flex-1" />
        <Badge className="bg-amber-100 text-amber-700 text-[10px]">
          <Coins className="w-3 h-3 mr-1" />
          Earn {tutorial.reward} GGG
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", tutorial.color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm">{tutorial.title}</h4>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-amber-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="bg-slate-50 rounded-lg p-3 min-h-[80px]">
        <p className="text-xs font-semibold text-slate-700 mb-1">
          Step {step + 1} of {steps.length}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">{steps[step]}</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {step > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 flex-1"
            onClick={() => setStep(s => s - 1)}
          >
            Previous
          </Button>
        )}
        {isLastStep ? (
          <Button
            size="sm"
            className="text-xs h-8 flex-1 bg-amber-500 hover:bg-amber-600"
            onClick={() => onComplete(tutorial)}
          >
            <Coins className="w-3 h-3 mr-1" />
            Complete & Earn {tutorial.reward} GGG
          </Button>
        ) : (
          <Button
            size="sm"
            className="text-xs h-8 flex-1 bg-violet-600 hover:bg-violet-700"
            onClick={() => setStep(s => s + 1)}
          >
            Next
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Link to page */}
      <Link
        to={`/${tutorial.page}`}
        className="block text-center text-[10px] text-violet-600 hover:text-violet-700 underline"
      >
        Open {tutorial.page} page to follow along →
      </Link>
    </div>
  );
}

function getTutorialSteps(id) {
  const steps = {
    crm_basics: [
      'Navigate to the CRM page from the sidebar. This is your contact management hub where you can track leads, partners, and collaborators.',
      'Click "Add Contact" to create a new entry. Fill in their name, email, organization, and tags to categorize them.',
      'Use the Pipeline view to drag contacts through stages: Lead → Qualified → Proposal → Closed. This helps track your relationship progression.',
      'Try the AI Assistant in the CRM — it can suggest follow-ups, draft outreach emails, and score your contacts automatically.',
      'Congratulations! You now know CRM basics. Use it daily to grow your network and track opportunities.',
    ],
    share_contacts: [
      'In the CRM, find a contact you want to share. Click the three-dot menu on their card.',
      'Select "Share Contact" to send a copy to a team member. They\'ll receive a notification with the contact details.',
      'Use the Federation panel (network icon) to see contacts shared across your team. This creates a collective intelligence network.',
      'Set access permissions: "View Only" lets teammates see the contact, "Full Access" lets them edit and interact.',
      'You\'re now a contact sharing pro! Federated contacts help the entire community grow together.',
    ],
    project_pipeline: [
      'Go to the Projects page. Each project goes through a 4-phase AI evaluation: Ethical Firewall → Scoring → Risk Model → Decision.',
      'Click "+ Add Project" to start the 8-step intake wizard. Provide basic info, funding details, impact metrics, and alignment statement.',
      'After submission, the AI evaluates your project automatically. Check the "Evaluation" tab on any project to see its scores.',
      'Projects are tiered: Approve & Fund, Incubate & De-risk, Review & Re-evaluate, or Decline. Each tier has specific next steps.',
      'Track progress using the Project Detail view — manage team members, discussions, updates, and milestones all in one place.',
    ],
    marketplace_listing: [
      'Navigate to the Marketplace from the sidebar. This is where you can offer services and find collaborators.',
      'Click "Create Listing" and choose between "Offer" (you provide a service) or "Request" (you need help).',
      'Set your pricing — you can charge in GGG tokens, time credits, or fiat. Free listings are great for building reputation.',
      'Add skills, portfolio links, and availability to make your listing stand out. Recurring bookings are available for ongoing services.',
      'Once published, your listing appears in the marketplace. Respond to booking requests promptly to build your reputation!',
    ],
    missions_quests: [
      'Visit the Missions page to see available missions. Each mission has objectives, milestones, and rewards.',
      'Click "Join" on a mission that matches your skills. Some missions are open, others require approval.',
      'Track your progress through milestones and tasks. Complete each task by clicking the checkbox when done.',
      'Earn GGG, rank points, and badges upon mission completion. Check the Quests page for individual challenges too.',
      'Create your own missions as a leader! Use the AI Mission Generator for inspiration and structure.',
    ],
    messaging_collab: [
      'Open Messages from the sidebar. You can send direct messages to any member by searching their name or handle.',
      'Start a group chat by clicking "New Group" — great for project teams, circles, or mission squads.',
      'Use Shared Docs for real-time collaborative writing. Click the document icon in any conversation to create one.',
      'Try Co-Watch sessions to browse and discuss content together in real-time with your connections.',
      'Pro tip: Set your DM policy in Settings to control who can message you — Everyone, Followers, Mutual follows, or None.',
    ],
  };
  return steps[id] || ['Tutorial content coming soon.'];
}