import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Mic, Play, Pause, Clock, Users, Eye, EyeOff, 
  MessageCircle, ExternalLink, Radio, ChevronDown, ChevronUp, Headphones, Volume2
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { toast } from 'sonner';
import BroadcastCard from './BroadcastCard';
import EmbeddedMediaPlayer from './EmbeddedMediaPlayer';

const DD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5650186ed_SA_shield.png";
const DD_HERO = "https://media.base44.com/images/public/694f3e0401b05e6e8a042002/d659d2e42_generated_image.png";

export default function DeepDisclosureSection({ broadcasts = [], currentUser, onInterested, onGoing, isAdmin }) {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem('ddSectionHidden') === 'true'; } catch { return false; }
  });
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [sending, setSending] = useState(false);
  const [playingEpisode, setPlayingEpisode] = useState(null);

  const toggleHidden = () => {
    const next = !hidden;
    setHidden(next);
    try { localStorage.setItem('ddSectionHidden', String(next)); } catch {}
  };

  // Filter broadcasts that are "Deep Disclosure" podcasts
  const ddEpisodes = broadcasts.filter(b => 
    b.broadcast_type === 'podcast' && 
    (b.title?.toLowerCase().includes('deep disclosure') || b.topics?.some(t => t.toLowerCase().includes('deep disclosure')))
  ).sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));

  const now = new Date();
  const liveEpisode = ddEpisodes.find(b => {
    if (b.status === 'live') return true;
    const st = parseISO(b.scheduled_time);
    const et = new Date(st.getTime() + (b.duration_minutes || 60) * 60000);
    return st <= now && now < et && b.status !== 'ended' && b.status !== 'cancelled';
  });

  const nextEpisode = ddEpisodes.find(b => 
    b.status === 'scheduled' && isAfter(parseISO(b.scheduled_time), now)
  );

  const pastEpisodes = ddEpisodes.filter(b => 
    b.status === 'ended' || (b.status === 'scheduled' && !isAfter(parseISO(b.scheduled_time), now) && b !== liveEpisode)
  ).slice(0, 3);

  const handleContactSubmit = async () => {
    if (!contactForm.topic.trim() || !contactForm.message.trim()) {
      toast.error('Please fill in topic and message');
      return;
    }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: currentUser?.email || 'admin@saintagent.com',
        subject: `Deep Disclosure Interview Request: ${contactForm.topic}`,
        body: `
          <h2>Deep Disclosure - Interview Request</h2>
          <p><strong>From:</strong> ${contactForm.name || currentUser?.full_name || 'Community Member'}</p>
          <p><strong>Email:</strong> ${contactForm.email || currentUser?.email}</p>
          <p><strong>Topic:</strong> ${contactForm.topic}</p>
          <p><strong>Message:</strong></p>
          <p>${contactForm.message}</p>
        `
      });
      // Also create a notification for admin
      await base44.entities.Notification.create({
        user_id: 'admin',
        type: 'system',
        title: 'Deep Disclosure Interview Request',
        message: `${contactForm.name || currentUser?.full_name} wants to discuss: ${contactForm.topic}`,
        action_url: '/Broadcast'
      });
      toast.success('Interview request sent! We\'ll be in touch.');
      setContactOpen(false);
      setContactForm({ name: '', email: '', topic: '', message: '' });
    } catch (e) {
      toast.error('Failed to send request. Please try again.');
    }
    setSending(false);
  };

  return (
    <div className="mb-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl mt-6">
        <img 
          src={DD_HERO} 
          alt="Deep Disclosure" 
          className="w-full h-56 md:h-72 object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/40 to-transparent" />
        
        {/* Top-right controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {liveEpisode && (
            <Badge className="bg-red-500 text-white text-xs gap-1 animate-pulse px-3 py-1">
              <div className="w-2 h-2 bg-white rounded-full" /> LIVE NOW
            </Badge>
          )}
          <button
            onClick={toggleHidden}
            className="p-2 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            title={hidden ? 'Show Deep Disclosure' : 'Hide Deep Disclosure'}
          >
            {hidden ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/80" />}
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="w-5 h-5 text-violet-300" />
            <span className="text-xs font-semibold tracking-widest uppercase text-violet-300">The Podcast</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Deep Disclosure
          </h2>
          <p className="text-base md:text-lg text-white/80 max-w-lg mb-1">
            Unveiling What Lies Beneath the Surface
          </p>
          <p className="text-sm text-white/60 max-w-md mb-4">
            Real Stories. Raw Truths. Meaningful Connections.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg"
              onClick={() => setContactOpen(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Contact for Interview
            </Button>
            {ddEpisodes.length > 0 && (
              <span className="text-xs text-white/50 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                {ddEpisodes.length} episode{ddEpisodes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Player */}
      {playingEpisode && (
        <div className="mb-4">
          <EmbeddedMediaPlayer 
            url={playingEpisode.recording_url || playingEpisode.live_stream_url}
            title={playingEpisode.title}
            onClose={() => setPlayingEpisode(null)}
          />
        </div>
      )}

      {/* Collapsible Content */}
      {!hidden && (
        <div className="space-y-4">
          {/* Featured / Live / Next Episode */}
          {(liveEpisode || nextEpisode) && (
            <>
            <h4 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Radio className="w-4 h-4 text-violet-500" />
              Featured:
            </h4>
            <div className={cn(
              "p-5 rounded-2xl border-2 relative overflow-hidden",
              liveEpisode 
                ? "border-red-300 bg-gradient-to-r from-red-50 via-pink-50 to-violet-50" 
                : "border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50"
            )}>
              {liveEpisode && (
                <div className="absolute top-0 right-0 px-4 py-1 bg-red-500 text-white text-xs font-bold rounded-bl-lg flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE NOW
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg">
                  {liveEpisode ? (
                    <Radio className="w-10 h-10 text-white animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Badge className="bg-violet-100 text-violet-700 text-xs mb-2">
                    {liveEpisode ? 'Live Episode' : 'Next Episode'}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {(liveEpisode || nextEpisode).title}
                  </h3>
                  {(liveEpisode || nextEpisode).description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {(liveEpisode || nextEpisode).description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(parseISO((liveEpisode || nextEpisode).scheduled_time), 'MMM d, h:mm a')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="w-4 h-4" />
                      {(liveEpisode || nextEpisode).duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {((liveEpisode || nextEpisode).going_count || 0) + ((liveEpisode || nextEpisode).interested_count || 0)} engaged
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {liveEpisode ? (
                      <Button 
                        className="bg-red-500 hover:bg-red-600 gap-2"
                        onClick={() => setPlayingEpisode(liveEpisode)}
                      >
                        <Play className="w-4 h-4" /> Play Live
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => onGoing(nextEpisode.id, nextEpisode.going_user_ids?.includes(currentUser?.email))}
                        >
                          <Users className="w-4 h-4" />
                          {nextEpisode.going_user_ids?.includes(currentUser?.email) ? 'Going ✓' : "I'm Going"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="gap-2"
                          onClick={() => onInterested(nextEpisode.id, nextEpisode.interested_user_ids?.includes(currentUser?.email))}
                        >
                          Interested
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </>
          )}

          {/* Past Episodes */}
          {pastEpisodes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-violet-500" />
                Recent Episodes
              </h4>
              <div className="space-y-2">
                {pastEpisodes.map(ep => {
                  const isPlaying = playingEpisode?.id === ep.id;
                  const hasMedia = ep.recording_url || ep.live_stream_url;
                  return (
                    <div 
                      key={ep.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-md transition-all cursor-pointer group",
                        isPlaying && "ring-2 ring-violet-500 bg-violet-50"
                      )}
                      onClick={() => hasMedia && setPlayingEpisode(isPlaying ? null : ep)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isPlaying 
                          ? "bg-violet-600" 
                          : hasMedia 
                            ? "bg-violet-100 group-hover:bg-violet-200" 
                            : "bg-slate-100"
                      )}>
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : hasMedia ? (
                          <Play className="w-5 h-5 text-violet-600" />
                        ) : (
                          <Mic className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{ep.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{format(parseISO(ep.scheduled_time), 'MMM d, yyyy')}</span>
                          <span>{ep.duration_minutes} min</span>
                        </div>
                      </div>
                      {hasMedia && !isPlaying && (
                        <span className="text-xs text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Play
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {ddEpisodes.length === 0 && (
            <div className="text-center py-10 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
              <Mic className="w-12 h-12 text-violet-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Deep Disclosure</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                The uplift community podcast. Episodes will appear here once scheduled. Want to be a guest?
              </p>
              <Button 
                variant="outline" 
                className="gap-2 text-violet-600"
                onClick={() => setContactOpen(true)}
              >
                <MessageCircle className="w-4 h-4" />
                Contact for Interview
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Contact for Interview Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-violet-600" />
              Contact for Interview — Deep Disclosure
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              Want to share your story, disclosure, or insights on Deep Disclosure? Fill out the form below and we'll reach out.
            </p>
            <Input
              placeholder="Your Name"
              value={contactForm.name}
              onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              placeholder="Your Email"
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder="Proposed Topic"
              value={contactForm.topic}
              onChange={e => setContactForm(f => ({ ...f, topic: e.target.value }))}
            />
            <Textarea
              placeholder="Tell us about your story or what you'd like to discuss..."
              value={contactForm.message}
              onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
              className="h-28"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setContactOpen(false)}>Cancel</Button>
              <Button 
                className="bg-violet-600 hover:bg-violet-700 gap-2" 
                onClick={handleContactSubmit}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}