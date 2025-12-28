import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Calculator } from 'lucide-react';
import { ACTIONS, MATRIX_SECTIONS, TIERS, GGG_TO_USD, calculatePayout } from '@/components/earnings/gggMatrix';

export default function EarningsMatrixModal({ open, onOpenChange }) {
  const [actionKey, setActionKey] = useState('post_update');
  const [lifts, setLifts] = useState({ verified: true, securityTrained: false, impactAdopted: false, leadership: false });

  const payout = useMemo(() => calculatePayout(actionKey, lifts), [actionKey, lifts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            GGG Earnings Matrix
          </DialogTitle>
          <DialogDescription>Contribution-based payouts with relational lifts. 1.00 GGG = ${GGG_TO_USD.toFixed(2)}</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matrix overview */}
          <ScrollArea className="h-80 border rounded-xl bg-white/50">
            <div className="p-4 space-y-3">
              {MATRIX_SECTIONS.map(sec => (
                <div key={sec.tier} className="p-3 rounded-lg border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-900">{sec.title}</div>
                    <Badge className="bg-violet-600">{sec.tier.toFixed(2)} GGG • ${(sec.tier * GGG_TO_USD).toFixed(2)}</Badge>
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
                      <SelectItem key={a.key} value={a.key}>{a.title} ({a.base.toFixed(2)} GGG)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <span className="font-medium">{payout.base.toFixed(2)} GGG • ${(payout.base * GGG_TO_USD).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Payout</span>
                  <span className="font-semibold text-slate-900">{payout.tier.toFixed(2)} GGG • ${payout.usd.toFixed(2)}</span>
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