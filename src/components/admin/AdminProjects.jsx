import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle, XCircle, AlertTriangle, Clock, Eye } from "lucide-react";
import ProjectCSVImport from "@/components/projects/ProjectCSVImport";
import LegacySAImport from "@/components/admin/LegacySAImport";
import FloatingPanel from "@/components/hud/FloatingPanel";
import ProjectDetailCard from "@/components/projects/ProjectDetailCard";

export default function AdminProjects() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [bulkEvaluating, setBulkEvaluating] = useState(false);
  const [evaluatingIds, setEvaluatingIds] = useState(new Set());

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 200)
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Project.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] })
  });

  const filtered = (projects || []).filter((p) => {
    const text = (p.title + " " + (p.description || "")).toLowerCase();
    const textOk = !q || text.includes(q.toLowerCase());
    const statusOk = status === "all" || p.status === status;
    return textOk && statusOk;
  });

  const total = projects.length;
  const approved = projects.filter((p) => p.status === "approved").length;
  const pending = projects.filter((p) => p.status === "pending_review").length;
  const submitted = projects.filter((p) => ["draft", "pending_review"].includes(p.status)).length;

  return (
    <div className="space-y-6">
      {/* Legacy SA Import */}
      <LegacySAImport />

      {/* Bulk Import */}
      <ProjectCSVImport />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-xs text-slate-500">Total</div><div className="text-xl font-bold">{total}</div></div>
        <div className="p-3 rounded-xl bg-emerald-50 border"><div className="text-xs text-emerald-700">Approved</div><div className="text-xl font-bold text-emerald-700">{approved}</div></div>
        <div className="p-3 rounded-xl bg-amber-50 border"><div className="text-xs text-amber-700">Pending</div><div className="text-xl font-bold text-amber-700">{pending}</div></div>
        <div className="p-3 rounded-xl bg-violet-50 border"><div className="text-xs text-violet-700">Submitted</div><div className="text-xl font-bold text-violet-700">{submitted}</div></div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Budget</th>
              <th className="text-left p-3">Tags</th>
              <th className="text-left p-3">Ownership</th>
              <th className="text-left p-3">New Fields</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">No projects found</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium text-slate-900">{p.title}</td>
                <td className="p-3">
                  <Select value={p.status} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v })}>
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">${(p.budget || 0).toLocaleString?.() || 0}</td>
                <td className="p-3 text-slate-600">{(p.impact_tags || []).slice(0,3).join(', ')}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-600">
                      {(p.claim_status || 'unclaimed').toUpperCase()} {p.claimed_by ? `• ${p.claimed_by}` : ''}
                    </span>
                    {p.claim_status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: p.id, status: p.status }) || base44.entities.Project.update(p.id, { claim_status: 'approved' }).then(() => qc.invalidateQueries({ queryKey: ['projects'] }))}>Approve</Button>
                        <Button size="sm" variant="ghost" onClick={() => base44.entities.Project.update(p.id, { claim_status: 'rejected' }).then(() => qc.invalidateQueries({ queryKey: ['projects'] }))}>Reject</Button>
                      </>
                    )}
                    {(p.claim_status && p.claim_status !== 'unclaimed') && (
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => base44.entities.Project.update(p.id, { claim_status: 'unclaimed', claimed_by: null, claimed_at: null }).then(() => qc.invalidateQueries({ queryKey: ['projects'] }))}>Clear</Button>
                    )}
                  </div>
                </td>
                <td className="p-3 text-slate-600">{p.metadata ? Object.keys(p.metadata).length : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}