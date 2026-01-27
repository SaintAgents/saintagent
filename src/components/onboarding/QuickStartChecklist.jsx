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
            {/* Read Me hover info after step 4 (Join 1 mission) */}
            {i === 3 && (
              <div className="flex justify-end mt-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200 transition-colors cursor-pointer">
                      <Info className="w-3.5 h-3.5" />
                      📖 READ ME
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 p-4" side="top">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900">💡 Important Tips!</p>
                      <ul className="text-xs text-slate-600 space-y-1.5">
                        <li>• <strong>Earn GGG!</strong> - Refer friends</li>
                        <li>• <strong>Advanced view</strong> for more to explore and receive rewards</li>
                        <li>• <strong>Submit projects</strong> for funding</li>
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}