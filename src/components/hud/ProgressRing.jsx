import React from 'react';
import { cn } from "@/lib/utils";

export default function ProgressRing({ 
  value, 
  max = 100, 
  size = 80, 
  strokeWidth = 6,
  color = "violet",
  label,
  sublabel,
  className
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min((value / max) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  const colors = {
    violet: { stroke: "#8b5cf6", track: "#ede9fe" },
    emerald: { stroke: "#10b981", track: "#d1fae5" },
    amber: { stroke: "#f59e0b", track: "#fef3c7" },
    rose: { stroke: "#f43f5e", track: "#ffe4e6" },
    blue: { stroke: "#3b82f6", track: "#dbeafe" },
  };

  // Support custom hex color
  const isCustomColor = color?.startsWith('#');
  const colorSet = isCustomColor 
    ? { stroke: color, track: `${color}33` }
    : (colors[color] || colors.violet);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorSet.track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorSet.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-lg font-bold", isCustomColor ? "" : "text-slate-900")} style={isCustomColor ? { color } : undefined}>{label || `${Math.round(percent)}%`}</span>
        {sublabel && (
          <span className="text-xs text-slate-500">{sublabel}</span>
        )}
      </div>
    </div>
  );
}