import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { commandSources } from '@/components/commandcenter/commandSources';
export const commandModes = ['Overview','Focus','Expanded'];
const ids = commandSources.map(s => s.id);
export const defaultCommandLayout = { mode:'Overview', order:ids, cards:{} };
const memory = new Map();
function load(saved) {
  const order = Array.isArray(saved?.order) ? saved.order.filter(id => ids.includes(id)) : [];
  return { mode:commandModes.includes(saved?.mode) ? saved.mode : 'Overview', order:[...new Set([...order,...ids])], cards:saved?.cards || {} };
}
export default function useCommandLayout(user) {
  const [layout,setLayout] = useState(() => load(memory.get(user.id) || user.command_center_preferences));
  const [status,setStatus] = useState('');
  const current = useRef(layout), queue = useRef(Promise.resolve());
  function commit(update) {
    const next = typeof update === 'function' ? update(current.current) : update;
    current.current = next;
    setLayout(next);
    memory.set(user.id,next);
    setStatus('Saving layout…');
    queue.current = queue.current.catch(() => {}).then(() => base44.auth.updateMe({ command_center_preferences:next }));
    queue.current.then(() => { if (current.current === next) setStatus('Layout saved'); }, () => { if (current.current === next) setStatus('Layout could not be saved'); });
  }
  function patch(id,props) { commit(old => ({ ...old,cards:{ ...old.cards,[id]:{ ...old.cards[id],...props } } })); }
  function move(id,other) { commit(old => { const order = [...old.order], a = order.indexOf(id), b = order.indexOf(other); [order[a],order[b]] = [order[b],order[a]]; return { ...old,order }; }); }
  const visible = layout.order.filter(id => !layout.cards[id]?.hidden && (layout.mode !== 'Focus' || commandSources.find(s => s.id === id).focus || layout.cards[id]?.pinned));
  visible.sort((a,b) => Number(Boolean(layout.cards[b]?.pinned)) - Number(Boolean(layout.cards[a]?.pinned)));
  return { layout, status, commit, patch, move, visible, retry:() => commit({ ...current.current }) };
}