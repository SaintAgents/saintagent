import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, MapPin, Users, Calendar, Building2, Globe, 
  FileText, Tag, ExternalLink, CheckCircle, XCircle, HelpCircle,
  Clock, AlertTriangle, Shield, Brain, TrendingUp, MessageSquare, Megaphone, UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectEvaluationPanel from '@/components/evaluation/ProjectEvaluationPanel';
import ProjectTeamPanel from '@/components/projects/ProjectTeamPanel';
import ProjectDiscussionPanel from '@/components/projects/ProjectDiscussionPanel';
import ProjectUpdatePanel from '@/components/projects/ProjectUpdatePanel';
import ClaimProjectModal from '@/components/projects/ClaimProjectModal';

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

export default function ProjectDetailCard({ project: initialProject }) {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch fresh project data to get latest evaluation results
  const { data: freshProject, refetch: refetchProject } = useQuery({
    queryKey: ['projectDetail', initialProject?.id],
    queryFn: async () => {
      const results = await base44.entities.Project.filter({ id: initialProject.id });
      return results[0] || initialProject;
    },
    enabled: !!initialProject?.id,
    initialData: initialProject
  });

  const project = freshProject || initialProject;

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending_review;
  const StatusIcon = statusConfig.icon;

  const handleProjectUpdate = () => {
    refetchProject();
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
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team" className="gap-1">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="updates" className="gap-1">
            <Megaphone className="w-4 h-4" />
            Updates
          </TabsTrigger>
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
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
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
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Evaluation Tags</h4>
              <div className="flex flex-wrap gap-2">
                {project.derived_tags.map((tag, i) => (
                  <Badge key={i} className="bg-violet-100 text-violet-700">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Introducer Info */}
          {project.introduced_by && (
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
              <h4 className="text-sm font-medium text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Introduced By
              </h4>
              <div className="text-sm text-violet-900 dark:text-violet-100">
                <span 
                  className="font-medium cursor-pointer hover:underline" 
                  data-user-id={project.introduced_by}
                >
                  {project.introducer_name || project.introduced_by}
                </span>
                {project.introduction_commission_paid && (
                  <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">Commission Paid</Badge>
                )}
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
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Additional Data</h4>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm">
                <pre className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {JSON.stringify(project.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <ProjectTeamPanel 
            projectId={project.id} 
            isOwner={project.claimed_by === currentUser?.email || project.created_by === currentUser?.email}
          />
        </TabsContent>

        <TabsContent value="discussions" className="mt-4">
          <ProjectDiscussionPanel projectId={project.id} />
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          <ProjectUpdatePanel 
            projectId={project.id} 
            projectTitle={project.title}
            isTeamMember={project.claimed_by === currentUser?.email || project.created_by === currentUser?.email}
          />
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
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Determine button text based on status
  const getButtonText = () => {
    if (project.claim_status === 'pending' && project.claimed_by === currentUser?.email) {
      return 'Claim pending approval';
    }
    if (project.claim_status === 'approved') {
      return 'Already Claimed';
    }
    return 'Claim Project';
  };

  const isDisabled = project.claim_status === 'approved' || 
    (project.claim_status === 'pending' && project.claimed_by !== currentUser?.email);

  return (
    <>
      <Button 
        size="sm" 
        className="mt-3 w-full bg-violet-600 hover:bg-violet-700"
        onClick={() => setShowClaimModal(true)}
        disabled={isDisabled}
      >
        {getButtonText()}
      </Button>
      
      {showClaimModal && (
        <ClaimProjectDrawer
          project={project}
          currentUser={currentUser}
          onClose={() => setShowClaimModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

function ClaimProjectDrawer({ project, currentUser, onClose, onUpdate }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-700 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Claim Project</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <ClaimProjectModal 
          project={project} 
          currentUser={currentUser} 
          onClose={onClose} 
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}