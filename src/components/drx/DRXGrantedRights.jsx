import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Key, Clock, User, XCircle, CheckCircle2, AlertTriangle, Eye, Download, Edit3
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

const ACCESS_ICONS = {
  view: Eye,
  stream: Eye,
  download: Download,
  edit: Edit3
};

export default function DRXGrantedRights({ grants }) {
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: async (grantId) => {
      await base44.entities.DRXRightsGrant.update(grantId, { status: 'revoked' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drxGrantsOut'] });
      toast.success('Access revoked');
    }
  });

  const activeGrants = grants.filter(g => g.status === 'active');
  const expiredGrants = grants.filter(g => g.status === 'expired' || g.status === 'revoked');

  const getDaysLeft = (grant) => {
    if (!grant.expiration_date) return null;
    const days = differenceInDays(new Date(grant.expiration_date), new Date());
    return days;
  };

  const getStatusBadge = (grant) => {
    if (grant.status === 'revoked') {
      return <Badge className="bg-red-500/20 text-red-300"><XCircle className="w-3 h-3 mr-1" /> Revoked</Badge>;
    }
    if (grant.status === 'expired') {
      return <Badge className="bg-slate-500/20 text-slate-300"><Clock className="w-3 h-3 mr-1" /> Expired</Badge>;
    }
    const daysLeft = getDaysLeft(grant);
    if (daysLeft !== null && daysLeft <= 3) {
      return <Badge className="bg-amber-500/20 text-amber-300"><AlertTriangle className="w-3 h-3 mr-1" /> Expires in {daysLeft}d</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Granted Rights</h2>
        <p className="text-slate-400">Access you've given to others for your assets</p>
      </div>

      {grants.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-16 text-center">
            <Key className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No grants yet</h3>
            <p className="text-slate-400">When you grant access to your assets, they'll appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Grants */}
          {activeGrants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Active ({activeGrants.length})
              </h3>
              <div className="space-y-3">
                {activeGrants.map((grant) => {
                  const daysLeft = getDaysLeft(grant);
                  return (
                    <Card key={grant.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                              <Key className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{grant.asset_title}</h4>
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <User className="w-3 h-3" />
                                <span>{grant.grantee_name || grant.grantee_email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {getStatusBadge(grant)}
                              <div className="text-xs text-slate-500 mt-1">
                                Token: {grant.rights_token}
                              </div>
                            </div>
                            {grant.is_revocable && grant.status === 'active' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => revokeMutation.mutate(grant.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysLeft !== null ? `${daysLeft} days left` : 'Unlimited'}
                          </span>
                          <span>Access: {grant.access_scope?.join(', ')}</span>
                          {grant.monetization?.price_ggg && (
                            <span className="text-emerald-400">{grant.monetization.price_ggg} GGG</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expired/Revoked Grants */}
          {expiredGrants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Past ({expiredGrants.length})
              </h3>
              <div className="space-y-3 opacity-60">
                {expiredGrants.slice(0, 5).map((grant) => (
                  <Card key={grant.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
                            <Key className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{grant.asset_title}</h4>
                            <span className="text-sm text-slate-400">{grant.grantee_name || grant.grantee_email}</span>
                          </div>
                        </div>
                        {getStatusBadge(grant)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}