'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@mafia-night/shared';

interface Props {
  players: Player[];
  myPlayerId: string | null;
  maxPlayers: number;
}

const AVATARS = ['🎭', '🃏', '🎩', '🔮', '🗡️', '🌙', '👁️', '⚔️', '🎲', '🃏', '♟️', '🦇'];

export function PlayerList({ players, myPlayerId, maxPlayers }: Props) {
  const slots = Math.max(maxPlayers, players.length);

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {players.map((player, i) => (
          <motion.div key={player.id}
            initial={{ opacity: 0, x: -16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.96 }}
            transition={{ delay: i * 0.05 }}
            className="player-card flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: player.id === myPlayerId ? 'rgba(200,169,110,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${player.id === myPlayerId ? 'rgba(200,169,110,0.25)' : 'rgba(255,255,255,0.06)'}` }}>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: player.id === myPlayerId ? 'rgba(200,169,110,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${player.id === myPlayerId ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              {AVATARS[i % AVATARS.length]}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold truncate" style={{ color: player.id === myPlayerId ? '#C8A96E' : '#e5e7eb' }}>
                  {player.name}
                </span>
                {player.id === myPlayerId && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: 'rgba(200,169,110,0.1)', color: 'rgba(200,169,110,0.6)', border: '1px solid rgba(200,169,110,0.2)' }}>
                    you
                  </span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {player.isHost && (
                <span className="text-xs px-2 py-0.5 rounded-full font-cinzel"
                  style={{ background: 'rgba(255,209,102,0.1)', color: '#FFD166', border: '1px solid rgba(255,209,102,0.2)' }}>
                  👑 Host
                </span>
              )}
              <motion.div className="w-2 h-2 rounded-full"
                style={{ background: '#2EC4B6', boxShadow: '0 0 6px rgba(46,196,182,0.6)' }}
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </motion.div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
          <motion.div key={`empty-${i}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (players.length + i) * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
            <div className="w-9 h-9 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <span className="text-xs font-crimson italic" style={{ color: 'rgba(255,255,255,0.15)' }}>
              ⏳ მოლოდინი...
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
