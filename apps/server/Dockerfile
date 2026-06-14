FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install --workspace=@mafia-night/server --workspace=@mafia-night/shared

COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

RUN cd apps/server && npx prisma generate

WORKDIR /app/apps/server
CMD ["npx", "tsx", "src/index.ts"]
