import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CircleManageModal({ open, onOpenChange, circle, currentUser }) {
  const queryClient = useQueryClient();
  const [local, setLocal] = React.useState(circle || {});
  const [newMember, setNewMember] = React.useState("");

  React.useEffect(() => setLocal(circle || {}), [circle]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Circle.update(circle.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["circles"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Circle.delete(circle.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      onOpenChange(false);
    },
  });

  if (!circle) return null;
  const isOwner = circle.owner_id === currentUser?.email;

  const handleSave = () => {
    const tags = typeof local.tags === "string" ? local.tags.split(",").map((t) => t.trim()).filter(Boolean) : local.tags;
    updateMutation.mutate({
      name: local.name,
      purpose: local.purpose,
      description: local.description,
      tags,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl flex-1">Close</Button>
              {isOwner && (
                <Button onClick={handleSave} className="rounded-xl flex-1 bg-violet-600 hover:bg-violet-700">Save Changes</Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600">Add member by email</label>
                <Input className="mt-2" placeholder="user@example.com" value={newMember} onChange={(e) => setNewMember(e.target.value)} />
              </div>
              {isOwner && (
                <Button onClick={handleAddMember} className="rounded-xl bg-violet-600 hover:bg-violet-700">Add</Button>
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
                      <Button variant="outline" size="sm" className="rounded-lg" onClick={() => handleRemove(m)}>Remove</Button>
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
                <Button variant="destructive" className="w-full rounded-xl" onClick={() => deleteMutation.mutate()}>Delete Circle</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}