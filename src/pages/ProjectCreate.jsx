import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import HelpHint from "@/components/hud/HelpHint";
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
    // Gamification: points + badge for project contribution
    try {
      const me = await base44.auth.me();
      const profs = await base44.entities.UserProfile.filter({ user_id: me.email });
      const myProfile = (profs || [])[0];
      if (myProfile) {
        await base44.entities.UserProfile.update(myProfile.id, {
          engagement_points: (myProfile.engagement_points || 0) + 30
        });
        const existing = await base44.entities.Badge.filter({ user_id: myProfile.user_id, code: 'project_contributor' });
        if (!(existing && existing.length)) {
          await base44.entities.Badge.create({ user_id: myProfile.user_id, code: 'project_contributor', status: 'active' });
        }
      }
    } catch (e) {
      console.error('Gamification project award failed', e);
    }
    window.location.href = createPageUrl("CommandDeck");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Add Project
            <HelpHint
              content={(
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">How to Evaluate Project Impact</h3>
                  <p className="text-slate-700 mb-2">Understanding Industrial Value vs. Humanitarian Score. These are independent dimensions; score each honestly before any ethical weighting is applied.</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Industrial Value (0.0–10.0)</strong>
                      <div className="mt-1 text-slate-700">
                        <div className="font-medium">What it measures:</div>
                        <div>Economic strength, operational advantage, and long-term resilience.</div>
                        <div className="font-medium mt-1">Consider:</div>
                        <ul className="list-disc pl-5">
                          <li>Revenue, cost reduction, funding/market unlocks</li>
                          <li>Scalability, IP/systems created</li>
                          <li>Strategic advantage, supplier resilience, stability</li>
                        </ul>
                        <div className="mt-1 text-xs text-slate-500">Scale: 0–2.9 minimal • 3–4.9 limited • 5–6.9 solid • 7–8.9 strong • 9–10 transformational.</div>
                      </div>
                    </li>
                    <li>
                      <strong>Humanitarian Score (1–10)</strong>
                      <div className="mt-1 text-slate-700">
                        <div className="font-medium">What it measures:</div>
                        <div>Impact on human well-being, equity, safety, and sustainability.</div>
                        <div className="font-medium mt-1">Consider:</div>
                        <ul className="list-disc pl-5">
                          <li>Safety & health (risk reduction, prevention)</li>
                          <li>Equity & inclusion (access, underserved groups)</li>
                          <li>Sustainability & long-term stewardship</li>
                        </ul>
                        <div className="mt-1 text-xs text-rose-600">Ethical floor: scores below 4 are flagged for review.</div>
                      </div>
                    </li>
                    <li>
                      <strong>Keep Scores Separate</strong>
                      <div>Industrial uses decimals; Humanitarian uses whole numbers for moral clarity.</div>
                    </li>
                    <li>
                      <strong>Guidance</strong>
                      <ul className="list-disc pl-5">
                        <li>Don’t offset one score to compensate the other</li>
                        <li>Score what is, not hopes</li>
                        <li>Ask: would I defend this publicly if weights were reversed?</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}
            />
          </h1>
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
              <Label className="text-sm flex items-center gap-1">Industrial Value
                <HelpHint
                  content={(
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Industrial Value (0.0–10.0)</h4>
                      <p className="mb-2">Economic viability and strategic strength.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Revenue impact, cost reduction, new funding/markets</li>
                        <li>Scalability, replicability, creation of IP/systems</li>
                        <li>Strategic advantage, resilience, vendor independence</li>
                      </ul>
                      <p className="text-xs mt-2">0–2.9 minimal • 3–4.9 limited • 5–6.9 solid • 7–8.9 strong • 9–10 transformational</p>
                      <p className="text-xs text-slate-500 mt-1">High industrial value ≠ automatic approval.</p>
                    </div>
                  )}
                />
              </Label>
              <Input type="number" step="0.01" value={form.industrial_value} onChange={(e) => update("industrial_value", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm flex items-center gap-1">Humanitarian Score (1-10)
                <HelpHint
                  content={(
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Humanitarian Score (1–10)</h4>
                      <p className="mb-2">Impact on well-being, equity, safety, and sustainability. No zero allowed.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Safety & health (risk reduction, prevention)</li>
                        <li>Equity & inclusion (access, underserved populations)</li>
                        <li>Sustainability & long-term benefit vs. burden</li>
                      </ul>
                      <p className="text-xs mt-2">1–2 weak • 3 marginal • 4 minimum ethical floor • 5–6 clear positive • 7–8 strong • 9–10 life-improving at scale</p>
                      <p className="text-xs text-rose-600 mt-1">Scores &lt; 4 are auto-flagged for ethical review.</p>
                    </div>
                  )}
                />
              </Label>
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