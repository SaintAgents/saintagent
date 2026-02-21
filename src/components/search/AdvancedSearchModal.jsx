import React, { useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, X, Filter, Users, ShoppingBag, Target, Calendar, 
  CircleDot, FileText, Folder, LayoutGrid, SlidersHorizontal,
  Loader2, StickyNote, Clock, LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdvancedSearchFilters from "./AdvancedSearchFilters";
import SearchResultCard from "./SearchResultCard";

const TAB_CONFIG = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'pages', label: 'Pages', icon: LayoutDashboard },
  { id: 'people', label: 'People', icon: Users },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'circles', label: 'Circles', icon: CircleDot },
  { id: 'offers', label: 'Offers', icon: ShoppingBag },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'projects', label: 'Projects', icon: Folder },
];

// All application pages for search
const APP_PAGES = [
  { name: 'CommandDeck', label: 'Command Deck', description: 'Main dashboard' },
  { name: 'Profile', label: 'Profile', description: 'Your profile' },
  { name: 'Messages', label: 'Messages', description: 'Direct messages' },
  { name: 'Missions', label: 'Missions', description: 'Browse missions' },
  { name: 'Marketplace', label: 'Marketplace', description: 'Offers & services' },
  { name: 'Circles', label: 'Circles', description: 'Community circles' },
  { name: 'Projects', label: 'Projects', description: 'Project management' },
  { name: 'Deals', label: 'Deals', description: 'Deal pipeline' },
  { name: 'CommunityFeed', label: 'Community Feed', description: 'Posts & updates' },
  { name: 'ActivityFeed', label: 'Activity Feed', description: 'Recent activity' },
  { name: 'Events', label: 'Events', description: 'Upcoming events' },
  { name: 'Meetings', label: 'Meetings', description: 'Scheduled meetings' },
  { name: 'Schedule', label: 'Schedule', description: 'Calendar view' },
  { name: 'Broadcast', label: 'Broadcast', description: 'Live broadcasts' },
  { name: 'News', label: 'News', description: 'Platform news' },
  { name: 'Quests', label: 'Quests', description: 'Available quests' },
  { name: 'Leaderboards', label: 'Leaderboards', description: 'Rankings' },
  { name: 'Settings', label: 'Settings', description: 'App settings' },
  { name: 'Admin', label: 'Admin', description: 'Admin panel' },
  { name: 'Notes', label: 'Notes', description: 'Your notes' },
  { name: 'DailyOps', label: 'Daily Ops', description: 'Daily operations' },
  { name: 'Forum', label: 'Forum', description: 'Discussion forum' },
  { name: 'SpiritTube', label: 'Spirit Tube', description: 'Video content' },
  { name: 'LearningHub', label: 'Learning Hub', description: 'Courses & learning' },
  { name: 'CRM', label: 'CRM', description: 'Contact management' },
  { name: 'Profiles', label: 'Profiles', description: 'Browse profiles' },
  { name: 'Matches', label: 'Matches', description: 'Your matches' },
  { name: 'AffiliateCenter', label: 'Affiliate Center', description: 'Referral program' },
];

// Quick action pages
const QUICK_PAGES = APP_PAGES.slice(0, 7);

export default function AdvancedSearchModal({ open, onClose, onSelect }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [expandedSections, setExpandedSections] = useState(['location']);

  // Fetch all data
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['searchProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    enabled: open,
    staleTime: 30000
  });

  const { data: listings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['searchListings'],
    queryFn: () => base44.entities.Listing.list('-created_date', 100),
    enabled: open,
    staleTime: 30000
  });

  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ['searchMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100),
    enabled: open,
    staleTime: 30000
  });

  const { data: circles = [], isLoading: loadingCircles } = useQuery({
    queryKey: ['searchCircles'],
    queryFn: () => base44.entities.Circle.list('-created_date', 100),
    enabled: open,
    staleTime: 30000
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['searchEvents'],
    queryFn: () => base44.entities.Event.list('-start_time', 100),
    enabled: open,
    staleTime: 30000
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['searchPosts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
    enabled: open,
    staleTime: 30000
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['searchProjects'],
    queryFn: () => base44.entities.Project.list('-created_date', 100),
    enabled: open,
    staleTime: 30000
  });

  const isLoading = loadingProfiles || loadingListings || loadingMissions || 
                    loadingCircles || loadingEvents || loadingPosts || loadingProjects;

  // Filter and search logic
  const applyFilters = useCallback((items, type) => {
    let result = [...items];

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase().trim().replace(/^@/, '');
      result = result.filter(item => {
        const searchableText = JSON.stringify(item).toLowerCase();
        return searchableText.includes(searchTerm);
      });
    }

    // Location filter
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter(item => {
        const itemLoc = (item.location || item.region || '').toLowerCase();
        return itemLoc.includes(loc);
      });
    }

    // Region filter
    if (filters.region) {
      result = result.filter(item => {
        return item.region === filters.region || item.location?.includes(filters.region);
      });
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      result = result.filter(item => {
        const itemDate = new Date(item.created_date || item.start_time || item.scheduled_time);
        if (filters.dateFrom && itemDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && itemDate > new Date(filters.dateTo)) return false;
        return true;
      });
    }

    // Status filter
    if (filters.status && filters.status !== 'any') {
      result = result.filter(item => item.status === filters.status);
    }

    // Type-specific filters
    if (type === 'profile') {
      // Skills filter
      if (filters.skills?.length > 0) {
        result = result.filter(item => {
          const userSkills = item.skills || [];
          return filters.skills.some(skill => 
            userSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          );
        });
      }

      // Engagement level
      if (filters.engagementLevel && filters.engagementLevel !== 'any') {
        result = result.filter(item => {
          const activity = (item.follower_count || 0) + (item.following_count || 0);
          switch (filters.engagementLevel) {
            case 'beginner': return activity <= 10;
            case 'active': return activity > 10 && activity <= 50;
            case 'engaged': return activity > 50 && activity <= 100;
            case 'power': return activity > 100;
            default: return true;
          }
        });
      }
    }

    if (type === 'mission') {
      // Mission type filter
      if (filters.missionTypes?.length > 0) {
        result = result.filter(item => 
          filters.missionTypes.includes(item.mission_type)
        );
      }
    }

    if (type === 'circle') {
      // Member count filter
      if (filters.minMembers) {
        result = result.filter(item => (item.member_count || 0) >= filters.minMembers);
      }
      if (filters.maxMembers && filters.maxMembers < 1000) {
        result = result.filter(item => (item.member_count || 0) <= filters.maxMembers);
      }
    }

    if (type === 'listing') {
      // Price filter
      if (filters.isFree) {
        result = result.filter(item => item.is_free === true);
      } else {
        if (filters.priceMin !== undefined) {
          result = result.filter(item => (item.price_amount || 0) >= filters.priceMin);
        }
        if (filters.priceMax !== undefined) {
          result = result.filter(item => (item.price_amount || 0) <= filters.priceMax);
        }
      }
    }

    return result;
  }, [query, filters]);

  // Filter pages based on query
  const filteredPages = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return APP_PAGES.filter(page =>
      page.label.toLowerCase().includes(q) ||
      page.description.toLowerCase().includes(q) ||
      page.name.toLowerCase().includes(q)
    );
  }, [query]);

  // Filtered results
  const filteredResults = useMemo(() => ({
    pages: filteredPages,
    profiles: applyFilters(profiles, 'profile'),
    listings: applyFilters(listings, 'listing'),
    missions: applyFilters(missions, 'mission'),
    circles: applyFilters(circles, 'circle'),
    events: applyFilters(events, 'event'),
    posts: applyFilters(posts, 'post'),
    projects: applyFilters(projects, 'project'),
  }), [filteredPages, profiles, listings, missions, circles, events, posts, projects, applyFilters]);

  const totalResults = Object.values(filteredResults).reduce((sum, arr) => sum + arr.length, 0);

  const handleSelect = (type, item) => {
    onSelect?.(type, item);
    onClose();
  };

  const handlePageNav = (pageName) => {
    navigate(createPageUrl(pageName));
    onClose();
  };

  const resetFilters = () => {
    setFilters({});
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const val = filters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'boolean') return val;
    if (val === 'any') return false;
    return !!val;
  });

  const renderResults = (type, items, limit = 5) => {
    const displayItems = tab === 'all' ? items.slice(0, limit) : items;
    if (displayItems.length === 0) return null;

    return (
      <div className="space-y-1">
        {displayItems.map(item => (
          <SearchResultCard
            key={item.id}
            type={type}
            item={item}
            onClick={handleSelect}
          />
        ))}
        {tab === 'all' && items.length > limit && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-slate-500"
            onClick={() => setTab(type === 'profile' ? 'people' : type + 's')}
          >
            Show all {items.length} results
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 max-h-[90vh] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search people, missions, circles, listings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl text-base"
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
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              className="h-12 w-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Pages */}
          {!query && !hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              <span className="text-xs text-slate-500 shrink-0">Quick:</span>
              {QUICK_PAGES.map(page => (
                <Badge
                  key={page.name}
                  variant="secondary"
                  className="cursor-pointer shrink-0"
                  onClick={() => handlePageNav(page.name)}
                >
                  {page.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2">
              <Filter className="w-4 h-4 text-violet-500" />
              <span className="text-sm text-violet-600">Filters active</span>
              <Button variant="ghost" size="sm" className="text-xs h-6" onClick={resetFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 pt-2 border-b">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-start bg-transparent gap-1 h-auto p-0 pb-2">
              {TAB_CONFIG.map(t => {
                const Icon = t.icon;
                const count = t.id === 'all' ? totalResults : 
                              t.id === 'pages' ? filteredResults.pages.length :
                              t.id === 'people' ? filteredResults.profiles.length :
                              t.id === 'offers' ? filteredResults.listings.length :
                              filteredResults[t.id]?.length || 0;
                return (
                  <TabsTrigger 
                    key={t.id} 
                    value={t.id}
                    className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 gap-1.5 px-3"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Filters Panel */}
          {showFilters && (
            <div className="w-72 border-r p-4 shrink-0">
              <AdvancedSearchFilters
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                activeTab={tab}
                expandedSections={expandedSections}
                onToggleSection={toggleSection}
              />
            </div>
          )}

          {/* Results */}
          <ScrollArea className="flex-1 h-[50vh]">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* All tab - show grouped results */}
                  {tab === 'all' && (
                    <>
                      {/* Pages section */}
                      {filteredResults.pages.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Pages ({filteredResults.pages.length})
                          </h3>
                          <div className="space-y-1">
                            {filteredResults.pages.slice(0, 5).map(page => (
                              <button
                                key={page.name}
                                onClick={() => handlePageNav(page.name)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left"
                              >
                                <LayoutDashboard className="w-8 h-8 p-1.5 rounded-lg bg-violet-100 text-violet-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{page.label}</p>
                                  <p className="text-xs text-slate-500 truncate">{page.description}</p>
                                </div>
                              </button>
                            ))}
                            {filteredResults.pages.length > 5 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-xs text-slate-500"
                                onClick={() => setTab('pages')}
                              >
                                Show all {filteredResults.pages.length} pages
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {filteredResults.profiles.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" /> People ({filteredResults.profiles.length})
                          </h3>
                          {renderResults('profile', filteredResults.profiles)}
                        </div>
                      )}

                      {filteredResults.missions.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Missions ({filteredResults.missions.length})
                          </h3>
                          {renderResults('mission', filteredResults.missions)}
                        </div>
                      )}

                      {filteredResults.circles.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <CircleDot className="w-4 h-4" /> Circles ({filteredResults.circles.length})
                          </h3>
                          {renderResults('circle', filteredResults.circles)}
                        </div>
                      )}

                      {filteredResults.listings.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Offers ({filteredResults.listings.length})
                          </h3>
                          {renderResults('listing', filteredResults.listings)}
                        </div>
                      )}

                      {filteredResults.events.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Events ({filteredResults.events.length})
                          </h3>
                          {renderResults('event', filteredResults.events)}
                        </div>
                      )}

                      {filteredResults.posts.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Posts ({filteredResults.posts.length})
                          </h3>
                          {renderResults('post', filteredResults.posts)}
                        </div>
                      )}

                      {filteredResults.projects.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Folder className="w-4 h-4" /> Projects ({filteredResults.projects.length})
                          </h3>
                          {renderResults('project', filteredResults.projects)}
                        </div>
                      )}
                    </>
                  )}

                  {/* Individual tabs */}
                  {tab === 'pages' && (
                    <div className="space-y-1">
                      {filteredResults.pages.length > 0 ? (
                        filteredResults.pages.map(page => (
                          <button
                            key={page.name}
                            onClick={() => handlePageNav(page.name)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left"
                          >
                            <LayoutDashboard className="w-8 h-8 p-1.5 rounded-lg bg-violet-100 text-violet-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{page.label}</p>
                              <p className="text-xs text-slate-500 truncate">{page.description}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <LayoutDashboard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p>Type to search pages</p>
                        </div>
                      )}
                    </div>
                  )}
                  {tab === 'people' && renderResults('profile', filteredResults.profiles, 100)}
                  {tab === 'missions' && renderResults('mission', filteredResults.missions, 100)}
                  {tab === 'circles' && renderResults('circle', filteredResults.circles, 100)}
                  {tab === 'offers' && renderResults('listing', filteredResults.listings, 100)}
                  {tab === 'events' && renderResults('event', filteredResults.events, 100)}
                  {tab === 'posts' && renderResults('post', filteredResults.posts, 100)}
                  {tab === 'projects' && renderResults('project', filteredResults.projects, 100)}

                  {/* No results */}
                  {totalResults === 0 && query && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">
                        No results found for "{query}". Try a different search term.
                      </p>
                    </div>
                  )}
                  
                  {/* Empty state - no query */}
                  {!query && !hasActiveFilters && totalResults === 0 && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Start typing to search across the platform.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {APP_PAGES.slice(0, 12).map(page => (
                          <Badge
                            key={page.name}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handlePageNav(page.name)}
                          >
                            {page.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="border-t p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{totalResults} results found</span>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white rounded border">⌘K</kbd>
            <span>to search</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}