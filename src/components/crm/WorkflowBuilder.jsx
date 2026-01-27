import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, X, Plus, Trash2, GripVertical, Mail, Tag, UserCheck, 
  Target, Clock, Bell, GitBranch, ArrowDown, Zap, Play,
  ChevronRight, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const TRIGGERS = [
  { id: 'score_change', label: 'Score Change', icon: Target, description: 'When contact score crosses a threshold' },
  { id: 'days_since_contact', label: 'Days Since Contact', icon: Clock, description: 'When last contact exceeds X days' },
  { id: 'status_change', label: 'Status Change', icon: UserCheck, description: 'When contact status changes' },
  { id: 'tag_added', label: 'Tag Added', icon: Tag, description: 'When a tag is added to contact' },
  { id: 'tag_removed', label: 'Tag Removed', icon: Tag, description: 'When a tag is removed from contact' },
  { id: 'federation_status', label: 'Federation Status', icon: Zap, description: 'When federation status changes' },
  { id: 'manual', label: 'Manual Trigger', icon: Play, description: 'Run manually on selected contacts' },
  { id: 'scheduled', label: 'Scheduled', icon: Clock, description: 'Run on a schedule' }
];

const ACTIONS = [
  { id: 'send_email', label: 'Send Email', icon: Mail, color: 'bg-blue-500' },
  { id: 'assign_task', label: 'Assign Task', icon: UserCheck, color: 'bg-green-500' },
  { id: 'update_status', label: 'Update Status', icon: Target, color: 'bg-purple-500' },
  { id: 'add_tag', label: 'Add Tag', icon: Tag, color: 'bg-amber-500' },
  { id: 'remove_tag', label: 'Remove Tag', icon: Tag, color: 'bg-red-500' },
  { id: 'update_score', label: 'Adjust Score', icon: Target, color: 'bg-indigo-500' },
  { id: 'send_notification', label: 'Send Notification', icon: Bell, color: 'bg-pink-500' },
  { id: 'wait_delay', label: 'Wait/Delay', icon: Clock, color: 'bg-slate-500' },
  { id: 'condition_branch', label: 'Condition Branch', icon: GitBranch, color: 'bg-cyan-500' }
];

const CONTACT_STATUSES = ['lead', 'prospect', 'qualified', 'customer', 'partner', 'inactive', 'lost'];

export default function WorkflowBuilder({ workflow, onClose, onSave }) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [triggerType, setTriggerType] = useState(workflow?.trigger_type || '');
  const [triggerConfig, setTriggerConfig] = useState(workflow?.trigger_config || {});
  const [actions, setActions] = useState(workflow?.actions || []);
  const [saving, setSaving] = useState(false);

  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['crmEmailTemplates'],
    queryFn: () => base44.entities.CRMEmailTemplate.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (workflow?.id) {
        return base44.entities.CRMWorkflow.update(workflow.id, data);
      }
      return base44.entities.CRMWorkflow.create(data);
    },
    onSuccess: () => {
      toast.success(workflow?.id ? 'Workflow updated' : 'Workflow created');
      onSave();
    },
    onError: (error) => {
      toast.error('Failed to save workflow');
      console.error(error);
    }
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }
    if (!triggerType) {
      toast.error('Please select a trigger');
      return;
    }
    if (actions.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    saveMutation.mutate({
      name,
      description,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      actions,
      is_active: workflow?.is_active ?? true
    });
  };

  const addAction = (actionType) => {
    const newAction = {
      id: `action_${Date.now()}`,
      action_type: actionType,
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (index, updates) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const removeAction = (index) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const moveAction = (fromIndex, toIndex) => {
    const newActions = [...actions];
    const [removed] = newActions.splice(fromIndex, 1);
    newActions.splice(toIndex, 0, removed);
    setActions(newActions);
  };

  const selectedTrigger = TRIGGERS.find(t => t.id === triggerType);

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-violet-600" />
          <div>
            <h2 className="text-lg font-semibold">{workflow?.id ? 'Edit Workflow' : 'Create Workflow'}</h2>
            <p className="text-sm text-slate-500">Build automated workflows for your contacts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="w-80 border-r bg-white overflow-y-auto p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Workflow Name *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Re-engagement Campaign"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this workflow do?"
                rows={2}
              />
            </div>
          </div>

          {/* Trigger Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Trigger</Label>
            <div className="space-y-2">
              {TRIGGERS.map((trigger) => {
                const Icon = trigger.icon;
                const isSelected = triggerType === trigger.id;
                return (
                  <div
                    key={trigger.id}
                    onClick={() => setTriggerType(trigger.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-violet-600' : 'text-slate-400'}`} />
                      <div>
                        <p className={`font-medium text-sm ${isSelected ? 'text-violet-700' : ''}`}>
                          {trigger.label}
                        </p>
                        <p className="text-xs text-slate-500">{trigger.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger Configuration */}
          {triggerType && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
              <Label className="text-sm font-medium">Trigger Settings</Label>
              <TriggerConfigForm 
                triggerType={triggerType}
                config={triggerConfig}
                onChange={setTriggerConfig}
              />
            </div>
          )}
        </div>

        {/* Center - Visual Workflow Builder */}
        <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold">Workflow Actions</h3>
            <p className="text-sm text-slate-500">Drag to reorder, click to configure</p>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-lg mx-auto space-y-4">
              {/* Trigger Node */}
              {selectedTrigger && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white p-4 rounded-xl shadow-lg w-full">
                    <div className="flex items-center gap-3">
                      <selectedTrigger.icon className="w-6 h-6" />
                      <div>
                        <p className="font-semibold">Trigger: {selectedTrigger.label}</p>
                        <p className="text-xs text-violet-100">{getTriggerSummary(triggerType, triggerConfig)}</p>
                      </div>
                    </div>
                  </div>
                  <ArrowDown className="w-6 h-6 text-slate-400 my-2" />
                </div>
              )}

              {/* Action Nodes */}
              {actions.map((action, index) => {
                const actionDef = ACTIONS.find(a => a.id === action.action_type);
                if (!actionDef) return null;
                
                return (
                  <div key={action.id} className="flex flex-col items-center">
                    <ActionNode
                      action={action}
                      actionDef={actionDef}
                      index={index}
                      onUpdate={(updates) => updateAction(index, updates)}
                      onRemove={() => removeAction(index)}
                      onMoveUp={index > 0 ? () => moveAction(index, index - 1) : null}
                      onMoveDown={index < actions.length - 1 ? () => moveAction(index, index + 1) : null}
                      emailTemplates={emailTemplates}
                      users={users}
                    />
                    {index < actions.length - 1 && (
                      <ArrowDown className="w-6 h-6 text-slate-400 my-2" />
                    )}
                  </div>
                );
              })}

              {/* Add Action */}
              <div className="flex flex-col items-center pt-4">
                {actions.length > 0 && <ArrowDown className="w-6 h-6 text-slate-400 mb-2" />}
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 w-full">
                  <p className="text-sm text-slate-500 text-center mb-3">Add Action</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => addAction(action.id)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-slate-600 text-center leading-tight">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function TriggerConfigForm({ triggerType, config, onChange }) {
  const updateConfig = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  switch (triggerType) {
    case 'score_change':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Direction</Label>
            <Select value={config.score_direction || ''} onValueChange={(v) => updateConfig('score_direction', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Goes Above</SelectItem>
                <SelectItem value="below">Goes Below</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Score Threshold</Label>
            <Input 
              type="number" 
              value={config.score_threshold || ''} 
              onChange={(e) => updateConfig('score_threshold', parseInt(e.target.value))}
              placeholder="e.g., 50"
            />
          </div>
        </div>
      );

    case 'days_since_contact':
      return (
        <div>
          <Label className="text-xs">Days Threshold</Label>
          <Input 
            type="number" 
            value={config.days_threshold || ''} 
            onChange={(e) => updateConfig('days_threshold', parseInt(e.target.value))}
            placeholder="e.g., 30"
          />
        </div>
      );

    case 'status_change':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">From Status (optional)</Label>
            <Select value={config.from_status || ''} onValueChange={(v) => updateConfig('from_status', v)}>
              <SelectTrigger><SelectValue placeholder="Any status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any status</SelectItem>
                {CONTACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">To Status</Label>
            <Select value={config.to_status || ''} onValueChange={(v) => updateConfig('to_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                {CONTACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'tag_added':
    case 'tag_removed':
      return (
        <div>
          <Label className="text-xs">Tag Name</Label>
          <Input 
            value={config.tag_name || ''} 
            onChange={(e) => updateConfig('tag_name', e.target.value)}
            placeholder="e.g., VIP"
          />
        </div>
      );

    case 'federation_status':
      return (
        <div>
          <Label className="text-xs">Federation Status</Label>
          <Select value={config.federation_value?.toString() || ''} onValueChange={(v) => updateConfig('federation_value', v === 'true')}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Federated</SelectItem>
              <SelectItem value="false">Not Federated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case 'scheduled':
      return (
        <div>
          <Label className="text-xs">Schedule (Cron Expression)</Label>
          <Input 
            value={config.schedule_cron || ''} 
            onChange={(e) => updateConfig('schedule_cron', e.target.value)}
            placeholder="0 9 * * 1-5"
          />
          <p className="text-xs text-slate-400 mt-1">e.g., "0 9 * * 1-5" = 9am weekdays</p>
        </div>
      );

    default:
      return <p className="text-xs text-slate-500">No configuration needed</p>;
  }
}

function ActionNode({ action, actionDef, index, onUpdate, onRemove, onMoveUp, onMoveDown, emailTemplates, users }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = actionDef.icon;

  const updateConfig = (key, value) => {
    onUpdate({ config: { ...action.config, [key]: value } });
  };

  return (
    <div className="bg-white rounded-xl shadow-md w-full overflow-hidden border">
      {/* Header */}
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`p-2 rounded-lg ${actionDef.color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{actionDef.label}</p>
          <p className="text-xs text-slate-500">{getActionSummary(action)}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {/* Expanded Config */}
      {expanded && (
        <div className="p-4 border-t bg-slate-50 space-y-3">
          <ActionConfigForm
            actionType={action.action_type}
            config={action.config}
            onChange={(key, value) => updateConfig(key, value)}
            emailTemplates={emailTemplates}
            users={users}
          />
          <div className="flex justify-between pt-2 border-t">
            <div className="flex gap-1">
              {onMoveUp && (
                <Button variant="ghost" size="sm" onClick={onMoveUp}>↑ Move Up</Button>
              )}
              {onMoveDown && (
                <Button variant="ghost" size="sm" onClick={onMoveDown}>↓ Move Down</Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionConfigForm({ actionType, config, onChange, emailTemplates, users }) {
  switch (actionType) {
    case 'send_email':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Email Template (or write custom)</Label>
            <Select value={config.email_template_id || ''} onValueChange={(v) => onChange('email_template_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Custom Email</SelectItem>
                {emailTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {!config.email_template_id && (
            <>
              <div>
                <Label className="text-xs">Subject</Label>
                <Input 
                  value={config.email_subject || ''} 
                  onChange={(e) => onChange('email_subject', e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <Label className="text-xs">Body (use {"{{name}}"}, {"{{email}}"} for placeholders)</Label>
                <Textarea 
                  value={config.email_body || ''} 
                  onChange={(e) => onChange('email_body', e.target.value)}
                  placeholder="Email body..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      );

    case 'assign_task':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Task Title</Label>
            <Input 
              value={config.task_title || ''} 
              onChange={(e) => onChange('task_title', e.target.value)}
              placeholder="e.g., Follow up with contact"
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea 
              value={config.task_description || ''} 
              onChange={(e) => onChange('task_description', e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label className="text-xs">Assign To</Label>
            <Select value={config.assign_to_user_id || ''} onValueChange={(v) => onChange('assign_to_user_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Due in (days)</Label>
            <Input 
              type="number" 
              value={config.task_due_days || ''} 
              onChange={(e) => onChange('task_due_days', parseInt(e.target.value))}
              placeholder="e.g., 3"
            />
          </div>
        </div>
      );

    case 'update_status':
      return (
        <div>
          <Label className="text-xs">New Status</Label>
          <Select value={config.new_status || ''} onValueChange={(v) => onChange('new_status', v)}>
            <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
            <SelectContent>
              {CONTACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );

    case 'add_tag':
    case 'remove_tag':
      return (
        <div>
          <Label className="text-xs">Tag Name</Label>
          <Input 
            value={config.tag_name || ''} 
            onChange={(e) => onChange('tag_name', e.target.value)}
            placeholder="e.g., nurture-campaign"
          />
        </div>
      );

    case 'update_score':
      return (
        <div>
          <Label className="text-xs">Score Adjustment (+/-)</Label>
          <Input 
            type="number" 
            value={config.score_adjustment || ''} 
            onChange={(e) => onChange('score_adjustment', parseInt(e.target.value))}
            placeholder="e.g., -10 or +5"
          />
        </div>
      );

    case 'send_notification':
      return (
        <div>
          <Label className="text-xs">Notification Message</Label>
          <Textarea 
            value={config.notification_message || ''} 
            onChange={(e) => onChange('notification_message', e.target.value)}
            placeholder="Notification to send to assigned users..."
            rows={2}
          />
        </div>
      );

    case 'wait_delay':
      return (
        <div>
          <Label className="text-xs">Wait Hours</Label>
          <Input 
            type="number" 
            value={config.wait_hours || ''} 
            onChange={(e) => onChange('wait_hours', parseInt(e.target.value))}
            placeholder="e.g., 24"
          />
        </div>
      );

    default:
      return <p className="text-xs text-slate-500">No configuration available</p>;
  }
}

function getTriggerSummary(type, config) {
  switch (type) {
    case 'score_change':
      return config.score_direction && config.score_threshold 
        ? `Score ${config.score_direction} ${config.score_threshold}` 
        : 'Configure threshold';
    case 'days_since_contact':
      return config.days_threshold ? `After ${config.days_threshold} days` : 'Configure days';
    case 'status_change':
      return config.to_status ? `Changed to ${config.to_status}` : 'Configure status';
    case 'tag_added':
    case 'tag_removed':
      return config.tag_name || 'Configure tag';
    case 'federation_status':
      return config.federation_value !== undefined ? (config.federation_value ? 'Federated' : 'Not federated') : 'Configure';
    case 'scheduled':
      return config.schedule_cron || 'Configure schedule';
    case 'manual':
      return 'Triggered manually';
    default:
      return '';
  }
}

function getActionSummary(action) {
  const config = action.config || {};
  switch (action.action_type) {
    case 'send_email':
      return config.email_template_id ? 'Using template' : (config.email_subject || 'Configure email');
    case 'assign_task':
      return config.task_title || 'Configure task';
    case 'update_status':
      return config.new_status ? `Set to ${config.new_status}` : 'Configure status';
    case 'add_tag':
      return config.tag_name ? `Add "${config.tag_name}"` : 'Configure tag';
    case 'remove_tag':
      return config.tag_name ? `Remove "${config.tag_name}"` : 'Configure tag';
    case 'update_score':
      return config.score_adjustment ? `${config.score_adjustment > 0 ? '+' : ''}${config.score_adjustment}` : 'Configure';
    case 'send_notification':
      return config.notification_message ? 'Message configured' : 'Configure message';
    case 'wait_delay':
      return config.wait_hours ? `Wait ${config.wait_hours}h` : 'Configure delay';
    default:
      return 'Click to configure';
  }
}