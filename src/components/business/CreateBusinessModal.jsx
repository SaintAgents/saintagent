import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from 'lucide-react';
import { createPageUrl } from '@/utils';

const CATEGORIES = [
  { value: 'healing_wellness', label: 'Healing & Wellness' },
  { value: 'conscious_technology', label: 'Conscious Technology' },
  { value: 'sustainable_living', label: 'Sustainable Living' },
  { value: 'spiritual_education', label: 'Spiritual Education' },
  { value: 'sacred_arts', label: 'Sacred Arts' },
  { value: 'regenerative_finance', label: 'Regenerative Finance' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'community_building', label: 'Community Building' },
  { value: 'earth_stewardship', label: 'Earth Stewardship' },
  { value: 'media_publishing', label: 'Media & Publishing' },
  { value: 'other', label: 'Other' },
];

export default function CreateBusinessModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', mission_statement: '',
    category: 'other', website_url: '', email: '', location: '', focus_areas_text: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    let logo_url = '';
    let cover_image_url = '';

    if (logoFile) {
      const res = await base44.integrations.Core.UploadFile({ file: logoFile });
      logo_url = res.file_url;
    }
    if (coverFile) {
      const res = await base44.integrations.Core.UploadFile({ file: coverFile });
      cover_image_url = res.file_url;
    }

    const focusAreas = form.focus_areas_text.split(',').map(s => s.trim()).filter(Boolean);

    const entity = await base44.entities.BusinessEntity5D.create({
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      mission_statement: form.mission_statement,
      category: form.category,
      website_url: form.website_url,
      email: form.email || currentUser?.email,
      location: form.location,
      focus_areas: focusAreas,
      logo_url,
      cover_image_url,
      owner_id: currentUser?.email,
      owner_name: profile?.display_name || currentUser?.full_name,
      owner_avatar: profile?.avatar_url || '',
      status: 'active',
      team_member_ids: [currentUser?.email],
      team_roles: [{
        user_id: currentUser?.email,
        name: profile?.display_name || currentUser?.full_name,
        avatar: profile?.avatar_url || '',
        role: 'owner',
        title: 'Founder'
      }]
    });

    queryClient.invalidateQueries({ queryKey: ['businessEntities5D'] });
    setSaving(false);
    onClose();
    window.location.href = createPageUrl('BusinessEntityProfile') + `?id=${entity.id}`;
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register 5D Business Entity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-20">
          <div>
            <Label>Entity Name *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your organization name" required />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder="Short slogan or motto" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => update('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="What does your entity do?" rows={3} />
          </div>
          <div>
            <Label>Mission Statement</Label>
            <Textarea value={form.mission_statement} onChange={e => update('mission_statement', e.target.value)} placeholder="Your core mission..." rows={2} />
          </div>
          <div>
            <Label>Focus Areas (comma separated)</Label>
            <Input value={form.focus_areas_text} onChange={e => update('focus_areas_text', e.target.value)} placeholder="e.g. Energy Healing, Permaculture, AI Ethics" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Website</Label>
              <Input value={form.website_url} onChange={e => update('website_url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="City, Country" />
            </div>
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder={currentUser?.email} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
            </div>
            <div>
              <Label>Cover Image</Label>
              <Input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim()} className="bg-violet-600 hover:bg-violet-700 gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Creating...' : 'Create Entity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}