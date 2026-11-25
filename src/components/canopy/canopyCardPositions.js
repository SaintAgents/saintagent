export const canopyPlacementQuery = '(min-width: 768px)';

export function measureCanopyPlacement(grid, id, positions) {
  const bounds = grid.getBoundingClientRect();
  const nodes = Array.from(grid.children).filter(node => node.dataset.canopyCardId);
  const layout = { ...positions };
  let origin, width;
  for (const node of nodes) {
    const key = node.dataset.canopyCardId;
    const rect = node.getBoundingClientRect();
    const point = { x: Math.round(rect.left - bounds.left), y: Math.round(rect.top - bounds.top) };
    layout[key] ??= point;
    if (key === id) { origin = point; width = rect.width; }
  }
  return origin ? { origin, width, layout, maxY: bounds.height + grid.closest('.canopy-scroll').clientHeight } : null;
}

export function placeCanopyCard(grid, placement, x, y) {
  const clamp = (value, max) => Math.round(Math.max(0, Math.min(value, max)));
  return { x: clamp(x, grid.clientWidth - placement.width), y: clamp(y, placement.maxY) };
}

export function sameCanopyPosition(a, b) {
  return a?.x === b?.x && a?.y === b?.y;
}