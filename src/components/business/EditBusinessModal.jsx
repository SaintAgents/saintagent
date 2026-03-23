import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'healing_wellness', label: 'Healing & Wellness' },
  { value: 'conscious_technology', label: 'Conscious Technology' },
  { value: 'sustainable_living', label: 'Sustainable Living' },
  { value: 'spiritual_education', label: 'Spiritual Education' },
  { value: 'sacred_arts', label: 'Sacred Arts' },
  { value: 'regenerative_finance', label: 'Regenerative Finance' },
  { value: 'community_building', label: 'Community Building' },
  { value: 'earth_stewardship', label: 'Earth Stewardship' },
  { value: 'media_publishing', label: 'Media & Publishing' },
  { value: 'other', label: 'Other' },
];

export default function EditBusinessModal({ entity, open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: entity.name || '',
    tagline: entity.tagline || '',
    description: entity.description || '',
    mission_statement: entity.mission_statement || '',
    vision: entity.vision || '',
    category: entity.category || 'other',
    website_url: entity.website_url || '',
    email: entity.email || '',
    phone: entity.phone || '',
    location: entity.location || '',
    focus_areas_text: (entity.focus_areas || []).join(', '),
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const focusAreas = form.focus_areas_text.split(',').map(s => s.trim()).filter(Boolean);
    await base44.entities.BusinessEntity5D.update(entity.id, {
      ...form,
      focus_areas: focusAreas,
    });
    queryClient.invalidateQueries({ queryKey: ['businessEntity5D', entity.id] });
    queryClient.invalidateQueries({ queryKey: ['businessEntities5D'] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business Entity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={e => update('tagline', e.target.value)} />
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
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Mission Statement</Label>
            <Textarea value={form.mission_statement} onChange={e => update('mission_statement', e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Vision</Label>
            <Textarea value={form.vision} onChange={e => update('vision', e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Focus Areas (comma separated)</Label>
            <Input value={form.focus_areas_text} onChange={e => update('focus_areas_text', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Website</Label><Input value={form.website_url} onChange={e => update('website_url', e.target.value)} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => update('location', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700 gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}