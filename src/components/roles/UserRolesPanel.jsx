import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, Shield, XCircle, Info, Lock, Clock, 
  Send, AlertCircle, Crown
} from 'lucide-react';
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

export default function UserRolesPanel({ profile }) {
  const qc = useQueryClient();
  const [requestingRole, setRequestingRole] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const isAdmin = me?.role === 'admin';
  const isOwnProfile = profile?.user_id === me?.email;

  const { data: assigned = [] } = useQuery({
    queryKey: ['userRoles', profile?.user_id],
    queryFn: () => base44.entities.UserRole.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['roleRequests', profile?.user_id],
    queryFn: () => base44.entities.UserRole.filter({ user_id: profile.user_id, status: 'pending' }),
    enabled: !!profile?.user_id
  });

  const assignedMap = Object.fromEntries((assigned || []).map(r => [r.role_code, r]));
  const pendingMap = Object.fromEntries((pendingRequests || []).map(r => [r.role_code, r]));
  const userRank = profile?.rp_rank_code || 'seeker';
  const userRankIndex = RANK_ORDER.indexOf(userRank);

  const meetsRankRequirement = (roleCode) => {
    const def = ROLE_DEFS[roleCode];
    if (!def?.minRank) return true;
    const minRankIndex = RANK_ORDER.indexOf(def.minRank);
    return userRankIndex >= minRankIndex;
  };

  const requestRole = useMutation({
    mutationFn: async ({ role_code, message }) => {
      return base44.entities.UserRole.create({ 
        user_id: profile.user_id, 
        role_code, 
        status: 'pending',
        request_message: message,
        requested_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roleRequests', profile?.user_id] });
      setRequestingRole(null);
      setRequestMessage('');
      toast.success('Role request submitted for admin review');
    }
  });

  const assign = useMutation({
    mutationFn: async (role_code) => {
      const meUser = await base44.auth.me();
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
      qc.invalidateQueries({ queryKey: ['roleRequests', profile?.user_id] });
      toast.success('Role assigned successfully');
    }
  });

  const revoke = useMutation({
    mutationFn: async (role_code) => {
      const rec = assignedMap[role_code];
      if (!rec) return;
      return base44.entities.UserRole.update(rec.id, { status: 'revoked' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userRoles', profile?.user_id] });
      toast.success('Role revoked');
    }
  });

  const denyRequest = useMutation({
    mutationFn: async (role_code) => {
      const rec = pendingMap[role_code];
      if (!rec) return;
      return base44.entities.UserRole.update(rec.id, { status: 'denied' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roleRequests', profile?.user_id] });
      toast.success('Request denied');
    }
  });

  return (
    <div className="space-y-6">
      {/* Member Status */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Member</h3>
                <p className="text-sm text-slate-600">Active since joining • Full platform access</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Rank */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Current Rank</h3>
                <p className="text-sm text-slate-600">Your rank determines which roles you can request</p>
              </div>
            </div>
            <Badge className="bg-violet-100 text-violet-700 capitalize text-base px-3 py-1">
              {RANK_LABELS[userRank] || userRank}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-600" />
            Platform Roles
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Roles grant specific responsibilities. Some require minimum rank to request, others are admin-assigned only.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLE_ORDER.map((code) => {
              const def = ROLE_DEFS[code];
              if (!def) return null;
              
              const isAssigned = !!assignedMap[code];
              const isPending = !!pendingMap[code];
              const meetsRank = meetsRankRequirement(code);
              const canRequest = def.requestable && meetsRank && !isAssigned && !isPending && isOwnProfile;
              const isRequesting = requestingRole === code;

              return (
                <div 
                  key={code} 
                  className={`p-4 rounded-xl border transition-all ${
                    isAssigned 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : isPending 
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{def.title}</span>
                        {def.minRank && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {RANK_LABELS[def.minRank]}+
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Purpose: {def.purpose}</div>
                    </div>
                    <div>
                      {isAssigned ? (
                        <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      ) : isPending ? (
                        <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      ) : !def.requestable ? (
                        <Badge variant="outline" className="text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Admin Only
                        </Badge>
                      ) : !meetsRank ? (
                        <Badge variant="outline" className="text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {RANK_LABELS[def.minRank]} Required
                        </Badge>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">Capabilities</div>
                    <ul className="list-disc ml-5 text-xs text-slate-600 space-y-0.5">
                      {def.capabilities.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}
                      {def.capabilities.length > 3 && (
                        <li className="text-slate-400">+{def.capabilities.length - 3} more...</li>
                      )}
                    </ul>
                    {def.notes && (
                      <div className="mt-2 text-[11px] text-slate-500 italic">{def.notes}</div>
                    )}
                  </div>

                  {isRequesting && (
                    <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-lg">
                      <Textarea
                        placeholder="Why are you requesting this role? (optional)"
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        className="text-sm h-20"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { setRequestingRole(null); setRequestMessage(''); }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-violet-600 hover:bg-violet-700"
                          onClick={() => requestRole.mutate({ role_code: code, message: requestMessage })}
                          disabled={requestRole.isPending}
                        >
                          <Send className="w-3 h-3 mr-1" /> Submit Request
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    {isAdmin && (
                      <>
                        {isAssigned ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-rose-700 border-rose-200 hover:bg-rose-50" 
                            onClick={() => revoke.mutate(code)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Revoke
                          </Button>
                        ) : isPending ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-rose-600"
                              onClick={() => denyRequest.mutate(code)}
                            >
                              Deny
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => assign.mutate(code)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-violet-600 hover:bg-violet-700"
                            onClick={() => assign.mutate(code)}
                          >
                            Assign
                          </Button>
                        )}
                      </>
                    )}

                    {!isAdmin && canRequest && !isRequesting && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-violet-600 border-violet-200 hover:bg-violet-50"
                        onClick={() => setRequestingRole(code)}
                      >
                        Request Role
                      </Button>
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
            <Info className="w-5 h-5 text-slate-600" /> Role vs Rank
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
                  <td className="px-3 py-2 text-emerald-600">✓ Yes</td>
                  <td className="px-3 py-2 text-slate-400">✗ No</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Functional authority</td>
                  <td className="px-3 py-2 text-slate-400">✗ No</td>
                  <td className="px-3 py-2 text-emerald-600">✓ Yes</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Visual indicator</td>
                  <td className="px-3 py-2">Badge / Ring</td>
                  <td className="px-3 py-2">UI label</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2 text-slate-900">Revocable</td>
                  <td className="px-3 py-2 text-slate-400">✗ No</td>
                  <td className="px-3 py-2 text-emerald-600">✓ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Ranks are earned through activity. Roles are assigned for specific responsibilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}