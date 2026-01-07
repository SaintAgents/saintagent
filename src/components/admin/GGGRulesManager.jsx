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
import { ACTIONS, TIERS, MATRIX_SECTIONS, GGG_TO_USD, formatGGGSmart } from '@/components/earnings/gggMatrix';

// Category labels
const CATEGORY_LABELS = {
  engagement: 'Micro-Engagement',
  content: 'Content Creation',
  mission: 'Mission & Team',
  leadership: 'Leadership',
  agent: 'Agent Development',
  learning: 'Learning & Teaching'
};

// Build ACTION_TYPES from ACTIONS array
const ACTION_TYPES = ACTIONS.map(a => ({
  value: a.key,
  label: a.title,
  base: a.base,
  usd: a.usd,
  category: a.category,
  definition: a.definition
}));

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
          <p className="text-sm text-slate-500">Based on 1 GGG = USD {GGG_TO_USD.toFixed(2)}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tiers Table */}
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3">Tiers (GGG → USD)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border p-2 text-left">GGG Amount</th>
                    <th className="border p-2 text-left">USD Value</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((t) => {
                    const usdVal = t * GGG_TO_USD;
                    return (
                      <tr key={t} className="hover:bg-slate-50">
                        <td className="border p-2 font-mono">{formatGGGSmart(t)} GGG (USD {usdVal.toFixed(2)})</td>
                        <td className="border p-2 text-emerald-600 font-medium">USD {usdVal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions by Category */}
          {['engagement', 'content', 'mission', 'leadership', 'agent', 'learning'].map(cat => {
            const catActions = ACTIONS.filter(a => a.category === cat);
            if (catActions.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                <div className="space-y-2">
                  {catActions.map((a) => (
                    <div key={a.key} className="p-3 rounded-lg border bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{a.title}</span>
                            <span className="text-xs text-slate-500">—</span>
                            <span className="font-mono text-amber-600 font-semibold">{formatGGGSmart(a.base)} GGG</span>
                            <span className="text-emerald-600 text-sm">(USD {a.usd?.toFixed(2) || (a.base * GGG_TO_USD).toFixed(2)})</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{a.definition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
                  onValueChange={(value) => {
                    const action = ACTION_TYPES.find(t => t.value === value);
                    setNewRule({ 
                      ...newRule, 
                      action_type: value,
                      ggg_amount: action?.base || 0,
                      usd_equivalent: action?.usd || (action?.base * GGG_TO_USD) || 0,
                      category: action?.category || '',
                      description: action?.definition || ''
                    });
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {['engagement', 'content', 'mission', 'leadership', 'agent', 'learning'].map(cat => (
                      <React.Fragment key={cat}>
                        <div className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-50">
                          {CATEGORY_LABELS[cat]}
                        </div>
                        {ACTION_TYPES.filter(t => t.category === cat).map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} ({formatGGGSmart(type.base)} GGG / ${type.usd?.toFixed(2)})
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>GGG Amount (7 decimal precision)</Label>
                <Input
                  type="number"
                  step="0.0000001"
                  value={newRule.ggg_amount}
                  onChange={(e) => setNewRule({ ...newRule, ggg_amount: parseFloat(e.target.value) })}
                  className="mt-2 font-mono"
                  placeholder="0.0000000"
                />
                {newRule.ggg_amount > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ≈ USD {(newRule.ggg_amount * GGG_TO_USD).toFixed(2)}
                  </p>
                )}
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
          const actionInfo = ACTION_TYPES.find(t => t.value === rule.action_type);
          const actionLabel = actionInfo?.label || rule.action_type;
          const usdVal = rule.usd_equivalent || (rule.ggg_amount * GGG_TO_USD);
          return (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-100">
                      <Coins className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{actionLabel}</h3>
                        {rule.category && (
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[rule.category] || rule.category}
                          </Badge>
                        )}
                        {rule.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Awards <span className="font-bold font-mono text-amber-600">{formatGGGSmart(rule.ggg_amount)} GGG</span>
                        <span className="text-emerald-600 ml-2">(USD {usdVal.toFixed(2)})</span>
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