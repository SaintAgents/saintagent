import { useState } from 'react';

export default function QuickNotesList({ notes, id, onSelect, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);
  const confirming = Boolean(id) && confirmId === id;
  function select(nextId) {
    setConfirmId(null);
    onSelect(nextId);
  }

  return <div className="grid min-w-0 gap-2">
    <label className="grid min-w-0 gap-1 text-xs font-medium">Saved notes
      <select className="min-h-9 w-full border bg-background text-foreground" value={id} onChange={event => select(event.target.value)}>
        <option value="">{notes.length ? 'New note draft' : 'No saved notes yet'}</option>
        {notes.map(note => {
          const line = note.text.trim().split(/\r?\n/, 1)[0];
          return <option key={note.id} value={note.id}>{line.length > 60 ? `${line.slice(0, 60)}…` : line}</option>;
        })}
      </select>
    </label>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => select('')}>New note</button>
      {id && !confirming && <button type="button" onClick={() => setConfirmId(id)}>Delete note</button>}
    </div>
    {confirming && <div className="grid gap-1">
      <p>Delete this saved note?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setConfirmId(null); onDelete(); }}>Delete</button>
        <button type="button" onClick={() => setConfirmId(null)}>Cancel</button>
      </div>
    </div>}
  </div>;
}