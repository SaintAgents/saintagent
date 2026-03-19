import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Mail, MessageSquare, GripVertical, Trash2, Plus, Clock, 
  FileText, ChevronDown, ChevronUp 
} from 'lucide-react';

export default function SequenceStepEditor({ steps, onChange, templates }) {
  const [expandedStep, setExpandedStep] = useState(null);

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      order: steps.length,
      type: 'email',
      subject: '',
      body: '',
      template_id: '',
      delay_days: steps.length === 0 ? 0 : 2,
      delay_hours: 0,
      send_time: '09:00',
    };
    onChange([...steps, newStep]);
    setExpandedStep(newStep.id);
  };

  const updateStep = (stepId, updates) => {
    onChange(steps.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const removeStep = (stepId) => {
    onChange(steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i })));
    if (expandedStep === stepId) setExpandedStep(null);
  };

  const applyTemplate = (stepId, templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateStep(stepId, {
        template_id: templateId,
        subject: template.subject || '',
        body: template.body || '',
        type: template.type || 'email',
      });
    }
  };

  const moveStep = (index, direction) => {
    const newSteps = [...steps];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    onChange(newSteps.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isExpanded = expandedStep === step.id;
        return (
          <Card key={step.id} className="border overflow-hidden">
            {/* Step header */}
            <div 
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
            >
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveStep(index, -1); }}>
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveStep(index, 1); }}>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
              }`}>
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {step.type === 'email' ? <Mail className="w-4 h-4 text-blue-600" /> : <MessageSquare className="w-4 h-4 text-violet-600" />}
                  <span className="font-medium text-sm text-slate-900">
                    {step.subject || `Step ${index + 1} - ${step.type === 'email' ? 'Email' : 'Message'}`}
                  </span>
                </div>
                {index > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Wait {step.delay_days || 0} day{(step.delay_days || 0) !== 1 ? 's' : ''} 
                    {step.delay_hours > 0 && ` ${step.delay_hours}h`} after previous step
                    {step.send_time && ` • Send at ${step.send_time}`}
                  </div>
                )}
              </div>

              <Badge variant="outline" className="text-xs">
                {step.type === 'email' ? 'Email' : 'Message'}
              </Badge>

              <Button 
                variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600"
                onClick={e => { e.stopPropagation(); removeStep(step.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t p-4 space-y-4 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                    <Select value={step.type} onValueChange={v => updateStep(step.id, { type: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="message">In-App Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Template</label>
                    <Select 
                      value={step.template_id || 'none'} 
                      onValueChange={v => v !== 'none' ? applyTemplate(step.id, v) : updateStep(step.id, { template_id: '' })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template</SelectItem>
                        {templates.filter(t => t.type === step.type).map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              {t.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {index > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Delay (days)</label>
                      <Input 
                        type="number" min={0} value={step.delay_days || 0}
                        onChange={e => updateStep(step.id, { delay_days: parseInt(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">+ Hours</label>
                      <Input 
                        type="number" min={0} max={23} value={step.delay_hours || 0}
                        onChange={e => updateStep(step.id, { delay_hours: parseInt(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Send Time</label>
                      <Input 
                        type="time" value={step.send_time || '09:00'}
                        onChange={e => updateStep(step.id, { send_time: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  </div>
                )}

                {step.type === 'email' && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Subject Line</label>
                    <Input 
                      placeholder="e.g. Hey {{name}}, quick question..."
                      value={step.subject || ''}
                      onChange={e => updateStep(step.id, { subject: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Use {'{{name}}'}, {'{{company}}'}, {'{{domain}}'} as placeholders</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Body</label>
                  <Textarea
                    placeholder="Write your message... Use {{name}}, {{company}} for personalization"
                    value={step.body || ''}
                    onChange={e => updateStep(step.id, { body: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addStep}>
        <Plus className="w-4 h-4" />
        Add Step
      </Button>
    </div>
  );
}