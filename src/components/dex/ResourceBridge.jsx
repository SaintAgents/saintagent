import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Vault, TrendingUp, Shield, FileText, Globe, 
  Lock, CheckCircle, ArrowRight, Coins, Sparkles,
  MapPin, Calendar, Users, Scale
} from 'lucide-react';

const VAULT_LOCATIONS = [
  { country: 'Switzerland', gold: 4250, status: 'active', capacity: 92 },
  { country: 'Singapore', gold: 3180, status: 'active', capacity: 78 },
  { country: 'United States', gold: 2450, status: 'active', capacity: 65 },
  { country: 'UAE', gold: 1890, status: 'active', capacity: 54 },
];

const RESOURCE_STATS = [
  { label: 'Total Gold Vaulted', value: '11,770 kg', icon: Coins, color: 'amber' },
  { label: 'Active Titles', value: '1,247', icon: FileText, color: 'lime' },
  { label: 'UCC Filings', value: '1,247', icon: Scale, color: 'blue' },
  { label: 'Global Reach', value: '142 Countries', icon: Globe, color: 'purple' },
];

export default function ResourceBridge({ theme = 'lime' }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-${theme}-500 flex items-center justify-center`}>
            <Vault className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sacred-Digital Bridge</h2>
            <p className="text-xs text-gray-400">Physical resources → Digital titles → Global liquidity</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RESOURCE_STATS.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`p-3 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                <Icon className={`w-4 h-4 text-${stat.color}-400 mb-2`} />
                <div className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</div>
                <div className="text-[10px] text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Vault Locations */}
      <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className={`w-4 h-4 text-${theme}-400`} />
          Gaia Global Treasury Vaults
        </h3>
        <div className="space-y-3">
          {VAULT_LOCATIONS.map(vault => (
            <div key={vault.country} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Vault className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{vault.country}</div>
                  <div className="text-xs text-gray-400">{vault.gold.toLocaleString()} kg Au</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Capacity</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                      style={{ width: `${vault.capacity}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-400 font-mono">{vault.capacity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* How It Works */}
      <Card className={`bg-gradient-to-br from-${theme}-500/10 to-purple-500/10 border border-${theme}-500/20 backdrop-blur-xl p-5`}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className={`w-4 h-4 text-${theme}-400`} />
          How Neo-NFTs Work
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full bg-${theme}-500/20 flex items-center justify-center mb-2`}>
              <Vault className={`w-6 h-6 text-${theme}-400`} />
            </div>
            <h4 className="text-xs font-semibold text-white mb-1">1. Physical Vault</h4>
            <p className="text-[10px] text-gray-400">Real gold, land, or commodities secured in sovereign vaults</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
              <Scale className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-xs font-semibold text-white mb-1">2. UCC Filing</h4>
            <p className="text-[10px] text-gray-400">Legal perfection through Uniform Commercial Code</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-xs font-semibold text-white mb-1">3. NFT Minting</h4>
            <p className="text-[10px] text-gray-400">Digital title minted on StarChain (ERC-1155)</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-xs font-semibold text-white mb-1">4. Global Trade</h4>
            <p className="text-[10px] text-gray-400">Trade instantly on GDex, settled in GGG</p>
          </div>
        </div>
      </Card>

      {/* Governance */}
      <Card className={`bg-black/40 border border-purple-500/20 backdrop-blur-xl p-4`}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              Crown Flame Office Governance
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                Incorruptible
              </Badge>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              All Neo-NFT issuance, vault custody, and escrow arbitration is overseen by the M1/M2/M3 governance structure, 
              guided by the Living Codex and Seer protocols to ensure sacred integrity.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 font-medium">5 Guardian Nodes</span>
              <span className="text-gray-500">•</span>
              <CheckCircle className="w-3 h-3 text-lime-400" />
              <span className="text-lime-400 font-medium">All Active</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}