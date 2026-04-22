import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link2, X, Check } from "lucide-react";

export default function TaskDependencyPicker({ 
  currentTaskId, 
  currentDeps = [], 
  allTasks, 
  onChange 
}) {
  const [open, setOpen] = useState(false);

  // Filter out current task and build options
  const availableTasks = allTasks.filter(t => t.id && t.id !== currentTaskId);

  const toggleDep = (taskId) => {
    const newDeps = currentDeps.includes(taskId)
      ? currentDeps.filter(id => id !== taskId)
      : [...currentDeps, taskId];
    onChange(newDeps);
  };

  const removeDep = (taskId) => {
    onChange(currentDeps.filter(id => id !== taskId));
  };

  const depTasks = availableTasks.filter(t => currentDeps.includes(t.id));

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {depTasks.map(t => (
        <Badge 
          key={t.id} 
          variant="outline" 
          className="text-xs gap-1 bg-amber-50 border-amber-200 text-amber-700 pl-1.5 pr-1"
        >
          {t.title?.length > 20 ? t.title.slice(0, 20) + '…' : t.title}
          <button 
            onClick={() => removeDep(t.id)} 
            className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </Badge>
      ))}
      
      {availableTasks.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-1.5 text-xs text-slate-400 hover:text-slate-600 gap-1"
            >
              <Link2 className="w-3 h-3" />
              {currentDeps.length === 0 ? 'Add blocker' : '+'}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <p className="text-xs font-medium text-slate-500 mb-2 px-1">
              Select blocking tasks:
            </p>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {availableTasks.map(t => {
                const isSelected = currentDeps.includes(t.id);
                const status = t.status || (t.completed ? 'completed' : 'todo');
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleDep(t.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors",
                      isSelected 
                        ? "bg-amber-50 text-amber-800" 
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      isSelected ? "bg-amber-500 border-amber-500" : "border-slate-300"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={cn(
                      "flex-1 truncate",
                      status === 'completed' && "line-through text-slate-400"
                    )}>
                      {t.title}
                    </span>
                    {status === 'completed' && (
                      <span className="text-emerald-500 text-[10px]">Done</span>
                    )}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}