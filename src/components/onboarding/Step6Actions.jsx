import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

const FIRST_ACTIONS = [
  { label: "Follow 5 leaders", reward: 0.03, completed: false },
  { label: "Send 1 message", reward: 0.02, completed: false },
  { label: "Book 1 meeting", reward: 0.03, completed: false },
  { label: "Join 1 mission", reward: 0.03, completed: false },
  { label: "Create 1 offer", reward: 0.03, completed: false }
];

export default function Step6Actions({ onComplete }) {
  const handleFinish = () => {
    onComplete({});
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">You're All Set!</h2>
        <p className="text-slate-600">Here are some quick actions to get started</p>
      </div>

      <div className="space-y-3">
        {FIRST_ACTIONS.map((action, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
              <span className="font-medium text-slate-900">{action.label}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <Sparkles className="w-4 h-4" />
              +{action.reward} GGG
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 text-center">
        <p className="text-sm text-slate-600 mb-4">
          Complete these actions to earn your first <strong>0.14 GGG</strong> (~$20) and unlock powerful matches!
        </p>
        <Button
          onClick={handleFinish}
          className="w-full bg-violet-600 hover:bg-violet-700"
          size="lg"
        >
          Enter Command Deck
        </Button>
      </div>
    </div>
  );
}