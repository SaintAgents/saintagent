import { useState } from 'react';
import { Input } from '@/components/ui/input';

const fields = [['effort','Work required (hours)',1], ['team','Volunteers',1], ['weekly','Hours each per week',1], ['delay','Weeks before funding',0], ['deadline','Target week',1]];
const initial = [{ effort:120,team:5,weekly:3,delay:0,deadline:8 }, { effort:120,team:12,weekly:3,delay:3,deadline:8 }];
const estimate = row => fields.every(([key,,min]) => row[key] !== '' && Number.isFinite(+row[key]) && +row[key] >= min) ? +row.delay + Math.ceil(row.effort / (row.team * row.weekly)) : null;

export default function GuidePossibilitySimulator() {
  const [cases, setCases] = useState(initial);
  const results = cases.map(estimate);
  const difference = results[1] - results[0];
  return <details id="guide-simulator" className="scroll-mt-32 rounded-xl border border-border bg-card p-4">
    <summary className="cursor-pointer font-semibold">Possibility Simulator · Compare scenarios</summary>
    <p className="my-3 text-sm text-muted-foreground">Start with the sample assumptions or enter your own. This estimate assumes work starts once funding arrives and each volunteer contributes the same hours every week.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {cases.map((row,index) => <fieldset key={index} className="grid min-w-0 gap-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-sm font-semibold">{index ? 'Alternative' : 'Baseline'}</legend>
        {fields.map(([key,label,min]) => <label key={key} className="flex items-center justify-between gap-2 text-sm">{label}<Input className="w-24 bg-background" type="number" min={min} step="any" value={row[key]} onChange={e => { const value = e.target.value; setCases(previous => previous.map((item,i) => i === index ? { ...item,[key]:value } : item)); }} /></label>)}
        <p className="text-sm font-semibold" aria-live="polite">{results[index] === null ? 'Enter valid assumptions.' : `Estimated finish: week ${results[index]} · ${results[index] <= Number(row.deadline) ? 'Meets target' : 'Misses target'}`}</p>
      </fieldset>)}
    </div>
    {results.every(result => result !== null) && <p className="mt-3 text-sm" aria-live="polite">{difference === 0 ? 'Both scenarios finish in the same week.' : `The alternative finishes ${Math.abs(difference)} ${Math.abs(difference) === 1 ? 'week' : 'weeks'} ${difference < 0 ? 'earlier' : 'later'} than the baseline.`}</p>}
  </details>;
}