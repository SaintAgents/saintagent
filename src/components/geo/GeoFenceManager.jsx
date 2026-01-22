import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Plus, Trash2, Edit2, Eye, EyeOff, Palette } from "lucide-react";

const ZONE_COLORS = [
  { name: 'Purple', value: '#6366f1' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
];

export default function GeoFenceManager({ 
  onSelectFence, 
  selectedFenceId,
  onCreateFromMap,
  pendingCoordinates,
  onClearPending,
  className 
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editFence, setEditFence] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zone_type: 'custom',
    color: '#6366f1',
    active: true
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: geoFences = [] } = useQuery({
    queryKey: ['geoFences'],
    queryFn: () => base44.entities.GeoFenceZone.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GeoFenceZone.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geoFences'] });
      setCreateOpen(false);
      setFormData({ name: '', description: '', zone_type: 'custom', color: '#6366f1', active: true });
      onClearPending?.();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GeoFenceZone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geoFences'] });
      setEditFence(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GeoFenceZone.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['geoFences'] })
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      owner_id: user?.email,
      coordinates: pendingCoordinates || [],
      is_global: false
    });
  };

  const handleUpdate = () => {
    if (editFence) {
      updateMutation.mutate({
        id: editFence.id,
        data: formData
      });
    }
  };

  const openCreate = () => {
    setFormData({
      name: '',
      description: '',
      zone_type: 'custom',
      color: '#6366f1',
      active: true
    });
    setCreateOpen(true);
  };

  const openEdit = (fence) => {
    setFormData({
      name: fence.name,
      description: fence.description || '',
      zone_type: fence.zone_type,
      color: fence.color || '#6366f1',
      active: fence.active !== false
    });
    setEditFence(fence);
  };

  // My fences vs global
  const myFences = geoFences.filter(f => f.owner_id === user?.email);
  const globalFences = geoFences.filter(f => f.is_global);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-violet-600" />
          Geo-Fences
        </h3>
        <Button size="sm" onClick={openCreate} className="bg-violet-600 hover:bg-violet-700 gap-1">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </div>

      {pendingCoordinates?.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <div className="font-medium">Pending Geo-Fence</div>
          <div>{pendingCoordinates.length} points drawn on map</div>
          <Button size="sm" onClick={openCreate} className="mt-2 bg-amber-600 hover:bg-amber-700">
            Save as Geo-Fence
          </Button>
        </div>
      )}

      <ScrollArea className="h-[300px]">
        {/* My Fences */}
        {myFences.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-slate-500 mb-2">MY GEO-FENCES</div>
            <div className="space-y-2">
              {myFences.map(fence => (
                <FenceCard
                  key={fence.id}
                  fence={fence}
                  isSelected={selectedFenceId === fence.id}
                  onSelect={() => onSelectFence?.(fence)}
                  onEdit={() => openEdit(fence)}
                  onDelete={() => deleteMutation.mutate(fence.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Global Fences */}
        {globalFences.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">GLOBAL ZONES</div>
            <div className="space-y-2">
              {globalFences.map(fence => (
                <FenceCard
                  key={fence.id}
                  fence={fence}
                  isSelected={selectedFenceId === fence.id}
                  onSelect={() => onSelectFence?.(fence)}
                  isGlobal
                />
              ))}
            </div>
          </div>
        )}

        {myFences.length === 0 && globalFences.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No geo-fences yet</p>
            <p className="text-xs mt-1">Draw on the map or create one manually</p>
          </div>
        )}
      </ScrollArea>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Geo-Fence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Zone"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Zone Type</label>
              <Select value={formData.zone_type} onValueChange={v => setFormData({ ...formData, zone_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="treaty_corridor">Treaty Corridor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 mt-1">
                {ZONE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.color === c.value ? "border-slate-900 scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
            {pendingCoordinates?.length > 0 && (
              <div className="p-2 rounded bg-slate-100 text-sm">
                <span className="font-medium">{pendingCoordinates.length}</span> coordinates from map drawing
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.name || createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editFence} onOpenChange={o => !o && setEditFence(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Geo-Fence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Zone Type</label>
              <Select value={formData.zone_type} onValueChange={v => setFormData({ ...formData, zone_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="treaty_corridor">Treaty Corridor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 mt-1">
                {ZONE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.color === c.value ? "border-slate-900 scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFence(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!formData.name || updateMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FenceCard({ fence, isSelected, onSelect, onEdit, onDelete, isGlobal }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isSelected 
          ? "bg-violet-50 border-violet-300 dark:bg-violet-900/30 dark:border-violet-600" 
          : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: fence.color || '#6366f1' }}
          />
          <div>
            <div className="font-medium text-sm">{fence.name}</div>
            {fence.description && (
              <div className="text-xs text-slate-500 line-clamp-1">{fence.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] py-0">
            {fence.zone_type}
          </Badge>
          {fence.active === false && <EyeOff className="w-3 h-3 text-slate-400" />}
        </div>
      </div>
      
      {!isGlobal && (
        <div className="flex gap-1 mt-2">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}