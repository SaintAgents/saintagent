import React from 'react';
import { Link } from 'react-router-dom';

function pageLabel(path) {
  const segment = path.split('/').filter(Boolean)[0];
  return segment ? segment.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ') : 'Home';
}

export default function DockHistory({ history }) {
  const { entries, clear } = history;
  return <div className="space-y-2">
    {entries.length ? <>
      <button type="button" className="rounded border px-2 py-1 text-xs font-medium" onClick={clear}>Clear history</button>
      <ol aria-label="Visited pages, newest first" className="dock-links max-h-56 overflow-y-auto">
        {entries.map((path, index) => <li key={`${index}:${path}`}><Link to={path}>{pageLabel(path)}</Link></li>)}
      </ol>
    </> : <p role="status">No pages in your history yet.</p>}
  </div>;
}