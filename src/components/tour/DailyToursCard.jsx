import React, { useRef, useState } from 'react';
import { BookOpen, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DAILY_TOURS } from '@/components/tour/dailyTours';
import DailyTourDialog from '@/components/tour/DailyTourDialog';
import useDailyTours from '@/components/tour/useDailyTours';

export default function DailyToursCard({ userId }) {
  const [day, setDay] = useState(null);
  const [step, setStep] = useState(0);
  const trigger = useRef(null);
  const { query, record, sections, unlocked, nextUnlock, save } = useDailyTours(userId);
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
    <section className="mx-0 mb-6 space-y-4 rounded-xl border bg-card p-4 text-card-foreground md:mx-6 md:p-5" aria-labelledby="daily-tours-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 id="daily-tours-title" className="flex items-center gap-2 font-heading text-lg font-semibold"><BookOpen size={18} aria-hidden="true" /> Getting Started Tours</h2><p className="mt-1 text-sm text-muted-foreground">Learn SaintAgent in seven tours, with seven short sections each. A new tour unlocks every 24 hours after you start.</p></div>
        {record && <p role="status" className="text-sm font-medium">{completed === DAILY_TOURS.length ? 'Series complete' : `${completed} of ${DAILY_TOURS.length} tours finished`}</p>}
      </div>
      {query.isPending ? <p role="status" className="text-sm">Loading tours…</p> : query.isError ? <div className="flex items-center gap-3"><p role="alert" className="text-sm">Tours couldn’t be loaded.</p><Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : (
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DAILY_TOURS.map((tour, index) => {
            const locked = index >= unlocked;
            const done = sections[index] === tour.sections.length;
            return <li key={tour.title}><Button type="button" variant="outline" className="h-auto min-h-10 w-full justify-start whitespace-normal px-3 text-left" disabled={locked || save.isPending} onClick={(event) => open(index, event)}>
              {locked ? <Lock aria-label="Locked" /> : done ? <CheckCircle aria-label="Completed" /> : <BookOpen aria-hidden="true" />}<span>Day {index + 1}: {tour.title}{!done && sections[index] > 0 ? ` (${sections[index]}/${tour.sections.length})` : ''}</span>
            </Button></li>;
          })}
        </ol>
      )}
      {nextUnlock && <p className="text-xs text-muted-foreground">Next tour unlocks {new Date(nextUnlock).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.</p>}
      {save.isPending && !record && <p role="status" className="text-sm">Starting your tour…</p>}
      {day === null && save.isError && <p role="alert" className="text-sm text-destructive">Your tour couldn’t start. Please try again.</p>}
      {day !== null && <DailyTourDialog day={day} step={step} busy={save.isPending} error={save.isError} onClose={() => { save.reset(); setDay(null); }} onBack={() => { save.reset(); setStep(step - 1); }} onAdvance={advance} returnFocus={() => trigger.current?.focus()} />}
    </section>
  );
}