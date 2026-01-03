import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';

export default function SharedDoc({ conversationId }) {
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['collabDoc', conversationId],
    queryFn: () => base44.entities.CollabDoc.filter({ conversation_id: conversationId }),
    enabled: !!conversationId,
    refetchInterval: 1000
  });
  const doc = docs?.[0];

  const upsert = useMutation({
    mutationFn: async (content) => {
      if (doc) return base44.entities.CollabDoc.update(doc.id, { content, updated_by: me?.email });
      return base44.entities.CollabDoc.create({ conversation_id: conversationId, content, updated_by: me?.email });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collabDoc', conversationId] })
  });

  const [value, setValue] = React.useState('');
  React.useEffect(() => {if (doc && doc.content !== value) setValue(doc.content || '');}, [doc?.id, doc?.content]);

  const lastChangeRef = React.useRef(0);
  const onChange = (v) => {
    setValue(v);
    const now = Date.now();
    if (now - lastChangeRef.current > 400) {
      lastChangeRef.current = now;
      upsert.mutate(v);
    }
  };

  return (
    <div className="border rounded-xl bg-white">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm text-slate-600">Shared Document</div>
        <Button size="sm" variant="outline" onClick={() => upsert.mutate(value)} className="bg-fuchsia-50 text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8">Save</Button>
      </div>
      <ReactQuill theme="snow" value={value} onChange={onChange} className="h-64" />
      <div className="p-2 text-xs text-slate-500">Autosaving… participants see changes live.</div>
    </div>);

}