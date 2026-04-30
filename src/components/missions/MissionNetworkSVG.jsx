import React, { useRef, useState, useEffect, useMemo } from 'react';

// Simple force-directed layout (computed once per data change)
function computeLayout(missions, width, height) {
  if (!missions.length) return { nodes: [], edges: [] };

  const nodes = missions.map((m, i) => {
    // Distribute in a spiral pattern initially
    const angle = (i / missions.length) * Math.PI * 6;
    const r = 80 + i * 8;
    return {
      id: m.id,
      mission: m,
      x: width / 2 + Math.cos(angle) * Math.min(r, width * 0.38),
      y: height / 2 + Math.sin(angle) * Math.min(r, height * 0.38),
      radius: Math.max(18, Math.min(32, 14 + (m.participant_count || 0) * 2)),
    };
  });

  // Build edges: missions share an edge if they share participants or the same creator
  const edges = [];
  for (let i = 0; i < missions.length; i++) {
    for (let j = i + 1; j < missions.length; j++) {
      const a = missions[i];
      const b = missions[j];
      const aP = new Set([...(a.participant_ids || []), a.creator_id]);
      const bP = new Set([...(b.participant_ids || []), b.creator_id]);
      let shared = 0;
      aP.forEach(p => { if (bP.has(p)) shared++; });
      if (shared > 0) {
        edges.push({ source: i, target: j, weight: shared });
      }
    }
  }

  // Simple force simulation (50 iterations)
  for (let iter = 0; iter < 60; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = 3000 / (dist * dist);
        let fx = (dx / dist) * force;
        let fy = (dy / dist) * force;
        nodes[i].x -= fx;
        nodes[i].y -= fy;
        nodes[j].x += fx;
        nodes[j].y += fy;
      }
    }

    // Attraction along edges
    edges.forEach(e => {
      const a = nodes[e.source];
      const b = nodes[e.target];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = (dist - 120) * 0.02 * e.weight;
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;
      a.x += fx;
      a.y += fy;
      b.x -= fx;
      b.y -= fy;
    });

    // Center gravity
    nodes.forEach(n => {
      n.x += (width / 2 - n.x) * 0.01;
      n.y += (height / 2 - n.y) * 0.01;
    });
  }

  // Clamp to bounds
  nodes.forEach(n => {
    n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
    n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
  });

  return { nodes, edges };
}

export default function MissionNetworkSVG({ missions, profileMap, selectedId, onSelect, zoom, statusColors }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [hoveredId, setHoveredId] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { nodes, edges } = useMemo(
    () => computeLayout(missions, dims.w, dims.h),
    [missions, dims.w, dims.h]
  );

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    dragRef.current = { startX: e.clientX - pan.x, startY: e.clientY - pan.y };
  };
  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    setPan({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
  };
  const handleMouseUp = () => { dragRef.current = null; };

  const getColor = (status) => statusColors[status] || '#94a3b8';

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-slate-50/50"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg width={dims.w} height={dims.h} className="select-none">
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((e, i) => (
            <line
              key={i}
              x1={nodes[e.source].x}
              y1={nodes[e.source].y}
              x2={nodes[e.target].x}
              y2={nodes[e.target].y}
              stroke="#cbd5e1"
              strokeWidth={Math.min(e.weight * 1.5, 4)}
              strokeDasharray={e.weight > 1 ? 'none' : '4,4'}
              opacity={0.5}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedId === node.id;
            const isHovered = hoveredId === node.id;
            const color = getColor(node.mission.status);
            const r = node.radius;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onClick={(e) => { e.stopPropagation(); onSelect(node.mission); }}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer"
              >
                {/* Glow ring */}
                {(isSelected || isHovered) && (
                  <circle r={r + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.4}>
                    <animate attributeName="r" from={r + 4} to={r + 10} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0.1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Main circle */}
                <circle
                  r={r}
                  fill={color}
                  opacity={isSelected ? 1 : 0.85}
                  stroke={isSelected ? '#1e293b' : 'white'}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* Participant count */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="white"
                  fontSize={r > 24 ? 12 : 10}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {node.mission.participant_count || 0}
                </text>

                {/* Title label */}
                <text
                  textAnchor="middle"
                  y={r + 14}
                  fill="#334155"
                  fontSize={11}
                  fontWeight="500"
                  pointerEvents="none"
                >
                  {(node.mission.title || '').length > 18
                    ? node.mission.title.slice(0, 16) + '…'
                    : node.mission.title}
                </text>

                {/* Mission type icon */}
                {node.mission.mission_type && (
                  <text
                    textAnchor="middle"
                    y={-r - 6}
                    fill="#64748b"
                    fontSize={9}
                    pointerEvents="none"
                    className="uppercase"
                  >
                    {node.mission.mission_type}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}