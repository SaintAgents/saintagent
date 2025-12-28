import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CreateGroupChatModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState({});

  const { data: me } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 500)
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return profiles.filter(p => p.user_id !== me?.email && (
      p.display_name?.toLowerCase().includes(q) ||
      p.handle?.toLowerCase().includes(q) ||
      p.user_id?.toLowerCase().includes(q)
    ));
  }, [profiles, me, query]);

  const toggle = (uid) => setSelected(prev => ({ ...prev, [uid]: !prev[uid] }));

  const handleCreate = async () => {
    const participant_ids = [me.email, ...Object.keys(selected).filter(k => selected[k])];
    if (participant_ids.length < 3) return; // needs at least 3 for a group
    const pick = (uid) => profiles.find(p => p.user_id === uid);
    const participant_names = participant_ids.map(uid => pick(uid)?.display_name || uid);
    const participant_avatars = participant_ids.map(uid => pick(uid)?.avatar_url || "");
    const conv = await base44.entities.Conversation.create({
      type: "group",
      name: name || "New Group",
      participant_ids,
      participant_names,
      participant_avatars,
      last_message: "",
      is_muted_for: []
    });
    onCreated?.(conv);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Search people..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <ScrollArea className="h-64 border rounded-md p-2">
            <div className="space-y-2">
              {filtered.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                  <Checkbox checked={!!selected[p.user_id]} onCheckedChange={() => toggle(p.user_id)} />
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback className="text-xs">{p.display_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{p.display_name}</div>
                    <div className="text-xs text-slate-500">@{p.handle}</div>
                  </div>
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="text-xs text-slate-400">No users found</div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}