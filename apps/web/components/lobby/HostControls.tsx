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

export function HostControls({ settings, onChange, onStart, playerCount, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">⚙️ პარამეტრები</h3>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.roles.detective}
            onChange={e => onChange({ roles: { ...settings.roles, detective: e.target.checked } })}
            className="accent-yellow-400"
          />
          <span className="text-sm text-gray-300">🕵️ დეტექტივი</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.roles.doctor}
            onChange={e => onChange({ roles: { ...settings.roles, doctor: e.target.checked } })}
            className="accent-teal-400"
          />
          <span className="text-sm text-gray-300">💊 ექიმი</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.videoEnabled}
            onChange={e => onChange({ videoEnabled: e.target.checked })}
            className="accent-blue-400"
          />
          <span className="text-sm text-gray-300">📹 ვიდეო</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.faceTracking}
            onChange={e => onChange({ faceTracking: e.target.checked })}
            className="accent-purple-400"
          />
          <span className="text-sm text-gray-300">😊 Face Tracking</span>
        </label>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">
          დისკუსიის დრო: {settings.timers.discussion}წ
        </label>
        <input
          type="range" min={30} max={180} step={15}
          value={settings.timers.discussion}
          onChange={e => onChange({ timers: { ...settings.timers, discussion: +e.target.value } })}
          className="w-full accent-yellow-400"
        />
      </div>

      <motion.button
        onClick={onStart}
        disabled={disabled || playerCount < 4}
        className="w-full py-3 rounded-xl font-bold text-lg"
        style={{
          background: disabled || playerCount < 4
            ? 'rgba(200,169,110,0.2)'
            : 'linear-gradient(135deg, #C8A96E, #8B6914)',
          color: disabled || playerCount < 4 ? '#666' : '#0A0A0F',
          cursor: disabled || playerCount < 4 ? 'not-allowed' : 'pointer'
        }}
        whileHover={!disabled && playerCount >= 4 ? { scale: 1.02 } : {}}
        whileTap={!disabled && playerCount >= 4 ? { scale: 0.98 } : {}}
      >
        🎭 თამაშის დაწყება
        {playerCount < 4 && <span className="block text-xs font-normal mt-0.5">საჭიროა მინ. 4 მოთამაშე</span>}
      </motion.button>
    </div>
  );
}
