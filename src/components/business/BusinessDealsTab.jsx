import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, DollarSign, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';

const STAGE_STYLES = {
  prospecting: { label: 'Prospecting', color: 'bg-slate-100 text-slate-700' },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  proposal: { label: 'Proposal', color: 'bg-violet-100 text-violet-700' },
  negotiation: { label: 'Negotiation', color: 'bg-amber-100 text-amber-700' },
  closed_won: { label: 'Closed Won', color: 'bg-emerald-100 text-emerald-700' },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-100 text-red-700' },
};

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-red-100 text-red-600',
};

function DealCard({ deal }) {
  const stage = STAGE_STYLES[deal.stage] || STAGE_STYLES.prospecting;

  return (
    <div className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => window.location.href = createPageUrl('Deals') + `?id=${deal.id}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 truncate">{deal.title}</h4>
          {deal.company_name && <p className="text-sm text-slate-500">{deal.company_name}</p>}
        </div>
        <Badge className={stage.color}>{stage.label}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="flex items-center gap-1 font-semibold text-emerald-700">
          <DollarSign className="w-4 h-4" />
          {(deal.amount || 0).toLocaleString()}
        </span>
        {deal.probability > 0 && (
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {deal.probability}% likely
          </span>
        )}
        {deal.expected_close_date && (
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {deal.expected_close_date}
          </span>
        )}
        {deal.priority && (
          <Badge className={PRIORITY_STYLES[deal.priority] || PRIORITY_STYLES.medium} variant="outline">
            {deal.priority}
          </Badge>
        )}
      </div>

      {deal.description && (
        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{deal.description}</p>
      )}
    </div>
  );
}

export default function BusinessDealsTab({ entity }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['bizDeals', entity.owner_id],
    queryFn: () => base44.entities.Deal.filter({ owner_id: entity.owner_id }, '-created_date', 50),
    enabled: !!entity.owner_id,
    staleTime: 300000
  });

  const filtered = deals.filter(d => {
    const stageOk = stageFilter === 'all' || d.stage === stageFilter;
    const q = search.toLowerCase();
    const textOk = !q || (d.title || '').toLowerCase().includes(q) || (d.company_name || '').toLowerCase().includes(q);
    return stageOk && textOk;
  });

  const totalValue = deals.reduce((s, d) => s + (d.amount || 0), 0);
  const wonCount = deals.filter(d => d.stage === 'closed_won').length;
  const activeCount = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + (d.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border text-center">
          <p className="text-2xl font-bold text-slate-900">{deals.length}</p>
          <p className="text-xs text-slate-500">Total Deals</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border text-center">
          <p className="text-2xl font-bold text-emerald-700">{wonCount}</p>
          <p className="text-xs text-emerald-600">Closed Won</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border text-center">
          <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
          <p className="text-xs text-blue-600">Active Pipeline</p>
        </div>
        <div className="p-4 rounded-2xl bg-violet-50 border text-center">
          <p className="text-2xl font-bold text-violet-700">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-violet-600">Pipeline Value</p>
        </div>
      </div>

      {/* Won summary */}
      {wonValue > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Closed Won Revenue</p>
              <p className="text-2xl font-bold text-emerald-700">${wonValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="prospecting">Prospecting</SelectItem>
            <SelectItem value="qualification">Qualification</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deal list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No deals found</p>
          <p className="text-xs text-slate-400 mt-1">Deals associated with this entity will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(d => <DealCard key={d.id} deal={d} />)}
        </div>
      )}

      {deals.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.location.href = createPageUrl('Deals')}>
            View All in Deals Hub <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}