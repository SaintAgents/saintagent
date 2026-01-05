import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Crown, 
  MapPin, 
  MessageCircle,
  UserPlus,
  Star,
  Filter
} from "lucide-react";
import RankedAvatar from '@/components/reputation/RankedAvatar';

export default function GroupMemberDirectory({ circle, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Fetch profiles for all members
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['groupMembers', circle.id],
    queryFn: async () => {
      if (!circle.member_ids?.length) return [];
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.filter(p => circle.member_ids.includes(p.user_id));
    },
    enabled: !!circle.member_ids?.length
  });

  // Filter and sort members
  const filteredMembers = memberProfiles
    .filter(m => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return m.display_name?.toLowerCase().includes(q) ||
               m.handle?.toLowerCase().includes(q) ||
               m.region?.toLowerCase().includes(q) ||
               m.skills?.some(s => s.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.display_name || '').localeCompare(b.display_name || '');
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'rank') return (b.rp_points || 0) - (a.rp_points || 0);
      return 0;
    });

  const ownerProfile = memberProfiles.find(m => m.user_id === circle.owner_id);

  const openChat = (member) => {
    const event = new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: member.user_id,
        recipientName: member.display_name,
        recipientAvatar: member.avatar_url
      }
    });
    document.dispatchEvent(event);
  };

  const openProfile = (member) => {
    const event = new CustomEvent('openProfile', {
      detail: { userId: member.user_id }
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search members by name, skills, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-3 rounded-lg border bg-white text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="recent">Recently Joined</option>
          <option value="rank">By Rank</option>
        </select>
      </div>

      {/* Owner Highlight */}
      {ownerProfile && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Group Owner</span>
          </div>
          <MemberCard 
            member={ownerProfile} 
            isOwner 
            onChat={() => openChat(ownerProfile)}
            onProfile={() => openProfile(ownerProfile)}
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>{filteredMembers.length} members</span>
        {searchQuery && <span>matching "{searchQuery}"</span>}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers
          .filter(m => m.user_id !== circle.owner_id)
          .map(member => (
            <MemberCard 
              key={member.id} 
              member={member}
              onChat={() => openChat(member)}
              onProfile={() => openProfile(member)}
            />
          ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No members found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isOwner, onChat, onProfile }) {
  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="cursor-pointer" onClick={onProfile}>
          <RankedAvatar
            src={member.avatar_url}
            name={member.display_name}
            size={48}
            rpRankCode={member.rp_rank_code}
            rpPoints={member.rp_points}
            userId={member.user_id}
            leaderTier={member.leader_tier}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 
              className="font-medium text-slate-900 truncate cursor-pointer hover:text-violet-600"
              onClick={onProfile}
            >
              {member.display_name}
            </h4>
            {isOwner && <Crown className="w-4 h-4 text-amber-500" />}
            {member.leader_tier === 'verified144k' && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">144K</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">@{member.handle}</p>
          
          {member.region && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {member.region}
            </p>
          )}

          {member.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {member.skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={onProfile}
        >
          View Profile
        </Button>
        <Button 
          size="sm" 
          className="flex-1 gap-1 bg-violet-600 hover:bg-violet-700"
          onClick={onChat}
        >
          <MessageCircle className="w-3 h-3" />
          Message
        </Button>
      </div>
    </div>
  );
}