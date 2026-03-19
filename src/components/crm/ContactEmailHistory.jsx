import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, Eye, Reply, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  sent: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Sent' },
  delivered: { icon: Mail, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Delivered' },
  opened: { icon: Eye, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Opened' },
  clicked: { icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Clicked' },
  replied: { icon: Reply, color: 'text-green-600', bg: 'bg-green-50', label: 'Replied' },
  bounced: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Bounced' },
  failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
};

export default function ContactEmailHistory({ contactId }) {
  const [expanded, setExpanded] = React.useState(false);

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['contactEmails', contactId],
    queryFn: () => base44.entities.EmailCampaign.filter({ contact_id: contactId }, '-sent_at', 20),
    enabled: !!contactId,
  });

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-slate-50 border animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-48 bg-slate-100 rounded" />
      </div>
    );
  }

  if (emails.length === 0) return null;

  const shown = expanded ? emails : emails.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Email History</span>
          <Badge variant="outline" className="text-[10px]">{emails.length}</Badge>
        </div>
      </div>
      <div className="space-y-2">
        {shown.map(email => {
          const cfg = STATUS_CONFIG[email.status] || STATUS_CONFIG.sent;
          const Icon = cfg.icon;
          return (
            <div key={email.id} className={cn("p-2.5 rounded-lg border", cfg.bg)}>
              <div className="flex items-start gap-2">
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{email.subject}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{email.body}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    {email.sent_at && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(email.sent_at), 'MMM d, h:mm a')}
                      </span>
                    )}
                    {email.opened_at && (
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3 text-violet-400" />
                        Opened {format(new Date(email.opened_at), 'MMM d')}
                      </span>
                    )}
                    {email.replied_at && (
                      <span className="flex items-center gap-0.5">
                        <Reply className="w-3 h-3 text-green-500" />
                        Replied {format(new Date(email.replied_at), 'MMM d')}
                      </span>
                    )}
                    {email.template_used && email.template_used !== 'custom' && (
                      <span className="text-slate-400">via {email.template_used}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {emails.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-violet-600 hover:text-violet-700 mt-2 py-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Show less' : `Show ${emails.length - 3} more`}
        </button>
      )}
    </div>
  );
}