import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Key, Clock, User, Eye, Download, Play, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

export default function DRXIncomingAccess({ grants }) {
  const activeGrants = grants.filter(g => g.status === 'active');
  const expiredGrants = grants.filter(g => g.status !== 'active');

  const getDaysLeft = (grant) => {
    if (!grant.expiration_date) return null;
    return differenceInDays(new Date(grant.expiration_date), new Date());
  };

  const getAccessButton = (grant) => {
    const scope = grant.access_scope || [];
    if (scope.includes('download')) {
      return (
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
          <Download className="w-3 h-3" /> Download
        </Button>
      );
    }
    if (scope.includes('stream') || scope.includes('view')) {
      return (
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1">
          <Play className="w-3 h-3" /> Access
        </Button>
      );
    }
    return (
      <Button size="sm" className="bg-slate-600 hover:bg-slate-700 gap-1">
        <Eye className="w-3 h-3" /> View
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Access Rights</h2>
        <p className="text-slate-400">Digital assets others have granted you access to</p>
      </div>

      {grants.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-16 text-center">
            <Key className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No access rights yet</h3>
            <p className="text-slate-400">When others grant you access to their assets, they'll appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Access */}
          {activeGrants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Active Access ({activeGrants.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activeGrants.map((grant) => {
                  const daysLeft = getDaysLeft(grant);
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 7;
                  
                  return (
                    <Card 
                      key={grant.id} 
                      className={`bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all ${isExpiringSoon ? 'border-amber-500/30' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-400" />
                          </div>
                          {isExpiringSoon ? (
                            <Badge className="bg-amber-500/20 text-amber-300">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {daysLeft}d left
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
                          )}
                        </div>

                        <h4 className="font-semibold text-white mb-1">{grant.asset_title}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                          <User className="w-3 h-3" />
                          <span>From: {grant.grantor_name}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          {grant.access_scope?.map((scope, i) => (
                            <Badge key={i} className="bg-indigo-500/20 text-indigo-300 text-xs capitalize">
                              {scope}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {daysLeft !== null ? `Expires ${format(new Date(grant.expiration_date), 'MMM d')}` : 'Unlimited'}
                          </div>
                          {getAccessButton(grant)}
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
                          Token: {grant.rights_token}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expired Access */}
          {expiredGrants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Expired ({expiredGrants.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4 opacity-50">
                {expiredGrants.slice(0, 4).map((grant) => (
                  <Card key={grant.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-sm">{grant.asset_title}</h4>
                          <span className="text-xs text-slate-500">Expired</span>
                        </div>
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