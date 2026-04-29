import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Target, ShoppingBag, Sparkles, ArrowRight, 
  Loader2, Star, MapPin, Clock, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function scoreItem(item, profile) {
  let score = 0;
  const userSkills = (profile?.interest_tags || []).map(s => s.toLowerCase());
  const userIntentions = (profile?.intentions || []).map(s => s.toLowerCase());

  const itemTags = [
    ...(item.tags || []),
    ...(item.values || []),
    ...(item.interests || []),
    ...(item.skills || []),
    ...(item.skills_required || []),
    ...(item.roles_needed || []),
  ].map(s => (s || '').toLowerCase());

  const itemText = [item.title, item.name, item.description, item.objective, item.purpose, item.category]
    .filter(Boolean).join(' ').toLowerCase();

  // Skill/tag overlap
  for (const skill of userSkills) {
    if (itemTags.some(t => t.includes(skill) || skill.includes(t))) score += 15;
    if (itemText.includes(skill)) score += 5;
  }

  // Intention overlap
  for (const intent of userIntentions) {
    const words = intent.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && itemText.includes(word)) score += 8;
    }
  }

  // Recency boost
  if (item.created_date) {
    const daysOld = (Date.now() - new Date(item.created_date).getTime()) / 86400000;
    if (daysOld < 7) score += 10;
    else if (daysOld < 30) score += 5;
  }

  // Popularity boost
  if (item.member_count > 5) score += 5;
  if (item.participant_count > 3) score += 5;
  if (item.bookings_count > 2) score += 5;

  // Featured boost
  if (item.is_featured) score += 10;

  return Math.min(score, 100);
}

function RecommendationCard({ item, type, score, profile }) {
  const typeConfig = {
    circle: { icon: Users, color: 'bg-blue-600', label: 'Circle', url: createPageUrl('Circles') + '?id=' + item.id },
    mission: { icon: Target, color: 'bg-violet-600', label: 'Mission', url: createPageUrl('MissionDetail') + '?id=' + item.id },
    listing: { icon: ShoppingBag, color: 'bg-emerald-600', label: 'Listing', url: createPageUrl('ListingDetail') + '?id=' + item.id },
  };
  const config = typeConfig[type];
  const Icon = config.icon;

  const matchReasons = useMemo(() => {
    const reasons = [];
    const userSkills = (profile?.interest_tags || []).map(s => s.toLowerCase());
    const itemTags = [
      ...(item.tags || []), ...(item.values || []), ...(item.interests || []),
      ...(item.skills || []), ...(item.skills_required || []), ...(item.roles_needed || []),
    ].map(s => (s || '').toLowerCase());
    
    for (const skill of userSkills) {
      if (itemTags.some(t => t.includes(skill) || skill.includes(t))) {
        reasons.push(skill);
      }
    }
    return reasons.slice(0, 3);
  }, [item, profile]);

  return (
    <Link to={config.url}>
      <Card className="hover:shadow-lg hover:border-violet-300 transition-all cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`${config.color} text-white p-2.5 rounded-lg shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] shrink-0">{config.label}</Badge>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {score}% match
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-semibold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1 text-sm">
                {item.name || item.title}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                {item.description || item.objective || item.purpose || 'No description'}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                {type === 'circle' && item.member_count > 0 && (
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.member_count} members</span>
                )}
                {type === 'mission' && item.participant_count > 0 && (
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.participant_count} joined</span>
                )}
                {type === 'mission' && item.reward_ggg > 0 && (
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {item.reward_ggg} GGG</span>
                )}
                {type === 'listing' && (
                  <span className="flex items-center gap-1">
                    {item.is_free ? 'Free' : item.price_ggg > 0 ? `${item.price_ggg} GGG` : item.price_amount > 0 ? `$${item.price_amount}` : 'Free'}
                  </span>
                )}
                {item.category && (
                  <span className="capitalize">{item.category.replace(/_/g, ' ')}</span>
                )}
              </div>

              {/* Match reasons */}
              {matchReasons.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400">Matched on:</span>
                  {matchReasons.map(r => (
                    <Badge key={r} variant="secondary" className="text-[10px] capitalize py-0 px-1.5">{r.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function RecommendationsTab({ profile }) {
  const [filter, setFilter] = useState('all');

  const { data: circles = [], isLoading: circlesLoading } = useQuery({
    queryKey: ['recCircles'],
    queryFn: () => base44.entities.Circle.filter({ visibility: 'public' }, '-member_count', 30),
    staleTime: 600000,
  });

  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['recMissions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 30),
    staleTime: 600000,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['recListings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 30),
    staleTime: 600000,
  });

  const isLoading = circlesLoading || missionsLoading || listingsLoading;

  // Filter out already-joined circles/missions
  const userEmail = profile?.user_id;
  const filteredCircles = circles.filter(c => !c.member_ids?.includes(userEmail));
  const filteredMissions = missions.filter(m => !m.participant_ids?.includes(userEmail) && m.creator_id !== userEmail);

  const scored = useMemo(() => {
    if (!profile) return [];
    const items = [
      ...filteredCircles.map(c => ({ item: c, type: 'circle', score: scoreItem(c, profile) })),
      ...filteredMissions.map(m => ({ item: m, type: 'mission', score: scoreItem(m, profile) })),
      ...listings.map(l => ({ item: l, type: 'listing', score: scoreItem(l, profile) })),
    ];
    return items.sort((a, b) => b.score - a.score);
  }, [filteredCircles, filteredMissions, listings, profile]);

  const displayed = filter === 'all' ? scored : scored.filter(s => s.type === filter);
  const top = displayed.slice(0, 12);

  const counts = {
    all: scored.length,
    circle: scored.filter(s => s.type === 'circle').length,
    mission: scored.filter(s => s.type === 'mission').length,
    listing: scored.filter(s => s.type === 'listing').length,
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">For You</h2>
            <p className="text-xs text-slate-500">Based on your skills, intentions & activity</p>
          </div>
        </div>
      </div>

      {/* Sub-filter */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="all" className="gap-1.5 text-xs">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="circle" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Circles ({counts.circle})</TabsTrigger>
          <TabsTrigger value="mission" className="gap-1.5 text-xs"><Target className="w-3.5 h-3.5" /> Missions ({counts.mission})</TabsTrigger>
          <TabsTrigger value="listing" className="gap-1.5 text-xs"><ShoppingBag className="w-3.5 h-3.5" /> Listings ({counts.listing})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : top.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No recommendations yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Complete your profile with skills and intentions to get personalized suggestions.
          </p>
          <Link to={createPageUrl('Profile')}>
            <Button variant="outline" className="mt-4 gap-2">
              <Users className="w-4 h-4" /> Complete Profile
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {top.map((rec, i) => (
            <RecommendationCard key={`${rec.type}-${rec.item.id}`} item={rec.item} type={rec.type} score={rec.score} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}