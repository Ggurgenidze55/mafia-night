import type { GamePhase, Player, ChatMessage, RoomSettings, NightActions } from './game';

// Use 'any' for WebRTC types to be compatible with both browser and Node.js environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RTCSdp = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RTCIce = any;

export interface ClientToServerEvents {
  'room:create': (data: { playerName: string; settings?: Partial<RoomSettings> }) => void;
  'room:join':   (data: { roomId: string; playerName: string }) => void;
  'room:leave':  () => void;
  'game:start':  () => void;
  'night:action': (data: { targetId: string }) => void;
  'vote:cast':   (data: { targetId: string }) => void;
  'chat:send':   (data: { message: string; channel: 'public' | 'mafia' }) => void;
  'webrtc:offer':   (data: { targetId: string; offer: RTCSdp }) => void;
  'webrtc:answer':  (data: { targetId: string; answer: RTCSdp }) => void;
  'webrtc:ice':     (data: { targetId: string; candidate: RTCIce }) => void;
}

export interface ServerToClientEvents {
  'room:joined':    (data: { roomId: string; players: Player[]; settings: RoomSettings }) => void;
  'room:updated':   (data: { players: Player[] }) => void;
  'game:started':   () => void;
  'role:assigned':  (data: { role: string; teammates?: string[] }) => void;
  'phase:changed':  (data: { phase: GamePhase; endsAt: number; nightActions?: NightActions }) => void;
  'night:result':   (data: { killed: string | null; saved: boolean; killedName?: string }) => void;
  'vote:updated':   (data: { votes: Record<string, string>; counts: Record<string, number> }) => void;
  'player:eliminated': (data: { playerId: string; playerName: string; role: string }) => void;
  'game:over':      (data: { winner: 'town' | 'mafia'; players: Player[] }) => void;
  'chat:message':   (data: ChatMessage) => void;
  'detective:result': (data: { targetId: string; targetName: string; isMafia: boolean }) => void;
  'webrtc:offer':   (data: { fromId: string; offer: RTCSdp }) => void;
  'webrtc:answer':  (data: { fromId: string; answer: RTCSdp }) => void;
  'webrtc:ice':     (data: { fromId: string; candidate: RTCIce }) => void;
  'error':          (data: { message: string }) => void;
}
