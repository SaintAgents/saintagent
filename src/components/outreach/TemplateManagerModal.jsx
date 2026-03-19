import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FileText, Mail, MessageSquare, Save, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'introduction', label: 'Introduction' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'value_add', label: 'Value Add' },
  { value: 'meeting_request', label: 'Meeting Request' },
  { value: 'closing', label: 'Closing' },
  { value: 'custom', label: 'Custom' },
];

export default function TemplateManagerModal({ open, onClose, currentUserId }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'email', subject: '', body: '', category: 'custom' });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['outreachTemplates', currentUserId],
    queryFn: () => base44.entities.OutreachTemplate.filter({ owner_id: currentUserId }),
    enabled: !!currentUserId && open,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, owner_id: currentUserId };
      if (editing) return base44.entities.OutreachTemplate.update(editing, payload);
      return base44.entities.OutreachTemplate.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreachTemplates'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OutreachTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreachTemplates'] }),
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', type: 'email', subject: '', body: '', category: 'custom' });
  };

  const startEdit = (template) => {
    setEditing(template.id);
    setForm({
      title: template.title || '',
      type: template.type || 'email',
      subject: template.subject || '',
      body: template.body || '',
      category: template.category || 'custom',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Outreach Templates</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
          {/* Template List */}
          <div className="col-span-2 border-r pr-4">
            <Button variant="outline" size="sm" className="w-full gap-1.5 mb-3" onClick={resetForm}>
              <Plus className="w-4 h-4" /> New Template
            </Button>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`p-2 rounded-lg cursor-pointer text-sm hover:bg-slate-50 ${editing === t.id ? 'bg-violet-50 border border-violet-200' : ''}`}
                    onClick={() => startEdit(t)}
                  >
                    <div className="flex items-center gap-2">
                      {t.type === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" /> : <MessageSquare className="w-3.5 h-3.5 text-violet-500 shrink-0" />}
                      <span className="font-medium truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px]">{t.category || 'custom'}</Badge>
                      {t.usage_count > 0 && <span className="text-[10px] text-slate-400">Used {t.usage_count}x</span>}
                    </div>
                  </div>
                ))}
                {templates.length === 0 && !isLoading && (
                  <p className="text-xs text-slate-500 text-center py-4">No templates yet</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Edit Form */}
          <div className="col-span-3 space-y-3">
            <Input
              placeholder="Template name *"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.type === 'email' && (
              <Input
                placeholder="Subject line (supports {{name}}, {{company}})"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            )}
            <Textarea
              placeholder="Template body... Use {{name}}, {{company}}, {{domain}} for personalization"
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              className="min-h-[200px]"
            />
            <p className="text-[10px] text-slate-400">
              Placeholders: {'{{name}}'}, {'{{company}}'}, {'{{domain}}'}, {'{{role}}'}
            </p>
            <div className="flex items-center justify-between">
              {editing && (
                <Button variant="ghost" size="sm" className="text-red-500 gap-1" onClick={() => { deleteMutation.mutate(editing); resetForm(); }}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {editing && <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>}
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 gap-1.5"
                  disabled={!form.title.trim() || !form.body.trim() || saveMutation.isPending}
                  onClick={() => saveMutation.mutate(form)}
                >
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Save Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}