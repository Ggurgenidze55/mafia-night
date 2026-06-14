# 🌙 Mafia Night

ონლაინ მულტიპლეიერ სოციალური დედუქციის თამაში — ქართული ბაზრისთვის.

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Fastify + Socket.io
- **Database:** PostgreSQL (Prisma ORM)
- **Cache / Game State:** Redis
- **Video:** WebRTC (simple-peer)
- **Face Tracking:** MediaPipe FaceLandmarker

## Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL running locally or Railway
- Redis running locally or Railway

### 2. Install dependencies
```bash
npm install
```

### 3. Server environment
```bash
cp apps/server/.env.example apps/server/.env
# Edit DATABASE_URL and REDIS_URL
```

### 4. Database setup
```bash
cd apps/server
npx prisma migrate dev --name init
```

### 5. Web environment
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

### 6. Run development
```bash
# Run both server and web concurrently
npm run dev
```

Or separately:
```bash
# Terminal 1 — Server
cd apps/server && npm run dev

# Terminal 2 — Web
cd apps/web && npm run dev
```

## Game Roles

| Role | Team | Night Action |
|------|------|-------------|
| 🕴️ Mafia | Mafia | Kill a player |
| 🕵️ Detective | Town | Check if a player is Mafia |
| 💊 Doctor | Town | Protect a player from death |
| 👤 Civilian | Town | Vote out the Mafia |

## Deploy

- **Web:** Vercel (`apps/web`)
- **Server + DB + Redis:** Railway (`apps/server`)
