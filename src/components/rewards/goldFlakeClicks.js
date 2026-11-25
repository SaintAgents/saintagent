export const GOAL = 45;
const controls = 'button, a[href], summary, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], [role="checkbox"], [role="radio"], input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"]';
const ignored = 'input, textarea, select, label, [contenteditable], [data-gold-flakes], [data-sonner-toaster], [data-sonner-toast], video, audio, canvas, iframe';

export function classifyClick(event) {
  if (!event.isTrusted || event.button !== 0 || !(event.target instanceof Element) || document.visibilityState !== 'visible') return null;
  const target = event.target;
  if (target.closest('[data-gold-flakes], [data-sonner-toaster], [data-sonner-toast], [contenteditable]')) return null;
  const control = target.closest(controls);
  if (!control) {
    if (target.closest(ignored) || window.getSelection()?.toString()) return null;
    return { kind: 'empty' };
  }
  if (control.closest(':disabled, [aria-disabled="true"], [inert]')) return null;
  const label = control.getAttribute('aria-label') || control.getAttribute('title') || control.textContent.trim() || control.querySelector('img[alt]')?.alt || control.querySelector('svg')?.getAttribute('class') || control.getAttribute('role') || control.tagName;
  const signature = `${location.pathname.toLowerCase()}:${control.tagName}:${control.getAttribute('href')?.split('?')[0] || ''}:${label.replace(/\d+/g, '#').slice(0, 100)}`;
  let hash = 2166136261;
  for (let i = 0; i < signature.length; i++) hash = Math.imul(hash ^ signature.charCodeAt(i), 16777619);
  return { kind: 'control', id: hash >>> 0 };
}

export function getProgress(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) || { clicks: [] }; } catch { return { clicks: [] }; }
}

export function saveProgress(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* counter still works in this tab */ }
}