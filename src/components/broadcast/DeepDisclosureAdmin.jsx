import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, Trash2, Pencil, Mic, Clock, Calendar as CalendarIcon, 
  Link, Upload, Loader2, X, ExternalLink, Radio, Eye
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700',
  ended: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-orange-100 text-orange-700',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  scheduled_time: '',
  duration_minutes: 60,
  status: 'scheduled',
  recording_url: '',
  live_stream_url: '',
  cover_image_url: '',
  topics: '',
  guest_speakers: [],
};

export default function DeepDisclosureAdmin() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [guestName, setGuestName] = useState('');
  const [guestTitle, setGuestTitle] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['dd-episodes-admin'],
    queryFn: async () => {
      const all = await base44.entities.Broadcast.filter({ broadcast_type: 'podcast' }, '-scheduled_time', 100);
      return all.filter(b =>
        b.title?.toLowerCase().includes('deep disclosure') ||
        b.topics?.some(t => t.toLowerCase().includes('deep disclosure'))
      );
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const me = myProfile?.[0];
      const topicsArr = typeof data.topics === 'string'
        ? data.topics.split(',').map(t => t.trim()).filter(Boolean)
        : data.topics || [];
      if (!topicsArr.some(t => t.toLowerCase().includes('deep disclosure'))) {
        topicsArr.unshift('Deep Disclosure');
      }
      const payload = {
        title: data.title,
        description: data.description,
        scheduled_time: data.scheduled_time,
        duration_minutes: data.duration_minutes,
        status: data.status,
        recording_url: data.recording_url || '',
        live_stream_url: data.live_stream_url || '',
        cover_image_url: data.cover_image_url || '',
        topics: topicsArr,
        guest_speakers: data.guest_speakers || [],
        broadcast_type: 'podcast',
        host_id: currentUser.email,
        host_name: currentUser.full_name || me?.display_name || '',
        host_avatar: me?.avatar_url || '',
      };
      if (editingId) {
        await base44.entities.Broadcast.update(editingId, payload);
      } else {
        await base44.entities.Broadcast.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dd-episodes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      toast.success(editingId ? 'Episode updated' : 'Episode created');
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Broadcast.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dd-episodes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      toast.success('Episode deleted');
      setDeleteConfirm(null);
    },
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGuestName('');
    setGuestTitle('');
  };

  const openEdit = (ep) => {
    setEditingId(ep.id);
    setForm({
      title: ep.title || '',
      description: ep.description || '',
      scheduled_time: ep.scheduled_time ? ep.scheduled_time.slice(0, 16) : '',
      duration_minutes: ep.duration_minutes || 60,
      status: ep.status || 'scheduled',
      recording_url: ep.recording_url || '',
      live_stream_url: ep.live_stream_url || '',
      cover_image_url: ep.cover_image_url || '',
      topics: (ep.topics || []).join(', '),
      guest_speakers: ep.guest_speakers || [],
    });
    setFormOpen(true);
  };

  const addGuest = () => {
    if (!guestName.trim()) return;
    setForm(f => ({
      ...f,
      guest_speakers: [...(f.guest_speakers || []), { name: guestName.trim(), title: guestTitle.trim() }]
    }));
    setGuestName('');
    setGuestTitle('');
  };

  const removeGuest = (idx) => {
    setForm(f => ({ ...f, guest_speakers: f.guest_speakers.filter((_, i) => i !== idx) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, cover_image_url: file_url }));
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-5 h-5 text-violet-600" />
            Deep Disclosure Episodes
          </h3>
          <p className="text-sm text-slate-500">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</p>
        </div>
        <Button className="gap-2 bg-violet-600 hover:bg-violet-700" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setFormOpen(true); }}>
          <Plus className="w-4 h-4" /> New Episode
        </Button>
      </div>

      {/* Episodes List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-slate-50 border">
          <Mic className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No episodes yet. Create the first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map(ep => (
            <div key={ep.id} className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-sm transition-shadow">
              {ep.cover_image_url ? (
                <img src={ep.cover_image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6 text-violet-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{ep.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={cn('text-xs', STATUS_STYLES[ep.status] || STATUS_STYLES.scheduled)}>
                    {ep.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {ep.scheduled_time ? format(parseISO(ep.scheduled_time), 'MMM d, yyyy h:mm a') : '—'}
                  </span>
                  <span className="text-xs text-slate-400">{ep.duration_minutes}m</span>
                  {ep.recording_url && <Link className="w-3 h-3 text-green-500" />}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ep)}>
                  <Pencil className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(ep)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) closeForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-violet-600" />
              {editingId ? 'Edit Episode' : 'New Episode'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input placeholder="Deep Disclosure — Episode Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Episode summary..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Scheduled Date/Time *</Label>
                <Input type="datetime-local" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Duration (min)</Label>
                <Select value={String(form.duration_minutes)} onValueChange={v => setForm(f => ({ ...f, duration_minutes: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60, 90, 120].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Live Stream URL</Label>
              <Input placeholder="https://youtube.com/live/..." value={form.live_stream_url} onChange={e => setForm(f => ({ ...f, live_stream_url: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Recording URL</Label>
              <Input placeholder="https://youtube.com/watch?v=..." value={form.recording_url} onChange={e => setForm(f => ({ ...f, recording_url: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Topics (comma-separated)</Label>
              <Input placeholder="Deep Disclosure, truth, consciousness" value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))} />
            </div>

            {/* Cover Image */}
            <div className="space-y-1">
              <Label>Cover Image</Label>
              {form.cover_image_url ? (
                <div className="relative">
                  <img src={form.cover_image_url} alt="" className="w-full h-32 object-cover rounded-lg border" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setForm(f => ({ ...f, cover_image_url: '' }))}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="URL or upload" value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} className="flex-1" />
                  <Button variant="outline" disabled={uploadingImage} onClick={() => document.getElementById('dd-admin-cover-upload')?.click()} className="gap-1">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                  <input id="dd-admin-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              )}
            </div>

            {/* Guest Speakers */}
            <div className="space-y-2">
              <Label>Guest Speakers</Label>
              {form.guest_speakers?.length > 0 && (
                <div className="space-y-1">
                  {form.guest_speakers.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span className="font-medium">{g.name}</span>
                      {g.title && <span className="text-slate-500">— {g.title}</span>}
                      <button onClick={() => removeGuest(i)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input placeholder="Name" value={guestName} onChange={e => setGuestName(e.target.value)} className="flex-1" />
                <Input placeholder="Title (optional)" value={guestTitle} onChange={e => setGuestTitle(e.target.value)} className="flex-1" />
                <Button variant="outline" size="sm" onClick={addGuest} disabled={!guestName.trim()}>Add</Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button
                className="bg-violet-600 hover:bg-violet-700 gap-2"
                disabled={!form.title.trim() || !form.scheduled_time || saveMutation.isPending}
                onClick={() => saveMutation.mutate(form)}
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                {editingId ? 'Save Changes' : 'Create Episode'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Episode?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold">"{deleteConfirm?.title}"</span>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}