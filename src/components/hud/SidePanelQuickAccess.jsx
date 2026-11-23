import React, { useEffect, useState } from 'react';
import { links } from '@/components/dock/dockCatalog';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, MessageCircle, Target, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const shortcuts = [
  { label: 'Profile', to: '/Profile', Icon: User },
  { label: 'Tours', to: '/CommandDeck#daily-tours', Icon: BookOpen },
  { label: 'Messages', to: '/Messages', Icon: MessageCircle },
  { label: 'Quests', to: '/Quests', Icon: Target },
  { label: 'Schedule', to: '/Schedule', Icon: CalendarDays },
];

export default function SidePanelQuickAccess() {
  const [shared, setShared] = useState(null);
  useEffect(() => {
    const update = e => setShared(e.detail);
    document.addEventListener('dockShortcutsChange', update);
    document.dispatchEvent(new Event('requestDockShortcuts'));
    return () => document.removeEventListener('dockShortcutsChange', update);
  }, []);
  const items = shared ? shared.map(label => ({label,to:links[label],Icon:shortcuts.find(item => item.to === links[label])?.Icon || BookOpen})).filter(item => item.to) : shortcuts;
  return (
    <nav aria-label="Quick access" className="rounded-xl border bg-card p-2 text-card-foreground">
      <p className="mb-2 px-1 text-xs font-semibold">Quick Access</p>
      <ul className="grid grid-cols-5 gap-1">
        {items.map(({ label, to, Icon }) => (
          <li key={label} className="min-w-0">
            <Button asChild size="icon" variant="outline" className="h-9 w-full text-primary">
              <Link to={to} aria-label={label} title={label}>
                <Icon aria-hidden="true" />
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}