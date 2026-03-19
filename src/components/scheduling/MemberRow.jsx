import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function MemberRow({ member, taskCount, maxCapacity = 5 }) {
  const loadPercent = Math.round((taskCount / maxCapacity) * 100);
  const isOverloaded = taskCount > maxCapacity;
  const isNearCapacity = taskCount >= maxCapacity - 1 && taskCount <= maxCapacity;

  return (
    <div className="flex items-center gap-3 p-3 min-w-[180px]">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={member.avatar_url} />
        <AvatarFallback className="text-xs bg-violet-100 text-violet-600">
          {member.display_name?.charAt(0) || member.name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 truncate">
          {member.display_name || member.name || member.user_id}
        </p>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
            <div
              className={`h-full rounded-full transition-all ${
                isOverloaded ? 'bg-red-500' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(loadPercent, 100)}%` }}
            />
          </div>
          <span className={`text-[10px] font-medium ${
            isOverloaded ? 'text-red-600' : isNearCapacity ? 'text-amber-600' : 'text-slate-500'
          }`}>
            {taskCount}/{maxCapacity}
          </span>
          {isOverloaded && <AlertTriangle className="w-3 h-3 text-red-500" />}
        </div>
      </div>
    </div>
  );
}