import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { openGuide } from '@/components/globalimpact/impactDiscovery';
import { assistantDraft, pillars } from '@/components/guide/guideTools';

export default function GuideAsk() {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('intelligence');
  const navigate = useNavigate();
  const pillar = pillars.find(p => p.id === mode);
  const text = question.trim();
  function submit(e) {
    e.preventDefault();
    if (text.length < 3) return;
    if (mode === 'intelligence') navigate(`/Intelligence?objective=${encodeURIComponent(text)}`);
    else openGuide(assistantDraft(mode, text));
  }
  return <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
    <label htmlFor="guide-question" className="font-heading text-lg font-semibold text-foreground">How can I guide you today?</label>
    <Textarea id="guide-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={400} rows={3} placeholder="Ask a question, explore an idea, or describe something you want to make real…" className="mt-3 resize-none bg-background text-base" />
    <div role="radiogroup" aria-label="How to explore" className="mt-4 grid grid-cols-3 gap-2">
      {pillars.map(({ id, name, tagline, Icon }) => <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)}
        className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${mode === id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted'}`}>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><Icon className="h-4 w-4 text-primary" />{name}</span>
        <span className="hidden text-xs text-muted-foreground sm:block">{tagline}</span>
      </button>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-xl text-xs text-muted-foreground">{pillar.note}{mode !== 'intelligence' && ' Your question is drafted in My Assistant for you to review and send.'}</p>
      <Button type="submit" disabled={text.length < 3} className="gap-2">{pillar.cta}<ArrowRight className="h-4 w-4" /></Button>
    </div>
  </form>;
}