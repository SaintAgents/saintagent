import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

const TOTAL_STEPS = 10; // Keep in sync with pages/Onboarding

export default function SetupProfileBanner() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: progressRecords } = useQuery({
    queryKey: ['onboardingProgress', user?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: user.email }),
    enabled: !!user
  });
  const progress = progressRecords?.[0];

  if (!user) return null;
  if (progress?.status === 'complete') return null;

  const currentStep = Math.min(progress?.current_step ?? 0, TOTAL_STEPS - 1);
  const percent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
  const hasStarted = !!progress;

  return (
    <Card className="mb-6 border-violet-200 bg-white">
      <CardContent className="p-4 md:p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {hasStarted ? 'Continue setting up your profile' : 'Set up your profile to unlock great matches'}
              </p>
              {hasStarted && (
                <div className="mt-2">
                  <Progress value={percent} className="h-2" />
                  <p className="text-xs text-slate-500 mt-1">{percent}% complete</p>
                </div>
              )}
            </div>
            <Button
              className="rounded-xl bg-violet-600 hover:bg-violet-700"
              onClick={() => { window.location.href = createPageUrl('Onboarding'); }}
            >
              {hasStarted ? 'Resume Setup' : 'Setup Profile'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}