import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Search, DollarSign, TrendingUp, Target,
  BarChart3, ExternalLink, Clock, CheckCircle2,
  AlertTriangle, Building2, ListTodo, FileText,
  MessageSquare, GripVertical, ChevronRight,
  UserPlus, MessageSquarePlus, Mail, Filter, Calendar
} from 'lucide-react';
import { format, isBefore } from 'date-fns';
import { createPageUrl } from '@/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DealFormModal from './DealFormModal';
import DealDetailModal from './DealDetailModal';
import AddTeamMemberModal from './AddTeamMemberModal';
import AddNoteModal from './AddNoteModal';
import { handleDealStageTransition, STAGE_LABELS } from './DealStageTransitionHandler';
import StageTransitionToast from './StageTransitionToast';
import { toast } from 'sonner';

const PIPELINE_STAGES = {
  prospecting: { label: 'Due Diligence', icon: Search, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
  qualification: { label: 'Negotiation', icon: MessageSquare, color: 'bg-amber-500', textColor: 'text-amber-400' },
  proposal: { label: 'Agreement Drafting', icon: FileText, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  negotiation: { label: 'Awaiting Execution', icon: Clock, color: 'bg-violet-500', textColor: 'text-violet-400' },
  closed_won: { label: 'Complete → Funding Review', icon: CheckCircle2, color: 'bg-green-500', textColor: 'text-green-400' },
  closed_lost: { label: 'Lost', icon: Target, color: 'bg-red-500', textColor: 'text-red-400' }
};

const CATEGORY_COLORS = {
  vault: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  oil: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bond: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  banking: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  sovereign: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  redemption: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  minerals: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  diamonds: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'ai tech': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  telecom: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  water: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  housing: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  medtech: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  space: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

export default function DealsTab({ currentUser, profile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [teamMemberModal, setTeamMemberModal] = useState({ open: false, dealId: null, teamIds: [] });
  const [noteModal, setNoteModal] = useState({ open: false, dealId: null });
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['myDeals', currentUser?.email],
    queryFn: () => base44.entities.Deal.filter({ owner_id: currentUser.email }, '-created_date', 100),
    enabled: !!currentUser?.email,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100),
    staleTime: 1800000,
    refetchOnWindowFocus: false,
  });

  const canMoveDeal = currentUser?.role === 'admin' || profile?.user_role === 'auditor';

  // Metrics
  const metrics = useMemo(() => {
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const closedWon = deals.filter(d => d.stage === 'closed_won');
    const highPriority = deals.filter(d => d.priority === 'high' && !['closed_won', 'closed_lost'].includes(d.stage));
    const closingSoon = deals.filter(d => {
      if (['closed_won', 'closed_lost'].includes(d.stage)) return false;
      return d.stage === 'negotiation' || d.stage === 'proposal';
    });
    const overdueTasks = deals.filter(d => {
      if (!d.expected_close_date || ['closed_won', 'closed_lost'].includes(d.stage)) return false;
      return isBefore(new Date(d.expected_close_date), new Date());
    });
    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    return { activeDeals, closedWon, highPriority, closingSoon, overdueTasks, totalPipelineValue, openTasks: activeDeals.length * 2 };
  }, [deals]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const cats = {};
    deals.forEach(deal => {
      (deal.tags || []).forEach(tag => {
        const lowerTag = tag.toLowerCase();
        cats[lowerTag] = (cats[lowerTag] || 0) + 1;
      });
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [deals]);

  // Stage distribution
  const stageDistribution = useMemo(() => {
    const dist = {};
    Object.keys(PIPELINE_STAGES).forEach(stage => {
      dist[stage] = deals.filter(d => d.stage === stage).length;
    });
    return dist;
  }, [deals]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    let result = deals;
    if (activeFilter) {
      switch (activeFilter.type) {
        case 'active': result = metrics.activeDeals; break;
        case 'highPriority': result = metrics.highPriority; break;
        case 'closingSoon': result = metrics.closingSoon; break;
        case 'overdue': result = metrics.overdueTasks; break;
        case 'closedWon': result = metrics.closedWon; break;
        case 'stage': result = deals.filter(d => d.stage === activeFilter.value); break;
        case 'category': result = deals.filter(d => (d.tags || []).some(t => t.toLowerCase() === activeFilter.value)); break;
      }
    }
    if (searchQuery) {
      result = result.filter(deal =>
        deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return result;
  }, [deals, activeFilter, searchQuery, metrics]);

  // Group by stage
  const dealsByStage = useMemo(() => {
    const grouped = {};
    Object.keys(PIPELINE_STAGES).forEach(stage => {
      grouped[stage] = filteredDeals.filter(d => d.stage === stage);
    });
    return grouped;
  }, [filteredDeals]);

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const clearFilter = () => setActiveFilter(null);

  // Drag and drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!canMoveDeal) return;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const oldStage = source.droppableId;
    const newStage = destination.droppableId;
    const dealId = draggableId;
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    queryClient.setQueryData(['myDeals', currentUser?.email], (old) =>
      (old || []).map(d => d.id === dealId ? { ...d, stage: newStage } : d)
    );

    try {
      await base44.entities.Deal.update(dealId, { stage: newStage });
      await handleDealStageTransition({ deal: { ...deal, id: dealId }, oldStage, newStage, currentUser, profile });
      const oldLabel = STAGE_LABELS[oldStage] || oldStage;
      const newLabel = STAGE_LABELS[newStage] || newStage;
      toast.custom(() => (
        <StageTransitionToast dealTitle={deal.title} oldStageLabel={oldLabel} newStageLabel={newLabel} tasksCreated={2} />
      ), { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ['myDeals'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    } catch (error) {
      console.error('Failed to update deal stage:', error);
      queryClient.invalidateQueries({ queryKey: ['myDeals'] });
    }
  };

  const StatCard = ({ icon: Icon, label, value, subLabel, color, onClick, isActive }) => (
    <Card className={`cursor-pointer transition-all hover:scale-105 ${isActive ? 'ring-2 ring-cyan-500' : ''}`} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold text-slate-900">{value}</p>
          <p className="text-[10px] text-slate-500 uppercase">{label}</p>
          {subLabel && <p className="text-[10px] text-red-500 mt-0.5">{subLabel}</p>}
        </div>
      </CardContent>
    </Card>
  );

  const DealCard = ({ deal, index }) => {
    const primaryTag = deal.tags?.[0]?.toLowerCase();
    const tagColor = CATEGORY_COLORS[primaryTag] || CATEGORY_COLORS.default;
    const isPendingApproval = deal.approval_status === 'pending';

    return (
      <Draggable draggableId={deal.id} index={index} isDragDisabled={!canMoveDeal}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`cursor-pointer hover:border-cyan-500/50 transition-all group relative overflow-hidden ${snapshot.isDragging ? 'shadow-xl ring-2 ring-cyan-500 rotate-2' : ''}`}
            onClick={() => setSelectedDeal(deal)}
          >
            {isPendingApproval && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 whitespace-nowrap">
                  <span className="px-8 py-1 bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">Pending Approval</span>
                </div>
              </div>
            )}
            <CardContent className={`p-3 ${isPendingApproval ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {primaryTag && (
                    <Badge className={`${tagColor} border text-[10px] uppercase mb-2`}>{primaryTag}</Badge>
                  )}
                </div>
                <div
                  {...provided.dragHandleProps}
                  className="p-1 -mr-1 -mt-1 rounded hover:bg-slate-100 cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1">
                {deal.priority === 'high' && (
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-red-500" />)}
                  </div>
                )}
                {deal.priority === 'medium' && (
                  <div className="flex gap-0.5">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-amber-500" />)}
                  </div>
                )}
              </div>
              <h4 className="font-medium text-slate-900 text-sm leading-tight mb-1 group-hover:text-cyan-600 transition-colors">{deal.title}</h4>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(deal.amount)}</p>
              <p className="text-xs text-slate-500">{deal.company_name?.split(' ')[0] || 'Unknown'}</p>
              {deal.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-1">→ {deal.description}</p>
              )}
              {/* Action Icons */}
              <div className="flex items-center gap-1 mt-2 mb-2">
                <button onClick={(e) => { e.stopPropagation(); setTeamMemberModal({ open: true, dealId: deal.id, teamIds: deal.team_member_ids || [] }); }} className="p-1.5 rounded-md hover:bg-cyan-100 text-slate-400 hover:text-cyan-600 transition-colors" title="Add team member">
                  <UserPlus className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setNoteModal({ open: true, dealId: deal.id }); }} className="p-1.5 rounded-md hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors" title="Add note">
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={deal.owner_avatar} />
                    <AvatarFallback className="text-[8px] bg-slate-200">{deal.owner_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-slate-500">{deal.owner_name?.split(' ')[0]}</span>
                </div>
                {deal.expected_close_date && (
                  <span className="text-[10px] text-slate-500">{format(new Date(deal.expected_close_date), 'MMM d')}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
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
          <Button variant="outline" size="sm" onClick={() => window.location.href = createPageUrl('Deals')} className="gap-2">
            <ExternalLink className="w-4 h-4" /> Full View
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
            <Plus className="w-4 h-4" /> New Deal
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={Building2} label="Active Deals" value={metrics.activeDeals.length} subLabel="in pipeline" color="bg-blue-600" onClick={() => setActiveFilter({ type: 'active', label: 'Active Deals' })} isActive={activeFilter?.type === 'active'} />
        <StatCard icon={TrendingUp} label="Pipeline Value" value={formatCurrency(metrics.totalPipelineValue)} subLabel="total estimated" color="bg-cyan-600" onClick={clearFilter} />
        <StatCard icon={AlertTriangle} label="High Priority" value={metrics.highPriority.length} subLabel="urgency 4-5" color="bg-red-600" onClick={() => setActiveFilter({ type: 'highPriority', label: 'High Priority' })} isActive={activeFilter?.type === 'highPriority'} />
        <StatCard icon={Clock} label="Closing Soon" value={metrics.closingSoon.length} subLabel="drafting / exec" color="bg-slate-600" onClick={() => setActiveFilter({ type: 'closingSoon', label: 'Closing Soon' })} isActive={activeFilter?.type === 'closingSoon'} />
        <StatCard icon={AlertTriangle} label="Overdue" value={metrics.overdueTasks.length} subLabel={`${metrics.overdueTasks.length} overdue`} color="bg-amber-600" onClick={() => setActiveFilter({ type: 'overdue', label: 'Overdue' })} isActive={activeFilter?.type === 'overdue'} />
        <StatCard icon={ListTodo} label="Open Tasks" value={metrics.openTasks} subLabel="across deals" color="bg-violet-600" onClick={clearFilter} />
        <StatCard icon={CheckCircle2} label="Deals Done" value={metrics.closedWon.length} subLabel="closed & funded" color="bg-emerald-600" onClick={() => setActiveFilter({ type: 'closedWon', label: 'Closed Won' })} isActive={activeFilter?.type === 'closedWon'} />
      </div>

      {/* Category and Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-sm font-medium text-slate-900">DEALS BY CATEGORY</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryDistribution.map(([cat, count]) => (
                <Badge
                  key={cat}
                  className={`${CATEGORY_COLORS[cat] || CATEGORY_COLORS.default} border cursor-pointer hover:opacity-80 ${activeFilter?.type === 'category' && activeFilter?.value === cat ? 'ring-2 ring-cyan-500' : ''}`}
                  onClick={() => setActiveFilter({ type: 'category', value: cat, label: cat.toUpperCase() })}
                >
                  {cat.toUpperCase()}: {count}
                </Badge>
              ))}
              {categoryDistribution.length === 0 && <p className="text-xs text-slate-400">No categories yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-slate-900">STAGE DISTRIBUTION</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PIPELINE_STAGES).map(([stage, config]) => (
                <Badge
                  key={stage}
                  className={`${config.color}/20 ${config.textColor} border border-current/30 cursor-pointer hover:opacity-80 ${activeFilter?.type === 'stage' && activeFilter?.value === stage ? 'ring-2 ring-cyan-500' : ''}`}
                  onClick={() => setActiveFilter({ type: 'stage', value: stage, label: config.label })}
                >
                  {config.label.toUpperCase().split(' ')[0]} {stageDistribution[stage]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Filter + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search deals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        {activeFilter && (
          <Badge className="bg-cyan-100 text-cyan-700 border border-cyan-300">
            {activeFilter.label}
            <button onClick={clearFilter} className="ml-1 hover:text-cyan-900">×</button>
          </Badge>
        )}
      </div>

      {/* Pipeline Label */}
      <div className="flex items-center gap-2 text-slate-600">
        <div className="w-2 h-2 rounded-full bg-slate-400" />
        <span className="text-sm font-medium uppercase">Pipeline</span>
        <span className="text-xs text-slate-500">({filteredDeals.length} deals)</span>
      </div>

      {/* Drag & Drop Pipeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(PIPELINE_STAGES).filter(([k]) => k !== 'closed_lost').map(([stage, config]) => {
              const StageIcon = config.icon;
              const stageDeals = dealsByStage[stage] || [];
              return (
                <div key={stage}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-4 rounded-full ${config.color}`} />
                    <StageIcon className={`w-4 h-4 ${config.textColor}`} />
                    <span className={`text-xs font-medium uppercase ${config.textColor}`}>{config.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 ml-auto" />
                  </div>
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-cyan-500/10 ring-2 ring-cyan-500/30 ring-dashed' : ''}`}
                      >
                        <ScrollArea className="h-[400px] pr-2">
                          <div className="space-y-3 p-1">
                            {stageDeals.length === 0 && !snapshot.isDraggingOver ? (
                              <Card className="border-dashed border-slate-300 bg-transparent">
                                <CardContent className="p-4 text-center">
                                  <p className="text-xs text-slate-400">Drop deals here</p>
                                </CardContent>
                              </Card>
                            ) : (
                              stageDeals.map((deal, index) => (
                                <DealCard key={deal.id} deal={deal} index={index} />
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Modals */}
      <DealFormModal open={showCreateModal} onClose={() => setShowCreateModal(false)} currentUser={currentUser} profile={profile} allProfiles={allProfiles} skipApproval={true} />
      {selectedDeal && <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} currentUser={currentUser} profile={profile} allProfiles={allProfiles} />}
      <AddTeamMemberModal open={teamMemberModal.open} onClose={() => setTeamMemberModal({ open: false, dealId: null, teamIds: [] })} entityType="deal" entityId={teamMemberModal.dealId} currentTeamIds={teamMemberModal.teamIds} />
      <AddNoteModal open={noteModal.open} onClose={() => setNoteModal({ open: false, dealId: null })} entityType="deal" entityId={noteModal.dealId} />
    </div>
  );
}