import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export const LIMIT = 8;
export const DECK_NAMES = ['Dock Deck', 'Deck 2', 'Deck 3', 'Deck 4', 'Deck 5', 'Deck 6'];
export const cleanView = () => ({ arrangement:'grid', positions:{} });
export const emptyDeck = () => ({ cards:[], collapsed:{}, views:{} });
const initial = () => ({ active:0, decks:DECK_NAMES.map(emptyDeck), groups:[], custom:{} });
export default function useObservationWorkspace(user) {
  const client = useQueryClient();
  const key = ['observation-workspace',user.id];
  const query = useQuery({ queryKey:key, queryFn: () => base44.entities.ObservationWorkspace.filter({created_by_id:user.id},'-updated_date',1), staleTime:Infinity });
  const [draft,setDraft] = useState(null), [status,setStatus] = useState('');
  const latest = useRef(null), queue = useRef(Promise.resolve()), record = useRef(null), revision = useRef(0);
  const loaded = query.data?.[0];
  const stored = loaded?.workspace;
  const data = draft ?? (stored ? {...initial(),...stored,decks:DECK_NAMES.map((_,i) => ({...emptyDeck(),...stored.decks?.[i]}))} : initial());
  function save(value) {
    const id = ++revision.current;
    setStatus('Saving…');
    queue.current = queue.current.then(async () => {
      if (revision.current !== id) return;
      const existing = record.current || loaded?.id;
      const saved = existing ? await base44.entities.ObservationWorkspace.update(existing,{workspace:value}) : await base44.entities.ObservationWorkspace.create({workspace:value});
      record.current = saved?.id || existing;
      client.setQueryData(key,[{...saved,id:record.current,workspace:value}]);
      if (revision.current === id) setStatus('Saved');
    }).catch(() => { if (revision.current === id) setStatus('Could not save'); });
  }
  function change(update) {
    const current = latest.current ?? data;
    const next = update(current);
    latest.current = next; setDraft(next); save(next);
  }
  return { data, change, status, retry:() => save(latest.current ?? data), query };
}