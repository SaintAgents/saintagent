import React from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const ACTIONS = [
  { label: "Follow 5 leaders", reward: 0.03 },
  { label: "Send 1 message", reward: 0.02 },
  { label: "Book 1 meeting", reward: 0.03 },
  { label: "Join 1 mission", reward: 0.03 },
  { label: "Create 1 offer", reward: 0.03 }
];

export default function QuickStartChecklist() {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-600">Progress</span>
          <span className="text-xs font-medium text-slate-700">0/5</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>
      <div className="space-y-3">
        {ACTIONS.map((action, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <Square className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-900">{action.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> +{action.reward} GGG
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}