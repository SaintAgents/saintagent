import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Target, ShoppingBag, Trophy, Save, Plus, X, Pin } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function FeaturedShowcase({ profile, isOwnProfile, onUpdate }) {
  const [selectingListings, setSelectingListings] = useState(false);
  const [selectingMissions, setSelectingMissions] = useState(false);
  const [selectingAchievements, setSelectingAchievements] = useState(false);
  const [selectedListingIds, setSelectedListingIds] = useState([]);
  const [selectedMissionIds, setSelectedMissionIds] = useState([]);
  const [selectedAchievements, setSelectedAchievements] = useState([]);

  useEffect(() => {
    setSelectedListingIds(profile?.featured_listing_ids || []);
    setSelectedMissionIds(profile?.featured_mission_ids || []);
    setSelectedAchievements(profile?.featured_achievements || []);
  }, [profile]);

  // Fetch user's listings
  const { data: userListings = [] } = useQuery({
    queryKey: ['userListings', profile?.user_id],
    queryFn: () => base44.entities.Listing.filter({ owner_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  // Fetch user's missions
  const { data: userMissions = [] } = useQuery({
    queryKey: ['userMissions', profile?.user_id],
    queryFn: () => base44.entities.Mission.filter({ creator_id: profile.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch featured listings/missions for display
  const { data: featuredListings = [] } = useQuery({
    queryKey: ['featuredListings', profile?.featured_listing_ids],
    queryFn: async () => {
      if (!profile?.featured_listing_ids?.length) return [];
      const all = await base44.entities.Listing.list();
      return all.filter(l => profile.featured_listing_ids.includes(l.id));
    },
    enabled: !!profile?.featured_listing_ids?.length
  });

  const { data: featuredMissions = [] } = useQuery({
    queryKey: ['featuredMissions', profile?.featured_mission_ids],
    queryFn: async () => {
      if (!profile?.featured_mission_ids?.length) return [];
      const all = await base44.entities.Mission.list();
      return all.filter(m => profile.featured_mission_ids.includes(m.id));
    },
    enabled: !!profile?.featured_mission_ids?.length
  });

  // All possible achievements
  const allAchievements = profile?.achievements || [];

  const handleSaveListings = async () => {
    await onUpdate({ featured_listing_ids: selectedListingIds.slice(0, 3) });
    setSelectingListings(false);
  };

  const handleSaveMissions = async () => {
    await onUpdate({ featured_mission_ids: selectedMissionIds.slice(0, 3) });
    setSelectingMissions(false);
  };

  const handleSaveAchievements = async () => {
    await onUpdate({ featured_achievements: selectedAchievements.slice(0, 5) });
    setSelectingAchievements(false);
  };

  const toggleListingSelection = (id) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3)
    );
  };

  const toggleMissionSelection = (id) => {
    setSelectedMissionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3)
    );
  };

  const toggleAchievementSelection = (achievement) => {
    setSelectedAchievements(prev => 
      prev.includes(achievement) ? prev.filter(x => x !== achievement) : [...prev, achievement].slice(0, 5)
    );
  };

  return (
    <div className="space-y-6">
      {/* Featured Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            Featured Listings
          </CardTitle>
          {isOwnProfile && (
            <Dialog open={selectingListings} onOpenChange={setSelectingListings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-violet-600">
                  <Pin className="w-4 h-4 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Featured Listings (Max 3)</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                  {userListings.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No active listings to feature</p>
                  ) : (
                    <div className="space-y-2">
                      {userListings.map(listing => (
                        <label key={listing.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                          <Checkbox
                            checked={selectedListingIds.includes(listing.id)}
                            onCheckedChange={() => toggleListingSelection(listing.id)}
                            disabled={!selectedListingIds.includes(listing.id) && selectedListingIds.length >= 3}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{listing.title}</p>
                            <p className="text-xs text-slate-500">{listing.category}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setSelectingListings(false)}>Cancel</Button>
                  <Button onClick={handleSaveListings} className="bg-violet-600 hover:bg-violet-700">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {featuredListings.length === 0 ? (
            <p className="text-slate-400 text-sm">{isOwnProfile ? 'Pin up to 3 listings to showcase' : 'No featured listings'}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featuredListings.map(listing => (
                <Link key={listing.id} to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                  <div className="p-3 rounded-lg border hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 to-white">
                    <p className="font-medium text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{listing.category}</p>
                    {listing.price_amount > 0 && (
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700">{listing.price_amount} GGG</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Missions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-violet-500" />
            Featured Missions
          </CardTitle>
          {isOwnProfile && (
            <Dialog open={selectingMissions} onOpenChange={setSelectingMissions}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-violet-600">
                  <Pin className="w-4 h-4 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Featured Missions (Max 3)</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                  {userMissions.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No missions to feature</p>
                  ) : (
                    <div className="space-y-2">
                      {userMissions.map(mission => (
                        <label key={mission.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                          <Checkbox
                            checked={selectedMissionIds.includes(mission.id)}
                            onCheckedChange={() => toggleMissionSelection(mission.id)}
                            disabled={!selectedMissionIds.includes(mission.id) && selectedMissionIds.length >= 3}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{mission.title}</p>
                            <p className="text-xs text-slate-500">{mission.status}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setSelectingMissions(false)}>Cancel</Button>
                  <Button onClick={handleSaveMissions} className="bg-violet-600 hover:bg-violet-700">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {featuredMissions.length === 0 ? (
            <p className="text-slate-400 text-sm">{isOwnProfile ? 'Pin up to 3 missions to showcase' : 'No featured missions'}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featuredMissions.map(mission => (
                <Link key={mission.id} to={createPageUrl('MissionDetail') + '?id=' + mission.id}>
                  <div className="p-3 rounded-lg border hover:shadow-md transition-shadow bg-gradient-to-br from-violet-50 to-white">
                    <p className="font-medium text-sm truncate">{mission.title}</p>
                    <Badge className={`mt-2 ${mission.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {mission.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-amber-500" />
            Featured Achievements
          </CardTitle>
          {isOwnProfile && allAchievements.length > 0 && (
            <Dialog open={selectingAchievements} onOpenChange={setSelectingAchievements}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-violet-600">
                  <Pin className="w-4 h-4 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Featured Achievements (Max 5)</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                  <div className="space-y-2">
                    {allAchievements.map(achievement => (
                      <label key={achievement} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                        <Checkbox
                          checked={selectedAchievements.includes(achievement)}
                          onCheckedChange={() => toggleAchievementSelection(achievement)}
                          disabled={!selectedAchievements.includes(achievement) && selectedAchievements.length >= 5}
                        />
                        <span className="font-medium capitalize">{achievement.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setSelectingAchievements(false)}>Cancel</Button>
                  <Button onClick={handleSaveAchievements} className="bg-violet-600 hover:bg-violet-700">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {(profile?.featured_achievements?.length || 0) === 0 ? (
            <p className="text-slate-400 text-sm">{isOwnProfile ? 'Pin your top achievements' : 'No featured achievements'}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.featured_achievements.map(achievement => (
                <Badge key={achievement} className="bg-amber-100 text-amber-700 capitalize">
                  <Star className="w-3 h-3 mr-1" />
                  {achievement.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}