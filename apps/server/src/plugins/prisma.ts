let prismaClient: any = null;

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (prismaClient) return prismaClient;
  try {
    const { PrismaClient } = await import('@prisma/client');
    prismaClient = new PrismaClient();
    return prismaClient;
  } catch {
    return null;
  }
}

// Proxy that silently no-ops when DB is unavailable
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    return new Proxy({} as any, {
      get(_t, method) {
        return async (...args: any[]) => {
          const client = await getPrisma();
          if (!client) return null;
          try {
            return await client[prop][method](...args);
          } catch {
            return null;
          }
        };
      }
    });
  }
});
