import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Square, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const ACTIONS = [
  { label: "Follow 5 leaders", reward: 0.03 },
  { label: "Send 1 message", reward: 0.02 },
  { label: "Book 1 meeting", reward: 0.03 },
  { label: "Join 1 mission", reward: 0.03 },
  { label: "Create 1 offer", reward: 0.03 }
];

export default function QuickStartChecklist() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
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
        {user?.role === 'admin' ? (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { window.location.href = createPageUrl('ProjectOnboard'); }}>
              Import Projects (CSV)
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700" onClick={() => { window.location.href = createPageUrl('ProjectCreate'); }}>
              Add Project
            </Button>
          </div>
        )}
        {ACTIONS.map((action, i) => (
          <div key={i}>
            <div
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
            {/* Read Me info box after step 4 (Join 1 mission) */}
            {i === 3 && (
              <div className="py-3 px-4 mt-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black mb-1">📖 Read Me - Important Tips!</p>
                    <p className="text-xs text-black leading-relaxed">
                      <strong>Earn GGG</strong> for many actions in the app. <strong>Earn GGG for referrals.</strong> Add your projects for funding. Explore in the <strong>Advanced view</strong> to discover more functions of the app.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}