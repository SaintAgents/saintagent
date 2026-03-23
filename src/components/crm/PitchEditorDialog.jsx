import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Loader2, Save, X, Tag, Plus, ChevronDown, Wand2, MessageSquare, Handshake, TrendingUp, Heart, RefreshCw, UserPlus, Megaphone, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  { value: 'cold_pitch', label: 'Cold Pitch' },
  { value: 'warm_pitch', label: 'Warm Pitch' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'investor', label: 'Investor' },
  { value: 'referral', label: 'Referral' },
  { value: 'nurture', label: 'Nurture' },
  { value: 're_engagement', label: 'Re-engagement' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'custom', label: 'Custom' },
];

const TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-Time', desc: 'Use once per contact' },
  { value: 'repeat_sequence', label: 'Repeat Sequence', desc: 'Reuse across multiple contacts' },
  { value: 'drip', label: 'Drip Campaign', desc: 'Part of multi-step outreach' },
];

const PLACEHOLDERS = [
  '{name}', '{first_name}', '{company}', '{role}', '{domain}', '{your_name}', '{topic}', '{value_prop}'
];

export default function PitchEditorDialog({ open, onClose, template, currentUserId }) {
  const [form, setForm] = useState({
    name: '', subject: '', body: '', category: 'custom', pitch_type: 'one_time', tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name || '',
        subject: template.subject || '',
        body: template.body || '',
        category: template.category || 'custom',
        pitch_type: template.pitch_type || 'one_time',
        tags: template.tags || [],
      });
    } else {
      setForm({ name: '', subject: '', body: '', category: 'custom', pitch_type: 'one_time', tags: [] });
    }
    setTagInput('');
  }, [template, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const placeholders = PLACEHOLDERS.filter(p => form.body.includes(p) || form.subject.includes(p));
      const data = { ...form, placeholders_used: placeholders, owner_id: currentUserId };
      if (template?.id) {
        await base44.entities.CRMEmailTemplate.update(template.id, data);
      } else {
        await base44.entities.CRMEmailTemplate.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitchTemplates'] });
      onClose();
    }
  });

  const AI_SUGGESTIONS = [
    { id: 'cold_intro', label: 'Cold Introduction', desc: 'First contact with a new lead', icon: UserPlus, category: 'cold_pitch' },
    { id: 'warm_followup', label: 'Warm Follow-Up', desc: 'After an initial meeting or call', icon: MessageSquare, category: 'warm_pitch' },
    { id: 'partnership_proposal', label: 'Partnership Proposal', desc: 'Strategic collaboration pitch', icon: Handshake, category: 'partnership' },
    { id: 'investor_pitch', label: 'Investor Pitch', desc: 'Funding or investment ask', icon: DollarSign, category: 'investor' },
    { id: 'referral_ask', label: 'Referral Request', desc: 'Ask for an intro or referral', icon: Heart, category: 'referral' },
    { id: 're_engage', label: 'Re-engagement', desc: 'Reconnect with a cold contact', icon: RefreshCw, category: 're_engagement' },
    { id: 'value_offer', label: 'Value-First Offer', desc: 'Lead with free value or insight', icon: TrendingUp, category: 'nurture' },
    { id: 'announcement', label: 'News / Announcement', desc: 'Share an update or launch', icon: Megaphone, category: 'custom' },
    { id: 'custom_ai', label: 'Custom from Current Fields', desc: 'Generate based on what you\'ve typed', icon: Wand2, category: null },
  ];

  const generateAI = async (suggestion) => {
    setAiMenuOpen(false);
    setGenerating(true);

    // If a suggestion has a category, update the form category
    if (suggestion?.category) {
      setForm(prev => ({ ...prev, category: suggestion.category }));
    }

    const styleContext = suggestion?.id === 'custom_ai'
      ? `Based on the user's existing input:
Name: ${form.name || 'not set'}
Category: ${form.category}
Type: ${form.pitch_type}
Current subject: ${form.subject || 'none'}
Current body: ${form.body || 'none'}

Improve and expand on what they have, or generate fresh if empty.`
      : `Style: ${suggestion?.label || 'Professional pitch'}
Description: ${suggestion?.desc || ''}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert email copywriter. Generate a high-converting email pitch template.

${styleContext}

Category: ${suggestion?.category || form.category}
Pitch Type: ${form.pitch_type}
${form.name ? `Purpose/Name: ${form.name}` : ''}

IMPORTANT: Use these placeholders in the email where appropriate:
- {name} or {first_name} for recipient's name
- {company} for their company
- {role} for their role
- {domain} for their industry
- {your_name} for the sender
- {topic} for the main topic
- {value_prop} for the value proposition

Requirements:
1. Catchy, specific subject line (not generic)
2. Strong opening hook (first line must grab attention)
3. Clear value proposition in 1-2 sentences
4. Social proof or credibility element if possible
5. Specific, easy call to action
6. Professional but conversational tone
7. Under 180 words for the body
8. Include a compelling pitch name

Return as JSON with name, subject, and body fields.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "A short descriptive name for this pitch template" },
          subject: { type: "string", description: "The email subject line" },
          body: { type: "string", description: "The full email body" }
        }
      }
    });

    if (result) {
      setForm(prev => ({
        ...prev,
        name: prev.name || result.name || '',
        subject: result.subject || prev.subject,
        body: result.body || prev.body,
      }));
    }
    setGenerating(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const insertPlaceholder = (ph) => {
    setForm(prev => ({ ...prev, body: prev.body + ph }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Pitch Template' : 'Create New Pitch Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label>Pitch Name</Label>
            <Input
              placeholder="e.g., Partnership Cold Outreach"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pitch Type</Label>
              <Select value={form.pitch_type} onValueChange={v => setForm(prev => ({ ...prev, pitch_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <span className="font-medium">{t.label}</span>
                        <span className="text-xs text-slate-500 ml-2">{t.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label>Subject Line</Label>
            <Input
              placeholder="Email subject with {placeholders}..."
              value={form.subject}
              onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Placeholders */}
          <div>
            <Label className="text-xs text-slate-500">Insert Placeholder:</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PLACEHOLDERS.map(ph => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => insertPlaceholder(ph)}
                  className="px-2 py-0.5 text-xs rounded bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors"
                >
                  {ph}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Email Body</Label>
              <Popover open={aiMenuOpen} onOpenChange={setAiMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    disabled={generating}
                  >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                    AI Generate
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-1.5">
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-semibold text-slate-700">Choose a pitch style</p>
                    <p className="text-xs text-slate-400">AI will generate a full pitch template</p>
                  </div>
                  <div className="space-y-0.5 max-h-72 overflow-y-auto">
                    {AI_SUGGESTIONS.map(s => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => generateAI(s)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-violet-50 transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="w-4 h-4 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{s.label}</p>
                            <p className="text-xs text-slate-500 truncate">{s.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              placeholder="Write your pitch email..."
              value={form.body}
              onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
              className="min-h-[220px] font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs gap-1 pr-1">
                    <Tag className="w-3 h-3" /> {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name.trim() || !form.subject.trim() || !form.body.trim() || saveMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span className="text-white">{template ? 'Update Pitch' : 'Save Pitch'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}