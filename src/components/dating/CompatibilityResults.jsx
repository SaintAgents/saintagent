import React from 'react';
import MiniProfile from '@/components/profile/MiniProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function CompatibilityResults({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="text-slate-500 text-sm">No results yet. Save settings and run a compatibility check.</div>
    );
  }
  return (
    <div className="space-y-4">
      {results.map((r) => (
        <Card key={r.user_id} className="bg-white border rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MiniProfile userId={r.user_id} size={40} />
              <div>
                <CardTitle className="text-base">Synchronicity: {Math.round(r.overall)}%</CardTitle>
                <div className="text-xs text-slate-500">Strengths: {r.strengths.slice(0,3).join(', ') || '—'}</div>
              </div>
            </div>
            <div className="w-40">
              <Progress value={r.overall} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-6 gap-2 text-xs">
              {Object.entries(r.domainScores).map(([k,v]) => (
                <div key={k} className="p-2 rounded-lg bg-slate-50 border text-center">
                  <div className="font-medium">{k.replaceAll('_',' ')}</div>
                  <div className="text-slate-700">{Math.round(v)}%</div>
                </div>
              ))}
            </div>
            <details className="mt-3">
              <summary className="text-sm cursor-pointer">Why is this a good match?</summary>
              <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1 mt-1">
                {r.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </details>
            <details className="mt-2">
              <summary className="text-sm cursor-pointer">Where are the risks?</summary>
              <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1 mt-1">
                {r.frictions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </details>
            <details className="mt-2">
              <summary className="text-sm cursor-pointer">What assumptions were made?</summary>
              <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1 mt-1">
                {r.assumptions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}