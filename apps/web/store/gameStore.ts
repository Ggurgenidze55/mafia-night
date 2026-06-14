'use client';

import { create } from 'zustand';
import type { GamePhase, Player, ChatMessage, RoomSettings } from '@mafia-night/shared';
import { DEFAULT_SETTINGS } from '@mafia-night/shared';

interface GameStore {
  // Room
  roomId: string | null;
  myPlayerId: string | null;
  myRole: string | null;
  myTeammates: string[];
  playerName: string;

  // Game state
  phase: GamePhase;
  round: number;
  players: Player[];
  votes: Record<string, number>;
  myVote: string | null;
  winner: 'town' | 'mafia' | null;
  phaseEndsAt: number;
  settings: RoomSettings;

  // Chat
  publicMessages: ChatMessage[];
  mafiaMessages: ChatMessage[];

  // Night result
  lastKilled: string | null;
  lastSaved: boolean;
  lastKilledName: string | undefined;

  // Detective result
  detectiveResult: { targetName: string; isMafia: boolean } | null;

  // Actions
  setPlayerName: (name: string) => void;
  setRoomJoined: (roomId: string, players: Player[], settings: RoomSettings) => void;
  setMyRole: (role: string, teammates?: string[]) => void;
  setPhase: (phase: GamePhase, endsAt: number) => void;
  setPlayers: (players: Player[]) => void;
  setVotes: (counts: Record<string, number>) => void;
  setMyVote: (targetId: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setNightResult: (killed: string | null, saved: boolean, killedName?: string) => void;
  setDetectiveResult: (targetName: string, isMafia: boolean) => void;
  setWinner: (winner: 'town' | 'mafia', players: Player[]) => void;
  eliminatePlayer: (playerId: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomId: null,
  myPlayerId: null,
  myRole: null,
  myTeammates: [],
  playerName: '',
  phase: 'LOBBY',
  round: 1,
  players: [],
  votes: {},
  myVote: null,
  winner: null,
  phaseEndsAt: 0,
  settings: DEFAULT_SETTINGS,
  publicMessages: [],
  mafiaMessages: [],
  lastKilled: null,
  lastSaved: false,
  lastKilledName: undefined,
  detectiveResult: null,

  setPlayerName: (name) => set({ playerName: name }),

  setRoomJoined: (roomId, players, settings) => set((s) => ({
    roomId,
    settings,
    players,
    myPlayerId: players.find(p => p.name === s.playerName)?.id ?? null
  })),

  setMyRole: (role, teammates) => set({ myRole: role, myTeammates: teammates || [] }),
  setPhase: (phase, endsAt) => set({ phase, phaseEndsAt: endsAt, myVote: null, detectiveResult: null }),
  setPlayers: (players) => set({ players }),
  setVotes: (counts) => set({ votes: counts }),
  setMyVote: (targetId) => set({ myVote: targetId }),

  addMessage: (msg) => set((s) => {
    if (msg.channel === 'mafia') return { mafiaMessages: [...s.mafiaMessages, msg] };
    return { publicMessages: [...s.publicMessages, msg] };
  }),

  setNightResult: (killed, saved, killedName) => set({ lastKilled: killed, lastSaved: saved, lastKilledName: killedName }),

  setDetectiveResult: (targetName, isMafia) => set({ detectiveResult: { targetName, isMafia } }),

  setWinner: (winner, players) => set({ winner, players, phase: 'GAME_OVER' }),

  eliminatePlayer: (playerId) => set((s) => ({
    players: s.players.map(p => p.id === playerId ? { ...p, isAlive: false } : p)
  })),

  reset: () => set({
    roomId: null, myPlayerId: null, myRole: null, myTeammates: [], phase: 'LOBBY',
    round: 1, players: [], votes: {}, myVote: null, winner: null, phaseEndsAt: 0,
    publicMessages: [], mafiaMessages: [], lastKilled: null, lastSaved: false,
    detectiveResult: null
  })
}));
