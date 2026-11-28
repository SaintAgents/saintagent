import React from 'react';
import { Link } from 'react-router-dom';
import { Archive, CalendarDays, CircleHelp, Flag, FolderKanban, Link2, Mail, MessageSquare, Newspaper, Settings2, UserRound, Users } from 'lucide-react';
import { links } from '@/components/dock/dockCatalog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const icons = { Profile:UserRound, Members:Users, Calendar:CalendarDays, Messages:Mail, Quests:Flag, Tours:CircleHelp, News:Newspaper, Community:MessageSquare, Projects:FolderKanban, Invites:Link2 };

export default function DockFooter({ prefs, openModal, archived, error }) {
  return <footer className="dock-footer">
    <nav className="dock-quick" aria-label="Dock Quick Access">
      <span className="dock-caption">Quick</span>
      {prefs.shortcuts.map(label => {
        const Icon = icons[label] || Link2;
        return <Link className="dock-quick-link" key={label} to={links[label]} aria-label={label} title={label}><Icon size={15} /></Link>;
      })}
      <button type="button" className="dock-quick-link" aria-label="Edit Quick Access" title="Edit Quick Access" onClick={() => openModal('shortcuts')}><Settings2 size={15} /></button>
    </nav>
    <TooltipProvider delayDuration={250}><Tooltip>
      <TooltipTrigger asChild><button type="button" className="dock-drawer-button" onClick={() => openModal('drawer')}><Archive size={15} /> Drawer <span className="dock-caption">{archived}</span></button></TooltipTrigger>
      <TooltipContent side="top" align="start" className="z-[10008] max-w-64 bg-popover text-popover-foreground shadow-md" data-dark-contrast>
        The Drawer stores archived widgets. Restore one to the open folder, move it to another folder, or delete it permanently.
      </TooltipContent>
    </Tooltip></TooltipProvider>
    {error && <p role="alert" className="px-3 pb-2">Could not sync to your account. Your browser copy was kept.</p>}
  </footer>;
}