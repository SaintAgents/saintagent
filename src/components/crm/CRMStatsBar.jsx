import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Share2, Award, TrendingUp, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_CONFIG = {
  observer: { label: 'Observer', color: 'bg-slate-100 text-slate-700', min: 0 },
  contributor: { label: 'Contributor', color: 'bg-blue-100 text-blue-700', min: 5 },
  connector: { label: 'Connector', color: 'bg-emerald-100 text-emerald-700', min: 15 },
  networker: { label: 'Networker', color: 'bg-violet-100 text-violet-700', min: 30 },
  architect: { label: 'Architect', color: 'bg-amber-100 text-amber-700', min: 50 }
};

export default function CRMStatsBar({ totalContacts = 0, federatedCount = 0, contribution }) {
  const tier = contribution?.contribution_tier || 'observer';
  const tierConfig = TIER_CONFIG[tier];

  const stats = [
    { label: 'Total Contacts', value: totalContacts, icon: Users, color: 'text-slate-600' },
    { label: 'Federated', value: federatedCount, icon: Globe, color: 'text-violet-600' },
    { label: 'Intros Made', value: contribution?.introductions_made || 0, icon: Share2, color: 'text-blue-600' },
    { label: 'Successful', value: contribution?.successful_connections || 0, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'GGG Earned', value: contribution?.ggg_earned_crm || 0, icon: Coins, color: 'text-amber-600' }
  ];

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Contribution Tier</p>
            <Badge className={cn("mt-1", tierConfig.color)}>
              <Award className="w-3 h-3 mr-1" />
              {tierConfig.label}
            </Badge>
          </div>
          {contribution?.avg_intro_rating > 0 && (
            <div className="text-right pl-3 border-l">
              <p className="text-xs text-slate-500">Avg Rating</p>
              <p className="text-lg font-bold text-slate-900">{contribution.avg_intro_rating.toFixed(1)}/5</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}