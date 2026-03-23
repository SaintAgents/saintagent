import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Zap, Bot, Pencil, Trash2, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Keyword Match' },
  { value: 'intent', label: 'Detected Intent' },
  { value: 'first_message', label: 'First Message' },
  { value: 'after_hours', label: 'After Hours' },
  { value: 'sentiment', label: 'Sentiment' },
  { value: 'always', label: 'Always (Fallback)' },
];

export default function WAAutoReplyRules({ rules = [] }) {
  const [editRule, setEditRule] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.WAAutoReplyRule.update(data.id, data);
      }
      return base44.entities.WAAutoReplyRule.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waRules'] });
      setEditRule(null);
      setShowCreate(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WAAutoReplyRule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['waRules'] })
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.WAAutoReplyRule.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['waRules'] })
  });

  const sorted = [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const formData = editRule || { name: '', trigger_type: 'keyword', trigger_value: '', response_template: '', use_ai: false, ai_instructions: '', require_approval: false, confidence_threshold: 80, is_active: true, priority: 0 };

  const RuleForm = ({ data, onSave }) => {
    const [form, setForm] = useState(data);
    return (
      <div className="space-y-4">
        <div>
          <Label>Rule Name</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pricing Inquiry" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Trigger Type</Label>
            <Select value={form.trigger_type} onValueChange={v => setForm({ ...form, trigger_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trigger Value</Label>
            <Input value={form.trigger_value || ''} onChange={e => setForm({ ...form, trigger_value: e.target.value })} placeholder="keyword or condition" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.use_ai} onCheckedChange={v => setForm({ ...form, use_ai: v })} />
          <Label>Use AI to generate response</Label>
        </div>
        {form.use_ai ? (
          <div>
            <Label>AI Instructions</Label>
            <Textarea value={form.ai_instructions || ''} onChange={e => setForm({ ...form, ai_instructions: e.target.value })} placeholder="Instructions for the AI when generating reply..." rows={3} />
          </div>
        ) : (
          <div>
            <Label>Response Template</Label>
            <Textarea value={form.response_template || ''} onChange={e => setForm({ ...form, response_template: e.target.value })} placeholder="Static reply text..." rows={3} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <Switch checked={form.require_approval} onCheckedChange={v => setForm({ ...form, require_approval: v })} />
            <Label>Require human approval</Label>
          </div>
          <div>
            <Label>Priority (higher = first)</Label>
            <Input type="number" value={form.priority || 0} onChange={e => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <Button onClick={() => onSave(form)} disabled={!form.name} className="w-full bg-violet-600 hover:bg-violet-700">
          {form.id ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" /> Auto-Reply Rules
        </h3>
        <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Add Rule
        </Button>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No auto-reply rules yet. Create one to get started.</p>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(rule => (
          <div key={rule.id} className={cn("bg-white rounded-lg border p-4 flex items-center gap-3",
            !rule.is_active && "opacity-50"
          )}>
            <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-slate-900 text-sm">{rule.name}</p>
                <Badge variant="outline" className="text-[10px]">{rule.trigger_type}</Badge>
                {rule.use_ai && <Badge className="bg-violet-100 text-violet-700 text-[10px]">AI</Badge>}
                {rule.require_approval && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Review</Badge>}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {rule.trigger_value ? `Trigger: "${rule.trigger_value}"` : 'No specific trigger'}
                {rule.times_triggered > 0 && ` • Used ${rule.times_triggered}x`}
              </p>
            </div>
            <Switch
              checked={rule.is_active}
              onCheckedChange={v => toggleMutation.mutate({ id: rule.id, is_active: v })}
            />
            <Button variant="ghost" size="icon" onClick={() => setEditRule(rule)} className="h-8 w-8">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rule.id)} className="h-8 w-8 text-red-500 hover:text-red-700">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate || !!editRule} onOpenChange={v => { if (!v) { setShowCreate(false); setEditRule(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRule ? 'Edit Rule' : 'New Auto-Reply Rule'}</DialogTitle>
          </DialogHeader>
          <RuleForm data={formData} onSave={d => saveMutation.mutate(d)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}