import { useEffect, useState } from 'react';
import KnowledgeResults from '@/components/canopy/KnowledgeResults';
import { knowledgeSources } from '@/components/canopy/knowledgeSources';

export default function CanopyKnowledge({ user, open }) {
  const [input,setInput] = useState(''), [search,setSearch] = useState(''), [filter,setFilter] = useState('all');
  useEffect(()=>{ const timer = setTimeout(()=>setSearch(input.trim()),300); return ()=>clearTimeout(timer); },[input]);
  const visible = filter === 'all' ? knowledgeSources : knowledgeSources.filter(source=>source.id === filter);
  return <div className="grid gap-2" aria-label="Files and knowledge library">
    <div className="flex flex-wrap gap-1">
      <input className="min-w-0 flex-1 basis-32" type="search" aria-label="Search files and knowledge" placeholder="Search library…" value={input} maxLength={120} onChange={e=>setInput(e.target.value)} />
      <select className="max-w-full" aria-label="Library source" value={filter} onChange={e=>setFilter(e.target.value)}>
        <option value="all">All sources</option>{knowledgeSources.map(source=><option key={source.id} value={source.id}>{source.label}</option>)}
      </select>
    </div>
    {visible.map(source=><KnowledgeResults key={source.id} {...{source,user,search,open}} compact={filter === 'all'} />)}
  </div>;
}