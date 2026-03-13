import React from 'react';

const NODE_W = 220;
const NODE_H = 100;

/**
 * Draws a curved SVG path between two nodes with an arrowhead.
 */
export default function ConnectionLine({ fromX, fromY, toX, toY, isCritical, isHighlighted }) {
  // From right connector of source, to left connector of target
  const x1 = fromX + NODE_W;
  const y1 = fromY + NODE_H / 2;
  const x2 = toX;
  const y2 = toY + NODE_H / 2;

  const dx = x2 - x1;
  const midX = x1 + dx * 0.5;

  // Bezier control points
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

  const color = isCritical ? '#ef4444' : isHighlighted ? '#7c3aed' : '#94a3b8';
  const width = isCritical ? 2.5 : 1.5;

  // Arrowhead at end
  const angle = Math.atan2(y2 - y1, x2 - (midX)) || 0;
  const arrowSize = 8;

  return (
    <g>
      {/* Glow for critical path */}
      {isCritical && (
        <path d={path} fill="none" stroke="#ef4444" strokeWidth={6} opacity={0.15} />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={isCritical ? 'none' : 'none'}
        markerEnd={`url(#arrow-${isCritical ? 'crit' : isHighlighted ? 'hl' : 'default'})`}
      />
    </g>
  );
}

export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow-default" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
      <marker id="arrow-crit" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
      </marker>
      <marker id="arrow-hl" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
      </marker>
    </defs>
  );
}