import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lock, Unlock, Shield, FileCheck, Clock, AlertTriangle, 
  CheckCircle2, Diamond, Droplet, Zap, ArrowRight, Calendar,
  User, Building, Scale, Coins, Sparkles
} from 'lucide-react';

const ESCROW_TYPES = [
  { id: 'oil', label: 'Oil & Gas', icon: Droplet, color: 'orange' },
  { id: 'diamonds', label: 'Diamonds & Gems', icon: Diamond, color: 'purple' },
  { id: 'gold', label: 'Gold & Precious Metals', icon: Coins, color: 'amber' },
  { id: 'real_estate', label: 'Real Estate', icon: Building, color: 'blue' },
  { id: 'energy', label: 'Energy Credits', icon: Zap, color: 'lime' },
];

const MOCK_ESCROWS = [
  {
    id: 1,
    type: 'diamonds',
    title: '5ct Colombian Emerald',
    parties: { seller: 'DiamondVault.dao', buyer: 'RoyalCollector.eth' },
    value: 850000,
    goldBacking: 250,
    status: 'active',
    expiryDate: '2026-04-15',
    ucc: 'UCC-2026-ESC-DIA-00142',
    conditions: ['Third-party certification', 'Physical delivery to vault', 'Insurance verification'],
    progress: 66
  },
  {
    id: 2,
    type: 'oil',
    title: '5000 Barrel WTI Crude',
    parties: { seller: 'PetroSov.org', buyer: 'EnergyTrust.io' },
    value: 425000,
    goldBacking: 125,
    status: 'pending',
    expiryDate: '2026-02-28',
    ucc: 'UCC-2026-ESC-OIL-00089',
    conditions: ['Quality assurance test', 'Delivery logistics confirmed', 'Payment in GGG verified'],
    progress: 33
  },
  {
    id: 3,
    type: 'real_estate',
    title: 'Manhattan Commercial Property',
    parties: { seller: 'UrbanLand.trust', buyer: 'GlobalRealtyDAO' },
    value: 12500000,
    goldBacking: 3500,
    status: 'completed',
    expiryDate: '2025-12-20',
    ucc: 'UCC-2025-ESC-RE-00234',
    conditions: ['Title search completed', 'Liens cleared', 'Transfer recorded'],
    progress: 100
  },
];

const STATUS_STYLES = {
  active: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30', icon: Lock },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle2 },
  disputed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: AlertTriangle },
};

export default function EscrowManager({ theme = 'lime' }) {
  const [filter, setFilter] = useState('all');
  const [selectedEscrow, setSelectedEscrow] = useState(null);

  const filtered = filter === 'all' 
    ? MOCK_ESCROWS 
    : MOCK_ESCROWS.filter(e => e.type === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className={`w-6 h-6 text-${theme}-400`} />
              Sovereign Escrow System
            </h2>
            <p className="text-xs text-gray-400 mt-1">UCC-perfected custody for high-value commodities</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-400">Asset Type:</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className={`w-48 h-8 text-xs bg-black/60 border-${theme}-500/30 text-white`}>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0f] border-gray-700">
              <SelectItem value="all" className="text-white text-xs hover:bg-lime-500/20">All Types</SelectItem>
              {ESCROW_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id} className="text-white text-xs hover:bg-lime-500/20">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Escrow Cards */}
      <div className="space-y-3">
        {filtered.map(escrow => {
          const statusStyle = STATUS_STYLES[escrow.status];
          const StatusIcon = statusStyle.icon;
          const typeInfo = ESCROW_TYPES.find(t => t.id === escrow.type);
          const TypeIcon = typeInfo?.icon || Lock;

          return (
            <Card 
              key={escrow.id}
              className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl overflow-hidden hover:border-${theme}-500/40 transition-all cursor-pointer`}
              onClick={() => setSelectedEscrow(escrow)}
            >
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-${typeInfo?.color}-500/20 flex items-center justify-center shrink-0`}>
                      <TypeIcon className={`w-6 h-6 text-${typeInfo?.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{escrow.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">UCC: {escrow.ucc}</p>
                    </div>
                  </div>
                  <Badge className={`${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {escrow.status}
                  </Badge>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-2 rounded-lg bg-${theme}-500/5 border border-${theme}-500/10`}>
                    <div className="text-gray-400 mb-1">Seller</div>
                    <div className="text-white font-medium">{escrow.parties.seller}</div>
                  </div>
                  <div className={`p-2 rounded-lg bg-${theme}-500/5 border border-${theme}-500/10`}>
                    <div className="text-gray-400 mb-1">Buyer</div>
                    <div className="text-white font-medium">{escrow.parties.buyer}</div>
                  </div>
                </div>

                {/* Value & Backing */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-gray-400 text-xs">Escrow Value</div>
                    <div className={`text-${theme}-400 font-bold font-mono text-lg`}>
                      {escrow.value.toLocaleString()} GGG
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">Gold Collateral</div>
                    <div className="text-amber-400 font-bold flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {escrow.goldBacking}g Au
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400">Conditions Met</span>
                    <span className="text-white">{escrow.progress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-${theme}-500 to-emerald-500 transition-all`}
                      style={{ width: `${escrow.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {escrow.conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle2 className={`w-3 h-3 ${idx < Math.floor(escrow.conditions.length * escrow.progress / 100) ? 'text-lime-400' : 'text-gray-600'}`} />
                        {cond}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Expires: {escrow.expiryDate}
                  </div>
                  {escrow.status === 'active' && (
                    <Button size="sm" className={`bg-${theme}-500/20 text-${theme}-400 hover:bg-${theme}-500/30 text-xs h-7`}>
                      View Details
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Educational Panel */}
      <Card className={`bg-gradient-to-br from-purple-500/10 to-${theme}-500/10 border border-purple-500/20 backdrop-blur-xl p-4`}>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-1">UCC-Perfected</h4>
              <p className="text-gray-300">All escrows are legally perfected through Uniform Commercial Code filings, ensuring enforceability worldwide.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Coins className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-1">Gold-Collateralized</h4>
              <p className="text-gray-300">Every escrow is backed by physical gold in sovereign vaults, providing intrinsic value beyond digital scarcity.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Scale className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-1">Smart Arbitration</h4>
              <p className="text-gray-300">Crown Flame Office oversight ensures incorruptible dispute resolution through M1/M2/M3 governance structure.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}