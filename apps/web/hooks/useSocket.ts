'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';

export function useSocket() {
  const initialized = useRef(false);
  const store = useGameStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = connectSocket();

    socket.on('room:joined', ({ roomId, players, settings }) => {
      store.setRoomJoined(roomId, players, settings);
    });

    socket.on('room:updated', ({ players }) => {
      store.setPlayers(players);
    });

    socket.on('role:assigned', ({ role, teammates }) => {
      store.setMyRole(role, teammates);
    });

    socket.on('phase:changed', ({ phase, endsAt }) => {
      store.setPhase(phase, endsAt);
    });

    socket.on('night:result', ({ killed, saved, killedName }) => {
      store.setNightResult(killed, saved, killedName);
      if (killed) store.eliminatePlayer(killed);
    });

    socket.on('vote:updated', ({ counts }) => {
      store.setVotes(counts);
    });

    socket.on('player:eliminated', ({ playerId }) => {
      store.eliminatePlayer(playerId);
    });

    socket.on('game:over', ({ winner, players }) => {
      store.setWinner(winner, players);
    });

    socket.on('chat:message', (msg) => {
      store.addMessage(msg);
    });

    socket.on('detective:result', ({ targetName, isMafia }) => {
      store.setDetectiveResult(targetName, isMafia);
    });

    return () => {
      socket.off('room:joined');
      socket.off('room:updated');
      socket.off('role:assigned');
      socket.off('phase:changed');
      socket.off('night:result');
      socket.off('vote:updated');
      socket.off('player:eliminated');
      socket.off('game:over');
      socket.off('chat:message');
      socket.off('detective:result');
    };
  }, []);

  return getSocket();
}
