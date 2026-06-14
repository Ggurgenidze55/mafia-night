import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { registerRoomHandlers } from './socket/roomHandlers';
import { registerGameHandlers } from './socket/gameHandlers';
import { registerChatHandlers } from './socket/chatHandlers';
import { registerVideoHandlers } from './socket/videoHandlers';

const app = Fastify({ logger: true });

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.register(fastifyCors, {
  origin: CLIENT_URL
});

// Attach Socket.io to Fastify's internal server (same port, same process)
const io = new Server(app.server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

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

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { console.error(err); process.exit(1); }
  console.log(`[Server] listening on http://0.0.0.0:${PORT}`);
});
