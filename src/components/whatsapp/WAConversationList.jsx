import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, MessageSquare } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';

export default function WAConversationList({ contacts = [], messages = [], selectedPhone, onSelect, searchQuery, onSearchChange }) {
  // Build conversation previews
  const conversations = contacts.map(contact => {
    const contactMsgs = messages.filter(m => m.contact_phone === contact.phone);
    const lastMsg = contactMsgs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    const unread = contactMsgs.filter(m => m.direction === 'inbound' && m.status === 'received').length;
    const pendingReview = contactMsgs.filter(m => m.status === 'pending_review').length;
    return { ...contact, lastMsg, unread, pendingReview, lastTime: lastMsg?.created_date };
  }).sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));

  const filtered = conversations.filter(c => 
    !searchQuery || 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search contacts..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
        {filtered.map(conv => (
          <button
            key={conv.phone}
            onClick={() => onSelect(conv.phone)}
            className={cn(
              "w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b",
              selectedPhone === conv.phone && "bg-violet-50 border-l-2 border-l-violet-600"
            )}
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                {(conv.name || conv.phone)?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900 text-sm truncate">{conv.name || conv.phone}</p>
                {conv.lastTime && (
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {format(new Date(conv.lastTime), 'HH:mm')}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-slate-500 truncate">
                  {conv.lastMsg?.direction === 'outbound' && '✓ '}
                  {conv.lastMsg?.content?.substring(0, 40) || 'No messages'}
                  {conv.lastMsg?.content?.length > 40 ? '...' : ''}
                </p>
                <div className="flex gap-1 shrink-0">
                  {conv.pendingReview > 0 && (
                    <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">{conv.pendingReview}</Badge>
                  )}
                  {conv.unread > 0 && (
                    <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">{conv.unread}</Badge>
                  )}
                </div>
              </div>
              {conv.sentiment && conv.sentiment !== 'unknown' && (
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className={cn("text-[10px] px-1 py-0",
                    conv.sentiment === 'positive' && 'border-emerald-300 text-emerald-600',
                    conv.sentiment === 'negative' && 'border-red-300 text-red-600',
                    conv.sentiment === 'neutral' && 'border-slate-300 text-slate-500'
                  )}>
                    {conv.sentiment}
                  </Badge>
                  {conv.tags?.slice(0, 2).map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}