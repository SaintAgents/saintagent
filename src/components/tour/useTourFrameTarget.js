import { useEffect, useState } from 'react';

const visible = (doc, selector) => [...doc.querySelectorAll(selector)].find(el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0 && doc.defaultView.getComputedStyle(el).visibility !== 'hidden');

export default function useTourFrameTarget(doc, anchor, setup) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!doc?.body) return;
    const clicks = new Set();
    let highlight, raf;
    const clear = () => highlight?.removeAttribute('data-tour-preview-focus');
    const style = doc.createElement('style');
    style.textContent = '[data-tour-preview-focus]{outline:3px solid hsl(187 92% 45%) !important;outline-offset:-3px !important;scroll-margin-block:7rem;} button,a,input,select,textarea{cursor:default !important}';
    doc.head.append(style);
    const block = event => { if (event.isTrusted) { event.preventDefault(); event.stopImmediatePropagation(); } };
    const blocked = ['pointerdown', 'mousedown', 'click', 'auxclick', 'dblclick', 'keydown', 'contextmenu', 'submit', 'dragstart'];
    blocked.forEach(type => doc.addEventListener(type, block, true));
    const clickOnce = (selector, act) => {
      const node = selector && visible(doc, selector);
      if (node && !clicks.has(selector)) { clicks.add(selector); act(node); }
    };
    const mark = () => {
      clickOnce(setup?.tab && `main [role="tab"][id$="-trigger-${setup.tab}"]`, el => {
        if (el.getAttribute('aria-selected') !== 'true') el.dispatchEvent(new doc.defaultView.MouseEvent('mousedown', { bubbles: true, button: 0 }));
      });
      clickOnce(setup?.group, el => { if (el.getAttribute('aria-expanded') === 'false') el.click(); });
      clickOnce(setup?.click, el => el.click());
      clickOnce(setup?.then, el => el.click());
      const target = visible(doc, anchor || 'main[data-page] h1, main[data-page] h2');
      if (!target || target === highlight) return;
      clear(); highlight = target;
      target.setAttribute('data-tour-preview-focus', '');
      target.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
      setResult({ doc, anchor, state: 'ready' });
    };
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark); };
    const observer = new MutationObserver(schedule);
    observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-selected', 'data-state'] });
    schedule();
    const deadline = setTimeout(() => { if (!highlight) setResult({ doc, anchor, state: 'missing' }); }, 7000);
    return () => { clearTimeout(deadline); cancelAnimationFrame(raf); observer.disconnect(); clear(); style.remove(); blocked.forEach(type => doc.removeEventListener(type, block, true)); };
  }, [doc, anchor, setup?.tab, setup?.group, setup?.click, setup?.then]);
  return result?.doc === doc && result?.anchor === anchor ? result?.state : 'loading';
}