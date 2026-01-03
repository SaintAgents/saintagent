import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ResourceFilters({ query, setQuery, type, setType, category, setCategory, categories }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-end">
      <div className="flex-1">
        <label className="text-sm text-slate-600">Search</label>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, description, tags..." className="mt-1" />
      </div>
      <div className="w-full md:w-48">
        <label className="text-sm text-slate-600">Type</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full mt-1"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
            <SelectItem value="best_practice">Best Practice</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="external_link">External Link</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-56">
        <label className="text-sm text-slate-600">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full mt-1"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {(categories || []).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}