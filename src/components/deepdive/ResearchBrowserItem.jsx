import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { itemPath } from '@/components/watch/watchItems';
import { sourceHref, sourceTypes } from '@/components/intelligence/intelligenceSources';

const validId = id => /^[\w-]{1,100}$/.test(id || '');
const seeded = ref => Object.hasOwn(sourceTypes, ref.item_type) && validId(ref.record_id);

export default function ResearchBrowserItem({ row, cards, expanded, toggle, onInvestigate }) {
  const detailId = useId();
  const refs = row.references || [];
  return <li className="rounded-lg border p-3 text-sm">
    <button type="button" className="w-full break-words text-left font-semibold underline" aria-expanded={expanded} aria-controls={expanded ? detailId : undefined} onClick={toggle}>{row.title}</button>
    {cards ? <p>{refs.length} linked {refs.length === 1 ? 'record' : 'records'}</p> : row.category && <p>{row.category}</p>}
    {expanded && <div id={detailId} className="mt-3 space-y-3">
      {(cards ? row.note : row.summary) && <p className="whitespace-pre-wrap break-words">{cards ? row.note : row.summary}</p>}
      {cards && refs.length > 0 && <ul className="space-y-2 border-l pl-3" aria-label="Linked records">{refs.map(ref => {
        const route = itemPath(ref);
        return <li key={`${ref.item_type}:${ref.record_id}`} className="flex flex-wrap items-center gap-2 break-words">
          {route ? <a className="underline" href={route} target="_blank" rel="noopener noreferrer">{ref.title}</a> : <span>{ref.title}</span>}
          {seeded(ref) && <Button size="sm" type="button" variant="outline" onClick={() => onInvestigate({ title: ref.title, kind: ref.item_type, id: ref.record_id })}>Investigate source</Button>}
        </li>;
      })}</ul>}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" type="button" onClick={() => onInvestigate(cards ? { title: row.title, kind: 'research' } : { title: row.title, kind: 'news', id: row.id })}>{cards ? 'Investigate this topic' : 'Investigate this insight'}</Button>
        {!cards && validId(row.id) && <Link className="underline" to={sourceHref({kind:'news',id:row.id})} target="_blank" rel="noopener noreferrer">Read full insight</Link>}
      </div>
      {cards && <p className="text-xs text-muted-foreground">A topic investigation starts from the title. Choose a linked source to include that record as evidence.</p>}
    </div>}
  </li>;
}