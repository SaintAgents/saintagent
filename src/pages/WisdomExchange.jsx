import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import useWisdomLibrary from '@/components/wisdom/useWisdomLibrary';
import WisdomLibraryFilters from '@/components/wisdom/WisdomLibraryFilters';
import WisdomHero from '@/components/wisdom/WisdomHero';
import WisdomCardTile from '@/components/wisdom/WisdomCardTile';
import WisdomCardDetail from '@/components/wisdom/WisdomCardDetail';
import WisdomCardForm from '@/components/wisdom/WisdomCardForm';
import WisdomQuiz from '@/components/wisdom/WisdomQuiz';
import { callWisdom, errorText, queryKey } from '@/components/wisdom/wisdomCards';

const labels = ['Cards in the library','AI fact-checked','Verified','Quizzes ready'];
export default function WisdomExchange() {
  const { user } = useAuth();
  const client = useQueryClient();
  const { filters,setFilters,cards,stats } = useWisdomLibrary(user);
  const [selection,setSelection] = useState(null);
  const [checking,setChecking] = useState(null);
  const [error,setError] = useState(null);
  const detailKey = id => [...queryKey,'detail',user.id,id];
  const { data:card, isError:detailError } = useQuery({ queryKey:detailKey(selection?.id), enabled:!!selection?.id, queryFn:() => base44.entities.WisdomCard.get(selection.id) });
  const refresh = () => client.invalidateQueries({ queryKey });
  const close = () => setSelection(null);
  const create = () => setSelection({ mode:'form' });
  const mode = (value,id = card.id) => setSelection({ mode:value,id });
  const check = async record => {
    setChecking(record.id); setError(null);
    try { await callWisdom('check',{ id:record.id }); await refresh(); }
    catch (err) { setError({ id:record.id,message:errorText(err,'Fact-check failed. Please try again.') }); }
    finally { setChecking(null); }
  };
  const open = (record,target) => { client.setQueryData(detailKey(record.id),record); mode(target === 'quiz' ? 'quiz' : 'detail',record.id); if (target === 'check' && !checking) check(record); };
  const save = async values => {
    const saved = selection.id ? await base44.entities.WisdomCard.update(selection.id,values) : await base44.entities.WisdomCard.create({ ...values,quiz_generated_at:'',owner_user_id:user.id,owner_name:(user.full_name || 'Member').slice(0,160) });
    client.setQueryData(detailKey(saved.id),saved); mode('detail',saved.id); refresh();
  };
  const rows = cards.data?.pages.flatMap(page => page.items) || [];
  return <div className="mx-auto max-w-7xl space-y-5 px-4 py-7 sm:px-6">
    <WisdomHero />
    <header className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><BookOpen className="size-4" /> Member library</div><h1 className="font-heading text-3xl font-bold sm:text-4xl">Wisdom Exchange</h1><p className="mt-2 max-w-xl text-sm">Turn research and experience into shareable knowledge cards, check the evidence, and learn with short quizzes.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/Advice">Community Guidance</Link></Button><Button onClick={create}><Plus /> Make a Wisdom Card</Button></div></header>
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{labels.map((label,i) => <div key={label} className="rounded-xl border bg-card p-4 text-card-foreground"><dt className="text-xs font-medium">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{stats.data?.[i] ?? '—'}</dd></div>)}</dl>
    <WisdomLibraryFilters {...{ filters,setFilters }} />
    {cards.isPending ? <p role="status">Loading Wisdom Cards…</p> : cards.isError && !rows.length ? <p role="alert">Couldn’t load Wisdom Cards. <Button variant="outline" onClick={() => cards.refetch()}>Retry</Button></p> : rows.length ? <><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map(record => <WisdomCardTile key={record.id} card={record} {...{ user,open }} busy={checking === record.id} />)}</div>{cards.hasNextPage && <Button variant="outline" disabled={cards.isFetchingNextPage} onClick={() => cards.fetchNextPage()}>{cards.isFetchingNextPage ? 'Loading…' : cards.isFetchNextPageError ? 'Retry loading more' : 'Load more'}</Button>}</> : <section data-readable-surface className="space-y-3 rounded-xl border p-6 text-center"><h2 className="font-semibold">{stats.data?.[0] === 0 ? 'Be the first to share some wisdom' : 'No cards match these filters'}</h2>{stats.data?.[0] === 0 ? <Button onClick={create}>Make the first Wisdom Card</Button> : <p className="text-sm">Try changing the search or filters.</p>}</section>}
    {selection?.id && detailError && <p role="alert" className="text-sm text-destructive">Could not refresh the selected card.</p>}
    {selection?.mode === 'form' && (!selection.id || card) && <WisdomCardForm key={selection.id || 'new'} card={selection.id ? card : undefined} {...{ close,save }} />}
    {selection?.mode === 'detail' && card && <WisdomCardDetail key={card.id} {...{ card,user,close }} edit={() => mode('form')} quiz={() => mode('quiz')} check={() => { if (!checking) check(card); }} remove={async () => { await base44.entities.WisdomCard.delete(card.id); close(); refresh(); }} checking={checking === card.id} error={error?.id === card.id ? error.message : ''} />}
    {selection?.mode === 'quiz' && card && <WisdomQuiz key={card.id} {...{ card,refresh }} close={() => mode('detail')} />}
  </div>;
}