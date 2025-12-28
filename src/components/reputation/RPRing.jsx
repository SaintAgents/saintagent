import React from 'react';
import ProgressRing from '@/components/hud/ProgressRing';
import { getRPRank } from '@/components/reputation/rpUtils';

export default function RPRing({ rpPoints = 0, size = 120, color = 'violet', className }) {
  const info = getRPRank(rpPoints);
  const totalMax = (info.nextMin ?? 10000) - info.currentMin;
  const clamped = Math.max(0, Math.min(totalMax, rpPoints - info.currentMin));

  return (
    <ProgressRing
      value={clamped}
      max={totalMax}
      size={size}
      strokeWidth={8}
      color={color}
      className={className}
    />
  );
}