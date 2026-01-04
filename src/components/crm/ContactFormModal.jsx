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
import { Star, Globe, Lock, Eye, EyeOff, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const DOMAINS = ['finance', 'tech', 'governance', 'health', 'education', 'media', 'legal', 'spiritual', 'creative', 'nonprofit', 'other'];

const PERMISSION_OPTIONS = [
  { value: 'private', label: 'Private', desc: 'Only you can see this contact', icon: Lock },
  { value: 'signal_only', label: 'Signal Only', desc: 'Others see existence & strength, no identity', icon: Eye },
  { value: 'masked', label: 'Masked', desc: 'Others see role/domain only, no name', icon: EyeOff },
  { value: 'shared', label: 'Full Share', desc: 'Full details visible to network', icon: Globe }
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
    social_links: { linkedin: '', twitter: '', website: '' }
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
        social_links: contact.social_links || { linkedin: '', twitter: '', website: '' }
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
        social_links: { linkedin: '', twitter: '', website: '' }
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

      if (isEdit) {
        return base44.entities.Contact.update(contact.id, payload);
      }
      return base44.entities.Contact.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
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
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contact name"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company</Label>
              <Input 
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input 
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Job title"
              />
            </div>
            <div className="col-span-2">
              <Label>Domain</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger>
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

          {/* Relationship Strength */}
          <div>
            <Label className="mb-2 block">Relationship Strength</Label>
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
              <span className="text-sm text-slate-500 ml-2">
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
            <Label className="mb-2 block">Tags</Label>
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
            <Label>Notes (Private)</Label>
            <Textarea 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Private notes about this contact..."
              rows={3}
            />
          </div>

          {/* Social Links */}
          <div>
            <Label className="mb-2 block">Social Links</Label>
            <div className="grid grid-cols-3 gap-4">
              <Input 
                value={form.social_links.linkedin}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, linkedin: e.target.value }})}
                placeholder="LinkedIn URL"
              />
              <Input 
                value={form.social_links.twitter}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, twitter: e.target.value }})}
                placeholder="Twitter/X URL"
              />
              <Input 
                value={form.social_links.website}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, website: e.target.value }})}
                placeholder="Website URL"
              />
            </div>
          </div>

          {/* Sharing Settings */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Share to Federated Network</Label>
                <p className="text-sm text-slate-500">Make this contact available in the global graph</p>
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
                <Label className="mb-2 block">Permission Level</Label>
                <div className="space-y-2">
                  {PERMISSION_OPTIONS.filter(p => p.value !== 'private').map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, permission_level: opt.value })}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors",
                        form.permission_level === opt.value 
                          ? "border-violet-500 bg-violet-50" 
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <opt.icon className={cn(
                        "w-5 h-5",
                        form.permission_level === opt.value ? "text-violet-600" : "text-slate-400"
                      )} />
                      <div>
                        <p className="font-medium text-slate-900">{opt.label}</p>
                        <p className="text-sm text-slate-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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