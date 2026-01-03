import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PortfolioItemCard({ item, isOwner, onDelete, onOpen }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => onOpen?.(item)}>
      {item.image_url && (
        <div className="w-full h-40 bg-slate-100 overflow-hidden">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900">{item.title}</div>
            {item.description && <div className="text-sm text-slate-600 line-clamp-2">{item.description}</div>}
            {item.link_url && (
              <a href={item.link_url} target="_blank" rel="noreferrer" className="text-xs text-violet-600 hover:underline mt-1 inline-block">Visit link</a>
            )}
          </div>
          {isOwner && (
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}>Delete</Button>
          )}
        </div>
        {item.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0,5).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}