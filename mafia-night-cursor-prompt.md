# 🎭 MAFIA NIGHT — Claude Code Prompt
# ონლაინ მულტიპლეიერ სოციალური დედუქციის თამაში

---

## 🎯 პროექტის მიმოხილვა

ააგე სრული ონლაინ მულტიპლეიერ **Mafia Night** თამაში — ქართული ბაზრისთვის. მოთამაშეები სხვადასხვა მოწყობილობიდან უერთდებიან Room-ს, იღებენ საიდუმლო როლებს, და ერთმანეთთან ფარული საუბრით, ხმის მიცემით და დეტექტიური აზროვნებით ითამაშებენ.

---

## 🏗️ Tech Stack

```
monorepo/
├── apps/
│   ├── web/          # Next.js 14 + TypeScript + Tailwind CSS
│   └── server/       # Node.js + Fastify + Socket.io
├── packages/
│   └── shared/       # საერთო types და game logic
```

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Fastify, Socket.io  
**Database:** PostgreSQL (Prisma ORM) — rooms, players, game history  
**Cache / Game State:** Redis (ioredis) — active game state, session  
**Video:** WebRTC (simple-peer) — peer-to-peer კამერა  
**Face Tracking:** MediaPipe FaceLandmarker (WASM, browser-side)  
**Deploy:** Vercel (web) + Railway (server + PostgreSQL + Redis)  
**i18n:** next-intl — ქართული + ინგლისური  

---

## 🎨 ვიზუალური სტილი

**Aesthetic:** Dark Noir / Underground Club  
- Background: `#0A0A0F` (თითქმის შავი)
- Primary accent: `#C8A96E` (ოქროსფერი — ბარათები, ჩარჩოები)
- Danger accent: `#E63946` (წითელი — სიკვდილი, მაფია, ხმა)
- Safe accent: `#2EC4B6` (ცისფერი — ექიმი, დაცვა)
- Detective accent: `#FFD166` (ყვითელი — შერიფი, გამოძიება)
- Font display: `Playfair Display` — სათაურები, როლები
- Font body: `Inter` — UI, ტექსტი
- Font mono: `JetBrains Mono` — timer, კოდი, Room ID

**დიზაინ ელემენტები:**
- მბზინავი ბარათები (playing card aesthetic) როლების გამოვლენისას
- Scanline overlay texture მთლიან ეკრანზე (subtle)
- Particle effects სიკვდილის/გამოვლენის მომენტში
- ღამის/დღის ციკლი ანიმაციით (მთვარე → მზე)
- მოთამაშის ავატარი: მრგვალი ვიდეო feed ან generated initials avatar

---

## 📁 სრული ფაილური სტრუქტურა

```
mafia-night/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx                    # Landing — შედი / შექმენი Room
│   │   │   │   ├── room/
│   │   │   │   │   ├── [roomId]/
│   │   │   │   │   │   ├── page.tsx            # Lobby — მოლოდინი
│   │   │   │   │   │   └── game/
│   │   │   │   │   │       └── page.tsx        # თამაშის მთავარი გვერდი
│   │   │   │   └── result/
│   │   │   │       └── [roomId]/
│   │   │   │           └── page.tsx            # შედეგი + სტატისტიკა
│   │   │   └── api/
│   │   │       └── room/
│   │   │           └── create/route.ts
│   │   ├── components/
│   │   │   ├── game/
│   │   │   │   ├── PlayerCard.tsx              # მოთამაშის ბარათი + ვიდეო
│   │   │   │   ├── RoleReveal.tsx              # საიდუმლო როლის გამოვლენა (ანიმაცია)
│   │   │   │   ├── PhaseOverlay.tsx            # ღამე/დღე ოვერლეი
│   │   │   │   ├── VotingPanel.tsx             # ხმის მიცემის UI
│   │   │   │   ├── NightActions.tsx            # მაფიის/ექიმის/შერიფის actions
│   │   │   │   ├── ChatPanel.tsx               # დღის დისკუსია (text chat)
│   │   │   │   ├── MafiaChat.tsx               # მაფიის საიდუმლო chat
│   │   │   │   ├── GameTimer.tsx               # Countdown timer
│   │   │   │   ├── DeathAnimation.tsx          # მოთამაშის "სიკვდილი"
│   │   │   │   ├── FaceTracker.tsx             # MediaPipe face landmarks
│   │   │   │   └── GameLog.tsx                 # მოვლენების ლოგი
│   │   │   ├── lobby/
│   │   │   │   ├── RoomCode.tsx                # Room ID + კოპირება
│   │   │   │   ├── PlayerList.tsx              # Lobby-ს მოთამაშეები
│   │   │   │   └── HostControls.tsx            # Host-ის პარამეტრები
│   │   │   └── ui/
│   │   │       ├── NightBackground.tsx         # ანიმაციური ფონი
│   │   │       └── CardFlip.tsx                # ბარათის გადაბრუნება
│   │   ├── hooks/
│   │   │   ├── useSocket.ts                    # Socket.io კლიენტი
│   │   │   ├── useWebRTC.ts                    # WebRTC + simple-peer
│   │   │   ├── useFaceTracking.ts              # MediaPipe hook
│   │   │   └── useGameState.ts                 # Zustand game state
│   │   ├── store/
│   │   │   └── gameStore.ts                    # Zustand global state
│   │   └── lib/
│   │       ├── socket.ts                       # Socket.io client init
│   │       └── webrtc.ts                       # WebRTC utilities
│   │
│   └── server/
│       ├── src/
│       │   ├── index.ts                        # Fastify + Socket.io entry
│       │   ├── plugins/
│       │   │   ├── redis.ts                    # Redis connection
│       │   │   └── prisma.ts                   # PostgreSQL connection
│       │   ├── game/
│       │   │   ├── GameEngine.ts               # სრული game state machine
│       │   │   ├── RoleAssigner.ts             # როლების შემთხვევითი დარიგება
│       │   │   ├── PhaseManager.ts             # ღამე/დღე ფაზების მართვა
│       │   │   ├── VoteManager.ts              # ხმის დათვლა + გარიცხვა
│       │   │   └── WinCondition.ts             # გამარჯვების პირობა
│       │   ├── socket/
│       │   │   ├── roomHandlers.ts             # Room events
│       │   │   ├── gameHandlers.ts             # Game events
│       │   │   ├── videoHandlers.ts            # WebRTC signaling
│       │   │   └── chatHandlers.ts             # Chat events
│       │   └── routes/
│       │       └── room.ts                     # REST: create/join room
│       └── prisma/
│           └── schema.prisma
│
└── packages/
    └── shared/
        ├── types/
        │   ├── game.ts                         # GameState, Player, Role types
        │   ├── events.ts                       # Socket event types
        │   └── phase.ts                        # Phase types
        └── constants/
            └── roles.ts                        # ROLES config
```

---

## 🎭 Game Engine — სრული ლოგიკა

### როლები (მინ. 7 მოთამაშე)

```typescript
// packages/shared/constants/roles.ts

export const ROLES = {
  CIVILIAN: {
    id: 'civilian',
    name: { ka: 'მოქალაქე', en: 'Civilian' },
    team: 'town',
    nightAction: false,
    description: { ka: 'პოვე მაფია დისკუსიით და ხმის მიცემით' }
  },
  MAFIA: {
    id: 'mafia',
    name: { ka: 'მაფია', en: 'Mafia' },
    team: 'mafia',
    nightAction: true,
    description: { ka: 'ღამით ერთი მოქალაქე გაანადგურე' }
  },
  DETECTIVE: {
    id: 'detective',
    name: { ka: 'დეტექტივი', en: 'Detective' },
    team: 'town',
    nightAction: true,
    description: { ka: 'ღამით შეამოწმე — ერთი მოთამაშე მაფიაა თუ არა' }
  },
  DOCTOR: {
    id: 'doctor',
    name: { ka: 'ექიმი', en: 'Doctor' },
    team: 'town',
    nightAction: true,
    description: { ka: 'ღამით დაიცავი ერთი მოთამაშე მკვლელობისგან' }
  }
} as const;

// როლების განაწილება მოთამაშეების რაოდენობის მიხედვით
export function getRoleDistribution(playerCount: number) {
  if (playerCount <= 6)  return { mafia: 1, detective: 1, doctor: 0, civilian: playerCount - 2 };
  if (playerCount <= 9)  return { mafia: 2, detective: 1, doctor: 1, civilian: playerCount - 4 };
  if (playerCount <= 12) return { mafia: 3, detective: 1, doctor: 1, civilian: playerCount - 5 };
  return { mafia: Math.floor(playerCount / 4), detective: 1, doctor: 1, civilian: playerCount - Math.floor(playerCount / 4) - 2 };
}
```

### Game State Machine

```typescript
// apps/server/src/game/GameEngine.ts

export type GamePhase = 
  | 'LOBBY'           // მოლოდინი
  | 'ROLE_REVEAL'     // საიდუმლო როლის გამოვლენა (კერძოდ)
  | 'NIGHT_START'     // ღამე იწყება (ანიმაცია)
  | 'NIGHT_MAFIA'     // მაფია ირჩევს მსხვერპლს
  | 'NIGHT_DETECTIVE' // დეტექტივი ამოწმებს
  | 'NIGHT_DOCTOR'    // ექიმი იცავს
  | 'NIGHT_RESULTS'   // დილა — ვინ მოკვდა
  | 'DAY_DISCUSSION'  // დისკუსია (60 წამი)
  | 'DAY_VOTING'      // ხმის მიცემა (30 წამი)
  | 'DAY_ELIMINATION' // გარიცხვა + გამოვლენა
  | 'GAME_OVER';      // დასასრული

export interface GameState {
  roomId: string;
  phase: GamePhase;
  round: number;
  players: Player[];
  nightActions: NightActions;
  votes: Record<string, string>;       // voterId → targetId
  eliminatedPlayers: string[];
  winner: 'town' | 'mafia' | null;
  phaseEndsAt: number;                 // timestamp
  mafiaChat: ChatMessage[];
  publicChat: ChatMessage[];
  events: GameEvent[];                 // ლოგი
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  role: keyof typeof ROLES | null;     // null = სხვა ვერ ხედავს
  isAlive: boolean;
  isHost: boolean;
  hasActedTonight: boolean;
  avatar?: string;                     // initials ან emoji
}
```

### Phase Timer System

```typescript
// apps/server/src/game/PhaseManager.ts

const PHASE_DURATIONS: Record<string, number> = {
  ROLE_REVEAL:    8000,   // 8 წამი — ყველა ხედავს საკუთარ როლს
  NIGHT_START:    3000,   // 3 წამი — ანიმაცია
  NIGHT_MAFIA:    30000,  // 30 წამი
  NIGHT_DETECTIVE: 20000, // 20 წამი
  NIGHT_DOCTOR:   20000,  // 20 წამი
  NIGHT_RESULTS:  5000,   // 5 წამი — ვინ მოკვდა
  DAY_DISCUSSION: 90000,  // 90 წამი
  DAY_VOTING:     30000,  // 30 წამი
  DAY_ELIMINATION: 5000,  // 5 წამი
};
```

---

## 🔌 Socket Events — სრული სია

```typescript
// packages/shared/types/events.ts

// Client → Server
interface ClientEvents {
  'room:create': (data: { playerName: string; settings?: RoomSettings }) => void;
  'room:join':   (data: { roomId: string; playerName: string }) => void;
  'room:leave':  () => void;
  'game:start':  () => void;                           // Host only
  'night:action': (data: { targetId: string }) => void; // მაფია/ექიმი/დეტექტივი
  'vote:cast':   (data: { targetId: string }) => void;
  'chat:send':   (data: { message: string; channel: 'public' | 'mafia' }) => void;
  'webrtc:offer':   (data: { targetId: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer':  (data: { targetId: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice':     (data: { targetId: string; candidate: RTCIceCandidateInit }) => void;
}

// Server → Client
interface ServerEvents {
  'room:joined':    (data: { roomId: string; players: Player[] }) => void;
  'room:updated':   (data: { players: Player[] }) => void;
  'game:started':   () => void;
  'role:assigned':  (data: { role: Role; teammates?: string[] }) => void; // teammates მხოლოდ მაფიისთვის
  'phase:changed':  (data: { phase: GamePhase; endsAt: number }) => void;
  'night:result':   (data: { killed: string | null; saved: boolean }) => void;
  'vote:updated':   (data: { votes: Record<string, string>; counts: Record<string, number> }) => void;
  'player:eliminated': (data: { playerId: string; role: Role }) => void;
  'game:over':      (data: { winner: 'town' | 'mafia'; players: Player[] }) => void;
  'chat:message':   (data: ChatMessage) => void;
  'webrtc:offer':   (data: { fromId: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer':  (data: { fromId: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice':     (data: { fromId: string; candidate: RTCIceCandidateInit }) => void;
  'error':          (data: { message: string }) => void;
}
```

---

## 🗄️ Database Schema

```prisma
// apps/server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Room {
  id          String   @id @default(cuid())
  code        String   @unique @db.VarChar(6)   // 6-სიმბოლოიანი კოდი (ABC123)
  status      String   @default("LOBBY")         // LOBBY | ACTIVE | FINISHED
  hostId      String
  settings    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  players     GamePlayer[]
  rounds      GameRound[]
}

model GamePlayer {
  id        String  @id @default(cuid())
  roomId    String
  name      String
  role      String?
  isAlive   Boolean @default(true)
  isHost    Boolean @default(false)
  gamesWon  Int     @default(0)
  
  room      Room    @relation(fields: [roomId], references: [id])
}

model GameRound {
  id         String   @id @default(cuid())
  roomId     String
  roundNum   Int
  killed     String?
  eliminated String?
  winner     String?
  events     Json     @default("[]")
  startedAt  DateTime @default(now())
  
  room       Room     @relation(fields: [roomId], references: [id])
}
```

---

## 📹 WebRTC + Face Tracking

### WebRTC Signaling Flow

```
Player A                  Server                  Player B
   |                        |                        |
   |--webrtc:offer--------->|                        |
   |                        |--webrtc:offer--------->|
   |                        |<--webrtc:answer--------|
   |<--webrtc:answer--------|                        |
   |--webrtc:ice----------->|--webrtc:ice----------->|
   |<--webrtc:ice-----------|<--webrtc:ice-----------|
   |<======== P2P Video Stream ===================>  |
```

### Face Tracking Hook

```typescript
// apps/web/hooks/useFaceTracking.ts
// MediaPipe FaceLandmarker-ის გამოყენება
// აბრუნებს: eyebrowRaise, mouthOpen, headTilt, smiling
// გამოიყენება PlayerCard-ში emoji ემოციების საჩვენებლად

// ემოციების mapping:
// smiling → 😊
// mouthOpen → 😮  
// eyebrowRaise + mouthOpen → 😱
// headTilt → 🤔
// neutral → 😐
```

---

## 🎮 UI გვერდები — სრული დეტალი

### 1. Landing Page (`/`)

```
┌─────────────────────────────────────────────┐
│  🌙  MAFIA NIGHT          [ქარ | EN]        │
│                                             │
│     [ანიმაციური კარტები ფონზე]              │
│                                             │
│         შეიყვანე სახელი:                    │
│         ┌─────────────────────┐             │
│         │  შენი სახელი        │             │
│         └─────────────────────┘             │
│                                             │
│    [🎭 Room-ის შექმნა]  [🔗 Room-ში შესვლა] │
│                                             │
│    Room კოდი: ┌──────┐  [შესვლა]           │
└─────────────────────────────────────────────┘
```

### 2. Lobby (`/room/[roomId]`)

```
┌─────────────────────────────────────────────┐
│  Room კოდი: ABC123  [📋 კოპირება]           │
│  გაუზიარე მეგობრებს!                        │
│                                             │
│  მოთამაშეები (4/10):                        │
│  ┌──────────────────────────────────┐       │
│  │ 👑 გიორგი (host)                 │       │
│  │ ✓  ნინო                          │       │
│  │ ✓  დავით                         │       │
│  │ ✓  მარიამ                        │       │
│  │ ⏳ მოლოდინი...                   │       │
│  └──────────────────────────────────┘       │
│                                             │
│  [პარამეტრები ▾]   [🎭 თამაშის დაწყება]    │
│  (host only)                                │
└─────────────────────────────────────────────┘
```

### 3. Role Reveal (full-screen overlay)

```
┌─────────────────────────────────────────────┐
│                                             │
│         [ბარათი გადაბრუნდება]               │
│                                             │
│              ♠️ MAFIA ♠️                    │
│                                             │
│         შენ ხარ მაფიოზი!                   │
│                                             │
│    თანამოაზრეები: ნინო, დავით              │
│                                             │
│    ღამით ირჩევთ ვის გაანადგურებთ           │
│                                             │
│         [✓ გავიგე]                          │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Main Game Screen

```
┌─────────────────────────────────────────────┐
│  🌙 ღამე  Round 2          ⏱️ 0:24         │
│─────────────────────────────────────────────│
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 😐   │ │ 🤔   │ │ 💀   │ │ 😊   │      │  ← face emoji
│  │გიო   │ │ნინო  │ │დავ.✝ │ │მარი  │      │
│  │[CAM] │ │[CAM] │ │      │ │[CAM] │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  ┌─── MAFIA CHAT (მხოლოდ მაფიისთვის) ──┐  │
│  │ ნინო: გიო ამოვიღოთ?                  │  │
│  │ შენ:  კი, ხვალ დეტექტივი ჩანს        │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  სამიზნე: [გიო ▾]    [✓ მოქმედება]        │
└─────────────────────────────────────────────┘
```

### 5. Day Phase — Voting

```
┌─────────────────────────────────────────────┐
│  ☀️ დღე  Round 2          ⏱️ 0:45          │
│─────────────────────────────────────────────│
│  [ვიდეო გრიდი + face emojis]               │
│                                             │
│  📊 ხმის მიცემა:                            │
│  გიო    ████████░░░░  3 ხმა  ← შენი ✓     │
│  ნინო   ████░░░░░░░░  1 ხმა               │
│  მარი   ██░░░░░░░░░░  1 ხმა               │
│                                             │
│  [💬 ჩატი]                                  │
│  გიო: მე არ ვარ მაფია, ფიცი!              │
│  ნინო: გუშინ ეჭვიანი ჩანდა...             │
└─────────────────────────────────────────────┘
```

### 6. Elimination Reveal

```
┌─────────────────────────────────────────────┐
│                                             │
│    [დრამატული გამოვლენის ანიმაცია]          │
│                                             │
│         გიო აღმოჩნდა...                    │
│                                             │
│              🕵️ DETECTIVE                  │
│                                             │
│    მოქალაქეებმა შეცდომა დაუშვეს!           │
│    მაფია: 2  |  მოქალაქეები: 2             │
│                                             │
│         [გაგრძელება]                        │
└─────────────────────────────────────────────┘
```

---

## ⚙️ Room პარამეტრები (Host Controls)

```typescript
interface RoomSettings {
  maxPlayers: number;          // 7-20, default: 10
  roles: {
    detective: boolean;        // default: true
    doctor: boolean;           // default: true
  };
  timers: {
    discussion: number;        // seconds, default: 90
    voting: number;            // seconds, default: 30
    nightAction: number;       // seconds, default: 30
  };
  videoEnabled: boolean;       // WebRTC, default: true
  faceTracking: boolean;       // MediaPipe, default: true
  language: 'ka' | 'en';      // default: 'ka'
}
```

---

## 🔐 უსაფრთხოება

```typescript
// Socket.io middleware
// 1. Rate limiting — 1 room per IP per minute
// 2. Room კოდი: 6 სიმბოლო, uppercase alphanumeric, exclude confusables (0/O, 1/I)
// 3. Player name: max 20 სიმბოლო, sanitize
// 4. Night actions: validate that player is alive + has correct role + hasn't acted yet
// 5. Votes: validate alive player voting on alive player
// 6. Redis TTL: 4 საათი — auto-cleanup
// 7. WebRTC: signaling only through server, actual video P2P
```

---

## 🚀 Environment Variables

```env
# apps/server/.env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
PORT=3001
CLIENT_URL="https://mafia-night.ge"
NODE_ENV="production"

# apps/web/.env.local
NEXT_PUBLIC_SERVER_URL="https://api.mafia-night.ge"
NEXT_PUBLIC_APP_URL="https://mafia-night.ge"
```

---

## 📋 Build Order (ეტაპობრივი)

### Phase 1 — Core Infrastructure
1. Monorepo setup (Turborepo)
2. Shared types package
3. Fastify server + Socket.io
4. Redis game state
5. PostgreSQL + Prisma

### Phase 2 — Room System
6. Room create/join/leave
7. Lobby UI
8. Player list sync
9. Host controls

### Phase 3 — Game Engine
10. Role assignment (server-side, secret)
11. Phase state machine + timers
12. Night actions (mafia kill, detective check, doctor save)
13. Day discussion + voting
14. Win condition check
15. Game history save

### Phase 4 — Video + Face Tracking
16. WebRTC signaling server
17. simple-peer client integration
18. MediaPipe WASM setup
19. Face landmark → emoji mapping
20. PlayerCard video overlay

### Phase 5 — Polish
21. Animations (Framer Motion)
22. Sound effects
23. Mobile responsive
24. i18n (ქართული/ინგლისური)
25. Error handling + reconnection

---

## 🎯 დამატებითი შენიშვნები Claude Code-სთვის

- **Server-side role secrecy:** არასდროს გაგზავნო სხვა მოთამაშის როლი კლიენტზე. `role:assigned` event გაიგზავნება **კერძოდ** (`socket.emit`, არა `io.to(room).emit`)
- **Game state in Redis:** მთლიანი `GameState` object Redis-ში JSON-ად ინახება `game:{roomId}` key-ით, TTL: 4h
- **Reconnection:** Socket disconnect-ზე player-ი 30 წამი ელოდება reconnect-ს. თუ არ დაბრუნდა — მიჩნეული "disconnected" მაგრამ role რჩება. Host disconnect-ზე — სხვა მოთამაშეზე host-ის გადაცემა
- **Mafia chat:** `socket.to(mafiaRoom).emit()` — ცალკე socket room მაფიოზებისთვის
- **Face tracking:** MediaPipe WASM lazy-load მხოლოდ მაშინ, როცა user კამერას ჩართავს. Fallback: initials avatar
- **WebRTC:** Full mesh topology (ყველა ყველასთან). 10+ მოთამაშეზე SFU გამოიყენე (mediasoup)
