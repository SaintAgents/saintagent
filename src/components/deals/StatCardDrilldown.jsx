import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, AlertTriangle, Clock, CheckCircle2, Building2, 
  TrendingUp, ChevronRight, RotateCcw, ArrowUpDown, 
  Zap, X, Loader2, ListTodo
} from 'lucide-react';
import { format, isBefore, addDays, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const STAGE_LABELS = {
  prospecting: 'Due Diligence',
  qualification: 'Negotiation',
  proposal: 'Agreement Drafting',
  negotiation: 'Awaiting Execution',
  closed_won: 'Complete → Funding',
  closed_lost: 'Lost'
};

const STAGE_COLORS = {
  prospecting: 'bg-cyan-100 text-cyan-700',
  qualification: 'bg-amber-100 text-amber-700',
  proposal: 'bg-emerald-100 text-emerald-700',
  negotiation: 'bg-violet-100 text-violet-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700'
};

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
};

export default function StatCardDrilldown({ open, onClose, filterType, deals, onSelectDeal }) {
  const [updating, setUpdating] = useState(null);
  const queryClient = useQueryClient();

  const config = {
    active: { title: 'Active Deals', icon: Building2, color: 'text-blue-600', description: 'All deals currently in the pipeline' },
    highPriority: { title: 'High Priority Deals', icon: AlertTriangle, color: 'text-red-600', description: 'Deals marked as high urgency' },
    closingSoon: { title: 'Closing Soon', icon: Clock, color: 'text-slate-600', description: 'Deals in Agreement Drafting or Awaiting Execution' },
    overdue: { title: 'Overdue Deals', icon: AlertTriangle, color: 'text-amber-600', description: 'Deals past their expected close date' },
    closedWon: { title: 'Closed & Won', icon: CheckCircle2, color: 'text-emerald-600', description: 'Successfully completed deals' }
  }[filterType] || { title: 'Deals', icon: Building2, color: 'text-slate-600', description: '' };

  const Icon = config.icon;

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount || 0}`;
  };

  const updateDeal = async (dealId, updates) => {
    setUpdating(dealId);
    try {
      await base44.entities.Deal.update(dealId, updates);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal updated');
    } catch (e) {
      toast.error('Failed to update');
    }
    setUpdating(null);
  };

  const getDaysOverdue = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-100 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">{config.title}</DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
            </div>
            <Badge className="ml-auto bg-slate-200 text-slate-700">{deals.length} deals</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-2 pr-2">
          <div className="space-y-2">
            {deals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No deals in this category</p>
              </div>
            ) : deals.map(deal => {
              const isOverdue = deal.expected_close_date && isBefore(new Date(deal.expected_close_date), new Date());
              const daysOver = getDaysOverdue(deal.expected_close_date);
              const isProcessing = updating === deal.id;

              return (
                <div 
                  key={deal.id} 
                  className="border rounded-lg p-3 hover:border-cyan-300 transition-colors bg-white"
                >
                  {/* Top row: title + amount */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { onClose(); onSelectDeal(deal); }}>
                      <h4 className="font-medium text-sm text-slate-900 hover:text-cyan-600 transition-colors truncate">
                        {deal.title}
                      </h4>
                      <p className="text-xs text-slate-500">{deal.company_name || 'No company'}</p>
                    </div>
                    <p className="font-bold text-slate-900 shrink-0 ml-3">{formatCurrency(deal.amount)}</p>
                  </div>

                  {/* Status badges row */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <Badge className={`text-[10px] ${STAGE_COLORS[deal.stage] || 'bg-slate-100 text-slate-600'}`}>
                      {STAGE_LABELS[deal.stage] || deal.stage}
                    </Badge>
                    <Badge className={`text-[10px] ${PRIORITY_COLORS[deal.priority] || 'bg-slate-100 text-slate-600'}`}>
                      {deal.priority || 'medium'}
                    </Badge>
                    {isOverdue && (
                      <Badge className="text-[10px] bg-red-100 text-red-700 border border-red-200">
                        {daysOver}d overdue
                      </Badge>
                    )}
                    {deal.expected_close_date && !isOverdue && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {deal.owner_name && (
                      <span className="text-[10px] text-slate-400 ml-auto">{deal.owner_name.split(' ')[0]}</span>
                    )}
                  </div>

                  {/* Contextual actions based on filter type */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                    {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}

                    {/* OVERDUE: Reset date options */}
                    {filterType === 'overdue' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                          disabled={isProcessing}
                          onClick={() => updateDeal(deal.id, { expected_close_date: format(addDays(new Date(), 7), 'yyyy-MM-dd') })}
                        >
                          <RotateCcw className="w-3 h-3" /> +7 days
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                          disabled={isProcessing}
                          onClick={() => updateDeal(deal.id, { expected_close_date: format(addDays(new Date(), 30), 'yyyy-MM-dd') })}
                        >
                          <RotateCcw className="w-3 h-3" /> +30 days
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                          disabled={isProcessing}
                          onClick={() => updateDeal(deal.id, { stage: 'closed_lost' })}
                        >
                          <X className="w-3 h-3" /> Mark Lost
                        </Button>
                      </>
                    )}

                    {/* HIGH PRIORITY: Lower priority or advance stage */}
                    {filterType === 'highPriority' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          disabled={isProcessing}
                          onClick={() => updateDeal(deal.id, { priority: 'medium' })}
                        >
                          <ArrowUpDown className="w-3 h-3" /> → Medium
                        </Button>
                        {deal.stage === 'prospecting' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { stage: 'qualification' })}
                          >
                            <ChevronRight className="w-3 h-3" /> Advance to Negotiation
                          </Button>
                        )}
                        {deal.stage === 'qualification' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { stage: 'proposal' })}
                          >
                            <ChevronRight className="w-3 h-3" /> Advance to Drafting
                          </Button>
                        )}
                      </>
                    )}

                    {/* CLOSING SOON: Advance to next stage or mark done */}
                    {filterType === 'closingSoon' && (
                      <>
                        {deal.stage === 'proposal' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-violet-200 text-violet-700 hover:bg-violet-50" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { stage: 'negotiation' })}
                          >
                            <ChevronRight className="w-3 h-3" /> → Awaiting Execution
                          </Button>
                        )}
                        {deal.stage === 'negotiation' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { stage: 'closed_won' })}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Close as Won
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50" disabled={isProcessing}
                          onClick={() => updateDeal(deal.id, { stage: 'closed_lost' })}
                        >
                          <X className="w-3 h-3" /> Mark Lost
                        </Button>
                      </>
                    )}

                    {/* ACTIVE: Quick stage advance */}
                    {filterType === 'active' && (
                      <>
                        {deal.stage !== 'closed_won' && deal.stage !== 'closed_lost' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={isProcessing}
                            onClick={() => {
                              const order = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];
                              const idx = order.indexOf(deal.stage);
                              if (idx >= 0 && idx < order.length - 1) {
                                updateDeal(deal.id, { stage: order[idx + 1] });
                              }
                            }}
                          >
                            <ChevronRight className="w-3 h-3" /> Advance Stage
                          </Button>
                        )}
                        {deal.priority !== 'high' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { priority: 'high' })}
                          >
                            <Zap className="w-3 h-3" /> Mark High Priority
                          </Button>
                        )}
                      </>
                    )}

                    {/* CLOSED WON: Funding actions */}
                    {filterType === 'closedWon' && (
                      <>
                        {deal.funding_status !== 'funded' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { funding_status: 'funded', funded_date: new Date().toISOString() })}
                          >
                            <TrendingUp className="w-3 h-3" /> Mark Funded
                          </Button>
                        )}
                        {!deal.commission_paid && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-violet-200 text-violet-700 hover:bg-violet-50" disabled={isProcessing}
                            onClick={() => updateDeal(deal.id, { commission_paid: true, commission_paid_date: new Date().toISOString() })}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Mark Commission Paid
                          </Button>
                        )}
                        <Badge className={deal.funding_status === 'funded' ? 'bg-green-100 text-green-700 text-[10px]' : 'bg-amber-100 text-amber-700 text-[10px]'}>
                          {deal.funding_status === 'funded' ? '✓ Funded' : 'Pending Review'}
                        </Badge>
                      </>
                    )}

                    {/* Always show: Open detail */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 ml-auto text-cyan-600 hover:text-cyan-700"
                      onClick={() => { onClose(); onSelectDeal(deal); }}
                    >
                      Full Details <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}