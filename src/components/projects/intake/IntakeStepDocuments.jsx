import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';

function FileUploadField({ label, description, value, onUpload, onClear }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpload(file_url);
    setUploading(false);
  };

  return (
    <div className="p-3 border border-slate-200 rounded-lg bg-white">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      {value ? (
        <div className="flex items-center gap-2 mt-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline truncate flex-1">
            View uploaded file
          </a>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>
      ) : (
        <label className="flex items-center gap-2 mt-2 p-2 border border-dashed border-slate-300 rounded-md cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
          ) : (
            <Upload className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-sm text-slate-500">
            {uploading ? 'Uploading...' : 'Click to upload'}
          </span>
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

export default function IntakeStepDocuments({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  const addOtherDoc = (url) => {
    update('other_documents_urls', [...(formData.other_documents_urls || []), url]);
  };

  const removeOtherDoc = (idx) => {
    const updated = [...(formData.other_documents_urls || [])];
    updated.splice(idx, 1);
    update('other_documents_urls', updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Upload any supporting documents. These help us evaluate your project faster and more thoroughly.
      </p>

      <FileUploadField
        label="Pitch Deck"
        description="PDF or presentation file"
        value={formData.pitch_deck_url}
        onUpload={(url) => update('pitch_deck_url', url)}
        onClear={() => update('pitch_deck_url', '')}
      />

      <FileUploadField
        label="Business Plan"
        description="Comprehensive business plan document"
        value={formData.business_plan_url}
        onUpload={(url) => update('business_plan_url', url)}
        onClear={() => update('business_plan_url', '')}
      />

      <FileUploadField
        label="Financial Projections"
        description="Revenue forecasts, P&L projections"
        value={formData.financial_projections_url}
        onUpload={(url) => update('financial_projections_url', url)}
        onClear={() => update('financial_projections_url', '')}
      />

      <div>
        <Label className="text-sm font-medium mb-2 block">Other Supporting Documents</Label>
        {(formData.other_documents_urls || []).map((url, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2 p-2 border border-slate-200 rounded-md">
            <FileText className="w-4 h-4 text-emerald-600" />
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline truncate flex-1">
              Document {idx + 1}
            </a>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOtherDoc(idx)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </Button>
          </div>
        ))}
        <FileUploadField
          label=""
          value=""
          onUpload={addOtherDoc}
          onClear={() => {}}
        />
      </div>
    </div>
  );
}