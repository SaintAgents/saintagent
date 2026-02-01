import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, XCircle, Info, Clock, Lock, Send } from 'lucide-react';
import { toast } from 'sonner';
import ROLE_DEFS, { ROLE_ORDER, RANK_ORDER } from './RoleDefinitions';

const RANK_LABELS = {
  seeker: 'Seeker',
  initiate: 'Initiate', 
  adept: 'Adept',
  practitioner: 'Practitioner',
  master: 'Master',
  sage: 'Sage',
  oracle: 'Oracle',
  ascended: 'Ascended',
  guardian: 'Guardian'
};

function meetsRankRequirement(userRank, requiredRank) {
  if (!requiredRank) return true;
  const userIdx = RANK_ORDER.indexOf(userRank || 'seeker');
  const reqIdx = RANK_ORDER.indexOf(requiredRank);
  return userIdx >= reqIdx;
}

export default function UserRolesPanel({ profile }) {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const isAdmin = me?.role === 'admin';
  const isOwnProfile = me?.email === profile?.user_id;
  const userRank = profile?.rank_code || 'seeker';

  const { data: assigned = [] } = useQuery({
    queryKey: ['userRoles', profile?.user_id],
    queryFn: () => base44.entities.UserRole.filter({ user_id: profile.user_id }),
    enabled: !!profile?.user_id
  });
  
  const activeRoles = assigned.filter(r => r.status === 'active');
  const pendingRoles = assigned.filter(r => r.status === 'pending');
  const assignedMap = Object.fromEntries(activeRoles.map(r => [r.role_code, r]));
  const pendingMap = Object.fromEntries(pendingRoles.map(r => [r.role_code, r]));

  // Auto-assign member role check
  const isMember = true; // All registered users are members

  const requestRole = useMutation({
    mutationFn: async (role_code) => {
      const meUser = await base44.auth.me();
      return base44.entities.UserRole.create({ 
        user_id: profile.user_id, 
        role_code, 
        status: 'pending', 
        requested_by: meUser.email,
        requested_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] });
      toast.success('Role request submitted for admin review');
    }
  });

  const assign = useMutation({
    mutationFn: async (role_code) => {
      const meUser = await base44.auth.me();
      // Check if there's a pending request
      const pending = pendingMap[role_code];
      if (pending) {
        return base44.entities.UserRole.update(pending.id, { 
          status: 'active', 
          assigned_by: meUser.email,
          assigned_at: new Date().toISOString()
        });
      }
      return base44.entities.UserRole.create({ 
        user_id: profile.user_id, 
        role_code, 
        status: 'active', 
        assigned_by: meUser.email,
        assigned_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] });
      toast.success('Role assigned');
    }
  });

  const revoke = useMutation({
    mutationFn: async (role_code) => {
      const rec = assignedMap[role_code] || pendingMap[role_code];
      if (!rec) return;
      return base44.entities.UserRole.update(rec.id, { status: 'revoked' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] });
      toast.success('Role revoked');
    }
  });

  const deny = useMutation({
    mutationFn: async (role_code) => {
      const rec = pendingMap[role_code];
      if (!rec) return;
      return base44.entities.UserRole.update(rec.id, { status: 'denied' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] });
      toast.success('Role request denied');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="dark:bg-slate-900 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-600" />
            Core Roles & Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
            Leadership is earned across five domains: Identity, Judgment, Care, Stability, and Alignment. Roles apply responsibility; rank builds trust.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLE_ORDER.map((code) => {
              const def = ROLE_DEFS[code];
              const isAssigned = code === 'member' ? isMember : !!assignedMap[code];
              const isPending = !!pendingMap[code];
              const meetsRank = meetsRankRequirement(userRank, def.min_rank);
              const canRequest = def.requestable && !isAssigned && !isPending && meetsRank && isOwnProfile;
              const isLocked = def.locked;
              
              return (
                <div key={code} className="p-4 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-600">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{def.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Who: {def.who}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Purpose: {def.purpose}</div>
                    </div>
                    <div>
                      {isAssigned ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      ) : isPending ? (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      ) : isLocked ? (
                        <Badge variant="outline" className="text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Reserved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="dark:border-slate-500 dark:text-slate-400">Not assigned</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Capabilities</div>
                    <ul className="list-disc ml-5 text-xs text-slate-700 dark:text-slate-400 space-y-0.5">
                      {def.capabilities.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                    {def.notes && <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-500">{def.notes}</div>}
                    {def.min_rank && (
                      <div className="mt-1 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                        Requires: {RANK_LABELS[def.min_rank]}+ rank
                        {!meetsRank && <span className="text-rose-500 ml-1">(not met)</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-3 flex items-center justify-end gap-2">
                    {/* User can request role */}
                    {canRequest && !isAdmin && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-lg text-violet-600 border-violet-200"
                        onClick={() => requestRole.mutate(code)}
                        disabled={requestRole.isPending}
                      >
                        <Send className="w-3 h-3 mr-1" /> Request Role
                      </Button>
                    )}
                    
                    {/* Admin controls */}
                    {isAdmin && !isLocked && code !== 'member' && (
                      <>
                        {isPending && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-lg text-rose-600 border-rose-200"
                              onClick={() => deny.mutate(code)}
                            >
                              Deny
                            </Button>
                            <Button 
                              size="sm" 
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => assign.mutate(code)}
                            >
                              Approve
                            </Button>
                          </>
                        )}
                        {isAssigned && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg text-rose-700 border-rose-200"
                            onClick={() => revoke.mutate(code)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Revoke
                          </Button>
                        )}
                        {!isAssigned && !isPending && (
                          <Button 
                            size="sm" 
                            className="rounded-lg bg-violet-600 hover:bg-violet-700"
                            onClick={() => assign.mutate(code)}
                          >
                            Assign
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role vs Rank Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-600" /> Role vs Rank Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-800">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Concept</th>
                  <th className="text-left px-3 py-2 font-semibold">Rank</th>
                  <th className="text-left px-3 py-2 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Earned progression</td>
                  <td className="px-3 py-2">✅</td>
                  <td className="px-3 py-2">❌</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Functional authority</td>
                  <td className="px-3 py-2">❌</td>
                  <td className="px-3 py-2">✅</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Visual indicator</td>
                  <td className="px-3 py-2">Badge / Ring</td>
                  <td className="px-3 py-2">UI label</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Revocable</td>
                  <td className="px-3 py-2">❌</td>
                  <td className="px-3 py-2">✅</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Identity-defining</td>
                  <td className="px-3 py-2">✅</td>
                  <td className="px-3 py-2">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Best practice: never auto-assign roles based solely on rank; never show roles more prominently than rank.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}