import { Bell, Mail, PanelRight, X } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import CanopyHint from '@/components/canopy/CanopyHint';

export default function CanopyHeading({ mode, desktop, unread, open, setMode, toggleView }) {
  const splitLabel = mode === 'split' ? 'Exit split view' : 'Open split view';
  return <div className="canopy-heading">
    <strong>SaintAgent Command Canopy</strong>
    <div>
      <CanopyHint label="Inbox"><button type="button" aria-label="Inbox" onClick={() => open('/Messages')}><Mail size={15} /></button></CanopyHint>
      <CanopyHint label="Notifications"><button type="button" aria-label="Notifications" onClick={() => open('notifications')}><Bell size={15} />{unread > 0 && <b>{unread}</b>}</button></CanopyHint>
      <CanopyHint label={mode === 'full' ? 'Switch to a compact Canopy' : 'Expand Canopy to the available space'}>
        <button type="button" onClick={toggleView}>{mode === 'full' ? 'Peek' : 'Full view'}</button>
      </CanopyHint>
      {desktop && <CanopyHint label={splitLabel}><button type="button" aria-label={splitLabel} onClick={() => setMode(mode === 'split' ? 'full' : 'split')}><PanelRight size={15} /></button></CanopyHint>}
      <CanopyHint label="Open Dock Deck"><button type="button" aria-label="Open Dock Deck" onClick={() => open('dock')}><DockDeckIcon /></button></CanopyHint>
      <CanopyHint label="Close Canopy"><button type="button" aria-label="Close Canopy" onClick={() => setMode('closed')}><X size={15} /></button></CanopyHint>
    </div>
  </div>;
}