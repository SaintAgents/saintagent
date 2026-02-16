import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, Plus, Trash2, Copy, AlertTriangle, 
  Crown, Star, Shield, UserPlus, RefreshCw,
  CheckCircle, Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Master demo user templates - these are protected and used as templates
const MASTER_DEMO_TEMPLATES = {
  top_tier: [
    { 
      id: 'master_demo_001', 
      email: 'masterdemo001@saintag.com',
      tier: 'top',
      label: 'Top Tier #1 - Guardian',
      description: 'Max rank, high trust, all badges',
      defaults: {
        display_name: 'Master Guardian',
        rp_rank_code: 'guardian',
        rp_points: 10000,
        trust_score: 98,
        ggg_balance: 500,
        leader_tier: 'verified144k'
      }
    },
    { 
      id: 'master_demo_002', 
      email: 'masterdemo002@saintag.com',
      tier: 'top',
      label: 'Top Tier #2 - Ascended',
      description: 'High rank, established network',
      defaults: {
        display_name: 'Master Ascended',
        rp_rank_code: 'ascended',
        rp_points: 7500,
        trust_score: 92,
        ggg_balance: 350,
        leader_tier: 'candidate'
      }
    },
    { 
      id: 'master_demo_003', 
      email: 'masterdemo003@saintag.com',
      tier: 'top',
      label: 'Top Tier #3 - Oracle',
      description: 'Spiritual focus, high engagement',
      defaults: {
        display_name: 'Master Oracle',
        rp_rank_code: 'oracle',
        rp_points: 6000,
        trust_score: 88,
        ggg_balance: 275,
        leader_tier: 'none'
      }
    }
  ],
  mid_tier: [
    { 
      id: 'master_demo_004', 
      email: 'masterdemo004@saintag.com',
      tier: 'mid',
      label: 'Mid Tier #1 - Practitioner',
      description: 'Active contributor, growing network',
      defaults: {
        display_name: 'Demo Practitioner',
        rp_rank_code: 'practitioner',
        rp_points: 1500,
        trust_score: 72,
        ggg_balance: 85,
        leader_tier: 'none'
      }
    },
    { 
      id: 'master_demo_005', 
      email: 'masterdemo005@saintag.com',
      tier: 'mid',
      label: 'Mid Tier #2 - Adept',
      description: 'Regular user, moderate activity',
      defaults: {
        display_name: 'Demo Adept',
        rp_rank_code: 'adept',
        rp_points: 800,
        trust_score: 65,
        ggg_balance: 45,
        leader_tier: 'none'
      }
    }
  ]
};

export default function DemoUsersManager() {
  const queryClient = useQueryClient();
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [newUserSuffix, setNewUserSuffix] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMastersConfirm, setDeleteMastersConfirm] = useState(false);

  // Fetch all demo users (emails containing 'demo')
  const { data: demoUsers = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['demoUsers'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.filter(p => 
        p.user_id?.toLowerCase().includes('demo') || 
        p.handle?.toLowerCase().includes('demo') ||
        p.display_name?.toLowerCase().includes('demo')
      );
    },
    staleTime: 60000
  });

  // Separate master templates from regular demo users
  const masterEmails = [
    ...MASTER_DEMO_TEMPLATES.top_tier.map(t => t.email),
    ...MASTER_DEMO_TEMPLATES.mid_tier.map(t => t.email)
  ];
  
  const masterUsers = demoUsers.filter(u => masterEmails.includes(u.user_id));
  const regularDemoUsers = demoUsers.filter(u => !masterEmails.includes(u.user_id));

  const toggleTemplate = (templateId) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getTemplateById = (id) => {
    return [...MASTER_DEMO_TEMPLATES.top_tier, ...MASTER_DEMO_TEMPLATES.mid_tier].find(t => t.id === id);
  };

  // Create demo user from template
  const createDemoUser = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select at least one template');
      return;
    }

    const suffix = newUserSuffix.trim() || Date.now().toString().slice(-6);
    setIsCreating(true);

    try {
      for (const templateId of selectedTemplates) {
        const template = getTemplateById(templateId);
        if (!template) continue;

        const newEmail = `demouser${suffix}_${template.tier}@saintag.com`;
        const newHandle = `demo${suffix}${template.tier}`;

        // Create the profile based on template
        await base44.entities.UserProfile.create({
          user_id: newEmail,
          handle: newHandle,
          display_name: `${template.defaults.display_name} (${suffix})`,
          rp_rank_code: template.defaults.rp_rank_code,
          rp_points: template.defaults.rp_points,
          trust_score: template.defaults.trust_score,
          ggg_balance: template.defaults.ggg_balance,
          leader_tier: template.defaults.leader_tier,
          status: 'online',
          bio: `Demo user created from ${template.label} template`,
          profile_visibility: 'public'
        });
      }

      toast.success(`Created ${selectedTemplates.length} demo user(s)`);
      setSelectedTemplates([]);
      setNewUserSuffix('');
      refetchUsers();
    } catch (error) {
      console.error('Error creating demo users:', error);
      toast.error('Failed to create demo users');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete all non-master demo users
  const deleteRegularDemoUsers = async () => {
    if (regularDemoUsers.length === 0) {
      toast.info('No regular demo users to delete');
      return;
    }

    setIsDeleting(true);
    try {
      for (const user of regularDemoUsers) {
        await base44.entities.UserProfile.delete(user.id);
      }
      toast.success(`Deleted ${regularDemoUsers.length} demo user(s)`);
      refetchUsers();
    } catch (error) {
      console.error('Error deleting demo users:', error);
      toast.error('Failed to delete some demo users');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete master demo users (requires double confirmation)
  const deleteMasterDemoUsers = async () => {
    if (masterUsers.length === 0) {
      toast.info('No master demo users to delete');
      return;
    }

    setIsDeleting(true);
    try {
      for (const user of masterUsers) {
        await base44.entities.UserProfile.delete(user.id);
      }
      toast.success(`Deleted ${masterUsers.length} master demo user(s)`);
      setDeleteMastersConfirm(false);
      refetchUsers();
    } catch (error) {
      console.error('Error deleting master demo users:', error);
      toast.error('Failed to delete some master demo users');
    } finally {
      setIsDeleting(false);
    }
  };

  // Create master template users if they don't exist
  const createMasterTemplates = async () => {
    setIsCreating(true);
    try {
      const allTemplates = [...MASTER_DEMO_TEMPLATES.top_tier, ...MASTER_DEMO_TEMPLATES.mid_tier];
      let created = 0;

      for (const template of allTemplates) {
        // Check if already exists
        const existing = masterUsers.find(u => u.user_id === template.email);
        if (existing) continue;

        await base44.entities.UserProfile.create({
          user_id: template.email,
          handle: template.email.split('@')[0],
          display_name: template.defaults.display_name,
          rp_rank_code: template.defaults.rp_rank_code,
          rp_points: template.defaults.rp_points,
          trust_score: template.defaults.trust_score,
          ggg_balance: template.defaults.ggg_balance,
          leader_tier: template.defaults.leader_tier,
          status: 'online',
          bio: template.description,
          profile_visibility: 'public'
        });
        created++;
      }

      if (created > 0) {
        toast.success(`Created ${created} master template user(s)`);
        refetchUsers();
      } else {
        toast.info('All master templates already exist');
      }
    } catch (error) {
      console.error('Error creating master templates:', error);
      toast.error('Failed to create master templates');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-100">
                <Crown className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{masterUsers.length}</p>
                <p className="text-sm text-slate-500">Master Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{regularDemoUsers.length}</p>
                <p className="text-sm text-slate-500">Demo Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{demoUsers.length}</p>
                <p className="text-sm text-slate-500">Total Demo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Demo User Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create Demo User
          </CardTitle>
          <CardDescription>
            Select template(s) and create new demo users based on master profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Tier Templates */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Top Tier Templates (High Rank)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MASTER_DEMO_TEMPLATES.top_tier.map(template => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTemplates.includes(template.id)
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleTemplate(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => toggleTemplate(template.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{template.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">{template.defaults.rp_rank_code}</Badge>
                        <Badge variant="outline" className="text-xs">{template.defaults.rp_points} RP</Badge>
                        <Badge variant="outline" className="text-xs">{template.defaults.trust_score}% Trust</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mid Tier Templates */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Mid Tier Templates (Active Users)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MASTER_DEMO_TEMPLATES.mid_tier.map(template => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTemplates.includes(template.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleTemplate(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => toggleTemplate(template.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{template.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">{template.defaults.rp_rank_code}</Badge>
                        <Badge variant="outline" className="text-xs">{template.defaults.rp_points} RP</Badge>
                        <Badge variant="outline" className="text-xs">{template.defaults.trust_score}% Trust</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Form */}
          <div className="flex items-end gap-4 pt-4 border-t">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="suffix">User Suffix (optional)</Label>
              <Input
                id="suffix"
                placeholder="e.g. 001, test, etc"
                value={newUserSuffix}
                onChange={(e) => setNewUserSuffix(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">Leave blank for auto-generated</p>
            </div>
            <Button 
              onClick={createDemoUser}
              disabled={isCreating || selectedTemplates.length === 0}
              className="gap-2"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create {selectedTemplates.length > 0 ? `${selectedTemplates.length} User(s)` : 'User'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Master Templates Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Master Template Users
          </CardTitle>
          <CardDescription>
            These are protected template users that persist when deleting regular demo users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {masterUsers.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No master templates exist yet</p>
              <Button onClick={createMasterTemplates} disabled={isCreating} className="gap-2">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Master Templates
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {masterUsers.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.display_name?.charAt(0) || 'M'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-xs text-slate-500">{user.user_id}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">{user.rp_rank_code}</Badge>
                  <Badge variant="outline">{user.rp_points} RP</Badge>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={createMasterTemplates} 
                disabled={isCreating}
                className="w-full mt-4 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Missing Templates
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regular Demo Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Regular Demo Users ({regularDemoUsers.length})
          </CardTitle>
          <CardDescription>
            Demo users created from templates - can be safely deleted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
            </div>
          ) : regularDemoUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No regular demo users</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {regularDemoUsers.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.display_name?.charAt(0) || 'D'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-xs text-slate-500">{user.user_id}</p>
                  </div>
                  <Badge variant="outline">{user.rp_rank_code || 'seeker'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delete Regular Demo Users */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
            <div>
              <p className="font-medium text-red-800">Delete Regular Demo Users</p>
              <p className="text-sm text-red-600">Removes all demo users except master templates</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || regularDemoUsers.length === 0} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete ({regularDemoUsers.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Regular Demo Users?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {regularDemoUsers.length} demo user(s). 
                    Master template users will be preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteRegularDemoUsers} className="bg-red-600 hover:bg-red-700">
                    Delete Demo Users
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Delete Master Templates */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-300 bg-red-100">
            <div>
              <p className="font-medium text-red-900">Delete Master Templates</p>
              <p className="text-sm text-red-700">⚠️ This removes the protected template users</p>
            </div>
            <AlertDialog open={deleteMastersConfirm} onOpenChange={setDeleteMastersConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || masterUsers.length === 0} className="gap-2 bg-red-700 hover:bg-red-800">
                  <Trash2 className="w-4 h-4" />
                  Delete Masters ({masterUsers.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">⚠️ Delete Master Templates?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is a critical action. You are about to permanently delete {masterUsers.length} master template user(s). 
                    These are the protected templates used to create new demo users.
                    <br /><br />
                    <strong>This action cannot be undone.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteMasterDemoUsers} className="bg-red-700 hover:bg-red-800">
                    Yes, Delete Master Templates
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}