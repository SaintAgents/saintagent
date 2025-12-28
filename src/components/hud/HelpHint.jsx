import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function HelpHint({ content, side = 'top', align = 'center', className = '' }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Help"
          className={`inline-flex items-center justify-center w-4 h-4 text-[10px] leading-none rounded-full border border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 ${className}`}
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="max-w-xs text-slate-700 text-sm">
        {typeof content === 'string' ? <p>{content}</p> : content}
      </PopoverContent>
    </Popover>
  );
}