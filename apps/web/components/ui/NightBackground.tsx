'use client';

import { motion } from 'framer-motion';

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 50 }, (_, i) => ({
  size: Math.round((seededRandom(i * 3) * 2 + 1) * 100) / 100,
  top: Math.round(seededRandom(i * 3 + 1) * 6000) / 100,
  left: Math.round(seededRandom(i * 3 + 2) * 10000) / 100,
  duration: Math.round((seededRandom(i * 7) * 3 + 2) * 10) / 10,
  delay: Math.round(seededRandom(i * 11) * 30) / 10,
}));

export function NightBackground({ isDay }: { isDay?: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isDay
            ? 'radial-gradient(ellipse at top, #1a1a2e 0%, #0A0A0F 100%)'
            : 'radial-gradient(ellipse at top, #0d0d1a 0%, #0A0A0F 100%)'
        }}
      />
      {!isDay && STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%` }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
      <motion.div
        className="absolute top-8 right-12 rounded-full"
        style={{
          width: 48,
          height: 48,
          background: isDay
            ? 'radial-gradient(circle, #FFD166, #e6a817)'
            : 'radial-gradient(circle, #C8A96E, #8B6914)',
          boxShadow: isDay
            ? '0 0 30px 10px rgba(255,209,102,0.3)'
            : '0 0 20px 8px rgba(200,169,110,0.2)'
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />
    </div>
  );
}
