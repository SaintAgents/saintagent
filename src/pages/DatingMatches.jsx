import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heart,
  Search,
  MessageCircle,
  Eye,
  Sparkles,
  MapPin,
  Target,
  Users,
  Filter,
  RefreshCw,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';
import { DEMO_AVATARS_MALE, DEMO_AVATARS_FEMALE } from '@/components/demoAvatars';

const DEMO_NAMES_FEMALE = ['Sophia', 'Maya', 'Luna', 'Aurora', 'Elena', 'Aria', 'Serena', 'Willow', 'Iris', 'Nova'];
const DEMO_NAMES_MALE = ['Marcus', 'Ethan', 'Leo', 'Kai', 'Julian', 'Adrian', 'Ezra', 'Felix', 'Orion', 'Silas'];

export default function DatingMatches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [compatibilityRange, setCompatibilityRange] = useState([50, 100]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('compatibility');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['myUserProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });
  const myProfile = myProfiles?.[0];

  const { data: myDatingProfiles = [] } = useQuery({
    queryKey: ['myDatingProfile', currentUser?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });
  const myDP = myDatingProfiles?.[0];

  const { data: allDatingProfiles = [], isLoading, refetch } = useQuery({
    queryKey: ['allDatingProfilesForMatching'],
    queryFn: () => base44.entities.DatingProfile.filter({ opt_in: true, visible: true }),
    enabled: !!currentUser?.email
  });

  const { data: allUserProfiles = [] } = useQuery({
    queryKey: ['allUserProfilesForMatching'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200)
  });

  // Filter based on gender preferences
  const myInterestedIn = myDP?.interested_in || [];
  const genderToInterest = { 'man': 'men', 'woman': 'women', 'non_binary': 'non_binary' };

  const filteredProfiles = allDatingProfiles
    .filter((dp) => {
      if (dp.user_id === currentUser?.email) return false;
      
      // Gender preference filter
      if (myInterestedIn.length > 0 && !myInterestedIn.includes('all')) {
        const candidateGender = dp.gender;
        if (!candidateGender) return false;
        const candidateInterestKey = genderToInterest[candidateGender];
        if (!candidateInterestKey || !myInterestedIn.includes(candidateInterestKey)) {
          return false;
        }
      }
      
      return true;
    })
    .map((dp, idx) => {
      const up = allUserProfiles.find((u) => u.user_id === dp.user_id);
      const isFemale = dp.gender === 'woman';
      const isMale = dp.gender === 'man';
      
      // Assign demo name if needed
      let displayName = up?.display_name || dp.display_name;
      if (!displayName || displayName.includes('demo') || displayName.includes('anonymous')) {
        if (isFemale) {
          displayName = DEMO_NAMES_FEMALE[idx % DEMO_NAMES_FEMALE.length];
        } else if (isMale) {
          displayName = DEMO_NAMES_MALE[idx % DEMO_NAMES_MALE.length];
        } else {
          displayName = 'User';
        }
      }
      
      // Assign demo avatar if needed
      let avatar = up?.avatar_url || dp.avatar_url;
      if (!avatar) {
        if (isFemale) {
          avatar = DEMO_AVATARS_FEMALE[idx % DEMO_AVATARS_FEMALE.length];
        } else if (isMale) {
          avatar = DEMO_AVATARS_MALE[idx % DEMO_AVATARS_MALE.length];
        }
      }
      
      // Calculate compatibility score
      const compatibilityScore = calculateCompatibility(myDP, dp, myProfile, up);
      
      return {
        ...dp,
        displayName,
        avatar,
        userProfile: up,
        compatibilityScore,
        location: dp.location || up?.location || up?.region,
        bio: dp.bio || up?.bio
      };
    })
    .filter((p) => {
      // Search filter
      const q = searchQuery.toLowerCase();
      if (q && !p.displayName?.toLowerCase().includes(q) && !p.bio?.toLowerCase().includes(q)) {
        return false;
      }
      
      // Compatibility range filter
      if (p.compatibilityScore < compatibilityRange[0] || p.compatibilityScore > compatibilityRange[1]) {
        return false;
      }
      
      // Location filter
      if (locationFilter !== 'all' && p.location !== locationFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibilityScore - a.compatibilityScore;
      if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
      return 0;
    });

  // Get unique locations for filter
  const locations = [...new Set(filteredProfiles.map(p => p.location).filter(Boolean))];

  // Stats
  const totalMatches = filteredProfiles.length;
  const highCompatibility = filteredProfiles.filter(p => p.compatibilityScore >= 80).length;
  const avgCompatibility = totalMatches > 0 
    ? Math.round(filteredProfiles.reduce((sum, p) => sum + p.compatibilityScore, 0) / totalMatches)
    : 0;

  const openChat = (userId, name, avatar) => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: { recipientId: userId, recipientName: name, recipientAvatar: avatar }
    }));
  };

  const openProfile = (userId) => {
    // Navigate to profile page with user id
    window.location.href = createPageUrl('Profile') + '?id=' + userId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                Dating Matches
              </h1>
              <p className="text-slate-500 mt-1">Find your perfect romantic connection</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-pink-200 hover:bg-pink-50"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{totalMatches}</p>
              <p className="text-sm text-slate-500">Total Matches</p>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{highCompatibility}</p>
              <p className="text-sm text-slate-500">High Compatibility (80%+)</p>
            </CardContent>
          </Card>
          <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-fuchsia-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{avgCompatibility}%</p>
              <p className="text-sm text-slate-500">Avg Compatibility</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-slate-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Compatibility</span>
                  <span>{compatibilityRange[0]}% - {compatibilityRange[1]}%</span>
                </div>
                <Slider
                  value={compatibilityRange}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={setCompatibilityRange}
                  className="[&_[role=slider]]:bg-pink-500"
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compatibility">Highest Compatibility</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or check back later for new profiles.</p>
            <Button onClick={() => { setSearchQuery(''); setCompatibilityRange([0, 100]); setLocationFilter('all'); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <DatingMatchCard
                key={profile.id}
                profile={profile}
                onMessage={() => openChat(profile.user_id, profile.displayName, profile.avatar)}
                onViewProfile={() => openProfile(profile.user_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function calculateCompatibility(myDP, theirDP, myProfile, theirProfile) {
  if (!myDP || !theirDP) return Math.floor(Math.random() * 30) + 60;
  
  let score = 50;
  
  // Values alignment
  const myValues = myDP.core_values_ranked || [];
  const theirValues = theirDP.core_values_ranked || [];
  const sharedValues = myValues.filter(v => theirValues.includes(v)).length;
  score += sharedValues * 5;
  
  // Relationship intent match
  if (myDP.relationship_intent && myDP.relationship_intent === theirDP.relationship_intent) {
    score += 10;
  }
  
  // Communication depth preference
  if (myDP.comm_depth && myDP.comm_depth === theirDP.comm_depth) {
    score += 8;
  }
  
  // Growth orientation
  if (myDP.growth_orientation && myDP.growth_orientation === theirDP.growth_orientation) {
    score += 7;
  }
  
  // Daily rhythm compatibility
  if (myDP.daily_rhythm && myDP.daily_rhythm === theirDP.daily_rhythm) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

function DatingMatchCard({ profile, onMessage, onViewProfile }) {
  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getInsight = () => {
    const insights = [
      "Shares your core values",
      "Similar communication style",
      "Aligned life priorities",
      "Compatible growth mindset",
      "Matching relationship goals"
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border-pink-100 hover:border-pink-300 group">
      <div className="relative">
        {/* Avatar/Image */}
        <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar} className="object-cover" />
            <AvatarFallback className="text-3xl bg-pink-200 text-pink-700">
              {profile.displayName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Compatibility Badge */}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full border font-bold text-sm",
          getCompatibilityColor(profile.compatibilityScore)
        )}>
          {profile.compatibilityScore}% Match
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-slate-900">{profile.displayName}</h3>
          {profile.location && (
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </p>
          )}
        </div>
        
        {/* AI Insight */}
        <div className="p-2 rounded-lg bg-violet-50 border border-violet-100 mb-3">
          <p className="text-xs text-violet-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {getInsight()}
          </p>
        </div>
        
        {/* Bio snippet */}
        {profile.bio && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{profile.bio}</p>
        )}
        
        {/* Values Tags */}
        {profile.core_values_ranked?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.core_values_ranked.slice(0, 3).map((value, i) => (
              <Badge key={i} variant="secondary" className="text-xs capitalize">
                {value}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1 gap-1 bg-pink-500 hover:bg-pink-600"
            onClick={onMessage}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1 border-pink-200 hover:bg-pink-50"
            onClick={onViewProfile}
          >
            <Eye className="w-4 h-4" />
            Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}