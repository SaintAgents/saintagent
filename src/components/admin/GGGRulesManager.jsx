import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coins, Plus, Edit, Trash2 } from "lucide-react";
import { ACTIONS, TIERS, MATRIX_SECTIONS, GGG_TO_USD } from '@/components/earnings/gggMatrix';

const ACTION_TYPES = [
  { value: 'meeting_completed', label: 'Meeting Completed' },
  { value: 'booking_completed', label: 'Booking Completed' },
  { value: 'event_attended', label: 'Event Attended' },
  { value: 'mission_completed', label: 'Mission Completed' },
  { value: 'referral_activated', label: 'Referral Activated' },
  { value: 'testimonial_given', label: 'Testimonial Given' },
  { value: 'post_created', label: 'Post Created' },
  { value: 'profile_completed', label: 'Profile Completed' },
];

export default function GGGRulesManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState({
    action_type: '',
    ggg_amount: 0,
    description: '',
    is_active: true
  });
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['gggRules'],
    queryFn: () => base44.entities.GGGRewardRule.list()
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.GGGRewardRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gggRules'] });
      setIsCreating(false);
      setNewRule({ action_type: '', ggg_amount: 0, description: '', is_active: true });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GGGRewardRule.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gggRules'] })
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.GGGRewardRule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gggRules'] })
  });

  const handleCreate = () => {
    if (!newRule.action_type || !newRule.ggg_amount) return;
    createRuleMutation.mutate(newRule);
  };

  const handleToggleActive = (rule) => {
    updateRuleMutation.mutate({
      id: rule.id,
      data: { is_active: !rule.is_active }
    });
  };

  const handleDelete = (ruleId) => {
    if (confirm('Delete this GGG reward rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">GGG Reward Rules</h2>
          <p className="text-slate-500 mt-1">Configure how users earn GGG points</p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </Button>
      </div>

      {/* GGG Earnings Matrix (Reference) */}
      <Card>
        <CardHeader>
          <CardTitle>GGG Earnings Matrix (Reference)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-slate-500 mb-2">Tiers (GGG → USD)</div>
            <div className="flex flex-wrap gap-2">
              {TIERS.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200">
                  {t.toFixed(2)} GGG ≈ ${ (t * GGG_TO_USD).toFixed(2) }
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-2">Actions and base earnings</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ACTIONS.map((a) => (
                <div key={a.key} className="flex items-center justify-between p-2 rounded border bg-white">
                  <span className="text-sm text-slate-700">{a.title}</span>
                  <span className="text-sm font-semibold text-amber-600">{a.base.toFixed(2)} GGG</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Rule */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New GGG Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Action Type</Label>
                <Select
                  value={newRule.action_type}
                  onValueChange={(value) => setNewRule({ ...newRule, action_type: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>GGG Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newRule.ggg_amount}
                  onChange={(e) => setNewRule({ ...newRule, ggg_amount: parseFloat(e.target.value) })}
                  className="mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="mt-2"
                placeholder="Optional description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newRule.is_active}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createRuleMutation.isPending}>
                  Create Rule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rules */}
      <div className="grid gap-4">
        {rules.map((rule) => {
          const actionLabel = ACTION_TYPES.find(t => t.value === rule.action_type)?.label || rule.action_type;
          return (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-100">
                      <Coins className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{actionLabel}</h3>
                        {rule.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Awards <span className="font-bold text-amber-600">{rule.ggg_amount} GGG</span>
                      </p>
                      {rule.description && (
                        <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => handleToggleActive(rule)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rule.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {rules.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <Coins className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No GGG reward rules configured yet</p>
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="mt-4"
            >
              Create First Rule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}