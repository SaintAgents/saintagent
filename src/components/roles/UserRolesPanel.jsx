import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, XCircle, Info } from 'lucide-react';
import ROLE_DEFS, { ROLE_ORDER } from './RoleDefinitions';

export default function UserRolesPanel({ profile }) {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const isAdmin = me?.role === 'admin';

  const { data: assigned = [] } = useQuery({
    queryKey: ['userRoles', profile?.user_id],
    queryFn: () => base44.entities.UserRole.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });
  const assignedMap = Object.fromEntries((assigned || []).map(r => [r.role_code, r]));

  const assign = useMutation({
    mutationFn: async (role_code) => {
      const meUser = await base44.auth.me();
      return base44.entities.UserRole.create({ user_id: profile.user_id, role_code, status: 'active', assigned_by: meUser.email });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] })
  });

  const revoke = useMutation({
    mutationFn: async (role_code) => {
      const rec = assignedMap[role_code];
      if (!rec) return;
      return base44.entities.UserRole.update(rec.id, { status: 'revoked' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] })
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-600" />
            Core Roles & Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 mb-3">
            Leadership is earned across five domains: Identity, Judgment, Care, Stability, and Alignment. Roles apply responsibility; rank builds trust.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLE_ORDER.map((code) => {
              const def = ROLE_DEFS[code];
              const isAssigned = !!assignedMap[code];
              return (
                <div key={code} className="p-4 rounded-xl border bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{def.title}</div>
                      <div className="text-xs text-slate-600">Who: {def.who}</div>
                      <div className="text-xs text-slate-600">Purpose: {def.purpose}</div>
                    </div>
                    <div>
                      {isAssigned ? (
                        <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not assigned</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">Capabilities</div>
                    <ul className="list-disc ml-5 text-xs text-slate-700 space-y-0.5">
                      {def.capabilities.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                    {def.notes && <div className="mt-2 text-[11px] text-slate-500">{def.notes}</div>}
                  </div>
                  {isAdmin && (
                    <div className="mt-3 text-right">
                      {isAssigned ? (
                        <Button size="sm" variant="outline" className="rounded-lg text-rose-700 border-rose-200" onClick={() => revoke.mutate(code)}>
                          <XCircle className="w-4 h-4 mr-1" /> Revoke
                        </Button>
                      ) : (
                        <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700" onClick={() => assign.mutate(code)}>
                          Assign
                        </Button>
                      )}
                    </div>
                  )}
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