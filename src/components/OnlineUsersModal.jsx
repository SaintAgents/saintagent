import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  MapPin, 
  TrendingUp,
  Sparkles,
  MessageCircle,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnlineUsersModal({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    enabled: open
  });

  // Filter online users (status = online)
  const onlineProfiles = profiles.filter(p => p.status === 'online' || p.status === 'focus');

  // Apply filters
  let filteredProfiles = onlineProfiles.filter(profile => {
    const matchesSearch = !searchQuery || 
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.handle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = regionFilter === 'all' || profile.region === regionFilter;
    const matchesRank = rankFilter === 'all' || profile.rank_code === rankFilter;

    return matchesSearch && matchesRegion && matchesRank;
  });

  // Apply sorting
  filteredProfiles.sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.updated_date) - new Date(a.updated_date);
    if (sortBy === 'rank_desc') return (b.rank_points || 0) - (a.rank_points || 0);
    if (sortBy === 'reach_desc') return (b.reach_score || 0) - (a.reach_score || 0);
    if (sortBy === 'ggg_desc') return (b.ggg_balance || 0) - (a.ggg_balance || 0);
    if (sortBy === 'followers_desc') return (b.follower_count || 0) - (a.follower_count || 0);
    return 0;
  });

  // Group by region
  const byRegion = filteredProfiles.reduce((acc, profile) => {
    const region = profile.region || 'Unknown';
    if (!acc[region]) acc[region] = [];
    acc[region].push(profile);
    return acc;
  }, {});

  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania', 'Other'];
  const ranks = ['seeker', 'initiate', 'adept', 'master', 'sage', 'oracle', 'ascended'];

  const statusColors = {
    online: 'bg-emerald-500',
    focus: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-slate-400'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-emerald-600" />
            Online Now ({onlineProfiles.length})
          </DialogTitle>
        </DialogHeader>

        {/* Filters & Sort */}
        <div className="px-6 py-4 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or handle..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Ranks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                {ranks.map(rank => (
                  <SelectItem key={rank} value={rank} className="capitalize">{rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="rank_desc">Rank (High to Low)</SelectItem>
                <SelectItem value="reach_desc">Reach (High to Low)</SelectItem>
                <SelectItem value="ggg_desc">GGG Balance</SelectItem>
                <SelectItem value="followers_desc">Followers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">{filteredProfiles.length}</span>
            <span>users found</span>
          </div>
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-6">
            {Object.entries(byRegion).map(([region, users]) => (
              <div key={region}>
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">{region}</h3>
                  <span className="text-sm text-slate-500">({users.length})</span>
                </div>
                <div className="grid gap-3">
                  {users.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      data-user-id={profile.user_id}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback className="bg-violet-100 text-violet-600">
                            {profile.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white",
                          statusColors[profile.status || 'online']
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900 truncate">{profile.display_name}</p>
                          {profile.leader_tier === 'verified144k' && (
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">@{profile.handle}</p>
                        {profile.bio && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{profile.bio}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {profile.rank_code || 'seeker'}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{profile.reach_score || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{profile.follower_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          <Calendar className="w-3 h-3 mr-1" />
                          Meet
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No users found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}