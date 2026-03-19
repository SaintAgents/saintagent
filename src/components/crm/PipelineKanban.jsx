import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const LEAD_COLUMNS = [
  { id: 'new', label: 'New', color: 'bg-blue-500', headerBg: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { id: 'contacted', label: 'Contacted', color: 'bg-cyan-500', headerBg: 'bg-cyan-50 border-cyan-200', textColor: 'text-cyan-700' },
  { id: 'qualified', label: 'Qualified', color: 'bg-emerald-500', headerBg: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
  { id: 'proposal', label: 'Proposal', color: 'bg-amber-500', headerBg: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500', headerBg: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
  { id: 'won', label: 'Won', color: 'bg-green-500', headerBg: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  { id: 'lost', label: 'Lost', color: 'bg-rose-500', headerBg: 'bg-rose-50 border-rose-200', textColor: 'text-rose-700' },
  { id: 'nurturing', label: 'Nurturing', color: 'bg-purple-500', headerBg: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
];

function KanbanCard({ contact, index, onClickContact }) {
  return (
    <Draggable draggableId={contact.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white rounded-lg border p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow",
            snapshot.isDragging ? "shadow-lg ring-2 ring-violet-300" : "hover:shadow-md"
          )}
          onClick={() => onClickContact?.(contact)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                {contact.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{contact.name}</p>
              {contact.role && (
                <p className="text-xs text-slate-500 truncate">{contact.role}</p>
              )}
            </div>
          </div>
          {contact.company && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{contact.company}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn("w-3 h-3", i < (contact.relationship_strength || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200")}
                />
              ))}
            </div>
            {contact.priority_tier && (
              <Badge className={cn("text-[10px]", {
                'bg-red-100 text-red-700': contact.priority_tier === 'critical',
                'bg-orange-100 text-orange-700': contact.priority_tier === 'high',
                'bg-blue-100 text-blue-700': contact.priority_tier === 'medium',
                'bg-slate-100 text-slate-600': contact.priority_tier === 'low',
              })}>{contact.priority_tier}</Badge>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function PipelineKanban({ contacts, onClickContact }) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ contactId, newStatus }) =>
      base44.entities.Contact.update(contactId, { lead_status: newStatus }),
    onMutate: async ({ contactId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['myContacts'] });
      queryClient.setQueriesData({ queryKey: ['myContacts'] }, (old) =>
        old ? old.map(c => c.id === contactId ? { ...c, lead_status: newStatus } : c) : old
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['myContacts'] }),
  });

  const grouped = {};
  LEAD_COLUMNS.forEach(col => { grouped[col.id] = []; });
  contacts.forEach(c => {
    const status = c.lead_status || 'new';
    if (grouped[status]) grouped[status].push(c);
    else grouped['new'].push(c);
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    updateStatusMutation.mutate({ contactId: draggableId, newStatus });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
        {LEAD_COLUMNS.map(col => (
          <div key={col.id} className="flex-shrink-0 w-64">
            <div className={cn("rounded-t-lg border px-3 py-2 flex items-center justify-between", col.headerBg)}>
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", col.color)} />
                <span className={cn("text-sm font-semibold", col.textColor)}>{col.label}</span>
              </div>
              <Badge variant="outline" className="text-xs">{grouped[col.id].length}</Badge>
            </div>
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "rounded-b-lg border border-t-0 p-2 min-h-[400px] transition-colors",
                    snapshot.isDraggingOver ? "bg-violet-50/50" : "bg-slate-50/50"
                  )}
                >
                  <ScrollArea className="max-h-[60vh]">
                    {grouped[col.id].map((contact, idx) => (
                      <KanbanCard key={contact.id} contact={contact} index={idx} onClickContact={onClickContact} />
                    ))}
                    {provided.placeholder}
                  </ScrollArea>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}