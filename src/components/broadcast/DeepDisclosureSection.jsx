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
  Mic, Play, Clock, Users, Eye, EyeOff, 
  MessageCircle, ExternalLink, Radio, ChevronDown, ChevronUp
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { toast } from 'sonner';
import BroadcastCard from './BroadcastCard';

const DD_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5650186ed_SA_shield.png";

export default function DeepDisclosureSection({ broadcasts = [], currentUser, onInterested, onGoing, isAdmin }) {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem('ddSectionHidden') === 'true'; } catch { return false; }
  });
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [sending, setSending] = useState(false);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-300/30">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Deep Disclosure
              {liveEpisode && (
                <Badge className="bg-red-500 text-white text-xs gap-1 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                </Badge>
              )}
            </h2>
            <p className="text-sm text-slate-500">Uplift Community Podcast — Truth, Transformation & Disclosure</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50"
            onClick={() => setContactOpen(true)}
          >
            <MessageCircle className="w-4 h-4" />
            Contact for Interview
          </Button>
          <button
            onClick={toggleHidden}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title={hidden ? 'Show Deep Disclosure' : 'Hide Deep Disclosure'}
          >
            {hidden ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!hidden && (
        <div className="space-y-4">
          {/* Featured / Live / Next Episode */}
          {(liveEpisode || nextEpisode) && (
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
                        onClick={() => window.open(liveEpisode.live_stream_url, '_blank')}
                      >
                        <Play className="w-4 h-4" /> Join Live
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
          )}

          {/* Past Episodes */}
          {pastEpisodes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Episodes</h4>
              <div className="space-y-3">
                {pastEpisodes.map(ep => (
                  <BroadcastCard 
                    key={ep.id} 
                    broadcast={ep} 
                    currentUser={currentUser}
                    onInterested={onInterested}
                    onGoing={onGoing}
                    isAdmin={isAdmin}
                  />
                ))}
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