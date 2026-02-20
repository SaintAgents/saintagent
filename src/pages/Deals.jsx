import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, Search, DollarSign, TrendingUp, Target, Users, 
  Filter, BarChart3, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import DealFormModal from '@/components/deals/DealFormModal';
import DealDetailModal from '@/components/deals/DealDetailModal';

const STAGE_CONFIG = {
  prospecting: { label: 'Prospecting', color: 'bg-slate-500', order: 1 },
  qualification: { label: 'Qualification', color: 'bg-blue-500', order: 2 },
  proposal: { label: 'Proposal', color: 'bg-violet-500', order: 3 },
  negotiation: { label: 'Negotiation', color: 'bg-amber-500', order: 4 },
  closed_won: { label: 'Closed Won', color: 'bg-emerald-500', order: 5 },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-500', order: 6 }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' }
};

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = myProfile?.[0];

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 200)
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
        deal.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.contact_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
      const matchesOwner = ownerFilter === 'all' || deal.owner_id === ownerFilter;
      return matchesSearch && matchesStage && matchesOwner;
    });
  }, [deals, searchQuery, stageFilter, ownerFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'closed_won');
    const lostDeals = deals.filter(d => d.stage === 'closed_lost');
    
    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgDealSize = activeDeals.length > 0 ? totalPipelineValue / activeDeals.length : 0;
    const winRate = (wonDeals.length + lostDeals.length) > 0 
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 
      : 0;

    return {
      totalPipelineValue,
      totalWonValue,
      activeDealsCount: activeDeals.length,
      avgDealSize,
      winRate
    };
  }, [deals]);

  // Stage distribution for mini chart
  const stageDistribution = useMemo(() => {
    const distribution = {};
    Object.keys(STAGE_CONFIG).forEach(stage => {
      distribution[stage] = {
        count: deals.filter(d => d.stage === stage).length,
        value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + (d.amount || 0), 0)
      };
    });
    return distribution;
  }, [deals]);

  // Get unique owners for filter
  const owners = useMemo(() => {
    const ownerMap = new Map();
    deals.forEach(d => {
      if (d.owner_id && d.owner_name) {
        ownerMap.set(d.owner_id, { id: d.owner_id, name: d.owner_name, avatar: d.owner_avatar });
      }
    });
    return Array.from(ownerMap.values());
  }, [deals]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <BackButton className="text-white hover:bg-white/20" />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Deal Tracking
            </h1>
            <p className="text-lg text-white/80">Manage your sales pipeline</p>
          </div>
          <ForwardButton currentPage="Deals" className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pipeline Value</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalPipelineValue)}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Deals</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.activeDealsCount}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.avgDealSize)}</p>
                </div>
                <div className="p-3 bg-violet-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Win Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.winRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage Distribution Mini Pipeline */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Pipeline Stages</span>
            </div>
            <div className="flex gap-2">
              {Object.entries(STAGE_CONFIG).filter(([k]) => !['closed_won', 'closed_lost'].includes(k)).map(([stage, config]) => (
                <div key={stage} className="flex-1 text-center">
                  <div className="text-xs text-slate-500 mb-1">{config.label}</div>
                  <div className={`h-2 rounded-full ${config.color} opacity-80`} style={{ 
                    opacity: stageDistribution[stage]?.count > 0 ? 0.3 + (stageDistribution[stage].count / Math.max(...Object.values(stageDistribution).map(s => s.count || 1))) * 0.7 : 0.2
                  }} />
                  <div className="text-sm font-semibold mt-1">{stageDistribution[stage]?.count || 0}</div>
                  <div className="text-xs text-slate-400">{formatCurrency(stageDistribution[stage]?.value || 0)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map(owner => (
                <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            New Deal
          </Button>
        </div>

        {/* Deals List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No deals found</h3>
                <p className="text-slate-500 mb-4">Create your first deal to get started</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Deal
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <div className="col-span-4">Deal</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Stage</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-2">Close Date</div>
                </div>
                
                {/* Rows */}
                {filteredDeals.map(deal => (
                  <div 
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${STAGE_CONFIG[deal.stage]?.color || 'bg-slate-300'}`} />
                        <div>
                          <p className="font-medium text-slate-900">{deal.title}</p>
                          <p className="text-sm text-slate-500">{deal.company_name || 'No company'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="font-semibold text-slate-900">{formatCurrency(deal.amount)}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <Badge className={`${STAGE_CONFIG[deal.stage]?.color || 'bg-slate-500'} text-white`}>
                        {STAGE_CONFIG[deal.stage]?.label || deal.stage}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={deal.owner_avatar} />
                        <AvatarFallback className="text-xs">{deal.owner_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-600 truncate">{deal.owner_name}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-slate-500">
                        {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d, yyyy') : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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