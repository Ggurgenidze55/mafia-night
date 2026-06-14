import type { Server, Socket } from 'socket.io';
import type { GameState } from '@mafia-night/shared';
import { getGameState, setGameState } from '../plugins/redis';
import { countVotes } from '../game/VoteManager';
import { transitionPhase } from '../game/GameEngine';

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on('night:action', async ({ targetId }) => {
    const { roomId, playerId } = socket.data;
    if (!roomId) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state) return;

    const actor = state.players.find(p => p.id === playerId);
    if (!actor || !actor.isAlive || actor.hasActedTonight) return;

    const target = state.players.find(p => p.id === targetId);
    if (!target || !target.isAlive) return;

    const { phase } = state;

    if (phase === 'NIGHT_MAFIA' && actor.role === 'MAFIA') {
      state.nightActions.mafiaTarget = targetId;
      actor.hasActedTonight = true;

      // Check if all mafia acted (take first mafia vote as collective)
      await setGameState(roomId, state);
    } else if (phase === 'NIGHT_DETECTIVE' && actor.role === 'DETECTIVE') {
      state.nightActions.detectiveTarget = targetId;
      actor.hasActedTonight = true;
      await setGameState(roomId, state);
    } else if (phase === 'NIGHT_DOCTOR' && actor.role === 'DOCTOR') {
      state.nightActions.doctorTarget = targetId;
      actor.hasActedTonight = true;
      await setGameState(roomId, state);
    }
  });

  socket.on('vote:cast', async ({ targetId }) => {
    const { roomId, playerId } = socket.data;
    if (!roomId) return;

    const state = await getGameState(roomId) as GameState | null;
    if (!state || state.phase !== 'DAY_VOTING') return;

    const voter = state.players.find(p => p.id === playerId);
    const target = state.players.find(p => p.id === targetId);
    if (!voter?.isAlive || !target?.isAlive) return;

    state.votes[playerId] = targetId;
    await setGameState(roomId, state);

    const counts = countVotes(state.votes);
    io.to(roomId).emit('vote:updated', { votes: state.votes, counts });
  });
}
