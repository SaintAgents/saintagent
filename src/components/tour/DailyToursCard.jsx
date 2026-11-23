import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, CheckCircle, LayoutDashboard } from 'lucide-react';
import DeckOverviewDialog from '@/components/tour/DeckOverviewDialog';
import { Button } from '@/components/ui/button';
import { DAILY_TOURS } from '@/components/tour/dailyTours';
import DailyTourDialog from '@/components/tour/DailyTourDialog';
import useDailyTours from '@/components/tour/useDailyTours';

export default function DailyToursCard({ userId, embedded = false }) {
  const [day, setDay] = useState(null);
  const [step, setStep] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [overviewIndex, setOverviewIndex] = useState(0);
  const overviewTrigger = useRef(null);
  const trigger = useRef(null);
  const card = useRef(null);
  const { hash, key } = useLocation();
  useEffect(() => {
    if (embedded || hash !== '#daily-tours' || !userId) return;
    const frame = requestAnimationFrame(() => {
      card.current?.scrollIntoView({ block: 'start' });
      card.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [embedded, hash, key, userId]);
  const { query, record, sections, save } = useDailyTours(userId);
  const completed = sections.filter((count, index) => count === DAILY_TOURS[index].sections.length).length;
  if (!userId) return null;

  const open = (index, event) => {
    trigger.current = event.currentTarget;
    save.reset();
    const show = () => { setStep(sections[index] === DAILY_TOURS[index].sections.length ? 0 : sections[index]); setDay(index); };
    if (record) show();
    else save.mutate(undefined, { onSuccess: show });
  };
  const advance = () => {
    const count = step + 1;
    const proceed = () => count === DAILY_TOURS[day].sections.length ? setDay(null) : setStep(count);
    if (sections[day] >= count) proceed();
    else save.mutate({ day, count }, { onSuccess: proceed });
  };

  return (
    <section id={embedded ? undefined : 'daily-tours'} ref={card} tabIndex={-1} data-readable-surface className="daily-tours-library relative scroll-mt-40 space-y-4 p-4 text-card-foreground" aria-label="Tour library">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">Start with the full-screen overview or choose any topic tour. Read or listen at your own pace.</p>
        {record && <p role="status" className="text-sm font-medium">{completed === DAILY_TOURS.length ? 'Series complete' : `${completed} of ${DAILY_TOURS.length} tours finished`}</p>}
      </div>
      <Button ref={overviewTrigger} type="button" variant="outline" className="h-auto min-h-10 whitespace-normal" onClick={() => setOverviewOpen(true)}><LayoutDashboard aria-hidden="true" /> Command Deck Overview · Full screen</Button>
      {query.isPending ? <p role="status" className="text-sm">Loading tours…</p> : query.isError ? <div className="flex items-center gap-3"><p role="alert" className="text-sm">Tours couldn’t be loaded.</p><Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : (
        <ol className="daily-tours-grid grid grid-cols-1 gap-2">
          {DAILY_TOURS.map((tour, index) => {
            const done = sections[index] === tour.sections.length;
            return <li key={tour.title} className="min-w-0"><Button type="button" variant="outline" className="h-full min-h-10 w-full justify-start whitespace-normal px-3 text-left" disabled={save.isPending} onClick={(event) => open(index, event)}>
              {done ? <CheckCircle aria-label="Completed; select to replay" /> : <BookOpen aria-hidden="true" />}<span className="min-w-0 break-words">{tour.actionLabel ? `${done ? 'Replay' : sections[index] ? 'Resume' : 'Start'} ${tour.actionLabel}` : `Tour ${index + 1}: ${tour.title}`}{!done && sections[index] > 0 ? ` (${sections[index]}/${tour.sections.length})` : ''}</span>
            </Button></li>;
          })}
        </ol>
      )}
      {overviewOpen && <DeckOverviewDialog index={overviewIndex} onSelect={setOverviewIndex} onClose={() => setOverviewOpen(false)} returnFocus={target => {
        overviewTrigger.current?.focus({ preventScroll: true });
        if (!target?.isConnected) return;
        target.scrollIntoView({ block: 'center', inline: 'nearest' });
        const outline = { outline: '3px dashed currentColor', outlineOffset: '-3px' };
        target.animate?.([outline, outline], { duration: 5000 });
      }} />}
      {save.isPending && !record && <p role="status" className="text-sm">Starting your tour…</p>}
      {day === null && save.isError && <p role="alert" className="text-sm text-destructive">Your tour couldn’t start. Please try again.</p>}
      {day !== null && <DailyTourDialog day={day} step={step} busy={save.isPending} error={save.isError} onClose={() => { save.reset(); setDay(null); }} onBack={() => { save.reset(); setStep(step - 1); }} onAdvance={advance} returnFocus={() => trigger.current?.focus()} />}
    </section>
  );
}