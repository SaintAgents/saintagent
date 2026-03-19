import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, Mail, MessageSquare, Users, Eye, Reply, 
  MoreVertical, Clock, ChevronRight, AlertCircle 
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500' },
};

export default function SequenceCard({ sequence, onOpen, onToggleStatus, onArchive, onDuplicate }) {
  const cfg = STATUS_CONFIG[sequence.status] || STATUS_CONFIG.draft;
  const stepCount = (sequence.steps || []).length;
  const openRate = sequence.total_sent > 0 ? Math.round((sequence.total_opened / sequence.total_sent) * 100) : 0;
  const replyRate = sequence.total_sent > 0 ? Math.round((sequence.total_replied / sequence.total_sent) * 100) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onOpen(sequence)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{sequence.title}</h3>
              <Badge className={cfg.color}>{cfg.label}</Badge>
            </div>
            {sequence.description && (
              <p className="text-sm text-slate-500 truncate">{sequence.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              {sequence.status === 'active' && (
                <DropdownMenuItem onClick={() => onToggleStatus(sequence, 'paused')}>
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </DropdownMenuItem>
              )}
              {(sequence.status === 'paused' || sequence.status === 'draft') && (
                <DropdownMenuItem onClick={() => onToggleStatus(sequence, 'active')}>
                  <Play className="w-4 h-4 mr-2" /> Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(sequence)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(sequence)} className="text-red-600">
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {(sequence.steps || []).map((step, i) => (
            <React.Fragment key={step.id || i}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${
                step.type === 'email' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-violet-50 border-violet-200 text-violet-700'
              }`}>
                {step.type === 'email' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
              </div>
              {i < stepCount - 1 && (
                <div className="flex items-center gap-0.5 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{step.delay_days || 0}d</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </React.Fragment>
          ))}
          {stepCount === 0 && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> No steps configured
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900">{sequence.total_enrolled || 0}</div>
            <div className="text-[10px] text-slate-500 uppercase">Enrolled</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-0.5">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900">{sequence.total_sent || 0}</div>
            <div className="text-[10px] text-slate-500 uppercase">Sent</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900">{openRate}%</div>
            <div className="text-[10px] text-slate-500 uppercase">Opened</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-violet-500 mb-0.5">
              <Reply className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900">{replyRate}%</div>
            <div className="text-[10px] text-slate-500 uppercase">Replied</div>
          </div>
        </div>

        {/* Tags */}
        {(sequence.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {sequence.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}