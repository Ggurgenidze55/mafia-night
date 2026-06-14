import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { registerRoomHandlers } from './socket/roomHandlers';
import { registerGameHandlers } from './socket/gameHandlers';
import { registerChatHandlers } from './socket/chatHandlers';
import { registerVideoHandlers } from './socket/videoHandlers';

const app = Fastify({ logger: true });
const httpServer = createServer(app.server);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.register(fastifyCors, {
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// REST: create room (for initial validation)
app.post('/api/room/validate', async (req, reply) => {
  reply.send({ ok: true });
});

io.on('connection', (socket) => {
  console.log(`[Socket] connected: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerVideoHandlers(io, socket);
});

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] listening on http://0.0.0.0:${PORT}`);
});
