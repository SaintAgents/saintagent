import React, { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, GripVertical } from 'lucide-react';

const STATUS_COLORS = {
  todo: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
  in_progress: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  review: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  completed: { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
  blocked: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
};

const PRIORITY_COLORS = {
  urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#94a3b8',
};

export default function CanvasNode({
  task, x, y, isOnCriticalPath, isSelected,
  isConnecting, isConnectionTarget,
  onMouseDown, onConnectorMouseDown, onConnectorMouseUp,
  onDateChange,
}) {
  const W = 220;
  const H = 100;
  const statusC = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
  const priColor = PRIORITY_COLORS[task.priority] || '#94a3b8';
  const [editingDate, setEditingDate] = useState(false);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Shadow */}
      <rect x={2} y={2} width={W} height={H} rx={10} fill="rgba(0,0,0,0.06)" />

      {/* Critical path glow */}
      {isOnCriticalPath && (
        <rect x={-3} y={-3} width={W + 6} height={H + 6} rx={13}
          fill="none" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="6,3" opacity={0.7}>
          <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Card body */}
      <rect
        width={W} height={H} rx={10}
        fill={isSelected ? '#f0f0ff' : statusC.bg}
        stroke={isSelected ? '#7c3aed' : isConnectionTarget ? '#22c55e' : statusC.border}
        strokeWidth={isSelected ? 2 : isConnectionTarget ? 2.5 : 1.5}
        className="cursor-grab"
        onMouseDown={onMouseDown}
      />

      {/* Priority stripe */}
      <rect x={0} y={0} width={4} height={H} rx={2} fill={priColor} />

      {/* Grip handle */}
      <g transform="translate(10, 8)" opacity={0.3}>
        <rect width={3} height={3} fill="#888" rx={1} />
        <rect x={5} width={3} height={3} fill="#888" rx={1} />
        <rect y={5} width={3} height={3} fill="#888" rx={1} />
        <rect x={5} y={5} width={3} height={3} fill="#888" rx={1} />
      </g>

      {/* Title */}
      <text x={20} y={28} fontSize={12} fontWeight={600} fill={statusC.text}
        className="pointer-events-none" style={{ userSelect: 'none' }}>
        {task.title?.length > 22 ? task.title.slice(0, 22) + '…' : task.title}
      </text>

      {/* Status badge */}
      <rect x={20} y={38} width={68} height={18} rx={4} fill={statusC.border + '22'} />
      <text x={54} y={50} textAnchor="middle" fontSize={9} fontWeight={600} fill={statusC.border}
        className="pointer-events-none">{task.status?.replace('_', ' ')}</text>

      {/* Assignee */}
      <text x={95} y={50} fontSize={9} fill="#94a3b8" className="pointer-events-none">
        {task.assignee_name ? `👤 ${task.assignee_name.split(' ')[0]}` : 'Unassigned'}
      </text>

      {/* Date row */}
      <g transform="translate(20, 62)">
        <text fontSize={9} fill="#64748b" className="pointer-events-none" y={10}>
          📅 {task.start_date || '—'}
        </text>
        {task.estimated_hours && (
          <text x={100} fontSize={9} fill="#64748b" className="pointer-events-none" y={10}>
            ⏱ {task.estimated_hours}h
          </text>
        )}
      </g>

      {/* Critical path label */}
      {isOnCriticalPath && (
        <g transform={`translate(${W - 18}, 6)`}>
          <circle r={7} fill="#ef4444" />
          <text textAnchor="middle" y={3.5} fontSize={8} fill="white" fontWeight={700}>!</text>
        </g>
      )}

      {/* INPUT connector (left) */}
      <circle
        cx={0} cy={H / 2} r={7}
        fill={isConnectionTarget ? '#22c55e' : '#fff'}
        stroke={isConnectionTarget ? '#22c55e' : '#cbd5e1'} strokeWidth={2}
        className="cursor-crosshair"
        onMouseUp={(e) => { e.stopPropagation(); onConnectorMouseUp?.(); }}
      />
      <circle cx={0} cy={H / 2} r={3} fill={isConnectionTarget ? '#22c55e' : '#94a3b8'} className="pointer-events-none" />

      {/* OUTPUT connector (right) */}
      <circle
        cx={W} cy={H / 2} r={7}
        fill={isConnecting ? '#3b82f6' : '#fff'}
        stroke={isConnecting ? '#3b82f6' : '#cbd5e1'} strokeWidth={2}
        className="cursor-crosshair"
        onMouseDown={(e) => { e.stopPropagation(); onConnectorMouseDown?.(e); }}
      />
      <circle cx={W} cy={H / 2} r={3} fill={isConnecting ? '#3b82f6' : '#94a3b8'} className="pointer-events-none" />
    </g>
  );
}