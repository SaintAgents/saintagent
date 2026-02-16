import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ShoppingBag, Target, Star, TrendingUp, RefreshCcw, Sparkles, 
  MessageSquare, Users, Briefcase, Globe, Heart, User, FileText, 
  Calendar, UserPlus, Share2, Megaphone, Clock, ArrowRight, ChevronRight
} from 'lucide-react';
import ShareContentModal from '@/components/share/ShareContentModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';
import BackButton from '@/components/hud/BackButton';
import { format } from 'date-fns';

const TYPE_META = {
  announcements: { label: 'Announcements', icon: Megaphone, color: 'bg-[#051C2C]' },
  listings: { label: 'Listings', icon: ShoppingBag, color: 'bg-emerald-900' },
  missions: { label: 'Missions', icon: Target, color: 'bg-violet-900' },
  testimonials: { label: 'Testimonials', icon: Star, color: 'bg-amber-700' },
  reputation: { label: 'Reputation', icon: TrendingUp, color: 'bg-blue-900' },
  posts: { label: 'Posts', icon: FileText, color: 'bg-pink-900' },
  meetings: { label: 'Meetings', icon: Calendar, color: 'bg-cyan-900' },
  follows: { label: 'Follows', icon: UserPlus, color: 'bg-indigo-900' },
  events: { label: 'Events', icon: Sparkles, color: 'bg-orange-800' },
};

// McKinsey-style Activity Card
function ActivityCard({ ev, onOpen, onShare }) {
  const meta = TYPE_META[ev.type] || { icon: TrendingUp, color: 'bg-slate-800' };
  const Icon = meta.icon;
  const timeAgo = ev.created_date ? format(new Date(ev.created_date), 'MMM d, yyyy • h:mm a') : '';
  
  return (
    <article 
      className="bg-white border border-slate-200 hover:border-[#051C2C] hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onOpen(ev)}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`${meta.color} p-3 text-white shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            <div className="flex items-center justify-between mb-2">
              <Badge className={`${meta.color} text-white text-xs font-semibold tracking-widest uppercase`}>
                {meta.label}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="font-serif text-lg font-semibold text-[#051C2C] group-hover:text-blue-900 transition-colors mb-2 line-clamp-2">
              {ev.title}
            </h3>
            
            {/* Description */}
            {ev.description && (
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                {ev.description}
              </p>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {ev.type === 'announcements' && 'Platform Update'}
                {ev.type === 'listings' && 'Marketplace Activity'}
                {ev.type === 'missions' && 'Mission Update'}
                {ev.type === 'testimonials' && 'Community Feedback'}
                {ev.type === 'reputation' && 'Reputation Change'}
                {ev.type === 'posts' && 'New Post'}
                {ev.type === 'meetings' && 'Meeting Activity'}
                {ev.type === 'follows' && 'New Connection'}
                {ev.type === 'events' && 'Event Update'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-[#051C2C] h-8 px-2"
                  onClick={(e) => { e.stopPropagation(); onShare(ev); }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <span className="text-[#051C2C] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ActivityFeed() {
  const [filters, setFilters] = useState({ 
    announcements: true, listings: true, missions: true, testimonials: true, 
    reputation: true, posts: true, meetings: true, follows: true, events: true 
  });
  const [scope, setScope] = useState('me');
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
    refetchInterval: false, // Disable auto-refetch - user can manually refresh
    retry: false, // Don't retry on rate limit
    staleTime: 600000, // Cache for 10 minutes
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
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
      document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: uid } }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Hero Section with Image */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/7729df215_universal_upscale_0_00e5fb0f-5e49-417e-9325-066ccd91e076_0.jpg"
          alt="Activity Feed"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F0F2F5] dark:to-[#050505]" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center max-w-3xl px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(16,185,129,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                Activity Feed
              </h1>
              <LoopStartIndicator currentPage="ActivityFeed" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <ForwardButton currentPage="ActivityFeed" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-emerald-200/90 text-base tracking-wider drop-shadow-lg">
                Real-time updates · Community Activity · Network Engagement
              </p>
            </div>
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 gap-2 bg-black/30"
                onClick={() => refetch()} 
                disabled={isFetching}
              >
                <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing…' : 'Refresh Feed'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Scope Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={scope} onValueChange={setScope}>
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="me" className="gap-2 data-[state=active]:bg-[#051C2C] data-[state=active]:text-white">
                <User className="w-4 h-4" /> My Activity
              </TabsTrigger>
              <TabsTrigger value="friends" className="gap-2 data-[state=active]:bg-[#051C2C] data-[state=active]:text-white">
                <Heart className="w-4 h-4" /> Network
              </TabsTrigger>
              <TabsTrigger value="everyone" className="gap-2 data-[state=active]:bg-[#051C2C] data-[state=active]:text-white">
                <Globe className="w-4 h-4" /> All Activity
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Type Filters */}
        <div className="bg-white border border-slate-200 p-4 mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Filter by Type
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={!!filters[key]}
                  onCheckedChange={(v) => setFilters((prev) => ({ ...prev, [key]: !!v }))}
                  className="data-[state=checked]:bg-[#051C2C] data-[state=checked]:border-[#051C2C]"
                />
                <span className="text-sm text-slate-700">{meta.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rate Limit Warning */}
        {isRateLimited && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 flex items-center gap-3">
            <RefreshCcw className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Temporarily unable to load</p>
              <p className="text-amber-600 text-sm">Rate limit reached. Please refresh in a moment.</p>
            </div>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-4">
          {items.length === 0 && !isRateLimited ? (
            <div className="bg-white border border-slate-200 text-center py-20">
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-[#051C2C] mb-2">No recent activity</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Your feed will populate with listings, missions, testimonials, and platform updates as you engage.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 border-slate-300"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Refreshing…' : 'Refresh'}
                </Button>
                <Link to={createPageUrl('Marketplace')}>
                  <Button variant="outline" className="gap-2 border-slate-300">
                    <Briefcase className="w-4 h-4" /> Browse Marketplace
                  </Button>
                </Link>
                <Link to={createPageUrl('Missions')}>
                  <Button variant="outline" className="gap-2 border-slate-300">
                    <Target className="w-4 h-4" /> Explore Missions
                  </Button>
                </Link>
                <Link to={createPageUrl('Matches')}>
                  <Button className="gap-2 bg-[#051C2C] hover:bg-blue-900">
                    <Users className="w-4 h-4" /> Find Matches
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            items.map((ev) => (
              <ActivityCard 
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