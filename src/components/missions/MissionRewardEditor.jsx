import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, Award, TrendingUp, Zap, Shield, Info, AlertTriangle, Wallet, Building2 } from "lucide-react";
import { GGG_TO_USD } from '@/components/earnings/gggMatrix';

// Available badges that can be awarded
const AVAILABLE_BADGES = [
  { code: 'mission_pioneer', label: 'Mission Pioneer', icon: '🚀' },
  { code: 'team_player', label: 'Team Player', icon: '🤝' },
  { code: 'innovator', label: 'Innovator', icon: '💡' },
  { code: 'community_builder', label: 'Community Builder', icon: '🏗️' },
  { code: 'mentor', label: 'Mentor', icon: '🎓' },
  { code: 'impact_maker', label: 'Impact Maker', icon: '🌟' },
  { code: 'first_mission', label: 'First Mission', icon: '🎯' },
  { code: 'streak_keeper', label: 'Streak Keeper', icon: '🔥' },
];

// Available special roles
const AVAILABLE_ROLES = [
  { code: 'mission_leader', label: 'Mission Leader' },
  { code: 'project_coordinator', label: 'Project Coordinator' },
  { code: 'community_champion', label: 'Community Champion' },
  { code: 'beta_tester', label: 'Beta Tester' },
  { code: 'content_creator', label: 'Content Creator' },
];

export default function MissionRewardEditor({ 
  rewards, 
  onChange, 
  requiresApproval,
  onApprovalChange,
  maxGGG,
  canOverrideCap,
  gggFundingSource = 'self',
  onFundingSourceChange,
  userGGGBalance = 0
}) {
  const updateReward = (key, value) => {
    onChange({ ...rewards, [key]: value });
  };

  const gggValue = parseFloat(rewards.reward_ggg) || 0;
  const usdValue = gggValue * GGG_TO_USD;
  const exceedsCap = !canOverrideCap && maxGGG && gggValue > maxGGG;

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-base font-medium">
        <Award className="w-5 h-5 text-amber-500" />
        Reward Structure
      </Label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GGG Reward */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <Label className="font-medium">GGG Tokens</Label>
            </div>
            <Input
              type="number"
              step="0.01"
              value={rewards.reward_ggg || ''}
              onChange={(e) => updateReward('reward_ggg', e.target.value)}
              placeholder="0.00"
              className={exceedsCap ? 'border-red-300' : ''}
            />
            <p className="text-xs text-slate-500">
              ≈ ${usdValue.toFixed(2)} USD
              {maxGGG && !canOverrideCap && (
                <span className="block text-slate-400">Max: {maxGGG.toFixed(2)} GGG</span>
              )}
            </p>
            {exceedsCap && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Exceeds cap - requires approval
              </p>
            )}

            {/* Funding Source Selector */}
            {gggValue > 0 && (
              <div className="pt-2 border-t border-amber-200 space-y-2">
                <Label className="text-xs font-medium text-amber-800">Funding Source</Label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onFundingSourceChange?.('self')}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all text-xs ${
                      gggFundingSource === 'self'
                        ? 'border-amber-500 bg-amber-100'
                        : 'border-slate-200 hover:border-amber-300 bg-white'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">My Wallet</p>
                      <p className="text-slate-500 truncate">Balance: {userGGGBalance.toFixed(2)} GGG</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFundingSourceChange?.('platform')}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all text-xs ${
                      gggFundingSource === 'platform'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-violet-300 bg-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-violet-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">Request Platform Funding</p>
                      <p className="text-slate-500">Admin approval required</p>
                    </div>
                  </button>
                </div>
                {gggFundingSource === 'self' && gggValue > userGGGBalance && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Insufficient balance ({userGGGBalance.toFixed(2)} GGG available)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rank Points */}
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <Label className="font-medium">Rank Points</Label>
            </div>
            <Input
              type="number"
              value={rewards.reward_rank_points || ''}
              onChange={(e) => updateReward('reward_rank_points', e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-slate-500">
              Points toward rank advancement
            </p>
          </CardContent>
        </Card>

        {/* Boost Multiplier */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <Label className="font-medium">Boost Multiplier</Label>
            </div>
            <Input
              type="number"
              step="0.5"
              value={rewards.reward_boost || ''}
              onChange={(e) => updateReward('reward_boost', e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-slate-500">
              Temporary visibility boost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Selection */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <Label className="font-medium">Badge Reward (Optional)</Label>
          </div>
          <Select
            value={rewards.reward_badge_code || ''}
            onValueChange={(v) => updateReward('reward_badge_code', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a badge to award" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No badge</SelectItem>
              {AVAILABLE_BADGES.map(badge => (
                <SelectItem key={badge.code} value={badge.code}>
                  <span className="flex items-center gap-2">
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {rewards.reward_badge_code && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {AVAILABLE_BADGES.find(b => b.code === rewards.reward_badge_code)?.icon}
                {AVAILABLE_BADGES.find(b => b.code === rewards.reward_badge_code)?.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Role */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <Label className="font-medium">Special Role (Optional)</Label>
          </div>
          <Select
            value={rewards.reward_role || ''}
            onValueChange={(v) => updateReward('reward_role', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role to grant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No role</SelectItem>
              {AVAILABLE_ROLES.map(role => (
                <SelectItem key={role.code} value={role.code}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* GGG Approval Request */}
      {gggValue > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="w-4 h-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">GGG Reward Approval</p>
              <p className="text-sm text-amber-700">
                Missions with GGG rewards {exceedsCap ? 'exceeding the cap ' : ''}require admin approval before participants can earn tokens.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Checkbox
                id="requiresApproval"
                checked={requiresApproval || exceedsCap}
                onCheckedChange={onApprovalChange}
                disabled={exceedsCap}
              />
              <Label htmlFor="requiresApproval" className="text-sm text-amber-800">
                Request Approval
              </Label>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}