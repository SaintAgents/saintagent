import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search,
  Users,
  ShoppingBag,
  Target,
  Calendar,
  CircleDot,
  FileText,
  Folder,
  X,
  StickyNote,
  CalendarDays,
  Clock
} from "lucide-react";

export default function SearchModal({ open, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [showAll, setShowAll] = useState(true); // Default to showing all results on arrival

  const { data: profiles = [] } = useQuery({
    queryKey: ['searchProfiles', query],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    enabled: open
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['searchListings', query],
    queryFn: () => base44.entities.Listing.list('-created_date', 50),
    enabled: open
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['searchMissions', query],
    queryFn: () => base44.entities.Mission.list('-created_date', 50),
    enabled: open
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['searchCircles', query],
    queryFn: () => base44.entities.Circle.list('-created_date', 50),
    enabled: open
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['searchPosts', query],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
    enabled: open
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['searchProjects', query],
    queryFn: () => base44.entities.Project.list('-created_date', 50),
    enabled: open
  });

  // Daily Logs
  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['searchDailyLogs', query],
    queryFn: () => base44.entities.DailyLog.list('-date', 100),
    enabled: open
  });

  // Notes
  const { data: notes = [] } = useQuery({
    queryKey: ['searchNotes', query],
    queryFn: () => base44.entities.Note.list('-updated_date', 100),
    enabled: open
  });

  // Meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ['searchMeetings', query],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 100),
    enabled: open
  });

  // Events
  const { data: events = [] } = useQuery({
    queryKey: ['searchEvents', query],
    queryFn: () => base44.entities.Event.list('-start_time', 100),
    enabled: open
  });

  const handleSearch = (e) => {
    if (e.key === 'Enter' && !query.trim()) {
      setShowAll(true);
    }
  };

  const filterResults = (items, fields = null) => {
    if (showAll && !query) return items;
    if (!query) return [];
    
    const searchTerm = query.toLowerCase().trim();
    // Remove @ prefix for handle searches but keep original for matching
    const cleanedTerm = searchTerm.replace(/^@/, '');
    
    return items.filter(item => {
      // If specific fields provided, search only those
      if (fields) {
        return fields.some(field => {
          const value = item[field];
          if (!value) return false;
          return String(value).toLowerCase().includes(cleanedTerm);
        });
      }
      // Fallback to full JSON search
      return JSON.stringify(item).toLowerCase().includes(cleanedTerm);
    });
  };

  // Search profiles by handle, display_name, bio
  const filteredProfiles = filterResults(profiles, ['handle', 'display_name', 'bio', 'user_id']);
  const filteredListings = filterResults(listings, ['title', 'description', 'owner_name']);
  const filteredMissions = filterResults(missions, ['title', 'description', 'objective']);
  const filteredCircles = filterResults(circles, ['name', 'description', 'purpose']);
  const filteredPosts = filterResults(posts, ['content', 'title']);
  const filteredProjects = filterResults(projects, ['title', 'description']);
  
  // New: Daily Logs, Notes, Meetings, Events
  const filteredDailyLogs = filterResults(dailyLogs, ['overview', 'date']);
  const filteredNotes = filterResults(notes, ['title', 'content']);
  const filteredMeetings = filterResults(meetings, ['title', 'host_name', 'guest_name']);
  const filteredEvents = filterResults(events, ['title', 'description', 'location']);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 top-[120px] translate-y-0" style={{ top: '120px', transform: 'translateX(-50%)' }}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search people, offers, missions, circles... (press Enter to browse all)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
              onKeyDown={handleSearch}
              className="pl-10 pr-10 h-12 rounded-xl"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="px-4">
          <TabsList className="w-full grid grid-cols-11 gap-0.5">
            <TabsTrigger value="all" title="All Results" className="text-xs px-1">All</TabsTrigger>
            <TabsTrigger value="people" title="People">
              <Users className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="dailylogs" title="Daily Logs">
              <CalendarDays className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="notes" title="Notes">
              <StickyNote className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="meetings" title="Meetings">
              <Clock className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="events" title="Events">
              <Calendar className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="offers" title="Offers">
              <ShoppingBag className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="missions" title="Missions">
              <Target className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="circles" title="Circles">
              <CircleDot className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="projects" title="Projects">
              <Folder className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="posts" title="Posts">
              <FileText className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-96 px-4 pb-4">
          {(
            <div className="space-y-2">
              {(tab === 'all' || tab === 'people') && filteredProfiles.length > 0 && (
                <div>
                  {tab === 'all' && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">People</h3>}
                  {filteredProfiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => { onSelect?.('profile', profile); onClose(); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <Avatar className="w-10 h-10 cursor-pointer" data-user-id={profile.user_id}>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{profile.display_name}</p>
                        <p className="text-sm text-slate-500">@{profile.handle}</p>
                      </div>
                      <Users className="w-4 h-4 text-slate-400 ml-auto" />
                    </button>
                  ))}
                </div>
              )}

              {(tab === 'all' || tab === 'offers') && filteredListings.length > 0 && (
                <div>
                  {tab === 'all' && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Offers</h3>}
                  {filteredListings.map(listing => (
                    <button
                      key={listing.id}
                      onClick={() => { onSelect?.('listing', listing); onClose(); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <ShoppingBag className="w-10 h-10 p-2 rounded-lg bg-emerald-100 text-emerald-600" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-slate-900">{listing.title}</p>
                        <p className="text-sm text-slate-500">{listing.is_free ? 'Free' : `$${listing.price_amount}`}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(tab === 'all' || tab === 'missions') && filteredMissions.length > 0 && (
                <div>
                  {tab === 'all' && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Missions</h3>}
                  {filteredMissions.map(mission => (
                    <button
                      key={mission.id}
                      onClick={() => { onSelect?.('mission', mission); onClose(); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <Target className="w-10 h-10 p-2 rounded-lg bg-amber-100 text-amber-600" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-slate-900">{mission.title}</p>
                        <p className="text-sm text-slate-500">{mission.participant_count} joined</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(tab === 'all' || tab === 'circles') && filteredCircles.length > 0 && (
                <div>
                  {tab === 'all' && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Circles</h3>}
                  {filteredCircles.map(circle => (
                    <button
                      key={circle.id}
                      onClick={() => { onSelect?.('circle', circle); onClose(); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <CircleDot className="w-10 h-10 p-2 rounded-lg bg-blue-100 text-blue-600" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-slate-900">{circle.name}</p>
                        <p className="text-sm text-slate-500">{circle.member_count} members</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filteredProfiles.length === 0 && filteredListings.length === 0 && 
               filteredMissions.length === 0 && filteredCircles.length === 0 && filteredPosts.length === 0 && filteredProjects.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>No results found{query ? ` for "${query}"` : ''}</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}