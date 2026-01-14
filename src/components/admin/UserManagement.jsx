import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { Search, Shield, Ban, CheckCircle, XCircle, Edit, Calendar, RefreshCw, ArrowDownAZ, Hash, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortOrder, setSortOrder] = useState('date'); // 'date', 'alpha', 'sa'
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      setSelectedUser(null);
    }
  });

  const { data: userRecords = [] } = useQuery({
    queryKey: ['userRecord', selectedUser?.user_id],
    queryFn: () => base44.entities.User.filter({ email: selectedUser.user_id }),
    enabled: !!selectedUser?.user_id
  });
  const userRecord = userRecords?.[0];

  // Wallet for selected user (authoritative balance)
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', selectedUser?.user_id],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: selectedUser.user_id }
      });
      return data;
    },
    enabled: !!selectedUser?.user_id,
    refetchInterval: 5000
  });
  const walletAvailable = walletRes?.wallet?.available_balance ?? selectedUser?.ggg_balance ?? 0;

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRecord'] });
    }
  });

  const filteredProfiles = profiles
    .filter((p) =>
      p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'alpha') {
        return (a.display_name || '').localeCompare(b.display_name || '');
      } else if (sortOrder === 'sa') {
        const saA = a.sa_number || 'zzzzzz';
        const saB = b.sa_number || 'zzzzzz';
        return saA.localeCompare(saB);
      }
      // Default: date (newest first)
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const handleChangeRole = (profile, newRole) => {
    if (confirm(`Change ${profile.display_name}'s role to ${newRole}?`)) {
      updateProfileMutation.mutate({
        id: profile.id,
        data: { leader_tier: newRole }
      });
    }
  };

  const handleAdjustGGG = async (profile, amount) => {
    const direction = amount >= 0 ? 'CREDIT' : 'DEBIT';
    const absAmount = Math.abs(amount);
    await base44.functions.invoke('walletEngine', {
      action: 'adjustment',
      payload: { user_id: profile.user_id, amount: absAmount, direction, memo: 'Admin adjustment' }
    });
    await queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
  };

  const handleProfileSave = () => {
    if (!selectedUser) return;
    updateProfileMutation.mutate({
      id: selectedUser.id,
      data: {
        display_name: selectedUser.display_name,
        handle: selectedUser.handle,
        status: selectedUser.status,
        dm_policy: selectedUser.dm_policy
      }
    });
  };

  const handleChangeUserRole = (newRole) => {
    if (!userRecord) return;
    if (confirm(`Change user role to ${newRole}?`)) {
      updateUserMutation.mutate({ id: userRecord.id, data: { role: newRole } });
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedUser) return;
    if (confirm('Delete this UserProfile? This cannot be undone.')) {
      await base44.entities.UserProfile.delete(selectedUser.id);
      await queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      await queryClient.refetchQueries({ queryKey: ['allProfiles'] });
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userRecord) return;
    if (confirm('Delete this user account? This will remove login access and their directory profile.')) {
      await base44.entities.User.delete(userRecord.id);
      // Also remove from the directory by deleting their UserProfile if present
      if (selectedUser?.id) {
        try {await base44.entities.UserProfile.delete(selectedUser.id);} catch {}
      }
      await queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      await queryClient.refetchQueries({ queryKey: ['allProfiles'] });
      setSelectedUser(null);
    }
  };

  const handlePurgeData = async () => {
    const email = selectedUser?.user_id;
    if (!email) return;
    if (!confirm("Permanently delete this user's messages and notifications?")) return;
    const [msgsOut, msgsIn, notifs] = await Promise.all([
    base44.entities.Message.filter({ from_user_id: email }, '-created_date', 1000),
    base44.entities.Message.filter({ to_user_id: email }, '-created_date', 1000),
    base44.entities.Notification.filter({ user_id: email }, '-created_date', 1000)]
    );
    await Promise.all([...(msgsOut || []), ...(msgsIn || [])].map((m) => base44.entities.Message.delete(m.id)));
    await Promise.all((notifs || []).map((n) => base44.entities.Notification.delete(n.id)));
  };

  const [resettingSA, setResettingSA] = useState(false);
  const [customGGGAmount, setCustomGGGAmount] = useState('');
  const handleResetSANumbers = async () => {
    if (!confirm('Reset and reassign ALL SA numbers in order by join date? This cannot be undone.')) return;
    setResettingSA(true);
    try {
      const { data } = await base44.functions.invoke('resetSaNumbers', {});
      alert(`Done! Assigned ${data.totalAssigned} SA numbers. Next new user will get SA#${String(data.nextNumber).padStart(6, '0')}`);
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    } catch (e) {
      alert('Error: ' + (e.message || 'Failed to reset SA numbers'));
    } finally {
      setResettingSA(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-violet-100 text-card-foreground rounded-xl border shadow col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, handle, or email..."
                className="pl-10" />

            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="bg-purple-100 pt-6 p-6 text-center">
            <p className="text-purple-950 text-3xl font-bold">{profiles.length}</p>
            <p className="text-zinc-950 mt-1 text-sm">Total Users</p>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardContent className="bg-violet-50 pt-4 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">SA# Management</p>
              <p className="text-xs text-slate-500">Reset and reassign all SA numbers in join order</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetSANumbers}
              disabled={resettingSA}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", resettingSA && "animate-spin")} />
              {resettingSA ? 'Resetting...' : 'Reset All SA#'}
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardContent className="bg-amber-50 pt-4 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Demo SA# Assignment</p>
              <p className="text-xs text-slate-500">Assign sequential Demo-001, Demo-002, etc. to all demo profiles</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                if (!confirm('Assign Demo-XXX SA numbers to all demo profiles?')) return;
                try {
                  const { data } = await base44.functions.invoke('assignDemoSaNumbers', {});
                  alert(`Done! Assigned ${data.updates?.length || 0} demo SA numbers.`);
                  queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
                } catch (e) {
                  alert('Error: ' + (e.message || 'Failed'));
                }
              }}
              className="gap-2"
            >
              <Hash className="w-4 h-4" />
              Assign Demo SA#
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="bg-purple-100 p-6 flex flex-row items-center justify-between">
          <CardTitle>User Directory</CardTitle>
          <Tabs value={sortOrder} onValueChange={setSortOrder} className="w-auto">
            <TabsList className="h-8">
              <TabsTrigger value="date" className="text-xs px-3 gap-1">
                <Clock className="w-3 h-3" /> Date
              </TabsTrigger>
              <TabsTrigger value="alpha" className="text-xs px-3 gap-1">
                <ArrowDownAZ className="w-3 h-3" /> A-Z
              </TabsTrigger>
              <TabsTrigger value="sa" className="text-xs px-3 gap-1">
                <Hash className="w-3 h-3" /> SA#
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="bg-purple-100 pt-0 p-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredProfiles.map((profile) =>
              <div
                key={profile.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">

                  <Avatar 
                    className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                    data-user-id={profile.user_id}
                  >
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-transparent rounded-full flex h-full w-full items-center justify-center">{profile.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {profile.display_name}
                        {profile.sa_number && <span className="text-slate-400 font-normal ml-1.5">SA#{profile.sa_number}</span>}
                      </p>
                      {profile.leader_tier === 'verified144k' &&
                    <Badge className="bg-amber-100 text-amber-700">144K Leader</Badge>
                    }
                      {profile.leader_tier === 'candidate' &&
                    <Badge variant="outline" className="bg-purple-100 text-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Candidate</Badge>
                    }
                    </div>
                    <p className="text-sm text-slate-500">@{profile.handle} • {profile.user_id}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center min-w-[80px]">
                      <p className="font-semibold text-slate-900 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {profile.created_date ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '-'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {profile.created_date ? formatDistanceToNow(new Date(profile.created_date), { addSuffix: true }) : 'Joined'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900">{profile.ggg_balance?.toFixed(2) || 0}</p>
                      <p className="text-xs text-slate-500">GGG</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900 capitalize">{profile.rank_code || 'seeker'}</p>
                      <p className="text-xs text-slate-500">Rank</p>
                    </div>
                    <div className={cn(
                    "w-2 h-2 rounded-full",
                    profile.status === 'online' ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                  </div>

                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(profile)} className="bg-purple-100 text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8">

                    <Edit className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User Management Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage User: {selectedUser?.display_name}</DialogTitle>
          </DialogHeader>

          {selectedUser &&
          <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>{selectedUser.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{selectedUser.display_name}</p>
                  <p className="text-sm text-slate-500">@{selectedUser.handle}</p>
                  <p className="text-xs text-slate-400">{selectedUser.user_id}</p>
                </div>
              </div>

              {/* GGG Balance Controls */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">GGG Balance</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-2xl font-bold text-slate-900">
                    {walletAvailable?.toFixed?.(6) || 0}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => handleAdjustGGG(selectedUser, -1)}>
                      -1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAdjustGGG(selectedUser, -0.1)}>
                      -0.1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAdjustGGG(selectedUser, 0.1)}>
                      +0.1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAdjustGGG(selectedUser, 1)}>
                      +1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAdjustGGG(selectedUser, 10)}>
                      +10
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="Custom amount (e.g. 0.1)"
                    value={customGGGAmount}
                    onChange={(e) => setCustomGGGAmount(e.target.value)}
                    className="w-48"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const amt = parseFloat(customGGGAmount);
                      if (!isNaN(amt) && amt !== 0) {
                        handleAdjustGGG(selectedUser, amt);
                        setCustomGGGAmount('');
                      }
                    }}
                    disabled={!customGGGAmount || isNaN(parseFloat(customGGGAmount))}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Leader Status */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Leader Status</h3>
                <Select
                value={selectedUser.leader_tier || 'none'}
                onValueChange={(value) => handleChangeRole(selectedUser, value)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Regular User</SelectItem>
                    <SelectItem value="candidate">Leader Candidate</SelectItem>
                    <SelectItem value="verified144k">144K Verified Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Basics */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Profile Basics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                  placeholder="Display Name"
                  value={selectedUser.display_name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, display_name: e.target.value })} />

                  <Input
                  placeholder="@handle"
                  value={selectedUser.handle || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, handle: e.target.value })} />

                  <Select
                  value={selectedUser.status || 'online'}
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, status: v })}>

                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="focus">Focus</SelectItem>
                      <SelectItem value="dnd">Do Not Disturb</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                  value={selectedUser.dm_policy || 'everyone'}
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, dm_policy: v })}>

                    <SelectTrigger><SelectValue placeholder="DM Policy" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="mutual">Mutuals</SelectItem>
                      <SelectItem value="none">No one</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right mt-3">
                  <Button size="sm" className="rounded-lg" onClick={handleProfileSave}>Save Profile</Button>
                </div>
              </div>

              {/* User Role */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">User Role</h3>
                <Select
                value={userRecord?.role || 'user'}
                onValueChange={(v) => handleChangeUserRole(v)}>

                  <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Danger Zone */}
              <div className="border border-rose-200 bg-rose-50 rounded-lg p-4">
                <h3 className="font-semibold text-rose-700 mb-2">Danger Zone</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100" onClick={handlePurgeData}>
                    Purge Messages & Notifications
                  </Button>
                  <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100" onClick={handleDeleteProfile}>
                    Delete Profile
                  </Button>
                  <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100" onClick={handleDeleteUser} disabled={!userRecord}>
                    Delete User Account
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">User Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">{selectedUser.follower_count || 0}</p>
                    <p className="text-xs text-slate-500">Followers</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">{selectedUser.reach_score || 0}</p>
                    <p className="text-xs text-slate-500">Reach</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">{selectedUser.meetings_completed || 0}</p>
                    <p className="text-xs text-slate-500">Meetings</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

}