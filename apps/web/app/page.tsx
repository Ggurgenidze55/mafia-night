'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { connectSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';

const ParticleField = dynamic(() => import('@/components/ui/ParticleField'), { ssr: false });

const SUITS = ['♠', '♥', '♣', '♦'];
const ROLES = [
  { icon: '🔫', name: 'მაფია', color: '#E63946', desc: 'ჩუმად კლავს' },
  { icon: '🔍', name: 'დეტექტივი', color: '#FFD166', desc: 'ეძებს სიმართლეს' },
  { icon: '⚕️', name: 'ექიმი', color: '#2EC4B6', desc: 'იხსნის სიცოცხლეს' },
  { icon: '👤', name: 'მოქალაქე', color: '#C8A96E', desc: 'ებრძვის სიცოცხლეს' },
];

export default function LandingPage() {
  const router = useRouter();
  const setPlayerName = useGameStore(s => s.setPlayerName);
  const setRoomJoined = useGameStore(s => s.setRoomJoined);

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'join'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setActiveRole(r => (r + 1) % 4), 2500);
    return () => clearInterval(interval);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleCreate() {
    if (!name.trim()) { setError('სახელი შეიყვანე'); return; }
    setLoading(true); setError('');
    setPlayerName(name.trim());
    const socket = connectSocket();
    socket.once('room:joined', ({ roomId, players, settings }) => {
      setRoomJoined(roomId, players, settings);
      router.push(`/room/${roomId}`);
    });
    socket.once('error', ({ message }) => { setError(message); setLoading(false); });
    socket.emit('room:create', { playerName: name.trim() });
  }

  function handleJoin() {
    if (!name.trim()) { setError('სახელი შეიყვანე'); return; }
    if (!roomCode.trim()) { setError('Room კოდი შეიყვანე'); return; }
    setLoading(true); setError('');
    setPlayerName(name.trim());
    const socket = connectSocket();
    socket.once('room:joined', ({ roomId, players, settings }) => {
      setRoomJoined(roomId, players, settings);
      router.push(`/room/${roomId}`);
    });
    socket.once('error', ({ message }) => { setError(message); setLoading(false); });
    socket.emit('room:join', { roomId: roomCode.trim().toUpperCase(), playerName: name.trim() });
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#07070E' }}>
      <ParticleField />

      {/* Radial glow top */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,169,110,0.08) 0%, transparent 70%)' }} />

      {/* Ambient orbs */}
      <motion.div className="pointer-events-none fixed z-0 rounded-full blur-3xl"
        style={{ width: 600, height: 600, top: '10%', left: '-15%', background: 'radial-gradient(circle, rgba(200,169,110,0.04) 0%, transparent 70%)' }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="pointer-events-none fixed z-0 rounded-full blur-3xl"
        style={{ width: 500, height: 500, bottom: '5%', right: '-10%', background: 'radial-gradient(circle, rgba(230,57,70,0.04) 0%, transparent 70%)' }}
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">

        {/* ── Logo ── */}
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>

          {/* Floating suits row */}
          <div className="flex justify-center gap-5 mb-5">
            {SUITS.map((s, i) => (
              <motion.span key={i} className="text-2xl select-none"
                style={{ color: i % 2 === 0 ? 'rgba(200,169,110,0.5)' : 'rgba(230,57,70,0.5)' }}
                animate={{ y: [-4, 4, -4], rotate: [-5, 5, -5] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
                {s}
              </motion.span>
            ))}
          </div>

          <h1 className="font-cinzel text-7xl font-black tracking-tight mb-3 leading-none"
            style={{
              background: 'linear-gradient(180deg, #E8C98E 0%, #C8A96E 40%, #8B6914 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(200,169,110,0.3))',
            }}>
            MAFIA
          </h1>
          <h2 className="font-cinzel text-2xl font-semibold tracking-[0.3em] uppercase"
            style={{ color: 'rgba(200,169,110,0.5)', letterSpacing: '0.4em' }}>
            N I G H T
          </h2>

          <motion.p className="mt-4 font-crimson text-lg italic"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 4, repeat: Infinity }}>
            სადაც ყველა ტყუის, მხოლოდ ერთი კლავს
          </motion.p>
        </motion.div>

        {/* ── Role Carousel ── */}
        <motion.div className="mb-8 flex gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {ROLES.map((role, i) => (
            <motion.div key={i}
              className="relative px-3 py-2 rounded-xl text-center cursor-default select-none"
              style={{
                background: activeRole === i ? `rgba(${role.color === '#E63946' ? '230,57,70' : role.color === '#FFD166' ? '255,209,102' : role.color === '#2EC4B6' ? '46,196,182' : '200,169,110'},0.12)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeRole === i ? role.color + '50' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.5s ease',
                minWidth: 72,
              }}
              animate={{ scale: activeRole === i ? 1.05 : 1 }}>
              <div className="text-xl mb-0.5">{role.icon}</div>
              <div className="text-xs font-semibold" style={{ color: activeRole === i ? role.color : 'rgba(255,255,255,0.3)' }}>
                {role.name}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main Card ── */}
        <motion.div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200, width: '100%', maxWidth: 440 }}>

          <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
            <div className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(200,169,110,0.2)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(200,169,110,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
                backdropFilter: 'blur(30px)',
              }}>

              {/* Top gold line */}
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C8A96E, #E8C98E, #C8A96E, transparent)' }} />

              <div className="p-7 flex flex-col gap-5">

                {/* Name input */}
                <div>
                  <label className="text-xs uppercase tracking-widest mb-2 block"
                    style={{ color: 'rgba(200,169,110,0.6)', letterSpacing: '0.15em' }}>
                    შენი სახელი
                  </label>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      placeholder="Enter your name..."
                      maxLength={20}
                      className="input-noir w-full px-4 py-3.5 rounded-xl text-sm"
                    />
                    {name && (
                      <motion.div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                        style={{ color: 'rgba(200,169,110,0.5)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {name.length}/20
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button onClick={handleCreate} disabled={loading}
                    className="btn-gold flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    {loading && mode !== 'join' ? (
                      <motion.div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    ) : (
                      <>
                        <span className="text-base">🎭</span>
                        <span className="font-cinzel tracking-wide">Room შექმნა</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button onClick={() => { setMode(m => m === 'join' ? 'idle' : 'join'); setError(''); }}
                    className="btn-ghost flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <span className="text-base">🔗</span>
                    <span className="font-cinzel tracking-wide">შესვლა</span>
                  </motion.button>
                </div>

                {/* Join input */}
                <AnimatePresence>
                  {mode === 'join' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: -12 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: -12 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden">
                      <div className="relative flex gap-2">
                        <input
                          value={roomCode}
                          onChange={e => setRoomCode(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleJoin()}
                          placeholder="ABC123"
                          maxLength={6}
                          autoFocus
                          className="input-noir flex-1 px-4 py-3.5 rounded-xl font-mono text-center text-lg tracking-[0.3em] uppercase"
                        />
                        <motion.button onClick={handleJoin} disabled={loading}
                          className="btn-gold px-5 rounded-xl text-lg"
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          →
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                      style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', color: '#E63946' }}>
                      <span>⚠</span> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom gold line */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)' }} />
            </div>
          </motion.div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div className="mt-8 flex gap-8 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          {[
            { label: 'მოთამაშეები', value: '4-12', icon: '👥' },
            { label: 'როლები', value: '4+', icon: '🎭' },
            { label: 'ფაზები', value: 'ღამე & დღე', icon: '🌙' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xl">{s.icon}</span>
              <span className="font-cinzel text-sm font-bold" style={{ color: '#C8A96E' }}>{s.value}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <motion.div className="mt-10 w-full max-w-xs flex items-center gap-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.2))' }} />
          <span className="text-xs font-cinzel tracking-widest" style={{ color: 'rgba(200,169,110,0.3)' }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(200,169,110,0.2))' }} />
        </motion.div>

        <motion.p className="mt-4 text-xs text-center font-crimson italic"
          style={{ color: 'rgba(255,255,255,0.2)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          Real-time multiplayer · Georgian language · WebRTC video
        </motion.p>
      </div>
    </div>
  );
}
