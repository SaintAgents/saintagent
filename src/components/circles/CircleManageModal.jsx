import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CircleSettingsFields from '@/components/circles/CircleSettingsFields';

const splitList = (value) => Array.isArray(value) ? value : (value || '').split(',').map((item) => item.trim()).filter(Boolean);

export default function CircleManageModal({ open, onOpenChange, circle, currentUser }) {
  const queryClient = useQueryClient();
  const [local, setLocal] = React.useState(circle || {});
  const [newMember, setNewMember] = React.useState("");

  React.useEffect(() => setLocal(circle || {}), [circle]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Circle.update(circle.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Circle.delete(circle.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      onOpenChange(false);
    },
  });

  const isOwner = !!currentUser?.email && circle?.owner_id === currentUser.email;
  if (!open || !isOwner) return null;
  const busy = updateMutation.isPending || deleteMutation.isPending;
  const handleClose = (nextOpen) => {
    if (busy) return;
    updateMutation.reset();
    deleteMutation.reset();
    setNewMember('');
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!local.name?.trim() || busy) return;
    updateMutation.mutate({
      name: local.name.trim(),
      purpose: local.purpose || '',
      description: local.description || '',
      tags: splitList(local.tags),
      category: local.category || 'social',
      visibility: local.visibility || 'public',
      meeting_frequency: local.meeting_frequency || 'as_needed',
      values: splitList(local.values),
      interests: splitList(local.interests),
      chat_enabled: local.chat_enabled ?? true,
    });
  };

  const handleAddMember = () => {
    if (!newMember) return;
    const setMembers = Array.from(new Set([...(circle.member_ids || []), newMember]));
    updateMutation.mutate({ member_ids: setMembers, member_count: setMembers.length });
    setNewMember("");
  };

  const handleRemove = (memberId) => {
    const setMembers = (circle.member_ids || []).filter((id) => id !== memberId);
    updateMutation.mutate({ member_ids: setMembers, member_count: setMembers.length });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-group-contrast overlayClassName="z-[60]" className="z-[61] max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Circle</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Name</label>
              <Input className="mt-2" value={local.name || ""} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Purpose</label>
              <Input className="mt-2" value={local.purpose || ""} onChange={(e) => setLocal({ ...local, purpose: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Description</label>
              <Textarea className="mt-2 min-h-24" value={local.description || ""} onChange={(e) => setLocal({ ...local, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Tags (comma-separated)</label>
              <Input className="mt-2" value={Array.isArray(local.tags) ? local.tags.join(", ") : (local.tags || "")} onChange={(e) => setLocal({ ...local, tags: e.target.value })} />
            </div>
            <CircleSettingsFields local={local} onChange={(field, value) => setLocal((draft) => ({ ...draft, [field]: value }))} />
            <div className="flex gap-2">
              <Button variant="outline" disabled={busy} onClick={() => handleClose(false)} className="rounded-xl flex-1">Close</Button>
              <Button onClick={handleSave} disabled={busy || !local.name?.trim()} className="rounded-xl flex-1">{updateMutation.isPending ? 'Saving…' : 'Save Changes'}</Button>
            </div>
            {updateMutation.isSuccess && <p role="status" className="text-sm text-muted-foreground">{updateMutation.variables?.name ? 'Circle settings saved.' : 'Members updated.'}</p>}
            {(updateMutation.isError || deleteMutation.isError) && <p role="alert" className="text-sm text-destructive">Couldn’t update the circle. Please try again.</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600">Add member by email</label>
                <Input className="mt-2" placeholder="user@example.com" value={newMember} onChange={(e) => setNewMember(e.target.value)} />
              </div>
              {isOwner && (
                <Button onClick={handleAddMember} disabled={busy || !newMember.trim()} className="rounded-xl bg-violet-600 hover:bg-violet-700">Add</Button>
              )}
            </div>

            <div className="border rounded-xl p-3">
              <p className="text-sm font-medium text-slate-700 mb-2">Members</p>
              <div className="space-y-2 max-h-56 overflow-auto">
                {(circle.member_ids || []).map((m) => (
                  <div key={m} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7"><AvatarImage src={""} /><AvatarFallback>{m?.charAt(0)?.toUpperCase()}</AvatarFallback></Avatar>
                      <span className="text-sm text-slate-700">{m}</span>
                    </div>
                    {isOwner && m !== currentUser?.email && (
                      <Button variant="outline" size="sm" className="rounded-lg" disabled={busy} onClick={() => handleRemove(m)}>Remove</Button>
                    )}
                  </div>
                ))}
                {(circle.member_ids || []).length === 0 && (
                  <p className="text-sm text-slate-500">No members yet.</p>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="pt-2">
                <Button variant="destructive" className="w-full rounded-xl" disabled={busy} onClick={() => { if (window.confirm(`Delete ${circle.name}? This cannot be undone.`)) deleteMutation.mutate(); }}>Delete Circle</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}