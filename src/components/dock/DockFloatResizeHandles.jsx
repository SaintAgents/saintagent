import React from 'react';
import { Maximize2 } from 'lucide-react';

export default function DockFloatResizeHandles({ gesture, resizeByKey }) {
  return <>
    {['top', 'right', 'bottom', 'left'].map(edge => <button key={edge} type="button"
      className={`dock-float-edge dock-float-edge-${edge}`} aria-label={`Resize widget from ${edge} edge`}
      title={`Drag or use arrow keys to resize from the ${edge} edge`}
      onKeyDown={event => resizeByKey(event, edge)} {...gesture(edge)} />)}
    <button type="button" className="dock-card-resize" aria-label="Resize widget" title="Drag to resize; arrow keys adjust size"
      onKeyDown={event => resizeByKey(event, 'right-bottom')} {...gesture('right-bottom')}><Maximize2 size={13} /></button>
  </>;
}