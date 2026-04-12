import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, MapPin, Globe, Linkedin, Twitter, Check, X, Pencil, Plus } from 'lucide-react';

const FIELDS = [
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'email@example.com', type: 'email', linkPrefix: 'mailto:' },
  { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 234 567 8900', type: 'tel', linkPrefix: 'tel:' },
  { key: 'company', label: 'Company', icon: Building2, placeholder: 'Company name' },
  { key: 'role', label: 'Role', icon: Building2, placeholder: 'Job title' },
  { key: 'location', label: 'Location', icon: MapPin, placeholder: 'City, Country' },
  { key: 'social_links.website', label: 'Website', icon: Globe, placeholder: 'https://example.com', type: 'url', linkPrefix: '' },
  { key: 'social_links.linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...', type: 'url', linkPrefix: '' },
  { key: 'social_links.twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://x.com/...', type: 'url', linkPrefix: '' },
];

function getFieldValue(contact, key) {
  if (key.startsWith('social_links.')) {
    const sub = key.split('.')[1];
    return contact.social_links?.[sub] || '';
  }
  // For email, also check if name is an email
  if (key === 'email') {
    return contact.email || (contact.name?.includes('@') ? contact.name : '');
  }
  return contact[key] || '';
}

function InlineField({ field, value, isDark, editing, draft, setDraft, onStartEdit, onSave, onCancel, isSaving }) {
  const Icon = field.icon;
  const darkIcon = isDark ? { color: '#64748b' } : { color: '#94a3b8' };
  const darkText = isDark ? { color: '#f1f5f9' } : { color: '#0f172a' };
  const darkMuted = isDark ? { color: '#64748b' } : { color: '#94a3b8' };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" style={darkIcon} />
        <Input
          autoFocus
          type={field.type || 'text'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={field.placeholder}
          className="h-7 text-sm flex-1"
          style={isDark ? { backgroundColor: '#0f172a', borderColor: '#475569', color: '#e5e7eb' } : {}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
        />
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onSave} disabled={isSaving}>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onCancel}>
          <X className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>
    );
  }

  if (value) {
    const isLink = field.linkPrefix !== undefined;
    const href = field.linkPrefix ? `${field.linkPrefix}${value}` : value;

    return (
      <div className="flex items-center gap-3 group">
        <Icon className="w-4 h-4 shrink-0" style={darkIcon} />
        {isLink ? (
          <a href={href} target={field.type === 'url' ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm hover:underline truncate flex-1" style={darkText}>
            {value}
          </a>
        ) : (
          <span className="text-sm truncate flex-1" style={darkText}>{value}</span>
        )}
        <button
          onClick={() => onStartEdit(value)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
        >
          <Pencil className="w-3 h-3" style={darkMuted} />
        </button>
      </div>
    );
  }

  // Empty — show "add" button
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 shrink-0" style={darkIcon} />
      <button
        onClick={() => onStartEdit('')}
        className="text-sm flex items-center gap-1 hover:underline"
        style={darkMuted}
      >
        <Plus className="w-3 h-3" />
        Add {field.label.toLowerCase()}
      </button>
    </div>
  );
}

export default function ContactInfoSection({ contact, isDark, editingField, fieldDraft, setFieldDraft, startEdit, saveField, cancelEdit, isSaving }) {
  return (
    <div className="space-y-3 p-4 rounded-lg border contact-detail-section" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155' } : { backgroundColor: '#f8fafc' }}>
      {FIELDS.map((field) => {
        const val = getFieldValue(contact, field.key);
        return (
          <InlineField
            key={field.key}
            field={field}
            value={val}
            isDark={isDark}
            editing={editingField === field.key}
            draft={fieldDraft}
            setDraft={setFieldDraft}
            onStartEdit={(v) => startEdit(field.key, v)}
            onSave={() => saveField(field.key)}
            onCancel={cancelEdit}
            isSaving={isSaving}
          />
        );
      })}
    </div>
  );
}