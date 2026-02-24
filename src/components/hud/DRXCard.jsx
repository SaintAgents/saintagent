import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Key, Sparkles, TrendingUp, DollarSign, Calendar, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

export default function DRXCard() {
  const { data: myAssets = [] } = useQuery({
    queryKey: ['myDRXAssets'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DRXAsset.filter({ owner_id: user.email }, '-created_date', 5);
    },
    staleTime: 60000
  });
  
  const { data: myGrants = [] } = useQuery({
    queryKey: ['myDRXGrants'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DRXRightsGrant.filter({ grantee_id: user.email, status: 'active' }, '-created_date', 5);
    },
    staleTime: 60000
  });
  
  const totalRevenue = myAssets.reduce((sum, asset) => sum + (asset.total_revenue_ggg || 0), 0);
  const activeGrants = myGrants.filter(g => g.status === 'active').length;
  
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <p className="text-xs text-violet-700 dark:text-violet-300">My Assets</p>
          </div>
          <p className="text-xl font-bold text-violet-900 dark:text-white">{myAssets.length}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Revenue</p>
          </div>
          <p className="text-xl font-bold text-emerald-900 dark:text-white">{totalRevenue.toFixed(0)} GGG</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-300">Access</p>
          </div>
          <p className="text-xl font-bold text-amber-900 dark:text-white">{activeGrants}</p>
        </div>
      </div>
      
      {/* Recent Assets */}
      {myAssets.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Your Assets</p>
          {myAssets.slice(0, 3).map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{asset.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">{asset.asset_type}</Badge>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">{asset.total_revenue_ggg || 0} GGG earned</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">No digital assets yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Upload content and start earning from licensing</p>
        </div>
      )}
      
      <Button 
        className="w-full gap-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
        onClick={() => window.location.href = createPageUrl('DigitalRightsExchange')}
      >
        <Key className="w-4 h-4" />
        Open DRX Exchange
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Button>
    </div>
  );
}