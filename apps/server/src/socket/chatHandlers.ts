import type { Server, Socket } from 'socket.io';
import type { GameState, ChatMessage } from '@mafia-night/shared';
import { getGameState, setGameState } from '../plugins/redis';
import { nanoid } from 'nanoid';

export function registerChatHandlers(io: Server, socket: Socket) {
  socket.on('chat:send', async ({ message, channel }) => {
    const { roomId, playerId } = socket.data;
    if (!roomId) return;

    const msg = message?.slice(0, 200).trim();
    if (!msg) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state) return;

    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    // Dead players can only chat after game over
    if (!player.isAlive && state.phase !== 'GAME_OVER') return;

    // Mafia chat only during night or game over
    if (channel === 'mafia') {
      if (player.role !== 'MAFIA') return;
      if (!['NIGHT_MAFIA', 'NIGHT_DETECTIVE', 'NIGHT_DOCTOR', 'GAME_OVER'].includes(state.phase)) return;
    }

    const chatMsg: ChatMessage = {
      id: nanoid(),
      playerId: player.id,
      playerName: player.name,
      message: msg,
      channel,
      timestamp: Date.now()
    };

    if (channel === 'mafia') {
      state.mafiaChat.push(chatMsg);
      await setGameState(roomId, state);
      io.to(`mafia:${roomId}`).emit('chat:message', chatMsg);
    } else {
      state.publicChat.push(chatMsg);
      await setGameState(roomId, state);
      io.to(roomId).emit('chat:message', chatMsg);
    }
  });
}
