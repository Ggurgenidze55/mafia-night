'use client';

import { motion } from 'framer-motion';
import type { Player } from '@mafia-night/shared';

interface Props {
  players: Player[];
  myPlayerId: string | null;
  votes: Record<string, number>;
  myVote: string | null;
  onVote: (targetId: string) => void;
  disabled?: boolean;
}

export function VotingPanel({ players, myPlayerId, votes, myVote, onVote, disabled }: Props) {
  const alivePlayers = players.filter(p => p.isAlive && p.id !== myPlayerId);
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(votes), 1);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">📊 ხმის მიცემა</h3>
      {alivePlayers.map(player => {
        const voteCount = votes[player.id] || 0;
        const pct = Math.round((voteCount / maxVotes) * 100);
        const isMyVote = myVote === player.id;

        return (
          <motion.button
            key={player.id}
            onClick={() => !disabled && onVote(player.id)}
            disabled={disabled}
            className="relative flex items-center gap-3 p-2 rounded-lg text-left transition-colors"
            style={{
              background: isMyVote ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.03)',
              border: isMyVote ? '1px solid rgba(230,57,70,0.5)' : '1px solid rgba(255,255,255,0.06)',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
          >
            {/* Progress bar */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{ background: 'rgba(230,57,70,0.08)', originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: pct / 100 }}
              transition={{ duration: 0.4 }}
            />

            <span className="relative text-sm font-medium text-gray-200 flex-1">{player.name}</span>
            <span className="relative text-sm font-mono" style={{ color: '#E63946' }}>
              {voteCount} ხმა {isMyVote && '✓'}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
