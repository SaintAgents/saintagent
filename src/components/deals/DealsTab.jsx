import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, Search, DollarSign, TrendingUp, Target, 
  BarChart3, Calendar, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import DealFormModal from './DealFormModal';
import DealDetailModal from './DealDetailModal';

const STAGE_CONFIG = {
  prospecting: { label: 'Prospecting', color: 'bg-slate-500' },
  qualification: { label: 'Qualification', color: 'bg-blue-500' },
  proposal: { label: 'Proposal', color: 'bg-violet-500' },
  negotiation: { label: 'Negotiation', color: 'bg-amber-500' },
  closed_won: { label: 'Closed Won', color: 'bg-emerald-500' },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-500' }
};

export default function DealsTab({ currentUser, profile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const queryClient = useQueryClient();

  // Fetch user's deals
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['myDeals', currentUser?.email],
    queryFn: () => base44.entities.Deal.filter({ owner_id: currentUser.email }, '-created_date', 100),
    enabled: !!currentUser?.email
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = !searchQuery || 
        deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [deals, searchQuery, stageFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'closed_won');
    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    return { totalPipelineValue, totalWonValue, activeDealsCount: activeDeals.length, wonDealsCount: wonDeals.length };
  }, [deals]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Deals</h2>
          <p className="text-slate-500">Track your sales pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = createPageUrl('Deals')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Full View
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pipeline</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(metrics.totalPipelineValue)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Won</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(metrics.totalWonValue)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Active</p>
                <p className="text-lg font-bold text-slate-900">{metrics.activeDealsCount}</p>
              </div>
              <Target className="w-5 h-5 text-violet-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Closed Won</p>
                <p className="text-lg font-bold text-slate-900">{metrics.wonDealsCount}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {Object.entries(STAGE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : filteredDeals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No deals found</h3>
            <p className="text-slate-500 mb-4">Create your first deal to start tracking</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Plus className="w-4 h-4" />
              Create Deal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDeals.map(deal => (
            <Card 
              key={deal.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedDeal(deal)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-12 rounded-full ${STAGE_CONFIG[deal.stage]?.color || 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{deal.title}</p>
                    <p className="text-sm text-slate-500">{deal.company_name || 'No company'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(deal.amount)}</p>
                    <Badge className={`${STAGE_CONFIG[deal.stage]?.color || 'bg-slate-500'} text-white text-xs`}>
                      {STAGE_CONFIG[deal.stage]?.label || deal.stage}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <DealFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
        profile={profile}
        allProfiles={allProfiles}
      />

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          currentUser={currentUser}
          profile={profile}
          allProfiles={allProfiles}
        />
      )}
    </div>
  );
}