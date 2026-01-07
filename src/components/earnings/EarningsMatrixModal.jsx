import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Coins, Calculator, Info, List } from 'lucide-react';
import { ACTIONS, MATRIX_SECTIONS, TIERS, GGG_TO_USD, INTERACTION_BONUS_GGG, calculatePayout } from '@/components/earnings/gggMatrix';
import ActionsEarningsTable from '@/components/earnings/ActionsEarningsTable';

// Helper to format GGG with proper decimals
const formatGGG = (val) => val.toFixed(7);
const formatUSD = (val) => val.toFixed(2);

export default function EarningsMatrixModal({ open, onOpenChange }) {
  const [actionKey, setActionKey] = useState('post_update');
  const [lifts, setLifts] = useState({ verified: true, securityTrained: false, impactAdopted: false, leadership: false });

  const payout = useMemo(() => calculatePayout(actionKey, lifts), [actionKey, lifts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[90vh]">
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

        <Tabs defaultValue="tiers" className="px-6 pb-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="tiers" className="gap-2">
              <Coins className="w-4 h-4" />
              Tiers
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <List className="w-4 h-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
          </TabsList>

          {/* Tiers Overview Tab */}
          <TabsContent value="tiers">
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
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <ScrollArea className="h-[400px] border rounded-xl bg-white/50">
              <div className="p-4">
                <ActionsEarningsTable />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <div className="p-4 rounded-xl border bg-white/50">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Action</label>
                  <Select value={actionKey} onValueChange={setActionKey}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map(a => (
                        <SelectItem key={a.key} value={a.key}>{a.title} ({formatGGG(a.base)} GGG)</SelectItem>
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

                <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-violet-50 to-amber-50 border text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Base Tier</span>
                    <span className="font-mono font-medium">{formatGGG(payout.base)} GGG ≈ ${formatUSD(payout.base * GGG_TO_USD)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-semibold">Final Payout</span>
                    <span className="font-mono font-bold text-violet-700">{formatGGG(payout.tier)} GGG ≈ ${formatUSD(payout.usd)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">Lifts apply as gates and upgrades; max payout = 1.0000000 GGG ($145.00).</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="px-6 pb-4">
          <Button onClick={() => onOpenChange?.(false)} className="w-full rounded-xl">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}