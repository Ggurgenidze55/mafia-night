import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@mafia-night/shared';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001', {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    }) as TypedSocket;
  }
  return socket;
}

export function connectSocket(): TypedSocket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
