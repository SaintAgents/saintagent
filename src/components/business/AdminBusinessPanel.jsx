import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash2, Shield, Star, StarOff, Search, Eye, Edit, CheckCircle,
  XCircle, AlertTriangle, Globe, Users, MapPin, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
  { value: 'featured', label: 'Featured', color: 'bg-purple-100 text-purple-700' },
];

const VERIFICATION_OPTIONS = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'basic', label: 'Basic' },
  { value: 'verified', label: 'Verified' },
  { value: 'premium', label: 'Premium' },
];

const CATEGORIES = {
  healing_wellness: 'Healing & Wellness',
  conscious_technology: 'Conscious Tech',
  sustainable_living: 'Sustainable Living',
  spiritual_education: 'Spiritual Education',
  sacred_arts: 'Sacred Arts',
  regenerative_finance: 'Regen Finance',
  fintech: 'Fintech',
  financial_services: 'Financial Services',
  community_building: 'Community Building',
  earth_stewardship: 'Earth Stewardship',
  media_publishing: 'Media & Publishing',
  other: 'Other'
};

export default function AdminBusinessPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editVerification, setEditVerification] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['adminBusinessEntities'],
    queryFn: () => base44.entities.BusinessEntity5D.list('-created_date', 200),
    staleTime: 30000,
  });

  const filtered = entities.filter(e => {
    const q = search.toLowerCase();
    const textMatch = !q || e.name?.toLowerCase().includes(q) || e.owner_id?.toLowerCase().includes(q) || e.owner_name?.toLowerCase().includes(q);
    const statMatch = statusFilter === 'all' || e.status === statusFilter;
    return textMatch && statMatch;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await base44.entities.BusinessEntity5D.delete(deleteTarget.id);
    toast.success(`Deleted "${deleteTarget.name}"`);
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: ['adminBusinessEntities'] });
    queryClient.invalidateQueries({ queryKey: ['businessEntities5D'] });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const updates = {
      status: editStatus,
      verification_level: editVerification,
      is_featured: editFeatured,
    };
    await base44.entities.BusinessEntity5D.update(editTarget.id, updates);
    toast.success(`Updated "${editTarget.name}"`);
    setEditTarget(null);
    queryClient.invalidateQueries({ queryKey: ['adminBusinessEntities'] });
    queryClient.invalidateQueries({ queryKey: ['businessEntities5D'] });
  };

  const openEdit = (entity) => {
    setEditTarget(entity);
    setEditStatus(entity.status || 'pending');
    setEditVerification(entity.verification_level || 'unverified');
    setEditFeatured(!!entity.is_featured);
  };

  const quickToggleFeatured = async (entity) => {
    const newVal = !entity.is_featured;
    await base44.entities.BusinessEntity5D.update(entity.id, { is_featured: newVal });
    toast.success(newVal ? `"${entity.name}" is now featured` : `"${entity.name}" unfeatured`);
    queryClient.invalidateQueries({ queryKey: ['adminBusinessEntities'] });
    queryClient.invalidateQueries({ queryKey: ['businessEntities5D'] });
  };

  const statusBadge = (status) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[1];
    return <Badge className={`${opt.color} text-xs`}>{opt.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border text-center">
          <p className="text-xl font-bold text-slate-800">{entities.length}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-xl font-bold text-emerald-700">{entities.filter(e => e.status === 'active').length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-xl font-bold text-amber-700">{entities.filter(e => e.status === 'pending').length}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
          <p className="text-xl font-bold text-purple-700">{entities.filter(e => e.is_featured).length}</p>
          <p className="text-xs text-slate-500">Featured</p>
        </div>
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
          <p className="text-xl font-bold text-red-700">{entities.filter(e => e.status === 'inactive').length}</p>
          <p className="text-xs text-slate-500">Inactive</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name or owner..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No business entities found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entity => (
            <div key={entity.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:border-violet-200 transition-colors">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={entity.logo_url} />
                <AvatarFallback className="bg-violet-100 text-violet-600 text-sm font-bold">{entity.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 truncate">{entity.name}</p>
                  {statusBadge(entity.status)}
                  {entity.is_featured && <Badge className="bg-amber-100 text-amber-700 text-xs gap-0.5"><Star className="w-3 h-3" />Featured</Badge>}
                  {entity.verification_level && entity.verification_level !== 'unverified' && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs gap-0.5"><Shield className="w-3 h-3" />{entity.verification_level}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{entity.owner_name || entity.owner_id}</span>
                  <span>{CATEGORIES[entity.category] || 'Other'}</span>
                  {entity.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{entity.location}</span>}
                  <span>{entity.team_member_ids?.length || 0} members</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="w-8 h-8" title="View" onClick={() => window.open(createPageUrl('BusinessEntityProfile') + `?id=${entity.id}`, '_blank')}>
                  <Eye className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title={entity.is_featured ? 'Unfeature' : 'Feature'} onClick={() => quickToggleFeatured(entity)}>
                  {entity.is_featured ? <StarOff className="w-4 h-4 text-amber-500" /> : <Star className="w-4 h-4 text-slate-400" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Edit Status" onClick={() => openEdit(entity)}>
                  <Edit className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Delete" onClick={() => setDeleteTarget(entity)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Delete Business Entity
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>"{deleteTarget?.name}"</strong> and all associated data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-violet-600" /> Edit: {editTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Verification Level</label>
              <Select value={editVerification} onValueChange={setEditVerification}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VERIFICATION_OPTIONS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Featured</label>
              <Button
                variant={editFeatured ? "default" : "outline"}
                size="sm"
                className={editFeatured ? "bg-amber-500 hover:bg-amber-600 gap-1" : "gap-1"}
                onClick={() => setEditFeatured(!editFeatured)}
              >
                <Star className="w-3.5 h-3.5" />
                {editFeatured ? 'Featured' : 'Not Featured'}
              </Button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSaveEdit}>
              <CheckCircle className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}