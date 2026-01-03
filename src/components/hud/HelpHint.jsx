import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function HelpHint({ content, side = 'top', align = 'center', className = '', size = 16 }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Help"
          className={`inline-flex items-center justify-center leading-none rounded-full border border-black text-slate-900 hover:bg-slate-50 hover:text-slate-900 ${className}`}
          style={{ width: size, height: size, fontSize: Math.round(size * 0.6) }}
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} sideOffset={8} className="max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto overflow-x-auto text-slate-700 text-sm whitespace-normal break-words">
        {typeof content === 'string' ? <p>{content}</p> : content}
      </PopoverContent>
    </Popover>
  );
}