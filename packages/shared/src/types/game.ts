import type { RoleId } from '../constants/roles';

export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'NIGHT_START'
  | 'NIGHT_MAFIA'
  | 'NIGHT_DETECTIVE'
  | 'NIGHT_DOCTOR'
  | 'NIGHT_RESULTS'
  | 'DAY_DISCUSSION'
  | 'DAY_VOTING'
  | 'DAY_ELIMINATION'
  | 'GAME_OVER';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  role: RoleId | null;
  isAlive: boolean;
  isHost: boolean;
  hasActedTonight: boolean;
  avatar?: string;
  isConnected: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  channel: 'public' | 'mafia';
  timestamp: number;
}

export interface GameEvent {
  id: string;
  type: string;
  message: { ka: string; en: string };
  timestamp: number;
}

export interface NightActions {
  mafiaTarget?: string;
  doctorTarget?: string;
  detectiveTarget?: string;
  detectiveResult?: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  roles: {
    detective: boolean;
    doctor: boolean;
  };
  timers: {
    discussion: number;
    voting: number;
    nightAction: number;
  };
  videoEnabled: boolean;
  faceTracking: boolean;
  language: 'ka' | 'en';
}

export const DEFAULT_SETTINGS: RoomSettings = {
  maxPlayers: 10,
  roles: { detective: true, doctor: true },
  timers: { discussion: 90, voting: 30, nightAction: 30 },
  videoEnabled: true,
  faceTracking: true,
  language: 'ka'
};

export interface GameState {
  roomId: string;
  phase: GamePhase;
  round: number;
  players: Player[];
  nightActions: NightActions;
  votes: Record<string, string>;
  eliminatedPlayers: string[];
  winner: 'town' | 'mafia' | null;
  phaseEndsAt: number;
  mafiaChat: ChatMessage[];
  publicChat: ChatMessage[];
  events: GameEvent[];
  settings: RoomSettings;
}
