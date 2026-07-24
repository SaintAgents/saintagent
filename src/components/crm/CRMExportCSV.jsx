import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const CSV_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'domain', label: 'Domain' },
  { key: 'location', label: 'Location' },
  { key: 'lead_status', label: 'Lead Status' },
  { key: 'lead_source', label: 'Lead Source' },
  { key: 'priority_tier', label: 'Priority' },
  { key: 'relationship_strength', label: 'Relationship Strength' },
  { key: 'quality_score', label: 'Quality Score' },
  { key: 'sentiment_label', label: 'Sentiment' },
  { key: 'tags', label: 'Tags' },
  { key: 'notes', label: 'Notes' },
  { key: 'last_contact_date', label: 'Last Contact' },
  { key: 'next_followup_date', label: 'Next Follow-Up' },
  { key: 'followup_note', label: 'Follow-Up Note' },
  { key: 'is_federated', label: 'Federated' },
  { key: 'stale_days', label: 'Stale Days' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'website', label: 'Website' },
  { key: 'created_date', label: 'Created Date' },
];

function escapeCsvValue(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export default function CRMExportCSV({ contacts }) {
  const handleExport = () => {
    if (!contacts || contacts.length === 0) return;

    const header = CSV_COLUMNS.map(c => c.label).join(',');
    const rows = contacts.map(contact => {
      return CSV_COLUMNS.map(col => {
        if (col.key === 'tags') return escapeCsvValue((contact.tags || []).join('; '));
        if (col.key === 'linkedin') return escapeCsvValue(contact.social_links?.linkedin);
        if (col.key === 'twitter') return escapeCsvValue(contact.social_links?.twitter);
        if (col.key === 'website') return escapeCsvValue(contact.social_links?.website);
        if (col.key === 'is_federated') return contact.is_federated ? 'Yes' : 'No';
        return escapeCsvValue(contact[col.key]);
      }).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      className="gap-2 crm-import-btn"
      disabled={!contacts || contacts.length === 0}
    >
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
}