import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/components/language/LanguageProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

export default function DetachedSidebarIcons({ items, role, leaderTier, currentPage, unreadCount }) {
  const { t } = useLanguage();
  return <nav aria-label={t('Navigation')} className="flex flex-col items-center gap-0.5 py-1 text-foreground">
    <TooltipProvider delayDuration={200}>
      {items.filter(item => !item.adminOnly || role === 'admin').map(({ id, label, page, Icon, action, locked }) => {
        const isLocked = locked || (id === 'leader' && leaderTier !== 'verified144k');
        const isActive = id === currentPage;
        const name = t(label);
        const count = id === 'messages' ? unreadCount : 0;
        return <Tooltip key={id}>
          <TooltipTrigger asChild>
            <Link to={isLocked ? '#' : createPageUrl(page)} aria-label={count ? `${name} (${count} unread)` : name}
              aria-current={isActive ? 'page' : undefined} aria-disabled={isLocked || undefined}
              className={cn('relative flex size-11 shrink-0 items-center justify-center rounded-md outline-offset-[-2px] hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2', isActive && 'bg-accent text-accent-foreground', isLocked && 'cursor-not-allowed opacity-60')}
              onClick={event => {
                if (isLocked) event.preventDefault();
                else if (action === 'openGallery') {
                  event.preventDefault();
                  document.dispatchEvent(new CustomEvent('openHeroGallery', { detail: { startIndex: 0 } }));
                }
              }}>
              <Icon aria-hidden="true" className="size-5" />
              {isLocked ? <Lock aria-hidden="true" className="absolute bottom-1 right-1 size-3" /> : count > 0 && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[100]">{name}</TooltipContent>
        </Tooltip>;
      })}
    </TooltipProvider>
  </nav>;
}