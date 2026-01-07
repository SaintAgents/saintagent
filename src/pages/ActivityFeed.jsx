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
import { ShoppingBag, Target, Star, TrendingUp, RefreshCcw, Sparkles, MessageSquare, Users, Briefcase, Globe, Heart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import BackButton from '@/components/hud/BackButton';

const TYPE_META = {
  listings: { label: 'Listings', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-700' },
  missions: { label: 'Missions', icon: Target, color: 'bg-violet-100 text-violet-700' },
  testimonials: { label: 'Testimonials', icon: Star, color: 'bg-amber-100 text-amber-700' },
  reputation: { label: 'Reputation', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
};

export default function ActivityFeed() {
  const [filters, setFilters] = useState({ listings: true, missions: true, testimonials: true, reputation: true });
  const [scope, setScope] = useState('everyone'); // 'friends' or 'everyone'

  const activeTypes = useMemo(() => Object.entries(filters).filter(([,v]) => v).map(([k]) => k), [filters]);

  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: ['activityFeed', activeTypes.sort().join(','), scope],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getActivityFeed', { types: activeTypes, limit: 60, scope });
      return res?.items || [];
    },
    refetchInterval: 10000,
  });

  const items = data || [];
  const isRateLimited = isError && error?.message?.toLowerCase().includes('rate limit');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-[#050505] dark:from-[#050505] dark:via-[#050505] dark:to-[#050505] p-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BackButton />
            <span className="dark:text-[#00ff88] dark:drop-shadow-[0_0_12px_rgba(0,255,136,0.7)] text-shadow-lg">Activity Feed</span>
          </h1>
          <Button variant="outline" className="rounded-xl" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className="w-4 h-4 mr-2" /> {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        {/* Scope Toggle */}
        <Tabs value={scope} onValueChange={setScope} className="mb-4">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="friends" className="gap-2">
              <Heart className="w-4 h-4" /> Friends
            </TabsTrigger>
            <TabsTrigger value="everyone" className="gap-2">
              <Globe className="w-4 h-4" /> Everyone
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Type Filters */}
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

        {/* Rate Limit Warning */}
        {isRateLimited && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <RefreshCcw className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Temporarily unable to load</p>
              <p className="text-amber-600 text-sm">Rate limit reached. Please refresh the page in a moment.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg border-amber-300 text-amber-700" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-3">
          {items.length === 0 && !isRateLimited ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-[#00ff88] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No recent activity yet</h3>
              <p className="text-slate-500 dark:text-slate-300 mb-6 max-w-md mx-auto">
                Your feed will show new listings, missions, testimonials, and reputation updates from the community. Start engaging to see activity here!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to={createPageUrl('Marketplace')}>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Briefcase className="w-4 h-4" /> Browse Marketplace
                  </Button>
                </Link>
                <Link to={createPageUrl('Missions')}>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Target className="w-4 h-4" /> Explore Missions
                  </Button>
                </Link>
                <Link to={createPageUrl('Messages')}>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <MessageSquare className="w-4 h-4" /> Start a Conversation
                  </Button>
                </Link>
                <Link to={createPageUrl('Matches')}>
                  <Button className="rounded-xl gap-2 bg-violet-600 hover:bg-violet-700">
                    <Users className="w-4 h-4" /> Find Matches
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            items.map((ev) => {
              const meta = TYPE_META[ev.type] || { icon: TrendingUp, color: 'bg-slate-100 text-slate-700' };
              const Icon = meta.icon;
              return (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-[#050505] border border-slate-200 dark:border-[#00ff88]/40 rounded-xl p-4 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] transition-all cursor-pointer relative z-10"
                  onClick={() => handleOpen(ev)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${meta.color} dark:bg-[#00ff88]/20`}><Icon className="w-4 h-4 dark:text-[#00ff88]" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 dark:text-white dark:drop-shadow-[0_0_6px_rgba(0,255,136,0.5)] truncate">{ev.title}</div>
                        <div className="text-xs text-slate-500 dark:text-[#00d4ff] dark:font-medium">{new Date(ev.created_date).toLocaleString()}</div>
                      </div>
                      {ev.description && (
                        <div className="text-sm text-slate-600 dark:text-slate-200 mt-0.5 line-clamp-2">{ev.description}</div>
                      )}
                      <Separator className="my-3 dark:bg-[#00ff88]/30" />
                      {/* Actor / Target context */}
                      <div className="flex items-center gap-3">
                        {ev.actor_id && <MiniProfile userId={ev.actor_id} size={40} showHandle={false} />}
                        {ev.type === 'listings' && (
                          <div className="text-xs font-medium text-slate-500 dark:text-[#00ff88]">Marketplace</div>
                        )}
                        {ev.type === 'missions' && (
                          <div className="text-xs font-medium text-slate-500 dark:text-[#00ff88]">Mission update</div>
                        )}
                        {ev.type === 'testimonials' && (
                          <div className="text-xs font-medium text-slate-500 dark:text-[#00ff88]">Feedback</div>
                        )}
                        {ev.type === 'reputation' && (
                          <div className="text-xs font-medium text-slate-500 dark:text-[#00ff88]">Reputation</div>
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