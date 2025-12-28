import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircleDot, Plus, Users, MapPin, Search } from "lucide-react";

export default function Circles() {
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', purpose: '' });
  const [manageOpen, setManageOpen] = useState(false);
  const [manageCircle, setManageCircle] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['circles'],
    queryFn: () => base44.entities.Circle.list('-created_date', 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Circle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      setCreateOpen(false);
      setFormData({ name: '', description: '', purpose: '' });
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (circle) => {
      const newMembers = [...(circle.member_ids || []), user.email];
      return base44.entities.Circle.update(circle.id, {
        member_ids: newMembers,
        member_count: newMembers.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] })
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      owner_id: user.email,
      owner_name: user.full_name,
      member_ids: [user.email],
      member_count: 1,
      visibility: 'public'
    });
  };

  const filteredCircles = circles.filter(c =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CircleDot className="w-6 h-6 text-blue-500" />
              Circles & Communities
            </h1>
            <p className="text-slate-500 mt-1">Find your tribe and co-create together</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Create Circle
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search circles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircles.map(circle => {
            const isMember = circle.member_ids?.includes(user?.email);
            return (
              <div key={circle.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all">
                {circle.image_url && (
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <img src={circle.image_url} alt={circle.name} className="w-full h-full object-cover opacity-80" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{circle.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{circle.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {circle.member_count} members
                    </span>
                  </div>
                  {circle.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {circle.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => !isMember && joinMutation.mutate(circle)}
                      disabled={isMember}
                      className={cn(
                        "flex-1 rounded-xl",
                        isMember ? "bg-emerald-100 text-emerald-700" : "bg-violet-600 hover:bg-violet-700"
                      )}
                    >
                      {isMember ? 'Joined' : 'Join Circle'}
                    </Button>
                    {circle.owner_id === user?.email && (
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => { setManageCircle(circle); setManageOpen(true); }}
                      >
                        Manage
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Circle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Circle Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Meditation Collective"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="What brings this circle together?"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell potential members about this circle..."
                  className="mt-2 min-h-24"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700">
                  Create Circle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Circle */}
        <Dialog open={manageOpen} onOpenChange={setManageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Circle</DialogTitle>
            </DialogHeader>
            {manageCircle && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Circle Name</Label>
                  <Input
                    value={manageCircle.name}
                    onChange={(e) => setManageCircle({ ...manageCircle, name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Purpose</Label>
                  <Input
                    value={manageCircle.purpose || ''}
                    onChange={(e) => setManageCircle({ ...manageCircle, purpose: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={manageCircle.description || ''}
                    onChange={(e) => setManageCircle({ ...manageCircle, description: e.target.value })}
                    className="mt-2 min-h-24"
                  />
                </div>
                <div>
                  <Label>Add member by email</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="name@example.com" />
                    <Button
                      onClick={async () => {
                        if (!newMemberEmail) return;
                        const next = Array.from(new Set([...(manageCircle.member_ids || []), newMemberEmail]));
                        await base44.entities.Circle.update(manageCircle.id, { member_ids: next, member_count: next.length });
                        setNewMemberEmail('');
                        setManageCircle({ ...manageCircle, member_ids: next, member_count: next.length });
                        // refresh
                        const fresh = await base44.entities.Circle.list('-created_date', 50);
                        queryClient.setQueryData(['circles'], fresh);
                      }}
                      className="rounded-xl bg-violet-600 hover:bg-violet-700"
                    >Invite</Button>
                  </div>
                </div>
                <div>
                  <Label>Members</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                    {(manageCircle.member_ids || []).map((m) => (
                      <div key={m} className="flex items-center justify-between p-2 rounded-lg border">
                        <span className="text-sm text-slate-600">{m}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const next = (manageCircle.member_ids || []).filter(x => x !== m);
                            await base44.entities.Circle.update(manageCircle.id, { member_ids: next, member_count: next.length });
                            setManageCircle({ ...manageCircle, member_ids: next, member_count: next.length });
                            const fresh = await base44.entities.Circle.list('-created_date', 50);
                            queryClient.setQueryData(['circles'], fresh);
                          }}
                        >Remove</Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setManageOpen(false)}>Close</Button>
                  <Button
                    className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
                    onClick={async () => {
                      await base44.entities.Circle.update(manageCircle.id, {
                        name: manageCircle.name,
                        purpose: manageCircle.purpose,
                        description: manageCircle.description
                      });
                      const fresh = await base44.entities.Circle.list('-created_date', 50);
                      queryClient.setQueryData(['circles'], fresh);
                      setManageOpen(false);
                    }}
                  >Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}