'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NightBackground } from '@/components/ui/NightBackground';
import { RoomCode } from '@/components/lobby/RoomCode';
import { PlayerList } from '@/components/lobby/PlayerList';
import { HostControls } from '@/components/lobby/HostControls';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/store/gameStore';
import type { RoomSettings } from '@mafia-night/shared';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const socket = useSocket();

  const { players, myPlayerId, settings, phase } = useGameStore();
  const [localSettings, setLocalSettings] = useState<RoomSettings>(settings);

  const myPlayer = players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost ?? false;

  useEffect(() => {
    if (phase !== 'LOBBY' && phase !== 'ROLE_REVEAL') {
      router.push(`/room/${roomId}/game`);
    }
  }, [phase, roomId, router]);

  function handleStart() {
    socket.emit('game:start');
  }

  function handleSettingsChange(partial: Partial<RoomSettings>) {
    setLocalSettings(prev => ({ ...prev, ...partial }));
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <NightBackground />

      <motion.div
        className="w-full max-w-md flex flex-col gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#C8A96E' }}>
            🎭 Lobby
          </h1>
          <RoomCode code={roomId} />
          <p className="text-xs text-gray-500">გაუზიარე მეგობრებს !</p>
        </div>

        {/* Player list */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,169,110,0.15)' }}
        >
          <PlayerList players={players} myPlayerId={myPlayerId} maxPlayers={settings.maxPlayers} />
        </div>

        {/* Host controls */}
        {isHost && (
          <motion.div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,169,110,0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <HostControls
              settings={localSettings}
              onChange={handleSettingsChange}
              onStart={handleStart}
              playerCount={players.length}
            />
          </motion.div>
        )}

        {!isHost && (
          <div className="text-center py-4 text-gray-500 text-sm">
            ⏳ Host-ს ელოდები თამაშის დასაწყებად...
          </div>
        )}
      </motion.div>
    </main>
  );
}
