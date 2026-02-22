import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Star, Globe, Lock, Eye, EyeOff, X, Plus, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const DOMAINS = ['finance', 'tech', 'governance', 'health', 'education', 'media', 'legal', 'spiritual', 'creative', 'nonprofit', 'other'];

const LEAD_SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'event', label: 'Event' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'partner', label: 'Partner' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'content', label: 'Content' },
  { value: 'other', label: 'Other' }
];

const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'nurturing', label: 'Nurturing' }
];

const PERMISSION_OPTIONS = [
  { value: 'private', label: 'Private', desc: 'Only you can see this contact', icon: Lock },
  { value: 'signal_only', label: 'Signal Only', desc: 'Others see existence & strength, no identity', icon: Eye },
  { value: 'masked', label: 'Masked', desc: 'Others see role/domain only, no name', icon: EyeOff },
  { value: 'shared', label: 'Full Share', desc: 'Full details visible to network (earn 0.0154 GGG)', icon: Globe }
];

const CONTACT_METHODS = [
  { value: 'email', label: 'Email Introduction', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'video_call', label: 'Video Call', icon: Eye },
  { value: 'in_person', label: 'In Person', icon: Globe }
];

export default function ContactFormModal({ open, onClose, contact, currentUserId }) {
  const queryClient = useQueryClient();
  const isEdit = !!contact;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    domain: '',
    location: '',
    relationship_strength: 3,
    permission_level: 'private',
    is_federated: false,
    notes: '',
    tags: [],
    social_links: { linkedin: '', twitter: '', website: '' },
    lead_source: '',
    lead_source_detail: '',
    lead_status: 'new'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        role: contact.role || '',
        domain: contact.domain || '',
        location: contact.location || '',
        relationship_strength: contact.relationship_strength || 3,
        permission_level: contact.permission_level || 'private',
        is_federated: contact.is_federated || false,
        notes: contact.notes || '',
        tags: contact.tags || [],
        social_links: contact.social_links || { linkedin: '', twitter: '', website: '' },
        lead_source: contact.lead_source || '',
        lead_source_detail: contact.lead_source_detail || '',
        lead_status: contact.lead_status || 'new'
      });
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: '',
        domain: '',
        location: '',
        relationship_strength: 3,
        permission_level: 'private',
        is_federated: false,
        notes: '',
        tags: [],
        social_links: { linkedin: '', twitter: '', website: '' },
        lead_source: '',
        lead_source_detail: '',
        lead_status: 'new'
      });
    }
  }, [contact, open]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, owner_id: currentUserId };
      // Calculate quality score based on completeness
      let quality = 0;
      if (data.name) quality += 10;
      if (data.email) quality += 15;
      if (data.company) quality += 10;
      if (data.role) quality += 10;
      if (data.domain) quality += 10;
      if (data.notes) quality += 15;
      if (data.tags?.length > 0) quality += 10;
      if (data.social_links?.linkedin) quality += 10;
      if (data.relationship_strength >= 4) quality += 10;
      payload.quality_score = quality;

      let savedContact;
      if (isEdit) {
        savedContact = await base44.entities.Contact.update(contact.id, payload);
        
        // Award GGG if contact is being federated for the first time (0.0154 GGG = $2.24)
        if (data.is_federated && !contact.is_federated && !contact.ggg_federated_awarded) {
          await base44.entities.Contact.update(contact.id, { ggg_federated_awarded: true });
          
          // Update contribution record
          const contribRecords = await base44.entities.CRMContribution.filter({ user_id: currentUserId });
          let contribution = contribRecords?.[0];
          if (!contribution) {
            contribution = await base44.entities.CRMContribution.create({
              user_id: currentUserId,
              federated_contacts: 1,
              total_ggg_earned: 0.0154
            });
          } else {
            await base44.entities.CRMContribution.update(contribution.id, {
              federated_contacts: (contribution.federated_contacts || 0) + 1,
              total_ggg_earned: (contribution.total_ggg_earned || 0) + 0.0154
            });
          }
          
          // Award GGG to user
          const userProfiles = await base44.entities.UserProfile.filter({ user_id: currentUserId });
          const userProfile = userProfiles?.[0];
          if (userProfile) {
            const newBalance = (userProfile.ggg_balance || 0) + 0.0154;
            await base44.entities.UserProfile.update(userProfile.id, { ggg_balance: newBalance });
            
            await base44.entities.GGGTransaction.create({
              user_id: currentUserId,
              source_type: 'reward',
              source_id: contact.id,
              delta: 0.0154,
              reason_code: 'crm_federated',
              description: 'Contact added to federated network',
              balance_after: newBalance
            });
          }
        }
      } else {
        savedContact = await base44.entities.Contact.create(payload);
        
        // Award GGG if new contact is federated (0.0154 GGG = $2.24)
        if (data.is_federated) {
          await base44.entities.Contact.update(savedContact.id, { ggg_federated_awarded: true });
          
          const contribRecords = await base44.entities.CRMContribution.filter({ user_id: currentUserId });
          let contribution = contribRecords?.[0];
          if (!contribution) {
            contribution = await base44.entities.CRMContribution.create({
              user_id: currentUserId,
              total_contacts: 1,
              federated_contacts: 1,
              total_ggg_earned: 0.0154
            });
          } else {
            await base44.entities.CRMContribution.update(contribution.id, {
              total_contacts: (contribution.total_contacts || 0) + 1,
              federated_contacts: (contribution.federated_contacts || 0) + 1,
              total_ggg_earned: (contribution.total_ggg_earned || 0) + 0.0154
            });
          }
          
          const userProfiles = await base44.entities.UserProfile.filter({ user_id: currentUserId });
          const userProfile = userProfiles?.[0];
          if (userProfile) {
            const newBalance = (userProfile.ggg_balance || 0) + 0.0154;
            await base44.entities.UserProfile.update(userProfile.id, { ggg_balance: newBalance });
            
            await base44.entities.GGGTransaction.create({
              user_id: currentUserId,
              source_type: 'reward',
              source_id: savedContact.id,
              delta: 0.0154,
              reason_code: 'crm_federated',
              description: 'Contact added to federated network',
              balance_after: newBalance
            });
          }
        }
      }
      return savedContact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['myContribution'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      onClose();
    }
  });

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <style>{`
          [data-theme='dark'] [data-radix-dialog-content] {
            background-color: #0f172a !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
          }
          [data-theme='dark'] .contact-form-title {
            color: #ffffff !important;
          }
          [data-theme='dark'] .contact-form-label {
            color: #e5e7eb !important;
          }
          [data-theme='dark'] .contact-form-input {
            background-color: #1e293b !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
          }
          [data-theme='dark'] .contact-form-input::placeholder {
            color: #64748b !important;
          }
          [data-theme='dark'] .contact-form-hint {
            color: #94a3b8 !important;
          }
          [data-theme='dark'] .contact-form-sharing {
            background-color: #1e293b !important;
          }
          [data-theme='dark'] .contact-form-sharing-title {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .contact-form-perm-btn {
            background-color: #0f172a !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] .contact-form-perm-btn:hover {
            border-color: #475569 !important;
          }
          [data-theme='dark'] .contact-form-perm-btn.active {
            background-color: rgba(139, 92, 246, 0.2) !important;
            border-color: #8b5cf6 !important;
          }
          [data-theme='dark'] .contact-form-perm-label {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .contact-form-perm-desc {
            color: #94a3b8 !important;
          }
          [data-theme='dark'] .contact-form-border-top {
            border-color: #334155 !important;
          }
          [data-theme='dark'] [data-radix-select-trigger] {
            background-color: #1e293b !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
          }
          [data-theme='dark'] [data-radix-select-content] {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] [data-radix-select-item] {
            color: #e5e7eb !important;
          }
          [data-theme='dark'] [data-radix-select-item]:hover,
          [data-theme='dark'] [data-radix-select-item][data-highlighted] {
            background-color: #334155 !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="contact-form-title">{isEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="contact-form-label">Name *</Label>
              <Input 
                className="contact-form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contact name"
                required
              />
            </div>
            <div>
              <Label className="contact-form-label">Email</Label>
              <Input 
                className="contact-form-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label className="contact-form-label">Phone</Label>
              <Input 
                className="contact-form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label className="contact-form-label">Location</Label>
              <Input 
                className="contact-form-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="contact-form-label">Company</Label>
              <Input 
                className="contact-form-input"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label className="contact-form-label">Role</Label>
              <Input 
                className="contact-form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Job title"
              />
            </div>
            <div className="col-span-2">
              <Label className="contact-form-label">Domain</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger className="contact-form-input">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lead Source & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="contact-form-label">Lead Source</Label>
              <Select value={form.lead_source} onValueChange={(v) => setForm({ ...form, lead_source: v })}>
                <SelectTrigger className="contact-form-input">
                  <SelectValue placeholder="How did you connect?" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="contact-form-label">Lead Status</Label>
              <Select value={form.lead_status} onValueChange={(v) => setForm({ ...form, lead_status: v })}>
                <SelectTrigger className="contact-form-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.lead_source && (
              <div className="col-span-2">
                <Label className="contact-form-label">Lead Source Details (optional)</Label>
                <Input 
                  className="contact-form-input"
                  value={form.lead_source_detail}
                  onChange={(e) => setForm({ ...form, lead_source_detail: e.target.value })}
                  placeholder={form.lead_source === 'referral' ? 'Who referred them?' : 
                               form.lead_source === 'event' ? 'Which event?' : 
                               'Additional details...'}
                />
              </div>
            )}
          </div>

          {/* Relationship Strength */}
          <div>
            <Label className="mb-2 block contact-form-label">Relationship Strength</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, relationship_strength: level })}
                  className="p-1"
                >
                  <Star 
                    className={cn(
                      "w-6 h-6 transition-colors",
                      level <= form.relationship_strength 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-slate-200 hover:text-amber-200"
                    )} 
                  />
                </button>
              ))}
              <span className="text-sm text-slate-500 ml-2 contact-form-hint">
                {form.relationship_strength === 1 && 'Acquaintance'}
                {form.relationship_strength === 2 && 'Casual'}
                {form.relationship_strength === 3 && 'Professional'}
                {form.relationship_strength === 4 && 'Strong'}
                {form.relationship_strength === 5 && 'Close'}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="mb-2 block contact-form-label">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                className="contact-form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="contact-form-label">Notes (Private)</Label>
            <Textarea 
              className="contact-form-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Private notes about this contact..."
              rows={3}
            />
          </div>

          {/* Social Links */}
          <div>
            <Label className="mb-2 block contact-form-label">Social Links</Label>
            <div className="grid grid-cols-3 gap-4">
              <Input 
                className="contact-form-input"
                value={form.social_links.linkedin}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, linkedin: e.target.value }})}
                placeholder="LinkedIn URL"
              />
              <Input 
                className="contact-form-input"
                value={form.social_links.twitter}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, twitter: e.target.value }})}
                placeholder="Twitter/X URL"
              />
              <Input 
                className="contact-form-input"
                value={form.social_links.website}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, website: e.target.value }})}
                placeholder="Website URL"
              />
            </div>
          </div>

          {/* Sharing Settings */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-4 contact-form-sharing">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base contact-form-sharing-title">Share to Federated Network</Label>
                <p className="text-sm text-slate-500 contact-form-hint">Make this contact available in the global graph</p>
              </div>
              <Switch 
                checked={form.is_federated}
                onCheckedChange={(v) => setForm({ 
                  ...form, 
                  is_federated: v,
                  permission_level: v && form.permission_level === 'private' ? 'signal_only' : form.permission_level
                })}
              />
            </div>

            {form.is_federated && (
              <div>
                <Label className="mb-2 block contact-form-label">Permission Level</Label>
                <div className="space-y-2">
                  {PERMISSION_OPTIONS.filter(p => p.value !== 'private').map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, permission_level: opt.value })}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors contact-form-perm-btn",
                        form.permission_level === opt.value 
                          ? "border-violet-500 bg-violet-50 active" 
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <opt.icon className={cn(
                        "w-5 h-5",
                        form.permission_level === opt.value ? "text-violet-600" : "text-slate-400"
                      )} />
                      <div>
                        <p className="font-medium text-slate-900 contact-form-perm-label">{opt.label}</p>
                        <p className="text-sm text-slate-500 contact-form-perm-desc">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t contact-form-border-top">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}