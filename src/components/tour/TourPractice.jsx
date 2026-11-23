import React, { useState } from 'react';
import { ArrowRight, Check, Monitor, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TourPractice({ practice }) {
  const [stage, setStage] = useState(0);
  const [screen, ...actions] = practice;
  const current = actions[Math.max(0, stage - 1)];
  return (
    <section aria-label="Interactive practice" className="overflow-hidden rounded-md border border-[var(--readable-border)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--readable-border)] px-3 py-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold"><Monitor size={16} aria-hidden="true" /> {screen}</h4>
        <span className="text-xs">Practice only · Nothing is saved</span>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-[minmax(8rem,1fr)_2fr]">
        <div role="group" aria-label="Practice steps" className="flex flex-wrap content-start gap-2 sm:flex-col">
          {actions.map(([label], index) => (
            <Button key={label} type="button" size="sm" variant="outline" disabled={index > stage} aria-pressed={index + 1 === stage}
              onClick={() => setStage(index + 1)} className="h-auto min-h-8 justify-start whitespace-normal text-left aria-pressed:ring-2 aria-pressed:ring-[var(--readable-link)]">
              {index < stage ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />} {index + 1}. {label}
            </Button>
          ))}
        </div>
        <div aria-live="polite" className="min-w-0 space-y-2 rounded-md border border-[var(--readable-border)] p-3">
          <p className="text-xs font-medium uppercase tracking-wider">Sample screen</p>
          {stage === 0 ? <p className="text-sm">Select <strong>{actions[0][0]}</strong> to open the example.</p> : <>
            <p className="text-sm font-semibold">{current[1]}</p>
            <dl className="divide-y divide-[var(--readable-border)] border-y border-[var(--readable-border)] text-sm leading-snug">
              {current[2].map(([label, value]) => <div key={label} className="grid gap-x-3 py-2 sm:grid-cols-[minmax(5rem,1fr)_2fr]"><dt className="font-medium">{label}</dt><dd className="min-w-0 break-words">{value}</dd></div>)}
            </dl>
            <p className="mt-2 text-xs">{stage === actions.length ? 'Practice complete. Try the live page or continue the tour.' : `Next, select ${actions[stage][0]}.`}</p>
          </>}
        </div>
        {stage > 0 && <Button type="button" size="sm" variant="outline" onClick={() => setStage(0)}><RotateCcw aria-hidden="true" /> Reset practice</Button>}
      </div>
    </section>
  );
}