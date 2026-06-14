'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
const NightBackground = dynamic(
  () => import('@/components/ui/NightBackground').then(m => m.NightBackground),
  { ssr: false }
);
import { connectSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';

export default function LandingPage() {
  const router = useRouter();
  const setPlayerName = useGameStore(s => s.setPlayerName);
  const setRoomJoined = useGameStore(s => s.setRoomJoined);

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'join'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleCreate() {
    if (!name.trim()) { setError('სახელი შეიყვანე'); return; }
    setLoading(true);
    setError('');
    setPlayerName(name.trim());

    const socket = connectSocket();

    socket.once('room:joined', ({ roomId, players, settings }) => {
      setRoomJoined(roomId, players, settings);
      router.push(`/room/${roomId}`);
    });

    socket.once('error', ({ message }) => {
      setError(message);
      setLoading(false);
    });

    socket.emit('room:create', { playerName: name.trim() });
  }

  function handleJoin() {
    if (!name.trim()) { setError('სახელი შეიყვანე'); return; }
    if (!roomCode.trim()) { setError('Room კოდი შეიყვანე'); return; }
    setLoading(true);
    setError('');
    setPlayerName(name.trim());

    const socket = connectSocket();

    socket.once('room:joined', ({ roomId, players, settings }) => {
      setRoomJoined(roomId, players, settings);
      router.push(`/room/${roomId}`);
    });

    socket.once('error', ({ message }) => {
      setError(message);
      setLoading(false);
    });

    socket.emit('room:join', { roomId: roomCode.trim().toUpperCase(), playerName: name.trim() });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <NightBackground />

      <motion.div
        className="w-full max-w-md flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.h1
            className="text-6xl font-bold mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#C8A96E' }}
            animate={{ textShadow: ['0 0 20px rgba(200,169,110,0.3)', '0 0 40px rgba(200,169,110,0.6)', '0 0 20px rgba(200,169,110,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌙 Mafia Night
          </motion.h1>
          <p className="text-gray-400 text-sm">სოციალური დედუქციის ონლაინ თამაში</p>
        </div>

        {/* Form */}
        <div
          className="w-full flex flex-col gap-4 p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,169,110,0.2)' }}
        >
          <div>
            <label className="text-xs text-gray-500 block mb-1">შენი სახელი</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="სახელი..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #C8A96E, #8B6914)', color: '#0A0A0F' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🎭 Room შექმნა
            </motion.button>

            <motion.button
              onClick={() => setMode(mode === 'join' ? 'idle' : 'join')}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{ background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)', color: '#C8A96E' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔗 შესვლა
            </motion.button>
          </div>

          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-2"
            >
              <input
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ABC123"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none font-mono text-center text-lg tracking-widest uppercase transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <motion.button
                onClick={handleJoin}
                disabled={loading}
                className="px-4 py-3 rounded-xl font-semibold"
                style={{ background: 'rgba(200,169,110,0.2)', color: '#C8A96E' }}
                whileTap={{ scale: 0.95 }}
              >
                →
              </motion.button>
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-center"
              style={{ color: '#E63946' }}
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Floating suits */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {['♠', '♥', '♣', '♦'].map((suit, i) => (
            <motion.div
              key={i}
              className="absolute text-5xl font-bold"
              style={{
                left: `${10 + i * 25}%`,
                top: '25%',
                color: i % 2 === 0 ? 'rgba(200,169,110,0.08)' : 'rgba(230,57,70,0.08)',
              }}
              animate={{ y: [-15, 15, -15], rotate: [-8, 8, -8] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
            >
              {suit}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
