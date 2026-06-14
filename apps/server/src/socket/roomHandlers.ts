import type { Server, Socket } from 'socket.io';
import type { GameState, RoomSettings } from '@mafia-night/shared';
import { DEFAULT_SETTINGS } from '@mafia-night/shared';
import { getGameState, setGameState } from '../plugins/redis';
import { createInitialGameState, generateRoomCode, startGame } from '../game/GameEngine';
import { prisma } from '../plugins/prisma';
import { nanoid } from 'nanoid';

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('room:create', async ({ playerName, settings }) => {
    try {
      const playerName_ = playerName?.slice(0, 20).trim();
      if (!playerName_) return socket.emit('error', { message: 'სახელი საჭიროა' });

      const code = generateRoomCode();
      const mergedSettings: RoomSettings = { ...DEFAULT_SETTINGS, ...settings };

      // Save to DB
      await prisma.room.create({
        data: {
          code,
          hostId: socket.id,
          settings: mergedSettings as any,
          players: {
            create: { name: playerName_, isHost: true }
          }
        }
      });

      const playerId = nanoid();
      const state = createInitialGameState(code, mergedSettings);
      state.players.push({
        id: playerId,
        socketId: socket.id,
        name: playerName_,
        role: null,
        isAlive: true,
        isHost: true,
        hasActedTonight: false,
        isConnected: true,
        avatar: playerName_[0].toUpperCase()
      });

      await setGameState(code, state);
      socket.join(code);
      socket.data.roomId = code;
      socket.data.playerId = playerId;

      socket.emit('room:joined', { roomId: code, players: state.players, settings: mergedSettings });
    } catch (err) {
      console.error('[room:create]', err);
      socket.emit('error', { message: 'Room შექმნა ვერ მოხდა' });
    }
  });

  socket.on('room:join', async ({ roomId, playerName }) => {
    try {
      const playerName_ = playerName?.slice(0, 20).trim();
      if (!playerName_) return socket.emit('error', { message: 'სახელი საჭიროა' });

      const state = await getGameState(roomId) as GameState | null;
      if (!state) return socket.emit('error', { message: 'Room ვერ მოიძებნა' });
      if (state.phase !== 'LOBBY') return socket.emit('error', { message: 'თამაში უკვე დაწყებულია' });
      if (state.players.length >= state.settings.maxPlayers) return socket.emit('error', { message: 'Room სავსეა' });

      const playerId = nanoid();
      state.players.push({
        id: playerId,
        socketId: socket.id,
        name: playerName_,
        role: null,
        isAlive: true,
        isHost: false,
        hasActedTonight: false,
        isConnected: true,
        avatar: playerName_[0].toUpperCase()
      });

      await setGameState(roomId, state);
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.playerId = playerId;

      socket.emit('room:joined', { roomId, players: state.players, settings: state.settings });
      socket.to(roomId).emit('room:updated', { players: state.players });
    } catch (err) {
      console.error('[room:join]', err);
      socket.emit('error', { message: 'Room-ში შესვლა ვერ მოხდა' });
    }
  });

  socket.on('room:leave', async () => {
    await handleDisconnect(io, socket, true);
  });

  socket.on('game:start', async () => {
    const { roomId, playerId } = socket.data;
    if (!roomId) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state) return;

    const player = state.players.find(p => p.id === playerId);
    if (!player?.isHost) return socket.emit('error', { message: 'მხოლოდ host-ს შეუძლია თამაშის დაწყება' });
    if (state.players.length < 4) return socket.emit('error', { message: 'მინიმუმ 4 მოთამაშე საჭიროა' });

    io.to(roomId).emit('game:started');
    await startGame(io, roomId);
  });

  socket.on('disconnect', async () => {
    await handleDisconnect(io, socket, false);
  });
}

async function handleDisconnect(io: Server, socket: Socket, permanent: boolean) {
  const { roomId, playerId } = socket.data;
  if (!roomId) return;

  const state = await getGameState(roomId) as GameState | null;
  if (!state) return;

  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  if (permanent) {
    state.players = state.players.filter(p => p.id !== playerId);
  } else {
    player.isConnected = false;
    // 30s grace period for reconnect
    setTimeout(async () => {
      const freshState = await getGameState(roomId) as GameState | null;
      if (!freshState) return;
      const p = freshState.players.find(p => p.id === playerId);
      if (p && !p.isConnected) {
        freshState.players = freshState.players.filter(pl => pl.id !== playerId);
        await setGameState(roomId, freshState);
        io.to(roomId).emit('room:updated', { players: freshState.players });
      }
    }, 30000);
  }

  // Transfer host if needed
  if (player.isHost && state.players.length > 0) {
    const newHost = state.players.find(p => p.id !== playerId);
    if (newHost) {
      newHost.isHost = true;
      const newHostSocket = io.sockets.sockets.get(newHost.socketId);
      if (newHostSocket) newHostSocket.data.isHost = true;
    }
  }

  await setGameState(roomId, state);
  socket.to(roomId).emit('room:updated', { players: state.players });
  socket.leave(roomId);
}
