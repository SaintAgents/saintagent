import React, { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NewDirectMessageModal({ open, onClose, onCreated }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: me } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 500),
    staleTime: 60000 // Cache for 1 minute
  });

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().replace(/^@/, ''); // Strip leading @ for handle search
    if (!q) return profiles.filter(p => p.user_id !== me?.email);
    return profiles.filter(p => p.user_id !== me?.email && (
      p.display_name?.toLowerCase().includes(q) ||
      p.handle?.toLowerCase().includes(q) ||
      p.user_id?.toLowerCase().includes(q)
    ));
  }, [profiles, me, debouncedQuery]);

  const startDM = async (targetUserId) => {
    const key = [me.email, targetUserId].sort().join("_");
    const existing = await base44.entities.Conversation.filter({ conversation_key: key });
    let conv = existing?.[0];
    if (!conv) {
      const pick = (uid) => profiles.find(p => p.user_id === uid);
      conv = await base44.entities.Conversation.create({
        type: "direct",
        name: null,
        participant_ids: [me.email, targetUserId],
        participant_names: [pick(me.email)?.display_name || me.email, pick(targetUserId)?.display_name || targetUserId],
        participant_avatars: [pick(me.email)?.avatar_url || "", pick(targetUserId)?.avatar_url || ""],
        conversation_key: key,
        last_message: "",
        is_muted_for: []
      });
    }
    onCreated?.(conv);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Search people..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <ScrollArea className="h-72 border rounded-md p-2">
            <div className="space-y-1">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => startDM(p.user_id)}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-slate-50 text-left"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback className="text-xs">{p.display_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{p.display_name}</div>
                    <div className="text-xs text-slate-500">@{p.handle} • {p.user_id}</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-xs text-slate-400">No users found</div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}