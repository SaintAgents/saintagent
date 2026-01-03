import React from 'react';

export default function RankSymbol({ code = 'seeker', size = 12, color = '#ffffff' }) {
  const s = Math.max(10, size);
  const cx = 8, cy = 8;
  switch (code) {
    case 'seeker':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="3" fill={color} />
        </svg>
      );
    case 'initiate':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 8h12a6 6 0 0 0-12 0Z" fill={color} />
        </svg>
      );
    case 'adept':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8,2 14,14 2,14" fill={color} />
        </svg>
      );
    case 'practitioner':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8,2 14,8 8,14 2,8" fill={color} />
        </svg>
      );
    case 'master':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8,2 13.5,5 13.5,11 8,14 2.5,11 2.5,5" fill={color} />
        </svg>
      );
    case 'sage':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
            <line x1="8" y1="2.5" x2="8" y2="13.5" />
            <line x1="3.2" y1="6" x2="12.8" y2="10" />
            <line x1="12.8" y1="6" x2="3.2" y2="10" />
          </g>
        </svg>
      );
    case 'oracle':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="5.5" stroke={color} strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r="2.2" fill={color} />
        </svg>
      );
    case 'ascended':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="5.5" stroke={color} strokeWidth="1.2" />
          <circle cx={cx} cy={cy} r="2.2" fill={color} />
        </svg>
      );
    case 'guardian':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2c2 .9 4 1.4 6 2v4c0 3-3 5.5-6 6-3-.5-6-3-6-6V4c2-.6 4-1.1 6-2Z" fill={color} />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="3" fill={color} />
        </svg>
      );
  }
}