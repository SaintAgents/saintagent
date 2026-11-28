import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WritingContext = createContext(null);
export const useDockWriting = () => useContext(WritingContext);
const excluded = 'input, textarea, [contenteditable], [role="textbox"], .session-record-block, [data-no-clipboard-history]';
const inExcluded = node => (node?.nodeType === 1 ? node : node?.parentElement)?.closest(excluded);

function useDeviceValue(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  const current = useRef(value);
  const [error, setError] = useState(false);
  function save(next) {
    const data = typeof next === 'function' ? next(current.current) : next;
    current.current = data;
    setValue(data);
    try { localStorage.setItem(key, JSON.stringify(data)); setError(false); } catch { setError(true); }
  }
  return [value, save, error];
}

export default function DockWritingStore({ userId, captureAvailable, writable, children }) {
  const prefix = `sa-dock-writing:${userId}`;
  const [draft, saveDraft, draftError] = useDeviceValue(`${prefix}:draft`, '');
  const [history, saveHistory, historyError] = useDeviceValue(`${prefix}:history`, []);
  const [capture, setCapture, captureError] = useDeviceValue(`${prefix}:capture`, false);
  const saver = useRef(saveHistory);
  saver.current = saveHistory;
  const addCopy = text => {
    if (!text?.trim()) return;
    const entry = text.slice(0, 10000);
    saver.current(entries => [entry, ...entries.filter(item => item !== entry)].slice(0, 30));
  };
  useEffect(() => {
    if (!capture || !captureAvailable || !writable) return;
    const onCopy = event => {
      if (!event.isTrusted || inExcluded(event.target) || inExcluded(document.activeElement)) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || inExcluded(selection.anchorNode) || inExcluded(selection.focusNode)) return;
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        const root = range.commonAncestorContainer;
        if (root.querySelectorAll && Array.from(root.querySelectorAll(excluded)).some(node => range.intersectsNode(node))) return;
      }
      addCopy(selection.toString());
    };
    document.addEventListener('copy', onCopy);
    return () => document.removeEventListener('copy', onCopy);
  }, [capture, captureAvailable, writable]);
  return <WritingContext.Provider value={{draft, saveDraft, draftError, history, saveHistory, historyError, capture, setCapture, captureError, addCopy, writable}}>{children}</WritingContext.Provider>;
}