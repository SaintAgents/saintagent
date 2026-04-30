import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

function PostItem({ item }) {
  return (
    <div className="flex items-start gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <div className="w-2 h-2 mt-2 rounded-full bg-pink-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 line-clamp-2">{item.content || 'No content'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">
            {item.created_date ? format(new Date(item.created_date), 'MMM d, yyyy h:mm a') : '—'}
          </span>
          {item.likes_count > 0 && <span className="text-xs text-pink-500">♥ {item.likes_count}</span>}
          {item.comments_count > 0 && <span className="text-xs text-blue-500">💬 {item.comments_count}</span>}
        </div>
      </div>
    </div>
  );
}

function MissionItem({ item }) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    draft: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <div className="flex items-start gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <div className="w-2 h-2 mt-2 rounded-full bg-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{item.title || 'Untitled Mission'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>
            {item.status || 'unknown'}
          </span>
          <span className="text-xs text-slate-400">{item.participant_count || 0} participants</span>
          {item.reward_ggg > 0 && <span className="text-xs text-amber-600">{item.reward_ggg} GGG</span>}
        </div>
      </div>
    </div>
  );
}

function CircleItem({ item }) {
  return (
    <div className="flex items-start gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{item.name || 'Unnamed Circle'}</p>
        <span className="text-xs text-slate-400">{item.member_ids?.length || 0} members</span>
      </div>
    </div>
  );
}

function MeetingItem({ item }) {
  const statusColors = {
    scheduled: 'bg-cyan-100 text-cyan-700',
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <div className="flex items-start gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <div className="w-2 h-2 mt-2 rounded-full bg-cyan-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{item.title || 'Untitled Meeting'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>
            {item.status || 'pending'}
          </span>
          <span className="text-xs text-slate-400">
            {item.scheduled_time ? format(new Date(item.scheduled_time), 'MMM d, h:mm a') : '—'}
          </span>
          {item.guest_name && <span className="text-xs text-slate-500">w/ {item.guest_name}</span>}
        </div>
      </div>
    </div>
  );
}

function TestimonialItem({ item }) {
  return (
    <div className="flex items-start gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 line-clamp-2">{item.text || 'No text'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-amber-500">{'★'.repeat(item.rating || 5)}</span>
          <span className="text-xs text-slate-400">
            {item.created_date ? format(new Date(item.created_date), 'MMM d, yyyy') : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

function FollowItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate" data-user-id={item.following_id}>
          {item.following_name || item.following_id || 'Unknown'}
        </p>
        <span className="text-xs text-slate-400">
          {item.created_date ? format(new Date(item.created_date), 'MMM d, yyyy') : '—'}
        </span>
      </div>
    </div>
  );
}

const renderers = {
  posts: PostItem,
  missions: MissionItem,
  circles: CircleItem,
  meetings: MeetingItem,
  testimonials: TestimonialItem,
  following: FollowItem,
};

export default function DrilldownList({ type, items, label, onClose }) {
  const Renderer = renderers[type];
  if (!Renderer || !items) return null;

  return (
    <div className="border border-slate-200 bg-slate-50 rounded-lg mt-4 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700">{label} ({items.length})</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="max-h-64">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No items found</p>
        ) : (
          items.map((item, i) => <Renderer key={item.id || i} item={item} />)
        )}
      </ScrollArea>
    </div>
  );
}