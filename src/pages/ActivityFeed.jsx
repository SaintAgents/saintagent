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
import { ShoppingBag, Target, Star, TrendingUp, RefreshCcw, Sparkles, MessageSquare, Users, Briefcase, Globe, Heart, User, FileText, Calendar, UserPlus, Share2, Megaphone } from 'lucide-react';
import ShareContentModal from '@/components/share/ShareContentModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

const TYPE_META = {
  announcements: { label: 'Announcements', icon: Megaphone, color: 'bg-blue-100 text-blue-700' },
  listings: { label: 'Listings', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-700' },
  missions: { label: 'Missions', icon: Target, color: 'bg-violet-100 text-violet-700' },
  testimonials: { label: 'Testimonials', icon: Star, color: 'bg-amber-100 text-amber-700' },
  reputation: { label: 'Reputation', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  posts: { label: 'Posts', icon: FileText, color: 'bg-pink-100 text-pink-700' },
  meetings: { label: 'Meetings', icon: Calendar, color: 'bg-cyan-100 text-cyan-700' },
  follows: { label: 'Follows', icon: UserPlus, color: 'bg-indigo-100 text-indigo-700' },
  events: { label: 'Events', icon: Sparkles, color: 'bg-orange-100 text-orange-700' },
};

// Separate component to ensure consistent hook order - no hooks inside, just renders
function ActivityItem({ ev, onOpen, onShare }) {
  const meta = TYPE_META[ev.type] || { icon: TrendingUp, color: 'bg-slate-100 text-slate-700' };
  const Icon = meta.icon;
  
  return (
    <div
      className="bg-white dark:bg-[#050505]/90 border border-slate-200 dark:border-[#00ff88]/40 rounded-xl p-4 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${meta.color} dark:bg-[#00ff88]/20`}><Icon className="w-4 h-4 dark:text-[#00ff88]" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div 
              className="font-semibold text-slate-800 dark:text-white dark:drop-shadow-[0_0_6px_rgba(0,255,136,0.5)] truncate cursor-pointer hover:text-violet-600"
              onClick={() => onOpen(ev)}
            >
              {ev.title}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500 dark:text-[#00d4ff] dark:font-medium">{new Date(ev.created_date).toLocaleString()}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                onClick={(e) => { e.stopPropagation(); onShare(ev); }}
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {ev.description && (
            <div className="text-sm text-slate-600 dark:text-slate-200 mt-0.5 line-clamp-2">{ev.description}</div>
          )}
          <Separator className="my-3 dark:bg-[#00ff88]/30" />
          {/* Actor / Target context - removed MiniProfile to avoid hook issues */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-slate-500 dark:text-[#00ff88]">
              {ev.type === 'announcements' && 'System Announcement'}
              {ev.type === 'listings' && 'Marketplace'}
              {ev.type === 'missions' && 'Mission update'}
              {ev.type === 'testimonials' && 'Feedback'}
              {ev.type === 'reputation' && 'Reputation'}
              {ev.type === 'posts' && 'Post'}
              {ev.type === 'meetings' && 'Meeting'}
              {ev.type === 'follows' && 'Connection'}
              {ev.type === 'events' && 'Event'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const [filters, setFilters] = useState({ announcements: true, listings: true, missions: true, testimonials: true, reputation: true, posts: true, meetings: true, follows: true, events: true });
  const [scope, setScope] = useState('me'); // 'me', 'friends', or 'everyone'
  const [shareModal, setShareModal] = useState({ open: false, content: null });

  const activeTypes = useMemo(() => Object.entries(filters).filter(([,v]) => v).map(([k]) => k), [filters]);

  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: ['activityFeed', activeTypes.sort().join(','), scope],
    queryFn: async () => {
      try {
        const { data: res } = await base44.functions.invoke('getActivityFeed', { types: activeTypes, limit: 60, scope });
        return res?.items || [];
      } catch (err) {
        console.error('Activity feed error:', err);
        return [];
      }
    },
    refetchInterval: 120000, // 2 minutes instead of 30 seconds
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const items = data || [];
  const isRateLimited = isError && error?.message?.toLowerCase()?.includes('rate limit');

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
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2c8670516_activity.jpg"
          alt="Activity Feed"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <BackButton className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            Activity Feed
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className="w-4 h-4 mr-2" /> {isFetching ? 'Refreshing…' : 'Refresh'}
            </Button>
<ForwardButton className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 relative z-[5]">

        {/* Scope Toggle */}
        <Tabs value={scope} onValueChange={setScope} className="mb-4">
          <TabsList className="grid w-full max-w-sm grid-cols-3">
            <TabsTrigger value="me" className="gap-2">
              <User className="w-4 h-4" /> Me
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-2">
              <Heart className="w-4 h-4" /> Friends
            </TabsTrigger>
            <TabsTrigger value="everyone" className="gap-2">
              <Globe className="w-4 h-4" /> All
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Type Filters */}
        <Card className="mb-6 dark:bg-[#050505]/90 dark:border-[#00ff88]/40">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={!!filters[key]}
                    onCheckedChange={(v) => setFilters((prev) => ({ ...prev, [key]: !!v }))}
                    className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                  />
                  <Badge className={`${meta.color} dark:bg-[#00ff88]/20 dark:text-[#00ff88] dark:border-[#00ff88]/40`}>{meta.label}</Badge>
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
            items.map((ev) => (
              <ActivityItem 
                key={ev.id} 
                ev={ev} 
                onOpen={handleOpen} 
                onShare={(item) => setShareModal({ 
                  open: true, 
                  content: { 
                    title: item.title, 
                    description: item.description, 
                    type: item.type 
                  } 
                })}
              />
            ))
          )}
          </div>

          {/* Share Modal */}
          <ShareContentModal
          open={shareModal.open}
          onClose={() => setShareModal({ open: false, content: null })}
          content={shareModal.content}
          />
          </div>
          </div>
          );
          }