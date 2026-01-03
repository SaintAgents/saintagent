import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function ProjectCSVImport() {
  const [file, setFile] = React.useState(null);
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");

  const downloadTemplate = () => {
    const headers = [
      "title",
      "description",
      "budget",
      "industrial_value",
      "humanitarian_score",
      "status",
      "impact_tags",
      "strategic_intent",
      "negative_environmental_impact"
    ];
    const sample = [
      "Clean Water Initiative,Community well project in rural area,25000,6,9,pending_review,water;health;equity,Improve access to safe water,false",
      "Factory Automation Upgrade,Increase throughput via robotics,1200000,9,5,pending_review,industry;automation;efficiency,Scale production,true"
    ].join("\n");
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

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError("");
    setResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const jsonSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: true,
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      budget: { anyOf: [{ type: 'number' }, { type: 'string' }] },
      industrial_value: { anyOf: [{ type: 'number' }, { type: 'string' }] },
      humanitarian_score: { anyOf: [{ type: 'number' }, { type: 'string' }] },
      status: { type: 'string' },
      impact_tags: { type: 'string' },
      strategic_intent: { type: 'string' },
      negative_environmental_impact: { anyOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'number' }] }
    }
  }
};
const extract = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: jsonSchema });
      if (extract.status !== "success" || !extract.output) {
        throw new Error(extract.details || "Failed to parse CSV");
      }
      const rows = Array.isArray(extract.output) ? extract.output : [extract.output];
      // Coerce keys to consistent casing (optional)
      const normalizedKeys = rows.map((row) => {
        const out = {};
        Object.keys(row || {}).forEach((k) => { out[k.trim()] = row[k]; });
        return out;
      });

      // Normalize records to Project shape
      const normalized = rows.map((r) => {
        const coerceBool = (v) => {
          if (typeof v === "boolean") return v;
          if (typeof v === "number") return v !== 0;
          const s = String(v || "").trim().toLowerCase();
          return ["true", "yes", "1"].includes(s);
        };
        const num = (v) => (v === null || v === undefined || v === "" ? undefined : Number(v));
        const tags = (() => {
          const raw = r.impact_tags ?? r.tags;
          if (Array.isArray(raw)) return raw.map((t) => String(t));
          if (typeof raw === "string") return raw.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
          return [];
        })();
        const status = (r.status || "pending_review").toString().toLowerCase().replace(/\s+/g, "_");
        const hs = num(r.humanitarian_score);
        const iv = num(r.industrial_value);
        const budget = num(r.budget);

        const known = new Set(["title","description","budget","industrial_value","humanitarian_score","status","impact_tags","tags","strategic_intent","intent","negative_environmental_impact"]);
        const metadata = {};
        Object.entries(r || {}).forEach(([k, v]) => {
          if (!known.has(k)) metadata[k] = v;
        });

        const rec = {
          title: r.title,
          description: r.description || "",
          budget: typeof budget === "number" ? budget : 0,
          industrial_value: typeof iv === "number" ? iv : 0,
          humanitarian_score: typeof hs === "number" ? Math.max(1, Math.min(10, hs)) : 5,
          status: ["draft","pending_review","approved","rejected","flagged"].includes(status) ? status : "pending_review",
          impact_tags: tags,
          strategic_intent: r.strategic_intent || r.intent || "",
          negative_environmental_impact: coerceBool(r.negative_environmental_impact)
        };
        if (Object.keys(metadata).length) rec.metadata = metadata;
        return rec;
      }).filter((r) => r.title);

      // Try bulk create first
      let created = [];
      if (normalized.length > 0) {
        if (base44.entities.Project.bulkCreate) {
          created = await base44.entities.Project.bulkCreate(normalized);
        } else {
          for (const rec of normalized) {
            const c = await base44.entities.Project.create(rec);
            created.push(c);
          }
        }
      }
      setResult({ imported: created.length });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Import Projects (CSV)</h3>
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="rounded-lg">Download Template</Button>
      </div>
      <p className="text-sm text-slate-600">Upload a CSV matching the template to bulk onboard projects.</p>
      <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded-xl" />
      <div className="flex gap-2">
        <Button onClick={handleImport} disabled={!file || importing} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
          {importing ? "Importing..." : "Import"}
        </Button>
        {result && (
          <div className="text-sm text-emerald-700 font-medium">Imported {result.imported} project(s)</div>
        )}
        {error && (
          <div className="text-sm text-rose-600">{error}</div>
        )}
      </div>
    </div>
  );
}