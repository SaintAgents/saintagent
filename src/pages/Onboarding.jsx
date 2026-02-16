import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import Step0Welcome from '@/components/onboarding/Step0Welcome';
import Step1Identity from '@/components/onboarding/Step1Identity';
import StepMystical from '@/components/onboarding/StepMystical';
import Step2Region from '@/components/onboarding/Step2Region';
import StepValues from '@/components/onboarding/StepValues';
import Step3Skills from '@/components/onboarding/Step3Skills';
import Step4Desires from '@/components/onboarding/Step4Desires';
import Step5Hopes from '@/components/onboarding/Step5Hopes';
import Step6Actions from '@/components/onboarding/Step6Actions';
import Step7Dating from '@/components/onboarding/Step7Dating';
import StepDatingIntro from '@/components/onboarding/StepDatingIntro';
import StepAttachmentStyle from '@/components/onboarding/StepAttachmentStyle';
import StepConflictStyle from '@/components/onboarding/StepConflictStyle';
import StepRelationshipValues from '@/components/onboarding/StepRelationshipValues';
import StepCompatibilityTutorial from '@/components/onboarding/StepCompatibilityTutorial';
import StepPartnerPreferences from '@/components/onboarding/StepPartnerPreferences';
import { attachAffiliateToUser, activateReferral } from '@/components/affiliate/AffiliateTracker';
import AIOnboardingAssistant from '@/components/ai/AIOnboardingAssistant';
import OnboardingRewardsBar from '@/components/onboarding/OnboardingRewardsBar';
import OnboardingTrackSelector from '@/components/onboarding/OnboardingTrackSelector';
import EmailConfirmationBanner from '@/components/onboarding/EmailConfirmationBanner';

// Step for selecting onboarding track
const StepTrackSelector = ({ data, onComplete }) => {
  const [selectedTrack, setSelectedTrack] = React.useState(data?.track || null);
  return (
    <OnboardingTrackSelector 
      selectedTrack={selectedTrack}
      onSelectTrack={setSelectedTrack}
      onContinue={() => onComplete({ track: selectedTrack })}
    />
  );
};

const STEPS = [
  { id: 0, title: "Welcome", component: Step0Welcome, skippable: false },
  { id: 1, title: "Your Path", component: StepTrackSelector, skippable: false },
  { id: 2, title: "Identity", component: Step1Identity, skippable: false },
  { id: 3, title: "Mystical", component: StepMystical, skippable: true },
  { id: 4, title: "Region", component: Step2Region, skippable: true },
  { id: 5, title: "Values", component: StepValues, skippable: false },
  { id: 6, title: "Skills", component: Step3Skills, skippable: false },
  { id: 7, title: "Desires", component: Step4Desires, skippable: false },
  { id: 8, title: "Hopes", component: Step5Hopes, skippable: true },
  // Dating onboarding flow with explanations
  { id: 9, title: "Dating Intro", component: StepDatingIntro, skippable: true },
  { id: 10, title: "Attachment", component: StepAttachmentStyle, skippable: true },
  { id: 11, title: "Conflict Style", component: StepConflictStyle, skippable: true },
  { id: 12, title: "Relationship Values", component: StepRelationshipValues, skippable: true },
  { id: 13, title: "Connection", component: Step7Dating, skippable: true },
  { id: 14, title: "Partner Preferences", component: StepPartnerPreferences, skippable: true },
  { id: 15, title: "Match Tutorial", component: StepCompatibilityTutorial, skippable: true },
  { id: 16, title: "Actions", component: Step6Actions, skippable: false }
];

export default function Onboarding() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});

  // Fetch user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch onboarding progress
  const { data: progressRecords } = useQuery({
    queryKey: ['onboardingProgress', user?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: user.email }),
    enabled: !!user
  });
  const progress = progressRecords?.[0];

  // Load saved progress
  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.current_step || 0);
      setStepData(progress.step_data || {});
    }
  }, [progress]);

  // If progress already complete (e.g., user skipped through fast), go to Command Deck
  useEffect(() => {
    if (progress?.status === 'complete') {
      try { localStorage.setItem('onboardingJustCompleted', '1'); } catch {}
      window.location.href = createPageUrl('CommandDeck');
    }
  }, [progress]);

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (progress) {
        return base44.entities.OnboardingProgress.update(progress.id, data);
      } else {
        return base44.entities.OnboardingProgress.create({
          user_id: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingProgress'] });
    }
  });

  const handleStepComplete = async (data) => {
    const newStepData = { ...stepData, [currentStep]: data };
    setStepData(newStepData);

    const completedSteps = [...new Set([...(progress?.completed_steps || []), currentStep])];
    
    await saveProgressMutation.mutateAsync({
      current_step: currentStep + 1,
      completed_steps: completedSteps,
      step_data: newStepData,
      status: currentStep === STEPS.length - 1 ? 'complete' : 'in_progress'
    });

    if (currentStep === STEPS.length - 1) {
              // Onboarding complete: process affiliate referral first
              try {
                await attachAffiliateToUser(user.email, base44);
                await activateReferral(user.email, base44);
              } catch (e) {
                console.error('Affiliate processing failed:', e);
              }

              // Send welcome message, notification, clear old notifications, then redirect
              try {
            const firstName = user?.full_name?.split(' ')?.[0] || 'there';
            const fromEmail = 'admin@saintagents.app';
            const supportEmail = 'support@saintagents.app';
            const subject = 'Welcome to Saint Agents – Your Mission Just Went Live';
            const body = `Hi ${firstName},\n\nWelcome to Saint Agents. 🌟\nYour account is now active, and your Saint profile has been initiated inside the GGG-powered ecosystem. From here forward, every action—every mission, every connection, every contribution—can become part of a higher-aligned impact trail.\n\nWhat this means for you\nAs a Saint Agent, you’re not just “using a platform.” You’re stepping into a living system designed to:\n• Track real value you create through missions, services, and exchanges\n• Grow your GGG earnings in a secured, clean ledger\n• Build a visible reputation + trust profile that reflects who you truly are in the work\n\nOver time, you’ll unlock roles, badges, and access tiers that recognize your integrity, consistency, and service—not just your volume.\n\nYour first steps\nTo get started, we recommend:\n1) Complete Your Profile — add a clear photo, a short bio, and your main skills/offers.\n2) Review the Mission & Marketplace areas — browse missions to accept/support and post your first offer or service.\n3) Read the Saint Agent Ethos — Truth over manipulation • Service over extraction • Long-term alignment over quick wins.\n\nHow your trust & reputation grow\nBehind the scenes, the system is watching for follow-through, integrity, and contribution. As you complete missions, earn GGG, and interact with others, you’ll start to see:\n• Your Reputation Rank (from Seeker upward)\n• Your Trust Meter (0–100%)\n• Your badges unlocking (e.g., Mentor, Steward, Healer, Market Maker, etc.)\n\nNeed help?\nCheck the Help / FAQ section in your dashboard or reach out to support at ${supportEmail}.\n\nThank you for stepping in. The fact that you’re here says something about who you are—and what you’re ready to build.\n\nWelcome to Saint Agents. Your mission is now in motion.\n\nWith respect,\nThe Saint Agents Team`;

            // Ensure basic profile exists first
            const existingProfiles = await base44.entities.UserProfile.filter({ user_id: user.email });
            if (!existingProfiles?.length) {
              const baseHandle = (user.full_name?.split(' ')?.[0] || user.email.split('@')[0] || 'agent').toLowerCase().replace(/[^a-z0-9_]/g, '');
              let handle = baseHandle || 'agent';
              const collision = await base44.entities.UserProfile.filter({ handle });
              if (collision?.length) {
                handle = `${handle}${Math.floor(Math.random() * 1000)}`;
              }
              // Create profile WITHOUT sa_number - let assignSaNumber handle it
              await base44.entities.UserProfile.create({
                user_id: user.email,
                display_name: user.full_name || handle,
                handle
              });
            }

            // Use the proper incremental SA# assignment function
            try {
              const saResult = await base44.functions.invoke('assignSaNumber', {});
              if (saResult?.data?.sa_number && saResult?.data?.assigned) {
                await base44.entities.Notification.create({
                  user_id: user.email,
                  type: 'system',
                  title: 'Saint Agent ID Assigned',
                  message: `Your Saint Agent number is SA#${saResult.data.sa_number}.`,
                  priority: 'normal'
                });
              }
            } catch (saErr) {
              console.error('SA# assignment failed:', saErr);
            }

            // Clear any existing notifications and messages for this brand-new user
            const existingNotifs = await base44.entities.Notification.filter({ user_id: user.email });
            await Promise.all((existingNotifs || []).map(n => base44.entities.Notification.delete(n.id)));

            // Clear messages (both outgoing and incoming)
            const msgsOut = await base44.entities.Message.filter({ from_user_id: user.email });
            const msgsIn = await base44.entities.Message.filter({ to_user_id: user.email });
            const msgsToDelete = [...(msgsOut || []), ...(msgsIn || [])];
            if (msgsToDelete.length) {
              await Promise.all(msgsToDelete.map(m => base44.entities.Message.delete(m.id)));
            }

            // Add welcome notification
            await base44.entities.Notification.create({
              user_id: user.email,
              type: 'system',
              title: subject,
              message: 'Welcome aboard! Your account is active. Open your Command Deck to begin your first actions.',
              action_url: createPageUrl('CommandDeck'),
              action_label: 'Open Command Deck',
              priority: 'normal'
            });

            // Add welcome message from admin
            await base44.entities.Message.create({
              conversation_id: [fromEmail, user.email].sort().join('_'),
              from_user_id: fromEmail,
              to_user_id: user.email,
              from_name: 'Saint Agents Team',
              to_name: user.full_name,
              content: `Subject: ${subject}\n\n${body}`
            });
          } catch (e) {
            // Let errors bubble to console but still proceed with redirect
            console.error('Post-onboarding welcome flow failed', e);
          }

          // Gamification: award points and badge for profile completion
          // NOTE: GGG reward is handled automatically by the entity automation on OnboardingProgress update
          try {
            const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
            const profileToUpdate = profiles?.[0];
            if (profileToUpdate) {
              // Award engagement points
              await base44.entities.UserProfile.update(profileToUpdate.id, {
                engagement_points: (profileToUpdate.engagement_points || 0) + 100
              });
              
              // Award profile complete badge
              const existing = await base44.entities.Badge.filter({ user_id: user.email, code: 'profile_complete' });
              if (!(existing && existing.length)) {
                await base44.entities.Badge.create({ user_id: user.email, code: 'profile_complete', status: 'active' });
              }

              // Create Starter Mission Quest for new users
              try {
                const existingStarterQuest = await base44.entities.Quest.filter({ 
                  user_id: user.email, 
                  quest_template_id: 'starter_mission' 
                });
                if (!existingStarterQuest?.length) {
                  await base44.entities.Quest.create({
                    user_id: user.email,
                    quest_template_id: 'starter_mission',
                    title: 'Your First Mission',
                    description: 'Complete these starter tasks to learn the platform and earn your first rewards!',
                    quest_type: 'pathway',
                    category: 'onboarding',
                    rarity: 'uncommon',
                    status: 'active',
                    reward_rp: 50,
                    reward_ggg: 25,
                    reward_badge: 'starter_complete',
                    target_count: 3,
                    current_count: 0,
                    pathway_data: {
                      pathway_id: 'starter',
                      pathway_name: 'Starter Mission',
                      current_stage: 1,
                      total_stages: 3,
                      stages: [
                        { stage_num: 1, title: 'Follow 3 People', target_action: 'follow_user', target_count: 3, current_count: 0, completed: false },
                        { stage_num: 2, title: 'Create Your First Post', target_action: 'create_post', target_count: 1, current_count: 0, completed: false },
                        { stage_num: 3, title: 'Join 1 Mission', target_action: 'join_mission', target_count: 1, current_count: 0, completed: false }
                      ]
                    },
                    started_at: new Date().toISOString()
                  });

                  // Add notification about the starter quest
                  await base44.entities.Notification.create({
                    user_id: user.email,
                    type: 'system',
                    title: '🚀 Your First Mission Awaits!',
                    message: 'Complete your Starter Mission: Follow 3 people, create a post, and join a mission to earn 25 GGG and 50 RP!',
                    action_url: createPageUrl('Quests'),
                    action_label: 'View Quest',
                    priority: 'high'
                  });
                }
              } catch (questErr) {
                console.error('Starter quest creation failed:', questErr);
              }
            }
          } catch (e) {
            console.error('Gamification award failed', e);
          }

          // Mark local completion to avoid race redirection and go to Command Deck
          try { localStorage.setItem('onboardingJustCompleted', '1'); } catch {}
          window.location.href = createPageUrl('CommandDeck');
        } else {
          setCurrentStep(currentStep + 1);
        }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleStepComplete({});
  };

  const CurrentStepComponent = STEPS[currentStep]?.component;
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  // Safety check: if currentStep is out of bounds, clamp to last step
  useEffect(() => {
    if (currentStep >= STEPS.length) {
      setCurrentStep(STEPS.length - 1);
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Email Confirmation Banner */}
        {user && <EmailConfirmationBanner user={user} />}
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 mb-4 shadow-lg shadow-violet-200">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to SaintAgent</h1>
          <p className="text-slate-600">Complete your profile to unlock powerful matches</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {Math.min(currentStep + 1, STEPS.length)} of {STEPS.length}: {STEPS[currentStep]?.title || ''}
            </span>
            <span className="text-sm text-violet-600 font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 mb-6">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={stepData[currentStep] || {}}
              onComplete={handleStepComplete}
              onNext={() => handleStepComplete(stepData[currentStep] || {})}
              onUpdate={async (data) => {
                const newStepData = { ...stepData, [currentStep]: data };
                setStepData(newStepData);
              }}
              onChange={(data) => {
                const newStepData = { ...stepData, [currentStep]: data };
                setStepData(newStepData);
              }}
              profile={stepData[currentStep]}
              user={user}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-500"
            >
              Skip
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                // Skip all remaining steps - go directly to final step so handleStepComplete runs
                setCurrentStep(STEPS.length - 1);
              }}
              className="text-amber-600 hover:text-amber-700"
            >
              Skip All
            </Button>
          </div>
        </div>

        {/* GGG Rewards Progress */}
        <div className="mt-6">
          <OnboardingRewardsBar 
            currentStep={currentStep} 
            completedSteps={progress?.completed_steps || []} 
          />
        </div>

        {/* Section Navigator */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Jump to Section</p>
          <div className="flex flex-wrap gap-2">
            {STEPS.slice(currentStep + 1, currentStep + 6).map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 transition-colors"
              >
                {step.title}
              </button>
            ))}
            {currentStep + 6 < STEPS.length && (
              <span className="px-3 py-1.5 text-xs text-slate-400">+{STEPS.length - currentStep - 6} more</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Onboarding Assistant */}
      <AIOnboardingAssistant 
        currentStep={currentStep}
        stepTitle={STEPS[currentStep]?.title}
        userGoals={stepData[6]?.desires || stepData[4]?.values || []}
      />
    </div>
  );
}