import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, CheckCircle, Clock, Loader2, Paperclip, X, ExternalLink, Upload } from 'lucide-react';

export default function RFIResponseSection({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState({});
  const [attachments, setAttachments] = useState({});
  const [uploading, setUploading] = useState({});
  const fileInputRefs = useRef({});
  const rfiItems = project?.phase1_rfi_items || [];
  const existingResponses = project?.rfi_responses || [];

  const isOwnerOrAdmin = currentUser && (
    currentUser.role === 'admin' ||
    project?.owner_id === currentUser.email ||
    project?.claimed_by === currentUser.email ||
    project?.created_by_id === currentUser.id
  );

  const handleFileUpload = async (index, files) => {
    if (!files?.length) return;
    setUploading(prev => ({ ...prev, [index]: true }));
    const existing = attachments[index] || [];
    const newUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push({ url: file_url, name: file.name });
    }
    setAttachments(prev => ({ ...prev, [index]: [...existing, ...newUrls] }));
    setUploading(prev => ({ ...prev, [index]: false }));
  };

  const removeAttachment = (index, attachIdx) => {
    setAttachments(prev => ({
      ...prev,
      [index]: (prev[index] || []).filter((_, i) => i !== attachIdx)
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async (questionIndex) => {
      const question = rfiItems[questionIndex];
      const responseText = responses[questionIndex];
      if (!responseText?.trim()) return;

      const responseAttachments = attachments[questionIndex] || [];

      const updatedResponses = [
        ...existingResponses.filter(r => r.question !== question),
        {
          question,
          response: responseText.trim(),
          responded_by: currentUser?.email,
          responded_at: new Date().toISOString(),
          ...(responseAttachments.length > 0 && { attachments: responseAttachments })
        }
      ];

      await base44.entities.Project.update(project.id, {
        rfi_responses: updatedResponses
      });

      // Clear local state for this index
      setResponses(prev => { const n = { ...prev }; delete n[questionIndex]; return n; });
      setAttachments(prev => { const n = { ...prev }; delete n[questionIndex]; return n; });
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
                    {existing.attachments?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {existing.attachments.map((att, ai) => (
                          <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 rounded-md text-xs text-emerald-700 hover:bg-emerald-100 transition-colors">
                            <FileText className="w-3 h-3" />
                            <span className="max-w-[140px] truncate">{att.name || 'Document'}</span>
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Answered by {existing.responded_by} • {new Date(existing.responded_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isOwnerOrAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-xs text-blue-600"
                    onClick={() => {
                      setResponses({ ...responses, [index]: existing.response });
                      if (existing.attachments?.length) setAttachments(prev => ({ ...prev, [index]: existing.attachments }));
                    }}
                  >
                    Edit response
                  </Button>
                  )}
                  {responses[index] !== undefined && (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={responses[index]}
                        onChange={(e) => setResponses({ ...responses, [index]: e.target.value })}
                        placeholder="Update your response..."
                        className="min-h-16 text-sm"
                      />
                      <RFIAttachmentArea
                        index={index}
                        attachments={attachments}
                        uploading={uploading}
                        fileInputRefs={fileInputRefs}
                        onFileUpload={handleFileUpload}
                        onRemove={removeAttachment}
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
                            const updatedAtt = { ...attachments };
                            delete updatedAtt[index];
                            setAttachments(updatedAtt);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isOwnerOrAdmin ? (
                <div className="ml-6 mt-2 space-y-2">
                  <Textarea
                    value={responses[index] || ''}
                    onChange={(e) => setResponses({ ...responses, [index]: e.target.value })}
                    placeholder="Type your response here..."
                    className="min-h-16 text-sm"
                  />
                  <RFIAttachmentArea
                    index={index}
                    attachments={attachments}
                    uploading={uploading}
                    fileInputRefs={fileInputRefs}
                    onFileUpload={handleFileUpload}
                    onRemove={removeAttachment}
                  />
                  <div className="flex items-center gap-2">
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
                </div>
              ) : (
                <div className="ml-6 mt-2">
                  <p className="text-xs text-slate-400 italic">Awaiting response from project owner</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RFIAttachmentArea({ index, attachments, uploading, fileInputRefs, onFileUpload, onRemove }) {
  const files = attachments[index] || [];
  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.csv,.txt,.zip"
        className="hidden"
        ref={el => fileInputRefs.current[index] = el}
        onChange={(e) => { onFileUpload(index, Array.from(e.target.files)); e.target.value = ''; }}
      />
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((att, ai) => (
            <div key={ai} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
              <Paperclip className="w-3 h-3" />
              <span className="max-w-[140px] truncate">{att.name || 'Document'}</span>
              <button onClick={() => onRemove(index, ai)} className="hover:text-red-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs gap-1.5"
        disabled={uploading[index]}
        onClick={() => fileInputRefs.current[index]?.click()}
      >
        {uploading[index] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {uploading[index] ? 'Uploading...' : 'Attach Documents'}
      </Button>
    </div>
  );
}