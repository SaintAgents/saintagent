import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DollarSign, CheckCircle2, XCircle, Clock, Building2, 
  Calendar, ChevronRight, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function FundingReviewSection({ currentUser, profile, isAdmin }) {
  const queryClient = useQueryClient();

  // Get deals that are closed_won and pending funding review
  const { data: dealsForReview = [] } = useQuery({
    queryKey: ['dealsForFundingReview'],
    queryFn: async () => {
      const deals = await base44.entities.Deal.filter({ stage: 'closed_won' }, '-created_date', 100);
      return deals.filter(d => d.funding_status === 'pending_review' || !d.funding_status || d.funding_status === 'not_applicable');
    }
  });

  const approveFundingMutation = useMutation({
    mutationFn: async (deal) => {
      // Create project from deal
      const project = await base44.entities.Project.create({
        title: deal.title,
        description: deal.description,
        budget: deal.amount,
        deal_id: deal.id,
        owner_id: deal.owner_id,
        owner_name: deal.owner_name,
        owner_avatar: deal.owner_avatar,
        organization_name: deal.company_name,
        status: 'funded',
        project_status: 'planned',
        derived_tags: deal.tags
      });
      
      // Update deal with project reference and funding status
      await base44.entities.Deal.update(deal.id, {
        project_id: project.id,
        funding_status: 'funded',
        funded_date: new Date().toISOString()
      });

      // Log activity
      await base44.entities.ProjectActivity.create({
        project_id: project.id,
        activity_type: 'funding_approved',
        description: `Project funded from deal: ${deal.title}`,
        actor_id: currentUser?.email,
        actor_name: profile?.display_name || currentUser?.full_name
      });

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealsForFundingReview'] });
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    }
  });

  const rejectFundingMutation = useMutation({
    mutationFn: async (deal) => {
      await base44.entities.Deal.update(deal.id, {
        funding_status: 'rejected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealsForFundingReview'] });
    }
  });

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  if (dealsForReview.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <Clock className="w-5 h-5" />
          Pending Funding Review
          <Badge className="bg-amber-500 text-white ml-2">{dealsForReview.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-amber-700 dark:text-amber-400/80 mb-4">
          These deals have been closed and are awaiting funding approval to become active projects.
        </p>
        
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {dealsForReview.map((deal) => (
              <Card key={deal.id} className="bg-white dark:bg-slate-900">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <h4 className="font-semibold text-slate-900 dark:text-white">{deal.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{deal.company_name}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">
                          {formatCurrency(deal.amount)}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={deal.owner_avatar} />
                            <AvatarFallback className="text-[8px]">{deal.owner_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{deal.owner_name}</span>
                        </div>
                        {deal.expected_close_date && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{format(new Date(deal.expected_close_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                      
                      {deal.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {deal.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isAdmin && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() => approveFundingMutation.mutate(deal)}
                          disabled={approveFundingMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve & Fund
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 gap-1"
                          onClick={() => rejectFundingMutation.mutate(deal)}
                          disabled={rejectFundingMutation.isPending}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}