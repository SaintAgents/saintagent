export default function dockDropTarget(panel, { x, y, left, top, width, height, id }) {
  const hit = document.elementFromPoint(x, y);
  if (!hit || !panel.contains(hit)) return { outside: !!hit && !panel.contains(hit) };
  const folders = hit.closest('.dock-folders');
  if (folders) return { folders: true, target: hit.closest('[data-dock-folder]:not([aria-pressed="true"])') };
  const grid = hit.closest('.dock-grid');
  if (!grid) return {};
  const direct = hit.closest('[data-dock-card]');
  if (direct) return { target: direct.dataset.dockCard !== id ? direct : null };

  // Snap across gutters when corresponding corners are nearly aligned.
  const clip = grid.closest('.dock-scroll').getBoundingClientRect();
  let best = 24, target = null;
  for (const card of grid.querySelectorAll('[data-dock-card]:not([hidden])')) {
    if (card.dataset.dockCard === id) continue;
    const rect = card.getBoundingClientRect();
    const corners = [[left, top, rect.left, rect.top], [left + width, top, rect.right, rect.top],
      [left, top + height, rect.left, rect.bottom], [left + width, top + height, rect.right, rect.bottom]];
    for (const [a, b, cx, cy] of corners) {
      if (cy < clip.top || cy > clip.bottom) continue;
      const distance = Math.hypot(a - cx, b - cy);
      if (distance < best) { best = distance; target = card; }
    }
  }
  return { target };
}