import React from 'react';
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
  return (
    <nav aria-label="Quick access" className="rounded-xl border bg-card p-2 text-card-foreground">
      <p className="mb-2 px-1 text-xs font-semibold">Quick Access</p>
      <ul className="grid grid-cols-5 gap-1">
        {shortcuts.map(({ label, to, Icon }) => (
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