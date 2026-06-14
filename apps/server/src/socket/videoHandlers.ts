import type { Server, Socket } from 'socket.io';
import type { GameState } from '@mafia-night/shared';
import { getGameState } from '../plugins/redis';

export function registerVideoHandlers(io: Server, socket: Socket) {
  socket.on('webrtc:offer', async ({ targetId, offer }) => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state) return;

    const target = state.players.find(p => p.id === targetId);
    if (!target) return;

    io.to(target.socketId).emit('webrtc:offer', { fromId: socket.data.playerId, offer });
  });

  socket.on('webrtc:answer', async ({ targetId, answer }) => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state) return;

    const target = state.players.find(p => p.id === targetId);
    if (!target) return;

    io.to(target.socketId).emit('webrtc:answer', { fromId: socket.data.playerId, answer });
  });

  socket.on('webrtc:ice', async ({ targetId, candidate }) => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state) return;

    const target = state.players.find(p => p.id === targetId);
    if (!target) return;

    io.to(target.socketId).emit('webrtc:ice', { fromId: socket.data.playerId, candidate });
  });
}
