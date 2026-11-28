import { useLocation } from 'react-router-dom';
import { Pin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { safePath } from '@/components/dock/dockCatalog';
import { pageLabel, pagePath } from '@/components/hud/useSidePanelBookmarks';

export default function DockEmptyFolder({ onAddWidget }) {
  const { pathname, search, hash } = useLocation();
  const path = pagePath(pathname, search, hash);
  const canPin = safePath(path);
  const pinPage = () => {
    document.dispatchEvent(new CustomEvent('pinDockItem', { detail: { path, title: pageLabel(path) } }));
  };

  return <div className="col-span-full space-y-3 p-3">
    <div className="space-y-1">
      <p className="font-semibold">This deck folder is empty.</p>
      <p className="text-sm">Add a widget or pin the page you’re viewing so you can open it again from this folder.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="min-h-11 text-inherit" onClick={onAddWidget}><Plus aria-hidden="true" /> Add widget</Button>
      <Button type="button" variant="outline" className="min-h-11 text-inherit" onClick={pinPage} disabled={!canPin}><Pin aria-hidden="true" /> Add pinned page</Button>
    </div>
  </div>;
}