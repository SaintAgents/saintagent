import React from 'react';
import { Input } from '@/components/ui/input';
import { categories, statuses } from '@/components/wisdom/wisdomCards';

export default function WisdomLibraryFilters({ filters, setFilters }) {
  const options = [['category','Category',categories],['status','Status',statuses]];
  const change = (key,value) => setFilters(previous => ({ ...previous,[key]:value }));
  return <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4 text-sm">
    <label className="min-w-0 basis-full space-y-1 lg:basis-auto lg:flex-1">Search cards<Input maxLength={160} value={filters.search} placeholder="Search insights, tags, people, or regions" onChange={e => change('search',e.target.value)} /></label>
    {options.map(([key,label,values]) => <label key={key} className="min-w-0 space-y-1">{label}<select className="block h-9 max-w-full rounded-md border bg-background px-2" value={filters[key]} onChange={e => change(key,e.target.value)}><option value="">{key === 'category' ? 'All categories' : 'All statuses'}</option>{values.map(value => <option key={value}>{value}</option>)}</select></label>)}
    <label className="flex h-9 items-center gap-2"><input type="checkbox" checked={filters.mine} onChange={e => change('mine',e.target.checked)} /> My cards</label>
  </div>;
}