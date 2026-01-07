import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Calculator, Info } from 'lucide-react';
import { ACTIONS, MATRIX_SECTIONS, TIERS, GGG_TO_USD, INTERACTION_BONUS_GGG, calculatePayout } from '@/components/earnings/gggMatrix';

// Helper to format GGG with proper decimals
const formatGGG = (val) => val.toFixed(7);
const formatUSD = (val) => val.toFixed(2);

export default function EarningsMatrixModal({ open, onOpenChange }) {
  const [actionKey, setActionKey] = useState('post_update');
  const [lifts, setLifts] = useState({ verified: true, securityTrained: false, impactAdopted: false, leadership: false });

  const payout = useMemo(() => calculatePayout(actionKey, lifts), [actionKey, lifts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            GGG Earnings Matrix
          </DialogTitle>
          <DialogDescription>Contribution-based payouts. 1.0000000 GGG = ${GGG_TO_USD.toFixed(2)} (1 gram gold)</DialogDescription>
        </DialogHeader>
        
        {/* Tier Reference Table */}
        <div className="px-6 py-3 bg-gradient-to-r from-violet-50 to-amber-50 border-y">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-slate-700">All 11 Tiers (GGG → USD)</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1 text-xs">
            {TIERS.map((tier, idx) => (
              <div key={tier} className="p-1.5 bg-white rounded border text-center">
                <div className="font-mono font-semibold text-violet-700">{formatGGG(tier)}</div>
                <div className="text-slate-500">≈ ${formatUSD(tier * GGG_TO_USD)}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-amber-700 flex items-center gap-1">
            <span className="font-semibold">Posting Bonus:</span> +{formatGGG(INTERACTION_BONUS_GGG)} GGG (${formatUSD(INTERACTION_BONUS_GGG * GGG_TO_USD)}) for 5+ interactions
          </div>
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matrix overview */}
          <ScrollArea className="h-[400px] border rounded-xl bg-white/50">
            <div className="p-4 space-y-3">
              {MATRIX_SECTIONS.map(sec => (
                <div key={sec.tier} className="p-3 rounded-lg border bg-white">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="font-semibold text-slate-900">{sec.title}</div>
                    <Badge className="bg-violet-600 font-mono">{formatGGG(sec.tier)} GGG ≈ ${formatUSD(sec.tier * GGG_TO_USD)}</Badge>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    {sec.items.map((it, i) => (<li key={i}>{it}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Calculator */}
          <div className="p-4 rounded-xl border bg-white/50">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-slate-500" />
              <div className="font-semibold text-slate-900">Payout Calculator</div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Action</label>
                <Select value={actionKey} onValueChange={setActionKey}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map(a => (
                      <SelectItem key={a.key} value={a.key}>{a.title} ({a.base.toFixed(7)} GGG)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 text-xs text-slate-500 min-h-10">
                  {ACTIONS.find(a => a.key === actionKey)?.definition}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={lifts.verified} onCheckedChange={(v) => setLifts({ ...lifts, verified: !!v })} />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={lifts.securityTrained} onCheckedChange={(v) => setLifts({ ...lifts, securityTrained: !!v })} />
                  Security Trained
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={lifts.impactAdopted} onCheckedChange={(v) => setLifts({ ...lifts, impactAdopted: !!v })} />
                  Impact Adopted
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={lifts.leadership} onCheckedChange={(v) => setLifts({ ...lifts, leadership: !!v })} />
                  Leadership
                </label>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-slate-50 border text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600">Base</span>
                  <span className="font-medium">{payout.base.toFixed(7)} GGG • ${(payout.base * GGG_TO_USD).toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Payout</span>
                  <span className="font-semibold text-slate-900">{payout.tier.toFixed(7)} GGG • ${payout.usd.toFixed(3)}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500">Lifts apply as gates and upgrades; payouts capped at 0.50 GGG.</div>
              <Button onClick={() => onOpenChange?.(false)} className="w-full rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}