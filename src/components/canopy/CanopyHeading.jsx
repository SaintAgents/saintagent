import { Bell, Mail, X } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import CanopyHint from '@/components/canopy/CanopyHint';

const viewLabels = { peek: 'Peek', full: 'Full', split: 'Side' };

export default function CanopyHeading({ mode, desktop, unread, open, setMode, changeView }) {
  const nextView = mode === 'peek' ? 'full' : mode === 'full' && desktop ? 'split' : 'peek';
  const nextLabel = `${viewLabels[nextView]} view`;
  return <div className="canopy-heading">
    <strong>SaintAgent Command Canopy</strong>
    <div>
      <CanopyHint label="Inbox"><button type="button" aria-label="Inbox" onClick={() => open('/Messages')}><Mail size={15} /></button></CanopyHint>
      <CanopyHint label="Notifications"><button type="button" aria-label="Notifications" onClick={() => open('notifications')}><Bell size={15} />{unread > 0 && <b>{unread}</b>}</button></CanopyHint>
      <CanopyHint label={`${viewLabels[mode]} view active. Switch to ${nextLabel}.`}>
        <button type="button" onClick={() => changeView(nextView)}>{nextLabel}</button>
      </CanopyHint>
      <CanopyHint label="Open Dock Deck"><button type="button" aria-label="Open Dock Deck" onClick={() => open('dock')}><DockDeckIcon /></button></CanopyHint>
      <CanopyHint label="Close Canopy"><button type="button" aria-label="Close Canopy" onClick={() => setMode('closed')}><X size={15} /></button></CanopyHint>
    </div>
  </div>;
}