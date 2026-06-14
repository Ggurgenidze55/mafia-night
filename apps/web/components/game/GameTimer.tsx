'use client';

import { useGameTimer } from '@/hooks/useGameTimer';

export function GameTimer({ endsAt }: { endsAt: number }) {
  const remaining = useGameTimer(endsAt);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 10;

  return (
    <span
      className="font-mono text-lg font-bold tabular-nums"
      style={{ color: isUrgent ? '#E63946' : '#C8A96E' }}
    >
      {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `0:${seconds.toString().padStart(2, '0')}`}
    </span>
  );
}
