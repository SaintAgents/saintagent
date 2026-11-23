const seededKinds = new Set(['project','mission','listing','organization','news','course','person','mentor','resource','library']);

export function deepDiveTarget(kind, id, title) {
  if (typeof title !== 'string' || !title.trim()) return {};
  return {'data-deep-dive-title':title.trim().slice(0,400), 'data-deep-dive-kind':kind, 'data-deep-dive-id':seededKinds.has(kind) && /^[\w-]{1,100}$/.test(id ?? '') ? id : undefined};
}

export function targetAt(x,y) {
  return document.elementFromPoint(x,y)?.closest('[data-deep-dive-title]');
}

export function targetRequest(element) {
  const { deepDiveTitle:title, deepDiveKind:kind, deepDiveId:id } = element.dataset;
  return {objective:title.length < 3 ? `Investigate ${title}` : title, target:{title,kind,...(id && {id})}};
}