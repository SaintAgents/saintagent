import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, Crown, Clock } from 'lucide-react';

export default function LeaderboardFilters({ 
  searchQuery, 
  onSearchChange, 
  sortMetric, 
  onSortChange, 
  tierFilter, 
  onTierChange,
  activityFilter,
  onActivityChange
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search users by name or handle..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Sort Metric */}
      <Select value={sortMetric} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-44 h-10">
          <TrendingUp className="w-4 h-4 mr-2 text-slate-400" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rp_points">RP Points</SelectItem>
          <SelectItem value="ggg_balance">GGG Balance</SelectItem>
          <SelectItem value="trust_score">Trust Score</SelectItem>
          <SelectItem value="engagement_points">Engagement</SelectItem>
          <SelectItem value="follower_count">Followers</SelectItem>
          <SelectItem value="meetings_completed">Meetings</SelectItem>
        </SelectContent>
      </Select>

      {/* Tier Filter */}
      <Select value={tierFilter} onValueChange={onTierChange}>
        <SelectTrigger className="w-full sm:w-40 h-10">
          <Crown className="w-4 h-4 mr-2 text-slate-400" />
          <SelectValue placeholder="Tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="verified144k">Verified 144k</SelectItem>
          <SelectItem value="candidate">Candidate</SelectItem>
          <SelectItem value="none">Standard</SelectItem>
        </SelectContent>
      </Select>

      {/* Activity Filter */}
      <Select value={activityFilter} onValueChange={onActivityChange}>
        <SelectTrigger className="w-full sm:w-40 h-10">
          <Clock className="w-4 h-4 mr-2 text-slate-400" />
          <SelectValue placeholder="Activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="day">Active Today</SelectItem>
          <SelectItem value="week">Active This Week</SelectItem>
          <SelectItem value="month">Active This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}