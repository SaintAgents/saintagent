import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, StickyNote, ListTodo } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function TimerLogEntry({ entry, projectTitle, onDelete, onSendToNotes, onSendToTasks }) {
  const label = entry.description || 'Time block';
  const duration = entry.duration_minutes || 0;
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const timeStr = entry.start_time ? format(parseISO(entry.start_time), 'h:mm a') : '';

  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-800 truncate">{label}</p>
        <p className="text-[10px] text-slate-400">
          {timeStr}{projectTitle ? ` • ${projectTitle}` : ''} • {durationStr}
        </p>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          title="Send to Notes"
          onClick={(e) => { e.stopPropagation(); onSendToNotes(entry); }}
        >
          <StickyNote className="w-3 h-3 text-amber-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          title="Send to Tasks"
          onClick={(e) => { e.stopPropagation(); onSendToTasks(entry); }}
        >
          <ListTodo className="w-3 h-3 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </Button>
      </div>
    </div>
  );
}