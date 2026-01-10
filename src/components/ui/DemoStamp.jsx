import React from 'react';
import { cn } from "@/lib/utils";

export default function DemoStamp({ className, size = "md" }) {
  const sizeClasses = {
    sm: "text-[8px] px-1 py-0.5",
    md: "text-[10px] px-1.5 py-0.5",
    lg: "text-xs px-2 py-1"
  };

  return (
    <div
      className={cn(
        "absolute top-1 left-1 z-20 bg-amber-500/90 text-white font-bold uppercase tracking-wider rounded-sm shadow-sm transform -rotate-12",
        sizeClasses[size],
        className
      )}
      style={{ 
        textShadow: '0 1px 1px rgba(0,0,0,0.3)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}
    >
      DEMO
    </div>
  );
}