import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TierManager({ profile }) {
  const [editingTier, setEditingTier] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tiers = [] } = useQuery({
    queryKey: ['creatorTiers', profile?.user_id],
    queryFn: () => base44.entities.CreatorTier.filter({ creator_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CreatorTier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorTiers'] });
      setModalOpen(false);
      setEditingTier(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CreatorTier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorTiers'] });
      setModalOpen(false);
      setEditingTier(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CreatorTier.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creatorTiers'] })
  });

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTier({
      tier_name: '',
      description: '',
      monthly_price_ggg: 0,
      annual_price_ggg: 0,
      perks: [''],
      tier_level: tiers.length + 1,
      access_rules: {
        private_posts: true,
        early_access: false,
        private_community: false,
        monthly_qa: false,
        dm_credits: 0
      }
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Membership Tiers</h2>
          <p className="text-slate-500 mt-1">Create subscription tiers for your supporters</p>
        </div>
        <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Tier
        </Button>
      </div>

      <div className="grid gap-4">
        {tiers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Crown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No membership tiers yet</p>
              <Button onClick={handleCreate} variant="outline">Create Your First Tier</Button>
            </CardContent>
          </Card>
        ) : (
          tiers.map((tier) => (
            <Card key={tier.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{tier.tier_name}</CardTitle>
                      <Badge variant={tier.status === 'active' ? 'default' : 'secondary'}>
                        {tier.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(tier)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(tier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Monthly Price</p>
                    <p className="text-lg font-bold text-violet-600">{tier.monthly_price_ggg} GGG</p>
                  </div>
                  {tier.annual_price_ggg > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Annual Price</p>
                      <p className="text-lg font-bold text-emerald-600">{tier.annual_price_ggg} GGG</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Subscribers</p>
                    <p className="text-lg font-bold flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tier.current_subscribers || 0}
                      {tier.max_subscribers && ` / ${tier.max_subscribers}`}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Perks</p>
                  <div className="flex flex-wrap gap-2">
                    {tier.perks?.map((perk, i) => (
                      <Badge key={i} variant="outline">{perk}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TierEditModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTier(null);
        }}
        tier={editingTier}
        profile={profile}
        onSave={(data) => {
          if (editingTier?.id) {
            updateMutation.mutate({ id: editingTier.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}

function TierEditModal({ open, onClose, tier, profile, onSave }) {
  const [formData, setFormData] = useState(tier || {});
  const [newPerk, setNewPerk] = useState('');

  React.useEffect(() => {
    if (tier) {
      setFormData(tier);
    }
  }, [tier]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      creator_id: profile.user_id,
      creator_name: profile.display_name,
      creator_avatar: profile.avatar_url
    });
  };

  const addPerk = () => {
    if (newPerk.trim()) {
      setFormData({
        ...formData,
        perks: [...(formData.perks || []), newPerk.trim()]
      });
      setNewPerk('');
    }
  };

  const removePerk = (index) => {
    setFormData({
      ...formData,
      perks: formData.perks.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tier?.id ? 'Edit' : 'Create'} Membership Tier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tier Name</Label>
            <Input
              value={formData.tier_name || ''}
              onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
              placeholder="e.g., Bronze Supporter, Gold Member"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What supporters get with this tier..."
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monthly Price (GGG)</Label>
              <Input
                type="number"
                value={formData.monthly_price_ggg || ''}
                onChange={(e) => setFormData({ ...formData, monthly_price_ggg: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Annual Price (GGG) - Optional</Label>
              <Input
                type="number"
                value={formData.annual_price_ggg || ''}
                onChange={(e) => setFormData({ ...formData, annual_price_ggg: parseFloat(e.target.value) })}
                placeholder="Discounted annual price"
              />
            </div>
          </div>

          <div>
            <Label>Max Subscribers (Optional)</Label>
            <Input
              type="number"
              value={formData.max_subscribers || ''}
              onChange={(e) => setFormData({ ...formData, max_subscribers: parseInt(e.target.value) })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <Label>Perks</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  placeholder="Add a perk..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                />
                <Button type="button" onClick={addPerk} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.perks?.map((perk, i) => (
                  <Badge key={i} className="gap-2">
                    {perk}
                    <button
                      type="button"
                      onClick={() => removePerk(i)}
                      className="hover:bg-slate-200 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-slate-50">
            <Label>Access Rules</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Private Posts Access</span>
                <Switch
                  checked={formData.access_rules?.private_posts}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    access_rules: { ...formData.access_rules, private_posts: v }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Early Access</span>
                <Switch
                  checked={formData.access_rules?.early_access}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    access_rules: { ...formData.access_rules, early_access: v }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Private Community</span>
                <Switch
                  checked={formData.access_rules?.private_community}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    access_rules: { ...formData.access_rules, private_community: v }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Q&A</span>
                <Switch
                  checked={formData.access_rules?.monthly_qa}
                  onCheckedChange={(v) => setFormData({
                    ...formData,
                    access_rules: { ...formData.access_rules, monthly_qa: v }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              {tier?.id ? 'Update' : 'Create'} Tier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}