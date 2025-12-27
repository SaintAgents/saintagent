import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  DollarSign,
  CheckCircle,
  Sparkles,
  Plus,
  ArrowRight,
  Zap,
  ShoppingBag,
  Radio,
  Flame,
  BarChart3
} from "lucide-react";

import MetricTile from '@/components/hud/MetricTile';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import MatchCard from '@/components/hud/MatchCard';
import MeetingCard from '@/components/hud/MeetingCard';
import MissionCard from '@/components/hud/MissionCard';
import ListingCard from '@/components/hud/ListingCard';
import ProgressRing from '@/components/hud/ProgressRing';
import SidePanel from '@/components/hud/SidePanel';
import QuickCreateModal from '@/components/hud/QuickCreateModal';

export default function CommandDeck() {
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [matchTab, setMatchTab] = useState('people');

  // Fetch user profile
  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  // Fetch matches
  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.filter({ status: 'active' }, '-match_score', 20)
  });

  // Fetch meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 10)
  });

  // Fetch missions
  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 10)
  });

  // Fetch listings
  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 10)
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 20)
  });

  const filteredMatches = matches.filter(m => 
    matchTab === 'people' ? m.target_type === 'person' :
    matchTab === 'offers' ? m.target_type === 'offer' :
    matchTab === 'missions' ? m.target_type === 'mission' :
    matchTab === 'events' ? m.target_type === 'event' :
    matchTab === 'teachers' ? m.target_type === 'teacher' : true
  );

  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetingsThisWeek = meetings.filter(m => m.status === 'completed').length;

  const handleMatchAction = (action, match) => {
    console.log('Match action:', action, match);
  };

  const handleMeetingAction = (action, meeting) => {
    console.log('Meeting action:', action, meeting);
  };

  const handleMissionAction = (action, mission) => {
    console.log('Mission action:', action, mission);
  };

  const handleListingAction = (action, listing) => {
    console.log('Listing action:', action, listing);
  };

  const handleCreate = (type, data) => {
    console.log('Create:', type, data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className={cn(
        "transition-all duration-300 pb-8",
        sidePanelOpen ? "pr-80" : "pr-0"
      )}>
        {/* Page Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Command Deck</h1>
              <p className="text-slate-500 mt-1">Your mission control center</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl gap-2"
                onClick={() => setSidePanelOpen(!sidePanelOpen)}
              >
                <BarChart3 className="w-4 h-4" />
                {sidePanelOpen ? 'Hide Panel' : 'Show Panel'}
              </Button>
              <Button 
                className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                onClick={() => setQuickCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Quick Create
              </Button>
            </div>
          </div>

          {/* Hero Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricTile 
              label="GGG Balance" 
              value={profile?.ggg_balance?.toLocaleString() || "0"} 
              icon={Coins}
              color="amber"
              trend="up"
              trendValue="+124 today"
            />
            <MetricTile 
              label="Rank" 
              value={profile?.rank_code?.charAt(0).toUpperCase() + profile?.rank_code?.slice(1) || "Seeker"}
              icon={TrendingUp}
              color="violet"
            />
            <MetricTile 
              label="Reach Score" 
              value={profile?.reach_score || 0}
              icon={Users}
              color="blue"
              trend="up"
              trendValue="+8%"
            />
            <MetricTile 
              label="Earnings" 
              value={`$${profile?.total_earnings?.toLocaleString() || 0}`}
              icon={DollarSign}
              color="emerald"
            />
            <MetricTile 
              label="Meetings" 
              value={completedMeetingsThisWeek}
              icon={Calendar}
              color="rose"
            />
            <MetricTile 
              label="Missions" 
              value={missions.filter(m => m.participant_ids?.includes(profile?.user_id)).length}
              icon={Target}
              color="amber"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column A: Now + Daily Action */}
          <div className="space-y-6">
            {/* Command Summary */}
            <CollapsibleCard 
              title="Quick Actions" 
              icon={Zap}
              badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined}
              badgeColor="amber"
            >
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-20 flex-col gap-2 bg-violet-600 hover:bg-violet-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs">Book Meeting</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl">
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Post Update</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl">
                  <Target className="w-5 h-5" />
                  <span className="text-xs">Launch Mission</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-xs">Create Offer</span>
                </Button>
              </div>
            </CollapsibleCard>

            {/* Inbox & Signals */}
            <CollapsibleCard 
              title="Inbox & Signals" 
              icon={Radio}
              badge={notifications.length}
              badgeColor="rose"
            >
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">All caught up!</p>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div 
                      key={notif.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-violet-100">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    </div>
                  ))
                )}
              </div>
            </CollapsibleCard>

            {/* Circles & Regions */}
            <CollapsibleCard 
              title="Circles & Regions" 
              icon={Users}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Join a Circle</p>
                    <p className="text-xs text-slate-500">Find your community</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Explore Your Region</p>
                    <p className="text-xs text-slate-500">Local events & needs</p>
                  </div>
                </Button>
              </div>
            </CollapsibleCard>
          </div>

          {/* Column B: Synchronicity + Meetings + Missions */}
          <div className="space-y-6">
            {/* Synchronicity Stack */}
            <CollapsibleCard 
              title="Synchronicity Engine" 
              icon={Sparkles}
              badge={matches.length}
              badgeColor="violet"
            >
              <Tabs value={matchTab} onValueChange={setMatchTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 mb-4">
                  <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
                  <TabsTrigger value="offers" className="text-xs">Offers</TabsTrigger>
                  <TabsTrigger value="missions" className="text-xs">Missions</TabsTrigger>
                  <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
                  <TabsTrigger value="teachers" className="text-xs">Teachers</TabsTrigger>
                </TabsList>
                <div className="space-y-3">
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No matches yet</p>
                      <p className="text-xs text-slate-400 mt-1">Complete your profile to find matches</p>
                    </div>
                  ) : (
                    filteredMatches.slice(0, 3).map((match) => (
                      <MatchCard 
                        key={match.id} 
                        match={match} 
                        onAction={handleMatchAction}
                      />
                    ))
                  )}
                  {filteredMatches.length > 3 && (
                    <Button variant="ghost" className="w-full text-violet-600">
                      View all {filteredMatches.length} matches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Tabs>
            </CollapsibleCard>

            {/* Meetings & Momentum */}
            <CollapsibleCard 
              title="Meetings & Momentum" 
              icon={Calendar}
              badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined}
              badgeColor="amber"
            >
              <div className="space-y-3">
                {scheduledMeetings.length === 0 && pendingMeetings.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No upcoming meetings</p>
                    <Button variant="outline" className="mt-3 rounded-xl">
                      Schedule a meeting
                    </Button>
                  </div>
                ) : (
                  [...pendingMeetings, ...scheduledMeetings].slice(0, 3).map((meeting) => (
                    <MeetingCard 
                      key={meeting.id} 
                      meeting={meeting} 
                      onAction={handleMeetingAction}
                    />
                  ))
                )}
              </div>
            </CollapsibleCard>

            {/* Missions & Quests */}
            <CollapsibleCard 
              title="Missions & Quests" 
              icon={Target}
              badge={missions.length}
              badgeColor="amber"
            >
              <div className="space-y-3">
                {missions.length === 0 ? (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No active missions</p>
                    <Button variant="outline" className="mt-3 rounded-xl">
                      Browse missions
                    </Button>
                  </div>
                ) : (
                  missions.slice(0, 2).map((mission) => (
                    <MissionCard 
                      key={mission.id} 
                      mission={mission} 
                      onAction={handleMissionAction}
                      variant="compact"
                    />
                  ))
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* Column C: Earnings + Influence + Creator */}
          <div className="space-y-6">
            {/* Marketplace Card */}
            <CollapsibleCard 
              title="Marketplace: Earn & Learn" 
              icon={ShoppingBag}
            >
              <Tabs defaultValue="offers" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="offers" className="text-xs">My Offers</TabsTrigger>
                  <TabsTrigger value="requests" className="text-xs">Requests</TabsTrigger>
                  <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
                </TabsList>
                <TabsContent value="offers" className="space-y-3">
                  {listings.filter(l => l.listing_type === 'offer').length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No offers yet</p>
                      <Button className="mt-3 rounded-xl bg-violet-600 hover:bg-violet-700">
                        Create your first offer
                      </Button>
                    </div>
                  ) : (
                    listings.filter(l => l.listing_type === 'offer').slice(0, 2).map((listing) => (
                      <ListingCard 
                        key={listing.id} 
                        listing={listing} 
                        isOwner={true}
                        onAction={handleListingAction}
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="requests" className="space-y-3">
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">No pending requests</p>
                  </div>
                </TabsContent>
                <TabsContent value="browse" className="space-y-3">
                  {listings.slice(0, 2).map((listing) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      onAction={handleListingAction}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CollapsibleCard>

            {/* Influence & Broadcast */}
            <CollapsibleCard 
              title="Influence & Reach" 
              icon={TrendingUp}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">{profile?.follower_count || 0}</p>
                    <p className="text-xs text-slate-500">Followers</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">{profile?.following_count || 0}</p>
                    <p className="text-xs text-slate-500">Following</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-violet-50">
                    <p className="text-2xl font-bold text-violet-700">{profile?.reach_score || 0}</p>
                    <p className="text-xs text-violet-600">Reach</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span className="font-medium text-slate-900">Boost Your Reach</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Spend GGG to amplify your content and attract more followers.
                  </p>
                  <Button className="w-full rounded-xl bg-violet-600 hover:bg-violet-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Boost Now
                  </Button>
                </div>
              </div>
            </CollapsibleCard>

            {/* Leader Channel Preview */}
            <CollapsibleCard 
              title="144K Leader Channel" 
              icon={Radio}
              defaultOpen={false}
            >
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Become a Verified Leader</h4>
                <p className="text-sm text-slate-500 mb-4">
                  Join the 144,000 Super-Conscious Leaders with special broadcast privileges.
                </p>
                <Button variant="outline" className="rounded-xl">
                  Apply for Verification
                </Button>
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel 
        matches={matches.slice(0, 5)}
        meetings={scheduledMeetings}
        profile={profile}
        isOpen={sidePanelOpen}
        onToggle={() => setSidePanelOpen(!sidePanelOpen)}
        onMatchAction={handleMatchAction}
        onMeetingAction={handleMeetingAction}
      />

      {/* Quick Create Modal */}
      <QuickCreateModal 
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}