import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, Pencil, Mail, MessageSquare, Users, Eye, Reply,
  Clock, CheckCircle2, AlertCircle, Send, BarChart3, UserMinus
} from 'lucide-react';

const STEP_STATUS_ICONS = {
  pending: <Clock className="w-3.5 h-3.5 text-slate-400" />,
  sent: <Send className="w-3.5 h-3.5 text-blue-500" />,
  opened: <Eye className="w-3.5 h-3.5 text-emerald-500" />,
  replied: <Reply className="w-3.5 h-3.5 text-violet-500" />,
  bounced: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  skipped: <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />,
};

export default function SequenceDetailModal({ open, onClose, sequence, onEdit }) {
  const [tab, setTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['sequenceEnrollments', sequence?.id],
    queryFn: () => base44.entities.OutreachEnrollment.filter({ sequence_id: sequence.id }),
    enabled: !!sequence?.id && open,
  });

  const toggleMutation = useMutation({
    mutationFn: (newStatus) => base44.entities.OutreachSequence.update(sequence.id, { status: newStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreachSequences'] }),
  });

  const unenrollMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      await base44.entities.OutreachEnrollment.delete(enrollmentId);
      const updated = (sequence.contact_ids || []).filter(id => {
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        return id !== enrollment?.contact_id;
      });
      await base44.entities.OutreachSequence.update(sequence.id, {
        contact_ids: updated,
        total_enrolled: updated.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequenceEnrollments'] });
      queryClient.invalidateQueries({ queryKey: ['outreachSequences'] });
    },
  });

  if (!sequence) return null;

  const steps = sequence.steps || [];
  const openRate = sequence.total_sent > 0 ? ((sequence.total_opened / sequence.total_sent) * 100).toFixed(1) : 0;
  const replyRate = sequence.total_sent > 0 ? ((sequence.total_replied / sequence.total_sent) * 100).toFixed(1) : 0;
  const bounceRate = sequence.total_sent > 0 ? ((sequence.total_bounced / sequence.total_sent) * 100).toFixed(1) : 0;

  const statusCounts = enrollments.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{sequence.title}</DialogTitle>
              {sequence.description && <p className="text-sm text-slate-500 mt-1">{sequence.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {sequence.status === 'active' ? (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toggleMutation.mutate('paused')}>
                  <Pause className="w-4 h-4" /> Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5 text-emerald-600" onClick={() => toggleMutation.mutate('active')}>
                  <Play className="w-4 h-4" /> Activate
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { onClose(); onEdit(sequence); }}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Enrolled', value: sequence.total_enrolled || 0, icon: Users, color: 'text-slate-600' },
            { label: 'Sent', value: sequence.total_sent || 0, icon: Mail, color: 'text-blue-600' },
            { label: 'Open Rate', value: `${openRate}%`, icon: Eye, color: 'text-emerald-600' },
            { label: 'Reply Rate', value: `${replyRate}%`, icon: Reply, color: 'text-violet-600' },
            { label: 'Bounce Rate', value: `${bounceRate}%`, icon: AlertCircle, color: 'text-red-600' },
          ].map(m => (
            <div key={m.label} className="bg-slate-50 rounded-lg p-3 text-center">
              <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-lg font-bold text-slate-900">{m.value}</div>
              <div className="text-[10px] text-slate-500 uppercase">{m.label}</div>
            </div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-1.5">
              <Users className="w-4 h-4" /> Contacts ({enrollments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 min-h-0">
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700 text-sm">Sequence Steps</h4>
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                      }`}>
                        {i + 1}
                      </div>
                      {i < steps.length - 1 && <div className="w-px h-8 bg-slate-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2">
                        {step.type === 'email' ? <Mail className="w-4 h-4 text-blue-500" /> : <MessageSquare className="w-4 h-4 text-violet-500" />}
                        <span className="font-medium text-sm">{step.subject || `${step.type === 'email' ? 'Email' : 'Message'} Step`}</span>
                      </div>
                      {i > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Wait {step.delay_days || 0}d {step.delay_hours > 0 ? `${step.delay_hours}h` : ''} • Send at {step.send_time || '09:00'}
                        </p>
                      )}
                      {step.body && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{step.body}</p>}
                    </div>
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">No steps configured yet</p>
                )}

                {/* Enrollment Status Breakdown */}
                {enrollments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-700 text-sm mb-3">Enrollment Status</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className="bg-slate-50 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="enrollments" className="flex-1 min-h-0">
            <ScrollArea className="h-[350px]">
              <div className="space-y-1">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                      {(enrollment.contact_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{enrollment.contact_name}</div>
                      <div className="text-xs text-slate-500 truncate">{enrollment.contact_email || 'No email'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        Step {(enrollment.current_step || 0) + 1}/{steps.length}
                      </Badge>
                      <Progress value={steps.length > 0 ? ((enrollment.current_step || 0) / steps.length) * 100 : 0} className="w-16 h-1.5" />
                      <div className="flex items-center gap-1">
                        {(enrollment.step_statuses || []).map((ss, i) => (
                          <div key={i} title={`Step ${i + 1}: ${ss.status}`}>
                            {STEP_STATUS_ICONS[ss.status] || STEP_STATUS_ICONS.pending}
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600"
                        onClick={() => unenrollMutation.mutate(enrollment.id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {enrollments.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">No contacts enrolled yet</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}