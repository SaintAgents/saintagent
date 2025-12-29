import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

const EMOJIS = [
'😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '🤩', '😇', '🙂', '🙃', '😉', '😌', '🤗', '🤝', '👍', '🙏', '👏', '🤝', '💪', '🔥', '✨', '💯', '🌟', '💜', '💙', '💚', '🧡', '💛', '❤️', '🤍', '🤎', '🕊️', '🌈', '🎯', '📈', '🧠', '💡', '🛡️', '🎉', '🥳'];


export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="bg-fuchsia-100 text-stone-950 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9">
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((e, idx) =>
          <button
            key={idx}
            className="h-8 w-8 text-lg hover:bg-slate-100 rounded-md"
            onClick={() => {
              onSelect?.(e);
              setOpen(false);
            }}>

              {e}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>);

}