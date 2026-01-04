import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
  Download, Loader2, FileText, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DOMAIN_OPTIONS = ['finance', 'tech', 'governance', 'health', 'education', 'media', 'legal', 'spiritual', 'creative', 'nonprofit', 'other'];
const PERMISSION_OPTIONS = ['private', 'signal_only', 'masked', 'shared'];

export default function ContactImportModal({ open, onClose, currentUserId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const queryClient = useQueryClient();

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Parse CSV
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      setError('File must have a header row and at least one data row');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx]?.trim().replace(/"/g, '') || '';
      });

      // Map common header variations
      const mapped = {
        name: record.name || record.full_name || record.fullname || record.contact_name || record['contact name'] || '',
        email: record.email || record.email_address || record['email address'] || '',
        phone: record.phone || record.phone_number || record['phone number'] || record.mobile || '',
        company: record.company || record.organization || record.org || '',
        role: record.role || record.title || record.job_title || record['job title'] || record.position || '',
        domain: normalizeDomain(record.domain || record.industry || record.sector || ''),
        location: record.location || record.city || record.address || '',
        notes: record.notes || record.note || record.comments || '',
        tags: record.tags || '',
        linkedin: record.linkedin || record.linkedin_url || record['linkedin url'] || '',
        twitter: record.twitter || record.twitter_url || '',
        website: record.website || record.url || ''
      };

      if (mapped.name || mapped.email) {
        records.push(mapped);
      }
    }

    setPreview(records.slice(0, 10));
    if (records.length === 0) {
      setError('No valid contacts found. Make sure your CSV has a "name" or "email" column.');
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const normalizeDomain = (value) => {
    const lower = value.toLowerCase();
    if (DOMAIN_OPTIONS.includes(lower)) return lower;
    // Try to match partial
    const match = DOMAIN_OPTIONS.find(d => lower.includes(d) || d.includes(lower));
    return match || 'other';
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    setImporting(true);
    setError(null);

    // Re-parse full file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const allRecords = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx]?.trim().replace(/"/g, '') || '';
      });

      const mapped = {
        owner_id: currentUserId,
        name: record.name || record.full_name || record.fullname || record.contact_name || record['contact name'] || 'Unknown',
        email: record.email || record.email_address || record['email address'] || '',
        phone: record.phone || record.phone_number || record['phone number'] || record.mobile || '',
        company: record.company || record.organization || record.org || '',
        role: record.role || record.title || record.job_title || record['job title'] || record.position || '',
        domain: normalizeDomain(record.domain || record.industry || record.sector || ''),
        location: record.location || record.city || record.address || '',
        notes: record.notes || record.note || record.comments || '',
        tags: (record.tags || '').split(/[,;]/).map(t => t.trim()).filter(Boolean),
        permission_level: 'private',
        relationship_strength: 3,
        is_federated: false,
        social_links: {
          linkedin: record.linkedin || record.linkedin_url || record['linkedin url'] || '',
          twitter: record.twitter || record.twitter_url || '',
          website: record.website || record.url || ''
        }
      };

      if (mapped.name && mapped.name !== 'Unknown') {
        allRecords.push(mapped);
      }
    }

    let created = 0;
    let failed = 0;

    // Bulk create in batches
    const batchSize = 20;
    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize);
      try {
        await base44.entities.Contact.bulkCreate(batch);
        created += batch.length;
      } catch (err) {
        // Try individual creates for failed batch
        for (const record of batch) {
          try {
            await base44.entities.Contact.create(record);
            created++;
          } catch {
            failed++;
          }
        }
      }
    }

    setImporting(false);
    setResult({ created, failed, total: allRecords.length });
    queryClient.invalidateQueries({ queryKey: ['myContacts'] });
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setError(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'name,email,phone,company,role,domain,location,notes,tags,linkedin\nJohn Doe,john@example.com,+1234567890,Acme Corp,CEO,tech,New York,Met at conference,"networking,tech",https://linkedin.com/in/johndoe';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-violet-600" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import your contacts in bulk
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-slate-900">Accepted Formats</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" />
                CSV (.csv)
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              <strong>Supported columns:</strong> name, email, phone, company, role/title, domain/industry, 
              location, notes, tags, linkedin, twitter, website
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          {!result && (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                file ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
              )}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              {file ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-10 h-10 text-violet-600 mx-auto" />
                  <div className="font-medium text-slate-900">{file.name}</div>
                  <div className="text-sm text-slate-500">
                    {preview.length > 0 ? `${preview.length}+ contacts found` : 'Processing...'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview([]);
                      setError(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="font-medium text-slate-700">Click to upload or drag and drop</div>
                  <div className="text-sm text-slate-500">CSV file up to 10MB</div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-rose-700">{error}</div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !result && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">Preview (first 10 contacts)</div>
              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Email</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Company</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Domain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.map((contact, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-900">{contact.name || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{contact.email || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{contact.company || '-'}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs capitalize">{contact.domain}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-semibold text-emerald-800">Import Complete!</div>
              <div className="text-sm text-emerald-700">
                Successfully imported <strong>{result.created}</strong> contacts
                {result.failed > 0 && <span className="text-rose-600"> ({result.failed} failed)</span>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>
              {result ? 'Done' : 'Cancel'}
            </Button>
            {!result && preview.length > 0 && (
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Contacts
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}