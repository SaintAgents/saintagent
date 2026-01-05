import React from "react";
import { Button } from "@/components/ui/button";
import { Radio, ArrowRight, Calendar } from "lucide-react";
import HelpHint from '@/components/hud/HelpHint';

export default function InboxSignals({ notifications = [] }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Inbox & Signals: Your notification center. Types: Match alerts (new synchronicity matches), Meeting requests & confirmations, Mission updates & task completions, Direct messages, New followers, GGG transactions (earnings/spending), Rank progression. Priority levels: Low, Normal, High, Urgent. Click any notification to navigate directly to the relevant action." />
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">All caught up!</p>
        </div>
      ) : (
        notifications.slice(0, 5).map((notif) => (
          <div 
            key={notif.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div className="p-2 rounded-lg bg-violet-100">
              <Radio className="w-4 h-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{notif.title}</p>
              <p className="text-xs text-slate-500 truncate">{notif.message}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>
        ))
      )}
    </div>
  );
}