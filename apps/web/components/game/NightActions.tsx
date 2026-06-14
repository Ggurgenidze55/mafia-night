'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Player, GamePhase } from '@mafia-night/shared';

interface Props {
  phase: GamePhase;
  myRole: string | null;
  players: Player[];
  myPlayerId: string | null;
  onAction: (targetId: string) => void;
  hasActed?: boolean;
}

const ROLE_PHASE: Record<string, string> = {
  MAFIA: 'NIGHT_MAFIA',
  DETECTIVE: 'NIGHT_DETECTIVE',
  DOCTOR: 'NIGHT_DOCTOR',
};

const ACTION_LABEL: Record<string, string> = {
  MAFIA: '🗡️ სამიზნე',
  DETECTIVE: '🔍 შემოწმება',
  DOCTOR: '💊 დაცვა',
};

export function NightActions({ phase, myRole, players, myPlayerId, onAction, hasActed }: Props) {
  const [selected, setSelected] = useState<string>('');

  if (!myRole || ROLE_PHASE[myRole] !== phase) return null;
  if (hasActed) return (
    <div className="p-3 rounded-lg text-center text-sm text-gray-400" style={{ background: 'rgba(255,255,255,0.03)' }}>
      ✓ მოქმედება გაიგზავნა
    </div>
  );

  const targets = players.filter(p => p.isAlive && p.id !== myPlayerId);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        {ACTION_LABEL[myRole]}
      </h3>

      <div className="flex flex-wrap gap-2">
        {targets.map(player => (
          <motion.button
            key={player.id}
            onClick={() => setSelected(player.id)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: selected === player.id ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.05)',
              border: selected === player.id ? '1px solid #C8A96E' : '1px solid rgba(255,255,255,0.1)',
              color: selected === player.id ? '#C8A96E' : '#9ca3af',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {player.name}
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={() => selected && onAction(selected)}
        disabled={!selected}
        className="px-4 py-2 rounded-lg font-semibold text-sm mt-1"
        style={{
          background: selected ? '#C8A96E' : 'rgba(255,255,255,0.05)',
          color: selected ? '#0A0A0F' : '#6b7280',
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.98 } : {}}
      >
        ✓ მოქმედება
      </motion.button>
    </div>
  );
}
