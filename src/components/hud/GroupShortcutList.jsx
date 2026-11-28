import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function GroupShortcutList({ label, query, icon: Icon, browsePath, to, name, currentId, onNavigate }) {
  const plural = label.toLowerCase();
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return <div className="border-t py-1">
    <h4 className="px-1 text-xs font-semibold">{label}</h4>
    {query.isPending && <p className="px-1 py-1 text-xs text-muted-foreground" role="status">Loading {plural}…</p>}
    {query.isError && <div className="px-1 py-1 text-xs">
      <p role="status">Couldn’t load {query.isFetchNextPageError ? 'more' : 'your'} {plural}.</p>
      <Button variant="ghost" size="sm" onClick={() => query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()}>Retry</Button>
    </div>}
    {query.isSuccess && !items.length && <p className="px-1 py-1 text-xs text-muted-foreground">None yet. <Link className="underline" to={browsePath} onClick={onNavigate}>Browse {plural}</Link></p>}
    {!!items.length && <ul aria-label={label} className="space-y-0.5">
      {items.map(item => <li key={item.id}>
        <Link to={to(item.id)} title={name(item)} onClick={onNavigate} aria-current={currentId === item.id ? 'page' : undefined}
          className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring">
          <Icon className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{name(item)}</span>
        </Link>
      </li>)}
    </ul>}
    {query.hasNextPage && !query.isFetchNextPageError && <Button variant="ghost" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : `Show more ${plural}`}</Button>}
  </div>;
}