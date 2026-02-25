import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Shield, Plus, Pencil, Trash2, Loader2, ChevronRight,
  Lock, Eye, Settings, CheckCircle2, Layers, GitBranch, Grid3X3
} from "lucide-react";
import { 
  ROLE_ORDER, 
  DEFAULT_ROLE_GROUPS, 
  PERMISSION_DEFINITIONS, 
  SECTION_DEFINITIONS 
} from '@/components/roles/RoleDefinitions';
import ROLE_DEFS from '@/components/roles/RoleDefinitions';
import { toast } from 'sonner';
import RoleHierarchyTree from './RoleHierarchyTree';
import PermissionsMatrix from './PermissionsMatrix';

const GROUP_COLORS = ['slate', 'emerald', 'amber', 'violet', 'rose', 'blue', 'cyan', 'pink', 'orange', 'teal'];

export default function RoleGroupsManager() {
  const [editingGroup, setEditingGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: roleGroups = [], isLoading } = useQuery({
    queryKey: ['roleGroups'],
    queryFn: () => base44.entities.RoleGroup.list('-created_date', 100)
  });

  // Combine default and custom groups
  const allGroups = [
    ...Object.values(DEFAULT_ROLE_GROUPS).map(g => ({ ...g, _isDefault: true })),
    ...roleGroups.filter(g => g.is_active !== false)
  ];

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RoleGroup.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleGroups'] });
      setIsCreating(false);
      setEditingGroup(null);
      toast.success('Role group created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RoleGroup.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleGroups'] });
      setEditingGroup(null);
      toast.success('Role group updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoleGroup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleGroups'] });
      toast.success('Role group deleted');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups" className="gap-2">
            <Layers className="w-4 h-4" />
            Role Groups
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="gap-2">
            <GitBranch className="w-4 h-4" />
            Hierarchy Tree
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Permissions Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-violet-600" />
                    Role Groups & Permissions
                  </CardTitle>
                  <CardDescription>
                    Define role groups with hierarchies and granular access controls
                  </CardDescription>
                </div>
                <Button onClick={() => { setIsCreating(true); setEditingGroup({}); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Hierarchy Overview */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Hierarchy Overview (Higher = More Authority)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[...allGroups]
                    .sort((a, b) => (b.hierarchy_level || 0) - (a.hierarchy_level || 0))
                    .map(group => (
                      <Badge 
                        key={group.code} 
                        className={`bg-${group.color || 'slate'}-100 text-${group.color || 'slate'}-700`}
                      >
                        Level {group.hierarchy_level || 0}: {group.name}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allGroups.map(group => (
                  <Card key={group.code} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${group.color || 'slate'}-500`} />
                          <h3 className="font-medium text-slate-900">{group.name}</h3>
                          {group._isDefault && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <Badge variant="secondary">Level {group.hierarchy_level || 0}</Badge>
                      </div>

                      <p className="text-sm text-slate-500 mb-3">{group.description}</p>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-600 mb-1">Roles in Group:</p>
                        <div className="flex flex-wrap gap-1">
                          {(group.roles || []).map(roleCode => (
                            <Badge key={roleCode} variant="secondary" className="text-xs">
                              {ROLE_DEFS[roleCode]?.title || roleCode}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-600 mb-1">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(group.permissions || {})
                            .filter(([_, v]) => v)
                            .slice(0, 4)
                            .map(([key]) => (
                              <Badge key={key} variant="outline" className="text-[10px]">
                                {PERMISSION_DEFINITIONS[key]?.label || key}
                              </Badge>
                            ))}
                          {Object.entries(group.permissions || {}).filter(([_, v]) => v).length > 4 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{Object.entries(group.permissions || {}).filter(([_, v]) => v).length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Section Access Preview */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-600 mb-1">Section Access:</p>
                        <div className="flex flex-wrap gap-1">
                          {group.section_access?.includes('*') ? (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                              All Sections
                            </Badge>
                          ) : (
                            <>
                              {(group.section_access || []).slice(0, 3).map(section => (
                                <Badge key={section} variant="outline" className="text-[10px]">
                                  {SECTION_DEFINITIONS[section]?.label || section}
                                </Badge>
                              ))}
                              {(group.section_access || []).length > 3 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{(group.section_access || []).length - 3} more
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {!group._isDefault && (
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingGroup(group)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deleteMutation.mutate(group.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy">
          <RoleHierarchyTree roleGroups={roleGroups} />
        </TabsContent>

        <TabsContent value="matrix">
          <PermissionsMatrix roleGroups={roleGroups} />
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => { setEditingGroup(null); setIsCreating(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create Role Group' : 'Edit Role Group'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <RoleGroupForm 
              group={editingGroup}
              onSave={(data) => {
                if (isCreating) {
                  createMutation.mutate(data);
                } else {
                  updateMutation.mutate({ id: editingGroup.id, data });
                }
              }}
              onCancel={() => { setEditingGroup(null); setIsCreating(false); }}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleGroupForm({ group, onSave, onCancel, isPending }) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    code: group?.code || '',
    description: group?.description || '',
    color: group?.color || 'slate',
    hierarchy_level: group?.hierarchy_level || 0,
    roles: group?.roles || [],
    permissions: group?.permissions || {},
    section_access: group?.section_access || []
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRole = (roleCode) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleCode) 
        ? prev.roles.filter(r => r !== roleCode)
        : [...prev.roles, roleCode]
    }));
  };

  const togglePermission = (permKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  const toggleSection = (section) => {
    setFormData(prev => ({
      ...prev,
      section_access: prev.section_access.includes(section)
        ? prev.section_access.filter(s => s !== section)
        : [...prev.section_access, section]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error('Name and code are required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Group Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Content Team"
            />
          </div>
          <div>
            <Label>Code</Label>
            <Input 
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g., content_team"
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe what this group is responsible for..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Color</Label>
            <Select value={formData.color} onValueChange={(v) => updateField('color', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUP_COLORS.map(color => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hierarchy Level (0-10)</Label>
            <Input 
              type="number"
              min={0}
              max={10}
              value={formData.hierarchy_level}
              onChange={(e) => updateField('hierarchy_level', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Roles in Group
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_ORDER.filter(code => code !== 'member').map(roleCode => {
            const def = ROLE_DEFS[roleCode];
            if (!def) return null;
            return (
              <div 
                key={roleCode}
                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => toggleRole(roleCode)}
              >
                <Checkbox checked={formData.roles.includes(roleCode)} />
                <span className="text-sm">{def.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Permissions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PERMISSION_DEFINITIONS).map(([key, def]) => (
            <div 
              key={key}
              className="flex items-start gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => togglePermission(key)}
            >
              <Checkbox checked={!!formData.permissions[key]} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{def.label}</p>
                <p className="text-xs text-slate-500">{def.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Access */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Section Access
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <Checkbox 
            checked={formData.section_access.includes('*')}
            onCheckedChange={(checked) => {
              if (checked) {
                updateField('section_access', ['*']);
              } else {
                updateField('section_access', []);
              }
            }}
          />
          <span className="text-sm font-medium">All Sections</span>
        </div>
        {!formData.section_access.includes('*') && (
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(SECTION_DEFINITIONS).map(([section, def]) => (
              <div 
                key={section}
                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => toggleSection(section)}
              >
                <Checkbox checked={formData.section_access.includes(section)} />
                <span className="text-sm">{def.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {group?.id ? 'Save Changes' : 'Create Group'}
        </Button>
      </div>
    </div>
  );
}