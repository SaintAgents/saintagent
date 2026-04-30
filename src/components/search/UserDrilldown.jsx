import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Target, Folder, Calendar, Clock, FileText,
  ShoppingBag, CircleDot, Users, Handshake, Mail, Hash
} from "lucide-react";

function Section({ icon: Icon, label, color, items, renderItem }) {
  if (!items?.length) return null;
  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        {label} <Badge variant="secondary" className="text-xs">{items.length}</Badge>
      </h4>
      <div className="space-y-1">
        {items.slice(0, 10).map(renderItem)}
      </div>
    </div>
  );
}

function ResultRow({ icon: Icon, color, title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left">
      <Icon className={`w-8 h-8 p-1.5 rounded-lg ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
    </button>
  );
}

export default function UserDrilldown({ profile, onBack, onSelect, onClose }) {
  const userId = profile?.user_id;

  const { data: posts = [] } = useQuery({
    queryKey: ['drilldown-posts', userId],
    queryFn: () => base44.entities.Post.filter({ author_id: userId }, '-created_date', 20),
    enabled: !!userId,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['drilldown-missions', userId],
    queryFn: () => base44.entities.Mission.filter({ creator_id: userId }, '-created_date', 20),
    enabled: !!userId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['drilldown-projects', userId],
    queryFn: () => base44.entities.Project.filter({ owner_id: userId }, '-created_date', 20),
    enabled: !!userId,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['drilldown-events', userId],
    queryFn: () => base44.entities.Event.filter({ host_id: userId }, '-start_time', 20),
    enabled: !!userId,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['drilldown-meetings', userId],
    queryFn: () => base44.entities.Meeting.filter({ host_id: userId }, '-scheduled_time', 20),
    enabled: !!userId,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['drilldown-listings', userId],
    queryFn: () => base44.entities.Listing.filter({ owner_id: userId }, '-created_date', 20),
    enabled: !!userId,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['drilldown-deals', userId],
    queryFn: () => base44.entities.Deal.filter({ owner_id: userId }, '-created_date', 20),
    enabled: !!userId,
  });

  const totalItems = posts.length + missions.length + projects.length + events.length + meetings.length + listings.length + deals.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-10 h-10" data-user-id={userId}>
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{profile.display_name}</p>
          <p className="text-xs text-slate-500">
            @{profile.handle}
            {profile.sa_number && <span className="ml-2">SA#{profile.sa_number}</span>}
            <span className="ml-2">{userId}</span>
          </p>
        </div>
        <Badge variant="secondary">{totalItems} items</Badge>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 pb-4" style={{ height: 400 }}>
        <div className="pt-3">
          <Section
            icon={FileText} label="Posts" color="text-violet-600"
            items={posts}
            renderItem={(post) => (
              <ResultRow key={post.id} icon={FileText} color="bg-violet-50 text-violet-600"
                title={post.content?.substring(0, 80) || 'Post'}
                subtitle={new Date(post.created_date).toLocaleDateString()}
                onClick={() => { onSelect?.('post', post); }}
              />
            )}
          />

          <Section
            icon={Target} label="Missions Created" color="text-amber-600"
            items={missions}
            renderItem={(m) => (
              <ResultRow key={m.id} icon={Target} color="bg-amber-50 text-amber-600"
                title={m.title}
                subtitle={`${m.status} • ${m.participant_count || 0} joined`}
                onClick={() => { onSelect?.('mission', m); onClose(); }}
              />
            )}
          />

          <Section
            icon={Folder} label="Projects" color="text-blue-600"
            items={projects}
            renderItem={(p) => (
              <ResultRow key={p.id} icon={Folder} color="bg-blue-50 text-blue-600"
                title={p.title}
                subtitle={p.status}
                onClick={() => { onSelect?.('project', p); onClose(); }}
              />
            )}
          />

          <Section
            icon={Calendar} label="Events Hosted" color="text-rose-600"
            items={events}
            renderItem={(e) => (
              <ResultRow key={e.id} icon={Calendar} color="bg-rose-50 text-rose-600"
                title={e.title}
                subtitle={e.start_time ? new Date(e.start_time).toLocaleDateString() : 'No date'}
                onClick={() => { onSelect?.('event', e); onClose(); }}
              />
            )}
          />

          <Section
            icon={Clock} label="Meetings" color="text-indigo-600"
            items={meetings}
            renderItem={(m) => (
              <ResultRow key={m.id} icon={Clock} color="bg-indigo-50 text-indigo-600"
                title={m.title}
                subtitle={m.scheduled_time ? new Date(m.scheduled_time).toLocaleDateString() : 'No date'}
                onClick={() => { onSelect?.('meeting', m); onClose(); }}
              />
            )}
          />

          <Section
            icon={ShoppingBag} label="Listings" color="text-emerald-600"
            items={listings}
            renderItem={(l) => (
              <ResultRow key={l.id} icon={ShoppingBag} color="bg-emerald-50 text-emerald-600"
                title={l.title}
                subtitle={l.is_free ? 'Free' : `$${l.price_amount}`}
                onClick={() => { onSelect?.('listing', l); onClose(); }}
              />
            )}
          />

          <Section
            icon={Handshake} label="Deals" color="text-purple-600"
            items={deals}
            renderItem={(d) => (
              <ResultRow key={d.id} icon={Handshake} color="bg-purple-50 text-purple-600"
                title={d.title}
                subtitle={`${d.stage} • $${d.amount || 0}`}
                onClick={() => { onSelect?.('deal', d); onClose(); }}
              />
            )}
          />

          {totalItems === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No associated content found for this user</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}