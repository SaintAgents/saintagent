import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function ProjectCSVImport() {
  const [file, setFile] = React.useState(null);
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");
  const [logs, setLogs] = React.useState([]);
  const log = (m) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);

  const downloadTemplate = () => {
    const headers = [
    "projectid", "projectnumber", "projectname", "projectarea", "projectdescription", "projectbenefits", "projectmethods", "projectadditional", "projecttotalcost", "projecttype", "projectphase", "projectpartners", "projectscope"];

    const sample = [
    "P-0001,42,Neighborhood Microgrid,energy;resilience,Local solar + storage,Lower outages; lower bills,Install panels and batteries,Add EV chargers,1500000,energy,pilot,Utility; City,City-wide",
    "P-0002,43,Community Garden,food;health,Urban garden network,Fresh produce; community,Permaculture methods,Add workshops,120000,community,phase 2,Local NGOs,Neighborhood"].join("\n");
    const csv = headers.join(",") + "\n" + sample;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const norm = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = norm.split("\n").filter((l) => l.trim().length > 0);
    if (!lines.length) return [];
    const splitLine = (line) => {
      const out = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out.map((s) => s.trim());
    };
    const headers = splitLine(lines[0]).map((h) => h.replace(/^\uFEFF/, '').toLowerCase());
    const rows = lines.slice(1).map(splitLine).map((cols) => {
      const obj = {};
      cols.forEach((v, i) => {
        const key = headers[i] || `col_${i}`;
        obj[key.toLowerCase()] = v;
      });
      return obj;
    });
    return rows;
  };

  // Normalize object keys to lowercase (helps with cloud extractor field cases)
  const lowerKeys = (obj) => {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => { out[String(k).toLowerCase()] = v; });
    return out;
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError("");
    setResult(null);
    setLogs([]);
    log('Starting import');
    try {
      let rows = [];
      try {
        log('Uploading file to cloud...');
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        log(`Upload complete: ${file_url}`);
        // Force CSV parsing by giving schema with expected fields
        const jsonSchema = {
          type: 'object',
          properties: {
            projectid: { type: 'string' },
            projectnumber: { type: 'string' },
            projectname: { type: 'string' },
            projectarea: { type: 'string' },
            projectdescription: { type: 'string' },
            projectbenefits: { type: 'string' },
            projectmethods: { type: 'string' },
            projectadditional: { type: 'string' },
            projecttotalcost: { type: 'string' },
            projecttype: { type: 'string' },
            projectphase: { type: 'string' },
            projectpartners: { type: 'string' },
            projectscope: { type: 'string' }
          },
          additionalProperties: true
        };
        const extract = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: jsonSchema });
        if (extract.status === "success" && extract.output) {
          const rawRows = Array.isArray(extract.output) ? extract.output : [extract.output];
          rows = rawRows.map(lowerKeys);
          log(`Cloud parsed ${rows.length} row(s)`);
          if (rows.length > 0) {
            log(`Detected columns: ${Object.keys(rows[0]).join(', ')}`);
          }
        } else {
          throw new Error(extract.details || 'Cloud extraction failed');
        }
      } catch (cloudErr) {
        log(`Cloud operation unsuccessful. Falling back to local parse: ${cloudErr?.message || cloudErr}`);
        const text = await file.text();
        rows = parseCSV(text);
        log(`Locally parsed ${rows.length} row(s)`);
      }
      // Normalize records to Project shape using your headers
      const normalized = rows.map((r) => {
        const num = (v) => v === null || v === undefined || v === '' ? undefined : Number(String(v).replace(/[$,]/g, ''));
        const tags = (() => {
          const raw = r.projectarea;
          if (Array.isArray(raw)) return raw.map((t) => String(t));
          if (typeof raw === 'string') return raw.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
          return [];
        })();
        const budget = num(r.projecttotalcost);
        const descParts = [r.projectdescription, r.projectbenefits, r.projectmethods, r.projectadditional].filter(Boolean);
        const rec = {
          title: r.projectname || r.projectnumber || r.projectid,
          description: descParts.join(' | ') || '',
          budget: typeof budget === 'number' && !Number.isNaN(budget) ? budget : 0,
          industrial_value: 0,
          humanitarian_score: 5,
          status: 'pending_review',
          impact_tags: tags,
          strategic_intent: r.projectscope || ''
        };
        // Attach all original fields into metadata for traceability
        const known = new Set(['projectname', 'projectnumber', 'projectid', 'projectarea', 'projectdescription', 'projectbenefits', 'projectmethods', 'projectadditional', 'projecttotalcost', 'projecttype', 'projectphase', 'projectpartners', 'projectscope']);
        const metadata = {};
        Object.entries(r || {}).forEach(([k, v]) => {if (!known.has(k)) metadata[k] = v;});
        if (Object.keys(metadata).length) rec.metadata = metadata;
        return rec;
      }).filter((r) => r.title);
      log(`Normalized ${normalized.length} record(s)`);
      if (normalized.length === 0) {
        throw new Error('No valid rows found (missing required title). Please use the provided template and ensure headers like projectname/projectnumber/projectid are present.');
      }

       // Try bulk create first
      let created = [];
      if (normalized.length > 0) {
        log(`Importing ${normalized.length} record(s) ...`);
        if (base44.entities.Project.bulkCreate) {
          created = await base44.entities.Project.bulkCreate(normalized);
        } else {
          for (const rec of normalized) {
            const c = await base44.entities.Project.create(rec);
            created.push(c);
          }
        }
      }
      log(`Imported ${created.length} record(s)`);
      setResult({ imported: created.length });
    } catch (e) {
      setError(e.message || String(e));
      log(`Error: ${e.message || String(e)}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Import Projects (CSV)</h3>
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="bg-purple-100 text-zinc-950 px-3 text-xs font-medium rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8">Download Template</Button>
      </div>
      <p className="text-sm text-slate-600">Upload a CSV matching the template to bulk onboard projects.</p>
      <Input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-purple-50 text-gray-400 px-3 py-1 text-base rounded-xl flex h-9 w-full border border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
      <div className="flex gap-2 items-center flex-wrap">
        <Button onClick={handleImport} disabled={!file || importing} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
          {importing ? "Importing..." : "Import"}
        </Button>
        {result &&
        <div className="text-sm text-emerald-700 font-medium">Imported {result.imported} project(s)</div>
        }
        {error &&
        <div className="text-sm text-rose-600">{error}</div>
        }
      </div>
      {logs.length > 0 &&
      <div className="mt-3 p-2 bg-slate-50 border rounded-lg max-h-40 overflow-auto text-xs text-slate-600">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      }
    </div>);

}