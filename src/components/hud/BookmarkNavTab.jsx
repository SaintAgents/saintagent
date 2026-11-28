import React, { useId, useState } from 'react';
import { Bookmark, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SidePanelBookmarks from '@/components/hud/SidePanelBookmarks';

export default function BookmarkNavTab({ compact = false, onNavigate }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const contentId = useId();
  if (!user?.id || isTourPreview()) return null;
  const navigate = () => { setOpen(false); onNavigate?.(); };
  const icon = <Bookmark aria-hidden="true" className="size-4 shrink-0" />;

  if (compact) return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" aria-label="My Bookmarks" title="My Bookmarks" className="flex min-h-11 w-full items-center justify-center rounded-md text-foreground hover:bg-accent">{icon}</button>
    </PopoverTrigger>
    <PopoverContent side="right" align="start" className="z-[210] max-h-[var(--radix-popover-content-available-height)] w-72 max-w-[calc(100vw-5rem)] overflow-y-auto p-1" aria-label="My Bookmarks">
      <SidePanelBookmarks onNavigate={navigate} />
    </PopoverContent>
  </Popover>;

  return <div className="mb-2">
    <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(value => !value)}
      className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-semibold text-foreground hover:bg-accent">
      {icon}<span className="flex-1">My Bookmarks</span><ChevronDown aria-hidden="true" className={open ? 'size-4 rotate-180' : 'size-4'} />
    </button>
    <div id={contentId} hidden={!open}>{open && <SidePanelBookmarks onNavigate={navigate} />}</div>
  </div>;
}