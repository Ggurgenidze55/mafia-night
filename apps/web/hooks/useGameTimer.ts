'use client';

import { useState, useEffect } from 'react';

export function useGameTimer(endsAt: number): number {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endsAt) { setRemaining(0); return; }

    const update = () => {
      const diff = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(diff);
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [endsAt]);

  return remaining;
}
