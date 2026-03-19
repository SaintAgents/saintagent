import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Plus, Search, Mail, Eye, Reply, Users, FileText,
  BarChart3, Layers, Send, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SequenceCard from '@/components/outreach/SequenceCard';
import CreateSequenceModal from '@/components/outreach/CreateSequenceModal';
import SequenceDetailModal from '@/components/outreach/SequenceDetailModal';
import TemplateManagerModal from '@/components/outreach/TemplateManagerModal';

export default function OutreachSequences() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [detailSequence, setDetailSequence] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState('sequences');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ['outreachSequences', currentUser?.email],
    queryFn: () => base44.entities.OutreachSequence.filter({ owner_id: currentUser.email }, '-created_date'),
    enabled: !!currentUser?.email,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OutreachSequence.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreachSequences'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (seq) => base44.entities.OutreachSequence.update(seq.id, { status: 'archived' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreachSequences'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (seq) => {
      const { id, created_date, updated_date, ...rest } = seq;
      await base44.entities.OutreachSequence.create({
        ...rest,
        title: `${seq.title} (Copy)`,
        status: 'draft',
        total_sent: 0, total_opened: 0, total_replied: 0, total_bounced: 0,
        contact_ids: [],
        total_enrolled: 0,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreachSequences'] }),
  });

  const filtered = sequences.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpen = (seq) => setDetailSequence(seq);
  const handleEdit = (seq) => { setEditingSequence(seq); setCreateOpen(true); };
  const handleToggle = (seq, status) => toggleMutation.mutate({ id: seq.id, status });

  // Aggregate stats
  const totalEnrolled = sequences.reduce((a, s) => a + (s.total_enrolled || 0), 0);
  const totalSent = sequences.reduce((a, s) => a + (s.total_sent || 0), 0);
  const totalOpened = sequences.reduce((a, s) => a + (s.total_opened || 0), 0);
  const totalReplied = sequences.reduce((a, s) => a + (s.total_replied || 0), 0);
  const overallOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
  const overallReplyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : 0;
  const activeCount = sequences.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-violet-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/CRM" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Outreach Sequences</h1>
          </div>
          <p className="text-white/70 mb-6">Create multi-step outreach campaigns with scheduling and tracking</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Active Sequences', value: activeCount, icon: Layers },
              { label: 'Total Enrolled', value: totalEnrolled, icon: Users },
              { label: 'Messages Sent', value: totalSent, icon: Send },
              { label: 'Opened', value: totalOpened, icon: Eye },
              { label: 'Open Rate', value: `${overallOpenRate}%`, icon: BarChart3 },
              { label: 'Reply Rate', value: `${overallReplyRate}%`, icon: Reply },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-white/70" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-[10px] text-white/60 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search sequences..."
                className="pl-9 w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setTemplatesOpen(true)}>
              <FileText className="w-4 h-4" />
              Templates
            </Button>
            <Button className="gap-2 bg-violet-600 hover:bg-violet-700" onClick={() => { setEditingSequence(null); setCreateOpen(true); }}>
              <Plus className="w-4 h-4" />
              New Sequence
            </Button>
          </div>
        </div>

        {/* Sequence grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                <div className="h-5 w-48 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map(j => <div key={j} className="w-7 h-7 bg-slate-100 rounded-full" />)}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(j => <div key={j} className="h-12 bg-slate-50 rounded" />)}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">
              {search || statusFilter !== 'all' ? 'No sequences match your filters' : 'Create your first outreach sequence'}
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
              Build multi-step email and message sequences to automate your outreach with personalized templates and scheduling.
            </p>
            {!search && statusFilter === 'all' && (
              <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => { setEditingSequence(null); setCreateOpen(true); }}>
                <Plus className="w-4 h-4" /> Create Sequence
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(seq => (
              <SequenceCard
                key={seq.id}
                sequence={seq}
                onOpen={handleOpen}
                onToggleStatus={handleToggle}
                onArchive={archiveMutation.mutate}
                onDuplicate={duplicateMutation.mutate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSequenceModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditingSequence(null); }}
        sequence={editingSequence}
        currentUserId={currentUser?.email}
      />

      <SequenceDetailModal
        open={!!detailSequence}
        onClose={() => setDetailSequence(null)}
        sequence={detailSequence}
        onEdit={handleEdit}
      />

      <TemplateManagerModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        currentUserId={currentUser?.email}
      />
    </div>
  );
}