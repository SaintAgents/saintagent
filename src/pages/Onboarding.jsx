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
import Step2Region from '@/components/onboarding/Step2Region';
import Step3Skills from '@/components/onboarding/Step3Skills';
import Step4Desires from '@/components/onboarding/Step4Desires';
import Step5Hopes from '@/components/onboarding/Step5Hopes';
import Step6Actions from '@/components/onboarding/Step6Actions';

const STEPS = [
  { id: 0, title: "Welcome", component: Step0Welcome, skippable: false },
  { id: 1, title: "Identity", component: Step1Identity, skippable: false },
  { id: 2, title: "Region", component: Step2Region, skippable: true },
  { id: 3, title: "Skills", component: Step3Skills, skippable: false },
  { id: 4, title: "Desires", component: Step4Desires, skippable: false },
  { id: 5, title: "Hopes", component: Step5Hopes, skippable: true },
  { id: 6, title: "Actions", component: Step6Actions, skippable: false }
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
      // Onboarding complete
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
    if (STEPS[currentStep].skippable) {
      handleStepComplete({});
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
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
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
            </span>
            <span className="text-sm text-violet-600 font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 mb-6">
          <CurrentStepComponent
            data={stepData[currentStep] || {}}
            onComplete={handleStepComplete}
            user={user}
          />
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

          {STEPS[currentStep].skippable && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-500"
            >
              Skip for now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}