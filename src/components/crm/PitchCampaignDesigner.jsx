import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, Star, StarOff, Trash2, Pencil, Copy, Send, Search, 
  FileText, Sparkles, Loader2, Tag, Clock, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import PitchTemplateCard from './PitchTemplateCard';
import PitchEditorDialog from './PitchEditorDialog';

const CATEGORY_OPTIONS = [
  { value: 'cold_pitch', label: 'Cold Pitch', color: 'bg-blue-100 text-blue-700' },
  { value: 'warm_pitch', label: 'Warm Pitch', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'follow_up', label: 'Follow Up', color: 'bg-amber-100 text-amber-700' },
  { value: 'partnership', label: 'Partnership', color: 'bg-violet-100 text-violet-700' },
  { value: 'investor', label: 'Investor', color: 'bg-rose-100 text-rose-700' },
  { value: 'referral', label: 'Referral', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'nurture', label: 'Nurture', color: 'bg-pink-100 text-pink-700' },
  { value: 're_engagement', label: 'Re-engagement', color: 'bg-orange-100 text-orange-700' },
  { value: 'welcome', label: 'Welcome', color: 'bg-green-100 text-green-700' },
  { value: 'custom', label: 'Custom', color: 'bg-slate-100 text-slate-700' },
];

const PITCH_TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-Time', desc: 'Single use pitch' },
  { value: 'repeat_sequence', label: 'Repeat Sequence', desc: 'Reusable pitch template' },
  { value: 'drip', label: 'Drip Campaign', desc: 'Part of a multi-step campaign' },
];

export default function PitchCampaignDesigner({ currentUserId }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['pitchTemplates', currentUserId],
    queryFn: () => base44.entities.CRMEmailTemplate.filter({ owner_id: currentUserId }, '-created_date', 200),
    enabled: !!currentUserId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CRMEmailTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pitchTemplates'] })
  });

  const toggleFavMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.CRMEmailTemplate.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pitchTemplates'] })
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template) => {
      const { id, created_date, updated_date, created_by, ...data } = template;
      await base44.entities.CRMEmailTemplate.create({
        ...data,
        name: `${data.name} (Copy)`,
        times_used: 0,
        is_favorite: false,
        last_used_at: null
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pitchTemplates'] })
  });

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const filtered = templates.filter(t => {
    const matchSearch = !search || 
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    const matchType = typeFilter === 'all' || t.pitch_type === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const favorites = filtered.filter(t => t.is_favorite);
  const others = filtered.filter(t => !t.is_favorite);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-600" />
            Pitch Campaign Designer
          </h2>
          <p className="text-sm text-slate-500">Create and save reusable pitch templates for your outreach</p>
        </div>
        <Button onClick={handleNew} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white">New Pitch</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search pitches..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PITCH_TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="pt-4">
            <p className="text-sm text-violet-600 font-medium">Total Pitches</p>
            <p className="text-2xl font-bold text-violet-900">{templates.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-600 font-medium">Favorites</p>
            <p className="text-2xl font-bold text-amber-900">{templates.filter(t => t.is_favorite).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-600 font-medium">Repeat Sequences</p>
            <p className="text-2xl font-bold text-blue-900">{templates.filter(t => t.pitch_type === 'repeat_sequence').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-4">
            <p className="text-sm text-emerald-600 font-medium">Total Uses</p>
            <p className="text-2xl font-bold text-emerald-900">{templates.reduce((sum, t) => sum + (t.times_used || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading pitches...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No pitch templates yet</p>
          <p className="text-sm text-slate-500 mb-4">Create your first reusable pitch to streamline outreach</p>
          <Button onClick={handleNew} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Create Pitch
          </Button>
        </Card>
      ) : (
        <>
          {favorites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 mb-3">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Favorites
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(t => (
                  <PitchTemplateCard
                    key={t.id}
                    template={t}
                    onEdit={() => handleEdit(t)}
                    onDelete={() => deleteMutation.mutate(t.id)}
                    onToggleFav={() => toggleFavMutation.mutate({ id: t.id, is_favorite: t.is_favorite })}
                    onDuplicate={() => duplicateMutation.mutate(t)}
                  />
                ))}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              {favorites.length > 0 && (
                <h3 className="text-sm font-semibold text-slate-600 mb-3">All Pitches</h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map(t => (
                  <PitchTemplateCard
                    key={t.id}
                    template={t}
                    onEdit={() => handleEdit(t)}
                    onDelete={() => deleteMutation.mutate(t.id)}
                    onToggleFav={() => toggleFavMutation.mutate({ id: t.id, is_favorite: t.is_favorite })}
                    onDuplicate={() => duplicateMutation.mutate(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <PitchEditorDialog
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingTemplate(null); }}
        template={editingTemplate}
        currentUserId={currentUserId}
      />
    </div>
  );
}