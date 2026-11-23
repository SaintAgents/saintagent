import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DAILY_TOURS } from '@/components/tour/dailyTours';

export default function DailyTourDialog({ day, step, busy, error, onClose, onBack, onAdvance, returnFocus }) {
  const tour = DAILY_TOURS[day];
  if (!tour) return null;
  const [title, description, path] = tour.sections[step];
  const lastStep = step === tour.sections.length - 1;

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto text-foreground" hideCloseButton={busy}
        onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus(); }}>
        <div className="space-y-2 pr-6">
          <DialogTitle>Day {day + 1}: {tour.title}</DialogTitle>
          <DialogDescription>Section {step + 1} of {tour.sections.length}</DialogDescription>
        </div>
        <progress className="h-2 w-full accent-primary" value={step + 1} max={tour.sections.length} aria-label="Current section" />
        <div className="space-y-3" aria-live="polite">
          <h3 className="font-heading text-lg font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
        {path && <Link className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline underline-offset-4" to={path} target="_blank" rel="noopener noreferrer">Explore in a new tab <ArrowRight size={14} aria-hidden="true" /></Link>}
        {error && <p role="alert" className="text-sm text-destructive">Progress couldn’t be saved. Please try again.</p>}
        <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
          <Button type="button" variant="outline" disabled={step === 0 || busy} onClick={onBack}>Back</Button>
          <Button type="button" disabled={busy} onClick={onAdvance}>{busy ? 'Saving…' : lastStep ? 'Finish tour' : 'Next section'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}