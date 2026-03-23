import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, UserPlus } from 'lucide-react';

export default function AddTeamMemberModal({ entity, open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('member');
  const [title, setTitle] = useState('');

  const { data: searchResults = [] } = useQuery({
    queryKey: ['searchProfiles', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const results = await base44.entities.UserProfile.filter({}, '-created_date', 50);
      const q = searchQuery.toLowerCase();
      return results.filter(p => 
        (p.display_name?.toLowerCase().includes(q) || p.handle?.toLowerCase().includes(q) || p.user_id?.toLowerCase().includes(q)) &&
        !entity.team_member_ids?.includes(p.user_id)
      ).slice(0, 10);
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000
  });

  const handleAdd = async () => {
    if (!selectedUser) return;
    setSaving(true);

    const newTeamMemberIds = [...(entity.team_member_ids || []), selectedUser.user_id];
    const newTeamRoles = [...(entity.team_roles || []), {
      user_id: selectedUser.user_id,
      name: selectedUser.display_name,
      avatar: selectedUser.avatar_url || '',
      role,
      title: title || (role === 'admin' ? 'Administrator' : 'Team Member')
    }];

    await base44.entities.BusinessEntity5D.update(entity.id, {
      team_member_ids: newTeamMemberIds,
      team_roles: newTeamRoles
    });

    queryClient.invalidateQueries({ queryKey: ['businessEntity5D', entity.id] });
    setSaving(false);
    setSelectedUser(null);
    setSearchQuery('');
    setTitle('');
    setRole('member');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedUser ? (
            <>
              <div>
                <Label>Search by name or handle</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Type to search..." 
                    className="pl-10" 
                  />
                </div>
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-violet-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.display_name}</p>
                        <p className="text-xs text-slate-500">@{user.handle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-200">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>{selectedUser.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{selectedUser.display_name}</p>
                  <p className="text-sm text-slate-500">@{selectedUser.handle}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedUser(null)}>Change</Button>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Head of Operations" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleAdd} disabled={saving} className="bg-violet-600 hover:bg-violet-700 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Add Member
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}