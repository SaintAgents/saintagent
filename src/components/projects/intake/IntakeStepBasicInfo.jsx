import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, User, Mail, Phone, Globe } from 'lucide-react';

export default function IntakeStepBasicInfo({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Project Name *</Label>
        <Input
          value={formData.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Enter project name"
          className="mt-1"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Contact Name *
          </Label>
          <Input
            value={formData.contact_name || ''}
            onChange={(e) => update('contact_name', e.target.value)}
            placeholder="Full name"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Organization Name
          </Label>
          <Input
            value={formData.organization_name || ''}
            onChange={(e) => update('organization_name', e.target.value)}
            placeholder="Company or organization"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email *
          </Label>
          <Input
            type="email"
            value={formData.contact_email || ''}
            onChange={(e) => update('contact_email', e.target.value)}
            placeholder="email@example.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Phone
          </Label>
          <Input
            type="tel"
            value={formData.contact_phone || ''}
            onChange={(e) => update('contact_phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Website
        </Label>
        <Input
          value={formData.website_url || ''}
          onChange={(e) => update('website_url', e.target.value)}
          placeholder="https://yourproject.com"
          className="mt-1"
        />
      </div>
    </div>
  );
}