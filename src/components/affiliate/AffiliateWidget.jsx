import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, TrendingUp, ArrowRight } from "lucide-react";
import { createPageUrl } from '@/utils';

export default function AffiliateWidget() {
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCode'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.AffiliateCode.filter({ user_id: user.email });
    }
  });
  
  const affiliateCode = affiliateCodes[0];

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Referral.filter({ affiliate_user_id: user.email }, '-created_date', 5);
    }
  });

  const thisWeekReferrals = referrals.filter(r => {
    const created = new Date(r.created_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo && r.status === 'paid';
  });

  const gggThisWeek = thisWeekReferrals.reduce((sum, r) => sum + (r.ggg_amount || 0), 0);

  if (!affiliateCode) return null;

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="w-4 h-4 text-violet-600" />
          Affiliate Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-white/60">
            <p className="text-xs text-slate-500 mb-1">This Week</p>
            <p className="text-lg font-bold text-violet-600">+{gggThisWeek.toFixed(2)}</p>
            <p className="text-xs text-slate-500">GGG</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/60">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-lg font-bold text-slate-900">{affiliateCode.total_paid || 0}</p>
            <p className="text-xs text-slate-500">Paid</p>
          </div>
        </div>

        {affiliateCode.total_paid > 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>Great progress!</span>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full text-xs"
          onClick={() => window.location.href = createPageUrl('AffiliateCenter')}
        >
          View Details
          <ArrowRight className="w-3 h-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}