import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Phone, FileText, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  email_sent: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Sent Email' },
  email_received: { icon: Mail, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Received Email' },
  meeting: { icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Meeting' },
  call: { icon: Phone, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Call' },
  note: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Note' },
  file: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', label: 'File' },
};

export default function ContactInteractionTimeline({ contactId }) {
  const [expanded, setExpanded] = React.useState(false);

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['contactInteractions', contactId],
    queryFn: () => base44.entities.ContactInteraction.filter({ contact_id: contactId }, '-occurred_at', 20),
    enabled: !!contactId,
  });

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-slate-50 border animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-56 bg-slate-100 rounded" />
      </div>
    );
  }

  if (interactions.length === 0) return null;

  const shown = expanded ? interactions : interactions.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Interaction Timeline</span>
          <Badge variant="outline" className="text-[10px]">{interactions.length}</Badge>
        </div>
      </div>
      <div className="space-y-2">
        {shown.map(interaction => {
          const cfg = TYPE_CONFIG[interaction.type] || TYPE_CONFIG.note;
          const Icon = cfg.icon;
          return (
            <div key={interaction.id} className={cn("p-2.5 rounded-lg border", cfg.bg)}>
              <div className="flex items-start gap-2">
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{interaction.subject}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">{cfg.label}</Badge>
                  </div>
                  {interaction.summary && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{interaction.summary}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    {interaction.occurred_at && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(interaction.occurred_at), 'MMM d, h:mm a')}
                      </span>
                    )}
                    {interaction.duration_minutes > 0 && (
                      <span>{interaction.duration_minutes}min</span>
                    )}
                    {interaction.source && interaction.source !== 'manual' && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {interaction.source === 'gmail' ? 'Gmail' : interaction.source === 'google_calendar' ? 'Calendar' : interaction.source}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {interactions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-violet-600 hover:text-violet-700 mt-2 py-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Show less' : `Show ${interactions.length - 3} more`}
        </button>
      )}
    </div>
  );
}