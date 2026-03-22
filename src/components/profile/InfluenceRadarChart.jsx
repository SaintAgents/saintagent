import React from 'react';

const LABELS = ['Reputation', 'Trust', 'Economic', 'Social', 'Engagement', 'Community'];
const KEYS = ['reputation', 'trust', 'economic', 'social', 'engagement', 'community'];
const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4'];

export default function InfluenceRadarChart({ dimensions }) {
  const cx = 120, cy = 120, r = 90;
  const levels = [0.25, 0.5, 0.75, 1.0];
  const angleStep = (2 * Math.PI) / 6;

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const dataPoints = KEYS.map((k, i) => getPoint(i, dimensions[k] || 0));
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 240 240" className="w-56 h-56">
        {/* Grid levels */}
        {levels.map((lv, li) => (
          <polygon
            key={li}
            points={KEYS.map((_, i) => {
              const p = getPoint(i, lv * 100);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {KEYS.map((_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon points={polygon} fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="2" />
        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS[i]} stroke="white" strokeWidth="1.5" />
        ))}
        {/* Labels */}
        {LABELS.map((label, i) => {
          const p = getPoint(i, 115);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[9px] fill-slate-500 font-medium"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}