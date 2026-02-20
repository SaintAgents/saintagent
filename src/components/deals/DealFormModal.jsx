import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STAGES = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' }
];

const SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export default function DealFormModal({ open, onClose, deal, currentUser, profile, allProfiles }) {
  const isEditing = !!deal;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    stage: 'prospecting',
    owner_id: '',
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    expected_close_date: null,
    probability: 0,
    source: 'other',
    priority: 'medium'
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        amount: deal.amount?.toString() || '',
        stage: deal.stage || 'prospecting',
        owner_id: deal.owner_id || '',
        company_name: deal.company_name || '',
        contact_name: deal.contact_name || '',
        contact_email: deal.contact_email || '',
        contact_phone: deal.contact_phone || '',
        expected_close_date: deal.expected_close_date ? new Date(deal.expected_close_date) : null,
        probability: deal.probability || 0,
        source: deal.source || 'other',
        priority: deal.priority || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        stage: 'prospecting',
        owner_id: currentUser?.email || '',
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        expected_close_date: null,
        probability: 0,
        source: 'other',
        priority: 'medium'
      });
    }
  }, [deal, currentUser, open]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const ownerProfile = allProfiles.find(p => p.user_id === data.owner_id);
      const dealData = {
        ...data,
        amount: parseFloat(data.amount) || 0,
        owner_name: ownerProfile?.display_name || currentUser?.full_name,
        owner_avatar: ownerProfile?.avatar_url,
        expected_close_date: data.expected_close_date ? format(data.expected_close_date, 'yyyy-MM-dd') : null
      };
      
      const created = await base44.entities.Deal.create(dealData);
      
      // Log activity
      await base44.entities.DealActivity.create({
        deal_id: created.id,
        activity_type: 'created',
        description: `Deal "${data.title}" was created`,
        actor_id: currentUser.email,
        actor_name: profile?.display_name || currentUser.full_name
      });
      
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const ownerProfile = allProfiles.find(p => p.user_id === data.owner_id);
      const dealData = {
        ...data,
        amount: parseFloat(data.amount) || 0,
        owner_name: ownerProfile?.display_name || deal.owner_name,
        owner_avatar: ownerProfile?.avatar_url || deal.owner_avatar,
        expected_close_date: data.expected_close_date ? format(data.expected_close_date, 'yyyy-MM-dd') : null
      };
      
      // Track changes for activity log
      const changes = [];
      if (deal.stage !== data.stage) {
        changes.push({ type: 'stage_change', old: deal.stage, new: data.stage });
      }
      if (deal.owner_id !== data.owner_id) {
        changes.push({ type: 'owner_changed', old: deal.owner_name, new: ownerProfile?.display_name });
      }
      
      await base44.entities.Deal.update(deal.id, dealData);
      
      // Log activities for significant changes
      for (const change of changes) {
        await base44.entities.DealActivity.create({
          deal_id: deal.id,
          activity_type: change.type,
          description: change.type === 'stage_change' 
            ? `Stage changed from ${change.old} to ${change.new}`
            : `Owner changed from ${change.old} to ${change.new}`,
          actor_id: currentUser.email,
          actor_name: profile?.display_name || currentUser.full_name,
          old_value: change.old,
          new_value: change.new
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dealActivities', deal?.id] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Deal Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Enterprise License - Acme Corp"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deal notes and context..."
                rows={3}
              />
            </div>
          </div>

          {/* Company & Contact */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="john@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Deal Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Deal Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProfiles.map(p => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expected_close_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expected_close_date ? format(formData.expected_close_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expected_close_date}
                      onSelect={(d) => setFormData({ ...formData, expected_close_date: d })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Win Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.title || !formData.amount}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Deal' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}