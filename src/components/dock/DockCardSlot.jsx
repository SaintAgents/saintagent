import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import DockCard from '@/components/dock/DockCard';

// Keep the same widget mounted when it moves between the dock grid and the workspace.
export default function DockCardSlot({ target, ...props }) {
  const [slot] = useState(() => {
    const element = document.createElement('div');
    element.style.display = 'contents';
    return element;
  });
  useLayoutEffect(() => () => slot.remove(), [slot]);
  useLayoutEffect(() => {
    const parent = target.current;
    if (!parent || slot.parentNode === parent) return;
    if (slot.isConnected && typeof parent.moveBefore === 'function') parent.moveBefore(slot, null);
    else parent.appendChild(slot);
  }, [slot, target]);
  return createPortal(<DockCard {...props} />, slot);
}