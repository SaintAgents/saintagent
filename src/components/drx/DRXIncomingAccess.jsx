import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Key, Clock, User, Eye, Download, Play, FileText, CheckCircle2, AlertTriangle,
  ArrowRightLeft, Send, Shield
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { toast } from 'sonner';

export default function DRXIncomingAccess({ grants }) {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const queryClient = useQueryClient();

  const activeGrants = grants.filter(g => g.status === 'active');
  const expiredGrants = grants.filter(g => g.status !== 'active');
  const transferableGrants = activeGrants.filter(g => g.is_transferable);

  const transferMutation = useMutation({
    mutationFn: async ({ grantId, newOwnerEmail }) => {
      // Get the grant details
      const grant = grants.find(g => g.id === grantId);
      if (!grant) throw new Error('Grant not found');
      
      // Update the grant with new owner
      await base44.entities.DRXRightsGrant.update(grantId, {
        grantee_id: newOwnerEmail,
        grantee_email: newOwnerEmail,
        grantee_name: null, // Will be populated when new user views it
        payment_history: [
          ...(grant.payment_history || []),
          { 
            date: new Date().toISOString(), 
            amount: 0, 
            type: 'transfer',
            from: grant.grantee_id,
            to: newOwnerEmail
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drxGrantsIn'] });
      queryClient.invalidateQueries({ queryKey: ['drxGrantsOut'] });
      setTransferModalOpen(false);
      setSelectedGrant(null);
      setRecipientEmail('');
      toast.success('Rights transferred successfully');
    },
    onError: (error) => {
      toast.error('Failed to transfer rights: ' + error.message);
    }
  });

  const handleTransferClick = (grant) => {
    setSelectedGrant(grant);
    setTransferModalOpen(true);
  };

  const handleTransfer = () => {
    if (!selectedGrant || !recipientEmail) return;
    if (!recipientEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    transferMutation.mutate({ grantId: selectedGrant.id, newOwnerEmail: recipientEmail });
  };

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
                          <div className="flex items-center gap-2">
                            {grant.is_transferable && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1"
                                onClick={() => handleTransferClick(grant)}
                              >
                                <ArrowRightLeft className="w-3 h-3" /> Transfer
                              </Button>
                            )}
                            {getAccessButton(grant)}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                          <span>Token: {grant.rights_token}</span>
                          {grant.is_transferable && (
                            <Badge className="bg-amber-500/20 text-amber-300 text-xs">
                              <ArrowRightLeft className="w-2 h-2 mr-1" /> Transferable
                            </Badge>
                          )}
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

      {/* Transfer Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              Transfer Rights
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Transfer your access rights to another user. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedGrant && (
            <div className="space-y-4 mt-4">
              {/* Grant Info */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{selectedGrant.asset_title}</h4>
                    <p className="text-xs text-slate-400">Token: {selectedGrant.rights_token}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedGrant.access_scope?.map((scope, i) => (
                    <Badge key={i} className="bg-indigo-500/20 text-indigo-300 text-xs capitalize">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recipient Input */}
              <div>
                <Label className="text-slate-300">Recipient Email</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-slate-800 border-slate-600 text-white pl-10"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  The recipient will receive full access rights as defined in this grant.
                </p>
              </div>

              {/* Warning */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-200">
                    Once transferred, you will lose all access to this asset. The new owner will have the same permissions and time remaining as your current grant.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTransferModalOpen(false);
                    setSelectedGrant(null);
                    setRecipientEmail('');
                  }}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 gap-2"
                  onClick={handleTransfer}
                  disabled={!recipientEmail || transferMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                  {transferMutation.isPending ? 'Transferring...' : 'Transfer Rights'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}