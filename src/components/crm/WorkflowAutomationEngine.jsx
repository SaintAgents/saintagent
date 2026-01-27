import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Workflow, Plus, Play, Pause, Trash2, Edit, Copy, 
  Zap, Clock, Mail, Tag, UserCheck, Target, BarChart3,
  CheckCircle, XCircle, AlertCircle, Loader2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowExecutionLog from './WorkflowExecutionLog';

const TRIGGER_ICONS = {
  score_change: Target,
  days_since_contact: Clock,
  status_change: UserCheck,
  tag_added: Tag,
  tag_removed: Tag,
  federation_status: Zap,
  manual: Play,
  scheduled: Clock
};

const TRIGGER_LABELS = {
  score_change: 'Score Change',
  days_since_contact: 'Days Since Contact',
  status_change: 'Status Change',
  tag_added: 'Tag Added',
  tag_removed: 'Tag Removed',
  federation_status: 'Federation Status',
  manual: 'Manual Trigger',
  scheduled: 'Scheduled'
};

export default function WorkflowAutomationEngine() {
  const queryClient = useQueryClient();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [executionLogOpen, setExecutionLogOpen] = useState(false);
  const [selectedWorkflowForLog, setSelectedWorkflowForLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['crmWorkflows'],
    queryFn: () => base44.entities.CRMWorkflow.list('-created_date')
  });

  const { data: recentExecutions = [] } = useQuery({
    queryKey: ['crmWorkflowExecutions'],
    queryFn: () => base44.entities.CRMWorkflowExecution.list('-created_date', 20)
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.CRMWorkflow.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
      toast.success('Workflow updated');
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.CRMWorkflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
      toast.success('Workflow deleted');
    }
  });

  const duplicateWorkflowMutation = useMutation({
    mutationFn: async (workflow) => {
      const { id, created_date, updated_date, execution_count, last_executed_at, ...rest } = workflow;
      return base44.entities.CRMWorkflow.create({
        ...rest,
        name: `${workflow.name} (Copy)`,
        execution_count: 0,
        last_executed_at: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
      toast.success('Workflow duplicated');
    }
  });

  const handleCreateNew = () => {
    setSelectedWorkflow(null);
    setBuilderOpen(true);
  };

  const handleEdit = (workflow) => {
    setSelectedWorkflow(workflow);
    setBuilderOpen(true);
  };

  const handleViewExecutions = (workflow) => {
    setSelectedWorkflowForLog(workflow);
    setExecutionLogOpen(true);
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeWorkflows = filteredWorkflows.filter(w => w.is_active);
  const inactiveWorkflows = filteredWorkflows.filter(w => !w.is_active);

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.is_active).length,
    totalExecutions: workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0),
    recentSuccess: recentExecutions.filter(e => e.status === 'completed').length,
    recentFailed: recentExecutions.filter(e => e.status === 'failed').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Workflow className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-700">{stats.total}</p>
                <p className="text-xs text-violet-600">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalExecutions}</p>
                <p className="text-xs text-blue-600">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{stats.recentSuccess}</p>
                <p className="text-xs text-emerald-600">Recent Success</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{stats.recentFailed}</p>
                <p className="text-xs text-red-600">Recent Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleCreateNew} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Play className="w-4 h-4" />
            Active ({activeWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-2">
            <Pause className="w-4 h-4" />
            Inactive ({inactiveWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="executions" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Recent Executions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <WorkflowList 
            workflows={activeWorkflows}
            onEdit={handleEdit}
            onToggle={(id, active) => toggleWorkflowMutation.mutate({ id, is_active: active })}
            onDelete={(id) => deleteWorkflowMutation.mutate(id)}
            onDuplicate={(w) => duplicateWorkflowMutation.mutate(w)}
            onViewExecutions={handleViewExecutions}
          />
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          <WorkflowList 
            workflows={inactiveWorkflows}
            onEdit={handleEdit}
            onToggle={(id, active) => toggleWorkflowMutation.mutate({ id, is_active: active })}
            onDelete={(id) => deleteWorkflowMutation.mutate(id)}
            onDuplicate={(w) => duplicateWorkflowMutation.mutate(w)}
            onViewExecutions={handleViewExecutions}
          />
        </TabsContent>

        <TabsContent value="executions" className="mt-4">
          <RecentExecutionsList executions={recentExecutions} />
        </TabsContent>
      </Tabs>

      {/* Workflow Builder Dialog */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <WorkflowBuilder 
            workflow={selectedWorkflow}
            onClose={() => setBuilderOpen(false)}
            onSave={() => {
              queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
              setBuilderOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Execution Log Dialog */}
      <Dialog open={executionLogOpen} onOpenChange={setExecutionLogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execution Log: {selectedWorkflowForLog?.name}</DialogTitle>
          </DialogHeader>
          {selectedWorkflowForLog && (
            <WorkflowExecutionLog workflowId={selectedWorkflowForLog.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkflowList({ workflows, onEdit, onToggle, onDelete, onDuplicate, onViewExecutions }) {
  if (workflows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Workflow className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No workflows found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {workflows.map((workflow) => {
        const TriggerIcon = TRIGGER_ICONS[workflow.trigger_type] || Zap;
        return (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-lg ${workflow.is_active ? 'bg-violet-100' : 'bg-slate-100'}`}>
                    <TriggerIcon className={`w-5 h-5 ${workflow.is_active ? 'text-violet-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{workflow.name}</h3>
                      <Badge variant={workflow.is_active ? 'default' : 'secondary'} className="text-xs">
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{workflow.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {TRIGGER_LABELS[workflow.trigger_type]}
                      </span>
                      <span>{workflow.actions?.length || 0} actions</span>
                      <span>{workflow.execution_count || 0} runs</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={workflow.is_active}
                    onCheckedChange={(checked) => onToggle(workflow.id, checked)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => onViewExecutions(workflow)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(workflow)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDuplicate(workflow)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if (confirm('Delete this workflow?')) onDelete(workflow.id);
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function RecentExecutionsList({ executions }) {
  if (executions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No recent executions</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    running: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', spin: true },
    paused: { icon: Pause, color: 'text-amber-600', bg: 'bg-amber-100' }
  };

  return (
    <div className="space-y-2">
      {executions.map((exec) => {
        const config = statusConfig[exec.status] || statusConfig.running;
        const StatusIcon = config.icon;
        return (
          <Card key={exec.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${config.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{exec.workflow_name}</p>
                    <p className="text-xs text-slate-500">Contact: {exec.contact_name || exec.contact_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={exec.status === 'completed' ? 'default' : exec.status === 'failed' ? 'destructive' : 'secondary'}>
                    {exec.status}
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(exec.created_date).toLocaleString()}
                  </p>
                </div>
              </div>
              {exec.error_message && (
                <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">{exec.error_message}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}