const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export default function resizeFloatingDockCard(rect, edge, dx, dy, compact, frameless) {
  const inset = 4, topInset = 36;
  const maxRight = window.innerWidth - inset, maxBottom = window.innerHeight - inset;
  const minHeight = frameless ? 72 : 120;
  const right = rect.left + rect.w, bottom = rect.top + rect.h;
  const result = {};
  if (dx && edge.includes('left')) {
    result.x = clamp(rect.left + dx, inset, Math.max(inset, right - 155));
    result[compact ? 'compactWidth' : 'w'] = right - result.x;
  } else if (dx && edge.includes('right')) {
    result.x = rect.left;
    result[compact ? 'compactWidth' : 'w'] = clamp(rect.w + dx, Math.min(155, maxRight - rect.left), maxRight - rect.left);
  }
  if (dy && edge.includes('top')) {
    result.y = clamp(rect.top + dy, topInset, Math.max(topInset, Math.min(window.innerHeight - 128, bottom - minHeight)));
    result[compact ? 'compactHeight' : 'h'] = bottom - result.y;
  } else if (dy && edge.includes('bottom')) {
    result.y = rect.top;
    result[compact ? 'compactHeight' : 'h'] = clamp(rect.h + dy, Math.min(minHeight, maxBottom - rect.top), maxBottom - rect.top);
  }
  return result;
}