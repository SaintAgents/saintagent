import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Users, CheckCircle2, AlertTriangle, FileSpreadsheet, Trash2 } from 'lucide-react';

export default function LegacySAImport() {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const { data: legacySAs = [], isLoading } = useQuery({
    queryKey: ['legacySAs'],
    queryFn: () => base44.entities.LegacySaintAgent.list('-created_date', 500)
  });

  const importMutation = useMutation({
    mutationFn: async (records) => {
      const results = { created: 0, skipped: 0, errors: [] };
      for (const rec of records) {
        try {
          // Check if already exists
          const existing = await base44.entities.LegacySaintAgent.filter({ email: rec.email.toLowerCase() });
          if (existing.length > 0) {
            results.skipped++;
            continue;
          }
          await base44.entities.LegacySaintAgent.create({
            legacy_id: rec.legacy_id || rec.id || '',
            email: rec.email.toLowerCase(),
            name: rec.name || '',
            project_ids: rec.project_ids ? rec.project_ids.split(',').map(s => s.trim()) : []
          });
          results.created++;
        } catch (err) {
          results.errors.push(`${rec.email}: ${err.message}`);
        }
      }
      return results;
    },
    onSuccess: (res) => {
      setResult(res);
      setPreview([]);
      queryClient.invalidateQueries({ queryKey: ['legacySAs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LegacySaintAgent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legacySAs'] })
  });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => {
          if (h === 'id' || h === 'legacy_id') obj.legacy_id = values[i];
          else if (h === 'email') obj.email = values[i];
          else if (h === 'name') obj.name = values[i];
          else if (h === 'project_ids' || h === 'projects') obj.project_ids = values[i];
        });
        return obj;
      }).filter(r => r.email);
      
      setPreview(records);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    setImporting(true);
    importMutation.mutate(preview, {
      onSettled: () => setImporting(false)
    });
  };

  const claimedCount = legacySAs.filter(s => s.claimed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          Legacy Saint Agents Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Import legacy SA users (email, id, name, project_ids). When a user claims a project, 
          their email is checked against this list for auto-approval.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
            <p className="text-xs text-violet-600">Total Legacy SAs</p>
            <p className="text-xl font-bold text-violet-900">{legacySAs.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-600">Claimed</p>
            <p className="text-xl font-bold text-emerald-900">{claimedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600">Unclaimed</p>
            <p className="text-xl font-bold text-slate-900">{legacySAs.length - claimedCount}</p>
          </div>
        </div>

        {/* Upload */}
        <div className="flex items-center gap-3">
          <Input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="flex-1"
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Choose CSV
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          CSV format: <code>email,legacy_id,name,project_ids</code> (project_ids comma-separated within quotes)
        </p>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                <FileSpreadsheet className="w-3 h-3 mr-1" />
                {preview.length} records to import
              </Badge>
              <Button onClick={handleImport} disabled={importing} className="bg-violet-600 hover:bg-violet-700">
                {importing ? 'Importing...' : 'Import All'}
              </Button>
            </div>
            <ScrollArea className="h-40 border rounded-lg p-2">
              <div className="space-y-1 text-xs">
                {preview.slice(0, 20).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 border-b border-slate-100">
                    <span className="font-mono text-slate-500">{r.legacy_id || '-'}</span>
                    <span className="font-medium">{r.email}</span>
                    <span className="text-slate-400">{r.name}</span>
                  </div>
                ))}
                {preview.length > 20 && (
                  <p className="text-slate-400 py-2">...and {preview.length - 20} more</p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Result */}
        {result && (
          <Alert className={result.errors.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}>
            <CheckCircle2 className={`w-4 h-4 ${result.errors.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
            <AlertDescription>
              <strong>{result.created} created</strong>, {result.skipped} skipped (already exist)
              {result.errors.length > 0 && (
                <div className="mt-2 text-xs text-amber-700">
                  Errors: {result.errors.slice(0, 3).join(', ')}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Existing List */}
        {legacySAs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Existing Legacy SAs</h4>
            <ScrollArea className="h-48 border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Legacy ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Status</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {legacySAs.map((sa) => (
                    <tr key={sa.id} className="border-t">
                      <td className="p-2 font-mono">{sa.email}</td>
                      <td className="p-2 text-slate-500">{sa.legacy_id || '-'}</td>
                      <td className="p-2">{sa.name || '-'}</td>
                      <td className="p-2">
                        {sa.claimed ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">Claimed</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Unclaimed</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-red-600"
                          onClick={() => deleteMutation.mutate(sa.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}