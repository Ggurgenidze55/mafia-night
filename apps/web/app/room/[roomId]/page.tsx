'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { RoomCode } from '@/components/lobby/RoomCode';
import { PlayerList } from '@/components/lobby/PlayerList';
import { HostControls } from '@/components/lobby/HostControls';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/store/gameStore';
import type { RoomSettings } from '@mafia-night/shared';

const ParticleField = dynamic(() => import('@/components/ui/ParticleField'), { ssr: false });

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const socket = useSocket();

  const { players, myPlayerId, settings, phase } = useGameStore();
  const [localSettings, setLocalSettings] = useState<RoomSettings>(settings);
  const [copied, setCopied] = useState(false);

  const myPlayer = players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;
  const canStart = players.length >= 4;

  useEffect(() => {
    if (phase !== 'LOBBY' && phase !== 'ROLE_REVEAL') {
      router.push(`/room/${roomId}/game`);
    }
  }, [phase, roomId, router]);

  function handleStart() { socket.emit('game:start'); }

  function handleCopy() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#07070E' }}>
      <ParticleField />

      {/* Top glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,169,110,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10 gap-6">

        {/* Header */}
        <motion.div className="text-center"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-cinzel text-4xl font-black mb-1"
            style={{ background: 'linear-gradient(180deg, #E8C98E, #C8A96E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            LOBBY
          </h1>
          <p className="font-crimson italic text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            მოითათბირე, სანამ ღამე დადგება
          </p>
        </motion.div>

        {/* Room code card */}
        <motion.div className="w-full max-w-md rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(200,169,110,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C8A96E, transparent)' }} />

          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(200,169,110,0.5)' }}>Room კოდი</p>
              <p className="font-mono text-3xl font-black tracking-[0.2em]" style={{ color: '#C8A96E', textShadow: '0 0 20px rgba(200,169,110,0.4)' }}>
                {roomId}
              </p>
            </div>
            <motion.button onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-sm font-semibold relative overflow-hidden"
              style={{ background: copied ? 'rgba(46,196,182,0.15)' : 'rgba(200,169,110,0.1)', border: `1px solid ${copied ? 'rgba(46,196,182,0.4)' : 'rgba(200,169,110,0.3)'}`, color: copied ? '#2EC4B6' : '#C8A96E' }}
              whileTap={{ scale: 0.95 }}>
              <AnimatePresence mode="wait">
                <motion.span key={copied ? 'ok' : 'copy'}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="px-5 pb-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            მეგობრებს გაუზიარე ეს კოდი
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.15), transparent)', margin: '0 0 0' }} />
        </motion.div>

        {/* Players */}
        <motion.div className="w-full max-w-md rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}>

          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(200,169,110,0.5)' }}>
              მოთამაშეები
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: canStart ? 'rgba(46,196,182,0.1)' : 'rgba(255,255,255,0.05)', color: canStart ? '#2EC4B6' : 'rgba(255,255,255,0.3)', border: `1px solid ${canStart ? 'rgba(46,196,182,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              {players.length}/{settings.maxPlayers}
            </span>
          </div>

          <div className="p-4">
            <PlayerList players={players} myPlayerId={myPlayerId} maxPlayers={settings.maxPlayers} />
          </div>

          {!canStart && (
            <div className="px-5 pb-4 text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              მინიმუმ 4 მოთამაშე საჭიროა
            </div>
          )}
        </motion.div>

        {/* Host controls or waiting */}
        <motion.div className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {isHost ? (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,169,110,0.15)' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(200,169,110,0.5)' }}>
                  👑 Host Controls
                </span>
              </div>
              <div className="p-4">
                <HostControls settings={localSettings} onChange={p => setLocalSettings(s => ({ ...s, ...p }))}
                  onStart={handleStart} playerCount={players.length} />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 flex flex-col items-center gap-3">
              <motion.div className="flex gap-1" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: '#C8A96E' }}
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </motion.div>
              <p className="text-sm font-crimson italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Host-ს ელოდები თამაშის დასაწყებად...
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
