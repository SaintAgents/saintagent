import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createPageUrl } from "@/utils";

export default function ProjectCreate() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    industrial_value: "",
    humanitarian_score: "",
    impact_tags: "",
    strategic_intent: "",
    negative_environmental_impact: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || "",
      budget: form.budget ? Number(form.budget) : 0,
      industrial_value: form.industrial_value ? Number(form.industrial_value) : 0,
      humanitarian_score: form.humanitarian_score ? Number(form.humanitarian_score) : undefined,
      impact_tags: form.impact_tags ? form.impact_tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      strategic_intent: form.strategic_intent || "",
      negative_environmental_impact: !!form.negative_environmental_impact,
      status: "pending_review",
    };
    await base44.entities.Project.create(payload);
    window.location.href = createPageUrl("CommandDeck");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Add Project</h1>
          <p className="text-slate-600 mt-1">Create a single project for ethical review.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200">
          <div>
            <Label className="text-sm">Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Project title" required className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description" className="mt-1 min-h-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Budget</Label>
              <Input type="number" step="0.01" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Industrial Value</Label>
              <Input type="number" step="0.01" value={form.industrial_value} onChange={(e) => update("industrial_value", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Humanitarian Score (1-10)</Label>
              <Input type="number" min="1" max="10" step="1" value={form.humanitarian_score} onChange={(e) => update("humanitarian_score", e.target.value)} placeholder="8" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-sm">Impact Tags (comma separated)</Label>
            <Input value={form.impact_tags} onChange={(e) => update("impact_tags", e.target.value)} placeholder="health, education" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Strategic Intent</Label>
            <Input value={form.strategic_intent} onChange={(e) => update("strategic_intent", e.target.value)} placeholder="Alignment with mission" className="mt-1" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
            <div>
              <Label className="text-sm">Negative Environmental Impact</Label>
              <div className="text-xs text-slate-500">Toggle if this project has known negative environmental effects.</div>
            </div>
            <Switch checked={form.negative_environmental_impact} onCheckedChange={(v) => update("negative_environmental_impact", v)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => (window.location.href = createPageUrl("CommandDeck"))}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-violet-600 hover:bg-violet-700">
              {submitting ? "Saving..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}