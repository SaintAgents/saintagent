import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function RFIResponseSection({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState({});
  const rfiItems = project?.phase1_rfi_items || [];
  const existingResponses = project?.rfi_responses || [];

  const submitMutation = useMutation({
    mutationFn: async (questionIndex) => {
      const question = rfiItems[questionIndex];
      const responseText = responses[questionIndex];
      if (!responseText?.trim()) return;

      const updatedResponses = [
        ...existingResponses.filter(r => r.question !== question),
        {
          question,
          response: responseText.trim(),
          responded_by: currentUser?.email,
          responded_at: new Date().toISOString()
        }
      ];

      await base44.entities.Project.update(project.id, {
        rfi_responses: updatedResponses
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluationProject', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  if (rfiItems.length === 0) return null;

  const getExistingResponse = (question) => {
    return existingResponses.find(r => r.question === question);
  };

  return (
    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-900">Request for Information (RFI)</h4>
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          {existingResponses.length}/{rfiItems.length} answered
        </Badge>
      </div>
      <p className="text-sm text-blue-700 mb-3">
        The AI evaluation identified the following information gaps. Please provide your responses below.
      </p>

      <div className="space-y-4">
        {rfiItems.map((item, index) => {
          const existing = getExistingResponse(item);
          const isAnswered = !!existing;

          return (
            <div key={index} className="bg-white rounded-lg border border-blue-100 p-4">
              <div className="flex items-start gap-2 mb-2">
                {isAnswered ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                <p className="text-sm font-medium text-slate-800">{item}</p>
              </div>

              {isAnswered ? (
                <div className="ml-6 mt-2">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <p className="text-sm text-slate-700">{existing.response}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Answered by {existing.responded_by} • {new Date(existing.responded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-xs text-blue-600"
                    onClick={() => setResponses({ ...responses, [index]: existing.response })}
                  >
                    Edit response
                  </Button>
                  {responses[index] !== undefined && (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={responses[index]}
                        onChange={(e) => setResponses({ ...responses, [index]: e.target.value })}
                        placeholder="Update your response..."
                        className="min-h-16 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => submitMutation.mutate(index)}
                          disabled={submitMutation.isPending || !responses[index]?.trim()}
                        >
                          {submitMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updated = { ...responses };
                            delete updated[index];
                            setResponses(updated);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ml-6 mt-2 space-y-2">
                  <Textarea
                    value={responses[index] || ''}
                    onChange={(e) => setResponses({ ...responses, [index]: e.target.value })}
                    placeholder="Type your response here..."
                    className="min-h-16 text-sm"
                  />
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => submitMutation.mutate(index)}
                    disabled={submitMutation.isPending || !responses[index]?.trim()}
                  >
                    {submitMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                    Submit Response
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}