import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, MapPin, Briefcase, Calendar as CalendarIcon, Users, Target, 
  TrendingUp, ChevronDown, ChevronUp, X, RotateCcw, Sparkles
} from "lucide-react";
import { format } from "date-fns";

// Skills data
const SKILL_CATEGORIES = {
  'Technology': ['Software Development', 'Web Design', 'Data Science', 'AI/ML', 'Cybersecurity', 'DevOps', 'Mobile Development'],
  'Creative': ['Graphic Design', 'Video Production', 'Photography', 'Writing', 'Music Production', 'Animation', 'UX/UI Design'],
  'Business': ['Marketing', 'Sales', 'Finance', 'Project Management', 'Strategy', 'Operations', 'HR'],
  'Wellness': ['Coaching', 'Meditation', 'Nutrition', 'Fitness', 'Therapy', 'Healing Arts', 'Yoga'],
  'Education': ['Teaching', 'Mentoring', 'Curriculum Design', 'Training', 'Research', 'Public Speaking'],
  'Spiritual': ['Energy Work', 'Astrology', 'Tarot', 'Sound Healing', 'Breathwork', 'Shamanism', 'Channeling'],
};

// Circle categories
const CIRCLE_CATEGORIES = ['spiritual', 'creative', 'business', 'wellness', 'learning', 'social', 'activism', 'other'];

// Listing categories  
const LISTING_CATEGORIES = ['mentorship', 'course', 'session', 'consulting', 'healing', 'mutual_aid', 'collaboration'];

// Mission types
const MISSION_TYPES = ['impact', 'creative', 'tech', 'community', 'wellness', 'education', 'environment', 'social'];

// Engagement levels
const ENGAGEMENT_LEVELS = [
  { value: 'any', label: 'Any Level' },
  { value: 'beginner', label: 'Beginner (0-10 activities)' },
  { value: 'active', label: 'Active (11-50 activities)' },
  { value: 'engaged', label: 'Highly Engaged (51-100)' },
  { value: 'power', label: 'Power User (100+)' },
];

// Regions
const REGIONS = [
  'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Middle East', 'Global'
];

export default function AdvancedSearchFilters({ 
  filters, 
  onFilterChange, 
  onReset, 
  activeTab,
  expandedSections,
  onToggleSection 
}) {
  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleSkill = (skill) => {
    const current = filters.skills || [];
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    updateFilter('skills', updated);
  };

  const toggleMissionType = (type) => {
    const current = filters.missionTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter('missionTypes', updated);
  };

  const hasActiveFilters = () => {
    return filters.location || 
           filters.region ||
           (filters.skills && filters.skills.length > 0) ||
           (filters.missionTypes && filters.missionTypes.length > 0) ||
           filters.engagementLevel ||
           filters.dateFrom ||
           filters.dateTo ||
           filters.minMembers ||
           filters.maxMembers ||
           filters.status ||
           filters.priceMin ||
           filters.priceMax ||
           filters.isFree;
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.region) count++;
    if (filters.skills?.length) count += filters.skills.length;
    if (filters.missionTypes?.length) count += filters.missionTypes.length;
    if (filters.engagementLevel && filters.engagementLevel !== 'any') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.status && filters.status !== 'any') count++;
    if (filters.isFree) count++;
    return count;
  };

  return (
    <div className="space-y-3">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount()} active
            </Badge>
          )}
        </div>
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-380px)] pr-2">
        <div className="space-y-3">
          {/* Location Filter */}
          <Collapsible 
            open={expandedSections?.includes('location')} 
            onOpenChange={() => onToggleSection?.('location')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Location</span>
              </div>
              {expandedSections?.includes('location') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Input
                placeholder="City or country..."
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="h-8 text-sm"
              />
              <Select value={filters.region || ''} onValueChange={(v) => updateFilter('region', v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Any Region</SelectItem>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Skills Filter (for People tab) */}
          {(activeTab === 'all' || activeTab === 'people') && (
            <>
              <Collapsible 
                open={expandedSections?.includes('skills')} 
                onOpenChange={() => onToggleSection?.('skills')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">Skills</span>
                    {filters.skills?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{filters.skills.length}</Badge>
                    )}
                  </div>
                  {expandedSections?.includes('skills') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3">
                  {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-slate-500 mb-1">{category}</p>
                      <div className="flex flex-wrap gap-1">
                        {skills.map(skill => (
                          <Badge
                            key={skill}
                            variant={filters.skills?.includes(skill) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Mission Type Filter */}
          {(activeTab === 'all' || activeTab === 'missions') && (
            <>
              <Collapsible 
                open={expandedSections?.includes('missionType')} 
                onOpenChange={() => onToggleSection?.('missionType')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Mission Type</span>
                    {filters.missionTypes?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{filters.missionTypes.length}</Badge>
                    )}
                  </div>
                  {expandedSections?.includes('missionType') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {MISSION_TYPES.map(type => (
                      <Badge
                        key={type}
                        variant={filters.missionTypes?.includes(type) ? "default" : "outline"}
                        className="cursor-pointer text-xs capitalize"
                        onClick={() => toggleMissionType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Engagement Level */}
          <Collapsible 
            open={expandedSections?.includes('engagement')} 
            onOpenChange={() => onToggleSection?.('engagement')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Engagement Level</span>
              </div>
              {expandedSections?.includes('engagement') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Select 
                value={filters.engagementLevel || 'any'} 
                onValueChange={(v) => updateFilter('engagementLevel', v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGAGEMENT_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Date Range */}
          <Collapsible 
            open={expandedSections?.includes('date')} 
            onOpenChange={() => onToggleSection?.('date')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium">Activity Date</span>
              </div>
              {expandedSections?.includes('date') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                        {filters.dateFrom ? format(new Date(filters.dateFrom), 'MMM d, yyyy') : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                        onSelect={(date) => updateFilter('dateFrom', date?.toISOString())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                        {filters.dateTo ? format(new Date(filters.dateTo), 'MMM d, yyyy') : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                        onSelect={(date) => updateFilter('dateTo', date?.toISOString())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Quick date presets */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Last 7 days', days: 7 },
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 90 days', days: 90 },
                ].map(preset => (
                  <Badge
                    key={preset.label}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      const to = new Date();
                      const from = new Date();
                      from.setDate(from.getDate() - preset.days);
                      updateFilter('dateFrom', from.toISOString());
                      updateFilter('dateTo', to.toISOString());
                    }}
                  >
                    {preset.label}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Status Filter */}
          <Collapsible 
            open={expandedSections?.includes('status')} 
            onOpenChange={() => onToggleSection?.('status')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">Status</span>
              </div>
              {expandedSections?.includes('status') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Select 
                value={filters.status || 'any'} 
                onValueChange={(v) => updateFilter('status', v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Circle Size (for Circles tab) */}
          {(activeTab === 'all' || activeTab === 'circles') && (
            <>
              <Collapsible 
                open={expandedSections?.includes('size')} 
                onOpenChange={() => onToggleSection?.('size')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Group Size</span>
                  </div>
                  {expandedSections?.includes('size') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3">
                  <div className="px-2">
                    <Slider
                      value={[filters.minMembers || 0, filters.maxMembers || 1000]}
                      max={1000}
                      step={10}
                      onValueChange={([min, max]) => {
                        updateFilter('minMembers', min);
                        updateFilter('maxMembers', max);
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{filters.minMembers || 0} members</span>
                      <span>{filters.maxMembers || 1000}+ members</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Pricing (for Offers tab) */}
          {(activeTab === 'all' || activeTab === 'offers') && (
            <>
              <Collapsible 
                open={expandedSections?.includes('pricing')} 
                onOpenChange={() => onToggleSection?.('pricing')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💰</span>
                    <span className="text-sm font-medium">Pricing</span>
                  </div>
                  {expandedSections?.includes('pricing') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={filters.isFree || false}
                      onCheckedChange={(v) => updateFilter('isFree', v)}
                    />
                    <Label className="text-sm">Free only</Label>
                  </div>
                  {!filters.isFree && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Min $</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.priceMin || ''}
                          onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max $</Label>
                        <Input
                          type="number"
                          placeholder="Any"
                          value={filters.priceMax || ''}
                          onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
              <Separator />

              {/* Listing Category */}
              <Collapsible 
                open={expandedSections?.includes('listingCategory')} 
                onOpenChange={() => onToggleSection?.('listingCategory')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏷️</span>
                    <span className="text-sm font-medium">Category</span>
                  </div>
                  {expandedSections?.includes('listingCategory') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {LISTING_CATEGORIES.map(cat => (
                      <Badge
                        key={cat}
                        variant={filters.listingCategory === cat ? "default" : "outline"}
                        className="cursor-pointer text-xs capitalize"
                        onClick={() => updateFilter('listingCategory', filters.listingCategory === cat ? '' : cat)}
                      >
                        {cat.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Circle Category (for Circles tab) */}
          {(activeTab === 'circles') && (
            <>
              <Separator />
              <Collapsible 
                open={expandedSections?.includes('circleCategory')} 
                onOpenChange={() => onToggleSection?.('circleCategory')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏷️</span>
                    <span className="text-sm font-medium">Category</span>
                  </div>
                  {expandedSections?.includes('circleCategory') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {CIRCLE_CATEGORIES.map(cat => (
                      <Badge
                        key={cat}
                        variant={filters.circleCategory === cat ? "default" : "outline"}
                        className="cursor-pointer text-xs capitalize"
                        onClick={() => updateFilter('circleCategory', filters.circleCategory === cat ? '' : cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Visibility filter (for Circles) */}
          {(activeTab === 'circles') && (
            <>
              <Separator />
              <Collapsible 
                open={expandedSections?.includes('visibility')} 
                onOpenChange={() => onToggleSection?.('visibility')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👁️</span>
                    <span className="text-sm font-medium">Visibility</span>
                  </div>
                  {expandedSections?.includes('visibility') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <Select 
                    value={filters.visibility || 'any'} 
                    onValueChange={(v) => updateFilter('visibility', v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="invite_only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Rank filter (for People) */}
          {(activeTab === 'people') && (
            <>
              <Separator />
              <Collapsible 
                open={expandedSections?.includes('rank')} 
                onOpenChange={() => onToggleSection?.('rank')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⭐</span>
                    <span className="text-sm font-medium">Rank</span>
                  </div>
                  {expandedSections?.includes('rank') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {['seeker', 'initiate', 'adept', 'practitioner', 'master', 'sage', 'oracle'].map(rank => (
                      <Badge
                        key={rank}
                        variant={filters.rank === rank ? "default" : "outline"}
                        className="cursor-pointer text-xs capitalize"
                        onClick={() => updateFilter('rank', filters.rank === rank ? '' : rank)}
                      >
                        {rank}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="pt-2 border-t">
          <p className="text-xs text-slate-500 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-1">
            {filters.location && (
              <Badge variant="secondary" className="text-xs gap-1">
                📍 {filters.location}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('location', '')} />
              </Badge>
            )}
            {filters.region && (
              <Badge variant="secondary" className="text-xs gap-1">
                🌍 {filters.region}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('region', '')} />
              </Badge>
            )}
            {filters.skills?.map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs gap-1">
                {skill}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSkill(skill)} />
              </Badge>
            ))}
            {filters.missionTypes?.map(type => (
              <Badge key={type} variant="secondary" className="text-xs gap-1 capitalize">
                {type}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleMissionType(type)} />
              </Badge>
            ))}
            {filters.engagementLevel && filters.engagementLevel !== 'any' && (
              <Badge variant="secondary" className="text-xs gap-1">
                📊 {filters.engagementLevel}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('engagementLevel', 'any')} />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="text-xs gap-1">
                📅 From {format(new Date(filters.dateFrom), 'MMM d')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('dateFrom', undefined)} />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="text-xs gap-1">
                📅 To {format(new Date(filters.dateTo), 'MMM d')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('dateTo', undefined)} />
              </Badge>
            )}
            {filters.isFree && (
              <Badge variant="secondary" className="text-xs gap-1">
                Free only
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('isFree', false)} />
              </Badge>
            )}
            {filters.listingCategory && (
              <Badge variant="secondary" className="text-xs gap-1 capitalize">
                {filters.listingCategory.replace('_', ' ')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('listingCategory', '')} />
              </Badge>
            )}
            {filters.circleCategory && (
              <Badge variant="secondary" className="text-xs gap-1 capitalize">
                {filters.circleCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('circleCategory', '')} />
              </Badge>
            )}
            {filters.visibility && filters.visibility !== 'any' && (
              <Badge variant="secondary" className="text-xs gap-1 capitalize">
                {filters.visibility.replace('_', ' ')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('visibility', 'any')} />
              </Badge>
            )}
            {filters.rank && (
              <Badge variant="secondary" className="text-xs gap-1 capitalize">
                {filters.rank}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('rank', '')} />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}