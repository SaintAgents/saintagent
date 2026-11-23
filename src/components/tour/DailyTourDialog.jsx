import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DAILY_TOURS } from '@/components/tour/dailyTours';
import TourScreenPreview from '@/components/tour/TourScreenPreview';
import { dailyPreviewTargets } from '@/components/tour/tourPreviewTargets';
import TourPractice from '@/components/tour/TourPractice';
import TourNarration from '@/components/tour/TourNarration';
import { TOUR_PRACTICE } from '@/components/tour/tourPracticeData';

export default function DailyTourDialog({ day, step, busy, error, onClose, onBack, onAdvance, returnFocus }) {
  const scrollArea = useRef(null);
  useEffect(() => { if (scrollArea.current) scrollArea.current.scrollTop = 0; }, [day, step]);
  const tour = DAILY_TOURS[day];
  if (!tour) return null;
  const [title, description, path] = tour.sections[step];
  const lastStep = step === tour.sections.length - 1;
  const practice = TOUR_PRACTICE[day][step];
  const lessonKey = `${day}-${step}`;
  const script = `${title}. ${description}\n\nTry the ${practice[0]} practice. ${practice.slice(1).map(([action, result, fields]) => `Select ${action}. ${result}. ${fields.map(([label, value]) => `${label}: ${value.replace(/[.!?]$/, '')}.`).join(' ')}`).join(' ')}`;

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent data-dock-full-tour data-readable-surface data-hacker-draggable="true" className="inset-0 z-[10010] flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 p-0 data-[state=open]:animate-none data-[state=closed]:animate-none sm:rounded-none" hideCloseButton={busy}
        onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus(); }}>
        <header className="shrink-0 space-y-2 border-b px-4 py-3 pr-12 sm:px-8">
          <DialogTitle>{tour.reward ? tour.title : `Tour ${day + 1}: ${tour.title}`}</DialogTitle>
          <DialogDescription>Section {step + 1} of {tour.sections.length}</DialogDescription>
          <progress className="block h-2 w-full accent-primary" value={step + 1} max={tour.sections.length} aria-label="Current section" />
        </header>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,2fr)_minmax(0,3fr)] md:grid-cols-2 md:grid-rows-1">
          <TourScreenPreview key={lessonKey} targets={dailyPreviewTargets(day, step, title, path)} />
          <section aria-label="Lesson instructions" ref={scrollArea} className="min-h-0 min-w-0 space-y-4 overflow-y-auto px-4 py-5 sm:px-8">
        <div className="space-y-3" aria-live="polite">
          <h3 className="font-heading text-lg font-semibold">{title}</h3>
        </div>
        <TourNarration key={`voice-${lessonKey}`} text={script} />
        <p className="whitespace-pre-line text-sm leading-relaxed">{description}</p>
        <TourPractice key={`practice-${lessonKey}`} practice={practice} />
        {path && <Link className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline underline-offset-4" to={path} target="_blank" rel="noopener noreferrer">Open the live page in a new tab <ArrowRight size={14} aria-hidden="true" /></Link>}
        {error && <p role="alert" className="text-sm text-destructive">Progress couldn’t be saved. Please try again.</p>}
          </section>
        </div>
        <footer className="flex shrink-0 flex-wrap justify-between gap-2 border-t px-4 py-3 sm:px-8">
          <Button type="button" variant="outline" disabled={step === 0 || busy} onClick={onBack}>Back</Button>
          <Button type="button" disabled={busy} onClick={onAdvance}>{busy ? 'Saving…' : lastStep ? 'Finish tour' : 'Next section'}</Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}