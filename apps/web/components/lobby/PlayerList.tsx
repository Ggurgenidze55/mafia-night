'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@mafia-night/shared';

interface Props {
  players: Player[];
  myPlayerId: string | null;
  maxPlayers: number;
}

export function PlayerList({ players, myPlayerId, maxPlayers }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-400 mb-2">
        მოთამაშეები ({players.length}/{maxPlayers}):
      </p>
      <AnimatePresence>
        {players.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(200,169,110,0.2)', color: '#C8A96E' }}
            >
              {player.avatar || player.name[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-200 flex-1">
              {player.name} {player.id === myPlayerId && <span className="text-gray-500">(შენ)</span>}
            </span>
            {player.isHost && <span className="text-xs text-yellow-400">👑 host</span>}
            <span className="text-xs text-green-400">✓</span>
          </motion.div>
        ))}
        {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-30"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}
          >
            <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-xs text-gray-600">⏳ მოლოდინი...</span>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
