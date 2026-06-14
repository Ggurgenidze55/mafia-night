'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NightBackground } from '@/components/ui/NightBackground';
import { PlayerCard } from '@/components/game/PlayerCard';
import { RoleReveal } from '@/components/game/RoleReveal';
import { PhaseOverlay } from '@/components/game/PhaseOverlay';
import { VotingPanel } from '@/components/game/VotingPanel';
import { NightActions } from '@/components/game/NightActions';
import { ChatPanel } from '@/components/game/ChatPanel';
import { GameTimer } from '@/components/game/GameTimer';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useGameStore } from '@/store/gameStore';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const socket = useSocket();

  const store = useGameStore();
  const {
    phase, players, myPlayerId, myRole, myTeammates, votes, myVote,
    phaseEndsAt, publicMessages, mafiaMessages, lastKilled, lastSaved,
    lastKilledName, detectiveResult, winner, settings, round
  } = store;

  const [showRoleReveal, setShowRoleReveal] = useState(false);

  const myPlayer = players.find(p => p.id === myPlayerId);
  const isDay = phase.startsWith('DAY');
  const isMafia = myRole === 'MAFIA';
  const canChat = myPlayer?.isAlive || phase === 'GAME_OVER';
  const canMafiaChat = isMafia && ['NIGHT_MAFIA', 'NIGHT_DETECTIVE', 'NIGHT_DOCTOR'].includes(phase);

  const { localStream, streams, callPeer } = useWebRTC(myPlayerId, settings.videoEnabled);

  useEffect(() => {
    if (phase === 'ROLE_REVEAL') setShowRoleReveal(true);
  }, [phase]);

  // Start WebRTC calls when game begins
  useEffect(() => {
    if (phase !== 'LOBBY' && phase !== 'ROLE_REVEAL' && settings.videoEnabled) {
      players.forEach(p => {
        if (p.id !== myPlayerId) callPeer(p.id);
      });
    }
  }, [phase === 'NIGHT_START']);

  function sendVote(targetId: string) {
    socket.emit('vote:cast', { targetId });
    store.setMyVote(targetId);
  }

  function sendNightAction(targetId: string) {
    socket.emit('night:action', { targetId });
  }

  function sendChat(message: string, channel: 'public' | 'mafia') {
    socket.emit('chat:send', { message, channel });
  }

  const phaseLabels: Record<string, string> = {
    NIGHT_MAFIA: '🌙 მაფიის ჯერი',
    NIGHT_DETECTIVE: '🌙 დეტექტივის ჯერი',
    NIGHT_DOCTOR: '🌙 ექიმის ჯერი',
    NIGHT_RESULTS: '🌅 გათენდა',
    DAY_DISCUSSION: '☀️ დისკუსია',
    DAY_VOTING: '☀️ ხმის მიცემა',
    DAY_ELIMINATION: '☀️ გარიცხვა',
    GAME_OVER: '🎭 თამაში დასრულდა',
  };

  return (
    <main className="min-h-screen flex flex-col p-3 gap-3 relative">
      <NightBackground isDay={isDay} />

      {/* Phase Overlay */}
      <PhaseOverlay
        phase={phase}
        killedName={lastKilledName}
        saved={lastSaved}
      />

      {/* Role Reveal */}
      <AnimatePresence>
        {showRoleReveal && myRole && (
          <RoleReveal
            role={myRole}
            teammates={myTeammates}
            onClose={() => setShowRoleReveal(false)}
          />
        )}
      </AnimatePresence>

      {/* Winner Banner */}
      <AnimatePresence>
        {winner && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center p-8"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <div className="text-6xl mb-4">{winner === 'town' ? '🏘️' : '🕴️'}</div>
              <h1
                className="text-5xl font-bold mb-2"
                style={{ fontFamily: 'Playfair Display, serif', color: winner === 'town' ? '#2EC4B6' : '#E63946' }}
              >
                {winner === 'town' ? 'მოქალაქეები გაიმარჯვეს!' : 'მაფია გაიმარჯვა!'}
              </h1>
              <div className="flex flex-col gap-1 mt-4 mb-6">
                {players.map(p => (
                  <div key={p.id} className="text-sm text-gray-300">
                    {p.name} — <span style={{ color: p.role === 'MAFIA' ? '#E63946' : '#2EC4B6' }}>{p.role}</span>
                  </div>
                ))}
              </div>
              <motion.button
                onClick={() => router.push('/')}
                className="px-8 py-3 rounded-xl font-bold text-lg"
                style={{ background: '#C8A96E', color: '#0A0A0F' }}
                whileTap={{ scale: 0.95 }}
              >
                მთავარ გვერდზე
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold" style={{ color: '#C8A96E' }}>
          {phaseLabels[phase] || phase}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">Round {round}</span>
          <GameTimer endsAt={phaseEndsAt} />
        </div>
      </div>

      {/* My role badge */}
      {myRole && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold self-start"
          style={{
            background: myRole === 'MAFIA' ? 'rgba(230,57,70,0.15)' : myRole === 'DETECTIVE' ? 'rgba(255,209,102,0.15)' : myRole === 'DOCTOR' ? 'rgba(46,196,182,0.15)' : 'rgba(200,169,110,0.1)',
            color: myRole === 'MAFIA' ? '#E63946' : myRole === 'DETECTIVE' ? '#FFD166' : myRole === 'DOCTOR' ? '#2EC4B6' : '#C8A96E',
          }}
        >
          შენ: {myRole}
        </div>
      )}

      {/* Detective result */}
      {detectiveResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 rounded-lg text-sm"
          style={{
            background: detectiveResult.isMafia ? 'rgba(230,57,70,0.15)' : 'rgba(46,196,182,0.15)',
            border: `1px solid ${detectiveResult.isMafia ? 'rgba(230,57,70,0.3)' : 'rgba(46,196,182,0.3)'}`,
            color: detectiveResult.isMafia ? '#E63946' : '#2EC4B6',
          }}
        >
          🔍 {detectiveResult.targetName} — {detectiveResult.isMafia ? '⚠️ მაფიაა!' : '✓ უდანაშაულოა'}
        </motion.div>
      )}

      {/* Players grid */}
      <div className="flex flex-wrap gap-4 justify-center py-2">
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            stream={player.id === myPlayerId ? localStream ?? undefined : streams.get(player.id)}
            isMe={player.id === myPlayerId}
            faceTrackingEnabled={settings.faceTracking}
          />
        ))}
      </div>

      {/* Night Actions */}
      {['NIGHT_MAFIA', 'NIGHT_DETECTIVE', 'NIGHT_DOCTOR'].includes(phase) && (
        <div
          className="p-3 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <NightActions
            phase={phase as any}
            myRole={myRole}
            players={players}
            myPlayerId={myPlayerId}
            onAction={sendNightAction}
            hasActed={myPlayer?.hasActedTonight}
          />
        </div>
      )}

      {/* Voting */}
      {phase === 'DAY_VOTING' && (
        <div
          className="p-3 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <VotingPanel
            players={players}
            myPlayerId={myPlayerId}
            votes={votes}
            myVote={myVote}
            onVote={sendVote}
            disabled={!myPlayer?.isAlive}
          />
        </div>
      )}

      {/* Mafia Chat */}
      {isMafia && (
        <ChatPanel
          messages={mafiaMessages}
          myPlayerId={myPlayerId}
          channel="mafia"
          onSend={msg => sendChat(msg, 'mafia')}
          disabled={!canMafiaChat}
          label="🔴 მაფიის ჩატი (საიდუმლო)"
        />
      )}

      {/* Public Chat */}
      {(phase === 'DAY_DISCUSSION' || phase === 'DAY_VOTING' || phase === 'GAME_OVER') && (
        <ChatPanel
          messages={publicMessages}
          myPlayerId={myPlayerId}
          channel="public"
          onSend={msg => sendChat(msg, 'public')}
          disabled={!canChat}
          label="💬 ჩატი"
        />
      )}
    </main>
  );
}
