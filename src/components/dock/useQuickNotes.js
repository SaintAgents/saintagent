import { useState } from 'react';

export default function useQuickNotes(value, save) {
  const notes = Array.isArray(value) ? value : value?.trim() ? [{ id: 'original', text: value }] : [];
  const [selection, setSelection] = useState(null);
  const [drafts, setDrafts] = useState({});
  const selected = selection === null ? notes[0] : notes.find(note => note.id === selection);
  const id = selected?.id ?? '';
  const saved = selected?.text ?? '';
  const draft = drafts[id] ?? saved;
  const canSave = Boolean(draft.trim()) && draft !== saved;

  function setDraft(change) {
    setDrafts(current => ({ ...current, [id]: typeof change === 'function' ? change(current[id] ?? saved) : change }));
  }

  function clearDraft() {
    setDrafts(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function saveNote() {
    if (!canSave) return;
    const note = { id: id || crypto.randomUUID(), text: draft };
    save(selected ? notes.map(item => item.id === id ? note : item) : [note, ...notes]);
    clearDraft();
    setSelection(note.id);
  }

  function deleteNote() {
    if (!selected) return;
    const remaining = notes.filter(note => note.id !== id);
    save(remaining);
    clearDraft();
    setSelection(remaining[0]?.id ?? '');
  }

  return { notes, id, draft, setDraft, canSave, select: setSelection, saveNote, deleteNote };
}