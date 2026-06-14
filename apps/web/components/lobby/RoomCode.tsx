'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function RoomCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm">Room კოდი:</span>
      <span
        className="font-mono text-2xl font-bold tracking-widest"
        style={{ color: '#C8A96E' }}
      >
        {code}
      </span>
      <motion.button
        onClick={copy}
        className="px-3 py-1 rounded text-xs font-medium"
        style={{ background: 'rgba(200,169,110,0.15)', color: '#C8A96E', border: '1px solid rgba(200,169,110,0.3)' }}
        whileTap={{ scale: 0.95 }}
      >
        {copied ? '✓ კოპირდა!' : '📋 კოპირება'}
      </motion.button>
    </div>
  );
}
