import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

export default function WorkflowExecutionLog({ workflowId }) {
  const { data: executions = [], isLoading } = useQuery({
    queryKey: ['workflowExecutions', workflowId],
    queryFn: () => base44.entities.CRMWorkflowExecution.filter({ workflow_id: workflowId }, '-created_date', 50)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p>No executions yet</p>
        <p className="text-sm">This workflow hasn't run on any contacts</p>
      </div>
    );
  }

  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
    running: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Running', spin: true },
    paused: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Paused' }
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {executions.map((exec) => {
          const config = statusConfig[exec.status] || statusConfig.running;
          const StatusIcon = config.icon;
          
          return (
            <Card key={exec.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <p className="font-medium">{exec.contact_name || 'Unknown Contact'}</p>
                      <p className="text-xs text-slate-500">ID: {exec.contact_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={exec.status === 'completed' ? 'default' : exec.status === 'failed' ? 'destructive' : 'secondary'}>
                      {config.label}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(exec.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                {exec.triggered_by && (
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="text-slate-400">Triggered by:</span> {exec.triggered_by}
                  </p>
                )}

                {exec.error_message && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-600 mb-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{exec.error_message}</p>
                  </div>
                )}

                {exec.actions_completed?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-slate-500 mb-2">Actions Completed:</p>
                    <div className="space-y-1">
                      {exec.actions_completed.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {action.error ? (
                            <XCircle className="w-3 h-3 text-red-500" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          <span className="text-slate-600">{action.action_type}</span>
                          {action.result && (
                            <span className="text-slate-400">- {action.result}</span>
                          )}
                          {action.error && (
                            <span className="text-red-500">- {action.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exec.completed_at && (
                  <p className="text-xs text-slate-400 mt-2">
                    Completed: {new Date(exec.completed_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}