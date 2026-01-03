import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import MiniProfile from '@/components/profile/MiniProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingBag, Target, Star, TrendingUp, RefreshCcw } from 'lucide-react';

const TYPE_META = {
  listings: { label: 'Listings', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-700' },
  missions: { label: 'Missions', icon: Target, color: 'bg-violet-100 text-violet-700' },
  testimonials: { label: 'Testimonials', icon: Star, color: 'bg-amber-100 text-amber-700' },
  reputation: { label: 'Reputation', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
};

export default function ActivityFeed() {
  const [filters, setFilters] = useState({ listings: true, missions: true, testimonials: true, reputation: true });

  const activeTypes = useMemo(() => Object.entries(filters).filter(([,v]) => v).map(([k]) => k), [filters]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['activityFeed', activeTypes.sort().join(',')],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getActivityFeed', { types: activeTypes, limit: 60 });
      return res?.items || [];
    },
    refetchInterval: 10000,
  });

  const items = data || [];

  const handleOpen = (ev) => {
    if (ev.type === 'listings') {
      window.location.href = createPageUrl('ListingDetail') + '?id=' + ev.source.id;
    } else if (ev.type === 'missions') {
      window.location.href = createPageUrl('MissionDetail') + '?id=' + ev.source.id;
    } else if (ev.type === 'testimonials' || ev.type === 'reputation') {
      const uid = ev.target_id || ev.actor_id;
      // Open profile drawer via global event (used elsewhere in app)
      const evt = new CustomEvent('openProfile', { detail: { userId: uid } });
      document.dispatchEvent(evt);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Activity Feed</h1>
          <Button variant="outline" className="rounded-xl" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className="w-4 h-4 mr-2" /> {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={!!filters[key]}
                    onCheckedChange={(v) => setFilters((prev) => ({ ...prev, [key]: !!v }))}
                  />
                  <Badge className={`${meta.color}`}>{meta.label}</Badge>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 py-16">No recent activity</div>
          ) : (
            items.map((ev) => {
              const meta = TYPE_META[ev.type] || { icon: TrendingUp, color: 'bg-slate-100 text-slate-700' };
              const Icon = meta.icon;
              return (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-colors cursor-pointer"
                  onClick={() => handleOpen(ev)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${meta.color}`}><Icon className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900 truncate">{ev.title}</div>
                        <div className="text-xs text-slate-500">{new Date(ev.created_date).toLocaleString()}</div>
                      </div>
                      {ev.description && (
                        <div className="text-sm text-slate-600 mt-0.5 line-clamp-2">{ev.description}</div>
                      )}
                      <Separator className="my-3" />
                      {/* Actor / Target context */}
                      <div className="flex items-center gap-3">
                        {ev.actor_id && <MiniProfile userId={ev.actor_id} size={28} showHandle={false} />}
                        {ev.type === 'listings' && (
                          <div className="text-xs text-slate-500">Marketplace</div>
                        )}
                        {ev.type === 'missions' && (
                          <div className="text-xs text-slate-500">Mission update</div>
                        )}
                        {ev.type === 'testimonials' && (
                          <div className="text-xs text-slate-500">Feedback</div>
                        )}
                        {ev.type === 'reputation' && (
                          <div className="text-xs text-slate-500">Reputation</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}