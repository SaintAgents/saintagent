import { ChevronsDown, ChevronsUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const controls = [
  { value: 'collapsed', label: 'Collapse all', Icon: ChevronsUp },
  { value: 'expanded', label: 'Expand all', Icon: ChevronsDown },
  { value: 'default', label: 'Reset navigation to default', Icon: RotateCcw },
];

export default function SidebarNavFooter({ compact, onChange }) {
  return (
    <div data-sidebar-nav-footer role="group" aria-label="Navigation section controls" className={cn(
      'relative shrink-0 flex items-center gap-0.5 border-t bg-background px-1 py-1 text-foreground',
      compact && 'justify-center',
    )}>
      {controls.filter(({ value }) => !compact || value !== 'default').map(({ value, label, Icon }) => {
        const iconOnly = compact || value === 'default';
        return <Button key={value} type="button" variant="ghost" size="sm"
          className={cn('h-7 gap-1 px-1 text-[11px]', iconOnly ? 'w-7 shrink-0' : 'min-w-0 flex-1')}
          aria-label={label} title={label} onClick={() => onChange(value)}>
          <Icon aria-hidden="true" />{!iconOnly && <span>{label}</span>}
        </Button>;
      })}
    </div>
  );
}