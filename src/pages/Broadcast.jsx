import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Radio, Calendar, Clock, Users, Play, Bell, BellOff, 
  Plus, Video, Mic, ExternalLink, CheckCircle 
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import CreateBroadcastModal from '@/components/broadcast/CreateBroadcastModal';
import BroadcastCard from '@/components/broadcast/BroadcastCard';

export default function Broadcast() {
  const [tab, setTab] = useState('upcoming');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => base44.entities.Broadcast.list('-scheduled_time', 100)
  });

  const interestedMutation = useMutation({
    mutationFn: async ({ broadcastId, isCurrentlyInterested }) => {
      const broadcast = broadcasts.find(b => b.id === broadcastId);
      if (!broadcast) return;
      
      const currentInterested = broadcast.interested_user_ids || [];
      const currentGoing = broadcast.going_user_ids || [];
      
      let newInterested;
      let newGoing = currentGoing;
      
      if (isCurrentlyInterested) {
        // Remove from interested
        newInterested = currentInterested.filter(id => id !== currentUser.email);
      } else {
        // Add to interested, remove from going if present
        newInterested = [...currentInterested.filter(id => id !== currentUser.email), currentUser.email];
        newGoing = currentGoing.filter(id => id !== currentUser.email);
      }
      
      return base44.entities.Broadcast.update(broadcastId, {
        interested_user_ids: newInterested,
        interested_count: newInterested.length,
        going_user_ids: newGoing,
        going_count: newGoing.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
  });

  const goingMutation = useMutation({
    mutationFn: async ({ broadcastId, isCurrentlyGoing }) => {
      const broadcast = broadcasts.find(b => b.id === broadcastId);
      if (!broadcast) return;
      
      const currentInterested = broadcast.interested_user_ids || [];
      const currentGoing = broadcast.going_user_ids || [];
      
      let newGoing;
      let newInterested = currentInterested;
      
      if (isCurrentlyGoing) {
        // Remove from going
        newGoing = currentGoing.filter(id => id !== currentUser.email);
      } else {
        // Add to going, remove from interested if present
        newGoing = [...currentGoing.filter(id => id !== currentUser.email), currentUser.email];
        newInterested = currentInterested.filter(id => id !== currentUser.email);
      }
      
      return base44.entities.Broadcast.update(broadcastId, {
        going_user_ids: newGoing,
        going_count: newGoing.length,
        interested_user_ids: newInterested,
        interested_count: newInterested.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
  });

  const now = new Date();
  
  // Check if a broadcast is currently live based on time (scheduled_time <= now < scheduled_time + duration)
  const isCurrentlyLive = (b) => {
    if (b.status === 'live') return true;
    if (b.status === 'ended' || b.status === 'cancelled') return false;
    const scheduledTime = parseISO(b.scheduled_time);
    const endTime = new Date(scheduledTime.getTime() + (b.duration_minutes || 60) * 60 * 1000);
    return !isAfter(scheduledTime, now) && isAfter(endTime, now);
  };
  
  const upcoming = broadcasts.filter(b => 
    b.status === 'scheduled' && isAfter(parseISO(b.scheduled_time), now) && !isCurrentlyLive(b)
  ).sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
  
  const live = broadcasts.filter(b => isCurrentlyLive(b));
  
  const past = broadcasts.filter(b => 
    b.status === 'ended' || (b.status === 'scheduled' && isBefore(parseISO(b.scheduled_time), now) && !isCurrentlyLive(b))
  ).sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));

  const isAdmin = currentUser?.role === 'admin';

  const handleInterested = (broadcastId, isCurrentlyInterested) => {
    interestedMutation.mutate({ broadcastId, isCurrentlyInterested });
  };

  const handleGoing = (broadcastId, isCurrentlyGoing) => {
    goingMutation.mutate({ broadcastId, isCurrentlyGoing });
  };

  const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c1538f946_meets.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent">
      {/* Hero Section */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        <img 
          src={HERO_IMAGE}
          alt="Broadcast"
          className="hero-image w-full h-full object-cover object-center"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <HeroGalleryTrigger startIndex={5} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide flex items-center gap-3"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                <Radio className="w-8 h-8" />
                Broadcast
              </h1>
              <ForwardButton currentPage="Broadcast" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-violet-200/[0.92] text-base tracking-wider drop-shadow-lg">
                Live Podcasts, Town Halls & Community Broadcasts
              </p>
              {isAdmin && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2" 
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Schedule Broadcast
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 -mt-6 relative z-[5]">
        {/* Live Now Banner */}
        {live.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="font-bold text-lg">LIVE NOW</span>
                <span className="text-white/90">{live[0].title}</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2"
                onClick={() => window.open(live[0].live_stream_url, '_blank')}
              >
                <Play className="w-4 h-4" />
                Join Now
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-900">{upcoming.length}</p>
                <p className="text-sm text-violet-600">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Radio className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">{live.length}</p>
                <p className="text-sm text-red-600">Live Now</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Video className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{past.length}</p>
                <p className="text-sm text-slate-600">Past Episodes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-white rounded-xl border">
            <TabsTrigger value="upcoming" className="rounded-lg gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="live" className="rounded-lg gap-2">
              <Radio className="w-4 h-4" />
              Live ({live.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg gap-2">
              <Video className="w-4 h-4" />
              Past ({past.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Broadcasts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(tab === 'upcoming' ? upcoming : tab === 'live' ? live : past).length === 0 ? (
              <div className="text-center py-16">
                <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {tab === 'upcoming' ? 'No upcoming broadcasts' : 
                   tab === 'live' ? 'Nothing live right now' : 'No past broadcasts'}
                </h3>
                <p className="text-slate-500">
                  {tab === 'upcoming' ? 'Check back soon for scheduled shows!' : 
                   tab === 'live' ? 'Tune in when a broadcast goes live' : 'Past episodes will appear here'}
                </p>
              </div>
            ) : (
              (tab === 'upcoming' ? upcoming : tab === 'live' ? live : past).map(broadcast => (
                <BroadcastCard
                  key={broadcast.id}
                  broadcast={broadcast}
                  currentUser={currentUser}
                  onInterested={handleInterested}
                  onGoing={handleGoing}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>
        )}
      </div>

      <CreateBroadcastModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}