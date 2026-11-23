import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DeckOverviewDialog from '@/components/tour/DeckOverviewDialog';

export default function FirstVisitTour({ onboarding, userEmail }) {
  const [index, setIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: finished => base44.entities.OnboardingProgress.update(onboarding.id, {
      welcome_overview_pending: false,
      ...(finished && { tour_completed: true }),
    }),
    onSuccess: updated => {
      try { localStorage.setItem('tourDismissed', '1'); } catch {}
      client.setQueryData(['onboardingProgress', userEmail], records =>
        records?.map(record => record.id === onboarding.id ? { ...record, ...updated, welcome_overview_pending: false } : record));
    },
  });
  const close = finished => { if (!save.isPending) save.mutate(finished); };

  return <DeckOverviewDialog index={index} onSelect={setIndex} firstVisit showAll={showAll}
    onToggleSections={() => { setShowAll(!showAll); setIndex(0); }}
    onClose={() => close(false)} onFinish={() => close(true)} busy={save.isPending} saveError={save.isError}
    returnFocus={() => document.querySelector('#app-topbar [data-tour-command-icon]')?.focus({ preventScroll: true })} />;
}