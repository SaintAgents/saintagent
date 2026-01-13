import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, MapPin, Users, Calendar, Building2, Globe, 
  FileText, Tag, ExternalLink, CheckCircle, XCircle, HelpCircle,
  Clock, AlertTriangle, Shield, Brain, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectEvaluationPanel from '@/components/evaluation/ProjectEvaluationPanel';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'slate', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'amber', icon: Clock },
  phase1_review: { label: 'Phase 1: Ethics', color: 'blue', icon: Shield },
  phase2_scoring: { label: 'Phase 2: Scoring', color: 'violet', icon: Brain },
  phase3_risk: { label: 'Phase 3: Risk', color: 'orange', icon: AlertTriangle },
  phase4_decision: { label: 'Phase 4: Decision', color: 'indigo', icon: TrendingUp },
  approved: { label: 'Approved', color: 'emerald', icon: CheckCircle },
  incubate: { label: 'Incubating', color: 'amber', icon: TrendingUp },
  declined: { label: 'Declined', color: 'rose', icon: XCircle },
  flagged: { label: 'Flagged', color: 'rose', icon: AlertTriangle },
  rfi_pending: { label: 'RFI Pending', color: 'blue', icon: HelpCircle }
};

const STAGE_LABELS = {
  idea: 'Idea Stage',
  prototype: 'Prototype',
  pilot: 'Pilot',
  scaling: 'Scaling',
  mature_ops: 'Mature Operations'
};

export default function ProjectDetailCard({ project }) {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending_review;
  const StatusIcon = statusConfig.icon;

  const handleProjectUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects_all'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn(
              "gap-1",
              statusConfig.color === 'emerald' && "bg-emerald-100 text-emerald-700",
              statusConfig.color === 'amber' && "bg-amber-100 text-amber-700",
              statusConfig.color === 'rose' && "bg-rose-100 text-rose-700",
              statusConfig.color === 'blue' && "bg-blue-100 text-blue-700",
              statusConfig.color === 'violet' && "bg-violet-100 text-violet-700",
              statusConfig.color === 'indigo' && "bg-indigo-100 text-indigo-700",
              statusConfig.color === 'orange' && "bg-orange-100 text-orange-700",
              statusConfig.color === 'slate' && "bg-slate-100 text-slate-700"
            )}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
            {project.stage && (
              <Badge variant="outline">{STAGE_LABELS[project.stage] || project.stage}</Badge>
            )}
            {project.lane_code && (
              <Badge variant="secondary" className="capitalize">
                {project.lane_code.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h2>
        </div>
        
        {/* Quick Scores */}
        {project.final_score !== undefined && project.final_score !== null && (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-500">Final Score</div>
              <div className={cn(
                "text-2xl font-bold",
                project.final_score >= 80 && "text-emerald-600",
                project.final_score >= 60 && project.final_score < 80 && "text-amber-600",
                project.final_score >= 40 && project.final_score < 60 && "text-blue-600",
                project.final_score < 40 && "text-rose-600"
              )}>
                {project.final_score?.toFixed(0)}
              </div>
            </div>
            {project.phase3_risk_grade && (
              <div className="text-center">
                <div className="text-xs text-slate-500">Risk</div>
                <div className={cn(
                  "text-2xl font-bold",
                  project.phase3_risk_grade === 'A' && "text-emerald-600",
                  project.phase3_risk_grade === 'B' && "text-green-600",
                  project.phase3_risk_grade === 'C' && "text-amber-600",
                  project.phase3_risk_grade === 'D' && "text-orange-600",
                  project.phase3_risk_grade === 'F' && "text-rose-600"
                )}>
                  {project.phase3_risk_grade}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evaluation" className="gap-1">
            <Brain className="w-4 h-4" />
            Evaluation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Description */}
          {project.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h4>
              <p className="text-slate-700 dark:text-slate-300">{project.description}</p>
            </div>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {project.budget > 0 && (
              <DetailItem 
                icon={DollarSign} 
                label="Budget" 
                value={`$${project.budget.toLocaleString()}`} 
              />
            )}
            {project.geography && (
              <DetailItem 
                icon={MapPin} 
                label="Geography" 
                value={project.geography} 
              />
            )}
            {project.team_size && (
              <DetailItem 
                icon={Users} 
                label="Team Size" 
                value={project.team_size} 
              />
            )}
            {project.organization_name && (
              <DetailItem 
                icon={Building2} 
                label="Organization" 
                value={project.organization_name} 
              />
            )}
            {project.website_url && (
              <DetailItem 
                icon={Globe} 
                label="Website" 
                value={
                  <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline flex items-center gap-1">
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                } 
              />
            )}
            <DetailItem 
              icon={Calendar} 
              label="Created" 
              value={project.created_date ? new Date(project.created_date).toLocaleDateString() : 'Unknown'} 
            />
          </div>

          {/* Strategic Intent */}
          {project.strategic_intent && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Strategic Intent</h4>
              <p className="text-slate-700 dark:text-slate-300">{project.strategic_intent}</p>
            </div>
          )}

          {/* Impact Tags */}
          {project.impact_tags?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Impact Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.impact_tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Derived Tags from Evaluation */}
          {project.derived_tags?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Evaluation Tags</h4>
              <div className="flex flex-wrap gap-2">
                {project.derived_tags.map((tag, i) => (
                  <Badge key={i} className="bg-violet-100 text-violet-700">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ownership Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Ownership</h4>
            <div className="text-sm">
              <span className="font-medium">Status:</span>{' '}
              <span className="capitalize">{project.claim_status || 'Unclaimed'}</span>
              {project.claimed_by && (
                <>
                  <br />
                  <span className="font-medium">Claimed by:</span> {project.claimed_by}
                </>
              )}
            </div>
            {/* Claim button for unclaimed projects */}
            {(!project.claim_status || project.claim_status === 'unclaimed') && !project.claimed_by && (
              <ClaimButton project={project} currentUser={currentUser} onUpdate={handleProjectUpdate} />
            )}
          </div>

          {/* Metadata */}
          {project.metadata && Object.keys(project.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Additional Data</h4>
              <div className="p-3 rounded-lg bg-slate-50 border text-sm">
                <pre className="whitespace-pre-wrap text-slate-600">
                  {JSON.stringify(project.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="evaluation" className="mt-4">
          <ProjectEvaluationPanel project={project} onUpdate={handleProjectUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function ClaimButton({ project, currentUser, onUpdate }) {
  const [claiming, setClaiming] = useState(false);
  const queryClient = useQueryClient();

  const handleClaim = async () => {
    if (!currentUser?.email) return;
    setClaiming(true);
    try {
      await base44.entities.Project.update(project.id, {
        claim_status: 'claimed',
        claimed_by: currentUser.email
      });
      queryClient.invalidateQueries({ queryKey: ['projects_all'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onUpdate?.();
    } catch (e) {
      console.error('Failed to claim project:', e);
    }
    setClaiming(false);
  };

  return (
    <Button 
      size="sm" 
      className="mt-3 w-full bg-violet-600 hover:bg-violet-700"
      onClick={handleClaim}
      disabled={claiming}
    >
      {claiming ? 'Claiming...' : 'Claim Ownership'}
    </Button>
  );
}