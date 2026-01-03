import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUSES = ['todo','in_progress','done'];

export default function ProjectPlanner() {
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['collabBoard'],
    queryFn: async () => {
      const list = await base44.entities.CollabBoard.filter({ user_id: me.email });
      if (list?.[0]) return list;
      const created = await base44.entities.CollabBoard.create({ user_id: me.email, name: 'My Planner', items: [] });
      return [created];
    },
    enabled: !!me?.email,
    refetchInterval: 1500
  });
  const board = boards?.[0];

  const save = useMutation({
    mutationFn: (items) => base44.entities.CollabBoard.update(board.id, { items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collabBoard'] })
  });

  const [newTitle, setNewTitle] = React.useState('');
  const add = () => {
    if (!newTitle.trim()) return;
    const item = { id: Math.random().toString(36).slice(2), title: newTitle.trim(), status: 'todo', description: '' };
    save.mutate([...(board?.items || []), item]);
    setNewTitle('');
  };

  const grouped = React.useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    (board?.items || []).forEach((it) => g[it.status || 'todo'].push(it));
    return g;
  }, [board?.items]);

  const onDragEnd = (res) => {
    if (!res.destination) return;
    const [srcCol, dstCol] = res.source.droppableId.split(':'), [dstC] = res.destination.droppableId.split(':');
    const srcList = [...grouped[srcCol]];
    const [moved] = srcList.splice(res.source.index, 1);
    const dstList = srcCol === dstC ? srcList : [...grouped[dstC]];
    dstList.splice(res.destination.index, 0, { ...moved, status: dstC });
    // rebuild flat list
    const flat = [...(srcCol === 'todo' ? [] : grouped.todo), ...(srcCol === 'in_progress' ? [] : grouped.in_progress), ...(srcCol === 'done' ? [] : grouped.done)];
    const merge = { ...grouped, [srcCol]: srcList, [dstC]: dstList };
    const items = [...merge.todo, ...merge.in_progress, ...merge.done];
    save.mutate(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Add task…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Button onClick={add} className="bg-violet-600 hover:bg-violet-700">Add</Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((st) => (
            <Droppable droppableId={`${st}:col`} key={st}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-white border rounded-xl p-3 min-h-[300px]">
                  <div className="font-semibold capitalize mb-2">{st.replace('_',' ')}</div>
                  {(grouped[st] || []).map((it, idx) => (
                    <Draggable draggableId={it.id} index={idx} key={it.id}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="p-3 rounded-lg bg-slate-50 border mb-2">
                          <div className="text-sm font-medium">{it.title}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}