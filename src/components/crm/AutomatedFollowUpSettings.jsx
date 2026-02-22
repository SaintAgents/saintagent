import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail, Clock, Play, Pause, Plus, Edit, Trash2, Sparkles, Loader2,
  Zap, Target, Users, Calendar, ArrowRight, CheckCircle2
} from 'lucide-react';

const TRIGGER_TYPES = [
  { value: 'days_since_contact', label: 'Days Since Last Contact', description: 'Trigger after X days without contact' },
  { value: 'status_change', label: 'Lead Status Change', description: 'When a lead moves to a specific status' },
  { value: 'score_change', label: 'Quality Score Change', description: 'When score crosses a threshold' },
  { value: 'tag_added', label: 'Tag Added', description: 'When a specific tag is added' }
];

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurturing'];

const EMAIL_TEMPLATES = [
  { id: 'intro', name: 'Introduction', subject: 'Great connecting with you' },
  { id: 'followup', name: 'Follow-Up', subject: 'Following up on our conversation' },
  { id: 'meeting', name: 'Meeting Request', subject: 'Would love to schedule a call' },
  { id: 'value', name: 'Value Proposition', subject: 'How we can help you' },
  { id: 'custom', name: 'Custom', subject: '' }
];

export default function AutomatedFollowUpSettings({ currentUserId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const queryClient = useQueryClient();

  // Fetch existing workflows
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['crmWorkflows', currentUserId],
    queryFn: () => base44.entities.CRMWorkflow.filter({ created_by: currentUserId }, '-created_date', 50),
    enabled: !!currentUserId
  });

  // Fetch workflow executions for stats
  const { data: executions = [] } = useQuery({
    queryKey: ['crmWorkflowExecutions', currentUserId],
    queryFn: () => base44.entities.CRMWorkflowExecution.filter({}, '-created_date', 200),
    enabled: !!currentUserId
  });

  // Calculate execution stats per workflow
  const getWorkflowStats = (workflowId) => {
    const wfExecutions = executions.filter(e => e.workflow_id === workflowId);
    return {
      total: wfExecutions.length,
      completed: wfExecutions.filter(e => e.status === 'completed').length,
      running: wfExecutions.filter(e => e.status === 'running').length,
      failed: wfExecutions.filter(e => e.status === 'failed').length
    };
  };

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      await base44.entities.CRMWorkflow.update(id, { is_active: !is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.CRMWorkflow.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Automated Follow-Up Sequences
            </CardTitle>
            <CardDescription>
              Set up automated email sequences based on lead behavior and status
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No workflows yet</h3>
              <p className="text-slate-500 mb-4">Create automated follow-up sequences to engage your leads</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Workflow
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map(workflow => {
                const stats = getWorkflowStats(workflow.id);
                return (
                  <div 
                    key={workflow.id} 
                    className={`p-4 border rounded-lg transition-colors ${
                      workflow.is_active ? 'bg-white border-violet-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-slate-900">{workflow.name}</h4>
                          <Badge className={workflow.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                            {workflow.is_active ? 'Active' : 'Paused'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {TRIGGER_TYPES.find(t => t.value === workflow.trigger_type)?.label || workflow.trigger_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{workflow.description || 'No description'}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {stats.completed} completed
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {stats.running} running
                          </span>
                          <span>
                            {(workflow.actions || []).length} actions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.is_active}
                          onCheckedChange={() => toggleWorkflowMutation.mutate({ id: workflow.id, is_active: workflow.is_active })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingWorkflow(workflow);
                            setShowCreateModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Delete this workflow?')) {
                              deleteWorkflowMutation.mutate(workflow.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Workflow Modal */}
      <WorkflowModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingWorkflow(null);
        }}
        workflow={editingWorkflow}
        currentUserId={currentUserId}
      />
    </div>
  );
}

function WorkflowModal({ open, onClose, workflow, currentUserId }) {
  const isEditing = !!workflow;
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'days_since_contact',
    trigger_config: { days_threshold: 7 },
    actions: [],
    is_active: true
  });

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || '',
        description: workflow.description || '',
        trigger_type: workflow.trigger_type || 'days_since_contact',
        trigger_config: workflow.trigger_config || { days_threshold: 7 },
        actions: workflow.actions || [],
        is_active: workflow.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        trigger_type: 'days_since_contact',
        trigger_config: { days_threshold: 7 },
        actions: [],
        is_active: true
      });
    }
  }, [workflow, open]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        await base44.entities.CRMWorkflow.update(workflow.id, data);
      } else {
        await base44.entities.CRMWorkflow.create({
          ...data,
          created_by: currentUserId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmWorkflows'] });
      onClose();
    }
  });

  const generateAIEmail = async (actionIndex) => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional follow-up email for a CRM sequence. 
          Context: ${formData.description || 'General follow-up'}
          Trigger: ${formData.trigger_type}
          Action #: ${actionIndex + 1} of the sequence
          
          Generate a natural, personalized email that doesn't sound robotic.
          Include placeholders like {{first_name}}, {{company}} where appropriate.`,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' }
          }
        }
      });

      const updatedActions = [...formData.actions];
      updatedActions[actionIndex] = {
        ...updatedActions[actionIndex],
        config: {
          ...updatedActions[actionIndex].config,
          email_subject: response.subject,
          email_body: response.body
        }
      };
      setFormData({ ...formData, actions: updatedActions });
    } catch (error) {
      console.error('Failed to generate email:', error);
    }
    setGenerating(false);
  };

  const addAction = (type) => {
    const newAction = {
      id: `action_${Date.now()}`,
      action_type: type,
      config: type === 'send_email' ? {
        email_subject: '',
        email_body: '',
        template_id: 'custom'
      } : type === 'wait_delay' ? {
        wait_hours: 24
      } : {}
    };
    setFormData({ ...formData, actions: [...formData.actions, newAction] });
  };

  const updateAction = (index, updates) => {
    const updatedActions = [...formData.actions];
    updatedActions[index] = { ...updatedActions[index], ...updates };
    setFormData({ ...formData, actions: updatedActions });
  };

  const removeAction = (index) => {
    setFormData({ 
      ...formData, 
      actions: formData.actions.filter((_, i) => i !== index) 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workflow' : 'Create Follow-Up Workflow'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basics" className="mt-4">
          <TabsList>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="trigger">Trigger</TabsTrigger>
            <TabsTrigger value="actions">Actions ({formData.actions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Workflow Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 7-Day Follow-Up Sequence"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this workflow do?"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>Activate workflow immediately</Label>
            </div>
          </TabsContent>

          <TabsContent value="trigger" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(v) => setFormData({ ...formData, trigger_type: v, trigger_config: {} })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <p>{t.label}</p>
                        <p className="text-xs text-slate-500">{t.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.trigger_type === 'days_since_contact' && (
              <div className="space-y-2">
                <Label>Days Threshold</Label>
                <Input
                  type="number"
                  value={formData.trigger_config.days_threshold || 7}
                  onChange={(e) => setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, days_threshold: parseInt(e.target.value) || 7 }
                  })}
                  placeholder="7"
                />
                <p className="text-xs text-slate-500">Trigger when contact hasn't been reached in X days</p>
              </div>
            )}

            {formData.trigger_type === 'status_change' && (
              <div className="space-y-2">
                <Label>When Status Changes To</Label>
                <Select
                  value={formData.trigger_config.to_status || ''}
                  onValueChange={(v) => setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, to_status: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.trigger_type === 'score_change' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Score Threshold</Label>
                  <Input
                    type="number"
                    value={formData.trigger_config.score_threshold || 70}
                    onChange={(e) => setFormData({
                      ...formData,
                      trigger_config: { ...formData.trigger_config, score_threshold: parseInt(e.target.value) || 70 }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Select
                    value={formData.trigger_config.score_direction || 'above'}
                    onValueChange={(v) => setFormData({
                      ...formData,
                      trigger_config: { ...formData.trigger_config, score_direction: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Goes Above</SelectItem>
                      <SelectItem value="below">Falls Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addAction('send_email')} className="gap-2">
                <Mail className="w-4 h-4" />
                Add Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => addAction('wait_delay')} className="gap-2">
                <Clock className="w-4 h-4" />
                Add Delay
              </Button>
              <Button variant="outline" size="sm" onClick={() => addAction('update_status')} className="gap-2">
                <Target className="w-4 h-4" />
                Update Status
              </Button>
            </div>

            <div className="space-y-4">
              {formData.actions.map((action, idx) => (
                <div key={action.id} className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <Badge variant="outline">
                        {action.action_type === 'send_email' ? 'Send Email' :
                         action.action_type === 'wait_delay' ? 'Wait' :
                         action.action_type === 'update_status' ? 'Update Status' :
                         action.action_type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 h-8 w-8"
                      onClick={() => removeAction(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {action.action_type === 'send_email' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Email Template</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAIEmail(idx)}
                          disabled={generating}
                          className="gap-2"
                        >
                          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          AI Generate
                        </Button>
                      </div>
                      <Select
                        value={action.config.template_id || 'custom'}
                        onValueChange={(v) => {
                          const template = EMAIL_TEMPLATES.find(t => t.id === v);
                          updateAction(idx, {
                            config: {
                              ...action.config,
                              template_id: v,
                              email_subject: template?.subject || action.config.email_subject
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EMAIL_TEMPLATES.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Subject line"
                        value={action.config.email_subject || ''}
                        onChange={(e) => updateAction(idx, {
                          config: { ...action.config, email_subject: e.target.value }
                        })}
                      />
                      <Textarea
                        placeholder="Email body... Use {{first_name}}, {{company}} for personalization"
                        value={action.config.email_body || ''}
                        onChange={(e) => updateAction(idx, {
                          config: { ...action.config, email_body: e.target.value }
                        })}
                        rows={4}
                      />
                    </div>
                  )}

                  {action.action_type === 'wait_delay' && (
                    <div className="flex items-center gap-3">
                      <Label>Wait for</Label>
                      <Input
                        type="number"
                        className="w-20"
                        value={action.config.wait_hours || 24}
                        onChange={(e) => updateAction(idx, {
                          config: { ...action.config, wait_hours: parseInt(e.target.value) || 24 }
                        })}
                      />
                      <span className="text-sm text-slate-500">hours</span>
                    </div>
                  )}

                  {action.action_type === 'update_status' && (
                    <div className="flex items-center gap-3">
                      <Label>Change status to</Label>
                      <Select
                        value={action.config.new_status || ''}
                        onValueChange={(v) => updateAction(idx, {
                          config: { ...action.config, new_status: v }
                        })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {idx < formData.actions.length - 1 && (
                    <div className="flex items-center justify-center mt-3">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              ))}

              {formData.actions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Mail className="w-8 h-8 mx-auto mb-2" />
                  <p>Add actions to your workflow</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => saveMutation.mutate(formData)}
            disabled={!formData.name || saveMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}