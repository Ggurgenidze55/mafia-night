import { Server } from 'socket.io';
import type { GameState, Player, RoomSettings } from '@mafia-night/shared';
import { DEFAULT_SETTINGS } from '@mafia-night/shared';
import { getGameState, setGameState } from '../plugins/redis';
import { assignRoles } from './RoleAssigner';
import { checkWinCondition } from './WinCondition';
import { getEliminationTarget, countVotes } from './VoteManager';
import { PHASE_DURATIONS, getNextPhase } from './PhaseManager';
import { prisma } from '../plugins/prisma';
import { nanoid } from 'nanoid';

const phaseTimers = new Map<string, NodeJS.Timeout>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function createInitialGameState(roomId: string, settings: RoomSettings = DEFAULT_SETTINGS): GameState {
  return {
    roomId,
    phase: 'LOBBY',
    round: 0,
    players: [],
    nightActions: {},
    votes: {},
    eliminatedPlayers: [],
    winner: null,
    phaseEndsAt: 0,
    mafiaChat: [],
    publicChat: [],
    events: [],
    settings
  };
}

export async function startGame(io: Server, roomId: string): Promise<void> {
  const state = await getGameState(roomId) as GameState;
  if (!state) return;

  const playersWithRoles = assignRoles(state.players, state.settings);
  state.players = playersWithRoles;
  state.round = 1;

  await setGameState(roomId, state);

  // Send private role reveals
  for (const player of playersWithRoles) {
    const teammates = player.role === 'MAFIA'
      ? playersWithRoles.filter(p => p.role === 'MAFIA' && p.id !== player.id).map(p => p.name)
      : undefined;

    io.to(player.socketId).emit('role:assigned', {
      role: player.role!,
      teammates
    });

    // Add mafia players to mafia room
    if (player.role === 'MAFIA') {
      const sock = io.sockets.sockets.get(player.socketId);
      sock?.join(`mafia:${roomId}`);
    }
  }

  await transitionPhase(io, roomId, 'ROLE_REVEAL');
}

export async function transitionPhase(io: Server, roomId: string, phase: GameState['phase']): Promise<void> {
  // Clear existing timer
  const existingTimer = phaseTimers.get(roomId);
  if (existingTimer) clearTimeout(existingTimer);

  const state = await getGameState(roomId) as GameState;
  if (!state) return;

  state.phase = phase;
  state.votes = {};
  state.nightActions = phase === 'NIGHT_MAFIA' ? {} : state.nightActions;

  const duration = PHASE_DURATIONS[phase];
  state.phaseEndsAt = duration ? Date.now() + duration : 0;

  await setGameState(roomId, state);

  io.to(roomId).emit('phase:changed', {
    phase,
    endsAt: state.phaseEndsAt
  });

  if (duration) {
    const timer = setTimeout(() => handlePhaseEnd(io, roomId, phase), duration);
    phaseTimers.set(roomId, timer);
  }
}

async function handlePhaseEnd(io: Server, roomId: string, phase: GameState['phase']): Promise<void> {
  const state = await getGameState(roomId) as GameState;
  if (!state || state.phase !== phase) return;

  switch (phase) {
    case 'ROLE_REVEAL':
      await transitionPhase(io, roomId, 'NIGHT_START');
      break;

    case 'NIGHT_START':
      await transitionPhase(io, roomId, 'NIGHT_MAFIA');
      break;

    case 'NIGHT_MAFIA': {
      const hasDetective = state.players.some(p => p.role === 'DETECTIVE' && p.isAlive);
      await transitionPhase(io, roomId, hasDetective ? 'NIGHT_DETECTIVE' : 'NIGHT_DOCTOR');
      break;
    }

    case 'NIGHT_DETECTIVE': {
      // Send detective result privately
      const detective = state.players.find(p => p.role === 'DETECTIVE' && p.isAlive);
      if (detective && state.nightActions.detectiveTarget) {
        const target = state.players.find(p => p.id === state.nightActions.detectiveTarget);
        if (target) {
          io.to(detective.socketId).emit('detective:result', {
            targetId: target.id,
            targetName: target.name,
            isMafia: target.role === 'MAFIA'
          });
        }
      }
      const hasDoctor = state.players.some(p => p.role === 'DOCTOR' && p.isAlive);
      await transitionPhase(io, roomId, hasDoctor ? 'NIGHT_DOCTOR' : 'NIGHT_RESULTS');
      break;
    }

    case 'NIGHT_DOCTOR':
      await resolveNight(io, roomId);
      break;

    case 'NIGHT_RESULTS':
      await transitionPhase(io, roomId, 'DAY_DISCUSSION');
      break;

    case 'DAY_DISCUSSION':
      await transitionPhase(io, roomId, 'DAY_VOTING');
      break;

    case 'DAY_VOTING':
      await resolveVoting(io, roomId);
      break;

    case 'DAY_ELIMINATION': {
      const winner = checkWinCondition(state.players);
      if (winner) {
        await endGame(io, roomId, winner);
      } else {
        state.round++;
        await setGameState(roomId, state);
        await transitionPhase(io, roomId, 'NIGHT_START');
      }
      break;
    }
  }
}

async function resolveNight(io: Server, roomId: string): Promise<void> {
  const state = await getGameState(roomId) as GameState;
  if (!state) return;

  const { mafiaTarget, doctorTarget } = state.nightActions;
  const saved = mafiaTarget === doctorTarget;
  let killed: string | null = null;
  let killedName: string | undefined;

  if (mafiaTarget && !saved) {
    const victim = state.players.find(p => p.id === mafiaTarget);
    if (victim) {
      victim.isAlive = false;
      state.eliminatedPlayers.push(victim.id);
      killed = victim.id;
      killedName = victim.name;
    }
  }

  state.nightActions = {};
  state.players.forEach(p => { p.hasActedTonight = false; });
  await setGameState(roomId, state);

  io.to(roomId).emit('night:result', { killed, saved, killedName });

  const winner = checkWinCondition(state.players);
  if (winner) {
    await transitionPhase(io, roomId, 'NIGHT_RESULTS');
    setTimeout(() => endGame(io, roomId, winner), PHASE_DURATIONS.NIGHT_RESULTS!);
  } else {
    await transitionPhase(io, roomId, 'NIGHT_RESULTS');
  }
}

async function resolveVoting(io: Server, roomId: string): Promise<void> {
  const state = await getGameState(roomId) as GameState;
  if (!state) return;

  const alivePlayers = state.players.filter(p => p.isAlive);
  const target = getEliminationTarget(state.votes, alivePlayers);

  if (target) {
    const eliminated = state.players.find(p => p.id === target);
    if (eliminated) {
      eliminated.isAlive = false;
      state.eliminatedPlayers.push(eliminated.id);
      await setGameState(roomId, state);

      io.to(roomId).emit('player:eliminated', {
        playerId: eliminated.id,
        playerName: eliminated.name,
        role: eliminated.role!
      });
    }
  }

  await transitionPhase(io, roomId, 'DAY_ELIMINATION');
}

async function endGame(io: Server, roomId: string, winner: 'town' | 'mafia'): Promise<void> {
  const state = await getGameState(roomId) as GameState;
  if (!state) return;

  state.phase = 'GAME_OVER';
  state.winner = winner;
  await setGameState(roomId, state);

  io.to(roomId).emit('game:over', { winner, players: state.players });

  // Save to DB
  try {
    await prisma.room.update({
      where: { code: roomId },
      data: { status: 'FINISHED' }
    });
  } catch {}

  // Clear timer
  const timer = phaseTimers.get(roomId);
  if (timer) { clearTimeout(timer); phaseTimers.delete(roomId); }
}

export { generateRoomCode };
