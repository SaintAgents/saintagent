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
import { Coins, Plus, Edit, Trash2, Zap, Gift, Lock, Unlock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ACTIONS, TIERS, MATRIX_SECTIONS, GGG_TO_USD, formatGGGSmart } from '@/components/earnings/gggMatrix';

// Rule Card Component (extracted for proper state management)
function RuleCard({ rule, onUpdate, onToggle, onDelete, onLockToggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editGgg, setEditGgg] = useState(rule.ggg_amount);
  
  const actionInfo = ACTIONS.find(a => a.key === rule.action_type);
  const actionLabel = actionInfo?.title || rule.action_type;
  const usdVal = rule.usd_equivalent || (rule.ggg_amount * GGG_TO_USD);
  
  const handleSaveEdit = () => {
    onUpdate({
      id: rule.id,
      data: { 
        ggg_amount: editGgg,
        usd_equivalent: editGgg * GGG_TO_USD
      }
    });
    setIsEditing(false);
  };
  
  return (
    <Card className={rule.is_locked ? "border-amber-300 bg-amber-50/30" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${rule.is_locked ? 'bg-amber-200' : 'bg-amber-100'}`}>
              <Coins className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">{actionLabel}</h3>
                {rule.is_locked && (
                  <Badge className="bg-amber-500 text-white text-xs">
                    <Lock className="w-3 h-3 mr-1" /> Locked
                  </Badge>
                )}
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
              
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Input
                    type="number"
                    step="0.0000001"
                    value={editGgg}
                    onChange={(e) => setEditGgg(parseFloat(e.target.value) || 0)}
                    className="w-40 font-mono text-sm"
                  />
                  <span className="text-xs text-emerald-600">
                    ≈ ${(editGgg * GGG_TO_USD).toFixed(2)}
                  </span>
                  <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditGgg(rule.ggg_amount); }}>Cancel</Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  Awards <span className="font-bold font-mono text-amber-600">{formatGGGSmart(rule.ggg_amount)} GGG</span>
                  <span className="text-emerald-600 ml-2">(USD {usdVal.toFixed(2)})</span>
                </p>
              )}
              
              {rule.description && (
                <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onLockToggle(rule)}
              className={rule.is_locked ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-slate-400 hover:text-slate-600"}
              title={rule.is_locked ? "Unlock (allow re-seed to reset)" : "Lock (preserve during re-seed)"}
            >
              {rule.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsEditing(!isEditing); setEditGgg(rule.ggg_amount); }}
              className="bg-slate-900 text-white hover:bg-slate-800 font-bold"
            >
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Switch
              checked={rule.is_active}
              onCheckedChange={() => onToggle(rule)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(rule.id)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              disabled={rule.is_locked}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const [bonusMode, setBonusMode] = useState(() => {
    try { return localStorage.getItem('ggg_bonus_mode') === 'true'; } catch { return true; }
  });
  const [bonusMultiplier, setBonusMultiplier] = useState(() => {
    try { return parseFloat(localStorage.getItem('ggg_bonus_multiplier')) || 2.0; } catch { return 2.0; }
  });
  const [newRule, setNewRule] = useState({
    action_type: '',
    ggg_amount: 0,
    description: '',
    is_active: true
  });
  const queryClient = useQueryClient();

  // Persist bonus settings
  const handleBonusModeChange = (enabled) => {
    setBonusMode(enabled);
    try { localStorage.setItem('ggg_bonus_mode', enabled.toString()); } catch {}
  };

  const handleMultiplierChange = (value) => {
    setBonusMultiplier(value);
    try { localStorage.setItem('ggg_bonus_multiplier', value.toString()); } catch {}
  };

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

  const handleToggleLock = (rule) => {
    updateRuleMutation.mutate({
      id: rule.id,
      data: { is_locked: !rule.is_locked }
    });
  };

  const handleDelete = (ruleId) => {
    if (confirm('Delete this GGG reward rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const seedRulesMutation = useMutation({
    mutationFn: async () => {
      // Get existing rules to check for locked ones
      const existingRules = await base44.entities.GGGRewardRule.list();
      const lockedRules = existingRules.filter(r => r.is_locked);
      const lockedActionTypes = new Set(lockedRules.map(r => r.action_type));
      
      // Delete non-locked rules
      const rulesToDelete = existingRules.filter(r => !r.is_locked);
      for (const rule of rulesToDelete) {
        await base44.entities.GGGRewardRule.delete(rule.id);
      }
      
      // Create rules for actions that aren't locked
      for (const action of ACTIONS) {
        if (!lockedActionTypes.has(action.key)) {
          await base44.entities.GGGRewardRule.create({
            action_type: action.key,
            ggg_amount: action.base,
            usd_equivalent: action.usd || (action.base * GGG_TO_USD),
            category: action.category,
            description: action.definition,
            is_active: true,
            is_locked: false
          });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gggRules'] })
  });

  const handleSeedAllRules = () => {
    if (!confirm('This will create all default GGG rules from the matrix. Continue?')) return;
    seedRulesMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">GGG Reward Rules</h2>
          <p className="text-slate-500 mt-1">Configure how users earn GGG points</p>
        </div>
        <div className="flex gap-2">
          <Button
                            onClick={handleSeedAllRules}
                            className="bg-violet-600 hover:bg-violet-700 gap-2"
                            disabled={seedRulesMutation.isPending}
                          >
                            {seedRulesMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Seeding {ACTIONS.length} rules...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                {rules.length > 0 ? 'Re-Seed All Rules' : 'Seed All Rules'}
                              </>
                            )}
                          </Button>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Bonus Period Control Panel */}
      <Card className={bonusMode ? "border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bonusMode ? 'bg-amber-500' : 'bg-slate-200'}`}>
                <Gift className={`w-5 h-5 ${bonusMode ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Bonus Period
                  {bonusMode && <Badge className="bg-amber-500 text-white animate-pulse">ACTIVE</Badge>}
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Multiply all GGG rewards during special periods (onboarding, promotions, etc.)
                </p>
              </div>
            </div>
            <Switch
              checked={bonusMode}
              onCheckedChange={handleBonusModeChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Bonus Multiplier</Label>
                <span className={`font-bold text-lg ${bonusMode ? 'text-amber-600' : 'text-slate-400'}`}>
                  {bonusMultiplier.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[bonusMultiplier]}
                onValueChange={([val]) => handleMultiplierChange(val)}
                min={1.0}
                max={5.0}
                step={0.25}
                disabled={!bonusMode}
                className={bonusMode ? '' : 'opacity-50'}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1.0x (normal)</span>
                <span>2.0x (double)</span>
                <span>3.0x</span>
                <span>4.0x</span>
                <span>5.0x</span>
              </div>
            </div>

            {bonusMode && (
              <div className="p-3 rounded-lg bg-amber-100 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-2">
                  <Zap className="w-4 h-4" />
                  Active Bonus Examples
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { action: 'Profile View', base: 0.0002069 },
                    { action: 'Posting', base: 0.0038624 },
                    { action: 'Forum Post', base: 0.0077248 },
                    { action: 'Mission Participation', base: 0.0154496 },
                  ].map(ex => (
                    <div key={ex.action} className="p-2 bg-white rounded border">
                      <div className="text-slate-600">{ex.action}</div>
                      <div className="font-mono text-amber-700">
                        {formatGGGSmart(ex.base)} → <span className="font-bold">{formatGGGSmart(ex.base * bonusMultiplier)}</span>
                      </div>
                      <div className="text-emerald-600">
                        ${(ex.base * GGG_TO_USD).toFixed(2)} → <span className="font-bold">${(ex.base * bonusMultiplier * GGG_TO_USD).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                            <span className="text-emerald-700 text-sm font-medium">(USD {a.usd?.toFixed(2) || (a.base * GGG_TO_USD).toFixed(2)})</span>
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
        {rules.map((rule) => (
          <RuleCard 
                          key={rule.id} 
                          rule={rule} 
                          onUpdate={updateRuleMutation.mutate}
                          onToggle={handleToggleActive}
                          onLockToggle={handleToggleLock}
                          onDelete={handleDelete}
                        />
        ))}

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