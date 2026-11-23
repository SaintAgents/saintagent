import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canManage, tagsFor } from '@/components/wisdom/wisdomCards';

export default function WisdomCardTile({ card, user, open, busy }) {
  const checked = !!card.fact_check?.verdict;
  return <article data-wisdom-tile className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
    <div className="flex flex-wrap gap-1.5"><Badge>{busy ? 'Checking' : card.status}</Badge><Badge variant="outline">{card.category}</Badge>{checked && <Badge variant="secondary">AI-checked</Badge>}</div>
    <h2 className="break-words text-base font-semibold"><button type="button" className="text-left underline-offset-4 hover:underline" onClick={() => open(card)}>{card.title}</button></h2>
    <p className="line-clamp-3 break-words text-sm leading-relaxed">{card.insight}</p>
    <div className="flex flex-wrap gap-1.5">{tagsFor(card).slice(0,4).map(tag => <Badge key={tag} variant="outline" className="max-w-full break-all">{tag}</Badge>)}</div>
    <div className="mt-auto flex flex-wrap gap-x-2 break-words text-xs text-muted-foreground"><span>{card.owner_name}</span>{card.region && <span>· {card.region}</span>}</div>
    <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => open(card,'quiz')}>{card.quiz_ready ? 'Quiz ready' : 'Make a quiz'}</Button>
      {!checked && canManage(card,user) && <Button size="sm" variant="outline" disabled={busy} onClick={() => open(card,'check')}>{busy ? 'Checking…' : 'Fact-check'}</Button>}</div>
  </article>;
}