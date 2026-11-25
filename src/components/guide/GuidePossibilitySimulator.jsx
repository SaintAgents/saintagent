import { useState } from 'react';
import { Input } from '@/components/ui/input';

const fields = [['effort','Work required (hours)',1], ['team','Volunteers',1], ['weekly','Hours each per week',1], ['delay','Weeks before funding',0], ['deadline','Target week',1]];
const initial = [{ effort:120,team:5,weekly:3,delay:0,deadline:8 }, { effort:120,team:12,weekly:3,delay:3,deadline:8 }];
const estimate = (row, capacity = 1) => fields.every(([key,,min]) => row[key] !== '' && Number.isFinite(+row[key]) && +row[key] >= min) ? +row.delay + Math.ceil(row.effort / (row.team * row.weekly * capacity)) : null;

export default function GuidePossibilitySimulator({ expanded = false }) {
  const [cases, setCases] = useState(initial);
  const results = cases.map(estimate);
  const difference = results[1] - results[0];
  return <details id="guide-simulator" open={expanded || undefined} className="scroll-mt-32 rounded-xl border border-border bg-card p-4">
    <summary className="cursor-pointer font-semibold">Compare scenarios</summary>
    <p className="my-3 text-sm text-muted-foreground">Work starts after funding arrives and hours are spread evenly across volunteers. The stress test shows what happens if the team delivers 20% fewer hours per week; neither result is a forecast.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {cases.map((row,index) => <fieldset key={index} className="grid min-w-0 gap-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-sm font-semibold">{index ? 'Alternative' : 'Baseline'}</legend>
        {fields.map(([key,label,min]) => <label key={key} className="flex items-center justify-between gap-2 text-sm">{label}<Input className="w-24 bg-background" type="number" min={min} step="any" value={row[key]} onChange={e => { const value = e.target.value; setCases(previous => previous.map((item,i) => i === index ? { ...item,[key]:value } : item)); }} /></label>)}
        <div className="space-y-1 text-sm" aria-live="polite">{results[index] === null ? <p>Enter valid assumptions.</p> : <>
          <p className="font-semibold">Estimated finish: week {results[index]}</p>
          <p>{results[index] <= Number(row.deadline) ? `${Number(row.deadline) - results[index]} weeks of buffer before target` : `${results[index] - Number(row.deadline)} weeks past target`}</p>
          <p>Stress test: week {estimate(row, 0.8)} · {estimate(row, 0.8) <= Number(row.deadline) ? 'Still meets the target' : 'Misses the target'}</p>
        </>}</div>
      </fieldset>)}
    </div>
    {results.every(result => result !== null) && <p className="mt-3 text-sm" aria-live="polite">{difference === 0 ? 'Both scenarios finish in the same week.' : `The alternative finishes ${Math.abs(difference)} ${Math.abs(difference) === 1 ? 'week' : 'weeks'} ${difference < 0 ? 'earlier' : 'later'} than the baseline.`}</p>}
  </details>;
}