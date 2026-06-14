'use client';

import { motion } from 'framer-motion';
import type { RoomSettings } from '@mafia-night/shared';

interface Props {
  settings: RoomSettings;
  onChange: (settings: Partial<RoomSettings>) => void;
  onStart: () => void;
  playerCount: number;
  disabled?: boolean;
}

function Toggle({ checked, onChange, label, icon, color }: { checked: boolean; onChange: (v: boolean) => void; label: string; icon: string; color: string }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200"
      style={{ background: checked ? `rgba(${color},0.08)` : 'rgba(255,255,255,0.02)', border: `1px solid ${checked ? `rgba(${color},0.25)` : 'rgba(255,255,255,0.06)'}` }}>
      <span className="text-base">{icon}</span>
      <span className="text-sm flex-1" style={{ color: checked ? `rgb(${color})` : 'rgba(255,255,255,0.4)' }}>{label}</span>
      <div className="relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? `rgba(${color},0.4)` : 'rgba(255,255,255,0.1)' }}>
        <motion.div className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: checked ? `rgb(${color})` : 'rgba(255,255,255,0.3)' }}
          animate={{ left: checked ? '18px' : '2px' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </div>
    </button>
  );
}

export function HostControls({ settings, onChange, onStart, playerCount, disabled }: Props) {
  const canStart = !disabled && playerCount >= 4;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Toggle checked={settings.roles.detective} onChange={v => onChange({ roles: { ...settings.roles, detective: v } })}
          label="დეტექტივი" icon="🔍" color="255,209,102" />
        <Toggle checked={settings.roles.doctor} onChange={v => onChange({ roles: { ...settings.roles, doctor: v } })}
          label="ექიმი" icon="⚕️" color="46,196,182" />
        <Toggle checked={settings.videoEnabled} onChange={v => onChange({ videoEnabled: v })}
          label="ვიდეო" icon="📹" color="99,179,237" />
        <Toggle checked={settings.faceTracking} onChange={v => onChange({ faceTracking: v })}
          label="Face Track" icon="😊" color="183,148,246" />
      </div>

      {/* Timer slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(200,169,110,0.5)' }}>
            დისკუსიის დრო
          </span>
          <span className="font-mono text-sm font-bold" style={{ color: '#C8A96E' }}>
            {settings.timers.discussion}წ
          </span>
        </div>
        <div className="relative">
          <input type="range" min={30} max={180} step={15}
            value={settings.timers.discussion}
            onChange={e => onChange({ timers: { ...settings.timers, discussion: +e.target.value } })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(90deg, #C8A96E ${((settings.timers.discussion - 30) / 150) * 100}%, rgba(255,255,255,0.1) 0%)`, accentColor: '#C8A96E' }} />
        </div>
      </div>

      {/* Start button */}
      <motion.button onClick={canStart ? onStart : undefined}
        disabled={!canStart}
        className="relative w-full py-4 rounded-xl font-cinzel font-black text-sm tracking-widest uppercase overflow-hidden"
        style={{
          background: canStart ? 'linear-gradient(135deg, #C8A96E 0%, #8B6914 100%)' : 'rgba(255,255,255,0.05)',
          color: canStart ? '#07070E' : 'rgba(255,255,255,0.2)',
          cursor: canStart ? 'pointer' : 'not-allowed',
          boxShadow: canStart ? '0 0 40px rgba(200,169,110,0.3)' : 'none',
        }}
        whileHover={canStart ? { scale: 1.02, boxShadow: '0 0 50px rgba(200,169,110,0.5)' } : {}}
        whileTap={canStart ? { scale: 0.98 } : {}}>

        {/* Shimmer effect */}
        {canStart && (
          <motion.div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', skewX: '-20deg' }}
            animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2">
          🎭 {canStart ? 'თამაშის დაწყება' : `კიდევ ${4 - playerCount} მოთამაშე საჭიროა`}
        </span>
      </motion.button>
    </div>
  );
}
