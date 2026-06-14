'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GamePhase } from '@mafia-night/shared';

interface Props {
  phase: GamePhase;
  killedName?: string | null;
  saved?: boolean;
}

const PHASE_MESSAGES: Partial<Record<GamePhase, { title: string; subtitle?: string; icon: string }>> = {
  NIGHT_START:    { title: 'ქალაქი იძინებს...', subtitle: 'მაფია იღვიძებს', icon: '🌙' },
  NIGHT_RESULTS:  { title: 'გათენდა...', icon: '🌅' },
  DAY_DISCUSSION: { title: 'დისკუსია', subtitle: 'ვინ არის მაფია?', icon: '☀️' },
  DAY_VOTING:     { title: 'ხმის მიცემა', subtitle: 'ვინ უნდა გავიდეს?', icon: '🗳️' },
  GAME_OVER:      { title: 'თამაში დასრულდა', icon: '🎭' },
};

export function PhaseOverlay({ phase, killedName, saved }: Props) {
  const showOverlay = ['NIGHT_START', 'NIGHT_RESULTS', 'DAY_DISCUSSION', 'DAY_VOTING', 'GAME_OVER'].includes(phase);
  const info = PHASE_MESSAGES[phase];

  let nightResultText = '';
  if (phase === 'NIGHT_RESULTS') {
    if (!killedName) nightResultText = 'ეს ღამე ყველა გადაურჩა!';
    else if (saved) nightResultText = `${killedName} გადარჩა — ექიმმა იხსნა!`;
    else nightResultText = `${killedName} მოკლეს...`;
  }

  return (
    <AnimatePresence>
      {showOverlay && info && (
        <motion.div
          key={phase}
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="text-6xl mb-4">{info.icon}</div>
            <h2
              className="text-5xl font-bold mb-2"
              style={{ fontFamily: 'Playfair Display, serif', color: '#C8A96E' }}
            >
              {info.title}
            </h2>
            {(info.subtitle || nightResultText) && (
              <p className="text-gray-300 text-xl">{nightResultText || info.subtitle}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
