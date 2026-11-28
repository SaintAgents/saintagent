const seededKinds = new Set(['project','mission','listing','organization','news','course','person','mentor','resource','library']);

export function deepDiveTarget(kind, id, title) {
  if (typeof title !== 'string' || !title.trim()) return {};
  return {'data-deep-dive-title':title.trim().slice(0,400), 'data-deep-dive-kind':kind, 'data-deep-dive-id':seededKinds.has(kind) && /^[\w-]{1,100}$/.test(id ?? '') ? id : undefined};
}

const privateUI = '.session-record-block, [data-deep-dive-ignore], [contenteditable]:not([contenteditable="false"]), input, textarea, select';
const heading = 'h1,h2,h3,h4,h5,h6,[role="heading"]';
const item = 'article,figure,li,tr,blockquote,summary,dt,dd,[role="listitem"],[role="article"],[role="row"],[data-slot="card"]';
const control = 'a,button,[role="button"],[role="tab"],[role="link"],img,video,canvas,iframe';
const clean = (value, max = 1500) => value?.replace(/\s+/g, ' ').trim().slice(0, max) || '';
const visible = element => {
  const style = element.ownerDocument.defaultView.getComputedStyle(element);
  return element.getClientRects().length && style.visibility === 'visible' && style.opacity !== '0';
};
function visibleText(element) {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return clean(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      return node.matches(`${privateUI},[hidden],.sr-only,script,style,template`) || !visible(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
    },
  });
  let text = '';
  for (let node; text.length < 1500 && (node = walker.nextNode());) text += `${clean(node.nodeValue)} `;
  return clean(text);
}
function label(el) {
  const labelledBy = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).slice(0, 5).map(id => {
    const node = el.ownerDocument.getElementById(id);
    return node && !node.closest(privateUI) && visible(node) ? visibleText(node) : '';
  }).filter(Boolean).join(' ');
  return clean(el.getAttribute('aria-label') || labelledBy || el.getAttribute('alt') || el.getAttribute('title') || (el.matches('svg') ? el.querySelector(':scope > title')?.textContent : ''), 400);
}

export function targetAt(x, y, doc = document) {
  const hit = doc.elementFromPoint(x, y);
  if (!hit || hit.closest(privateUI)) return null;
  if (hit.tagName === 'IFRAME' && hit.contentDocument) {
    const rect = hit.getBoundingClientRect();
    if (rect.width && rect.height) {
      const inner = targetAt((x - rect.left) * hit.offsetWidth / rect.width - hit.clientLeft, (y - rect.top) * hit.offsetHeight / rect.height - hit.clientTop, hit.contentDocument);
      if (inner) return inner;
    }
  }
  const exact = hit.closest(control) || (hit.closest('svg') ?? hit);
  return hit.closest('[data-deep-dive-title]') || exact.closest(control) || exact.closest(item) || exact;
}

export function targetRequest(element) {
  if (!element) return {};
  const { deepDiveTitle, deepDiveKind:kind, deepDiveId:id } = element.dataset;
  // Don't include form content or protected UI when capturing a surrounding card.
  const text = element.matches('html,body,main,#root,nav,header,footer,section') && !deepDiveTitle ? '' : visibleText(element);
  const titleNode = [...element.querySelectorAll(heading)].find(node => !node.closest(privateUI) && visible(node));
  const title = deepDiveTitle || label(element) || (text && titleNode && clean(visibleText(titleNode), 400)) || clean(text, 180);
  if (!title) return {};
  return {
    objective: title.length < 3 ? `Investigate ${title}` : title,
    target: { title, kind, ...(id && { id }), capture: text || title },
  };
}