'use client';

import { motion } from 'framer-motion';
import { ROLES } from '@mafia-night/shared';

interface Props {
  role: string;
  teammates?: string[];
  onClose?: () => void;
}

const ROLE_STYLES: Record<string, { color: string; icon: string; bg: string }> = {
  MAFIA:     { color: '#E63946', icon: '♠️', bg: 'rgba(230,57,70,0.1)' },
  DETECTIVE: { color: '#FFD166', icon: '🕵️', bg: 'rgba(255,209,102,0.1)' },
  DOCTOR:    { color: '#2EC4B6', icon: '💊', bg: 'rgba(46,196,182,0.1)' },
  CIVILIAN:  { color: '#C8A96E', icon: '👤', bg: 'rgba(200,169,110,0.1)' },
};

export function RoleReveal({ role, teammates, onClose }: Props) {
  const roleKey = role as keyof typeof ROLES;
  const roleData = ROLES[roleKey];
  const style = ROLE_STYLES[role] || ROLE_STYLES.CIVILIAN;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <motion.div
        className="flex flex-col items-center gap-6 p-8 rounded-2xl max-w-sm w-full mx-4"
        style={{ background: style.bg, border: `1px solid ${style.color}40` }}
        initial={{ scale: 0.5, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <div className="text-6xl">{style.icon}</div>

        <div className="text-center">
          <p className="text-sm text-gray-400 mb-1">შენი როლია</p>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: 'Playfair Display, serif', color: style.color }}
          >
            {roleData?.name?.ka || role}
          </h1>
        </div>

        <p className="text-center text-gray-300 text-sm">
          {roleData?.description?.ka}
        </p>

        {teammates && teammates.length > 0 && (
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">თანამოაზრეები:</p>
            <p style={{ color: style.color }} className="font-semibold">
              {teammates.join(', ')}
            </p>
          </div>
        )}

        {onClose && (
          <motion.button
            onClick={onClose}
            className="px-6 py-2 rounded-full font-semibold text-sm"
            style={{ background: style.color, color: '#0A0A0F' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✓ გავიგე
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
