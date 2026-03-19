import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, ChevronDown, ChevronUp, Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurturing'];
const DOMAINS = ['finance', 'tech', 'governance', 'health', 'education', 'media', 'legal', 'spiritual', 'creative', 'nonprofit', 'other'];
const LEAD_SOURCES = ['referral', 'website', 'social_media', 'event', 'cold_outreach', 'inbound', 'partner', 'advertisement', 'content', 'other'];
const PRIORITY_TIERS = ['low', 'medium', 'high', 'critical'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'quality_desc', label: 'Quality Score (High)' },
  { value: 'strength_desc', label: 'Relationship (Strong)' },
  { value: 'last_contact', label: 'Last Contacted' },
  { value: 'stale', label: 'Most Stale' },
];

export default function CRMFilterPanel({ filters, onChange, contactCount, totalCount }) {
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount = [
    filters.search,
    filters.domain !== 'all' && filters.domain,
    filters.leadStatus !== 'all' && filters.leadStatus,
    filters.leadSource !== 'all' && filters.leadSource,
    filters.priority !== 'all' && filters.priority,
    filters.strengthMin > 0,
    filters.federated !== 'all' && filters.federated,
    filters.tag,
  ].filter(Boolean).length;

  const clearAll = () => {
    onChange({
      search: '',
      domain: 'all',
      leadStatus: 'all',
      leadSource: 'all',
      priority: 'all',
      strengthMin: 0,
      federated: 'all',
      tag: '',
      sortBy: 'newest',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Compact bar - always visible */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, email, notes, tags..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        <Select value={filters.domain} onValueChange={(v) => onChange({ ...filters, domain: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {DOMAINS.map(d => (
              <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.leadStatus} onValueChange={(v) => onChange({ ...filters, leadStatus: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(v) => onChange({ ...filters, sortBy: v })}>
          <SelectTrigger className="w-44">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", expanded && "bg-violet-50 border-violet-200")}
          onClick={() => setExpanded(!expanded)}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 bg-violet-600 text-white h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-500 gap-1">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="px-3 pb-2 text-xs text-slate-500">
        Showing {contactCount} of {totalCount} contacts
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="border-t px-3 py-3 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Lead Source</label>
            <Select value={filters.leadSource} onValueChange={(v) => onChange({ ...filters, leadSource: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {LEAD_SOURCES.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
            <Select value={filters.priority} onValueChange={(v) => onChange({ ...filters, priority: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_TIERS.map(p => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Min Relationship</label>
            <Select 
              value={String(filters.strengthMin)} 
              onValueChange={(v) => onChange({ ...filters, strengthMin: Number(v) })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="1">★ and up</SelectItem>
                <SelectItem value="2">★★ and up</SelectItem>
                <SelectItem value="3">★★★ and up</SelectItem>
                <SelectItem value="4">★★★★ and up</SelectItem>
                <SelectItem value="5">★★★★★ only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Federated</label>
            <Select value={filters.federated} onValueChange={(v) => onChange({ ...filters, federated: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Federated Only</SelectItem>
                <SelectItem value="no">Private Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 md:col-span-4">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Filter by Tag</label>
            <Input
              placeholder="Enter a tag to filter..."
              className="h-8 text-xs"
              value={filters.tag}
              onChange={(e) => onChange({ ...filters, tag: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}