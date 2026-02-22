import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Key, User, Clock, Eye, Download, Edit3, Share2, DollarSign, Shield, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

const ACCESS_OPTIONS = [
  { value: 'view', label: 'View Only', icon: Eye },
  { value: 'stream', label: 'Stream', icon: Eye },
  { value: 'download', label: 'Download', icon: Download },
  { value: 'edit', label: 'Edit', icon: Edit3 },
  { value: 'remix', label: 'Remix', icon: Share2 }
];

const DURATION_OPTIONS = [
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
  { value: 365, label: '1 Year' },
  { value: 0, label: 'Unlimited' }
];

export default function DRXCreateGrant({ open, onClose, assets, profile }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    asset_id: '',
    grantee_email: '',
    access_scope: ['view'],
    duration_days: 30,
    usage_limit: null,
    is_transferable: false,
    is_revocable: true,
    monetization_type: 'free',
    price_ggg: 0,
    conditions: {
      nda_required: false,
      verified_only: false
    }
  });
  const queryClient = useQueryClient();

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = 'DRX-';
    for (let i = 0; i < 5; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    token += '-';
    for (let i = 0; i < 4; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    return token;
  };

  const createGrantMutation = useMutation({
    mutationFn: async () => {
      const asset = assets.find(a => a.id === formData.asset_id);
      const expirationDate = formData.duration_days > 0 
        ? addDays(new Date(), formData.duration_days).toISOString() 
        : null;

      await base44.entities.DRXRightsGrant.create({
        asset_id: formData.asset_id,
        asset_title: asset?.title,
        grantor_id: profile?.user_id,
        grantor_name: profile?.display_name,
        grantee_id: formData.grantee_email,
        grantee_email: formData.grantee_email,
        access_scope: formData.access_scope,
        duration_type: formData.duration_days > 0 ? 'fixed_days' : 'unlimited',
        duration_days: formData.duration_days || null,
        usage_limit: formData.usage_limit || null,
        start_date: new Date().toISOString(),
        expiration_date: expirationDate,
        conditions: formData.conditions,
        monetization: {
          type: formData.monetization_type,
          price_ggg: formData.price_ggg || 0
        },
        is_transferable: formData.is_transferable,
        is_revocable: formData.is_revocable,
        status: 'active',
        rights_token: generateToken()
      });

      // Update asset grant count
      if (asset) {
        await base44.entities.DRXAsset.update(asset.id, {
          total_grants: (asset.total_grants || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drxGrantsOut'] });
      queryClient.invalidateQueries({ queryKey: ['drxAssets'] });
      toast.success('Access granted successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to create grant');
    }
  });

  const handleClose = () => {
    setStep(1);
    setFormData({
      asset_id: '',
      grantee_email: '',
      access_scope: ['view'],
      duration_days: 30,
      usage_limit: null,
      is_transferable: false,
      is_revocable: true,
      monetization_type: 'free',
      price_ggg: 0,
      conditions: { nda_required: false, verified_only: false }
    });
    onClose();
  };

  const toggleAccess = (value) => {
    setFormData(prev => ({
      ...prev,
      access_scope: prev.access_scope.includes(value)
        ? prev.access_scope.filter(v => v !== value)
        : [...prev.access_scope, value]
    }));
  };

  const selectedAsset = assets.find(a => a.id === formData.asset_id);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            Grant Access Rights
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-emerald-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>

        {/* Step 1: Select Asset & Recipient */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Select Asset</Label>
              <Select value={formData.asset_id} onValueChange={(v) => setFormData({ ...formData, asset_id: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Choose an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Recipient Email</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={formData.grantee_email}
                  onChange={(e) => setFormData({ ...formData, grantee_email: e.target.value })}
                  placeholder="user@example.com"
                  className="bg-slate-800 border-slate-600 text-white pl-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setStep(2)}
                disabled={!formData.asset_id || !formData.grantee_email}
              >
                Next: Define Rights
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Define Rights */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Access Scope</Label>
              <div className="grid grid-cols-2 gap-2">
                {ACCESS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleAccess(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      formData.access_scope.includes(opt.value)
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Duration</Label>
              <Select 
                value={String(formData.duration_days)} 
                onValueChange={(v) => setFormData({ ...formData, duration_days: Number(v) })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Usage Limit (optional)</Label>
              <Input 
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : null })}
                placeholder="Unlimited"
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  checked={formData.is_transferable}
                  onCheckedChange={(v) => setFormData({ ...formData, is_transferable: v })}
                />
                <span className="text-sm text-slate-300">Transferable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  checked={formData.is_revocable}
                  onCheckedChange={(v) => setFormData({ ...formData, is_revocable: v })}
                />
                <span className="text-sm text-slate-300">Revocable</span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="border-slate-600 text-slate-300">
                Back
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(3)}>
                Next: Conditions
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Conditions & Monetization */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Monetization</Label>
              <Select 
                value={formData.monetization_type} 
                onValueChange={(v) => setFormData({ ...formData, monetization_type: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="fixed_fee">Fixed Fee (GGG)</SelectItem>
                  <SelectItem value="per_use">Per Use</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.monetization_type !== 'free' && (
              <div>
                <Label className="text-slate-300">Price (GGG)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="number"
                    value={formData.price_ggg}
                    onChange={(e) => setFormData({ ...formData, price_ggg: Number(e.target.value) })}
                    className="bg-slate-800 border-slate-600 text-white pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-slate-300 mb-2 block">Conditions</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={formData.conditions.nda_required}
                    onCheckedChange={(v) => setFormData({ 
                      ...formData, 
                      conditions: { ...formData.conditions, nda_required: v }
                    })}
                  />
                  <span className="text-sm text-slate-300">Require NDA signature</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={formData.conditions.verified_only}
                    onCheckedChange={(v) => setFormData({ 
                      ...formData, 
                      conditions: { ...formData.conditions, verified_only: v }
                    })}
                  />
                  <span className="text-sm text-slate-300">Verified users only</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Grant Summary
              </h4>
              <div className="text-xs text-slate-400 space-y-1">
                <p><span className="text-slate-300">Asset:</span> {selectedAsset?.title}</p>
                <p><span className="text-slate-300">To:</span> {formData.grantee_email}</p>
                <p><span className="text-slate-300">Access:</span> {formData.access_scope.join(', ')}</p>
                <p><span className="text-slate-300">Duration:</span> {formData.duration_days > 0 ? `${formData.duration_days} days` : 'Unlimited'}</p>
                <p><span className="text-slate-300">Price:</span> {formData.monetization_type === 'free' ? 'Free' : `${formData.price_ggg} GGG`}</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="border-slate-600 text-slate-300">
                Back
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                onClick={() => createGrantMutation.mutate()}
                disabled={createGrantMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                Create Grant
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}