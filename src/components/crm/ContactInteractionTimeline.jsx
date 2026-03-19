import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, Send, Calendar, Phone, FileText, CheckSquare,
  ArrowDownLeft, ArrowUpRight, Clock, Video, MapPin, Users,
  Loader2, Inbox
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  email_sent: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Email Sent' },
  email_received: { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Email Received' },
  meeting: { icon: Video, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', label: 'Meeting' },
  call: { icon: Phone, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Call' },
  note: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Note' },
  task: { icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Task' },
};

const SOURCE_LABELS = {
  gmail: 'Gmail',
  gcal: 'Google Cal',
  manual: 'Manual',
  outreach: 'Outreach',
  system: 'System'
};

export default function ContactInteractionTimeline({ contactId }) {
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['contactInteractions', contactId],
    queryFn: () => base44.entities.ContactInteraction.filter(
      { contact_id: contactId },
      '-occurred_at',
      50
    ),
    enabled: !!contactId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center">
        <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">No interactions yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Emails and meetings will appear here automatically via Gmail & Calendar sync
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Interaction Timeline</span>
          <Badge variant="outline" className="text-[10px]">{interactions.length}</Badge>
        </div>
      </div>
      <ScrollArea className="max-h-64">
        <div className="relative pl-6 space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
          
          {interactions.map((interaction, idx) => {
            const cfg = TYPE_CONFIG[interaction.interaction_type] || TYPE_CONFIG.note;
            const Icon = cfg.icon;
            const occurredAt = interaction.occurred_at ? new Date(interaction.occurred_at) : null;

            return (
              <div key={interaction.id} className="relative pb-4">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute -left-6 top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 bg-white",
                  cfg.border
                )}>
                  <Icon className={cn("w-3 h-3", cfg.color)} />
                </div>

                <div className={cn("p-2.5 rounded-lg border", cfg.bg, cfg.border)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
                        {interaction.direction && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            {interaction.direction === 'inbound' ? (
                              <ArrowDownLeft className="w-2.5 h-2.5" />
                            ) : (
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            )}
                            {interaction.direction}
                          </span>
                        )}
                        {interaction.source && interaction.source !== 'manual' && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {SOURCE_LABELS[interaction.source] || interaction.source}
                          </Badge>
                        )}
                      </div>
                      {interaction.subject && (
                        <p className="text-sm font-medium text-slate-900 truncate mt-0.5">
                          {interaction.subject}
                        </p>
                      )}
                      {interaction.snippet && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {interaction.snippet}
                        </p>
                      )}
                      {interaction.interaction_type === 'meeting' && (
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                          {interaction.duration_minutes && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {interaction.duration_minutes}min
                            </span>
                          )}
                          {interaction.attendees?.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Users className="w-2.5 h-2.5" />
                              {interaction.attendees.length} attendees
                            </span>
                          )}
                          {interaction.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {interaction.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {occurredAt && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatDistanceToNow(occurredAt, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}