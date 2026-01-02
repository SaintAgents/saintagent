import React from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ProjectCSVExport() {
  const [exporting, setExporting] = React.useState(false);
  const [count, setCount] = React.useState(null);
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

  const toCSV = (rows) => {
    const esc = (v) => {
      if (v === null || v === undefined) return "";
      const s = Array.isArray(v) ? v.join(";") : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    rows.forEach((r) => {
      lines.push([
        esc(r.title),
        esc(r.description),
        esc(r.budget),
        esc(r.industrial_value),
        esc(r.humanitarian_score),
        esc(r.status),
        esc((r.impact_tags || []).join(";")),
        esc(r.strategic_intent),
        esc(r.negative_environmental_impact)
      ].join(","));
    });
    return lines.join("\n");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const projects = await base44.entities.Project.list();
      const csv = toCSV(projects || []);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "projects_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCount(projects?.length || 0);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Export Projects (CSV)</h3>
      </div>
      <p className="text-sm text-slate-600">Download all current projects to a CSV file.</p>
      <Button onClick={handleExport} disabled={exporting} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
        {exporting ? "Exporting..." : "Export CSV"}
      </Button>
      {count !== null && (
        <div className="text-sm text-slate-700">Exported {count} project(s)</div>
      )}
    </div>
  );
}