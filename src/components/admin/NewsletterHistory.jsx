import React, { useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import NewsletterReader from '@/components/admin/NewsletterReader';

export default function NewsletterHistory() {
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);
  const history = useInfiniteQuery({
    queryKey: ['newsletterCampaigns', 'history'],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.NewsletterCampaign.list({ sort: '-created_date', limit: 20, ...(pageParam ? { cursor: pageParam } : {}) }),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
  const campaigns = history.data?.pages.flatMap(page => page.items) || [];
  const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return <section data-readable-surface data-newsletter-manager aria-labelledby="newsletter-history-title" className="space-y-4 rounded-lg border p-4 sm:p-6">
    <h2 id="newsletter-history-title" className="text-xl font-semibold">Newsletter history</h2>
    {history.isPending && <p role="status">Loading newsletters…</p>}
    {history.isError && <p role="status">Could not load {campaigns.length ? 'more newsletters' : 'newsletter history'}.{' '}
      <Button type="button" variant="outline" size="sm" onClick={() => history.isFetchNextPageError ? history.fetchNextPage() : history.refetch()}>Retry</Button></p>}
    {history.isSuccess && !campaigns.length && <p>No newsletters have been saved or sent yet.</p>}
    {campaigns.length > 0 && <ul className="divide-y">
      {campaigns.map(campaign => {
        const date = new Date(campaign.sent_at || campaign.scheduled_send_at || campaign.created_date);
        const status = campaign.status === 'draft' && campaign.scheduled_send_at ? 'scheduled' : campaign.status;
        return <li key={campaign.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div className="min-w-0">
            <p className="break-words font-medium">{campaign.subject || 'Untitled newsletter'}</p>
            <p className="text-sm text-muted-foreground"><span className="capitalize">{status?.replaceAll('_', ' ')}</span>{Number.isFinite(date.getTime()) && ` · ${dateFormat.format(date)}`}</p>
          </div>
          <Button type="button" variant="outline" size="sm" aria-label={`Read ${campaign.subject || 'newsletter'}`} onClick={event => { triggerRef.current = event.currentTarget; setSelected(campaign); }}><Eye aria-hidden="true" /> Read</Button>
        </li>;
      })}
    </ul>}
    {history.hasNextPage && !history.isFetchNextPageError && <Button type="button" variant="outline" disabled={history.isFetchingNextPage} onClick={() => history.fetchNextPage()}>{history.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button>}
    {selected && <NewsletterReader campaign={selected} triggerRef={triggerRef} onClose={() => setSelected(null)} />}
  </section>;
}